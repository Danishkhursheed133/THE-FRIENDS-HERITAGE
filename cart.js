/* =========================================================
   friendsHeritageCart
========================================================= */


document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       GET CART FROM LOCAL STORAGE
    ===================================================== */

    let cart =
        JSON.parse(
            localStorage.getItem("friendsHeritageCart")
        ) || [];


    /* =====================================================
       PAGE ELEMENTS
    ===================================================== */

    const cartItemsContainer =
        document.getElementById("cartItems");

    const cartItemsCount =
        document.getElementById("cartItemsCount");

    const cartSubtotal =
        document.getElementById("cartSubtotal");

    const deliveryCharge =
        document.getElementById("deliveryCharge");

    const cartTotal =
        document.getElementById("cartTotal");

    const emptyCart =
        document.getElementById("emptyCart");

    const checkoutBtn =
        document.getElementById("checkoutBtn");


    /* =====================================================
       DELIVERY CHARGE
    ===================================================== */

    const DELIVERY_CHARGE = 60;


    /* =====================================================
       SAVE CART
    ===================================================== */

    function saveCart() {

        localStorage.setItem(
            "friendsHeritageCart",
            JSON.stringify(cart)
        );

    }


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(price) {

        return `₹${Number(price || 0).toLocaleString("en-IN")}`;

    }


    /* =====================================================
       ESCAPE HTML
       Prevents product data from breaking the HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       UPDATE CART BADGE
    ===================================================== */

    function updateCartBadge() {

        const cartCountElements =
            document.querySelectorAll(
                ".cart-count, #cartCount"
            );


        const totalQuantity =
            cart.reduce(
                (total, item) => {

                    return (
                        total +
                        Number(item.quantity || 0)
                    );

                },
                0
            );


        cartCountElements.forEach(element => {

            element.textContent =
                totalQuantity;

        });

    }


    /* =====================================================
       GET PRODUCT VARIANT
    ===================================================== */

    function getVariant(item) {

        return (
            item.variant ||
            item.size ||
            item.weight ||
            ""
        );

    }


    /* =====================================================
       GET ORIGINAL / OLD PRICE
    ===================================================== */

    function getOldPrice(item) {

        const oldPrice =
            Number(item.oldPrice || 0);

        const currentPrice =
            Number(item.price || 0);


        /*
           Only show original price when it is
           actually higher than the selling price.
        */

        if (
            oldPrice > currentPrice &&
            currentPrice > 0
        ) {

            return oldPrice;

        }


        return 0;

    }


    /* =====================================================
       DISPLAY CART
    ===================================================== */

    function displayCart() {


        /* =================================================
           SAFETY CHECK
        ================================================= */

        if (!cartItemsContainer) {

            updateCartBadge();

            return;

        }


        /* =================================================
           EMPTY CART
        ================================================= */

        if (cart.length === 0) {

            cartItemsContainer.innerHTML = "";


            if (emptyCart) {

                emptyCart.style.display =
                    "block";

            }


            if (cartItemsCount) {

                cartItemsCount.textContent =
                    "0 Items";

            }


            updateCartTotals();

            updateCartBadge();

            return;

        }


        /* =================================================
           HIDE EMPTY CART MESSAGE
        ================================================= */

        if (emptyCart) {

            emptyCart.style.display =
                "none";

        }


        /* =================================================
           CREATE CART ITEMS
        ================================================= */

        cartItemsContainer.innerHTML =
            cart.map(
                (item, index) => {


                    /* -------------------------------------
                       PRODUCT DATA
                    ------------------------------------- */

                    const price =
                        Number(item.price) || 0;


                    const oldPrice =
                        getOldPrice(item);


                    const quantity =
                        Number(item.quantity) || 1;


                    const itemTotal =
                        price * quantity;


                    const variant =
                        getVariant(item);


                    const productName =
                        escapeHTML(
                            item.name ||
                            "Product"
                        );


                    const productImage =
                        escapeHTML(
                            item.image ||
                            "logo.png"
                        );


                    const safeVariant =
                        escapeHTML(
                            variant
                        );


                    /* -------------------------------------
                       CART ITEM HTML
                    ------------------------------------- */

                    return `

                        <div
                            class="cart-item"
                            data-index="${index}"
                        >


                            <!-- PRODUCT IMAGE -->

                            <div class="cart-product-image">

                                <img
                                    src="${productImage}"
                                    alt="${productName}"
                                >

                            </div>


                            <!-- PRODUCT INFORMATION -->

                            <div class="cart-product-info">

                                <h3>
                                    ${productName}
                                </h3>


                                ${
                                    variant
                                    ? `

                                        <p class="cart-product-details">
                                            Size: ${safeVariant}
                                        </p>

                                    `
                                    : ""
                                }


                                <!-- CURRENT + OLD PRICE -->

                                <p class="cart-product-price">


                                    <span class="cart-current-price">
                                        ${formatPrice(price)}
                                    </span>


                                    ${
                                        oldPrice
                                        ? `

                                            <span class="cart-old-price">
                                                ${formatPrice(oldPrice)}
                                            </span>

                                        `
                                        : ""
                                    }


                                </p>


                            </div>


                            <!-- CART ACTIONS -->

                            <div class="cart-item-actions">


                                <!-- ITEM TOTAL -->

                                <div class="cart-item-price">

                                    ${formatPrice(itemTotal)}

                                </div>


                                <!-- QUANTITY CONTROL -->

                                <div class="quantity-control">


                                    <button
                                        type="button"
                                        class="decrease-btn"
                                        data-index="${index}"
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>


                                    <span>
                                        ${quantity}
                                    </span>


                                    <button
                                        type="button"
                                        class="increase-btn"
                                        data-index="${index}"
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>


                                </div>


                                <!-- REMOVE BUTTON -->

                                <button
                                    type="button"
                                    class="remove-item"
                                    data-index="${index}"
                                    aria-label="Remove ${productName}"
                                >

                                    <i class="fa-solid fa-trash"></i>

                                </button>


                            </div>


                        </div>

                    `;

                }
            ).join("");


        /* =================================================
           TOTAL QUANTITY
        ================================================= */

        const totalQuantity =
            cart.reduce(
                (total, item) => {

                    return (
                        total +
                        Number(item.quantity || 0)
                    );

                },
                0
            );


        if (cartItemsCount) {

            cartItemsCount.textContent =
                totalQuantity === 1
                    ? "1 Item"
                    : `${totalQuantity} Items`;

        }


        /* =================================================
           ADD BUTTON EVENTS
        ================================================= */

        addCartButtonEvents();


        /* =================================================
           UPDATE TOTALS
        ================================================= */

        updateCartTotals();


        /* =================================================
           UPDATE BADGE
        ================================================= */

        updateCartBadge();

    }


    /* =====================================================
       CART BUTTON EVENTS
    ===================================================== */

    function addCartButtonEvents() {


        /* =================================================
           INCREASE QUANTITY
        ================================================= */

        document
            .querySelectorAll(".increase-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {


                        const index =
                            Number(
                                button.dataset.index
                            );


                        if (!cart[index]) {

                            return;

                        }


                        cart[index].quantity =
                            Number(
                                cart[index].quantity || 0
                            ) + 1;


                        saveCart();

                        displayCart();

                    }
                );

            });


        /* =================================================
           DECREASE QUANTITY
        ================================================= */

        document
            .querySelectorAll(".decrease-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {


                        const index =
                            Number(
                                button.dataset.index
                            );


                        if (!cart[index]) {

                            return;

                        }


                        const currentQuantity =
                            Number(
                                cart[index].quantity || 1
                            );


                        if (currentQuantity > 1) {

                            cart[index].quantity =
                                currentQuantity - 1;

                        } else {

                            cart.splice(
                                index,
                                1
                            );

                        }


                        saveCart();

                        displayCart();

                    }
                );

            });


        /* =================================================
           REMOVE PRODUCT
        ================================================= */

        document
            .querySelectorAll(".remove-item")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {


                        const index =
                            Number(
                                button.dataset.index
                            );


                        if (!cart[index]) {

                            return;

                        }


                        cart.splice(
                            index,
                            1
                        );


                        saveCart();

                        displayCart();

                    }
                );

            });

    }


    /* =====================================================
       UPDATE CART TOTALS
    ===================================================== */

    function updateCartTotals() {


        let subtotal = 0;


        /* =================================================
           CALCULATE SUBTOTAL
        ================================================= */

        cart.forEach(item => {

            const price =
                Number(item.price) || 0;


            const quantity =
                Number(item.quantity) || 0;


            subtotal +=
                price * quantity;

        });


        /* =================================================
           DELIVERY
        ================================================= */

        const delivery =
            cart.length > 0
                ? DELIVERY_CHARGE
                : 0;


        /* =================================================
           FINAL TOTAL
        ================================================= */

        const total =
            subtotal + delivery;


        /* =================================================
           DISPLAY SUBTOTAL
        ================================================= */

        if (cartSubtotal) {

            cartSubtotal.textContent =
                formatPrice(subtotal);

        }


        /* =================================================
           DISPLAY DELIVERY
        ================================================= */

        if (deliveryCharge) {

            deliveryCharge.textContent =
                formatPrice(delivery);

        }


        /* =================================================
           DISPLAY FINAL TOTAL
        ================================================= */

        if (cartTotal) {

            cartTotal.textContent =
                formatPrice(total);

        }


        /* =================================================
           CHECKOUT BUTTON STATE
        ================================================= */

        if (checkoutBtn) {


            if (cart.length === 0) {

                checkoutBtn.classList.add(
                    "disabled"
                );


                checkoutBtn.setAttribute(
                    "aria-disabled",
                    "true"
                );

            } else {

                checkoutBtn.classList.remove(
                    "disabled"
                );


                checkoutBtn.removeAttribute(
                    "aria-disabled"
                );

            }

        }

    }


    /* =====================================================
       CHECKOUT BUTTON
    ===================================================== */

    if (checkoutBtn) {

        checkoutBtn.addEventListener(
            "click",
            function (event) {


                /* -----------------------------------------
                   PREVENT EMPTY CART CHECKOUT
                ----------------------------------------- */

                if (cart.length === 0) {

                    event.preventDefault();


                    alert(
                        "Your cart is empty. Please add a product before proceeding to checkout."
                    );


                    return;

                }


                /* -----------------------------------------
                   SAVE CART BEFORE CHECKOUT
                ----------------------------------------- */

                saveCart();


                /* -----------------------------------------
                   GO TO CHECKOUT PAGE
                ----------------------------------------- */

                window.location.href =
                    "checkout.html";

            }
        );

    }


    /* =====================================================
       INITIAL CART DISPLAY
    ===================================================== */

    displayCart();


    /* =====================================================
       INITIAL CART BADGE
    ===================================================== */

    updateCartBadge();


});


/* =========================================================
   END OF CART.JS
========================================================= */