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


    // Close menu when a navigation link is clicked
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


// ---------------------------------------------------------
// SHOW SLIDE
// ---------------------------------------------------------

function showSlide(index) {

    if (!slides.length) {
        return;
    }

    slides.forEach(slide => {
        slide.classList.remove("active");
    });

    dots.forEach(dot => {
        dot.classList.remove("active");
    });


    if (index >= slides.length) {
        index = 0;
    }

    if (index < 0) {
        index = slides.length - 1;
    }


    slides[index].classList.add("active");


    if (dots[index]) {
        dots[index].classList.add("active");
    }


    currentSlide = index;
}



// ---------------------------------------------------------
// NEXT SLIDE
// ---------------------------------------------------------

function nextSlide() {

    if (!slides.length) {
        return;
    }

    currentSlide =
        (currentSlide + 1) % slides.length;

    showSlide(currentSlide);
}



// ---------------------------------------------------------
// PREVIOUS SLIDE
// ---------------------------------------------------------

function prevSlide() {

    if (!slides.length) {
        return;
    }

    currentSlide =
        (currentSlide - 1 + slides.length) %
        slides.length;

    showSlide(currentSlide);
}



// ---------------------------------------------------------
// START AUTO SLIDER
// ---------------------------------------------------------

function startSlider() {

    if (!slides.length) {
        return;
    }

    clearInterval(autoSlide);

    autoSlide = setInterval(() => {

        nextSlide();

    }, 3000);
}



// ---------------------------------------------------------
// STOP AUTO SLIDER
// ---------------------------------------------------------

function stopSlider() {

    clearInterval(autoSlide);
}



// =========================================================
// SLIDER BUTTONS
// =========================================================

const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");


// NEXT BUTTON

if (nextBtn) {

    nextBtn.addEventListener("click", () => {

        stopSlider();

        nextSlide();

        startSlider();

    });

}



// PREVIOUS BUTTON

if (prevBtn) {

    prevBtn.addEventListener("click", () => {

        stopSlider();

        prevSlide();

        startSlider();

    });

}



// =========================================================
// SLIDER DOTS
// =========================================================

dots.forEach((dot, index) => {

    dot.addEventListener("click", () => {

        stopSlider();

        showSlide(index);

        startSlider();

    });

});



// =========================================================
// PAUSE SLIDER ON HOVER
// =========================================================

const slider = document.querySelector(".slider");

if (slider) {

    slider.addEventListener("mouseenter", () => {

        stopSlider();

    });


    slider.addEventListener("mouseleave", () => {

        startSlider();

    });

}



// =========================================================
// START SLIDER
// =========================================================

if (slides.length) {

    showSlide(0);

    startSlider();

}



// =========================================================
// SOCIAL APP LINKS
//
// MOBILE:
// App installed     → Open App
// App not installed → Open Store
//
// DESKTOP:
// Open Website
// =========================================================

document.addEventListener("DOMContentLoaded", () => {


    const appLinks =
        document.querySelectorAll(".app-link");


    appLinks.forEach(link => {


        link.addEventListener("click", function (event) {

            event.preventDefault();


            // -------------------------------------------------
            // GET DATA FROM HTML
            // -------------------------------------------------

            const app =
                this.dataset.app;

            const androidStore =
                this.dataset.androidStore;

            const iosStore =
                this.dataset.iosStore;

            const phone =
                this.dataset.phone;


            // -------------------------------------------------
            // DEVICE DETECTION
            // -------------------------------------------------

            const userAgent =
                navigator.userAgent ||
                navigator.vendor ||
                window.opera;


            const isAndroid =
                /android/i.test(userAgent);


            const isIOS =
                /iPad|iPhone|iPod/.test(userAgent) &&
                !window.MSStream;


            const isMobile =
                isAndroid || isIOS;



            // =================================================
            // DESKTOP
            // =================================================

            if (!isMobile) {


                if (app === "instagram") {

                    window.open(
                        "https://www.instagram.com/friends_heritage/",
                        "_blank",
                        "noopener,noreferrer"
                    );

                }


                else if (app === "facebook") {

                    window.open(
                        "https://www.facebook.com/friends_heritage",
                        "_blank",
                        "noopener,noreferrer"
                    );

                }


                else if (app === "whatsapp") {

                    window.open(
                        "https://wa.me/" + phone,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }


                return;

            }



            // =================================================
            // ANDROID
            // =================================================

            if (isAndroid) {


                let intentURL = "";


                // -------------------------------------------------
                // INSTAGRAM
                // -------------------------------------------------

                if (app === "instagram") {

                    intentURL =
                        "intent://user?username=friends_heritage" +
                        "#Intent;" +
                        "scheme=instagram;" +
                        "package=com.instagram.android;" +
                        "S.browser_fallback_url=" +
                        encodeURIComponent(androidStore) +
                        ";" +
                        "end";

                }


                // -------------------------------------------------
                // FACEBOOK
                // -------------------------------------------------

                else if (app === "facebook") {

                    intentURL =
                        "intent://profile/friends_heritage" +
                        "#Intent;" +
                        "scheme=fb;" +
                        "package=com.facebook.katana;" +
                        "S.browser_fallback_url=" +
                        encodeURIComponent(androidStore) +
                        ";" +
                        "end";

                }


                // -------------------------------------------------
                // WHATSAPP
                // -------------------------------------------------

                else if (app === "whatsapp") {

                    intentURL =
                        "intent://send?phone=" +
                        phone +
                        "#Intent;" +
                        "scheme=whatsapp;" +
                        "package=com.whatsapp;" +
                        "S.browser_fallback_url=" +
                        encodeURIComponent(androidStore) +
                        ";" +
                        "end";

                }


                // -------------------------------------------------
                // OPEN ANDROID APP
                // -------------------------------------------------

                if (intentURL) {

                    window.location.href =
                        intentURL;

                }


                return;

            }



            // =================================================
            // iPHONE / iPAD
            // =================================================

            if (isIOS) {


                let appURL = "";


                // -------------------------------------------------
                // INSTAGRAM
                // -------------------------------------------------

                if (app === "instagram") {

                    appURL =
                        "instagram://user?username=friends_heritage";

                }


                // -------------------------------------------------
                // FACEBOOK
                // -------------------------------------------------

                else if (app === "facebook") {

                    appURL =
                        "fb://profile/friends_heritage";

                }


                // -------------------------------------------------
                // WHATSAPP
                // -------------------------------------------------

                else if (app === "whatsapp") {

                    appURL =
                        "whatsapp://send?phone=" +
                        phone;

                }


                if (!appURL) {
                    return;
                }


                // -------------------------------------------------
                // TRY TO OPEN APP
                // -------------------------------------------------

                const startTime =
                    Date.now();


                window.location.href =
                    appURL;


                // -------------------------------------------------
                // APP NOT INSTALLED
                // OPEN APP STORE
                // -------------------------------------------------

                setTimeout(() => {


                    const elapsedTime =
                        Date.now() - startTime;


                    /*
                     * If the browser is still active,
                     * the app probably did not open.
                     */

                    if (
                        elapsedTime >= 1500 &&
                        document.visibilityState === "visible"
                    ) {

                        if (iosStore) {

                            window.location.href =
                                iosStore;

                        }

                    }


                }, 1800);

            }

        });

    });

});
