/* =========================================================
   THE FRIENDS HERITAGE
   SHOPPING CART PAGE
   CART.JS
   ---------------------------------------------------------
   CART DATA  : SQLITE DATABASE
   CART TOKEN : LOCAL STORAGE
   STOCK      : DISABLED
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const API_BASE_URL = window.location.origin;

    const CART_TOKEN_KEY =
        "friendsHeritageCartToken";


    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const cartCount =
        document.getElementById("cartCount");

    const cartItemsCount =
        document.getElementById("cartItemsCount");

    const cartItems =
        document.getElementById("cartItems");

    const emptyCart =
        document.getElementById("emptyCart");

    const cartSubtotal =
        document.getElementById("cartSubtotal");

    const cartTotal =
        document.getElementById("cartTotal");

    const checkoutBtn =
        document.getElementById("checkoutBtn");


    /* =====================================================
       GET / CREATE CART TOKEN
    ===================================================== */

    function getCartToken() {

        let token =
            localStorage.getItem(
                CART_TOKEN_KEY
            );

        if (!token) {

            if (
                window.crypto &&
                typeof window.crypto.randomUUID ===
                    "function"
            ) {

                token =
                    "cart_" +
                    window.crypto.randomUUID();

            } else {

                token =
                    "cart_" +
                    Date.now() +
                    "_" +
                    Math.random()
                        .toString(36)
                        .substring(2, 15);
            }

            localStorage.setItem(
                CART_TOKEN_KEY,
                token
            );
        }

        return token;
    }


    /* =====================================================
       API HEADERS
    ===================================================== */

    function getCartHeaders() {

        return {
            "Content-Type":
                "application/json",

            "X-Cart-Token":
                getCartToken()
        };
    }


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(value) {

        const number =
            Number(value || 0);

        return (
            "₹" +
            number.toLocaleString("en-IN")
        );
    }


    /* =====================================================
       IMAGE PATH
    ===================================================== */

    function getImagePath(image) {

        if (!image) {
            return "/logo.png";
        }

        let imagePath =
            String(image).trim();


        /* -------------------------------------------------
           DATA URL
        ------------------------------------------------- */

        if (
            imagePath.startsWith(
                "data:image/"
            )
        ) {
            return imagePath;
        }


        /* -------------------------------------------------
           IF IMAGE FIELD CONTAINS <img>
        ------------------------------------------------- */

        if (
            imagePath
                .toLowerCase()
                .includes("<img")
        ) {

            const match =
                imagePath.match(
                    /src\s*=\s*["']([^"']+)["']/i
                );

            if (
                match &&
                match[1]
            ) {

                imagePath =
                    match[1].trim();
            }
        }


        /* -------------------------------------------------
           REMOVE QUOTES
        ------------------------------------------------- */

        imagePath =
            imagePath
                .replace(
                    /^["']|["']$/g,
                    ""
                )
                .trim();


        /* -------------------------------------------------
           HTML ENTITY CLEANUP
        ------------------------------------------------- */

        imagePath =
            imagePath
                .replace(
                    /&amp;/gi,
                    "&"
                )
                .replace(
                    /&quot;/gi,
                    '"'
                )
                .replace(
                    /&#039;/gi,
                    "'"
                );


        /* -------------------------------------------------
           EXTERNAL IMAGE
        ------------------------------------------------- */

        if (
            imagePath.startsWith(
                "http://"
            ) ||
            imagePath.startsWith(
                "https://"
            )
        ) {
            return imagePath;
        }


        /* -------------------------------------------------
           LOCAL ABSOLUTE IMAGE
        ------------------------------------------------- */

        if (
            imagePath.startsWith("/")
        ) {
            return imagePath;
        }


        /* -------------------------------------------------
           WINDOWS BACKSLASH
        ------------------------------------------------- */

        imagePath =
            imagePath.replace(
                /\\/g,
                "/"
            );


        /* -------------------------------------------------
           REMOVE ./ 
        ------------------------------------------------- */

        imagePath =
            imagePath.replace(
                /^\.\//,
                ""
            );


        /* -------------------------------------------------
           REMOVE LEADING /
        ------------------------------------------------- */

        imagePath =
            imagePath.replace(
                /^\/+/,
                ""
            );


        return "/" + imagePath;
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* =====================================================
       ESCAPE ATTRIBUTE
    ===================================================== */

    function escapeAttribute(value) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            );
    }


    /* =====================================================
       GET CART DATA
       -----------------------------------------------------
       IMPORTANT:
       Backend returns:

       {
           success: true,
           cart: {
               items: [],
               subtotal: 0,
               total: 0
           }
       }
    ===================================================== */

    async function getCartData() {

        const response =
            await fetch(
                `${API_BASE_URL}/api/cart`,
                {
                    method: "GET",

                    headers: {
                        "X-Cart-Token":
                            getCartToken()
                    },

                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        console.log(
            "FRIENDS HERITAGE CART RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load cart."
            );
        }


        /*
         * IMPORTANT FIX
         *
         * Backend response:
         *
         * data.cart.items
         *
         * NOT:
         *
         * data.items
         */

        return (
            data.cart ||
            data
        );
    }


    /* =====================================================
       LOAD CART
    ===================================================== */

    async function loadCart() {

        try {

            const token =
                getCartToken();


            console.log(
                "FRIENDS HERITAGE CART TOKEN:",
                token
            );


            const cart =
                await getCartData();


            console.log(
                "FRIENDS HERITAGE CART DATA:",
                cart
            );


            renderCart(cart);

        } catch (error) {

            console.error(
                "CART LOAD ERROR:",
                error
            );

            showCartError();
        }
    }


    /* =====================================================
       RENDER CART
    ===================================================== */

    function renderCart(cart) {

        /*
         * Backend returns:
         *
         * cart.items
         */

        const items =
            Array.isArray(
                cart.items
            )
                ? cart.items
                : [];


        console.log(
            "CART ITEMS:",
            items
        );


        /* =================================================
           EMPTY CART
        ================================================= */

        if (items.length === 0) {

            if (cartItems) {

                cartItems.innerHTML =
                    "";
            }


            if (emptyCart) {

                emptyCart.style.display =
                    "";
            }


            updateSummary(
                0,
                0,
                0
            );

            return;
        }


        /* =================================================
           PRODUCTS EXIST
        ================================================= */

        if (emptyCart) {

            emptyCart.style.display =
                "none";
        }


        if (cartItems) {

            cartItems.innerHTML =
                items
                    .map(
                        item =>
                            createCartItem(
                                item
                            )
                    )
                    .join("");
        }


        /* =================================================
           SUBTOTAL
        ================================================= */

        const subtotal =
            Number(
                cart.subtotal || 0
            );


        /* =================================================
           TOTAL
        ================================================= */

        const total =
            Number(
                cart.total ??
                subtotal
            );


        /* =================================================
           TOTAL QUANTITY
        ================================================= */

        const itemCount =
            items.reduce(
                (
                    sum,
                    item
                ) => {

                    return (
                        sum +
                        Number(
                            item.quantity || 0
                        )
                    );

                },
                0
            );


        updateSummary(
            subtotal,
            total,
            itemCount
        );
    }


    /* =====================================================
       CREATE CART ITEM
    ===================================================== */

    function createCartItem(item) {

        /* -------------------------------------------------
           IMAGE
        ------------------------------------------------- */

        const imagePath =
            getImagePath(
                item.image
            );

        const safeImage =
            escapeAttribute(
                imagePath
            );


        /* -------------------------------------------------
           PRODUCT NAME
        ------------------------------------------------- */

        const productName =
            escapeHTML(
                item.product_name ||
                item.name ||
                "Product"
            );


        /* -------------------------------------------------
           VARIANT / SIZE
        ------------------------------------------------- */

        const variant =
            item.variant
                ? escapeHTML(
                    item.variant
                )
                : "";


        /* -------------------------------------------------
           PRICE
        ------------------------------------------------- */

        const price =
            Number(
                item.price || 0
            );


        /* -------------------------------------------------
           ORIGINAL PRICE
        ------------------------------------------------- */

        const originalPrice =
            Number(
                item.original_price || 0
            );


        /* -------------------------------------------------
           QUANTITY
        ------------------------------------------------- */

        const quantity =
            Number(
                item.quantity || 1
            );


        /* -------------------------------------------------
           ITEM TOTAL
        ------------------------------------------------- */

        const itemTotal =
            price * quantity;


        console.log(
            "CART PRODUCT:",
            productName
        );

        console.log(
            "CART IMAGE:",
            item.image
        );

        console.log(
            "CART IMAGE PATH:",
            imagePath
        );


        /* =================================================
           PRICE HTML
        ================================================= */

        let priceHTML = `
            <span class="cart-sale-price">
                ${formatPrice(price)}
            </span>
        `;


        if (
            originalPrice > price
        ) {

            priceHTML += `
                <span class="cart-original-price">
                    ${formatPrice(originalPrice)}
                </span>
            `;
        }


        /* =================================================
           CART ITEM HTML
        ================================================= */

        return `

            <div
                class="cart-item"
                data-cart-item-id="${escapeAttribute(item.id)}"
            >

                <!-- =====================================
                     PRODUCT IMAGE
                ====================================== -->

                <div class="cart-product-image">

                    <img
                        src="${safeImage}"
                        alt="${productName}"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='/logo.png';"
                    >

                </div>


                <!-- =====================================
                     PRODUCT INFORMATION
                ====================================== -->

                <div class="cart-product-info">

                    <h3>
                        ${productName}
                    </h3>

                    <p>
                        Premium Kashmir Product
                    </p>

                    <div class="cart-product-details">

                        ${
                            variant
                                ? `
                                    <span>
                                        ${variant}
                                    </span>
                                `
                                : ""
                        }

                        <span>
                            The Friends Heritage
                        </span>

                    </div>

                </div>


                <!-- =====================================
                     RIGHT SIDE ACTIONS
                ====================================== -->

                <div class="cart-item-actions">


                    <!-- PRICE -->

                    <div class="cart-item-price">

                        ${priceHTML}

                    </div>


                    <!-- ITEM TOTAL -->

                    <div class="cart-item-total">

                        ${formatPrice(itemTotal)}

                    </div>


                    <!-- QUANTITY -->

                    <div class="quantity-control">

                        <button
                            type="button"
                            data-action="decrease"
                            data-id="${escapeAttribute(item.id)}"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>


                        <span>
                            ${quantity}
                        </span>


                        <button
                            type="button"
                            data-action="increase"
                            data-id="${escapeAttribute(item.id)}"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>


                    <!-- REMOVE -->

                    <button
                        type="button"
                        class="remove-item"
                        data-action="remove"
                        data-id="${escapeAttribute(item.id)}"
                        aria-label="Remove product"
                        title="Remove product"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>
        `;
    }


    /* =====================================================
       CART CLICK HANDLER
    ===================================================== */

    if (cartItems) {

        cartItems.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        "button"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.action;


                const itemId =
                    button.dataset.id;


                if (!itemId) {
                    return;
                }


                /* -----------------------------------------
                   INCREASE
                ----------------------------------------- */

                if (
                    action ===
                    "increase"
                ) {

                    await changeQuantity(
                        itemId,
                        1
                    );

                    return;
                }


                /* -----------------------------------------
                   DECREASE
                ----------------------------------------- */

                if (
                    action ===
                    "decrease"
                ) {

                    await changeQuantity(
                        itemId,
                        -1
                    );

                    return;
                }


                /* -----------------------------------------
                   REMOVE
                ----------------------------------------- */

                if (
                    action ===
                    "remove"
                ) {

                    await removeCartItem(
                        itemId
                    );

                    return;
                }

            }
        );
    }


    /* =====================================================
       CHANGE QUANTITY
       -----------------------------------------------------
       NO STOCK LIMIT
    ===================================================== */

    async function changeQuantity(
        itemId,
        change
    ) {

        try {

            const currentCart =
                await getCartData();


            const items =
                Array.isArray(
                    currentCart.items
                )
                    ? currentCart.items
                    : [];


            const item =
                items.find(
                    product =>
                        String(
                            product.id
                        ) ===
                        String(itemId)
                );


            if (!item) {

                console.error(
                    "Cart item not found:",
                    itemId
                );

                return;
            }


            const newQuantity =
                Number(
                    item.quantity
                ) +
                Number(change);


            /* -----------------------------------------
               ZERO = REMOVE
            ----------------------------------------- */

            if (
                newQuantity <= 0
            ) {

                await removeCartItem(
                    itemId
                );

                return;
            }


            /* -----------------------------------------
               UPDATE SQLITE CART
            ----------------------------------------- */

            const response =
                await fetch(
                    `${API_BASE_URL}/api/cart/${itemId}`,
                    {
                        method: "PUT",

                        headers:
                            getCartHeaders(),

                        body:
                            JSON.stringify({
                                quantity:
                                    newQuantity
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to update quantity."
                );
            }


            await loadCart();

        } catch (error) {

            console.error(
                "QUANTITY UPDATE ERROR:",
                error
            );
        }
    }


    /* =====================================================
       REMOVE CART ITEM
    ===================================================== */

    async function removeCartItem(
        itemId
    ) {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/cart/${itemId}`,
                    {
                        method: "DELETE",

                        headers:
                            getCartHeaders()
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to remove item."
                );
            }


            await loadCart();

        } catch (error) {

            console.error(
                "REMOVE CART ITEM ERROR:",
                error
            );
        }
    }


    /* =====================================================
       UPDATE SUMMARY
    ===================================================== */

    function updateSummary(
        subtotal,
        total,
        itemCount = 0
    ) {

        /* -----------------------------------------------
           SUBTOTAL
        ------------------------------------------------ */

        if (cartSubtotal) {

            cartSubtotal.textContent =
                formatPrice(
                    subtotal
                );
        }


        /* -----------------------------------------------
           TOTAL
        ------------------------------------------------ */

        if (cartTotal) {

            cartTotal.textContent =
                formatPrice(
                    total
                );
        }


        /* -----------------------------------------------
           CART ITEM COUNT
        ------------------------------------------------ */

        if (cartItemsCount) {

            cartItemsCount.textContent =
                itemCount;
        }


        /* -----------------------------------------------
           NAVBAR CART COUNT
        ------------------------------------------------ */

        if (cartCount) {

            cartCount.textContent =
                itemCount;
        }


        /* -----------------------------------------------
           CHECKOUT BUTTON
        ------------------------------------------------ */

        if (checkoutBtn) {

            checkoutBtn.disabled =
                itemCount === 0;


            if (
                itemCount === 0
            ) {

                checkoutBtn.classList.add(
                    "disabled"
                );

            } else {

                checkoutBtn.classList.remove(
                    "disabled"
                );
            }
        }
    }


    /* =====================================================
       CART ERROR
    ===================================================== */

    function showCartError() {

        if (!cartItems) {
            return;
        }


        cartItems.innerHTML = `

            <div class="cart-error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    Unable to load your cart
                </h3>

                <p>
                    Please make sure the Friends Heritage
                    server is running and try again.
                </p>

                <button
                    type="button"
                    onclick="location.reload()"
                >
                    Try Again
                </button>

            </div>
        `;
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    console.log(
        "=========================================="
    );

    console.log(
        "THE FRIENDS HERITAGE CART"
    );

    console.log(
        "CART TOKEN:",
        getCartToken()
    );

    console.log(
        "STOCK SYSTEM: DISABLED"
    );

    console.log(
        "=========================================="
    );


    loadCart();

});