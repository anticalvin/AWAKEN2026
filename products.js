/*
 * Single source of truth for the catalogue. Every page reads window.AWAKEN_PRODUCTS.
 * Prices here are a fallback (last checked against Shopify 2026-11-01): cart.js
 * refreshes them from the Storefront API by variant ID, so the site, cart and
 * checkout cannot drift apart.
 * Do not change shopifyVariantId values without checking Shopify admin.
 * Owner: add fabric / fit / print method to each `details` line once confirmed.
 */
window.AWAKEN_PRODUCTS = [
  {
    "id": "p6",
    "name": "MCGA Cap",
    "price": 333,
    "image": "assets/products/MCGA-CAP.webp",
    "images": [
      "assets/products/MCGA-CAP.webp"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "One Size",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554201346151"
      }
    ],
    "maxPerCart": 1,
    "lore": "Make Cults Great Again. Worn at every gathering since the early days.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p2",
    "name": "Fake News Hoodie",
    "price": 999,
    "image": "assets/products/fake-news-hoodie.webp",
    "images": [
      "assets/products/fake-news-hoodie.webp"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "Small",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554317279335"
      },
      {
        "option": "Medium",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554317312103"
      },
      {
        "option": "Large",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554317344871"
      },
      {
        "option": "XL",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554317377639"
      },
      {
        "option": "XXL",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554317410407"
      }
    ],
    "lore": "\"They feed you lies. We wear the truth.\" First seen during the Information Purge of 2023.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p1",
    "name": "XTCY Tee",
    "price": 444,
    "image": "assets/products/XTCYYYY.webp",
    "images": [
      "assets/products/XTCYYYY.webp"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "Small",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554323144807"
      },
      {
        "option": "Medium",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554323177575"
      },
      {
        "option": "Large",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554323210343"
      },
      {
        "option": "XL",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554323243111"
      },
      {
        "option": "XXL",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554323275879"
      }
    ],
    "lore": "Worn by the first initiates. Side effects include clarity.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p4",
    "name": "Vision Jacket",
    "price": 1111,
    "image": "assets/products/vzn-jacket.webp",
    "images": [
      "assets/products/vzn-jacket.webp"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "Small",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554326356071"
      },
      {
        "option": "Medium",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554326388839"
      },
      {
        "option": "Large",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554326421607"
      }
    ],
    "lore": "Appeared to the founder in a vision. He sewed it anyway.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p5",
    "name": "Obey Sweater",
    "price": 777,
    "image": "assets/products/oberyyy.webp",
    "images": [
      "assets/products/oberyyy.webp"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "Small",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554328256615"
      },
      {
        "option": "Medium",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554328289383"
      },
      {
        "option": "Large",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554328322151"
      }
    ],
    "lore": "Obey. Then ask who wrote the rules.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p3",
    "name": "Third Eye Balaclava",
    "price": 350,
    "image": "assets/products/BURN-BALACLAVAAA.webp",
    "images": [
      "assets/products/BURN-BALACLAVAAA.webp"
    ],
    "optionName": "Colour",
    "variants": [
      {
        "option": "Black",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554330255463"
      },
      {
        "option": "Cream",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554330288231"
      },
      {
        "option": "Green",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554330320999"
      }
    ],
    "lore": "For when the truth must be spoken and the face must not.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p7",
    "name": "Exclusive Baby Tee",
    "price": 444,
    "image": "assets/products/baby-tee-2.png",
    "images": [
      "assets/products/baby-tee-2.png"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "Small",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554597675111"
      },
      {
        "option": "Medium",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554597707879"
      },
      {
        "option": "Large",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554597740647"
      }
    ],
    "lore": "Reserved for the inner circle. The criteria remain undisclosed.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p8",
    "name": "Shook Tee",
    "price": 555,
    "image": "assets/img/shook-final.webp",
    "images": [
      "assets/img/shook-final.webp"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "S",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554599805031"
      },
      {
        "option": "M",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554599837799"
      },
      {
        "option": "L",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554599870567"
      }
    ],
    "lore": "For the moment the truth lands. Hard.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p9",
    "name": "NWO Tank",
    "price": 444,
    "image": "assets/products/tank.webp",
    "images": [
      "assets/products/tank.webp"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "S",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554600001639"
      },
      {
        "option": "M",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554600034407"
      },
      {
        "option": "L",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554600067175"
      }
    ],
    "lore": "The New World Order, sleeveless.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p10",
    "name": "Combat Pants",
    "price": 1111,
    "image": "assets/products/pants.png",
    "images": [
      "assets/products/pants.png",
      "assets/products/pants-side.png"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "28",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554604916839"
      },
      {
        "option": "30",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554604982375"
      },
      {
        "option": "32",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554605047911"
      },
      {
        "option": "34",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554605113447"
      },
      {
        "option": "36",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554605178983"
      },
      {
        "option": "38",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554605244519"
      },
      {
        "option": "40",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554605310055"
      }
    ],
    "lore": "Standard issue for those who go looking.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p11",
    "name": "Utility Rain Poncho",
    "price": 1111,
    "image": "assets/img/poncho-2.webp",
    "images": [
      "assets/img/poncho-2.webp"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "One Size",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554605703271"
      }
    ],
    "lore": "The storm was forecast. By us.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  },
  {
    "id": "p12",
    "name": "Ameen Hoodie",
    "price": 777,
    "image": "assets/img/ameen-final.png",
    "images": [
      "assets/img/ameen-final.png"
    ],
    "optionName": "Size",
    "variants": [
      {
        "option": "Small",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554606096487"
      },
      {
        "option": "Medium",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554606129255"
      },
      {
        "option": "Large",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554606162023"
      },
      {
        "option": "XL",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554606194791"
      },
      {
        "option": "XXL",
        "shopifyVariantId": "gid://shopify/ProductVariant/41554606227559"
      }
    ],
    "lore": "Named for the elder who walked the first initiates through. Comfortable by design.",
    "details": { "fabric": null, "fit": null, "print": null, "madeIn": null }
  }
];
