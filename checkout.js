/* =========================================================
   THE FRIENDS HERITAGE
   CHECKOUT.JS
   Complete Checkout Functionality
   ---------------------------------------------------------
   Features:
   1. Load cart from Flask
   2. Display products and totals
   3. Validate customer and delivery details
   4. COD and UPI payment selection
   5. UPI transaction reference validation
   6. Place order through Flask API
   7. Display order and email status
   8. PIN code lookup
   9. WhatsApp order
   10. Retry cart loading
========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = window.location.origin;

const CART_TOKEN_KEY = "friendsHeritageCartToken";

const WHATSAPP_NUMBER = "917051713047";

const DELIVERY_CHARGE = 0;

const MIN_UTR_LENGTH = 8;
const MAX_UTR_LENGTH = 35;

let checkoutCart = [];
let checkoutCartData = {};

let checkoutSubtotal = 0;
let checkoutDelivery = DELIVERY_CHARGE;
let checkoutTotal = 0;

let isPlacingOrder = false;

/* =========================================================
   DOM HELPERS
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}

function formatCurrency(amount) {
    const number = Number(amount);

    return "₹" + (
        Number.isFinite(number) ? number : 0
    ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHTML(value) {
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };

    return String(value ?? "").replace(
        /[&<>"']/g,
        character => entities[character]
    );
}

function showMessage(message, type = "info") {
    const element = getElement("checkoutFormMessage");

    if (!element) {
        console.log("CHECKOUT MESSAGE:", message);
        alert(message);
        return;
    }

    element.textContent = message;

    element.className =
        "checkout-form-message " + type;

    element.style.display = "block";
}

function clearMessage() {
    const element = getElement("checkoutFormMessage");

    if (element) {
        element.textContent = "";
        element.style.display = "none";
    }
}

/* =========================================================
   CART TOKEN
========================================================= */

function getCartToken() {
    let token = localStorage.getItem(CART_TOKEN_KEY);

    if (!token) {
        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {
            token = "cart_" + window.crypto.randomUUID();
        } else {
            token =
                "cart_" +
                Date.now() +
                "_" +
                Math.random().toString(36).slice(2);
        }

        localStorage.setItem(CART_TOKEN_KEY, token);
    }

    return token;
}

function getCartHeaders(includeJSON = false) {
    const headers = {
        "Accept": "application/json",
        "X-Cart-Token": getCartToken()
    };

    if (includeJSON) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

/* =========================================================
   SAFE JSON RESPONSE
========================================================= */

async function readJSONResponse(response) {
    const responseText = await response.text();

    if (!responseText) {
        throw new Error(
            "The server returned an empty response. HTTP " +
            response.status
        );
    }

    try {
        return JSON.parse(responseText);
    } catch (error) {
        console.error(
            "SERVER RETURNED NON-JSON RESPONSE:",
            responseText.substring(0, 1500)
        );

        throw new Error(
            "The server returned an invalid response. " +
            "Check the Flask terminal for the actual error."
        );
    }
}

/* =========================================================
   CUSTOMER FIELD HELPERS
========================================================= */

function getFieldValue(id) {
    const element = getElement(id);

    return element
        ? String(element.value || "").trim()
        : "";
}

function getCustomerName() {
    return getFieldValue("fullName");
}

function getCustomerPhone() {
    return getFieldValue("phone");
}

function getCustomerEmail() {
    return getFieldValue("email");
}

function getDeliveryAddress() {
    return getFieldValue("address");
}

function getDeliveryPincode() {
    return getFieldValue("pincode");
}

function getDeliveryCity() {
    return getFieldValue("city");
}

function getDeliveryState() {
    return getFieldValue("state");
}

function getLandmark() {
    return getFieldValue("landmark");
}

function getOrderNote() {
    return getFieldValue("orderNote");
}

function getPaymentReference() {
    const input = getElement("paymentReference");

    if (!input) {
        return "";
    }

    return String(input.value || "")
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, MAX_UTR_LENGTH);
}

/* =========================================================
   CART DATA HELPERS
========================================================= */

function getCartItems(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    if (Array.isArray(data?.cart?.items)) {
        return data.cart.items;
    }

    return [];
}

function getItemName(item) {
    return (
        item.product_name ||
        item.name ||
        item.product?.name ||
        "Product"
    );
}

function getItemVariant(item) {
    return (
        item.variant_name ||
        item.variant ||
        item.size ||
        item.weight ||
        item.product_variant ||
        ""
    );
}

function getItemQuantity(item) {
    const quantity = Number(
        item.quantity ?? item.qty ?? 1
    );

    return (
        Number.isFinite(quantity) &&
        quantity > 0
    ) ? quantity : 1;
}

function getItemPrice(item) {
    const price = Number(
        item.sale_price ??
        item.price ??
        item.unit_price ??
        item.product?.sale_price ??
        item.product?.price ??
        0
    );

    return (
        Number.isFinite(price) &&
        price >= 0
    ) ? price : 0;
}

function getItemTotal(item) {
    const providedTotal = Number(
        item.item_total ??
        item.line_total ??
        item.total_price
    );

    if (
        Number.isFinite(providedTotal) &&
        providedTotal >= 0 &&
        (
            item.item_total != null ||
            item.line_total != null ||
            item.total_price != null
        )
    ) {
        return providedTotal;
    }

    return getItemPrice(item) * getItemQuantity(item);
}

function getCartSubtotal(data, items) {
    const candidates = [
        data?.subtotal,
        data?.cart?.subtotal
    ];

    for (const value of candidates) {
        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            const amount = Number(value);

            if (
                Number.isFinite(amount) &&
                amount >= 0
            ) {
                return amount;
            }
        }
    }

    return items.reduce(
        (total, item) => total + getItemTotal(item),
        0
    );
}

/* =========================================================
   IMAGE PATH
========================================================= */

function getImagePath(value) {
    if (!value) {
        return "";
    }

    let path = String(value).trim();

    // Support an HTML image tag accidentally stored as a string.
    const match = path.match(/src\s*=\s*["']([^"']+)["']/i);

    if (match) {
        path = match[1];
    }

    path = path.replace(/\\/g, "/");

    if (/^(https?:\/\/|data:|blob:)/i.test(path)) {
        return path;
    }

    if (path.startsWith("//")) {
        return path;
    }

    path = path.replace(/^\.\//, "");

    if (path.startsWith("/")) {
        return path;
    }

    return "/" + path;
}

/* =========================================================
   RENDER CART
========================================================= */

function renderCheckoutCart() {
    const container = getElement("checkoutItems");

    if (!container) {
        console.error(
            "Missing #checkoutItems in checkout.html."
        );
        return;
    }

    if (!checkoutCart.length) {
        container.innerHTML = `
            <div class="checkout-empty">
                <p>Your cart is empty.</p>
                <a href="shop.html">Continue Shopping</a>
            </div>
        `;

        return;
    }

    container.innerHTML = checkoutCart.map(item => {
        const name = escapeHTML(getItemName(item));
        const variant = escapeHTML(getItemVariant(item));
        const quantity = getItemQuantity(item);
        const total = getItemTotal(item);

        const imagePath = getImagePath(
            item.image_url ||
            item.image ||
            item.product_image ||
            item.product?.image ||
            ""
        );

        return `
            <div class="checkout-item">

                ${
                    imagePath
                        ? `
                            <img
                                class="checkout-item-image"
                                src="${escapeHTML(imagePath)}"
                                alt="${name}"
                                loading="lazy"
                                onerror="this.style.display='none'"
                            >
                        `
                        : ""
                }

                <div class="checkout-item-details">
                    <h4>${name}</h4>

                    ${
                        variant
                            ? `<p>${variant}</p>`
                            : ""
                    }

                    <p>Quantity: ${quantity}</p>
                </div>

                <div class="checkout-item-price">
                    ${formatCurrency(total)}
                </div>

            </div>
        `;
    }).join("");
}

/* =========================================================
   ORDER SUMMARY
========================================================= */

function updateCheckoutTotals(data = checkoutCartData) {
    checkoutSubtotal = getCartSubtotal(
        data,
        checkoutCart
    );

    const deliveryValue =
        data?.delivery_charge ??
        data?.delivery ??
        data?.cart?.delivery_charge;

    checkoutDelivery =
        deliveryValue !== undefined &&
        deliveryValue !== null &&
        deliveryValue !== ""
            ? Number(deliveryValue)
            : DELIVERY_CHARGE;

    if (
        !Number.isFinite(checkoutDelivery) ||
        checkoutDelivery < 0
    ) {
        checkoutDelivery = DELIVERY_CHARGE;
    }

    const totalValue =
        data?.total ??
        data?.grand_total ??
        data?.cart?.total;

    if (
        totalValue !== undefined &&
        totalValue !== null &&
        totalValue !== ""
    ) {
        const totalNumber = Number(totalValue);

        checkoutTotal =
            Number.isFinite(totalNumber) &&
            totalNumber >= 0
                ? totalNumber
                : checkoutSubtotal + checkoutDelivery;
    } else {
        checkoutTotal = checkoutSubtotal + checkoutDelivery;
    }

    setText(
        "checkoutSubtotal",
        formatCurrency(checkoutSubtotal)
    );

    setText(
        "checkoutTotal",
        formatCurrency(checkoutTotal)
    );

    const itemCount = checkoutCart.reduce(
        (count, item) => count + getItemQuantity(item),
        0
    );

    setText("checkoutItemCount", itemCount);

    document.querySelectorAll(
        "#deliveryMessage, #summaryDeliveryMessage"
    ).forEach(element => {
        element.textContent =
            checkoutDelivery === 0
                ? "Free delivery"
                : "Delivery: " +
                    formatCurrency(checkoutDelivery);
    });
}

/* =========================================================
   LOAD CART
========================================================= */

async function loadCheckoutCart() {
    const container = getElement("checkoutItems");
    const button = getElement("placeOrderBtn");

    if (container) {
        container.innerHTML = "<p>Loading your cart...</p>";
    }

    if (button) {
        button.disabled = true;
    }

    clearMessage();

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/cart`,
            {
                method: "GET",
                headers: getCartHeaders(),
                credentials: "same-origin",
                cache: "no-store"
            }
        );

        const data = await readJSONResponse(response);

        console.log("CHECKOUT CART RESPONSE:", data);

        if (
            !response.ok ||
            data.success === false
        ) {
            throw new Error(
                data.message ||
                data.error ||
                "Unable to load your cart."
            );
        }

        checkoutCartData = data;
        checkoutCart = getCartItems(data);

        renderCheckoutCart();
        updateCheckoutTotals(data);

        if (!checkoutCart.length) {
            showMessage(
                "Your cart is empty. Add products before checkout.",
                "error"
            );

            return;
        }

        if (button) {
            button.disabled = false;
        }
    } catch (error) {
        console.error("CART LOAD ERROR:", error);

        if (container) {
            container.innerHTML = `
                <div class="checkout-error">
                    <p>Unable to load your cart.</p>

                    <button
                        type="button"
                        id="retryCheckoutCart"
                    >
                        Retry
                    </button>
                </div>
            `;

            getElement("retryCheckoutCart")
                ?.addEventListener(
                    "click",
                    loadCheckoutCart
                );
        }

        showMessage(
            error.message || "Unable to load your cart.",
            "error"
        );
    }
}

/* =========================================================
   PAYMENT METHOD
========================================================= */

function getPaymentMethod() {
    const selected = document.querySelector(
        'input[name="paymentMethod"]:checked'
    );

    return selected ? selected.value : "cod";
}

function updatePaymentDisplay() {
    const method = getPaymentMethod();

    const upiBox = getElement("upiPaymentBox");

    if (upiBox) {
        upiBox.classList.toggle(
            "hidden",
            method !== "online"
        );
    }

    const referenceInput = getElement("paymentReference");

    if (referenceInput) {
        referenceInput.required = method === "online";
    }
}

/* =========================================================
   VALIDATE CHECKOUT
========================================================= */

function validateCheckout() {
    clearMessage();

    if (!checkoutCart.length) {
        showMessage(
            "Your cart is empty. Please add a product first.",
            "error"
        );

        return false;
    }

    const name = getCustomerName();
    const phone = getCustomerPhone();
    const email = getCustomerEmail();
    const address = getDeliveryAddress();
    const pincode = getDeliveryPincode();
    const city = getDeliveryCity();
    const state = getDeliveryState();

    if (!name) {
        showMessage("Please enter your full name.", "error");
        getElement("fullName")?.focus();
        return false;
    }

    if (!/^\d{10}$/.test(phone)) {
        showMessage(
            "Please enter a valid 10-digit mobile number.",
            "error"
        );

        getElement("phone")?.focus();

        return false;
    }

    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        getElement("email")?.focus();

        return false;
    }

    if (!address) {
        showMessage(
            "Please enter your complete delivery address.",
            "error"
        );

        getElement("address")?.focus();

        return false;
    }

    if (!/^\d{6}$/.test(pincode)) {
        showMessage(
            "Please enter a valid 6-digit PIN code.",
            "error"
        );

        getElement("pincode")?.focus();

        return false;
    }

    if (!city) {
        showMessage("Please enter your town or city.", "error");
        getElement("city")?.focus();
        return false;
    }

    if (!state) {
        showMessage("Please enter your state.", "error");
        getElement("state")?.focus();
        return false;
    }

    const method = getPaymentMethod();

    if (!["cod", "online"].includes(method)) {
        showMessage(
            "Please select a valid payment method.",
            "error"
        );

        return false;
    }

    if (method === "online") {
        const reference = getPaymentReference();

        if (!reference) {
            showMessage(
                "Please enter your UPI transaction ID after paying.",
                "error"
            );

            getElement("paymentReference")?.focus();

            return false;
        }

        if (
            reference.length < MIN_UTR_LENGTH ||
            reference.length > MAX_UTR_LENGTH
        ) {
            showMessage(
                `The transaction ID must contain ${MIN_UTR_LENGTH}–${MAX_UTR_LENGTH} letters or numbers.`,
                "error"
            );

            getElement("paymentReference")?.focus();

            return false;
        }
    }

    return true;
}

/* =========================================================
   CREATE ORDER PAYLOAD
========================================================= */

function createOrderPayload() {
    const method = getPaymentMethod();

    const reference =
        method === "online"
            ? getPaymentReference()
            : "";

    return {
        customer_name: getCustomerName(),
        name: getCustomerName(),

        phone: getCustomerPhone(),
        customer_phone: getCustomerPhone(),

        email: getCustomerEmail(),
        customer_email: getCustomerEmail(),

        address: getDeliveryAddress(),
        delivery_address: getDeliveryAddress(),

        city: getDeliveryCity(),
        state: getDeliveryState(),
        pincode: getDeliveryPincode(),

        landmark: getLandmark(),

        order_note: getOrderNote(),
        notes: getOrderNote(),

        payment_method: method,

        payment_reference: reference,
        transaction_id: reference,
        utr: reference
    };
}

/* =========================================================
   PLACE ORDER
========================================================= */

async function placeOrder(event) {
    if (event) {
        event.preventDefault();
    }

    if (isPlacingOrder) {
        return;
    }

    if (!validateCheckout()) {
        return;
    }

    const button = getElement("placeOrderBtn");

    isPlacingOrder = true;

    if (button) {
        button.disabled = true;

        button.dataset.originalText =
            button.innerHTML;

        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...';
    }

    showMessage(
        "Please wait while we place your order...",
        "info"
    );

    try {
        const payload = createOrderPayload();

        console.log("SUBMITTING ORDER:", {
            ...payload,
            payment_reference: payload.payment_reference
                ? "[provided]"
                : ""
        });

        const response = await fetch(
            `${API_BASE_URL}/api/orders`,
            {
                method: "POST",
                headers: getCartHeaders(true),
                credentials: "same-origin",
                cache: "no-store",
                body: JSON.stringify(payload)
            }
        );

        const result = await readJSONResponse(response);

        console.log("ORDER API RESPONSE:", result);

        if (!response.ok) {
            throw new Error(
                result.message ||
                result.error ||
                `Order failed. HTTP ${response.status}.`
            );
        }

        if (result.success !== true) {
            throw new Error(
                result.message ||
                result.error ||
                "The server did not confirm the order."
            );
        }

        const order = result.order || {};

        const orderId =
            order.order_id ??
            order.id ??
            result.order_id;

        if (
            orderId === undefined ||
            orderId === null ||
            orderId === ""
        ) {
            throw new Error(
                "The server returned success without an order ID. Check the backend response."
            );
        }

        console.log("ORDER CREATED:", orderId);

        /*
          The backend must explicitly return email_sent.
          A successful order does not guarantee email delivery.
        */

        const customerEmailSent =
            result.email_sent === true;

        if (result.email_sent === false) {
            console.error(
                "CUSTOMER EMAIL FAILED:",
                result.email_error || "No error details returned."
            );
        }

        if (result.admin_email_sent === false) {
            console.error(
                "STORE EMAIL FAILED:",
                result.admin_email_error || "No error details returned."
            );
        }

        let message =
            `Order ${orderId} was placed successfully.`;

        if (customerEmailSent) {
            message += " Confirmation email sent.";
        } else {
            message +=
                " Email delivery has not been confirmed. Please check your email configuration.";
        }

        showMessage(message, "success");

        /*
          Do not submit the order a second time if the server
          has already created it.
        */

        setTimeout(() => {
            window.location.href =
                "order-success.html?order=" +
                encodeURIComponent(String(orderId));
        }, 2000);

    } catch (error) {
        console.error("PLACE ORDER ERROR:", error);

        showMessage(
            error.message ||
            "Unable to place your order. Please try again.",
            "error"
        );

        isPlacingOrder = false;

        if (button) {
            button.disabled = false;

            button.innerHTML =
                button.dataset.originalText ||
                '<i class="fa-solid fa-lock"></i><span>Place Order</span>';
        }
    }
}

/* =========================================================
   PIN CODE LOOKUP
========================================================= */

async function lookupPincode() {
    const pincode = getDeliveryPincode();

    if (!/^\d{6}$/.test(pincode)) {
        showMessage(
            "Please enter a valid 6-digit PIN code first.",
            "error"
        );

        getElement("pincode")?.focus();

        return;
    }

    const button = getElement("checkPincodeBtn");

    if (button) {
        button.disabled = true;
        button.textContent = "Checking...";
    }

    try {
        const response = await fetch(
            `https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`
        );

        if (!response.ok) {
            throw new Error(
                "PIN code service is unavailable."
            );
        }

        const result = await response.json();

        if (
            !Array.isArray(result) ||
            result[0]?.Status !== "Success" ||
            !result[0]?.PostOffice?.length
        ) {
            showMessage(
                "PIN code not found. Please check it.",
                "error"
            );

            return;
        }

        const office = result[0].PostOffice[0];

        const cityInput = getElement("city");
        const stateInput = getElement("state");

        if (cityInput && !getDeliveryCity()) {
            cityInput.value =
                office.District ||
                office.Block ||
                "";
        }

        if (stateInput && !getDeliveryState()) {
            stateInput.value = office.State || "";
        }

        showMessage(
            `PIN code found: ${office.District || office.Block || ""}, ${office.State || ""}. Please verify your address.`,
            "success"
        );

    } catch (error) {
        console.error("PIN CODE LOOKUP ERROR:", error);

        showMessage(
            "PIN code lookup is unavailable. Please enter the city and state manually.",
            "error"
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Check PIN Code";
        }
    }
}

/* =========================================================
   WHATSAPP ORDER
========================================================= */

function buildWhatsAppMessage() {
    const lines = [
        "NEW ORDER - THE FRIENDS HERITAGE",
        "",
        "Customer: " + getCustomerName(),
        "Phone: " + getCustomerPhone(),
        "Email: " + (getCustomerEmail() || "Not provided"),
        "",
        "Delivery Address:",
        getDeliveryAddress(),
        "Landmark: " + (getLandmark() || "Not provided"),
        getDeliveryCity() + ", " + getDeliveryState(),
        "PIN Code: " + getDeliveryPincode(),
        "",
        "ORDER ITEMS:"
    ];

    checkoutCart.forEach(item => {
        const variant = getItemVariant(item);

        lines.push(
            "- " +
            getItemName(item) +
            (variant ? " (" + variant + ")" : "") +
            " x " +
            getItemQuantity(item) +
            " = " +
            formatCurrency(getItemTotal(item))
        );
    });

    lines.push(
        "",
        "Subtotal: " + formatCurrency(checkoutSubtotal),
        "Delivery: " + formatCurrency(checkoutDelivery),
        "Total: " + formatCurrency(checkoutTotal),
        "",
        "Payment Method: " +
            (
                getPaymentMethod() === "cod"
                    ? "Cash on Delivery"
                    : "UPI / Online"
            )
    );

    if (getPaymentMethod() === "online") {
        lines.push(
            "Transaction ID: " + getPaymentReference(),
            "Payment status: Pending verification"
        );
    }

    if (getOrderNote()) {
        lines.push(
            "",
            "Order Note: " + getOrderNote()
        );
    }

    return lines.join("\n");
}

function sendWhatsAppOrder() {
    if (!validateCheckout()) {
        return;
    }

    const message = buildWhatsAppMessage();

    const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    const newWindow = window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

    if (!newWindow) {
        showMessage(
            "Your browser blocked the WhatsApp window. Please allow pop-ups and try again.",
            "error"
        );
    }
}

/* =========================================================
   UPI TRANSACTION REFERENCE INPUT
========================================================= */

function setupPaymentReferenceInput() {
    const input = getElement("paymentReference");

    if (!input) {
        return;
    }

    input.maxLength = MAX_UTR_LENGTH;

    input.addEventListener("input", () => {
        input.value = input.value
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase()
            .slice(0, MAX_UTR_LENGTH);
    });
}

/* =========================================================
   PHONE INPUT
========================================================= */

function setupPhoneInput() {
    const input = getElement("phone");

    if (!input) {
        return;
    }

    input.addEventListener("input", () => {
        input.value = input.value
            .replace(/\D/g, "")
            .slice(0, 10);
    });
}

/* =========================================================
   PIN CODE INPUT
========================================================= */

function setupPincodeInput() {
    const input = getElement("pincode");

    if (!input) {
        return;
    }

    input.addEventListener("input", () => {
        input.value = input.value
            .replace(/\D/g, "")
            .slice(0, 6);
    });
}

/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupCheckoutEvents() {
    document.querySelectorAll(
        'input[name="paymentMethod"]'
    ).forEach(radio => {
        radio.addEventListener(
            "change",
            updatePaymentDisplay
        );
    });

    const placeOrderButton = getElement("placeOrderBtn");

    if (placeOrderButton) {
        placeOrderButton.addEventListener(
            "click",
            placeOrder
        );
    }

    const whatsappButton = getElement("whatsappOrderBtn");

    if (whatsappButton) {
        whatsappButton.addEventListener(
            "click",
            sendWhatsAppOrder
        );
    }

    const pincodeButton = getElement("checkPincodeBtn");

    if (pincodeButton) {
        pincodeButton.addEventListener(
            "click",
            lookupPincode
        );
    }

    setupPaymentReferenceInput();
    setupPhoneInput();
    setupPincodeInput();

    updatePaymentDisplay();
}

/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    console.log(
        "THE FRIENDS HERITAGE CHECKOUT INITIALIZED"
    );

    try {
        getCartToken();

        setupCheckoutEvents();

        await loadCheckoutCart();

        console.log(
            "THE FRIENDS HERITAGE CHECKOUT READY"
        );

    } catch (error) {
        console.error(
            "CHECKOUT INITIALIZATION ERROR:",
            error
        );

        showMessage(
            "Checkout could not initialize. Refresh the page and try again.",
            "error"
        );
    }
});

