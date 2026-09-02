// =========================================================
// THE FRIENDS HERITAGE - CONTACT FORM
// EMAILJS + WHATSAPP
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    const contactForm = document.getElementById("contactForm");
    const formMessage = document.getElementById("formMessage");

    // Check if contact form exists
    if (!contactForm) {
        console.log("Contact form not found.");
        return;
    }

    // =====================================================
    // EMAILJS INITIALIZATION
    // =====================================================

    emailjs.init({
        publicKey: "18orRcmHkRy0Z--QL"
    });


    // =====================================================
    // FORM SUBMIT
    // =====================================================

    contactForm.addEventListener("submit", function (event) {

        event.preventDefault();

        // Get form values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const message = document.getElementById("message").value.trim();


        // =================================================
        // BASIC VALIDATION
        // =================================================

        if (name === "" || email === "" || message === "") {

            formMessage.textContent =
                "Please fill in all required fields.";

            formMessage.className = "form-message error";

            return;
        }


        // =================================================
        // EMAIL VALIDATION
        // =================================================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            formMessage.textContent =
                "Please enter a valid email address.";

            formMessage.className = "form-message error";

            return;
        }


        // =================================================
        // SHOW SENDING MESSAGE
        // =================================================

        const sendButton =
            contactForm.querySelector(".send-btn");

        if (sendButton) {
            sendButton.disabled = true;
            sendButton.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Sending...';
        }

        formMessage.textContent =
            "Sending your message...";

        formMessage.className =
            "form-message";


        // =================================================
        // SEND EMAIL USING EMAILJS
        // =================================================

        emailjs.sendForm(
            "service_whmjkcc",
            "template_g5kn94j",
            contactForm
        )

        .then(function (response) {

            console.log(
                "Email sent successfully!",
                response.status,
                response.text
            );


            // =============================================
            // SUCCESS MESSAGE
            // =============================================

            formMessage.textContent =
                "Message sent successfully! Opening WhatsApp...";

            formMessage.className =
                "form-message success";


            // =============================================
            // WHATSAPP MESSAGE
            // =============================================

            const whatsappText =

`Hello The Friends Heritage,

I have a new contact message.

------------------------------

Name: ${name}

Email: ${email}

Phone: ${phone || "Not provided"}

Subject: ${subject || "Not provided"}

Message:
${message}

------------------------------

Thank you.`;


            const whatsappURL =
                "https://wa.me/917051713047?text=" +
                encodeURIComponent(whatsappText);


            // =============================================
            // OPEN WHATSAPP
            // =============================================

            setTimeout(function () {

                window.open(
                    whatsappURL,
                    "_blank"
                );

            }, 1000);


            // =============================================
            // RESET FORM
            // =============================================

            contactForm.reset();


            // =============================================
            // RESET BUTTON
            // =============================================

            if (sendButton) {

                sendButton.disabled = false;

                sendButton.innerHTML =
                    '<i class="fas fa-paper-plane"></i> Send Message';
            }

        })

        .catch(function (error) {

            console.error(
                "EmailJS Error:",
                error
            );


            // =============================================
            // ERROR MESSAGE
            // =============================================

            formMessage.textContent =
                "Sorry! Your message could not be sent. Please try again.";

            formMessage.className =
                "form-message error";


            // =============================================
            // RESET BUTTON
            // =============================================

            if (sendButton) {

                sendButton.disabled = false;

                sendButton.innerHTML =
                    '<i class="fas fa-paper-plane"></i> Send Message';
            }

        });

    });

});