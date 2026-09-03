console.log("Script is working");


// =========================================================
// MOBILE MENU
// =========================================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    const menuItems = navLinks.querySelectorAll("a");

    menuItems.forEach(link => {

        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });

    });

}


// =========================================================
// SLIDER
// =========================================================

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

let currentSlide = 0;
let autoSlide = null;


function showSlide(index) {

    if (!slides.length) {
        return;
    }

    if (index >= slides.length) {
        index = 0;
    }

    if (index < 0) {
        index = slides.length - 1;
    }

    slides.forEach(slide => {
        slide.classList.remove("active");
    });

    dots.forEach(dot => {
        dot.classList.remove("active");
    });

    slides[index].classList.add("active");

    if (dots[index]) {
        dots[index].classList.add("active");
    }

    currentSlide = index;
}


function nextSlide() {

    if (!slides.length) {
        return;
    }

    showSlide(currentSlide + 1);
}


function prevSlide() {

    if (!slides.length) {
        return;
    }

    showSlide(currentSlide - 1);
}


function startSlider() {

    if (!slides.length) {
        return;
    }

    clearInterval(autoSlide);

    autoSlide = setInterval(() => {
        nextSlide();
    }, 3000);
}


function stopSlider() {
    clearInterval(autoSlide);
}


const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");


if (nextBtn) {

    nextBtn.addEventListener("click", () => {

        stopSlider();

        nextSlide();

        startSlider();

    });

}


if (prevBtn) {

    prevBtn.addEventListener("click", () => {

        stopSlider();

        prevSlide();

        startSlider();

    });

}


dots.forEach((dot, index) => {

    dot.addEventListener("click", () => {

        stopSlider();

        showSlide(index);

        startSlider();

    });

});


const slider = document.querySelector(".slider");

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


if (slides.length) {

    showSlide(0);

    startSlider();

}


// =========================================================
// CART SYSTEM
// =========================================================

let cart = JSON.parse(
    localStorage.getItem("friendsHeritageCart")
) || [];


// =========================================================
// CART ELEMENTS
// =========================================================

const cartCountElements =
    document.querySelectorAll(
        ".cart-count, #cartCount"
    );


const cartItemsContainer =
    document.getElementById("cartItems");


const cartItemsCount =
    document.getElementById("cartItemsCount");


const cartSubtotal =
    document.getElementById("cartSubtotal");


const cartTotal =
    document.getElementById("cartTotal");


const emptyCart =
    document.getElementById("emptyCart");


const checkoutBtn =
    document.querySelector(".checkout-btn");


// =========================================================
// SAVE CART
// =========================================================

function saveCart() {

    localStorage.setItem(
        "friendsHeritageCart",
        JSON.stringify(cart)
    );

}


// =========================================================
// UPDATE CART COUNT
// =========================================================

function updateCartCount() {

    const totalItems = cart.reduce(
        (total, item) => {

            return total +
                Number(item.quantity || 0);

        },
        0
    );


    cartCountElements.forEach(element => {

        element.textContent =
            totalItems;

    });

}


// =========================================================
// ADD TO CART
// =========================================================

const addToCartButtons =
    document.querySelectorAll(
        ".add-to-cart"
    );


addToCartButtons.forEach(button => {

    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const name =
                this.dataset.name;


            const price =
                Number(
                    this.dataset.price
                );


            const image =
                this.dataset.image;


            if (!name || !price) {
                return;
            }


            const existingProduct =
                cart.find(
                    item =>
                        item.name === name
                );


            if (existingProduct) {

                existingProduct.quantity += 1;

            }

            else {

                cart.push({

                    name: name,

                    price: price,

                    image: image,

                    quantity: 1

                });

            }


            saveCart();

            updateCartCount();

            showAddedMessage(this);

        }
    );

});


// =========================================================
// ADDED TO CART MESSAGE
// =========================================================

function showAddedMessage(button) {

    const originalText =
        button.textContent;


    button.textContent =
        "Added ✓";


    button.style.pointerEvents =
        "none";


    setTimeout(() => {

        button.textContent =
            originalText;


        button.style.pointerEvents =
            "auto";

    }, 1200);

}


// =========================================================
// DISPLAY CART
// =========================================================

function displayCart() {

    if (!cartItemsContainer) {
        return;
    }


    cartItemsContainer.innerHTML = "";


    if (cart.length === 0) {

        if (emptyCart) {

            emptyCart.style.display =
                "block";

        }


        updateCartTotals();

        return;
    }


    if (emptyCart) {

        emptyCart.style.display =
            "none";

    }


    cart.forEach((item, index) => {

        const cartItem =
            document.createElement("div");


        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <div class="cart-product-image">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

            </div>


            <div class="cart-product-info">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    ₹${Number(item.price).toLocaleString("en-IN")} / unit
                </p>

            </div>


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
                    ${item.quantity}
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


            <div class="cart-item-price">

                ₹${(
                    Number(item.price) *
                    Number(item.quantity)
                ).toLocaleString("en-IN")}

            </div>


            <button
                type="button"
                class="remove-item"
                data-index="${index}"
                aria-label="Remove ${item.name}"
                title="Remove ${item.name}"
            >

                <i class="fa-solid fa-trash"></i>

            </button>

        `;


        cartItemsContainer.appendChild(
            cartItem
        );

    });


    addCartButtonEvents();

    updateCartTotals();

}


// =========================================================
// QUANTITY + / - AND REMOVE
// =========================================================

function addCartButtonEvents() {

    const increaseButtons =
        document.querySelectorAll(
            ".increase-btn"
        );


    const decreaseButtons =
        document.querySelectorAll(
            ".decrease-btn"
        );


    const removeButtons =
        document.querySelectorAll(
            ".remove-item"
        );


    // =====================================================
    // INCREASE
    // =====================================================

    increaseButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        button.dataset.index
                    );


                if (!cart[index]) {
                    return;
                }


                cart[index].quantity += 1;


                saveCart();

                displayCart();

                updateCartCount();

            }
        );

    });


    // =====================================================
    // DECREASE
    // =====================================================

    decreaseButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        button.dataset.index
                    );


                if (!cart[index]) {
                    return;
                }


                if (
                    cart[index].quantity > 1
                ) {

                    cart[index].quantity -= 1;

                }

                else {

                    cart.splice(
                        index,
                        1
                    );

                }


                saveCart();

                displayCart();

                updateCartCount();

            }
        );

    });


    // =====================================================
    // REMOVE PRODUCT
    // =====================================================

    removeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

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

                updateCartCount();

            }
        );

    });

}


// =========================================================
// CART TOTALS
// =========================================================

function updateCartTotals() {

    const totalItems =
        cart.reduce(
            (total, item) => {

                return total +
                    Number(
                        item.quantity || 0
                    );

            },
            0
        );


    const subtotal =
        cart.reduce(
            (total, item) => {

                return total +
                    (
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                    );

            },
            0
        );


    if (cartItemsCount) {

        cartItemsCount.textContent =
            totalItems;

    }


    if (cartSubtotal) {

        cartSubtotal.textContent =
            "₹" +
            subtotal.toLocaleString(
                "en-IN"
            );

    }


    if (cartTotal) {

        cartTotal.textContent =
            "₹" +
            subtotal.toLocaleString(
                "en-IN"
            );

    }

}


// =========================================================
// CART PAGE
// =========================================================

if (cartItemsContainer) {

    displayCart();

}


// =========================================================
// INITIAL CART COUNT
// =========================================================

updateCartCount();


// =========================================================
// CART ICON
// =========================================================

const cartIcon =
    document.querySelector(
        ".cart-icon"
    );


if (cartIcon) {

    cartIcon.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            window.location.href =
                "cart.html";

        }
    );

}


// =========================================================
// CHECKOUT
// =========================================================
//
// IMPORTANT:
// Your cart is stored using:
//
// friendsHeritageCart
//
// If products exist in the cart,
// clicking Proceed to Checkout
// will now open checkout.html.
//
// No unnecessary alert.
//

if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            // ---------------------------------------------
            // CHECK EMPTY CART
            // ---------------------------------------------

            if (
                !Array.isArray(cart) ||
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty. Please add a product first."
                );

                return;

            }


            // ---------------------------------------------
            // SAVE CART BEFORE CHECKOUT
            // ---------------------------------------------

            saveCart();


            // ---------------------------------------------
            // OPEN CHECKOUT PAGE
            // ---------------------------------------------

            window.location.href =
                "checkout.html";

        }
    );

}


// =========================================================
// SOCIAL APP LINKS
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const appLinks =
            document.querySelectorAll(
                ".app-link"
            );


        appLinks.forEach(link => {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const app =
                        this.dataset.app;


                    const androidStore =
                        this.dataset.androidStore;


                    const iosStore =
                        this.dataset.iosStore;


                    const phone =
                        this.dataset.phone;


                    const userAgent =
                        navigator.userAgent ||
                        navigator.vendor ||
                        window.opera;


                    const isAndroid =
                        /android/i.test(
                            userAgent
                        );


                    const isIOS =
                        /iPad|iPhone|iPod/.test(
                            userAgent
                        ) &&
                        !window.MSStream;


                    const isMobile =
                        isAndroid ||
                        isIOS;


                    // =========================================
                    // DESKTOP
                    // =========================================

                    if (!isMobile) {

                        if (
                            app ===
                            "instagram"
                        ) {

                            window.open(
                                "https://www.instagram.com/friends_heritage/",
                                "_blank",
                                "noopener,noreferrer"
                            );

                        }


                        else if (
                            app ===
                            "facebook"
                        ) {

                            window.open(
                                "https://www.facebook.com/friends_heritage",
                                "_blank",
                                "noopener,noreferrer"
                            );

                        }


                        else if (
                            app ===
                            "whatsapp"
                        ) {

                            window.open(
                                "https://wa.me/" +
                                phone,
                                "_blank",
                                "noopener,noreferrer"
                            );

                        }


                        return;

                    }


                    // =========================================
                    // ANDROID
                    // =========================================

                    if (isAndroid) {

                        let intentURL = "";


                        if (
                            app ===
                            "instagram"
                        ) {

                            intentURL =
                                "intent://user?username=friends_heritage" +
                                "#Intent;" +
                                "scheme=instagram;" +
                                "package=com.instagram.android;" +
                                "S.browser_fallback_url=" +
                                encodeURIComponent(
                                    androidStore
                                ) +
                                ";" +
                                "end";

                        }


                        else if (
                            app ===
                            "facebook"
                        ) {

                            intentURL =
                                "intent://profile/friends_heritage" +
                                "#Intent;" +
                                "scheme=fb;" +
                                "package=com.facebook.katana;" +
                                "S.browser_fallback_url=" +
                                encodeURIComponent(
                                    androidStore
                                ) +
                                ";" +
                                "end";

                        }


                        else if (
                            app ===
                            "whatsapp"
                        ) {

                            intentURL =
                                "intent://send?phone=" +
                                phone +
                                "#Intent;" +
                                "scheme=whatsapp;" +
                                "package=com.whatsapp;" +
                                "S.browser_fallback_url=" +
                                encodeURIComponent(
                                    androidStore
                                ) +
                                ";" +
                                "end";

                        }


                        if (intentURL) {

                            window.location.href =
                                intentURL;

                        }


                        return;

                    }


                    // =========================================
                    // iOS
                    // =========================================

                    if (isIOS) {

                        let appURL = "";


                        if (
                            app ===
                            "instagram"
                        ) {

                            appURL =
                                "instagram://user?username=friends_heritage";

                        }


                        else if (
                            app ===
                            "facebook"
                        ) {

                            appURL =
                                "fb://profile/friends_heritage";

                        }


                        else if (
                            app ===
                            "whatsapp"
                        ) {

                            appURL =
                                "whatsapp://send?phone=" +
                                phone;

                        }


                        if (!appURL) {
                            return;
                        }


                        const startTime =
                            Date.now();


                        window.location.href =
                            appURL;


                        setTimeout(
                            () => {

                                const elapsedTime =
                                    Date.now() -
                                    startTime;


                                if (
                                    elapsedTime >= 1500 &&
                                    document.visibilityState ===
                                    "visible"
                                ) {

                                    if (iosStore) {

                                        window.location.href =
                                            iosStore;

                                    }

                                }

                            },
                            1800
                        );

                    }

                }
            );

        });

    }
);
