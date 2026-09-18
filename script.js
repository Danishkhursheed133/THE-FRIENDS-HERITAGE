/* =========================================================
   THE FRIENDS HERITAGE
   MAIN SCRIPT.JS
========================================================= */


/* =========================================================
   CART STORAGE
========================================================= */

const CART_STORAGE_KEY = "friendsHeritageCart";


/* =========================================================
   MOBILE NAVBAR
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (!menuToggle || !navLinks) {
        return;
    }

    menuToggle.addEventListener("click", function () {

        navLinks.classList.toggle("active");

    });


    const menuItems = navLinks.querySelectorAll("a");

    menuItems.forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("active");

        });

    });

});


/* =========================================================
   HERO SLIDER
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");

    const nextButton = document.querySelector(".next");
    const prevButton = document.querySelector(".prev");

    const slider = document.querySelector(".slider");

    if (!slides.length) {
        return;
    }

    let currentSlide = 0;
    let sliderInterval = null;


    /* =====================================================
       SHOW SLIDE
    ===================================================== */

    function showSlide(index) {

        if (index >= slides.length) {

            currentSlide = 0;

        } else if (index < 0) {

            currentSlide = slides.length - 1;

        } else {

            currentSlide = index;

        }


        slides.forEach(function (slide) {

            slide.classList.remove("active");

        });


        dots.forEach(function (dot) {

            dot.classList.remove("active");

        });


        slides[currentSlide].classList.add("active");


        if (dots[currentSlide]) {

            dots[currentSlide].classList.add("active");

        }

    }


    /* =====================================================
       NEXT SLIDE
    ===================================================== */

    function nextSlide() {

        showSlide(currentSlide + 1);

    }


    /* =====================================================
       PREVIOUS SLIDE
    ===================================================== */

    function previousSlide() {

        showSlide(currentSlide - 1);

    }


    /* =====================================================
       START SLIDER
    ===================================================== */

    function startSlider() {

        clearInterval(sliderInterval);

        sliderInterval = setInterval(function () {

            nextSlide();

        }, 3000);

    }


    /* =====================================================
       STOP SLIDER
    ===================================================== */

    function stopSlider() {

        clearInterval(sliderInterval);

    }


    /* =====================================================
       NEXT BUTTON
    ===================================================== */

    if (nextButton) {

        nextButton.addEventListener("click", function () {

            nextSlide();

            startSlider();

        });

    }


    /* =====================================================
       PREVIOUS BUTTON
    ===================================================== */

    if (prevButton) {

        prevButton.addEventListener("click", function () {

            previousSlide();

            startSlider();

        });

    }


    /* =====================================================
       DOTS
    ===================================================== */

    dots.forEach(function (dot, index) {

        dot.addEventListener("click", function () {

            showSlide(index);

            startSlider();

        });

    });


    /* =====================================================
       PAUSE ON HOVER
    ===================================================== */

    if (slider) {

        slider.addEventListener("mouseenter", function () {

            stopSlider();

        });


        slider.addEventListener("mouseleave", function () {

            startSlider();

        });

    }


    /* =====================================================
       START
    ===================================================== */

    showSlide(0);

    startSlider();

});


/* =========================================================
   HOMEPAGE ADD TO CART
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const addToCartButtons =
        document.querySelectorAll(".add-to-cart");


    if (!addToCartButtons.length) {

        updateCartCount();

        return;

    }


    addToCartButtons.forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.preventDefault();


            /* =================================================
               PRODUCT DATA
            ================================================= */

            const productName =
                button.dataset.name;

            const productPrice =
                Number(button.dataset.price);

            const productOldPrice =
                Number(button.dataset.oldPrice || 0);

            const productWeight =
                button.dataset.weight;

            const productImage =
                button.dataset.image;


            /* =================================================
               CHECK PRODUCT DATA
            ================================================= */

            if (
                !productName ||
                !productPrice ||
                !productWeight ||
                !productImage
            ) {

                console.error(
                    "Product information is missing."
                );

                return;

            }


            /* =================================================
               GET CART
            ================================================= */

            let cart = getCart();


            /* =================================================
               FIND EXISTING PRODUCT
            ================================================= */

            let existingProduct = cart.find(function (item) {

                return (
                    item.name === productName &&
                    item.weight === productWeight
                );

            });


            /* =================================================
               UPDATE OR ADD PRODUCT
            ================================================= */

            if (existingProduct) {

                existingProduct.quantity =
                    Number(existingProduct.quantity || 0) + 1;

            } else {

                cart.push({

                    name: productName,

                    price: productPrice,

                    oldPrice: productOldPrice,

                    weight: productWeight,

                    image: productImage,

                    quantity: 1

                });

            }


            /* =================================================
               SAVE CART
            ================================================= */

            saveCart(cart);


            /* =================================================
               UPDATE CART NUMBER
            ================================================= */

            updateCartCount();


            /* =================================================
               BUTTON FEEDBACK
            ================================================= */

            const oldButtonText =
                button.textContent;

            button.textContent = "Added ✓";


            setTimeout(function () {

                button.textContent =
                    oldButtonText;

            }, 1200);

        });

    });


    updateCartCount();

});


/* =========================================================
   GET CART FROM LOCAL STORAGE
========================================================= */

function getCart() {

    try {

        const savedCart =
            localStorage.getItem(CART_STORAGE_KEY);


        if (!savedCart) {

            return [];

        }


        const cart =
            JSON.parse(savedCart);


        if (!Array.isArray(cart)) {

            return [];

        }


        return cart;

    } catch (error) {

        console.error(
            "Error reading cart:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE CART TO LOCAL STORAGE
========================================================= */

function saveCart(cart) {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "Error saving cart:",
            error
        );

    }

}


/* =========================================================
   UPDATE CART BADGE
========================================================= */

function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");


    if (!cartCount) {

        return;

    }


    const cart =
        getCart();


    let totalQuantity = 0;


    cart.forEach(function (item) {

        totalQuantity +=
            Number(item.quantity || 0);

    });


    cartCount.textContent =
        totalQuantity;

}


/* =========================================================
   UPDATE CART BADGE WHEN STORAGE CHANGES
========================================================= */

window.addEventListener("storage", function () {

    updateCartCount();

});


/* =========================================================
   SOCIAL APP LINKS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const appLinks =
        document.querySelectorAll(".app-link");


    if (!appLinks.length) {

        return;

    }


    appLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();


            const app =
                link.dataset.app;

            const androidStore =
                link.dataset.androidStore;

            const iosStore =
                link.dataset.iosStore;


            /* =================================================
               INSTAGRAM
            ================================================= */

            if (app === "instagram") {

                const instagramWeb =
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


            /* =================================================
               FACEBOOK
            ================================================= */

            else if (app === "facebook") {

                const facebookWeb =
                    "https://www.facebook.com/";

                const facebookApp =
                    "fb://facewebmodal/f?href=https://www.facebook.com/";


                openSocialApp(
                    facebookApp,
                    facebookWeb,
                    androidStore,
                    iosStore
                );

            }


            /* =================================================
               WHATSAPP
            ================================================= */

            else if (app === "whatsapp") {

                const whatsappNumber =
                    "917051713047";

                const whatsappWeb =
                    "https://wa.me/" + whatsappNumber;

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

        });

    });


    /* =====================================================
       OPEN SOCIAL APP
    ===================================================== */

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


        /* =================================================
           ANDROID
        ================================================= */

        if (/android/i.test(userAgent)) {

            window.location.href =
                appUrl;


            setTimeout(function () {

                if (androidStore) {

                    window.location.href =
                        androidStore;

                }

            }, 1200);


            return;

        }


        /* =================================================
           IOS
        ================================================= */

        if (
            /iPad|iPhone|iPod/.test(userAgent) &&
            !window.MSStream
        ) {

            window.location.href =
                appUrl;


            setTimeout(function () {

                if (iosStore) {

                    window.location.href =
                        iosStore;

                }

            }, 1200);


            return;

        }


        /* =================================================
           DESKTOP
        ================================================= */

        window.open(
            webUrl,
            "_blank",
            "noopener,noreferrer"
        );

    }

});


/* =========================================================
   END OF MAIN SCRIPT.JS
========================================================= */
