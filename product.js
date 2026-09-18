/* =========================================================
   THE FRIENDS HERITAGE
   PRODUCT.JS

   Controls ONLY the existing product.html elements.
   Does NOT create or replace the page HTML.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    const products = {

        /* =================================================
           SAFFRON
        ================================================= */

        saffron: {

            name: "Kashmiri Saffron",
            category: "Saffron",

            shortDescription:
                "Premium Kashmiri saffron with rich aroma, natural colour and carefully selected quality.",

            description:
                "Our Kashmiri saffron is carefully selected for its distinctive aroma, natural colour and premium quality. It represents the rich agricultural heritage of Kashmir and is packed carefully to preserve its character.",

            images: [
                "slide3.jpg",
                "slide3.jpg",
                "slide3.jpg"
            ],

            variants: [
                {
                    name: "1g",
                    price: 299,
                    oldPrice: 399
                },
                {
                    name: "2g",
                    price: 549,
                    oldPrice: 699
                },
                {
                    name: "5g",
                    price: 1299,
                    oldPrice: 1599
                }
            ],

            benefits: [
                {
                    icon: "fa-leaf",
                    title: "Naturally Selected",
                    text: "Carefully selected saffron with a rich natural aroma."
                },
                {
                    icon: "fa-star",
                    title: "Premium Quality",
                    text: "Selected with care for colour, aroma and quality."
                },
                {
                    icon: "fa-mountain",
                    title: "Kashmiri Origin",
                    text: "Inspired by the rich agricultural heritage of Kashmir."
                },
                {
                    icon: "fa-box-open",
                    title: "Carefully Packed",
                    text: "Packed securely to help preserve freshness and quality."
                }
            ],

            origin: "Kashmir",

            howToUse:
                "Use according to your preferred recipe or traditional preparation. A small quantity can be added to milk, tea, rice dishes, desserts and other preparations.",

            storage:
                "Store in a cool, dry place away from direct sunlight and moisture. Keep the product properly sealed when not in use.",

            authenticity:
                "We carefully select our saffron and focus on quality, authenticity and responsible sourcing.",

            sizes:
                "1g / 2g / 5g"
        },


        /* =================================================
           ALMONDS
        ================================================= */

        almonds: {

            name: "Premium Almonds",
            category: "Dry Fruits",

            shortDescription:
                "Naturally nutritious almonds, carefully selected for premium quality and satisfying crunch.",

            description:
                "Premium almonds selected for their natural taste, satisfying crunch and quality. They are carefully packed to help maintain their freshness and are suitable for everyday enjoyment.",

            images: [
                "slide1.jpg",
                "slide1.jpg",
                "slide1.jpg"
            ],

            variants: [
                {
                    name: "500g",
                    price: 599,
                    oldPrice: 699
                },
                {
                    name: "1kg",
                    price: 1099,
                    oldPrice: 1299
                }
            ],

            benefits: [
                {
                    icon: "fa-leaf",
                    title: "Naturally Selected",
                    text: "Carefully selected almonds with a naturally rich taste."
                },
                {
                    icon: "fa-star",
                    title: "Premium Quality",
                    text: "Selected for quality, freshness and satisfying crunch."
                },
                {
                    icon: "fa-mountain",
                    title: "Carefully Sourced",
                    text: "Selected with attention to quality and product standards."
                },
                {
                    icon: "fa-box-open",
                    title: "Carefully Packed",
                    text: "Secure packaging helps maintain product quality."
                }
            ],

            origin: "India",

            howToUse:
                "Enjoy directly as a snack or add to breakfast, desserts, milkshakes and your favourite recipes.",

            storage:
                "Store in a cool, dry place away from direct sunlight and moisture. Keep sealed after opening.",

            authenticity:
                "We carefully select our almonds and focus on quality and responsible sourcing.",

            sizes:
                "500g / 1kg"
        },


        /* =================================================
           WALNUTS
        ================================================= */

        walnuts: {

            name: "Premium Walnuts",
            category: "Dry Fruits",

            shortDescription:
                "Premium Kashmiri walnuts with rich taste, natural goodness and a satisfying texture.",

            description:
                "Our premium walnuts are selected for their rich taste and natural character. Carefully packed for quality, they are a delicious addition to everyday meals and snacks.",

            images: [
                "slide2.jpg",
                "slide2.jpg",
                "slide2.jpg"
            ],

            variants: [
                {
                    name: "500g",
                    price: 699,
                    oldPrice: 849
                },
                {
                    name: "1kg",
                    price: 1299,
                    oldPrice: 1599
                }
            ],

            benefits: [
                {
                    icon: "fa-leaf",
                    title: "Naturally Selected",
                    text: "Selected for natural taste and quality."
                },
                {
                    icon: "fa-star",
                    title: "Premium Quality",
                    text: "Carefully selected premium walnuts."
                },
                {
                    icon: "fa-mountain",
                    title: "Kashmiri Heritage",
                    text: "Inspired by the rich dry-fruit heritage of Kashmir."
                },
                {
                    icon: "fa-box-open",
                    title: "Carefully Packed",
                    text: "Packed securely to help maintain quality."
                }
            ],

            origin: "Kashmir",

            howToUse:
                "Enjoy directly as a snack or use in desserts, breakfast dishes, baking and other recipes.",

            storage:
                "Store in a cool, dry place away from sunlight and moisture. Keep sealed after opening.",

            authenticity:
                "Our walnuts are carefully selected with a focus on quality and responsible sourcing.",

            sizes:
                "500g / 1kg"
        },


        /* =================================================
           SHILAJIT
        ================================================= */

        shilajit: {

            name: "Pure Shilajit",
            category: "Himalayan",

            shortDescription:
                "Carefully selected Himalayan shilajit presented in premium packaging.",

            description:
                "Pure Shilajit from The Friends Heritage is carefully selected and presented in secure premium packaging. Our focus is on quality, careful sourcing and responsible presentation.",

            images: [
                "slide4.jpg",
                "slide4.jpg",
                "slide4.jpg"
            ],

            variants: [
                {
                    name: "50g",
                    price: 1299,
                    oldPrice: 1599
                },
                {
                    name: "100g",
                    price: 2299,
                    oldPrice: 2799
                },
                {
                    name: "250g",
                    price: 4999,
                    oldPrice: 5999
                }
            ],

            benefits: [
                {
                    icon: "fa-leaf",
                    title: "Carefully Selected",
                    text: "Selected with attention to quality and consistency."
                },
                {
                    icon: "fa-star",
                    title: "Premium Quality",
                    text: "Presented as a premium Himalayan product."
                },
                {
                    icon: "fa-mountain",
                    title: "Himalayan Origin",
                    text: "Inspired by the natural heritage of the Himalayas."
                },
                {
                    icon: "fa-box-open",
                    title: "Secure Packaging",
                    text: "Packed carefully to help maintain product quality."
                }
            ],

            origin: "Himalayan Region",

            howToUse:
                "Use only according to the instructions provided with the product packaging. Follow the recommended serving guidance.",

            storage:
                "Store tightly sealed in a cool, dry place away from direct sunlight, heat and moisture.",

            authenticity:
                "We focus on careful sourcing, quality selection and responsible product presentation.",

            sizes:
                "50g / 100g / 250g"
        },


        /* =================================================
           KAHWA
        ================================================= */

        kahwa: {

            name: "Kashmiri Kahwa",
            category: "Himalayan",

            shortDescription:
                "Traditional Kashmiri kahwa blend crafted for a rich and aromatic experience.",

            description:
                "Kashmiri Kahwa is a traditional aromatic tea enjoyed across Kashmir. Our blend is selected to provide a warm, comforting experience inspired by Kashmiri tradition.",

            images: [
                "kahwa.jpg",
                "kahwa.jpg",
                "kahwa.jpg"
            ],

            variants: [
                {
                    name: "250g",
                    price: 399,
                    oldPrice: 499
                },
                {
                    name: "500g",
                    price: 699,
                    oldPrice: 899
                }
            ],

            benefits: [
                {
                    icon: "fa-leaf",
                    title: "Traditional Blend",
                    text: "Inspired by the traditional tea culture of Kashmir."
                },
                {
                    icon: "fa-star",
                    title: "Premium Quality",
                    text: "Selected for a pleasant aroma and flavour."
                },
                {
                    icon: "fa-mountain",
                    title: "Kashmiri Heritage",
                    text: "Inspired by the rich heritage of Kashmir."
                },
                {
                    icon: "fa-box-open",
                    title: "Carefully Packed",
                    text: "Packed carefully to preserve product quality."
                }
            ],

            origin: "Kashmir",

            howToUse:
                "Add the recommended quantity to hot water and prepare according to your preferred kahwa recipe.",

            storage:
                "Store in a cool, dry place away from sunlight and moisture. Keep the package properly sealed.",

            authenticity:
                "Our kahwa is selected with a focus on quality and its traditional Kashmiri character.",

            sizes:
                "250g / 500g"
        },


        /* =================================================
           CASHEWS
        ================================================= */

        cashews: {

            name: "Premium Cashews",
            category: "Dry Fruits",

            shortDescription:
                "Creamy, crunchy and carefully selected premium cashews.",

            description:
                "Premium cashews selected for their creamy texture, natural sweetness and satisfying crunch. Carefully packed for everyday enjoyment.",

            images: [
                "cashews.jpg",
                "cashews.jpg",
                "cashews.jpg"
            ],

            variants: [
                {
                    name: "500g",
                    price: 799,
                    oldPrice: 949
                },
                {
                    name: "1kg",
                    price: 1499,
                    oldPrice: 1799
                }
            ],

            benefits: [
                {
                    icon: "fa-leaf",
                    title: "Naturally Selected",
                    text: "Selected for their natural taste and texture."
                },
                {
                    icon: "fa-star",
                    title: "Premium Quality",
                    text: "Carefully selected premium cashews."
                },
                {
                    icon: "fa-mountain",
                    title: "Carefully Sourced",
                    text: "Selected with attention to quality."
                },
                {
                    icon: "fa-box-open",
                    title: "Carefully Packed",
                    text: "Secure packaging helps maintain freshness."
                }
            ],

            origin: "India",

            howToUse:
                "Enjoy directly as a snack or use in desserts, curries, sweets and other recipes.",

            storage:
                "Store in a cool, dry place away from direct sunlight and moisture. Keep sealed after opening.",

            authenticity:
                "We carefully select our cashews with a focus on quality and freshness.",

            sizes:
                "500g / 1kg"
        },


        /* =================================================
           RAISINS
        ================================================= */

        raisins: {

            name: "Premium Raisins",
            category: "Dry Fruits",

            shortDescription:
                "Naturally sweet premium raisins, selected for quality and freshness.",

            description:
                "Premium raisins with a naturally sweet taste and soft texture. Carefully selected and packed to provide a convenient addition to everyday snacks and recipes.",

            images: [
                "raisins.jpg",
                "raisins.jpg",
                "raisins.jpg"
            ],

            variants: [
                {
                    name: "500g",
                    price: 499,
                    oldPrice: 599
                },
                {
                    name: "1kg",
                    price: 899,
                    oldPrice: 1099
                }
            ],

            benefits: [
                {
                    icon: "fa-leaf",
                    title: "Naturally Selected",
                    text: "Selected for natural sweetness and quality."
                },
                {
                    icon: "fa-star",
                    title: "Premium Quality",
                    text: "Carefully selected for everyday enjoyment."
                },
                {
                    icon: "fa-mountain",
                    title: "Carefully Sourced",
                    text: "Selected with attention to product quality."
                },
                {
                    icon: "fa-box-open",
                    title: "Carefully Packed",
                    text: "Packed securely to help maintain quality."
                }
            ],

            origin: "India",

            howToUse:
                "Enjoy directly as a snack or add to cereals, desserts, baking and other recipes.",

            storage:
                "Store in a cool, dry place away from direct sunlight and moisture. Keep sealed after opening.",

            authenticity:
                "Our raisins are carefully selected with a focus on quality and freshness.",

            sizes:
                "500g / 1kg"
        },


        /* =================================================
           HONEY
        ================================================= */

        honey: {

            name: "Kashmiri Honey",
            category: "Himalayan",

            shortDescription:
                "Naturally sourced honey with a rich and authentic Himalayan taste.",

            description:
                "Kashmiri Honey is selected for its natural character and rich taste, inspired by the floral landscapes and heritage of the Himalayan region.",

            images: [
                "honey.jpg",
                "honey.jpg",
                "honey.jpg"
            ],

            variants: [
                {
                    name: "500g",
                    price: 549,
                    oldPrice: 649
                },
                {
                    name: "1kg",
                    price: 999,
                    oldPrice: 1199
                }
            ],

            benefits: [
                {
                    icon: "fa-leaf",
                    title: "Naturally Selected",
                    text: "Selected for its natural taste and character."
                },
                {
                    icon: "fa-star",
                    title: "Premium Quality",
                    text: "Carefully selected and presented as a premium product."
                },
                {
                    icon: "fa-mountain",
                    title: "Himalayan Heritage",
                    text: "Inspired by the rich natural heritage of Kashmir."
                },
                {
                    icon: "fa-box-open",
                    title: "Carefully Packed",
                    text: "Packed securely to help maintain product quality."
                }
            ],

            origin: "Kashmir",

            howToUse:
                "Enjoy as a natural sweetener in beverages, breakfast dishes, desserts or according to your preferred recipe.",

            storage:
                "Store in a cool, dry place away from direct sunlight and moisture. Keep the container properly sealed.",

            authenticity:
                "We focus on careful selection, quality and responsible sourcing.",

            sizes:
                "500g / 1kg"
        }

    };


    /* =====================================================
       GET PRODUCT ID FROM URL
    ===================================================== */

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const productId =
        urlParams.get("id") || "saffron";


    const product =
        products[productId];


    /* =====================================================
       CHECK PRODUCT
    ===================================================== */

    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        window.location.href = "shop.html";

        return;
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const breadcrumbProduct =
        document.getElementById(
            "breadcrumbProduct"
        );

    const mainImage =
        document.getElementById(
            "mainProductImage"
        );

    const thumbnailsContainer =
        document.getElementById(
            "productThumbnails"
        );

    const productCategory =
        document.getElementById(
            "productCategory"
        );

    const productName =
        document.getElementById(
            "productName"
        );

    const productPrice =
        document.getElementById(
            "productPrice"
        );

    const productOldPrice =
        document.getElementById(
            "productOldPrice"
        );

    const shortDescription =
        document.getElementById(
            "productShortDescription"
        );

    const variantsContainer =
        document.getElementById(
            "productVariants"
        );

    const quantityElement =
        document.getElementById(
            "productQuantity"
        );

    const decreaseQuantity =
        document.getElementById(
            "decreaseQuantity"
        );

    const increaseQuantity =
        document.getElementById(
            "increaseQuantity"
        );

    const addToCartButton =
        document.getElementById(
            "addProductToCart"
        );

    const cartMessage =
        document.getElementById(
            "productCartMessage"
        );

    const description =
        document.getElementById(
            "productDescription"
        );

    const benefitsContainer =
        document.getElementById(
            "productBenefits"
        );

    const specProductName =
        document.getElementById(
            "specProductName"
        );

    const specCategory =
        document.getElementById(
            "specCategory"
        );

    const specOrigin =
        document.getElementById(
            "specOrigin"
        );

    const specSizes =
        document.getElementById(
            "specSizes"
        );

    const howToUse =
        document.getElementById(
            "productHowToUse"
        );

    const storage =
        document.getElementById(
            "productStorage"
        );

    const faqAuthenticity =
        document.getElementById(
            "faqAuthenticity"
        );

    const faqSizes =
        document.getElementById(
            "faqSizes"
        );

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    /* =====================================================
       CURRENT STATE
    ===================================================== */

    let selectedVariant =
        product.variants[0];

    let quantity = 1;


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(price) {

        return "₹" +
            Number(price).toLocaleString("en-IN");

    }


    /* =====================================================
       UPDATE PRODUCT PRICES
    ===================================================== */

    function updateDisplayedPrices() {

        if (productPrice) {

            productPrice.textContent =
                formatPrice(
                    selectedVariant.price
                );

        }


        if (productOldPrice) {

            productOldPrice.textContent =
                formatPrice(
                    selectedVariant.oldPrice
                );

        }

    }


    /* =====================================================
       LOAD BASIC PRODUCT INFORMATION
    ===================================================== */

    if (breadcrumbProduct) {

        breadcrumbProduct.textContent =
            product.name;

    }


    if (productCategory) {

        productCategory.textContent =
            product.category.toUpperCase();

    }


    if (productName) {

        productName.textContent =
            product.name;

    }


    /* =====================================================
       INITIAL PRICE
    ===================================================== */

    updateDisplayedPrices();


    if (shortDescription) {

        shortDescription.textContent =
            product.shortDescription;

    }


    if (description) {

        description.textContent =
            product.description;

    }


    if (specProductName) {

        specProductName.textContent =
            product.name;

    }


    if (specCategory) {

        specCategory.textContent =
            product.category;

    }


    if (specOrigin) {

        specOrigin.textContent =
            product.origin;

    }


    if (specSizes) {

        specSizes.textContent =
            product.sizes;

    }


    if (howToUse) {

        howToUse.textContent =
            product.howToUse;

    }


    if (storage) {

        storage.textContent =
            product.storage;

    }


    if (faqAuthenticity) {

        faqAuthenticity.textContent =
            product.authenticity;

    }


    if (faqSizes) {

        faqSizes.textContent =
            `Available sizes: ${product.sizes}.`;

    }


    /* =====================================================
       PRODUCT IMAGES
    ===================================================== */

    if (mainImage) {

        mainImage.src =
            product.images[0];

        mainImage.alt =
            product.name;

    }


    const thumbnails =
        document.querySelectorAll(
            ".thumbnail"
        );


    thumbnails.forEach(
        function (thumbnail, index) {

            if (product.images[index]) {

                const image =
                    thumbnail.querySelector("img");


                if (image) {

                    image.src =
                        product.images[index];

                    image.alt =
                        `${product.name} image ${index + 1}`;

                }

            }

        }
    );


    thumbnails.forEach(
        function (thumbnail, index) {

            thumbnail.addEventListener(
                "click",
                function () {

                    if (!product.images[index]) {

                        return;

                    }


                    if (mainImage) {

                        mainImage.src =
                            product.images[index];

                    }


                    thumbnails.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    thumbnail.classList.add(
                        "active"
                    );

                }
            );

        }
    );


    /* =====================================================
       VARIANTS

       Automatically supports:

       Saffron:
       1g | 2g | 5g

       Almonds:
       500g | 1kg

       Walnuts:
       500g | 1kg

       Shilajit:
       50g | 100g | 250g

       Kahwa:
       250g | 500g

       Cashews:
       500g | 1kg

       Raisins:
       500g | 1kg

       Honey:
       500g | 1kg
    ===================================================== */

    if (variantsContainer) {

        const variantButtons =
            variantsContainer.querySelectorAll(
                ".detail-variant"
            );


        variantButtons.forEach(
            function (button, index) {

                const variant =
                    product.variants[index];


                /* =========================================
                   HIDE UNUSED BUTTON
                ========================================= */

                if (!variant) {

                    button.style.display =
                        "none";

                    button.classList.remove(
                        "active"
                    );

                    return;

                }


                /* =========================================
                   SHOW VALID BUTTON
                ========================================= */

                button.style.display =
                    "inline-flex";


                button.textContent =
                    variant.name;


                button.dataset.price =
                    variant.price;


                button.dataset.oldPrice =
                    variant.oldPrice;


                /* =========================================
                   FIRST VARIANT ACTIVE
                ========================================= */

                if (index === 0) {

                    button.classList.add(
                        "active"
                    );

                } else {

                    button.classList.remove(
                        "active"
                    );

                }


                /* =========================================
                   VARIANT CLICK
                ========================================= */

                button.addEventListener(
                    "click",
                    function () {

                        variantButtons.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        selectedVariant =
                            variant;


                        /* =============================
                           UPDATE BOTH PRICES
                        ============================= */

                        updateDisplayedPrices();

                    }
                );

            }
        );

    }


    /* =====================================================
       QUANTITY
    ===================================================== */

    function updateQuantity() {

        if (quantityElement) {

            quantityElement.textContent =
                quantity;

        }

    }


    if (increaseQuantity) {

        increaseQuantity.addEventListener(
            "click",
            function () {

                quantity++;

                updateQuantity();

            }
        );

    }


    if (decreaseQuantity) {

        decreaseQuantity.addEventListener(
            "click",
            function () {

                if (quantity > 1) {

                    quantity--;

                }

                updateQuantity();

            }
        );

    }


    /* =====================================================
       BENEFITS

       Uses the existing benefit-item elements.
       Does NOT change the layout.
    ===================================================== */

    if (benefitsContainer) {

        const benefitItems =
            benefitsContainer.querySelectorAll(
                ".benefit-item"
            );


        benefitItems.forEach(
            function (item, index) {

                const benefit =
                    product.benefits[index];


                if (!benefit) {

                    return;

                }


                const icon =
                    item.querySelector(
                        ".benefit-icon i"
                    );


                const heading =
                    item.querySelector(
                        "h3"
                    );


                const paragraph =
                    item.querySelector(
                        "p"
                    );


                if (icon) {

                    icon.className =
                        `fa-solid ${benefit.icon}`;

                }


                if (heading) {

                    heading.textContent =
                        benefit.title;

                }


                if (paragraph) {

                    paragraph.textContent =
                        benefit.text;

                }

            }
        );

    }


    /* =====================================================
       CART
    ===================================================== */

    const CART_KEY =
        "friendsHeritageCart";


    function getCart() {

        try {

            const savedCart =
                localStorage.getItem(
                    CART_KEY
                );


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
       UPDATE CART COUNT
    ===================================================== */

    function updateCartCount() {

        if (!cartCount) {

            return;

        }


        const cart =
            getCart();


        const total =
            cart.reduce(
                function (sum, item) {

                    return sum +
                        Number(
                            item.quantity || 0
                        );

                },
                0
            );


        cartCount.textContent =
            total;

    }


    /* =====================================================
       ADD TO CART
    ===================================================== */

    if (addToCartButton) {

        addToCartButton.addEventListener(
            "click",
            function () {

                const cart =
                    getCart();


                const productKey =
                    `${productId}-${selectedVariant.name}`;


                const existingItem =
                    cart.find(
                        function (item) {

                            return item.productKey ===
                                productKey;

                        }
                    );


                if (existingItem) {

                    existingItem.quantity =
                        Number(
                            existingItem.quantity || 0
                        ) + quantity;


                    /* =====================================
                       UPDATE PRICE DATA TOO
                    ===================================== */

                    existingItem.price =
                        selectedVariant.price;

                    existingItem.oldPrice =
                        selectedVariant.oldPrice;

                } else {

                    cart.push({

                        productKey:
                            productKey,

                        id:
                            productId,

                        name:
                            product.name,

                        variant:
                            selectedVariant.name,

                        price:
                            selectedVariant.price,

                        oldPrice:
                            selectedVariant.oldPrice,

                        quantity:
                            quantity,

                        image:
                            product.images[0]

                    });

                }


                saveCart(cart);

                updateCartCount();


                /* =========================================
                   SUCCESS MESSAGE
                ========================================= */

                if (cartMessage) {

                    cartMessage.textContent =
                        `${product.name} (${selectedVariant.name}) added to your cart.`;

                    cartMessage.classList.add(
                        "show"
                    );


                    setTimeout(
                        function () {

                            cartMessage.classList.remove(
                                "show"
                            );

                        },
                        2500
                    );

                }


                /* =========================================
                   BUTTON FEEDBACK
                ========================================= */

                const originalHTML =
                    addToCartButton.innerHTML;


                addToCartButton.innerHTML =
                    '<i class="fa-solid fa-check"></i> Added To Cart';


                addToCartButton.classList.add(
                    "added"
                );


                setTimeout(
                    function () {

                        addToCartButton.innerHTML =
                            originalHTML;

                        addToCartButton.classList.remove(
                            "added"
                        );

                    },
                    1800
                );

            }
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateQuantity();

    updateDisplayedPrices();

    updateCartCount();

});