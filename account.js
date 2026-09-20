/* =========================================================
   THE FRIENDS HERITAGE
   ACCOUNT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    const USERS_STORAGE_KEY = "friendsHeritageUsers";
    const CURRENT_USER_KEY = "friendsHeritageCurrentUser";
    const CART_STORAGE_KEY = "friendsHeritageCart";
    const LATEST_ORDER_KEY = "friendsHeritageLatestOrder";


    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    /* ---------- Authentication ---------- */

    const loginSection =
        document.getElementById("loginSection");

    const registerSection =
        document.getElementById("registerSection");

    const dashboardSection =
        document.getElementById("dashboardSection");

    const loginForm =
        document.getElementById("loginForm");

    const registerForm =
        document.getElementById("registerForm");

    const loginEmail =
        document.getElementById("loginEmail");

    const loginPassword =
        document.getElementById("loginPassword");

    const registerName =
        document.getElementById("registerName");

    const registerEmail =
        document.getElementById("registerEmail");

    const registerPassword =
        document.getElementById("registerPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const loginMessage =
        document.getElementById("loginMessage");

    const registerMessage =
        document.getElementById("registerMessage");


    /* ---------- Authentication Buttons ---------- */

    const showRegisterBtn =
        document.getElementById("showRegisterBtn");

    const backToLoginBtn =
        document.getElementById("backToLoginBtn");

    const loginPasswordToggle =
        document.getElementById("loginPasswordToggle");

    const registerPasswordToggle =
        document.getElementById("registerPasswordToggle");

    const confirmPasswordToggle =
        document.getElementById("confirmPasswordToggle");


    /* ---------- Dashboard ---------- */

    const welcomeUser =
        document.getElementById("welcomeUser");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const dashboardCards =
        document.querySelectorAll(".dashboard-card");

    const dashboardPanels =
        document.querySelectorAll(".dashboard-panel");

    const closePanelButtons =
        document.querySelectorAll(".close-panel");


    /* ---------- Orders ---------- */

    const ordersPanel =
        document.getElementById("ordersPanel");


    /* ---------- Profile ---------- */

    const profileForm =
        document.getElementById("profileForm");

    const profileName =
        document.getElementById("profileName");

    const profileContact =
        document.getElementById("profileContact");

    const profileMessage =
        document.getElementById("profileMessage");


    /* ---------- Address ---------- */

    const addressForm =
        document.getElementById("addressForm");

    const addressName =
        document.getElementById("addressName");

    const addressPhone =
        document.getElementById("addressPhone");

    const addressLine =
        document.getElementById("addressLine");

    const addressCity =
        document.getElementById("addressCity");

    const addressState =
        document.getElementById("addressState");

    const addressPincode =
        document.getElementById("addressPincode");

    const addressMessage =
        document.getElementById("addressMessage");


    /* ---------- Password ---------- */

    const passwordForm =
        document.getElementById("passwordForm");

    const currentPassword =
        document.getElementById("currentPassword");

    const newPassword =
        document.getElementById("newPassword");

    const confirmNewPassword =
        document.getElementById("confirmNewPassword");

    const passwordMessage =
        document.getElementById("passwordMessage");


    /* ---------- Forgot Password ---------- */

    const forgotPasswordBtn =
        document.getElementById("forgotPasswordBtn");

    const forgotModal =
        document.getElementById("forgotModal");

    const closeForgotModal =
        document.getElementById("closeForgotModal");

    const forgotForm =
        document.getElementById("forgotForm");

    const forgotContact =
        document.getElementById("forgotContact");

    const forgotMessage =
        document.getElementById("forgotMessage");


    /* ---------- Cart ---------- */

    const cartCount =
        document.getElementById("cartCount");


    /* =====================================================
       HELPER
       Safe event listener
    ===================================================== */

    function addEvent(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    }


    /* =====================================================
       LOCAL STORAGE
    ===================================================== */

    function getUsers() {

        try {

            const data =
                localStorage.getItem(
                    USERS_STORAGE_KEY
                );

            if (!data) {
                return [];
            }

            const users =
                JSON.parse(data);

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


    function getCurrentUser() {

        try {

            const data =
                localStorage.getItem(
                    CURRENT_USER_KEY
                );

            if (!data) {
                return null;
            }

            const user =
                JSON.parse(data);

            if (
                !user ||
                typeof user !== "object"
            ) {
                return null;
            }

            return user;

        } catch (error) {

            console.error(
                "Current user read error:",
                error
            );

            return null;
        }
    }


    function saveCurrentUser(user) {

        try {

            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(user)
            );

            return true;

        } catch (error) {

            console.error(
                "Current user save error:",
                error
            );

            return false;
        }
    }


    function clearCurrentUser() {

        localStorage.removeItem(
            CURRENT_USER_KEY
        );
    }


    /* =====================================================
       CONTACT NORMALIZATION
    ===================================================== */

    function normalizeContact(value) {

        return String(value || "")
            .trim()
            .toLowerCase();
    }


    function normalizePhone(value) {

        return String(value || "")
            .replace(/\D/g, "");
    }


    function isEmail(value) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(String(value || "").trim());
    }


    function isMobile(value) {

        return /^[6-9]\d{9}$/
            .test(normalizePhone(value));
    }


    function isValidContact(value) {

        const contact =
            String(value || "").trim();

        return (
            isEmail(contact) ||
            isMobile(contact)
        );
    }


    /* =====================================================
       FIND USER
    ===================================================== */

    function findUserIndex(users, contact) {

        const normalized =
            normalizeContact(contact);

        const phone =
            normalizePhone(contact);

        return users.findIndex(function (user) {

            if (!user) {
                return false;
            }

            const userEmail =
                normalizeContact(
                    user.email
                );

            const userContact =
                normalizeContact(
                    user.contact
                );

            const userPhone =
                normalizePhone(
                    user.phone
                );

            return (
                (normalized &&
                    (
                        userEmail === normalized ||
                        userContact === normalized
                    )
                ) ||
                (
                    phone &&
                    (
                        userPhone === phone ||
                        normalizePhone(user.contact) === phone
                    )
                )
            );
        });
    }


    /* =====================================================
       REFRESH CURRENT USER
    ===================================================== */

    function refreshCurrentUser() {

        const currentUser =
            getCurrentUser();

        if (!currentUser) {
            return null;
        }

        const users =
            getUsers();

        let index = -1;

        if (currentUser.id) {

            index =
                users.findIndex(function (user) {

                    return (
                        user &&
                        user.id === currentUser.id
                    );

                });
        }

        if (index === -1) {

            index =
                findUserIndex(
                    users,
                    currentUser.email ||
                    currentUser.contact ||
                    currentUser.phone
                );
        }

        if (index !== -1) {

            saveCurrentUser(
                users[index]
            );

            return users[index];
        }

        return currentUser;
    }


    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(
        element,
        message,
        type = "error"
    ) {

        if (!element) {
            return;
        }

        element.textContent =
            message;

        element.className =
            "form-message " +
            type;
    }


    /* =====================================================
       PASSWORD TOGGLE
    ===================================================== */

    function setupPasswordToggle(
        button,
        input
    ) {

        if (!button || !input) {
            return;
        }

        button.addEventListener(
            "click",
            function () {

                const isPassword =
                    input.type === "password";

                input.type =
                    isPassword
                        ? "text"
                        : "password";

                const icon =
                    button.querySelector("i");

                if (icon) {

                    icon.className =
                        isPassword
                            ? "fa-regular fa-eye-slash"
                            : "fa-regular fa-eye";
                }

            }
        );
    }


    setupPasswordToggle(
        loginPasswordToggle,
        loginPassword
    );

    setupPasswordToggle(
        registerPasswordToggle,
        registerPassword
    );

    setupPasswordToggle(
        confirmPasswordToggle,
        confirmPassword
    );


    /* =====================================================
       SHOW LOGIN
    ===================================================== */

    function showLogin() {

        if (loginSection) {
            loginSection.classList.remove(
                "hidden"
            );
        }

        if (registerSection) {
            registerSection.classList.add(
                "hidden"
            );
        }

        if (dashboardSection) {
            dashboardSection.classList.add(
                "hidden"
            );
        }
    }


    /* =====================================================
       SHOW REGISTER
    ===================================================== */

    function showRegister() {

        if (loginSection) {
            loginSection.classList.add(
                "hidden"
            );
        }

        if (registerSection) {
            registerSection.classList.remove(
                "hidden"
            );
        }

        if (dashboardSection) {
            dashboardSection.classList.add(
                "hidden"
            );
        }

        if (registerName) {
            registerName.focus();
        }
    }


    /* =====================================================
       SHOW DASHBOARD
    ===================================================== */

    function showDashboard() {

        const user =
            refreshCurrentUser();

        if (!user) {

            showLogin();

            return;
        }

        if (loginSection) {
            loginSection.classList.add(
                "hidden"
            );
        }

        if (registerSection) {
            registerSection.classList.add(
                "hidden"
            );
        }

        if (dashboardSection) {
            dashboardSection.classList.remove(
                "hidden"
            );
        }

        if (welcomeUser) {

            welcomeUser.textContent =
                user.name ||
                user.fullName ||
                "Welcome";
        }

        loadProfile();
        loadAddress();
        loadOrders();
        updateCartCount();
    }


    /* =====================================================
       REGISTER
    ===================================================== */

    addEvent(
        registerForm,
        "submit",
        function (event) {

            event.preventDefault();

            showMessage(
                registerMessage,
                "",
                ""
            );

            const name =
                registerName.value.trim();

            const contact =
                registerEmail.value.trim();

            const password =
                registerPassword.value;

            const confirm =
                confirmPassword.value;


            if (name.length < 2) {

                showMessage(
                    registerMessage,
                    "Please enter your full name.",
                    "error"
                );

                registerName.focus();

                return;
            }


            if (!isValidContact(contact)) {

                showMessage(
                    registerMessage,
                    "Please enter a valid email address or 10-digit mobile number.",
                    "error"
                );

                registerEmail.focus();

                return;
            }


            if (password.length < 6) {

                showMessage(
                    registerMessage,
                    "Password must contain at least 6 characters.",
                    "error"
                );

                registerPassword.focus();

                return;
            }


            if (password !== confirm) {

                showMessage(
                    registerMessage,
                    "Passwords do not match.",
                    "error"
                );

                confirmPassword.focus();

                return;
            }


            const users =
                getUsers();


            if (
                findUserIndex(
                    users,
                    contact
                ) !== -1
            ) {

                showMessage(
                    registerMessage,
                    "An account with this email or mobile number already exists.",
                    "error"
                );

                return;
            }


            const newUser = {

                id:
                    "TFHUSER-" +
                    Date.now(),

                name:
                    name,

                contact:
                    contact,

                email:
                    isEmail(contact)
                        ? contact
                        : "",

                phone:
                    isMobile(contact)
                        ? normalizePhone(contact)
                        : "",

                password:
                    password,

                address: {
                    name: name,
                    phone:
                        isMobile(contact)
                            ? normalizePhone(contact)
                            : "",
                    address: "",
                    town: "",
                    state: "",
                    pincode: "",
                    landmark: ""
                },

                orders: [],

                createdAt:
                    Date.now()
            };


            users.push(newUser);


            if (!saveUsers(users)) {

                showMessage(
                    registerMessage,
                    "Could not create your account. Please try again.",
                    "error"
                );

                return;
            }


            saveCurrentUser(
                newUser
            );


            showMessage(
                registerMessage,
                "Account created successfully. Welcome to The Friends Heritage!",
                "success"
            );


            setTimeout(
                function () {

                    showDashboard();

                },
                700
            );
        }
    );


    /* =====================================================
       LOGIN
    ===================================================== */

    addEvent(
        loginForm,
        "submit",
        function (event) {

            event.preventDefault();

            showMessage(
                loginMessage,
                "",
                ""
            );

            const contact =
                loginEmail.value.trim();

            const password =
                loginPassword.value;


            if (!isValidContact(contact)) {

                showMessage(
                    loginMessage,
                    "Please enter a valid email address or mobile number.",
                    "error"
                );

                loginEmail.focus();

                return;
            }


            if (!password) {

                showMessage(
                    loginMessage,
                    "Please enter your password.",
                    "error"
                );

                loginPassword.focus();

                return;
            }


            const users =
                getUsers();


            const userIndex =
                findUserIndex(
                    users,
                    contact
                );


            if (userIndex === -1) {

                showMessage(
                    loginMessage,
                    "No account was found with those details.",
                    "error"
                );

                return;
            }


            const user =
                users[userIndex];


            if (
                String(user.password) !==
                String(password)
            ) {

                showMessage(
                    loginMessage,
                    "Incorrect password. Please try again.",
                    "error"
                );

                loginPassword.focus();

                return;
            }


            saveCurrentUser(user);


            showMessage(
                loginMessage,
                "Login successful. Welcome back!",
                "success"
            );


            setTimeout(
                function () {

                    showDashboard();

                },
                500
            );
        }
    );


    /* =====================================================
       REGISTER / LOGIN SWITCH
    ===================================================== */

    addEvent(
        showRegisterBtn,
        "click",
        function () {

            showRegister();

        }
    );


    addEvent(
        backToLoginBtn,
        "click",
        function () {

            showLogin();

        }
    );


    /* =====================================================
       LOGOUT
    ===================================================== */

    addEvent(
        logoutBtn,
        "click",
        function () {

            clearCurrentUser();

            dashboardPanels.forEach(
                function (panel) {

                    panel.classList.add(
                        "hidden"
                    );

                }
            );

            showLogin();

            if (loginForm) {
                loginForm.reset();
            }

            if (registerForm) {
                registerForm.reset();
            }

            showMessage(
                loginMessage,
                "You have been logged out successfully.",
                "success"
            );

        }
    );


    /* =====================================================
       DASHBOARD PANELS
    ===================================================== */

    function closeAllPanels() {

        dashboardPanels.forEach(
            function (panel) {

                panel.classList.add(
                    "hidden"
                );

            }
        );
    }


    dashboardCards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const panelId =
                        card.dataset.panel;

                    if (!panelId) {
                        return;
                    }

                    const panel =
                        document.getElementById(
                            panelId
                        );

                    if (!panel) {
                        return;
                    }

                    closeAllPanels();

                    panel.classList.remove(
                        "hidden"
                    );

                    setTimeout(
                        function () {

                            panel.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        },
                        50
                    );

                    if (
                        panelId ===
                        "ordersPanel"
                    ) {

                        loadOrders();

                    }

                }
            );

        }
    );


    closePanelButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const panel =
                        button.closest(
                            ".dashboard-panel"
                        );

                    if (panel) {

                        panel.classList.add(
                            "hidden"
                        );
                    }

                }
            );

        }
    );


    /* =====================================================
       PROFILE
    ===================================================== */

    function loadProfile() {

        const user =
            refreshCurrentUser();

        if (!user) {
            return;
        }

        if (profileName) {

            profileName.value =
                user.name ||
                user.fullName ||
                "";
        }

        if (profileContact) {

            profileContact.value =
                user.contact ||
                user.email ||
                user.phone ||
                "";
        }
    }


    addEvent(
        profileForm,
        "submit",
        function (event) {

            event.preventDefault();

            const user =
                refreshCurrentUser();

            if (!user) {
                return;
            }

            const name =
                profileName.value.trim();

            const contact =
                profileContact.value.trim();


            if (name.length < 2) {

                showMessage(
                    profileMessage,
                    "Please enter a valid name.",
                    "error"
                );

                return;
            }


            if (!isValidContact(contact)) {

                showMessage(
                    profileMessage,
                    "Please enter a valid email or mobile number.",
                    "error"
                );

                return;
            }


            const users =
                getUsers();


            const currentIndex =
                users.findIndex(
                    function (item) {

                        return (
                            item &&
                            item.id ===
                            user.id
                        );

                    }
                );


            if (currentIndex === -1) {

                showMessage(
                    profileMessage,
                    "Account could not be found.",
                    "error"
                );

                return;
            }


            /* Check whether new contact belongs
               to another account. */

            const duplicateIndex =
                users.findIndex(
                    function (item, index) {

                        if (
                            index ===
                            currentIndex
                        ) {
                            return false;
                        }

                        return (
                            item &&
                            (
                                normalizeContact(
                                    item.email
                                ) ===
                                normalizeContact(
                                    contact
                                ) ||

                                normalizeContact(
                                    item.contact
                                ) ===
                                normalizeContact(
                                    contact
                                ) ||

                                normalizePhone(
                                    item.phone
                                ) ===
                                normalizePhone(
                                    contact
                                )
                            )
                        );

                    }
                );


            if (duplicateIndex !== -1) {

                showMessage(
                    profileMessage,
                    "That email or mobile number is already used by another account.",
                    "error"
                );

                return;
            }


            users[currentIndex].name =
                name;

            users[currentIndex].contact =
                contact;


            if (isEmail(contact)) {

                users[currentIndex].email =
                    contact;

            } else {

                users[currentIndex].email =
                    "";
            }


            if (isMobile(contact)) {

                users[currentIndex].phone =
                    normalizePhone(contact);

            } else {

                users[currentIndex].phone =
                    "";
            }


            if (
                users[currentIndex].address
            ) {

                if (
                    !users[currentIndex]
                        .address.name
                ) {

                    users[currentIndex]
                        .address.name =
                        name;
                }
            }


            saveUsers(users);

            saveCurrentUser(
                users[currentIndex]
            );


            if (welcomeUser) {

                welcomeUser.textContent =
                    name;
            }


            showMessage(
                profileMessage,
                "Profile updated successfully.",
                "success"
            );

        }
    );


    /* =====================================================
       ADDRESS
    ===================================================== */

    function loadAddress() {

        const user =
            refreshCurrentUser();

        if (!user) {
            return;
        }

        const address =
            user.address || {};


        if (addressName) {

            addressName.value =
                address.name ||
                user.name ||
                "";
        }

        if (addressPhone) {

            addressPhone.value =
                address.phone ||
                user.phone ||
                "";
        }

        if (addressLine) {

            addressLine.value =
                address.address ||
                "";
        }

        if (addressCity) {

            addressCity.value =
                address.town ||
                address.city ||
                "";
        }

        if (addressState) {

            addressState.value =
                address.state ||
                "";
        }

        if (addressPincode) {

            addressPincode.value =
                address.pincode ||
                "";
        }
    }


    addEvent(
        addressForm,
        "submit",
        function (event) {

            event.preventDefault();

            const user =
                refreshCurrentUser();

            if (!user) {
                return;
            }


            const name =
                addressName.value.trim();

            const phone =
                normalizePhone(
                    addressPhone.value
                );

            const address =
                addressLine.value.trim();

            const city =
                addressCity.value.trim();

            const state =
                addressState.value.trim();

            const pincode =
                addressPincode.value.trim();


            if (name.length < 2) {

                showMessage(
                    addressMessage,
                    "Please enter the recipient name.",
                    "error"
                );

                return;
            }


            if (!/^[6-9]\d{9}$/.test(phone)) {

                showMessage(
                    addressMessage,
                    "Please enter a valid 10-digit mobile number.",
                    "error"
                );

                return;
            }


            if (!address) {

                showMessage(
                    addressMessage,
                    "Please enter your complete address.",
                    "error"
                );

                return;
            }


            if (!city) {

                showMessage(
                    addressMessage,
                    "Please enter your town or city.",
                    "error"
                );

                return;
            }


            if (!state) {

                showMessage(
                    addressMessage,
                    "Please enter your state.",
                    "error"
                );

                return;
            }


            if (!/^\d{6}$/.test(pincode)) {

                showMessage(
                    addressMessage,
                    "Please enter a valid 6-digit PIN code.",
                    "error"
                );

                return;
            }


            const users =
                getUsers();


            const index =
                users.findIndex(
                    function (item) {

                        return (
                            item &&
                            item.id ===
                            user.id
                        );

                    }
                );


            if (index === -1) {

                showMessage(
                    addressMessage,
                    "Account could not be found.",
                    "error"
                );

                return;
            }


            users[index].address = {

                name:
                    name,

                phone:
                    phone,

                address:
                    address,

                town:
                    city,

                state:
                    state,

                pincode:
                    pincode,

                landmark:
                    users[index].address &&
                    users[index].address.landmark
                        ? users[index].address.landmark
                        : ""
            };


            saveUsers(users);

            saveCurrentUser(
                users[index]
            );


            showMessage(
                addressMessage,
                "Delivery address saved successfully.",
                "success"
            );

        }
    );


    /* =====================================================
       CHANGE PASSWORD
    ===================================================== */

    addEvent(
        passwordForm,
        "submit",
        function (event) {

            event.preventDefault();

            const user =
                refreshCurrentUser();

            if (!user) {
                return;
            }


            const current =
                currentPassword.value;

            const newPass =
                newPassword.value;

            const confirm =
                confirmNewPassword.value;


            if (
                String(user.password) !==
                String(current)
            ) {

                showMessage(
                    passwordMessage,
                    "Your current password is incorrect.",
                    "error"
                );

                return;
            }


            if (newPass.length < 6) {

                showMessage(
                    passwordMessage,
                    "New password must contain at least 6 characters.",
                    "error"
                );

                return;
            }


            if (newPass !== confirm) {

                showMessage(
                    passwordMessage,
                    "New passwords do not match.",
                    "error"
                );

                return;
            }


            if (newPass === current) {

                showMessage(
                    passwordMessage,
                    "Your new password must be different from the current password.",
                    "error"
                );

                return;
            }


            const users =
                getUsers();


            const index =
                users.findIndex(
                    function (item) {

                        return (
                            item &&
                            item.id ===
                            user.id
                        );

                    }
                );


            if (index === -1) {

                showMessage(
                    passwordMessage,
                    "Account could not be found.",
                    "error"
                );

                return;
            }


            users[index].password =
                newPass;


            saveUsers(users);

            saveCurrentUser(
                users[index]
            );


            passwordForm.reset();


            showMessage(
                passwordMessage,
                "Password changed successfully.",
                "success"
            );

        }
    );


    /* =====================================================
       FORGOT PASSWORD MODAL
    ===================================================== */

    function openForgotModal() {

        if (!forgotModal) {
            return;
        }

        forgotModal.classList.remove(
            "hidden"
        );

        if (forgotContact) {

            forgotContact.value =
                loginEmail
                    ? loginEmail.value
                    : "";

            forgotContact.focus();
        }
    }


    function closeForgotPasswordModal() {

        if (!forgotModal) {
            return;
        }

        forgotModal.classList.add(
            "hidden"
        );

        if (forgotMessage) {

            forgotMessage.textContent =
                "";

            forgotMessage.className =
                "form-message";
        }
    }


    addEvent(
        forgotPasswordBtn,
        "click",
        openForgotModal
    );


    addEvent(
        closeForgotModal,
        "click",
        closeForgotPasswordModal
    );


    if (forgotModal) {

        const overlay =
            forgotModal.querySelector(
                ".modal-overlay"
            );

        addEvent(
            overlay,
            "click",
            closeForgotPasswordModal
        );
    }


    addEvent(
        forgotForm,
        "submit",
        function (event) {

            event.preventDefault();

            const contact =
                forgotContact.value.trim();


            if (!isValidContact(contact)) {

                showMessage(
                    forgotMessage,
                    "Please enter the email or mobile number linked to your account.",
                    "error"
                );

                return;
            }


            const users =
                getUsers();


            const index =
                findUserIndex(
                    users,
                    contact
                );


            if (index === -1) {

                showMessage(
                    forgotMessage,
                    "No account was found with those details.",
                    "error"
                );

                return;
            }


            /*
               FRONTEND DEMO ONLY

               Do not display the stored password.
               A real password-reset system will be
               connected to a backend later.
            */

            showMessage(
                forgotMessage,
                "Your account was found. Password recovery will be connected to the secure backend later.",
                "success"
            );

        }
    );


    /* =====================================================
       ESCAPE HTML
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
       FORMAT PRICE
    ===================================================== */

    function formatPrice(value) {

        const number =
            Number(value) || 0;

        return (
            "₹" +
            number.toLocaleString("en-IN")
        );
    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatOrderDate(order) {

        if (order.orderDate) {

            return String(
                order.orderDate
            );
        }

        if (order.timestamp) {

            try {

                return new Date(
                    order.timestamp
                ).toLocaleString(
                    "en-IN"
                );

            } catch (error) {
                return "Date unavailable";
            }
        }

        return "Date unavailable";
    }


    /* =====================================================
       ORDER HELPERS
    ===================================================== */

    function getOrderItems(order) {

        return (
            Array.isArray(order.items)
                ? order.items
                : []
        );
    }


    function getItemName(item) {

        return (
            item.name ||
            item.productName ||
            item.title ||
            "Product"
        );
    }


    function getItemImage(item) {

        return (
            item.image ||
            item.productImage ||
            item.img ||
            "logo.png"
        );
    }


    function getItemPrice(item) {

        return Number(
            item.price ??
            item.salePrice ??
            item.discountPrice ??
            0
        ) || 0;
    }


    function getItemOriginalPrice(item) {

        return Number(
            item.originalPrice ??
            item.oldPrice ??
            item.mrp ??
            getItemPrice(item)
        ) || 0;
    }


    function getItemQuantity(item) {

        const quantity =
            Number(item.quantity);

        return quantity > 0
            ? quantity
            : 1;
    }


    function getItemVariant(item) {

        return (
            item.variant ||
            item.weight ||
            item.size ||
            ""
        );
    }


    function calculateOrderItemCount(order) {

        return getOrderItems(order)
            .reduce(
                function (total, item) {

                    return (
                        total +
                        getItemQuantity(item)
                    );

                },
                0
            );
    }


    function calculateOrderSubtotal(order) {

        if (
            Number.isFinite(
                Number(order.subtotal)
            )
        ) {

            return Number(
                order.subtotal
            );
        }

        return getOrderItems(order)
            .reduce(
                function (total, item) {

                    return (
                        total +
                        (
                            getItemPrice(item) *
                            getItemQuantity(item)
                        )
                    );

                },
                0
            );
    }


    function getOrderDelivery(order) {

        return Number(
            order.deliveryCharge ??
            order.delivery ??
            0
        ) || 0;
    }


    function getOrderTotal(order) {

        if (
            Number.isFinite(
                Number(order.total)
            )
        ) {

            return Number(
                order.total
            );
        }

        return (
            calculateOrderSubtotal(order) +
            getOrderDelivery(order)
        );
    }


    function getCustomer(order) {

        return (
            order.customer &&
            typeof order.customer === "object"
                ? order.customer
                : {}
        );
    }


    function getAddress(order) {

        return (
            order.address &&
            typeof order.address === "object"
                ? order.address
                : {}
        );
    }


    /* =====================================================
       CREATE ORDER CARD
    ===================================================== */

    function createOrderCard(order) {

        const card =
            document.createElement("article");

        card.className =
            "order-card";


        const customer =
            getCustomer(order);

        const address =
            getAddress(order);

        const items =
            getOrderItems(order);


        const orderId =
            order.orderId ||
            "Order";


        const orderDate =
            formatOrderDate(order);


        const status =
            order.status ||
            "Order Placed";


        const itemCount =
            calculateOrderItemCount(order);


        const subtotal =
            calculateOrderSubtotal(order);


        const delivery =
            getOrderDelivery(order);


        const total =
            getOrderTotal(order);


        const paymentMethod =
            order.paymentMethod ||
            (
                order.paymentValue === "online"
                    ? "Online Payment / UPI"
                    : "Cash on Delivery"
            );


        const paymentStatus =
            order.paymentStatus ||
            "Payment information unavailable";


        card.innerHTML = `

            <!-- ORDER HEADER -->
            <div class="order-card-header">

                <div class="order-header-left">

                    <span class="order-label">
                        ORDER
                    </span>

                    <h3>
                        ${escapeHTML(orderId)}
                    </h3>

                    <p>
                        ${escapeHTML(orderDate)}
                    </p>

                </div>


                <div class="order-header-right">

                    <span class="order-status">
                        ${escapeHTML(status)}
                    </span>

                    <button
                        type="button"
                        class="order-details-btn"
                        aria-expanded="false"
                    >
                        <span>View Details</span>
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>

                </div>

            </div>


            <!-- QUICK SUMMARY -->
            <div class="order-quick-summary">

                <div>

                    <span>
                        Items
                    </span>

                    <strong>
                        ${itemCount}
                    </strong>

                </div>


                <div>

                    <span>
                        Payment
                    </span>

                    <strong>
                        ${escapeHTML(paymentMethod)}
                    </strong>

                </div>


                <div>

                    <span>
                        Total
                    </span>

                    <strong>
                        ${formatPrice(total)}
                    </strong>

                </div>

            </div>


            <!-- ORDER DETAILS -->
            <div class="order-details hidden">

                <!-- PRODUCTS -->
                <div class="order-section">

                    <div class="order-section-title">

                        <i class="fa-solid fa-box-open"></i>

                        <h4>
                            Ordered Products
                        </h4>

                    </div>


                    <div class="order-products">

                        ${
                            items.length
                                ? items.map(function (item) {

                                    const name =
                                        getItemName(item);

                                    const image =
                                        getItemImage(item);

                                    const price =
                                        getItemPrice(item);

                                    const originalPrice =
                                        getItemOriginalPrice(item);

                                    const quantity =
                                        getItemQuantity(item);

                                    const variant =
                                        getItemVariant(item);

                                    const currentTotal =
                                        price *
                                        quantity;

                                    const originalTotal =
                                        originalPrice *
                                        quantity;


                                    return `

                                        <div class="order-product">

                                            <div class="order-product-image">

                                                <img
                                                    src="${escapeHTML(image)}"
                                                    alt="${escapeHTML(name)}"
                                                    onerror="this.src='logo.png'"
                                                >

                                            </div>


                                            <div class="order-product-info">

                                                <h4>
                                                    ${escapeHTML(name)}
                                                </h4>

                                                ${
                                                    variant
                                                        ? `
                                                            <span class="order-product-variant">
                                                                ${escapeHTML(variant)}
                                                            </span>
                                                        `
                                                        : ""
                                                }


                                                <div class="order-product-meta">

                                                    <span>
                                                        Qty: ${quantity}
                                                    </span>

                                                    <span>
                                                        ${formatPrice(price)} each
                                                    </span>

                                                </div>

                                            </div>


                                            <div class="order-product-total">

                                                ${
                                                    originalPrice > price
                                                        ? `
                                                            <small>
                                                                ${formatPrice(originalTotal)}
                                                            </small>
                                                        `
                                                        : ""
                                                }

                                                <strong>
                                                    ${formatPrice(currentTotal)}
                                                </strong>

                                            </div>

                                        </div>

                                    `;

                                }).join("")
                                : `
                                    <p class="order-no-items">
                                        No product details available.
                                    </p>
                                `
                        }

                    </div>

                </div>


                <!-- CUSTOMER INFORMATION -->
                <div class="order-section">

                    <div class="order-section-title">

                        <i class="fa-solid fa-user"></i>

                        <h4>
                            Customer Information
                        </h4>

                    </div>


                    <div class="order-info-grid">

                        <div class="order-info-item">

                            <span>
                                Name
                            </span>

                            <strong>
                                ${escapeHTML(
                                    customer.fullName ||
                                    customer.name ||
                                    "Not provided"
                                )}
                            </strong>

                        </div>


                        <div class="order-info-item">

                            <span>
                                Phone
                            </span>

                            <strong>
                                ${escapeHTML(
                                    customer.phone ||
                                    "Not provided"
                                )}
                            </strong>

                        </div>


                        <div class="order-info-item">

                            <span>
                                Email
                            </span>

                            <strong>
                                ${escapeHTML(
                                    customer.email ||
                                    "Not provided"
                                )}
                            </strong>

                        </div>

                    </div>

                </div>


                <!-- DELIVERY ADDRESS -->
                <div class="order-section">

                    <div class="order-section-title">

                        <i class="fa-solid fa-location-dot"></i>

                        <h4>
                            Delivery Address
                        </h4>

                    </div>


                    <div class="order-address">

                        <p>
                            <strong>
                                ${escapeHTML(
                                    customer.fullName ||
                                    customer.name ||
                                    ""
                                )}
                            </strong>
                        </p>

                        <p>
                            ${escapeHTML(
                                address.address ||
                                address.line ||
                                "Address not provided"
                            )}
                        </p>

                        <p>
                            ${escapeHTML(
                                address.town ||
                                address.city ||
                                ""
                            )}
                            ${
                                address.state
                                    ? ", " +
                                      escapeHTML(
                                          address.state
                                      )
                                    : ""
                            }
                            ${
                                address.pincode
                                    ? " - " +
                                      escapeHTML(
                                          address.pincode
                                      )
                                    : ""
                            }
                        </p>

                        ${
                            address.landmark
                                ? `
                                    <p>
                                        Landmark:
                                        ${escapeHTML(
                                            address.landmark
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                </div>


                <!-- PAYMENT -->
                <div class="order-section">

                    <div class="order-section-title">

                        <i class="fa-solid fa-credit-card"></i>

                        <h4>
                            Payment Information
                        </h4>

                    </div>


                    <div class="order-payment-box">

                        <span>
                            ${escapeHTML(paymentMethod)}
                        </span>

                        <strong>
                            ${escapeHTML(paymentStatus)}
                        </strong>

                    </div>

                </div>


                ${
                    order.orderNote
                        ? `
                            <!-- ORDER NOTE -->
                            <div class="order-section">

                                <div class="order-section-title">

                                    <i class="fa-solid fa-note-sticky"></i>

                                    <h4>
                                        Order Note
                                    </h4>

                                </div>

                                <p class="order-note">
                                    ${escapeHTML(
                                        order.orderNote
                                    )}
                                </p>

                            </div>
                        `
                        : ""
                }


                <!-- PRICE SUMMARY -->
                <div class="order-section">

                    <div class="order-section-title">

                        <i class="fa-solid fa-receipt"></i>

                        <h4>
                            Price Summary
                        </h4>

                    </div>


                    <div class="order-price-summary">

                        <div>

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ${formatPrice(subtotal)}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Delivery
                            </span>

                            <strong>
                                ${formatPrice(delivery)}
                            </strong>

                        </div>


                        <div class="order-grand-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                ${formatPrice(total)}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>
        `;


        /* =================================================
           VIEW DETAILS BUTTON
        ================================================= */

        const detailsButton =
            card.querySelector(
                ".order-details-btn"
            );

        const details =
            card.querySelector(
                ".order-details"
            );

        const icon =
            detailsButton
                ? detailsButton.querySelector("i")
                : null;


        if (
            detailsButton &&
            details
        ) {

            detailsButton.addEventListener(
                "click",
                function () {

                    const isHidden =
                        details.classList.contains(
                            "hidden"
                        );


                    if (isHidden) {

                        details.classList.remove(
                            "hidden"
                        );

                        detailsButton.setAttribute(
                            "aria-expanded",
                            "true"
                        );

                        const text =
                            detailsButton.querySelector(
                                "span"
                            );

                        if (text) {
                            text.textContent =
                                "Hide Details";
                        }

                        if (icon) {
                            icon.style.transform =
                                "rotate(180deg)";
                        }

                    } else {

                        details.classList.add(
                            "hidden"
                        );

                        detailsButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        const text =
                            detailsButton.querySelector(
                                "span"
                            );

                        if (text) {
                            text.textContent =
                                "View Details";
                        }

                        if (icon) {
                            icon.style.transform =
                                "rotate(0deg)";
                        }

                    }

                }
            );
        }


        return card;
    }


    /* =====================================================
       LOAD ORDERS

       IMPORTANT:
       We DO NOT replace ordersPanel.innerHTML.

       The existing:
       - panel-heading
       - empty-state

       remain untouched.

       Only .orders-container is managed.
    ===================================================== */

    function loadOrders() {

        const user =
            refreshCurrentUser();


        if (!user || !ordersPanel) {
            return;
        }


        let ordersContainer =
            ordersPanel.querySelector(
                ".orders-container"
            );


        /*
           Create the orders container only once.
        */

        if (!ordersContainer) {

            ordersContainer =
                document.createElement("div");

            ordersContainer.className =
                "orders-container";


            const emptyState =
                ordersPanel.querySelector(
                    ".empty-state"
                );


            /*
               Put the orders BEFORE the empty
               state so the existing panel
               structure remains clean.
            */

            if (emptyState) {

                ordersPanel.insertBefore(
                    ordersContainer,
                    emptyState
                );

            } else {

                ordersPanel.appendChild(
                    ordersContainer
                );
            }
        }


        ordersContainer.innerHTML =
            "";


        const emptyState =
            ordersPanel.querySelector(
                ".empty-state"
            );


        const orders =
            Array.isArray(user.orders)
                ? user.orders
                : [];


        /*
           Sort newest first.
        */

        orders.sort(
            function (a, b) {

                const timeA =
                    Number(
                        a.timestamp || 0
                    );

                const timeB =
                    Number(
                        b.timestamp || 0
                    );

                return timeB - timeA;
            }
        );


        if (orders.length === 0) {

            ordersContainer.classList.add(
                "hidden"
            );

            if (emptyState) {

                emptyState.classList.remove(
                    "hidden"
                );
            }

            return;
        }


        /*
           Orders exist.
        */

        ordersContainer.classList.remove(
            "hidden"
        );


        if (emptyState) {

            emptyState.classList.add(
                "hidden"
            );
        }


        orders.forEach(
            function (order) {

                if (!order) {
                    return;
                }

                const card =
                    createOrderCard(order);

                ordersContainer.appendChild(
                    card
                );

            }
        );
    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    function updateCartCount() {

        if (!cartCount) {
            return;
        }


        try {

            const data =
                localStorage.getItem(
                    CART_STORAGE_KEY
                );


            if (!data) {

                cartCount.textContent =
                    "0";

                return;
            }


            const cart =
                JSON.parse(data);


            if (!Array.isArray(cart)) {

                cartCount.textContent =
                    "0";

                return;
            }


            const totalQuantity =
                cart.reduce(
                    function (total, item) {

                        return (
                            total +
                            (
                                Number(
                                    item.quantity
                                ) || 0
                            )
                        );

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

            cartCount.textContent =
                "0";
        }
    }


    /* =====================================================
       STORAGE EVENT
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                USERS_STORAGE_KEY ||

                event.key ===
                CURRENT_USER_KEY
            ) {

                const user =
                    refreshCurrentUser();

                if (user) {

                    showDashboard();

                } else {

                    showLogin();

                }
            }


            if (
                event.key ===
                CART_STORAGE_KEY
            ) {

                updateCartCount();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    const existingUser =
        getCurrentUser();


    if (existingUser) {

        showDashboard();

    } else {

        showLogin();

    }


    updateCartCount();


    console.log(
        "The Friends Heritage Account Page loaded successfully."
    );

});
