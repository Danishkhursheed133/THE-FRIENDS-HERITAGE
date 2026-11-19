/* =========================================================
   THE FRIENDS HERITAGE
   MAIN SCRIPT.JS
   ---------------------------------------------------------
   Handles:

   1. Mobile Navbar
   2. Homepage Hero Slider
   3. Homepage Add To Cart
   4. Backend Cart Badge
   5. Social App Links

   HOMEPAGE CART:
   - Products are loaded from Flask database.
   - No hardcoded database Product IDs.
   - Product matching supports different database names.
========================================================= */


/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = window.location.origin;

const CART_TOKEN_KEY =
    "friendsHeritageCartToken";


/* =========================================================
   CART TOKEN
========================================================= */

function getCartToken() {

    let token =
        localStorage.getItem(
            CART_TOKEN_KEY
        );


    if (!token) {

        token =
            "tfh-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 12);


        localStorage.setItem(
            CART_TOKEN_KEY,
            token
        );

    }


    return token;

}


/* =========================================================
   MOBILE NAVBAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const menuToggle =
            document.getElementById(
                "menuToggle"
            );


        const navLinks =
            document.getElementById(
                "navLinks"
            );


        if (
            !menuToggle ||
            !navLinks
        ) {

            return;

        }


        menuToggle.addEventListener(
            "click",
            function () {

                navLinks.classList.toggle(
                    "active"
                );

            }
        );


        const menuItems =
            navLinks.querySelectorAll(
                "a"
            );


        menuItems.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        navLinks.classList.remove(
                            "active"
                        );

                    }
                );

            }
        );

    }
);


/* =========================================================
   HERO SLIDER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const slides =
            document.querySelectorAll(
                ".slide"
            );


        const dots =
            document.querySelectorAll(
                ".dot"
            );


        const nextButton =
            document.querySelector(
                ".next"
            );


        const prevButton =
            document.querySelector(
                ".prev"
            );


        const slider =
            document.querySelector(
                ".slider"
            );


        if (!slides.length) {

            return;

        }


        let currentSlide = 0;

        let sliderInterval = null;


        function showSlide(index) {

            if (
                index >=
                slides.length
            ) {

                currentSlide = 0;

            }

            else if (
                index < 0
            ) {

                currentSlide =
                    slides.length - 1;

            }

            else {

                currentSlide =
                    index;

            }


            slides.forEach(
                function (slide) {

                    slide.classList.remove(
                        "active"
                    );

                }
            );


            dots.forEach(
                function (dot) {

                    dot.classList.remove(
                        "active"
                    );

                }
            );


            if (
                slides[currentSlide]
            ) {

                slides[currentSlide]
                    .classList.add(
                        "active"
                    );

            }


            if (
                dots[currentSlide]
            ) {

                dots[currentSlide]
                    .classList.add(
                        "active"
                    );

            }

        }


        function nextSlide() {

            showSlide(
                currentSlide + 1
            );

        }


        function previousSlide() {

            showSlide(
                currentSlide - 1
            );

        }


        function startSlider() {

            clearInterval(
                sliderInterval
            );


            sliderInterval =
                setInterval(
                    function () {

                        nextSlide();

                    },
                    3000
                );

        }


        function stopSlider() {

            clearInterval(
                sliderInterval
            );

        }


        if (nextButton) {

            nextButton.addEventListener(
                "click",
                function () {

                    nextSlide();

                    startSlider();

                }
            );

        }


        if (prevButton) {

            prevButton.addEventListener(
                "click",
                function () {

                    previousSlide();

                    startSlider();

                }
            );

        }


        dots.forEach(
            function (dot, index) {

                dot.addEventListener(
                    "click",
                    function () {

                        showSlide(index);

                        startSlider();

                    }
                );

            }
        );


        if (slider) {

            slider.addEventListener(
                "mouseenter",
                stopSlider
            );


            slider.addEventListener(
                "mouseleave",
                startSlider
            );

        }


        showSlide(0);

        startSlider();

    }
);


/* =========================================================
   HOMEPAGE PRODUCT CACHE
========================================================= */

let homepageDatabaseProducts = [];


/* =========================================================
   LOAD PRODUCTS FROM DATABASE
========================================================= */

async function loadHomepageDatabaseProducts() {

    try {

        console.log(
            "Loading homepage products from database..."
        );


        const response =
            await fetch(
                `${API_BASE_URL}/api/products`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Unable to load products (${response.status})`
            );

        }


        const result =
            await response.json();


        console.log(
            "Raw /api/products response:",
            result
        );


        if (
            result &&
            Array.isArray(
                result.products
            )
        ) {

            homepageDatabaseProducts =
                result.products;

        }

        else if (
            Array.isArray(result)
        ) {

            homepageDatabaseProducts =
                result;

        }

        else {

            homepageDatabaseProducts =
                [];

        }


        console.log(
            "Homepage database products loaded:",
            homepageDatabaseProducts
        );


        return homepageDatabaseProducts;

    }

    catch (error) {

        console.error(
            "Unable to load homepage products:",
            error
        );


        homepageDatabaseProducts = [];


        return [];

    }

}


/* =========================================================
   NORMALIZE PRODUCT NAME
========================================================= */

function normalizeProductName(name) {

    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

}


/* =========================================================
   GET PRODUCT TYPE
========================================================= */

function getHomepageProductType(name) {

    const cleanName =
        String(name || "")
            .trim()
            .toLowerCase();


    if (
        cleanName.includes("almond")
    ) {

        return "almond";

    }


    if (
        cleanName.includes("walnut")
    ) {

        return "walnut";

    }


    if (
        cleanName.includes("saffron")
    ) {

        return "saffron";

    }


    if (
        cleanName.includes("shilajit")
    ) {

        return "shilajit";

    }


    return null;

}


/* =========================================================
   FIND HOMEPAGE PRODUCT
   ---------------------------------------------------------
   Supports:

   Premium Almonds
   kashmiri almond Giri

   Premium Walnuts
   Kashmiri Walnut giri

   Kashmiri Saffron
   kashmiri saffron

   Pure Shilajit
========================================================= */

async function findHomepageProduct(
    productName
) {

    const cleanName =
        String(productName || "")
            .trim()
            .toLowerCase();


    if (!cleanName) {

        return null;

    }


    /* =====================================================
       LOAD DATABASE PRODUCTS
    ===================================================== */

    if (
        !Array.isArray(
            homepageDatabaseProducts
        ) ||
        !homepageDatabaseProducts.length
    ) {

        await loadHomepageDatabaseProducts();

    }


    let products =
        homepageDatabaseProducts;


    /* =====================================================
       EXACT MATCH
    ===================================================== */

    let product =
        products.find(
            function (item) {

                return (
                    String(
                        item.name || ""
                    )
                    .trim()
                    .toLowerCase() ===
                    cleanName
                );

            }
        );


    if (product) {

        return product;

    }


    /* =====================================================
       NORMALIZED MATCH
    ===================================================== */

    const normalizedHomeName =
        normalizeProductName(
            productName
        );


    product =
        products.find(
            function (item) {

                const databaseName =
                    normalizeProductName(
                        item.name
                    );


                return (
                    databaseName ===
                    normalizedHomeName
                );

            }
        );


    if (product) {

        return product;

    }


    /* =====================================================
       PARTIAL NAME MATCH
    ===================================================== */

    product =
        products.find(
            function (item) {

                const databaseName =
                    normalizeProductName(
                        item.name
                    );


                return (
                    databaseName.includes(
                        normalizedHomeName
                    ) ||
                    normalizedHomeName.includes(
                        databaseName
                    )
                );

            }
        );


    if (product) {

        return product;

    }


    /* =====================================================
       PRODUCT TYPE MATCH
    ===================================================== */

    const productType =
        getHomepageProductType(
            productName
        );


    if (productType) {

        product =
            products.find(
                function (item) {

                    return String(
                        item.name || ""
                    )
                        .trim()
                        .toLowerCase()
                        .includes(
                            productType
                        );

                }
            );


        if (product) {

            return product;

        }

    }


    /* =====================================================
       REFRESH DATABASE ONCE
    ===================================================== */

    const refreshedProducts =
        await loadHomepageDatabaseProducts();


    if (
        Array.isArray(
            refreshedProducts
        ) &&
        refreshedProducts.length
    ) {

        /* -----------------------------------------------
           EXACT
        ----------------------------------------------- */

        product =
            refreshedProducts.find(
                function (item) {

                    return (
                        String(
                            item.name || ""
                        )
                        .trim()
                        .toLowerCase() ===
                        cleanName
                    );

                }
            );


        if (product) {

            return product;

        }


        /* -----------------------------------------------
           NORMALIZED
        ----------------------------------------------- */

        product =
            refreshedProducts.find(
                function (item) {

                    const databaseName =
                        normalizeProductName(
                            item.name
                        );


                    return (
                        databaseName ===
                        normalizedHomeName
                    );

                }
            );


        if (product) {

            return product;

        }


        /* -----------------------------------------------
           PRODUCT TYPE
        ----------------------------------------------- */

        if (productType) {

            product =
                refreshedProducts.find(
                    function (item) {

                        return String(
                            item.name || ""
                        )
                            .trim()
                            .toLowerCase()
                            .includes(
                                productType
                            );

                    }
                );


            if (product) {

                return product;

            }

        }

    }


    return null;

}


/* =========================================================
   FIND PRODUCT VARIANT
========================================================= */

function findHomepageVariant(
    product,
    requestedWeight
) {

    if (
        !product ||
        !Array.isArray(
            product.variants
        ) ||
        !product.variants.length
    ) {

        return null;

    }


    const cleanWeight =
        String(
            requestedWeight || ""
        )
        .trim()
        .toLowerCase();


    /* =====================================================
       EXACT VARIANT MATCH
    ===================================================== */

    if (cleanWeight) {

        let variant =
            product.variants.find(
                function (item) {

                    const variantName =
                        String(
                            item.name ||
                            item.size ||
                            item.weight ||
                            ""
                        )
                        .trim()
                        .toLowerCase();


                    return (
                        variantName ===
                        cleanWeight
                    );

                }
            );


        if (variant) {

            return variant;

        }


        /* ================================================
           NORMALIZED WEIGHT MATCH
        ================================================ */

        const normalizedWeight =
            normalizeProductName(
                requestedWeight
            );


        variant =
            product.variants.find(
                function (item) {

                    const variantName =
                        normalizeProductName(
                            item.name ||
                            item.size ||
                            item.weight ||
                            ""
                        );


                    return (
                        variantName ===
                        normalizedWeight
                    );

                }
            );


        if (variant) {

            return variant;

        }


        /* ================================================
           PARTIAL WEIGHT MATCH
        ================================================ */

        variant =
            product.variants.find(
                function (item) {

                    const variantName =
                        normalizeProductName(
                            item.name ||
                            item.size ||
                            item.weight ||
                            ""
                        );


                    return (
                        variantName.includes(
                            normalizedWeight
                        ) ||
                        normalizedWeight.includes(
                            variantName
                        )
                    );

                }
            );


        if (variant) {

            return variant;

        }

    }


    /* =====================================================
       FALLBACK TO FIRST VARIANT
    ===================================================== */

    return (
        product.variants[0] ||
        null
    );

}


/* =========================================================
   SETUP HOMEPAGE CART
========================================================= */

async function setupHomepageCart() {

    const buttons =
        document.querySelectorAll(
            ".add-to-cart, [data-action='add-to-cart']"
        );


    console.log(
        "Homepage Add To Cart buttons found:",
        buttons.length
    );


    if (!buttons.length) {

        return;

    }


    /* =====================================================
       LOAD PRODUCTS
    ===================================================== */

    await loadHomepageDatabaseProducts();


    /* =====================================================
       ATTACH CLICK EVENTS
    ===================================================== */

    buttons.forEach(
        function (button) {

            if (
                button.dataset.homeCartReady ===
                "true"
            ) {

                return;

            }


            button.dataset.homeCartReady =
                "true";


            button.addEventListener(
                "click",
                handleHomepageAddToCart
            );

        }
    );

}


/* =========================================================
   HANDLE HOMEPAGE ADD TO CART
========================================================= */

async function handleHomepageAddToCart(
    event
) {

    event.preventDefault();

    event.stopPropagation();


    const button =
        event.currentTarget;


    /* =====================================================
       GET PRODUCT NAME
    ===================================================== */

    let productName =
        (
            button.dataset.name ||
            button.getAttribute(
                "data-product-name"
            ) ||
            ""
        )
        .trim();


    /* =====================================================
       FALLBACK PRODUCT NAME
       -----------------------------------------------------
       If HTML does not contain data-name, try nearby
       product card information.
    ===================================================== */

    if (!productName) {

        const card =
            button.closest(
                ".product-card, .product-item, .slide"
            );


        if (card) {

            const nameElement =
                card.querySelector(
                    ".product-name, .product-title, h2, h3, h4"
                );


            if (nameElement) {

                productName =
                    nameElement.textContent
                        .trim();

            }

        }

    }


    /* =====================================================
       GET WEIGHT
    ===================================================== */

    const productWeight =
        (
            button.dataset.weight ||
            button.getAttribute(
                "data-size"
            ) ||
            button.getAttribute(
                "data-weight"
            ) ||
            ""
        )
        .trim();


    console.log(
        "Homepage product selected:",
        productName,
        productWeight
    );


    if (!productName) {

        console.error(
            "Product name is missing from Add To Cart button."
        );


        alert(
            "Unable to identify this product."
        );


        return;

    }


    /* =====================================================
       FIND DATABASE PRODUCT
    ===================================================== */

    const homepageProduct =
        await findHomepageProduct(
            productName
        );


    if (!homepageProduct) {

        console.error(
            "Homepage product was not found in database:",
            productName
        );


        alert(
            `${productName} is not available in the database yet.`
        );


        return;

    }


    /* =====================================================
       PRODUCT ID
    ===================================================== */

    const productId =
        Number(
            homepageProduct.id
        );


    if (!productId) {

        console.error(
            "Invalid database product ID:",
            homepageProduct
        );


        alert(
            "This product has an invalid database ID."
        );


        return;

    }


    /* =====================================================
       FIND VARIANT
    ===================================================== */

    const selectedVariant =
        findHomepageVariant(
            homepageProduct,
            productWeight
        );


    let variantId = null;


    if (selectedVariant) {

        variantId =
            Number(
                selectedVariant.id
            ) || null;

    }


    console.log(
        "Homepage database product:",
        {
            productId:
                productId,

            variantId:
                variantId,

            productName:
                homepageProduct.name,

            requestedWeight:
                productWeight,

            selectedVariant:
                selectedVariant
        }
    );


    /* =====================================================
       SAVE ORIGINAL BUTTON
    ===================================================== */

    const originalHTML =
        button.innerHTML;


    button.disabled =
        true;


    button.classList.add(
        "adding-to-cart"
    );


    button.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';


    try {

        /* =================================================
           GET CART TOKEN
        ================================================= */

        const cartToken =
            getCartToken();


        /* =================================================
           CART DATA
        ================================================= */

        const cartData = {

            product_id:
                productId,

            quantity:
                1

        };


        if (variantId) {

            cartData.variant_id =
                variantId;

        }


        console.log(
            "Sending cart request:",
            cartData
        );


        /* =================================================
           SEND TO FLASK
        ================================================= */

        const response =
            await fetch(
                `${API_BASE_URL}/api/cart/items`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "X-Cart-Token":
                            cartToken

                    },

                    body:
                        JSON.stringify(
                            cartData
                        )

                }
            );


        /* =================================================
           READ RESPONSE
        ================================================= */

        let result = null;


        try {

            result =
                await response.json();

        }

        catch (jsonError) {

            console.error(
                "Cart API did not return valid JSON:",
                jsonError
            );

        }


        console.log(
            "Cart API response:",
            result
        );


        /* =================================================
           SERVER ERROR
        ================================================= */

        if (!response.ok) {

            throw new Error(
                result?.message ||
                result?.error ||
                `Cart server error (${response.status})`
            );

        }


        if (
            result &&
            result.success === false
        ) {

            throw new Error(
                result.message ||
                result.error ||
                "Unable to add product to cart."
            );

        }


        /* =================================================
           UPDATE CART BADGE
        ================================================= */

        await updateCartCount();


        /* =================================================
           SUCCESS BUTTON
        ================================================= */

        button.classList.remove(
            "adding-to-cart"
        );


        button.classList.add(
            "cart-added"
        );


        button.innerHTML =
            '<i class="fa-solid fa-check"></i> Added to Cart';


        console.log(
            "THE FRIENDS HERITAGE: Product added successfully.",
            {
                productId:
                    productId,

                variantId:
                    variantId,

                productName:
                    homepageProduct.name
            }
        );


        /* =================================================
           RESTORE BUTTON
        ================================================= */

        setTimeout(
            function () {

                button.innerHTML =
                    originalHTML;


                button.disabled =
                    false;


                button.classList.remove(
                    "cart-added"
                );

            },
            1500
        );

    }

    catch (error) {

        console.error(
            "THE FRIENDS HERITAGE Add To Cart ERROR:",
            error
        );


        button.innerHTML =
            originalHTML;


        button.disabled =
            false;


        button.classList.remove(
            "adding-to-cart"
        );


        alert(
            error.message ||
            "Something went wrong while adding the product."
        );

    }

}


/* =========================================================
   UPDATE CART BADGE
========================================================= */

async function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (!cartCount) {

        return;

    }


    try {

        const cartToken =
            getCartToken();


        const response =
            await fetch(
                `${API_BASE_URL}/api/cart`,
                {
                    method: "GET",

                    headers: {

                        "X-Cart-Token":
                            cartToken

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                `Unable to load cart (${response.status})`
            );

        }


        const result =
            await response.json();


        console.log(
            "Cart badge response:",
            result
        );


        let items = [];


        /* =================================================
           POSSIBLE RESPONSE FORMATS
        ================================================= */

        if (
            result &&
            Array.isArray(
                result.items
            )
        ) {

            items =
                result.items;

        }

        else if (
            result &&
            result.cart &&
            Array.isArray(
                result.cart.items
            )
        ) {

            items =
                result.cart.items;

        }

        else if (
            result &&
            result.data &&
            Array.isArray(
                result.data.items
            )
        ) {

            items =
                result.data.items;

        }


        /* =================================================
           TOTAL QUANTITY
        ================================================= */

        let totalQuantity = 0;


        items.forEach(
            function (item) {

                totalQuantity +=
                    Number(
                        item.quantity || 0
                    );

            }
        );


        cartCount.textContent =
            totalQuantity;

    }

    catch (error) {

        console.error(
            "Cart badge error:",
            error
        );


        cartCount.textContent =
            "0";

    }

}


/* =========================================================
   REFRESH CART BADGE WHEN PAGE BECOMES VISIBLE
========================================================= */

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            updateCartCount();

        }

    }
);


/* =========================================================
   SOCIAL APP LINKS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const appLinks =
            document.querySelectorAll(
                ".app-link"
            );


        if (!appLinks.length) {

            return;

        }


        appLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        const app =
                            link.dataset.app;


                        const androidStore =
                            link.dataset.androidStore;


                        const iosStore =
                            link.dataset.iosStore;


                        /* =================================
                           INSTAGRAM
                        ================================= */

                        if (
                            app ===
                            "instagram"
                        ) {

                            const instagramWeb =
                                link.href ||
                                "https://www.instagram.com/";


                            const instagramApp =
                                "instagram://";


                            openSocialApp(
                                instagramApp,
                                instagramWeb,
                                androidStore,
                                iosStore
                            );

                        }


                        /* =================================
                           FACEBOOK
                        ================================= */

                        else if (
                            app ===
                            "facebook"
                        ) {

                            const facebookWeb =
                                link.href ||
                                "https://www.facebook.com/";


                            const facebookApp =
                                "fb://facewebmodal/f?href=" +
                                encodeURIComponent(
                                    facebookWeb
                                );


                            openSocialApp(
                                facebookApp,
                                facebookWeb,
                                androidStore,
                                iosStore
                            );

                        }


                        /* =================================
                           WHATSAPP
                        ================================= */

                        else if (
                            app ===
                            "whatsapp"
                        ) {

                            const whatsappNumber =
                                "917051713047";


                            const whatsappWeb =
                                "https://wa.me/" +
                                whatsappNumber;


                            const whatsappApp =
                                "whatsapp://send?phone=" +
                                whatsappNumber;


                            openSocialApp(
                                whatsappApp,
                                whatsappWeb,
                                androidStore,
                                iosStore
                            );

                        }

                    }
                );

            }
        );


        /* =================================================
           OPEN SOCIAL APP
        ================================================= */

        function openSocialApp(
            appUrl,
            webUrl,
            androidStore,
            iosStore
        ) {

            const userAgent =
                navigator.userAgent ||
                navigator.vendor ||
                window.opera;


            /* =============================================
               ANDROID
            ============================================= */

            if (
                /android/i.test(
                    userAgent
                )
            ) {

                window.location.href =
                    appUrl;


                setTimeout(
                    function () {

                        if (
                            androidStore
                        ) {

                            window.location.href =
                                androidStore;

                        }

                    },
                    1500
                );


                return;

            }


            /* =============================================
               IOS
            ============================================= */

            if (
                /iPad|iPhone|iPod/.test(
                    userAgent
                ) &&
                !window.MSStream
            ) {

                window.location.href =
                    appUrl;


                setTimeout(
                    function () {

                        if (
                            iosStore
                        ) {

                            window.location.href =
                                iosStore;

                        }

                    },
                    1500
                );


                return;

            }


            /* =============================================
               DESKTOP
            ============================================= */

            window.open(
                webUrl,
                "_blank",
                "noopener,noreferrer"
            );

        }

    }
);


/* =========================================================
   INITIALIZE HOMEPAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupHomepageCart();

        updateCartCount();

    }
);


/* =========================================================
   FINAL MESSAGE
========================================================= */

console.log(
    "The Friends Heritage Main Script loaded successfully."
);

