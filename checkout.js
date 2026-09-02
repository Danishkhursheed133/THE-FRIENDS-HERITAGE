/* =========================================================
   CHECKOUT JAVASCRIPT
   FRIENDS HERITAGE
========================================================= */


/* =========================================================
   WHATSAPP BUSINESS NUMBER
========================================================= */

const WHATSAPP_NUMBER = "917051713047";


/* =========================================================
   DELIVERY SETTINGS
========================================================= */

/*
    TEMPORARY DELIVERY RULES

    Kashmir     → ₹100
    Other State → ₹200

    We can later change this to:
    PIN-code based delivery charges.
*/

const DELIVERY_CHARGES = {

    sameState: 100,

    otherState: 200

};


/*
    Your business state
*/

const BUSINESS_STATE = "Kashmir";


/* =========================================================
   LOAD CART
========================================================= */

let cart = [];


try {

    const savedCart =
        localStorage.getItem(
            "friendsHeritageCart"
        );


    if (savedCart) {

        const parsedCart =
            JSON.parse(savedCart);


        if (Array.isArray(parsedCart)) {

            cart = parsedCart;

        }

    }

}

catch (error) {

    console.error(
        "Error loading cart:",
        error
    );

    cart = [];

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const checkoutItems =
    document.getElementById(
        "checkoutItems"
    );


const checkoutItemCount =
    document.getElementById(
        "checkoutItemCount"
    );


const checkoutSubtotal =
    document.getElementById(
        "checkoutSubtotal"
    );


const deliveryChargeElement =
    document.getElementById(
        "deliveryCharge"
    );


const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );


const deliveryMessage =
    document.getElementById(
        "deliveryMessage"
    );


const placeOrderBtn =
    document.getElementById(
        "placeOrderBtn"
    );


const whatsappOrderBtn =
    document.getElementById(
        "whatsappOrderBtn"
    );


/* =========================================================
   CUSTOMER INPUTS
========================================================= */

const fullNameInput =
    document.getElementById(
        "fullName"
    );


const phoneInput =
    document.getElementById(
        "phone"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const addressInput =
    document.getElementById(
        "address"
    );


const cityInput =
    document.getElementById(
        "city"
    );


const stateInput =
    document.getElementById(
        "state"
    );


const pincodeInput =
    document.getElementById(
        "pincode"
    );


const landmarkInput =
    document.getElementById(
        "landmark"
    );


const orderNoteInput =
    document.getElementById(
        "orderNote"
    );


/* =========================================================
   DELIVERY CHARGE VARIABLE
========================================================= */

let currentDeliveryCharge = 0;


/* =========================================================
   MONEY FORMAT
========================================================= */

function formatMoney(amount) {

    const number =
        Number(amount) || 0;


    return (
        "₹" +
        number.toLocaleString(
            "en-IN"
        )
    );

}


/* =========================================================
   PRODUCT PRICE
========================================================= */

function getProductPrice(product) {

    let price =
        product.price ??
        product.productPrice ??
        0;


    if (
        typeof price ===
        "string"
    ) {

        price =
            price.replace(
                /[₹,\s]/g,
                ""
            );

    }


    price =
        Number(price);


    if (
        !Number.isFinite(price)
    ) {

        return 0;

    }


    return price;

}


/* =========================================================
   PRODUCT QUANTITY
========================================================= */

function getProductQuantity(product) {

    const quantity =
        Number(
            product.quantity ??
            product.qty ??
            1
        );


    if (
        !Number.isFinite(quantity) ||
        quantity < 1
    ) {

        return 1;

    }


    return quantity;

}


/* =========================================================
   PRODUCT NAME
========================================================= */

function getProductName(product) {

    return (

        product.name ??

        product.title ??

        product.productName ??

        "Product"

    );

}


/* =========================================================
   PRODUCT IMAGE
========================================================= */

function getProductImage(product) {

    return (

        product.image ??

        product.img ??

        product.imageUrl ??

        ""

    );

}


/* =========================================================
   CALCULATE SUBTOTAL
========================================================= */

function calculateSubtotal() {

    let subtotal = 0;


    if (
        !Array.isArray(cart)
    ) {

        return 0;

    }


    cart.forEach(product => {

        const price =
            getProductPrice(
                product
            );


        const quantity =
            getProductQuantity(
                product
            );


        subtotal +=
            price * quantity;

    });


    return subtotal;

}


/* =========================================================
   DISPLAY CHECKOUT PRODUCTS
========================================================= */

function displayCheckoutItems() {

    if (!checkoutItems) {

        console.error(
            "checkoutItems element not found."
        );

        return;

    }


    checkoutItems.innerHTML = "";


    /* -----------------------------------------
       EMPTY CART
    ----------------------------------------- */

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        checkoutItems.innerHTML = `

            <div class="empty-checkout">

                <i class="fa-solid fa-bag-shopping"></i>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Please add products before checkout.
                </p>

            </div>

        `;


        if (placeOrderBtn) {

            placeOrderBtn.disabled =
                true;

        }


        if (whatsappOrderBtn) {

            whatsappOrderBtn.disabled =
                true;

        }


        return;

    }


    /* -----------------------------------------
       CART HAS PRODUCTS
    ----------------------------------------- */

    if (placeOrderBtn) {

        placeOrderBtn.disabled =
            false;

    }


    if (whatsappOrderBtn) {

        whatsappOrderBtn.disabled =
            false;

    }


    cart.forEach(product => {

        const name =
            getProductName(
                product
            );


        const price =
            getProductPrice(
                product
            );


        const quantity =
            getProductQuantity(
                product
            );


        const image =
            getProductImage(
                product
            );


        const itemTotal =
            price * quantity;


        const productElement =
            document.createElement(
                "div"
            );


        productElement.className =
            "checkout-product";


        productElement.innerHTML = `

            ${
                image
                ?

                `
                <img
                    src="${image}"
                    alt="${name}"
                    class="checkout-product-image"
                >
                `

                :

                `
                <div
                    class="checkout-product-image
                           checkout-no-image"
                >
                    <i class="fa-solid fa-image"></i>
                </div>
                `
            }


            <div
                class="checkout-product-info"
            >

                <h3>
                    ${name}
                </h3>


                <p>
                    Quantity:
                    ${quantity}
                </p>

            </div>


            <div
                class="checkout-product-price"
            >

                <strong>
                    ${formatMoney(itemTotal)}
                </strong>


                <span>
                    ${formatMoney(price)}
                    ×
                    ${quantity}
                </span>

            </div>

        `;


        checkoutItems.appendChild(
            productElement
        );

    });

}


/* =========================================================
   UPDATE ITEM COUNT
========================================================= */

function updateItemCount() {

    if (!checkoutItemCount) {

        return;

    }


    let count = 0;


    if (
        Array.isArray(cart)
    ) {

        cart.forEach(product => {

            count +=
                getProductQuantity(
                    product
                );

        });

    }


    checkoutItemCount.textContent =
        count;

}


/* =========================================================
   UPDATE TOTALS
========================================================= */

function updateTotals() {

    const subtotal =
        calculateSubtotal();


    const total =
        subtotal +
        currentDeliveryCharge;


    /* -----------------------------------------
       SUBTOTAL
    ----------------------------------------- */

    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatMoney(
                subtotal
            );

    }


    /* -----------------------------------------
       DELIVERY
    ----------------------------------------- */

    if (deliveryChargeElement) {

        if (
            currentDeliveryCharge > 0
        ) {

            deliveryChargeElement.textContent =
                formatMoney(
                    currentDeliveryCharge
                );

        }

        else {

            deliveryChargeElement.textContent =
                "₹0";

        }

    }


    /* -----------------------------------------
       TOTAL
    ----------------------------------------- */

    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatMoney(
                total
            );

    }

}


/* =========================================================
   DELIVERY MESSAGE
========================================================= */

function showDeliveryMessage(
    message,
    type = ""
) {

    if (!deliveryMessage) {

        return;

    }


    deliveryMessage.textContent =
        message;


    deliveryMessage.classList.remove(
        "success",
        "error"
    );


    if (type) {

        deliveryMessage.classList.add(
            type
        );

    }

}


/* =========================================================
   CALCULATE DELIVERY CHARGE
========================================================= */

function calculateDeliveryCharge() {

    if (!pincodeInput) {

        return;

    }


    const pincode =
        pincodeInput.value.trim();


    const state =
        stateInput
            ? stateInput.value.trim()
            : "";


    /* -----------------------------------------
       CHECK PIN CODE
    ----------------------------------------- */

    if (
        !/^\d{6}$/.test(
            pincode
        )
    ) {

        currentDeliveryCharge =
            0;


        updateTotals();


        showDeliveryMessage(
            "Enter your 6-digit PIN code."
        );


        return;

    }


    /* -----------------------------------------
       KASHMIR DELIVERY
    ----------------------------------------- */

    if (
        state.toLowerCase() ===
        BUSINESS_STATE.toLowerCase()
    ) {

        currentDeliveryCharge =
            DELIVERY_CHARGES.sameState;

    }


    /* -----------------------------------------
       OTHER STATE DELIVERY
    ----------------------------------------- */

    else {

        currentDeliveryCharge =
            DELIVERY_CHARGES.otherState;

    }


    updateTotals();


    showDeliveryMessage(

        `Delivery charge: ${formatMoney(
            currentDeliveryCharge
        )}`,

        "success"

    );

}


/* =========================================================
   PIN CODE INPUT
========================================================= */

if (pincodeInput) {

    pincodeInput.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(
                        0,
                        6
                    );


            if (
                this.value.length ===
                6
            ) {

                calculateDeliveryCharge();

            }

            else {

                currentDeliveryCharge =
                    0;


                updateTotals();


                showDeliveryMessage(
                    "Enter your complete 6-digit PIN code."
                );

            }

        }
    );

}


/* =========================================================
   STATE INPUT
========================================================= */

if (stateInput) {

    stateInput.addEventListener(
        "input",
        function () {

            if (
                pincodeInput &&
                pincodeInput.value.length ===
                6
            ) {

                calculateDeliveryCharge();

            }

        }
    );

}


/* =========================================================
   PHONE INPUT
========================================================= */

if (phoneInput) {

    phoneInput.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(
                        0,
                        10
                    );

        }
    );

}


/* =========================================================
   VALIDATE CHECKOUT FORM
========================================================= */

function validateCheckoutForm() {

    /* -----------------------------------------
       CHECK CART
    ----------------------------------------- */

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        return false;

    }


    /* -----------------------------------------
       REQUIRED FIELDS
    ----------------------------------------- */

    const requiredFields = [

        fullNameInput,

        phoneInput,

        addressInput,

        cityInput,

        stateInput,

        pincodeInput

    ];


    for (
        const field of requiredFields
    ) {

        if (!field) {

            continue;

        }


        if (
            field.value.trim() === ""
        ) {

            field.focus();

            return false;

        }

    }


    /* -----------------------------------------
       PHONE
    ----------------------------------------- */

    const phone =
        phoneInput.value.trim();


    if (
        !/^[6-9]\d{9}$/.test(
            phone
        )
    ) {

        phoneInput.focus();

        return false;

    }


    /* -----------------------------------------
       PIN CODE
    ----------------------------------------- */

    const pincode =
        pincodeInput.value.trim();


    if (
        !/^\d{6}$/.test(
            pincode
        )
    ) {

        pincodeInput.focus();


        showDeliveryMessage(
            "Please enter a valid 6-digit PIN code.",
            "error"
        );


        return false;

    }


    /* -----------------------------------------
       CALCULATE DELIVERY
    ----------------------------------------- */

    calculateDeliveryCharge();


    if (
        currentDeliveryCharge <=
        0
    ) {

        showDeliveryMessage(
            "Delivery charge could not be calculated.",
            "error"
        );


        return false;

    }


    return true;

}


/* =========================================================
   GET CUSTOMER DETAILS
========================================================= */

function getCustomerDetails() {

    const payment =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    return {

        name:
            fullNameInput
                ? fullNameInput.value.trim()
                : "",


        phone:
            phoneInput
                ? phoneInput.value.trim()
                : "",


        email:
            emailInput
                ? emailInput.value.trim()
                : "",


        address:
            addressInput
                ? addressInput.value.trim()
                : "",


        city:
            cityInput
                ? cityInput.value.trim()
                : "",


        state:
            stateInput
                ? stateInput.value.trim()
                : "",


        pincode:
            pincodeInput
                ? pincodeInput.value.trim()
                : "",


        landmark:
            landmarkInput
                ? landmarkInput.value.trim()
                : "",


        note:
            orderNoteInput
                ? orderNoteInput.value.trim()
                : "",


        payment:
            payment
                ? payment.value
                : "cod"

    };

}


/* =========================================================
   CREATE WHATSAPP MESSAGE
========================================================= */

function createWhatsAppMessage() {

    const customer =
        getCustomerDetails();


    const subtotal =
        calculateSubtotal();


    const total =
        subtotal +
        currentDeliveryCharge;


    let message = "";


    /* -----------------------------------------
       ORDER HEADER
    ----------------------------------------- */

    message +=
        "🛍️ *NEW ORDER*%0A";


    message +=
        "━━━━━━━━━━━━━━%0A%0A";


    /* -----------------------------------------
       CUSTOMER
    ----------------------------------------- */

    message +=
        "*CUSTOMER DETAILS*%0A";


    message +=
        `Name: ${customer.name}%0A`;


    message +=
        `Mobile: ${customer.phone}%0A`;


    if (customer.email) {

        message +=
            `Email: ${customer.email}%0A`;

    }


    message +=
        "%0A";


    /* -----------------------------------------
       DELIVERY ADDRESS
    ----------------------------------------- */

    message +=
        "*DELIVERY ADDRESS*%0A";


    message +=
        `${customer.address}%0A`;


    message +=
        `${customer.city}, ${customer.state}%0A`;


    message +=
        `PIN Code: ${customer.pincode}%0A`;


    if (customer.landmark) {

        message +=
            `Landmark: ${customer.landmark}%0A`;

    }


    message +=
        "%0A";


    /* -----------------------------------------
       ORDER ITEMS
    ----------------------------------------- */

    message +=
        "*ORDER ITEMS*%0A";


    cart.forEach(product => {

        const name =
            getProductName(
                product
            );


        const quantity =
            getProductQuantity(
                product
            );


        const price =
            getProductPrice(
                product
            );


        const itemTotal =
            price * quantity;


        message +=
            `• ${name} × ${quantity} = ${formatMoney(itemTotal)}%0A`;

    });


    message +=
        "%0A";


    /* -----------------------------------------
       ORDER SUMMARY
    ----------------------------------------- */

    message +=
        "*ORDER SUMMARY*%0A";


    message +=
        `Subtotal: ${formatMoney(
            subtotal
        )}%0A`;


    message +=
        `Delivery: ${formatMoney(
            currentDeliveryCharge
        )}%0A`;


    message +=
        `*TOTAL: ${formatMoney(
            total
        )}*%0A`;


    message +=
        "%0A";


    /* -----------------------------------------
       PAYMENT
    ----------------------------------------- */

    message +=
        `Payment: ${
            customer.payment === "cod"
                ? "Cash on Delivery"
                : "Online Payment"
        }%0A`;


    /* -----------------------------------------
       NOTE
    ----------------------------------------- */

    if (customer.note) {

        message +=
            `%0ANote: ${customer.note}%0A`;

    }


    return message;

}


/* =========================================================
   WHATSAPP ORDER BUTTON
========================================================= */

if (whatsappOrderBtn) {

    whatsappOrderBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            /* -----------------------------------------
               VALIDATE
            ----------------------------------------- */

            if (
                !validateCheckoutForm()
            ) {

                return;

            }


            /* -----------------------------------------
               CREATE MESSAGE
            ----------------------------------------- */

            const message =
                createWhatsAppMessage();


            /* -----------------------------------------
               WHATSAPP URL
            ----------------------------------------- */

            const whatsappURL =
                "https://wa.me/" +
                WHATSAPP_NUMBER +
                "?text=" +
                message;


            /* -----------------------------------------
               OPEN WHATSAPP
            ----------------------------------------- */

            window.location.href =
                whatsappURL;

        }
    );

}


/* =========================================================
   PLACE ORDER
========================================================= */

if (placeOrderBtn) {

    placeOrderBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            /* -----------------------------------------
               VALIDATE
            ----------------------------------------- */

            if (
                !validateCheckoutForm()
            ) {

                return;

            }


            /* -----------------------------------------
               CUSTOMER
            ----------------------------------------- */

            const customer =
                getCustomerDetails();


            /* -----------------------------------------
               TOTALS
            ----------------------------------------- */

            const subtotal =
                calculateSubtotal();


            const total =
                subtotal +
                currentDeliveryCharge;


            /* -----------------------------------------
               CREATE ORDER
            ----------------------------------------- */

            const order = {

                orderId:
                    "ORD-" +
                    Date.now(),


                customer:
                    customer,


                items:
                    cart,


                subtotal:
                    subtotal,


                deliveryCharge:
                    currentDeliveryCharge,


                total:
                    total,


                createdAt:
                    new Date()
                        .toISOString()

            };


            /* -----------------------------------------
               SAVE ORDER
            ----------------------------------------- */

            localStorage.setItem(

                "latestOrder",

                JSON.stringify(
                    order
                )

            );


            /*
                IMPORTANT:

                Cart is NOT cleared here yet.

                We will clear it after
                creating the final order-success page.
            */


            /* -----------------------------------------
               TEMPORARY SUCCESS MESSAGE
            ----------------------------------------- */

            alert(

                "Order placed successfully!\n\n" +

                "Order ID: " +
                order.orderId +

                "\n\n" +

                "Total: " +
                formatMoney(
                    total
                )

            );


        }
    );

}


/* =========================================================
   INITIALIZE CHECKOUT
========================================================= */

function initializeCheckout() {

    displayCheckoutItems();

    updateItemCount();

    updateTotals();


    /* -----------------------------------------
       EMPTY CART BUTTON STATE
    ----------------------------------------- */

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        if (placeOrderBtn) {

            placeOrderBtn.disabled =
                true;

        }


        if (whatsappOrderBtn) {

            whatsappOrderBtn.disabled =
                true;

        }

    }

    else {

        if (placeOrderBtn) {

            placeOrderBtn.disabled =
                false;

        }


        if (whatsappOrderBtn) {

            whatsappOrderBtn.disabled =
                false;

        }

    }

}


/* =========================================================
   START CHECKOUT
========================================================= */

initializeCheckout();