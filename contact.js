
/* =========================================================
   THE FRIENDS HERITAGE
   CONTACT.JS

   Handles:
   1. Contact form validation
   2. EmailJS message sending
   3. WhatsApp contact links
   4. Google Maps location
   5. Form success/error messages
   6. Mobile navbar
   7. Cart count

   IMPORTANT:
   This file does NOT create, replace or rebuild
   any contact-section HTML.
========================================================= */


document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       CONTACT DETAILS
    ===================================================== */

    const WHATSAPP_NUMBER = "917051713047";

    const GOOGLE_MAPS_LINK =
        "https://maps.app.goo.gl/rPCPKxDmuQR2C9sz6";


    /* =====================================================
       CONTACT FORM ELEMENTS
    ===================================================== */

    const contactForm =
        document.getElementById("contactForm");

    const formMessage =
        document.getElementById("formMessage");


    /* =====================================================
       CONTACT FORM
    ===================================================== */

    if (contactForm) {

        contactForm.addEventListener("submit", function (event) {

            event.preventDefault();


            /* =============================================
               GET FORM VALUES
            ============================================= */

            const name =
                document.getElementById("name")?.value.trim() || "";

            const email =
                document.getElementById("email")?.value.trim() || "";

            const phone =
                document.getElementById("phone")?.value.trim() || "";

            const subject =
                document.getElementById("subject")?.value.trim() || "";

            const message =
                document.getElementById("message")?.value.trim() || "";


            /* =============================================
               VALIDATION
            ============================================= */

            if (name.length < 2) {

                showFormMessage(
                    "Please enter your name.",
                    "error"
                );

                return;
            }


            /* =============================================
               EMAIL VALIDATION
            ============================================= */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                showFormMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            /* =============================================
               PHONE VALIDATION
            ============================================= */

            if (phone !== "") {

                const cleanPhone =
                    phone.replace(/[\s\-()+]/g, "");

                if (
                    !/^\d{10,15}$/.test(cleanPhone)
                ) {

                    showFormMessage(
                        "Please enter a valid phone number.",
                        "error"
                    );

                    return;
                }
            }


            /* =============================================
               SUBJECT VALIDATION
            ============================================= */

            if (subject.length < 2) {

                showFormMessage(
                    "Please enter a subject.",
                    "error"
                );

                return;
            }


            /* =============================================
               MESSAGE VALIDATION
            ============================================= */

            if (message.length < 5) {

                showFormMessage(
                    "Please enter your message.",
                    "error"
                );

                return;
            }


            /* =============================================
               CHECK EMAILJS
            ============================================= */

            if (
                typeof emailjs === "undefined"
            ) {

                console.error(
                    "EmailJS is not loaded."
                );

                showFormMessage(
                    "Email service is currently unavailable. Please contact us through WhatsApp.",
                    "error"
                );

                return;
            }


            /* =============================================
               SEND BUTTON
            ============================================= */

            const sendButton =
                contactForm.querySelector(
                    ".send-btn"
                );


            let originalButtonHTML = "";


            if (sendButton) {

                originalButtonHTML =
                    sendButton.innerHTML;

                sendButton.disabled = true;

                sendButton.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Sending...</span>
                `;
            }


            /* =============================================
               EMAILJS TEMPLATE DATA
            ============================================= */

            const templateParams = {

                name: name,

                email: email,

                phone: phone,

                subject: subject,

                message: message

            };


            console.log(
                "Sending contact message...",
                templateParams
            );


            /* =============================================
               SEND EMAIL USING EMAILJS
            ============================================= */

            emailjs.send(
                "service_whmjkcc",
                "template_g5kn94j",
                templateParams
            )

            .then(function (response) {

                console.log(
                    "EmailJS Success:",
                    response.status,
                    response.text
                );


                /* =========================================
                   SUCCESS MESSAGE
                ========================================= */

                showFormMessage(
                    "Thank you! Your message has been sent successfully. We will get back to you soon.",
                    "success"
                );


                /* =========================================
                   RESET FORM
                ========================================= */

                contactForm.reset();


                /* =========================================
                   RESTORE BUTTON
                ========================================= */

                if (sendButton) {

                    sendButton.disabled = false;

                    sendButton.innerHTML =
                        originalButtonHTML;
                }

            })

            .catch(function (error) {

                console.error(
                    "EmailJS Error:",
                    error
                );


                /* =========================================
                   ERROR MESSAGE
                ========================================= */

                showFormMessage(
                    "Unable to send your message right now. Please try again or contact us through WhatsApp.",
                    "error"
                );


                /* =========================================
                   RESTORE BUTTON
                ========================================= */

                if (sendButton) {

                    sendButton.disabled = false;

                    sendButton.innerHTML =
                        originalButtonHTML;
                }

            });

        });

    }


    /* =====================================================
       FORM MESSAGE FUNCTION
    ===================================================== */

    function showFormMessage(message, type) {

        if (!formMessage) {
            return;
        }


        formMessage.textContent = message;

        formMessage.className =
            "form-message " + type;

        formMessage.style.display = "block";


        /* =============================================
           REMOVE OLD TIMER
        ============================================= */

        if (window.contactMessageTimer) {

            clearTimeout(
                window.contactMessageTimer
            );
        }


        /* =============================================
           HIDE MESSAGE AFTER 6 SECONDS
        ============================================= */

        window.contactMessageTimer =
            setTimeout(function () {

                formMessage.style.display =
                    "none";

            }, 6000);

    }


    /* =====================================================
       WHATSAPP LINKS
       
       Works with your existing HTML because your
       WhatsApp links already contain:
       
       https://wa.me/917051713047
    ===================================================== */

    const whatsappLinks =
        document.querySelectorAll(
            'a[href*="wa.me/917051713047"]'
        );


    whatsappLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            /*
             * Do not prevent the default action.
             * Your existing WhatsApp URL is already correct.
             */

            console.log(
                "Opening WhatsApp..."
            );

        });

    });


    /* =====================================================
       GOOGLE MAPS LOCATION
       
       Your existing HTML already contains the correct
       Google Maps link, so we don't need to create
       another location button.
    ===================================================== */

    const locationLinks =
        document.querySelectorAll(
            'a[href*="maps.app.goo.gl"]'
        );


    locationLinks.forEach(function (link) {

        link.setAttribute(
            "href",
            GOOGLE_MAPS_LINK
        );

        link.setAttribute(
            "target",
            "_blank"
        );

        link.setAttribute(
            "rel",
            "noopener noreferrer"
        );

    });


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    const menuToggle =
        document.getElementById("menuToggle");

    const navLinks =
        document.getElementById("navLinks");


    if (menuToggle && navLinks) {

        menuToggle.addEventListener(
            "click",
            function () {

                navLinks.classList.toggle(
                    "active"
                );

            }
        );


        /* =============================================
           CLOSE MENU WHEN LINK IS CLICKED
        ============================================= */

        const navigationLinks =
            navLinks.querySelectorAll("a");


        navigationLinks.forEach(function (link) {

            link.addEventListener(
                "click",
                function () {

                    navLinks.classList.remove(
                        "active"
                    );

                }
            );

        });

    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    updateCartCount();


    function updateCartCount() {

        const cartCount =
            document.getElementById("cartCount");


        if (!cartCount) {
            return;
        }


        try {

            const savedCart =
                localStorage.getItem(
                    "friendsHeritageCart"
                );


            if (!savedCart) {

                cartCount.textContent = "0";

                return;
            }


            const cart =
                JSON.parse(savedCart);


            if (!Array.isArray(cart)) {

                cartCount.textContent = "0";

                return;
            }


            const totalQuantity =
                cart.reduce(
                    function (total, item) {

                        return total +
                            (Number(item.quantity) || 0);

                    },
                    0
                );


            cartCount.textContent =
                totalQuantity;


        } catch (error) {

            console.error(
                "Cart count error:",
                error
            );

            cartCount.textContent = "0";

        }

    }


    /* =====================================================
       UPDATE CART COUNT WHEN STORAGE CHANGES
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                "friendsHeritageCart"
            ) {

                updateCartCount();

            }

        }
    );


    /* =====================================================
       PAGE LOADED
    ===================================================== */

    console.log(
        "The Friends Heritage Contact Page loaded successfully."
    );

});
