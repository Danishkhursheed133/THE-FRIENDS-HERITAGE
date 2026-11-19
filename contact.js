/* =========================================================
   THE FRIENDS HERITAGE
   CONTACT.JS
   ---------------------------------------------------------
   Handles:
   1. EmailJS contact form
   2. Form validation
   3. WhatsApp links
   4. Google Maps link
   5. Mobile navigation
   6. Cart count
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CONTACT DETAILS
    ===================================================== */

    const WHATSAPP_NUMBER = "917051713047";

    const GOOGLE_MAPS_LINK =
        "https://maps.app.goo.gl/rPCPKxDmuQR2C9sz6";


    /* =====================================================
       EMAILJS CONFIGURATION
    ===================================================== */

    const EMAILJS_PUBLIC_KEY =
        "18orRcmHkRy0Z--QL";

    const EMAILJS_SERVICE_ID =
        "service_whmjkcc";

    const EMAILJS_TEMPLATE_ID =
        "template_g5kn94j";


    /* =====================================================
       EMAILJS INITIALIZATION
    ===================================================== */

    if (typeof emailjs !== "undefined") {

        try {

            emailjs.init({
                publicKey: EMAILJS_PUBLIC_KEY
            });

            console.log(
                "EmailJS initialized successfully."
            );

        } catch (error) {

            console.error(
                "EmailJS initialization error:",
                error
            );

        }

    } else {

        console.error(
            "EmailJS library is not loaded."
        );

    }


    /* =====================================================
       CONTACT FORM ELEMENTS
    ===================================================== */

    const contactForm =
        document.getElementById("contactForm");

    const formMessage =
        document.getElementById("formMessage");


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


        /* Clear previous timer */

        if (window.contactMessageTimer) {

            clearTimeout(
                window.contactMessageTimer
            );

        }


        /* Hide after 6 seconds */

        window.contactMessageTimer =
            setTimeout(function () {

                formMessage.style.display =
                    "none";

            }, 6000);
    }


    /* =====================================================
       CONTACT FORM
    ===================================================== */

    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                /* =============================================
                   GET FORM ELEMENTS
                ============================================= */

                const nameInput =
                    document.getElementById("name");

                const emailInput =
                    document.getElementById("email");

                const phoneInput =
                    document.getElementById("phone");

                const subjectInput =
                    document.getElementById("subject");

                const messageInput =
                    document.getElementById("message");


                /* =============================================
                   GET VALUES
                ============================================= */

                const name =
                    nameInput
                        ? nameInput.value.trim()
                        : "";

                const email =
                    emailInput
                        ? emailInput.value.trim()
                        : "";

                const phone =
                    phoneInput
                        ? phoneInput.value.trim()
                        : "";

                const subject =
                    subjectInput
                        ? subjectInput.value.trim()
                        : "";

                const message =
                    messageInput
                        ? messageInput.value.trim()
                        : "";


                /* =============================================
                   NAME VALIDATION
                ============================================= */

                if (name.length < 2) {

                    showFormMessage(
                        "Please enter your name.",
                        "error"
                    );

                    if (nameInput) {
                        nameInput.focus();
                    }

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

                    if (emailInput) {
                        emailInput.focus();
                    }

                    return;
                }


                /* =============================================
                   PHONE VALIDATION
                ============================================= */

                if (phone !== "") {

                    const cleanPhone =
                        phone.replace(
                            /[\s\-()+]/g,
                            ""
                        );

                    if (!/^\d{10,15}$/.test(cleanPhone)) {

                        showFormMessage(
                            "Please enter a valid phone number.",
                            "error"
                        );

                        if (phoneInput) {
                            phoneInput.focus();
                        }

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

                    if (subjectInput) {
                        subjectInput.focus();
                    }

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

                    if (messageInput) {
                        messageInput.focus();
                    }

                    return;
                }


                /* =============================================
                   CHECK EMAILJS
                ============================================= */

                if (typeof emailjs === "undefined") {

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
                   EMAILJS FORM DATA

                   sendForm() reads the form fields directly.

                   IMPORTANT:
                   HTML inputs must have:

                   name="name"
                   name="email"
                   name="phone"
                   name="subject"
                   name="message"

                ============================================= */

                console.log(
                    "Sending contact message..."
                );

                console.log({
                    name: name,
                    email: email,
                    phone: phone,
                    subject: subject,
                    message: message
                });


                /* =============================================
                   SEND EMAIL
                ============================================= */

                try {

                    const response =
                        await emailjs.sendForm(
                            EMAILJS_SERVICE_ID,
                            EMAILJS_TEMPLATE_ID,
                            contactForm
                        );


                    /* =========================================
                       SUCCESS
                    ========================================= */

                    console.log(
                        "EmailJS Success:",
                        response.status,
                        response.text
                    );


                    showFormMessage(
                        "Thank you! Your message has been sent successfully. We will get back to you soon.",
                        "success"
                    );


                    /* Reset form */

                    contactForm.reset();


                } catch (error) {

                    /* =========================================
                       ERROR
                    ========================================= */

                    console.error(
                        "EmailJS Error:",
                        error
                    );

                    console.error(
                        "EmailJS Error Status:",
                        error?.status
                    );

                    console.error(
                        "EmailJS Error Text:",
                        error?.text
                    );


                    let errorMessage =
                        "Unable to send your message right now. Please try again or contact us through WhatsApp.";


                    /* Specific EmailJS errors */

                    if (error?.status === 400) {

                        errorMessage =
                            "Email request is invalid. Please check the contact form and try again.";

                    } else if (error?.status === 401) {

                        errorMessage =
                            "Email service authorization failed. Please contact the website administrator.";

                    } else if (error?.status === 403) {

                        errorMessage =
                            "Email service permission was denied. Please contact the website administrator.";

                    } else if (error?.status === 412) {

                        errorMessage =
                            "Email service rejected the request. Please check the EmailJS template and service settings.";

                    } else if (error?.status >= 500) {

                        errorMessage =
                            "Email service is temporarily unavailable. Please try again later.";
                    }


                    showFormMessage(
                        errorMessage,
                        "error"
                    );

                } finally {

                    /* =========================================
                       RESTORE BUTTON
                    ========================================= */

                    if (sendButton) {

                        sendButton.disabled = false;

                        sendButton.innerHTML =
                            originalButtonHTML;
                    }
                }

            }
        );
    }


    /* =====================================================
       WHATSAPP LINKS
    ===================================================== */

    const whatsappLinks =
        document.querySelectorAll(
            'a[href*="wa.me/917051713047"]'
        );


    whatsappLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                console.log(
                    "Opening WhatsApp..."
                );

            }
        );

    });


    /* =====================================================
       GOOGLE MAPS LOCATION
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

