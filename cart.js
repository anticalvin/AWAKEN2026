/*
 * Shared storefront logic: catalogue lookups, ZAR formatting, local cart, cart drawer,
 * size picker modal and Shopify checkout. Loaded by every page that sells or shows a cart.
 * Needs products.js first. Pages call: handleAddToCart(productId), toggleCart(),
 * proceedToShopifyCheckout(), hideSizeSelectionModal().
 */

// --- Shopify configuration ---
// A Storefront token is public by design (it ships to every browser). Keep its scopes
// to product listing read + checkout write only.
const SHOPIFY_STORE_DOMAIN = 'awakencult.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'af1c53acddd4c3e2499460673394c830';
const SHOPIFY_GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-07/graphql.json`;
const CART_STORAGE_KEY = 'awakenCart';
const VARIANT_ID_PATTERN = /^gid:\/\/shopify\/ProductVariant\/\d+$/;

const PRODUCTS = window.AWAKEN_PRODUCTS || [];
// drop.js decides what can be bought and until when. Without it, every product is buyable.
const DROP = window.AWAKEN_DROP || null;
const dropCanBuy = id => (DROP ? DROP.canBuy(id) : true);

// Analytics is optional (analytics.js); events are silently skipped without it.
function trackEvent(name, data) {
  if (window.awakenTrack) window.awakenTrack(name, data);
}

// --- Formatting ---
function formatZAR(amount) {
  const n = Number(amount) || 0;
  const fixed = Number.isInteger(n) ? String(n) : n.toFixed(2);
  const [whole, decimals] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return 'R' + grouped + (decimals ? '.' + decimals : '');
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// --- Catalogue lookups ---
function getProduct(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

function findVariant(variantId) {
  for (const product of PRODUCTS) {
    const variant = product.variants.find(v => v.shopifyVariantId === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

function variantPrice(product, variant) {
  return typeof variant.price === 'number' ? variant.price : product.price;
}

// Lowest variant price, used on cards where no variant is chosen yet.
function productFromPrice(product) {
  return Math.min(...product.variants.map(v => variantPrice(product, v)));
}

function isOneOption(product) {
  return product.variants.length === 1;
}

// --- Cart state ---
// Only the variant ID and quantity are stored. Name, price and image are always read
// from the catalogue, so a stale localStorage cart can never show an old price.
let cart = loadCart();
let processingCheckout = false;
let currentProductForModal = null;
let selectedVariantInModal = null;

function loadCart() {
  let raw = [];
  try {
    raw = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (e) {
    raw = [];
  }
  if (!Array.isArray(raw)) raw = [];
  const merged = new Map();
  let dropped = 0;
  raw.forEach(item => {
    const id = item && item.shopifyVariantId;
    const qty = parseInt(item && item.quantity, 10);
    const found = VARIANT_ID_PATTERN.test(id || '') && findVariant(id);
    if (!found || !(qty > 0) || (DROP && !DROP.includes(found.product.id))) {
      dropped++;
      return;
    }
    merged.set(id, (merged.get(id) || 0) + qty);
  });
  if (dropped) window.__cartItemsDropped = dropped;
  return Array.from(merged, ([shopifyVariantId, quantity]) => ({ shopifyVariantId, quantity }));
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) { /* storage blocked: the cart still works for this page view */ }
}

function cartLines() {
  return cart.map(item => {
    const { product, variant } = findVariant(item.shopifyVariantId);
    return { product, variant, quantity: item.quantity, price: variantPrice(product, variant) };
  });
}

function cartTotal() {
  return cartLines().reduce((sum, l) => sum + l.price * l.quantity, 0);
}

// --- UI helpers ---
function showCustomAlert(message, duration = 3000) {
  const alertBox = document.createElement('div');
  alertBox.setAttribute('role', 'status');
  alertBox.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background-color: black; color: white; padding: 20px 30px; border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 10000; max-width: 90vw;
    font-family: 'Roboto Condensed', sans-serif; font-size: 1.1rem; text-align: center;
    opacity: 0; transition: opacity 0.3s ease-in-out;
  `;
  alertBox.textContent = message;
  document.body.appendChild(alertBox);
  setTimeout(() => { alertBox.style.opacity = 1; }, 10);
  setTimeout(() => {
    alertBox.style.opacity = 0;
    setTimeout(() => alertBox.remove(), 400);
  }, duration);
}

function setCartError(message) {
  let el = document.getElementById('cart-error');
  if (!el) {
    el = document.createElement('p');
    el.id = 'cart-error';
    el.setAttribute('role', 'alert');
    el.style.cssText = "color:#d94a44;font-family:'Roboto Condensed',sans-serif;font-weight:700;margin:0.5rem 0;display:none;";
    const btn = document.querySelector('.cart-checkout-btn');
    if (btn) btn.parentNode.insertBefore(el, btn);
    else return;
  }
  el.textContent = message || '';
  el.style.display = message ? 'block' : 'none';
}

// --- Cart operations ---
function addItemToCart(product, variantId, quantity = 1) {
  const found = findVariant(variantId);
  if (!found) {
    showCustomAlert('Error: that option is not available.');
    return;
  }
  if (!dropCanBuy(product.id)) {
    showCustomAlert(DROP && DROP.includes(product.id) ? `${DROP.name} pre-orders are closed.` : `Not part of ${DROP.name}.`);
    return;
  }
  if (found.variant.available === false) {
    showCustomAlert('Sorry, that option is sold out.');
    return;
  }
  const existing = cart.find(i => i.shopifyVariantId === variantId);
  if (product.maxPerCart) {
    const inCart = cart
      .filter(i => product.variants.some(v => v.shopifyVariantId === i.shopifyVariantId))
      .reduce((n, i) => n + i.quantity, 0);
    if (inCart + quantity > product.maxPerCart) {
      showCustomAlert(`You can only add ${product.maxPerCart} ${product.name} to the cart.`);
      return;
    }
  }
  if (existing) existing.quantity += quantity;
  else cart.push({ shopifyVariantId: variantId, quantity });
  updateCartDisplay();
  trackEvent('add_to_cart', {
    item_id: product.id, item_name: product.name, variant: found.variant.option,
    value: variantPrice(product, found.variant), currency: 'ZAR', quantity
  });
  const label = isOneOption(product) ? product.name : `${product.name} (${found.variant.option})`;
  showCustomAlert(`${label} added to cart!`);
}

function removeFromCart(variantId) {
  cart = cart.filter(i => i.shopifyVariantId !== variantId);
  updateCartDisplay();
}

function updateCartDisplay() {
  const itemsDiv = document.getElementById('cart-items');
  const countSpan = document.getElementById('cart-count');
  const totalSpan = document.getElementById('cart-total');
  const emptyMessage = document.getElementById('empty-cart-message');

  if (itemsDiv && totalSpan) {
    const lines = cartLines();
    itemsDiv.innerHTML = '';
    if (lines.length === 0) {
      if (emptyMessage) {
        itemsDiv.appendChild(emptyMessage);
        emptyMessage.style.display = 'block';
      }
    } else {
      lines.forEach(({ product, variant, quantity, price }) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        const option = isOneOption(product) ? '' : ` (${esc(variant.option)})`;
        row.innerHTML = `
          <img src="${esc(product.image)}" alt="${esc(product.name)}" class="cart-item-image rounded" />
          <div class="cart-item-details">
            <h4>${esc(product.name)}${option}</h4>
            <p>${formatZAR(price)} x ${quantity}</p>
          </div>
          <button class="cart-item-remove" data-remove-variant="${esc(variant.shopifyVariantId)}">Remove</button>
        `;
        itemsDiv.appendChild(row);
      });
    }
    totalSpan.textContent = formatZAR(cartTotal());
  }
  const count = cart.reduce((n, i) => n + i.quantity, 0);
  if (countSpan) countSpan.textContent = count;
  document.querySelectorAll('[data-cart-count]').forEach(s => { s.textContent = count; });
  renderPreorderNote();
  saveCart();
}

// "Ships by" line above the total, so the customer sees the pre-order terms before paying.
function renderPreorderNote() {
  if (!DROP) return;
  const button = document.querySelector('.cart-checkout-btn');
  if (!button) return;
  let note = document.getElementById('cart-preorder-note');
  if (!note) {
    note = document.createElement('p');
    note.id = 'cart-preorder-note';
    note.className = 'cart-preorder-note';
    button.parentNode.insertBefore(note, button);
  }
  note.style.display = cart.length ? 'block' : 'none';
  note.textContent = DROP.isClosed()
    ? `${DROP.name} pre-orders are closed.`
    : `Pre-order items ship by ${DROP.shipsByText()}. Charged today.`;
}

// --- Product cards (shared by the homepage and the shop) ---
function productCardHTML(product, cardClass, headingLinked) {
  const href = `product-detail.html?id=${esc(product.id)}`;
  const inDrop = !DROP || DROP.includes(product.id);
  const closed = DROP && DROP.isClosed();
  const badge = inDrop && DROP
    ? `<span class="preorder-badge${closed ? ' is-closed' : ''}">${closed ? 'Closed' : 'Pre-order'}</span>`
    : '';
  const title = esc(product.name);
  const price = `${isOneOption(product) ? '' : 'From '}${formatZAR(productFromPrice(product))}`;
  let action;
  if (!inDrop) action = '<span class="archive-tag">Coming soon</span>';
  else if (closed) action = '<button type="button" class="add-to-cart-btn" disabled>Closed</button>';
  else action = `<button type="button" class="add-to-cart-btn" data-add-product="${esc(product.id)}">${DROP ? 'Pre-order' : 'Add to Cart'}</button>`;
  const shipsLine = inDrop && DROP && !closed ? `<p class="ships-by">Ships by ${esc(DROP.shipsByText())}</p>` : '';
  return `
    <div class="${cardClass}">
      <a href="${href}" class="product-image-container block">
        <img src="${esc(product.image)}" alt="${title}" loading="lazy" />${badge}
      </a>
      <h3 class="text-xl font-bold mt-3">${headingLinked ? `<a href="${href}">${title}</a>` : title}</h3>
      <p class="text-sm mb-1">${price}</p>
      ${shipsLine}
      ${action}
    </div>`;
}

function toggleCart() {
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) {
    // Pages without a cart drawer (manifesto, join-us) send the customer to the shop.
    window.location.href = 'shop.html';
    return;
  }
  overlay.classList.toggle('active');
  if (overlay.classList.contains('active')) updateCartDisplay();
}

// --- Variant picker modal (pages without the modal markup add directly) ---
function handleAddToCart(productId) {
  const product = getProduct(productId);
  if (!product) {
    showCustomAlert('Error: product not found.');
    return;
  }
  if (isOneOption(product) || !document.getElementById('size-selection-modal')) {
    if (isOneOption(product)) addItemToCart(product, product.variants[0].shopifyVariantId);
    else window.location.href = `product-detail.html?id=${encodeURIComponent(product.id)}`;
    return;
  }
  showSizeSelectionModal(product);
}

function showSizeSelectionModal(product) {
  const modal = document.getElementById('size-selection-modal');
  const optionsDiv = document.getElementById('size-options');
  currentProductForModal = product;
  selectedVariantInModal = null;

  document.getElementById('modal-product-name').textContent = product.name;
  document.getElementById('modal-product-image').src = product.image;
  document.getElementById('modal-product-image').alt = product.name;
  document.getElementById('modal-product-price').textContent = formatZAR(productFromPrice(product));

  optionsDiv.innerHTML = '';
  product.variants.forEach(variant => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'size-option-btn';
    button.textContent = variant.option;
    if (variant.available === false) {
      button.disabled = true;
      button.title = 'Sold out';
    }
    button.addEventListener('click', () => {
      optionsDiv.querySelectorAll('.size-option-btn').forEach(b => b.classList.remove('selected'));
      button.classList.add('selected');
      selectedVariantInModal = variant;
      document.getElementById('modal-product-price').textContent = formatZAR(variantPrice(product, variant));
    });
    optionsDiv.appendChild(button);
  });

  const modalButton = document.getElementById('add-to-cart-modal-btn');
  modalButton.textContent = DROP ? 'Pre-order' : 'Add to Cart';
  modalButton.onclick = () => {
    if (!selectedVariantInModal) {
      showCustomAlert(`Please select a ${product.optionName.toLowerCase()}.`);
      return;
    }
    addItemToCart(currentProductForModal, selectedVariantInModal.shopifyVariantId);
    hideSizeSelectionModal();
  };

  modal.classList.remove('hidden');
  modal.classList.add('active');
}

function hideSizeSelectionModal() {
  const modal = document.getElementById('size-selection-modal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.classList.add('hidden');
  currentProductForModal = null;
  selectedVariantInModal = null;
}

// --- Shopify: live prices ---
// Replaces the fallback prices in products.js with what Shopify will actually charge.
// Skipped unless Shopify answers in ZAR, so a wrong-currency market can never leak in.
async function syncCatalogueFromShopify() {
  const ids = PRODUCTS.flatMap(p => p.variants.map(v => v.shopifyVariantId));
  const query = `query($ids: [ID!]!) @inContext(country: ZA) {
    nodes(ids: $ids) {
      ... on ProductVariant { id availableForSale price { amount currencyCode } }
    }
  }`;
  try {
    const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({ query, variables: { ids } })
    });
    if (!response.ok) return;
    const body = await response.json();
    const nodes = body && body.data && body.data.nodes;
    if (!nodes) return;
    let changed = false;
    nodes.forEach(node => {
      if (!node || !node.price) return;
      if (node.price.currencyCode !== 'ZAR') return;
      const found = findVariant(node.id);
      if (!found) return;
      const amount = parseFloat(node.price.amount);
      if (!isNaN(amount)) {
        found.variant.price = amount;
        changed = true;
      }
      found.variant.available = node.availableForSale !== false;
    });
    if (changed) {
      PRODUCTS.forEach(p => { p.price = productFromPrice(p); });
      document.dispatchEvent(new CustomEvent('awaken:catalogue'));
    }
  } catch (e) { /* offline or blocked: the fallback prices in products.js stay in place */ }
}

// --- Shopify: checkout ---
async function proceedToShopifyCheckout() {
  if (processingCheckout) return;
  setCartError('');

  if (cart.length === 0) {
    showCustomAlert('Your cart is empty. Please add some artifacts before checking out.');
    return;
  }
  if (DROP && DROP.isClosed()) {
    setCartError(`${DROP.name} pre-orders are closed. Join the list to hear about the next drop.`);
    return;
  }
  const invalid = cart.filter(i => !VARIANT_ID_PATTERN.test(i.shopifyVariantId || '') || !findVariant(i.shopifyVariantId));
  if (invalid.length) {
    cart = cart.filter(i => !invalid.includes(i));
    updateCartDisplay();
    setCartError('Some items in your cart are no longer available and were removed. Please review your cart.');
    return;
  }

  const checkoutButton = document.querySelector('.cart-checkout-btn');
  processingCheckout = true;
  if (checkoutButton) checkoutButton.disabled = true;

  // Always build a brand-new Shopify cart from the local cart, so a second attempt can
  // never stack lines on top of an old Shopify cart.
  const input = {
    lines: cart.map(item => ({ merchandiseId: item.shopifyVariantId, quantity: item.quantity }))
  };
  if (DROP) {
    // Travels with the order so fulfilment can see which drop it belongs to and what was promised.
    input.note = `${DROP.name} pre-order. Ships by ${DROP.shipsByText()}. Charged at checkout.`;
    input.attributes = [{ key: 'Drop', value: DROP.name }, { key: 'Ships by', value: DROP.shipsByText() }];
  }
  const query = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }`;

  try {
    const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({ query, variables: { input } })
    });
    if (!response.ok) throw new Error(`Shopify responded with HTTP ${response.status}`);
    const data = await response.json();

    if (data.errors && data.errors.length) {
      setCartError('Checkout error: ' + data.errors.map(e => e.message).join(', '));
      return;
    }
    const result = data.data && data.data.cartCreate;
    if (result && result.userErrors && result.userErrors.length) {
      setCartError('Checkout error: ' + result.userErrors.map(e => e.message).join(', '));
      return;
    }
    const checkoutUrl = result && result.cart && result.cart.checkoutUrl;
    if (!checkoutUrl) {
      setCartError('Checkout could not be started. Please try again, or email info@awakencult.com.');
      return;
    }

    let finalUrl = checkoutUrl;
    const ref = localStorage.getItem('awakenRef');
    if (ref) {
      const url = new URL(finalUrl);
      url.searchParams.set('ref', ref);
      finalUrl = url.toString();
    }
    trackEvent('begin_checkout', { value: cartTotal(), currency: 'ZAR', quantity: cart.reduce((n, i) => n + i.quantity, 0) });
    window.location.href = finalUrl;
  } catch (error) {
    setCartError('We could not reach checkout. Check your connection and try again.');
  } finally {
    processingCheckout = false;
    if (checkoutButton) checkoutButton.disabled = false;
  }
}

// --- Wiring ---
document.addEventListener('DOMContentLoaded', () => {
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref) {
    try { localStorage.setItem('awakenRef', ref); } catch (e) { /* ignore */ }
  }

  document.addEventListener('click', event => {
    const addButton = event.target.closest('[data-add-product]');
    if (addButton) {
      event.preventDefault();
      handleAddToCart(addButton.dataset.addProduct);
      return;
    }
    const removeButton = event.target.closest('[data-remove-variant]');
    if (removeButton) removeFromCart(removeButton.dataset.removeVariant);
  });

  updateCartDisplay();
  if (window.__cartItemsDropped) {
    showCustomAlert('Some items in your cart are no longer available and were removed.', 4500);
  }
  syncCatalogueFromShopify();
  document.addEventListener('awaken:catalogue', updateCartDisplay);
  document.addEventListener('awaken:dropchange', updateCartDisplay);
});

// Coming back from Shopify with the browser back button restores this page from cache.
window.addEventListener('pageshow', event => {
  if (event.persisted) {
    processingCheckout = false;
    const btn = document.querySelector('.cart-checkout-btn');
    if (btn) btn.disabled = false;
  }
});
