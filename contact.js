/* =========================================================
   THE FRIENDS HERITAGE
   CHECKOUT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const CART_STORAGE_KEY = "friendsHeritageCart";
    const USERS_STORAGE_KEY = "friendsHeritageUsers";
    const CURRENT_USER_KEY = "friendsHeritageCurrentUser";
    const LATEST_ORDER_KEY = "friendsHeritageLatestOrder";

    const BUSINESS_STATE = "Kashmir";

    const DELIVERY_CHARGES = {
        sameState: 100,
        otherState: 200
    };

    const WHATSAPP_NUMBER = "917051713047";

    const STORE_EMAIL = "danishrather041@gmail.com";

    const EMAILJS_SERVICE_ID = "service_whmjkcc";
    const EMAILJS_TEMPLATE_ID = "template_x7Kp92LmQ4Rt8Vn";


    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const fullNameInput =
        document.getElementById("fullName");

    const phoneInput =
        document.getElementById("phone");

    const emailInput =
        document.getElementById("email");

    const addressInput =
        document.getElementById("address");

    const cityInput =
        document.getElementById("city");

    const stateInput =
        document.getElementById("state");

    const pincodeInput =
        document.getElementById("pincode");

    const landmarkInput =
        document.getElementById("landmark");

    const orderNoteInput =
        document.getElementById("orderNote");

    const deliveryStatus =
        document.getElementById("deliveryStatus");

    const deliveryMessages =
        document.querySelectorAll(".delivery-message");

    const checkoutItems =
        document.getElementById("checkoutItems");

    const checkoutItemCount =
        document.getElementById("checkoutItemCount");

    const checkoutSubtotal =
        document.getElementById("checkoutSubtotal");

    const deliveryChargeElement =
        document.getElementById("deliveryCharge");

    const checkoutTotal =
        document.getElementById("checkoutTotal");

    const placeOrderBtn =
        document.getElementById("placeOrderBtn");

    const whatsappOrderBtn =
        document.getElementById("whatsappOrderBtn");

    const checkoutFormMessage =
        document.getElementById("checkoutFormMessage");

    const upiPaymentBox =
        document.getElementById("upiPaymentBox");


    /* =====================================================
       SAFETY CHECK
    ===================================================== */

    const requiredElements = [
        fullNameInput,
        phoneInput,
        emailInput,
        addressInput,
        cityInput,
        stateInput,
        pincodeInput,
        landmarkInput,
        orderNoteInput,
        deliveryStatus,
        checkoutItems,
        checkoutItemCount,
        checkoutSubtotal,
        deliveryChargeElement,
        checkoutTotal,
        placeOrderBtn,
        whatsappOrderBtn,
        checkoutFormMessage,
        upiPaymentBox
    ];

    if (requiredElements.some(function (element) {
        return !element;
    })) {

        console.error(
            "Checkout error: One or more required HTML elements are missing."
        );

        return;
    }


    /* =====================================================
       MONEY FORMAT
    ===================================================== */

    function formatCurrency(amount) {

        return "₹" +
            Number(amount || 0).toLocaleString("en-IN");
    }


    /* =====================================================
       GET CART
    ===================================================== */

    function getCart() {

        try {

            const savedCart =
                localStorage.getItem(
                    CART_STORAGE_KEY
                );

            if (!savedCart) {
                return [];
            }

            const parsedCart =
                JSON.parse(savedCart);

            return Array.isArray(parsedCart)
                ? parsedCart
                : [];

        } catch (error) {

            console.error(
                "Cart read error:",
                error
            );

            return [];
        }
    }


    /* =====================================================
       SAVE CART
    ===================================================== */

    function saveCart(cart) {

        try {

            localStorage.setItem(
                CART_STORAGE_KEY,
                JSON.stringify(cart)
            );

        } catch (error) {

            console.error(
                "Cart save error:",
                error
            );
        }
    }


    /* =====================================================
       PRODUCT HELPERS
    ===================================================== */

    function getProductName(item) {

        return (
            item.name ||
            item.productName ||
            item.title ||
            "Product"
        );
    }


    function getProductImage(item) {

        return (
            item.image ||
            item.productImage ||
            item.img ||
            "logo.png"
        );
    }


    function getProductPrice(item) {

        const price =
            item.price ??
            item.salePrice ??
            item.discountPrice ??
            item.originalPrice ??
            item.oldPrice ??
            item.mrp ??
            0;

        return Number(price) || 0;
    }


    function getProductOriginalPrice(item) {

        const originalPrice =
            item.originalPrice ??
            item.oldPrice ??
            item.mrp ??
            getProductPrice(item);

        return Number(originalPrice) || 0;
    }


    function getProductQuantity(item) {

        const quantity =
            Number(item.quantity) || 1;

        return quantity > 0
            ? quantity
            : 1;
    }


    function getProductVariant(item) {

        return (
            item.variant ||
            item.weight ||
            item.size ||
            ""
        );
    }


    /* =====================================================
       CALCULATE SUBTOTAL
    ===================================================== */

    function calculateSubtotal(cart) {

        return cart.reduce(
            function (total, item) {

                const price =
                    getProductPrice(item);

                const quantity =
                    getProductQuantity(item);

                return total +
                    (price * quantity);

            },
            0
        );
    }


    /* =====================================================
       GET DELIVERY CHARGE
    ===================================================== */

    function getDeliveryCharge() {

        const enteredState =
            stateInput.value
                .trim()
                .toLowerCase();

        if (!enteredState) {
            return 0;
        }

        const businessState =
            BUSINESS_STATE.toLowerCase();

        if (
            enteredState === businessState ||
            enteredState.includes(businessState) ||
            businessState.includes(enteredState)
        ) {

            return DELIVERY_CHARGES.sameState;
        }

        return DELIVERY_CHARGES.otherState;
    }


    /* =====================================================
       DELIVERY MESSAGE
    ===================================================== */

    function updateDeliveryMessage() {

        const state =
            stateInput.value.trim();

        const charge =
            getDeliveryCharge();

        deliveryMessages.forEach(
            function (message) {

                if (!state) {

                    message.textContent = "";

                    return;
                }

                message.textContent =
                    "Delivery charge: " +
                    formatCurrency(charge);
            }
        );
    }


    /* =====================================================
       UPDATE SUMMARY
    ===================================================== */

    function updateOrderSummary() {

        const cart =
            getCart();

        const subtotal =
            calculateSubtotal(cart);

        const deliveryCharge =
            getDeliveryCharge();

        const total =
            subtotal + deliveryCharge;


        checkoutSubtotal.textContent =
            formatCurrency(subtotal);

        deliveryChargeElement.textContent =
            formatCurrency(deliveryCharge);

        checkoutTotal.textContent =
            formatCurrency(total);


        updateDeliveryMessage();
    }


    /* =====================================================
       ESCAPE HTML
       Prevents product text from breaking markup.
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
       DISPLAY CART ITEMS
    ===================================================== */

    function displayCheckoutItems() {

        const cart =
            getCart();

        checkoutItems.innerHTML = "";

        let totalQuantity = 0;


        if (cart.length === 0) {

            checkoutItems.innerHTML = `
                <div class="checkout-empty">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <p>Your cart is empty.</p>
                </div>
            `;

            checkoutItemCount.textContent = "0";

            placeOrderBtn.disabled = true;
            whatsappOrderBtn.disabled = true;

            updateOrderSummary();

            return;
        }


        cart.forEach(
            function (item) {

                const name =
                    getProductName(item);

                const image =
                    getProductImage(item);

                const price =
                    getProductPrice(item);

                const originalPrice =
                    getProductOriginalPrice(item);

                const quantity =
                    getProductQuantity(item);

                const variant =
                    getProductVariant(item);


                totalQuantity += quantity;


                const itemElement =
                    document.createElement("div");

                itemElement.className =
                    "checkout-item";


                let originalPriceHTML = "";


                if (
                    originalPrice > price &&
                    originalPrice > 0
                ) {

                    originalPriceHTML = `
                        <span class="checkout-original-price">
                            ${formatCurrency(originalPrice)}
                        </span>
                    `;
                }


                itemElement.innerHTML = `

                    <div class="checkout-item-image">

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            onerror="this.src='logo.png'"
                        >

                    </div>


                    <div class="checkout-item-details">

                        <div class="checkout-item-name">
                            ${escapeHTML(name)}
                        </div>


                        ${
                            variant
                            ? `
                                <div class="checkout-item-variant">
                                    ${escapeHTML(variant)}
                                </div>
                            `
                            : ""
                        }


                        <div class="checkout-item-price">

                            ${formatCurrency(price)}

                            ${originalPriceHTML}

                        </div>

                    </div>


                    <div class="checkout-item-quantity">
                        × ${quantity}
                    </div>

                `;


                checkoutItems.appendChild(
                    itemElement
                );
            }
        );


        checkoutItemCount.textContent =
            totalQuantity;


        placeOrderBtn.disabled =
            false;

        whatsappOrderBtn.disabled =
            false;


        updateOrderSummary();
    }


    /* =====================================================
       SHOW MESSAGE
    ===================================================== */

    function showMessage(
        message,
        type = "error"
    ) {

        checkoutFormMessage.textContent =
            message;

        checkoutFormMessage.className =
            "checkout-form-message show " +
            type;

        checkoutFormMessage.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }


    /* =====================================================
       CLEAR MESSAGE
    ===================================================== */

    function clearMessage() {

        checkoutFormMessage.textContent =
            "";

        checkoutFormMessage.className =
            "checkout-form-message";
    }


    /* =====================================================
       VALIDATE MOBILE
    ===================================================== */

    function isValidPhone(phone) {

        return /^[6-9]\d{9}$/.test(
            phone
        );
    }


    /* =====================================================
       VALIDATE EMAIL
    ===================================================== */

    function isValidEmail(email) {

        if (!email) {
            return true;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );
    }


    /* =====================================================
       VALIDATE CHECKOUT
    ===================================================== */

    function validateCheckout() {

        const cart =
            getCart();


        if (cart.length === 0) {

            showMessage(
                "Your cart is empty. Please add products before placing an order."
            );

            return false;
        }


        const fullName =
            fullNameInput.value.trim();

        const phone =
            phoneInput.value.trim();

        const email =
            emailInput.value.trim();

        const address =
            addressInput.value.trim();

        const city =
            cityInput.value.trim();

        const state =
            stateInput.value.trim();

        const pincode =
            pincodeInput.value.trim();


        if (!fullName) {

            showMessage(
                "Please enter your full name."
            );

            fullNameInput.focus();

            return false;
        }


        if (!isValidPhone(phone)) {

            showMessage(
                "Please enter a valid 10-digit Indian mobile number."
            );

            phoneInput.focus();

            return false;
        }


        if (!isValidEmail(email)) {

            showMessage(
                "Please enter a valid email address."
            );

            emailInput.focus();

            return false;
        }


        if (!address) {

            showMessage(
                "Please enter your complete delivery address."
            );

            addressInput.focus();

            return false;
        }


        if (!city) {

            showMessage(
                "Please enter your town or city."
            );

            cityInput.focus();

            return false;
        }


        if (!state) {

            showMessage(
                "Please enter your state."
            );

            stateInput.focus();

            return false;
        }


        if (!/^\d{6}$/.test(pincode)) {

            showMessage(
                "Please enter a valid 6-digit PIN code."
            );

            pincodeInput.focus();

            return false;
        }


        return true;
    }


    /* =====================================================
       PAYMENT METHOD
    ===================================================== */

    function getPaymentMethod() {

        const selected =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            );

        return selected
            ? selected.value
            : "cod";
    }


    function getPaymentMethodName() {

        const method =
            getPaymentMethod();

        if (method === "online") {

            return "Online Payment / UPI";
        }

        return "Cash on Delivery";
    }


    /* =====================================================
       UPI SECTION
    ===================================================== */

    function updatePaymentDisplay() {

        const method =
            getPaymentMethod();


        if (method === "online") {

            upiPaymentBox.classList.remove(
                "hidden"
            );

        } else {

            upiPaymentBox.classList.add(
                "hidden"
            );
        }
    }


    /* =====================================================
       CREATE ORDER ID
    ===================================================== */

    function createOrderId() {

        const now =
            new Date();


        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");

        const hours =
            String(
                now.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                now.getMinutes()
            ).padStart(2, "0");

        const seconds =
            String(
                now.getSeconds()
            ).padStart(2, "0");


        return (
            "TFH-" +
            year +
            month +
            day +
            "-" +
            hours +
            minutes +
            seconds
        );
    }


    /* =====================================================
       CREATE ORDER OBJECT
    ===================================================== */

    function createOrder() {

        const cart =
            getCart();


        const subtotal =
            calculateSubtotal(cart);

        const deliveryCharge =
            getDeliveryCharge();

        const total =
            subtotal + deliveryCharge;


        const paymentValue =
            getPaymentMethod();


        const order = {

            orderId:
                createOrderId(),

            orderDate:
                new Date().toLocaleString(
                    "en-IN"
                ),

            timestamp:
                Date.now(),


            customer: {

                fullName:
                    fullNameInput.value.trim(),

                phone:
                    phoneInput.value.trim(),

                email:
                    emailInput.value.trim()
            },


            address: {

                address:
                    addressInput.value.trim(),

                town:
                    cityInput.value.trim(),

                state:
                    stateInput.value.trim(),

                pincode:
                    pincodeInput.value.trim(),

                landmark:
                    landmarkInput.value.trim()
            },


            items:

                cart.map(
                    function (item) {

                        return {

                            name:
                                getProductName(item),

                            image:
                                getProductImage(item),

                            price:
                                getProductPrice(item),

                            originalPrice:
                                getProductOriginalPrice(item),

                            variant:
                                getProductVariant(item),

                            quantity:
                                getProductQuantity(item)
                        };
                    }
                ),


            subtotal:
                subtotal,

            deliveryCharge:
                deliveryCharge,

            total:
                total,


            paymentMethod:
                getPaymentMethodName(),

            paymentValue:
                paymentValue,


            paymentStatus:
                paymentValue === "online"
                    ? "Payment verification pending"
                    : "Cash on Delivery",


            orderNote:
                orderNoteInput.value.trim(),


            status:
                "Order Placed"
        };


        return order;
    }


    /* =====================================================
       GET CURRENT USER
    ===================================================== */

    function getCurrentUser() {

        try {

            const currentUserData =
                localStorage.getItem(
                    CURRENT_USER_KEY
                );

            if (!currentUserData) {
                return null;
            }

            const currentUser =
                JSON.parse(
                    currentUserData
                );

            if (
                !currentUser ||
                typeof currentUser !== "object"
            ) {

                return null;
            }

            return currentUser;

        } catch (error) {

            console.error(
                "Current user read error:",
                error
            );

            return null;
        }
    }


    /* =====================================================
       GET USERS
    ===================================================== */

    function getUsers() {

        try {

            const usersData =
                localStorage.getItem(
                    USERS_STORAGE_KEY
                );

            if (!usersData) {
                return [];
            }

            const users =
                JSON.parse(usersData);

            return Array.isArray(users)
                ? users
                : [];

        } catch (error) {

            console.error(
                "Users read error:",
                error
            );

            return [];
        }
    }


    /* =====================================================
       SAVE USERS
    ===================================================== */

    function saveUsers(users) {

        try {

            localStorage.setItem(
                USERS_STORAGE_KEY,
                JSON.stringify(users)
            );

            return true;

        } catch (error) {

            console.error(
                "Users save error:",
                error
            );

            return false;
        }
    }


    /* =====================================================
       FIND ACCOUNT FOR ORDER

       This is intentionally flexible.

       It can find the account using:

       1. Logged-in user's email
       2. Logged-in user's contact
       3. Logged-in user's phone
       4. Checkout email
       5. Checkout phone
    ===================================================== */

    function findUserIndex(users, order) {

        if (!Array.isArray(users)) {
            return -1;
        }


        const currentUser =
            getCurrentUser();


        const currentEmail =
            currentUser &&
            currentUser.email
                ? String(
                    currentUser.email
                )
                    .trim()
                    .toLowerCase()
                : "";


        const currentContact =
            currentUser &&
            currentUser.contact
                ? String(
                    currentUser.contact
                )
                    .trim()
                    .toLowerCase()
                : "";


        const currentPhone =
            currentUser &&
            currentUser.phone
                ? String(
                    currentUser.phone
                )
                    .replace(/\D/g, "")
                : "";


        const orderEmail =
            order.customer.email
                ? String(
                    order.customer.email
                )
                    .trim()
                    .toLowerCase()
                : "";


        const orderPhone =
            order.customer.phone
                ? String(
                    order.customer.phone
                )
                    .replace(/\D/g, "")
                : "";


        /* -------------------------------------------------
           FIRST: MATCH LOGGED-IN USER EMAIL
        ------------------------------------------------- */

        if (currentEmail) {

            const index =
                users.findIndex(
                    function (user) {

                        return (
                            user &&
                            user.email &&
                            String(user.email)
                                .trim()
                                .toLowerCase() ===
                            currentEmail
                        );
                    }
                );

            if (index !== -1) {
                return index;
            }
        }


        /* -------------------------------------------------
           SECOND: MATCH LOGGED-IN CONTACT
        ------------------------------------------------- */

        if (currentContact) {

            const index =
                users.findIndex(
                    function (user) {

                        if (!user) {
                            return false;
                        }

                        const userContact =
                            user.contact
                                ? String(
                                    user.contact
                                )
                                    .trim()
                                    .toLowerCase()
                                : "";

                        return (
                            userContact &&
                            userContact ===
                            currentContact
                        );
                    }
                );

            if (index !== -1) {
                return index;
            }
        }


        /* -------------------------------------------------
           THIRD: MATCH LOGGED-IN PHONE
        ------------------------------------------------- */

        if (currentPhone) {

            const index =
                users.findIndex(
                    function (user) {

                        if (!user) {
                            return false;
                        }

                        const userPhone =
                            user.phone
                                ? String(
                                    user.phone
                                )
                                    .replace(/\D/g, "")
                                : "";

                        return (
                            userPhone &&
                            userPhone ===
                            currentPhone
                        );
                    }
                );

            if (index !== -1) {
                return index;
            }
        }


        /* -------------------------------------------------
           FOURTH: MATCH CHECKOUT EMAIL
        ------------------------------------------------- */

        if (orderEmail) {

            const index =
                users.findIndex(
                    function (user) {

                        return (
                            user &&
                            user.email &&
                            String(user.email)
                                .trim()
                                .toLowerCase() ===
                            orderEmail
                        );
                    }
                );

            if (index !== -1) {
                return index;
            }
        }


        /* -------------------------------------------------
           FIFTH: MATCH CHECKOUT PHONE
        ------------------------------------------------- */

        if (orderPhone) {

            const index =
                users.findIndex(
                    function (user) {

                        if (!user) {
                            return false;
                        }

                        const userPhone =
                            user.phone
                                ? String(
                                    user.phone
                                )
                                    .replace(/\D/g, "")
                                : "";

                        const userContact =
                            user.contact
                                ? String(
                                    user.contact
                                )
                                    .replace(/\D/g, "")
                                : "";

                        return (
                            (
                                userPhone &&
                                userPhone ===
                                orderPhone
                            ) ||
                            (
                                userContact &&
                                userContact ===
                                orderPhone
                            )
                        );
                    }
                );

            if (index !== -1) {
                return index;
            }
        }


        return -1;
    }


    /* =====================================================
       SAVE ORDER TO ACCOUNT

       IMPORTANT:

       The order is saved in:

       friendsHeritageUsers
          -> matching user
          -> orders[]

       AND:

       friendsHeritageCurrentUser
          -> orders[]

       AND:

       friendsHeritageLatestOrder
    ===================================================== */

    function saveOrderToAccount(order) {

        try {

            /* ---------------------------------------------
               ALWAYS SAVE LATEST ORDER
            --------------------------------------------- */

            localStorage.setItem(
                LATEST_ORDER_KEY,
                JSON.stringify(order)
            );


            /* ---------------------------------------------
               GET USERS
            --------------------------------------------- */

            const users =
                getUsers();


            if (!users.length) {

                console.warn(
                    "No registered users found."
                );

                return {
                    success: false,
                    reason: "no-users"
                };
            }


            /* ---------------------------------------------
               FIND USER
            --------------------------------------------- */

            const userIndex =
                findUserIndex(
                    users,
                    order
                );


            if (userIndex === -1) {

                console.warn(
                    "Could not find matching account for order."
                );

                return {
                    success: false,
                    reason: "user-not-found"
                };
            }


            /* ---------------------------------------------
               MAKE SURE ORDERS EXISTS
            --------------------------------------------- */

            if (
                !Array.isArray(
                    users[userIndex].orders
                )
            ) {

                users[userIndex].orders = [];
            }


            /* ---------------------------------------------
               PREVENT SAME ORDER FROM BEING SAVED TWICE
            --------------------------------------------- */

            const alreadyExists =
                users[userIndex].orders.some(
                    function (existingOrder) {

                        return (
                            existingOrder &&
                            existingOrder.orderId ===
                            order.orderId
                        );
                    }
                );


            if (!alreadyExists) {

                users[userIndex].orders.unshift(
                    order
                );
            }


            /* ---------------------------------------------
               SAVE USERS
            --------------------------------------------- */

            const usersSaved =
                saveUsers(users);


            if (!usersSaved) {

                return {
                    success: false,
                    reason: "users-save-failed"
                };
            }


            /* ---------------------------------------------
               UPDATE CURRENT USER
            --------------------------------------------- */

            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(
                    users[userIndex]
                )
            );


            console.log(
                "Order successfully saved to account:",
                order.orderId
            );


            return {
                success: true,
                reason: "saved"
            };


        } catch (error) {

            console.error(
                "Account order save error:",
                error
            );

            return {
                success: false,
                reason: "exception"
            };
        }
    }


    /* =====================================================
       EMAIL ITEM TEXT
    ===================================================== */

    function createEmailItems(order) {

        return order.items
            .map(
                function (item) {

                    const variant =
                        item.variant
                            ? " (" +
                              item.variant +
                              ")"
                            : "";

                    return (
                        item.name +
                        variant +
                        " × " +
                        item.quantity +
                        " = " +
                        formatCurrency(
                            item.price *
                            item.quantity
                        )
                    );
                }
            )
            .join("\n");
    }


    /* =====================================================
       SEND ORDER EMAIL
    ===================================================== */

    async function sendOrderEmail(order) {

        if (
            typeof emailjs ===
            "undefined"
        ) {

            throw new Error(
                "EmailJS is not loaded."
            );
        }


        const emailData = {

            order_id:
                order.orderId,

            order_date:
                order.orderDate,


            customer_name:
                order.customer.fullName,

            customer_phone:
                order.customer.phone,

            customer_email:
                order.customer.email ||
                "Not provided",


            address:
                order.address.address,

            city:
                order.address.town,

            state:
                order.address.state,

            pincode:
                order.address.pincode,

            landmark:
                order.address.landmark ||
                "Not provided",


            items:
                createEmailItems(order),


            subtotal:
                formatCurrency(
                    order.subtotal
                ),

            delivery_charge:
                formatCurrency(
                    order.deliveryCharge
                ),

            total:
                formatCurrency(
                    order.total
                ),


            payment_method:
                order.paymentMethod,

            payment_status:
                order.paymentStatus,


            order_note:
                order.orderNote ||
                "No note",


            store_email:
                STORE_EMAIL
        };


        console.log(
            "Sending order email:",
            emailData
        );


        const response =
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                emailData
            );


        console.log(
            "EmailJS response:",
            response
        );


        return response;
    }


    /* =====================================================
       BUTTON LOADING
    ===================================================== */

    function setButtonLoading(
        isLoading
    ) {

        if (isLoading) {

            placeOrderBtn.disabled =
                true;

            whatsappOrderBtn.disabled =
                true;

            placeOrderBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Processing Order...</span>
            `;

        } else {

            const hasCart =
                getCart().length > 0;

            placeOrderBtn.disabled =
                !hasCart;

            whatsappOrderBtn.disabled =
                !hasCart;


            placeOrderBtn.innerHTML = `
                <i class="fa-solid fa-lock"></i>
                <span>Place Order</span>
            `;
        }
    }


    /* =====================================================
       PLACE ORDER
    ===================================================== */

    async function placeOrder() {

        clearMessage();


        /* ---------------------------------------------
           VALIDATE
        --------------------------------------------- */

        if (!validateCheckout()) {
            return;
        }


        /* ---------------------------------------------
           CREATE ORDER
        --------------------------------------------- */

        const order =
            createOrder();


        setButtonLoading(true);


        try {

            /* -----------------------------------------
               SAVE ORDER TO ACCOUNT FIRST
            ----------------------------------------- */

            const accountResult =
                saveOrderToAccount(order);


            console.log(
                "Account save result:",
                accountResult
            );


            /* -----------------------------------------
               SEND EMAIL
            ----------------------------------------- */

            await sendOrderEmail(order);


            /* -----------------------------------------
               EMAIL SUCCESS

               Now clear cart.
            ----------------------------------------- */

            saveCart([]);


            displayCheckoutItems();


            /* -----------------------------------------
               SUCCESS MESSAGE
            ----------------------------------------- */

            if (
                accountResult &&
                accountResult.success
            ) {

                showMessage(
                    "Your order has been placed successfully. Order ID: " +
                    order.orderId +
                    ". Your order has also been saved to My Orders.",
                    "success"
                );

            } else {

                showMessage(
                    "Your order has been placed successfully. Order ID: " +
                    order.orderId +
                    ".",
                    "success"
                );
            }


        } catch (error) {

            console.error(
                "Order submission error:",
                error
            );


            showMessage(
                "We could not send your order email. Your cart has been kept. Please check your EmailJS template settings and try again.",
                "error"
            );


        } finally {

            setButtonLoading(false);
        }
    }


    /* =====================================================
       WHATSAPP MESSAGE
    ===================================================== */

    function createWhatsAppMessage(order) {

        let message = "";


        message +=
            "🌿 *THE FRIENDS HERITAGE* 🌿\n";

        message +=
            "━━━━━━━━━━━━━━━━━━\n\n";


        message +=
            "🛍️ *NEW ORDER*\n\n";


        message +=
            "Order ID: " +
            order.orderId +
            "\n";


        message +=
            "Date: " +
            order.orderDate +
            "\n\n";


        /* CUSTOMER */

        message +=
            "👤 *CUSTOMER DETAILS*\n";

        message +=
            "Name: " +
            order.customer.fullName +
            "\n";

        message +=
            "Phone: " +
            order.customer.phone +
            "\n";


        if (order.customer.email) {

            message +=
                "Email: " +
                order.customer.email +
                "\n";
        }


        message += "\n";


        /* ADDRESS */

        message +=
            "📍 *DELIVERY ADDRESS*\n";

        message +=
            order.address.address +
            "\n";

        message +=
            "Town/City: " +
            order.address.town +
            "\n";

        message +=
            "State: " +
            order.address.state +
            "\n";

        message +=
            "PIN: " +
            order.address.pincode +
            "\n";


        if (order.address.landmark) {

            message +=
                "Landmark: " +
                order.address.landmark +
                "\n";
        }


        message += "\n";


        /* ITEMS */

        message +=
            "🛒 *ORDER ITEMS*\n";


        order.items.forEach(
            function (item, index) {

                message +=
                    (index + 1) +
                    ". " +
                    item.name;


                if (item.variant) {

                    message +=
                        " (" +
                        item.variant +
                        ")";
                }


                message +=
                    " × " +
                    item.quantity;


                message +=
                    " = " +
                    formatCurrency(
                        item.price *
                        item.quantity
                    );


                message += "\n";
            }
        );


        message += "\n";


        /* TOTAL */

        message +=
            "Subtotal: " +
            formatCurrency(
                order.subtotal
            ) +
            "\n";


        message +=
            "Delivery: " +
            formatCurrency(
                order.deliveryCharge
            ) +
            "\n";


        message +=
            "*TOTAL: " +
            formatCurrency(
                order.total
            ) +
            "*\n\n";


        /* PAYMENT */

        message +=
            "💳 Payment: " +
            order.paymentMethod +
            "\n";


        if (order.orderNote) {

            message +=
                "\n📝 Note: " +
                order.orderNote +
                "\n";
        }


        message +=
            "\n━━━━━━━━━━━━━━━━━━\n";


        message +=
            "Thank you for choosing The Friends Heritage ❤️";


        return message;
    }


    /* =====================================================
       WHATSAPP ORDER
    ===================================================== */

    function sendWhatsAppOrder() {

        clearMessage();


        if (!validateCheckout()) {
            return;
        }


        const order =
            createOrder();


        /* ---------------------------------------------
           SAVE ORDER TO ACCOUNT
        --------------------------------------------- */

        const accountResult =
            saveOrderToAccount(order);


        console.log(
            "WhatsApp account save result:",
            accountResult
        );


        /* ---------------------------------------------
           CREATE MESSAGE
        --------------------------------------------- */

        const message =
            createWhatsAppMessage(
                order
            );


        /* ---------------------------------------------
           CORRECT WHATSAPP URL
        --------------------------------------------- */

        const whatsappURL =
            "https://wa.me/" +
            WHATSAPP_NUMBER +
            "?text=" +
            encodeURIComponent(
                message
            );


        /* ---------------------------------------------
           TRY NEW TAB FIRST
        --------------------------------------------- */

        const newWindow =
            window.open(
                whatsappURL,
                "_blank"
            );


        /* ---------------------------------------------
           POPUP BLOCKED

           Instead of an alert, navigate
           directly to WhatsApp.
        --------------------------------------------- */

        if (!newWindow) {

            window.location.href =
                whatsappURL;

            return;
        }


        /* ---------------------------------------------
           MESSAGE
        --------------------------------------------- */

        if (
            accountResult &&
            accountResult.success
        ) {

            showMessage(
                "Your WhatsApp order message is ready. The order has also been saved to My Orders.",
                "success"
            );

        } else {

            showMessage(
                "Your WhatsApp order message is ready.",
                "success"
            );
        }
    }


    /* =====================================================
       PIN CODE -> TOWN / POST OFFICE
    ===================================================== */

    let pincodeTimer = null;


    async function lookupPincode() {

        const pincode =
            pincodeInput.value.trim();


        if (!/^\d{6}$/.test(pincode)) {

            deliveryStatus.textContent =
                "";

            deliveryStatus.className =
                "delivery-status";

            return;
        }


        deliveryStatus.textContent =
            "Finding town...";

        deliveryStatus.className =
            "delivery-status loading";


        try {

            /* -----------------------------------------
               CORRECT INDIA POST API URL
            ----------------------------------------- */

            const response =
                await fetch(
                    "https://api.postalpincode.in/pincode/" +
                    pincode
                );


            if (!response.ok) {

                throw new Error(
                    "PIN lookup failed"
                );
            }


            const data =
                await response.json();


            if (
                !Array.isArray(data) ||
                !data[0] ||
                data[0].Status !==
                    "Success" ||
                !Array.isArray(
                    data[0].PostOffice
                ) ||
                data[0].PostOffice.length === 0
            ) {

                throw new Error(
                    "Invalid PIN"
                );
            }


            const postOffices =
                data[0].PostOffice;


            /* -----------------------------------------
               FIRST POST OFFICE
            ----------------------------------------- */

            const firstOffice =
                postOffices[0];


            /*
               Prefer:

               Name
               Block
               Taluk

               instead of District.
            */

            const town =
                firstOffice.Name ||
                firstOffice.Block ||
                firstOffice.Taluk ||
                firstOffice.District ||
                "";


            const state =
                firstOffice.State ||
                "";


            /* -----------------------------------------
               PUT TOWN / POST OFFICE
               INTO CITY FIELD
            ----------------------------------------- */

            if (town) {

                cityInput.value =
                    town;
            }


            if (state) {

                stateInput.value =
                    state;
            }


            deliveryStatus.textContent =
                "Town found: " +
                town;


            deliveryStatus.className =
                "delivery-status success";


            updateOrderSummary();


        } catch (error) {

            console.error(
                "PIN lookup error:",
                error
            );


            deliveryStatus.textContent =
                "PIN code not found. Please enter your town manually.";

            deliveryStatus.className =
                "delivery-status error";
        }
    }


    /* =====================================================
       PIN INPUT
    ===================================================== */

    pincodeInput.addEventListener(
        "input",
        function () {

            /* Only numbers */

            this.value =
                this.value.replace(
                    /\D/g,
                    ""
                ).slice(0, 6);


            clearTimeout(
                pincodeTimer
            );


            if (
                this.value.length === 6
            ) {

                pincodeTimer =
                    setTimeout(
                        lookupPincode,
                        350
                    );

            } else {

                deliveryStatus.textContent =
                    "";

                deliveryStatus.className =
                    "delivery-status";
            }
        }
    );


    /* =====================================================
       STATE INPUT
    ===================================================== */

    stateInput.addEventListener(
        "input",
        updateOrderSummary
    );


    stateInput.addEventListener(
        "change",
        updateOrderSummary
    );


    /* =====================================================
       PHONE INPUT
    ===================================================== */

    phoneInput.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(0, 10);
        }
    );


    /* =====================================================
       PAYMENT RADIO
    ===================================================== */

    const paymentRadios =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    paymentRadios.forEach(
        function (radio) {

            radio.addEventListener(
                "change",
                updatePaymentDisplay
            );
        }
    );


    /* =====================================================
       PLACE ORDER BUTTON
    ===================================================== */

    placeOrderBtn.addEventListener(
        "click",
        placeOrder
    );


    /* =====================================================
       WHATSAPP BUTTON
    ===================================================== */

    whatsappOrderBtn.addEventListener(
        "click",
        sendWhatsAppOrder
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    displayCheckoutItems();

    updatePaymentDisplay();

    updateOrderSummary();

});
