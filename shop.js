/* =========================================================
   THE FRIENDS HERITAGE
   SHOP.JS

   IMPORTANT:
   This JavaScript controls ONLY the existing Shop HTML.

   It does NOT create product cards.

   Features:
   - Product variants
   - Current price
   - Original price
   - Quantity controls
   - Add to cart
   - Cart count
   - Category filtering
   - Sorting
   - Quick View
========================================================= */


document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const productGrid =
        document.getElementById("shopProducts");

    const productCount =
        document.getElementById("productCount");

    const sortProducts =
        document.getElementById("sortProducts");

    const noProducts =
        document.getElementById("noProducts");

    const categoryButtons =
        document.querySelectorAll(".category-btn");

    const productCards =
        Array.from(
            document.querySelectorAll(".shop-product-card")
        );


    /* =====================================================
       CART
    ===================================================== */

    const CART_KEY =
        "friendsHeritageCart";


    function getCart() {

        try {

            const savedCart =
                localStorage.getItem(CART_KEY);


            if (!savedCart) {
                return [];
            }


            const cart =
                JSON.parse(savedCart);


            return Array.isArray(cart)
                ? cart
                : [];


        } catch (error) {

            console.error(
                "Unable to read cart:",
                error
            );

            return [];

        }

    }


    function saveCart(cart) {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

    }


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(price) {

        return (
            "₹" +
            Number(price).toLocaleString("en-IN")
        );

    }


    /* =====================================================
       PRODUCT PRICE DATA
       
       Same pricing system as product.js
    ===================================================== */

    const productPrices = {

        "Kashmiri Saffron": {

            "1g": {
                price: 299,
                oldPrice: 399
            },

            "2g": {
                price: 549,
                oldPrice: 699
            },

            "5g": {
                price: 1299,
                oldPrice: 1599
            }

        },


        "Premium Almonds": {

            "500g": {
                price: 599,
                oldPrice: 699
            },

            "1kg": {
                price: 1099,
                oldPrice: 1299
            }

        },


        "Premium Walnuts": {

            "500g": {
                price: 699,
                oldPrice: 849
            },

            "1kg": {
                price: 1299,
                oldPrice: 1599
            }

        },


        "Pure Shilajit": {

            "50g": {
                price: 1299,
                oldPrice: 1599
            },

            "100g": {
                price: 2299,
                oldPrice: 2799
            },

            "250g": {
                price: 4999,
                oldPrice: 5999
            }

        },


        "Kashmiri Kahwa": {

            "250g": {
                price: 399,
                oldPrice: 499
            },

            "500g": {
                price: 699,
                oldPrice: 899
            }

        },


        "Premium Cashews": {

            "500g": {
                price: 799,
                oldPrice: 949
            },

            "1kg": {
                price: 1499,
                oldPrice: 1799
            }

        },


        "Premium Raisins": {

            "500g": {
                price: 499,
                oldPrice: 599
            },

            "1kg": {
                price: 899,
                oldPrice: 1099
            }

        },


        "Kashmiri Honey": {

            "500g": {
                price: 549,
                oldPrice: 649
            },

            "1kg": {
                price: 999,
                oldPrice: 1199
            }

        }

    };


    /* =====================================================
       GET PRODUCT NAME
    ===================================================== */

    function getProductName(card) {

        const nameElement =
            card.querySelector(
                ".product-info h3"
            );


        if (!nameElement) {
            return "";
        }


        return nameElement.textContent.trim();

    }


    /* =====================================================
       GET SELECTED VARIANT
    ===================================================== */

    function getSelectedVariant(card) {

        const variant =
            card.querySelector(
                ".product-variant"
            );


        if (!variant) {
            return null;
        }


        const selectedOption =
            variant.options[
                variant.selectedIndex
            ];


        if (!selectedOption) {
            return null;
        }


        const weight =
            selectedOption.dataset.weight || "";


        const productName =
            getProductName(card);


        const productData =
            productPrices[productName];


        if (
            !productData ||
            !productData[weight]
        ) {

            return {

                weight: weight,

                price:
                    Number(
                        variant.value
                    ) || 0,

                oldPrice: 0

            };

        }


        return {

            weight: weight,

            price:
                productData[weight].price,

            oldPrice:
                productData[weight].oldPrice

        };

    }


    /* =====================================================
       CREATE PRICE HTML
    ===================================================== */

    function createPriceHTML(price, oldPrice) {

        let html =
            '<span class="current-price">' +
            formatPrice(price) +
            "</span>";


        if (
            oldPrice &&
            Number(oldPrice) > Number(price)
        ) {

            html +=
                '<span class="old-price">' +
                formatPrice(oldPrice) +
                "</span>";

        }


        return html;

    }


    /* =====================================================
       UPDATE PRODUCT PRICE DISPLAY
    ===================================================== */

    function updateProductPrice(card) {

        const priceElement =
            card.querySelector(
                ".product-price"
            );


        if (!priceElement) {
            return;
        }


        const selectedVariant =
            getSelectedVariant(card);


        if (!selectedVariant) {
            return;
        }


        priceElement.innerHTML =
            createPriceHTML(
                selectedVariant.price,
                selectedVariant.oldPrice
            );


        /* ================================================
           UPDATE CARD DATA PRICE
        ================================================ */

        card.dataset.price =
            selectedVariant.price;


        /* ================================================
           UPDATE ADD TO CART BUTTON
        ================================================ */

        const addButton =
            card.querySelector(
                ".add-cart-btn"
            );


        if (addButton) {

            addButton.dataset.price =
                selectedVariant.price;

            addButton.dataset.oldPrice =
                selectedVariant.oldPrice;

            addButton.dataset.variant =
                selectedVariant.weight;

        }

    }


    /* =====================================================
       INITIALIZE PRODUCT PRICES
    ===================================================== */

    productCards.forEach(function (card) {

        updateProductPrice(card);

    });


    /* =====================================================
       UPDATE NAVBAR CART COUNT
    ===================================================== */

    function updateCartCount() {

        const cartCount =
            document.getElementById(
                "cartCount"
            );


        if (!cartCount) {
            return;
        }


        const cart =
            getCart();


        let totalItems = 0;


        cart.forEach(function (item) {

            totalItems +=
                Number(
                    item.quantity
                ) || 0;

        });


        cartCount.textContent =
            totalItems;

    }


    /* =====================================================
       ADD PRODUCT TO CART
    ===================================================== */

    function addToCart(card) {

        const addButton =
            card.querySelector(
                ".add-cart-btn"
            );


        const variant =
            card.querySelector(
                ".product-variant"
            );


        const quantityElement =
            card.querySelector(
                ".quantity"
            );


        if (!addButton) {
            return;
        }


        /* ================================================
           PRODUCT NAME
        ================================================ */

        const productName =
            getProductName(card);


        /* ================================================
           IMAGE
        ================================================ */

        const image =
            addButton.dataset.image ||
            "";


        /* ================================================
           SELECTED VARIANT
        ================================================ */

        const selectedVariant =
            getSelectedVariant(card);


        if (!selectedVariant) {

            console.error(
                "Product variant information is missing."
            );

            return;

        }


        const price =
            Number(
                selectedVariant.price
            );


        const oldPrice =
            Number(
                selectedVariant.oldPrice
            );


        const selectedWeight =
            selectedVariant.weight;


        /* ================================================
           QUANTITY
        ================================================ */

        const quantity =
            Number(
                quantityElement
                    ? quantityElement.textContent
                    : 1
            ) || 1;


        /* ================================================
           VALIDATION
        ================================================ */

        if (
            !productName ||
            !price
        ) {

            console.error(
                "Product information is missing."
            );

            return;

        }


        /* ================================================
           CART
        ================================================ */

        const cart =
            getCart();


        /* ================================================
           UNIQUE PRODUCT KEY
        ================================================ */

        const productKey =
            `${productName}-${selectedWeight}`;


        /* ================================================
           FIND EXISTING PRODUCT
        ================================================ */

        const existingItem =
            cart.find(function (item) {

                return (
                    item.productKey ===
                    productKey
                );

            });


        /* ================================================
           UPDATE EXISTING PRODUCT
        ================================================ */

        if (existingItem) {

            existingItem.quantity =
                Number(
                    existingItem.quantity || 0
                ) +
                quantity;


            /* Keep latest pricing */

            existingItem.price =
                price;

            existingItem.oldPrice =
                oldPrice;


        } else {


            /* ============================================
               ADD NEW PRODUCT
            ============================================ */

            cart.push({

                productKey:
                    productKey,

                name:
                    productName,

                price:
                    price,

                oldPrice:
                    oldPrice,

                quantity:
                    quantity,

                variant:
                    selectedWeight,

                image:
                    image

            });

        }


        /* ================================================
           SAVE CART
        ================================================ */

        saveCart(cart);


        /* ================================================
           UPDATE CART COUNT
        ================================================ */

        updateCartCount();


        /* ================================================
           BUTTON FEEDBACK
        ================================================ */

        const originalHTML =
            addButton.innerHTML;


        addButton.innerHTML =
            '<i class="fa-solid fa-check"></i> Added';


        addButton.classList.add(
            "added"
        );


        setTimeout(function () {

            addButton.innerHTML =
                originalHTML;


            addButton.classList.remove(
                "added"
            );

        }, 1500);

    }


    /* =====================================================
       QUANTITY CONTROLS
    ===================================================== */

    productCards.forEach(function (card) {

        const minusButton =
            card.querySelector(
                ".quantity-minus"
            );


        const plusButton =
            card.querySelector(
                ".quantity-plus"
            );


        const quantityElement =
            card.querySelector(
                ".quantity"
            );


        if (!quantityElement) {
            return;
        }


        /* =================================================
           PLUS
        ================================================= */

        if (plusButton) {

            plusButton.addEventListener(
                "click",
                function () {

                    let quantity =
                        Number(
                            quantityElement.textContent
                        ) || 1;


                    quantity++;


                    quantityElement.textContent =
                        quantity;

                }
            );

        }


        /* =================================================
           MINUS
        ================================================= */

        if (minusButton) {

            minusButton.addEventListener(
                "click",
                function () {

                    let quantity =
                        Number(
                            quantityElement.textContent
                        ) || 1;


                    if (quantity > 1) {

                        quantity--;

                    }


                    quantityElement.textContent =
                        quantity;

                }
            );

        }

    });


    /* =====================================================
       VARIANT / PRICE CHANGE
    ===================================================== */

    productCards.forEach(function (card) {

        const variant =
            card.querySelector(
                ".product-variant"
            );


        if (!variant) {
            return;
        }


        variant.addEventListener(
            "change",
            function () {

                updateProductPrice(card);

            }
        );

    });


    /* =====================================================
       ADD TO CART BUTTONS
    ===================================================== */

    productCards.forEach(function (card) {

        const addButton =
            card.querySelector(
                ".add-cart-btn"
            );


        if (!addButton) {
            return;
        }


        addButton.addEventListener(
            "click",
            function () {

                addToCart(card);

            }
        );

    });


    /* =====================================================
       PRODUCT DETAILS

       Quick View opens:
       product.html?id=PRODUCT_ID
    ===================================================== */

    const productIds = {

        "Kashmiri Saffron":
            "saffron",

        "Premium Almonds":
            "almonds",

        "Premium Walnuts":
            "walnuts",

        "Pure Shilajit":
            "shilajit",

        "Kashmiri Kahwa":
            "kahwa",

        "Premium Cashews":
            "cashews",

        "Premium Raisins":
            "raisins",

        "Kashmiri Honey":
            "honey"

    };


    const quickViewButtons =
        document.querySelectorAll(
            ".quick-view"
        );


    quickViewButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const card =
                        button.closest(
                            ".shop-product-card"
                        );


                    if (!card) {
                        return;
                    }


                    const nameElement =
                        card.querySelector(
                            ".product-info h3"
                        );


                    if (!nameElement) {
                        return;
                    }


                    const productName =
                        nameElement.textContent.trim();


                    const productId =
                        productIds[
                            productName
                        ];


                    if (!productId) {

                        console.error(
                            "Product ID not found for:",
                            productName
                        );

                        return;

                    }


                    window.location.href =
                        "product.html?id=" +
                        encodeURIComponent(
                            productId
                        );

                }
            );

        }
    );


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    function filterProducts(category) {

        let visibleProducts = 0;


        productCards.forEach(
            function (card) {

                const cardCategory =
                    card.dataset.category;


                if (
                    category === "all" ||
                    cardCategory === category
                ) {

                    card.style.display =
                        "";

                    visibleProducts++;

                } else {

                    card.style.display =
                        "none";

                }

            }
        );


        /* =================================================
           UPDATE PRODUCT COUNT
        ================================================= */

        if (productCount) {

            productCount.textContent =
                visibleProducts;

        }


        /* =================================================
           NO PRODUCTS MESSAGE
        ================================================= */

        if (noProducts) {

            if (
                visibleProducts === 0
            ) {

                noProducts.style.display =
                    "block";

            } else {

                noProducts.style.display =
                    "none";

            }

        }

    }


    /* =====================================================
       CATEGORY BUTTONS
    ===================================================== */

    categoryButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {


                    /* ======================================
                       REMOVE ACTIVE FROM ALL BUTTONS
                    ====================================== */

                    categoryButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    /* ======================================
                       ADD ACTIVE TO SELECTED BUTTON
                    ====================================== */

                    button.classList.add(
                        "active"
                    );


                    const category =
                        button.dataset.category ||
                        "all";


                    /* ======================================
                       FILTER
                    ====================================== */

                    filterProducts(
                        category
                    );


                    /* ======================================
                       SORT
                    ====================================== */

                    sortCurrentProducts();

                }
            );

        }
    );


    /* =====================================================
       SORT PRODUCTS
    ===================================================== */

    function sortCurrentProducts() {

        if (
            !productGrid ||
            !sortProducts
        ) {

            return;

        }


        const sortValue =
            sortProducts.value;


        const cards =
            Array.from(
                productGrid.querySelectorAll(
                    ".shop-product-card"
                )
            );


        cards.sort(
            function (cardA, cardB) {


                /* =========================================
                   CURRENT PRICE
                ========================================= */

                const priceA =
                    Number(
                        cardA.dataset.price
                    ) || 0;


                const priceB =
                    Number(
                        cardB.dataset.price
                    ) || 0;


                /* =========================================
                   PRODUCT NAME
                ========================================= */

                const nameA =
                    (
                        cardA.dataset.name ||
                        ""
                    ).toLowerCase();


                const nameB =
                    (
                        cardB.dataset.name ||
                        ""
                    ).toLowerCase();


                /* =========================================
                   LOW TO HIGH
                ========================================= */

                if (
                    sortValue === "low-high"
                ) {

                    return (
                        priceA -
                        priceB
                    );

                }


                /* =========================================
                   HIGH TO LOW
                ========================================= */

                if (
                    sortValue === "high-low"
                ) {

                    return (
                        priceB -
                        priceA
                    );

                }


                /* =========================================
                   NAME A TO Z
                ========================================= */

                if (
                    sortValue === "name"
                ) {

                    return nameA.localeCompare(
                        nameB
                    );

                }


                /* =========================================
                   FEATURED
                ========================================= */

                return 0;

            }
        );


        cards.forEach(
            function (card) {

                productGrid.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       SORT CHANGE
    ===================================================== */

    if (sortProducts) {

        sortProducts.addEventListener(
            "change",
            function () {

                sortCurrentProducts();

            }
        );

    }


    /* =====================================================
       INITIAL SETUP
    ===================================================== */

    updateCartCount();

    filterProducts("all");

});