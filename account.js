/* =========================================================
   THE FRIENDS HERITAGE
   account.js
========================================================= */


document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    const USERS_KEY = "friendsHeritageUsers";
    const CURRENT_USER_KEY = "friendsHeritageCurrentUser";
    const CART_KEY = "friendsHeritageCart";


    /* =====================================================
       GET ELEMENTS
    ===================================================== */

    const loginSection =
        document.getElementById("loginSection");

    const registerSection =
        document.getElementById("registerSection");

    const dashboardSection =
        document.getElementById("dashboardSection");


    /* =====================================================
       LOGIN
    ===================================================== */

    const loginForm =
        document.getElementById("loginForm");

    const loginEmail =
        document.getElementById("loginEmail");

    const loginPassword =
        document.getElementById("loginPassword");

    const loginMessage =
        document.getElementById("loginMessage");


    /* =====================================================
       REGISTER
    ===================================================== */

    const registerForm =
        document.getElementById("registerForm");

    const registerName =
        document.getElementById("registerName");

    const registerEmail =
        document.getElementById("registerEmail");

    const registerPassword =
        document.getElementById("registerPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const registerMessage =
        document.getElementById("registerMessage");


    /* =====================================================
       ACCOUNT NAVIGATION
    ===================================================== */

    const showRegisterBtn =
        document.getElementById("showRegisterBtn");

    const backToLoginBtn =
        document.getElementById("backToLoginBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const welcomeUser =
        document.getElementById("welcomeUser");


    /* =====================================================
       FORGOT PASSWORD
    ===================================================== */

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


    /* =====================================================
       DASHBOARD
    ===================================================== */

    const dashboardCards =
        document.querySelectorAll(".dashboard-card");

    const dashboardPanels =
        document.querySelectorAll(".dashboard-panel");

    const closePanelButtons =
        document.querySelectorAll(".close-panel");


    /* =====================================================
       PROFILE
    ===================================================== */

    const profileForm =
        document.getElementById("profileForm");

    const profileName =
        document.getElementById("profileName");

    const profileContact =
        document.getElementById("profileContact");

    const profileMessage =
        document.getElementById("profileMessage");


    /* =====================================================
       ADDRESS
    ===================================================== */

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


    /* =====================================================
       PASSWORD
    ===================================================== */

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


    /* =====================================================
       STORAGE FUNCTIONS
    ===================================================== */

    function getUsers() {

        try {

            const savedUsers =
                localStorage.getItem(USERS_KEY);

            if (!savedUsers) {
                return [];
            }

            const users =
                JSON.parse(savedUsers);

            return Array.isArray(users)
                ? users
                : [];

        } catch (error) {

            console.error(
                "Unable to read users:",
                error
            );

            return [];

        }

    }


    function saveUsers(users) {

        try {

            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(users)
            );

            return true;

        } catch (error) {

            console.error(
                "Unable to save users:",
                error
            );

            return false;

        }

    }


    function getCurrentUser() {

        try {

            const savedUser =
                localStorage.getItem(
                    CURRENT_USER_KEY
                );

            if (!savedUser) {
                return null;
            }

            return JSON.parse(savedUser);

        } catch (error) {

            console.error(
                "Unable to read current user:",
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
                "Unable to save current user:",
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
       GENERAL HELPERS
    ===================================================== */

    function normalizeContact(value) {

        return String(value || "")
            .trim()
            .toLowerCase();

    }


    function isEmail(value) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            value
        );

    }


    function isMobile(value) {

        const cleaned =
            String(value || "")
                .replace(/\s+/g, "");

        return /^[+]?[0-9]{10,15}$/.test(
            cleaned
        );

    }


    function isValidContact(value) {

        return (
            isEmail(value) ||
            isMobile(value)
        );

    }


    function showMessage(
        element,
        message,
        type
    ) {

        if (!element) {
            return;
        }

        element.textContent =
            message;

        element.classList.remove(
            "success",
            "error"
        );

        if (type) {

            element.classList.add(
                type
            );

        }

    }


    function clearMessage(element) {

        if (!element) {
            return;
        }

        element.textContent = "";

        element.classList.remove(
            "success",
            "error"
        );

    }


    /* =====================================================
       PASSWORD SHOW / HIDE
    ===================================================== */

    function setupPasswordToggle(
        buttonId,
        inputId
    ) {

        const button =
            document.getElementById(
                buttonId
            );

        const input =
            document.getElementById(
                inputId
            );

        if (!button || !input) {
            return;
        }


        button.addEventListener(
            "click",
            function () {

                if (
                    input.type === "password"
                ) {

                    input.type = "text";

                    button.innerHTML =
                        '<i class="fa-regular fa-eye-slash"></i>';

                    button.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    input.type = "password";

                    button.innerHTML =
                        '<i class="fa-regular fa-eye"></i>';

                    button.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    }


    setupPasswordToggle(
        "loginPasswordToggle",
        "loginPassword"
    );

    setupPasswordToggle(
        "registerPasswordToggle",
        "registerPassword"
    );

    setupPasswordToggle(
        "confirmPasswordToggle",
        "confirmPassword"
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

        closeAllPanels();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

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

        clearMessage(loginMessage);
        clearMessage(registerMessage);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       SHOW DASHBOARD
    ===================================================== */

    function showDashboard(user) {

        if (!user) {
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

        closeAllPanels();


        if (welcomeUser) {

            welcomeUser.textContent =
                "Welcome, " +
                (user.name || "Customer") +
                "!";

        }


        loadProfile(user);

        loadAddress(user);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       CREATE ACCOUNT BUTTON
    ===================================================== */

    if (showRegisterBtn) {

        showRegisterBtn.addEventListener(
            "click",
            function () {

                showRegister();

            }
        );

    }


    /* =====================================================
       BACK TO LOGIN
    ===================================================== */

    if (backToLoginBtn) {

        backToLoginBtn.addEventListener(
            "click",
            function () {

                showLogin();

            }
        );

    }


    /* =====================================================
       REGISTER ACCOUNT
    ===================================================== */

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                clearMessage(
                    registerMessage
                );


                const name =
                    registerName
                        ? registerName.value.trim()
                        : "";

                const contact =
                    registerEmail
                        ? registerEmail.value.trim()
                        : "";

                const password =
                    registerPassword
                        ? registerPassword.value
                        : "";

                const confirm =
                    confirmPassword
                        ? confirmPassword.value
                        : "";


                /* -----------------------------------------
                   NAME
                ----------------------------------------- */

                if (name.length < 2) {

                    showMessage(
                        registerMessage,
                        "Please enter your full name.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   EMAIL / MOBILE
                ----------------------------------------- */

                if (!isValidContact(contact)) {

                    showMessage(
                        registerMessage,
                        "Please enter a valid email address or mobile number.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   PASSWORD
                ----------------------------------------- */

                if (password.length < 6) {

                    showMessage(
                        registerMessage,
                        "Password must contain at least 6 characters.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   CONFIRM PASSWORD
                ----------------------------------------- */

                if (password !== confirm) {

                    showMessage(
                        registerMessage,
                        "Passwords do not match.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   GET USERS
                ----------------------------------------- */

                const users =
                    getUsers();

                const normalizedContact =
                    normalizeContact(
                        contact
                    );


                /* -----------------------------------------
                   DUPLICATE ACCOUNT
                ----------------------------------------- */

                const existingUser =
                    users.find(
                        function (user) {

                            return (
                                normalizeContact(
                                    user.contact
                                ) ===
                                normalizedContact
                            );

                        }
                    );


                if (existingUser) {

                    showMessage(
                        registerMessage,
                        "An account already exists with this email or mobile number.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   CREATE USER
                ----------------------------------------- */

                const newUser = {

                    id:
                        Date.now().toString(),

                    name:
                        name,

                    contact:
                        contact,

                    password:
                        password,

                    profile: {

                        name:
                            name,

                        contact:
                            contact

                    },

                    address: {

                        name: "",

                        phone: "",

                        line: "",

                        city: "",

                        state: "",

                        pincode: ""

                    },

                    orders: [],

                    createdAt:
                        new Date().toISOString()

                };


                users.push(
                    newUser
                );


                const saved =
                    saveUsers(users);


                if (!saved) {

                    showMessage(
                        registerMessage,
                        "Account could not be saved. Please try again.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                showMessage(
                    registerMessage,
                    "Account created successfully. You can now login.",
                    "success"
                );


                registerForm.reset();


                setTimeout(
                    function () {

                        showLogin();

                        if (loginEmail) {

                            loginEmail.value =
                                contact;

                        }

                        showMessage(
                            loginMessage,
                            "Your account has been created. Please login.",
                            "success"
                        );

                    },
                    1200
                );

            }
        );

    }


    /* =====================================================
       LOGIN
    ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                clearMessage(
                    loginMessage
                );


                const contact =
                    loginEmail
                        ? loginEmail.value.trim()
                        : "";

                const password =
                    loginPassword
                        ? loginPassword.value
                        : "";


                if (!contact || !password) {

                    showMessage(
                        loginMessage,
                        "Please enter your email/mobile and password.",
                        "error"
                    );

                    return;

                }


                const users =
                    getUsers();

                const normalizedContact =
                    normalizeContact(
                        contact
                    );


                const user =
                    users.find(
                        function (account) {

                            return (
                                normalizeContact(
                                    account.contact
                                ) ===
                                normalizedContact
                                &&
                                account.password ===
                                password
                            );

                        }
                    );


                if (!user) {

                    showMessage(
                        loginMessage,
                        "Invalid email/mobile number or password.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   SAVE LOGIN SESSION
                ----------------------------------------- */

                saveCurrentUser(user);


                showMessage(
                    loginMessage,
                    "Login successful.",
                    "success"
                );


                setTimeout(
                    function () {

                        loginForm.reset();

                        showDashboard(
                            user
                        );

                    },
                    500
                );

            }
        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                clearCurrentUser();

                closeAllPanels();


                if (loginForm) {
                    loginForm.reset();
                }


                showLogin();


                showMessage(
                    loginMessage,
                    "You have been logged out successfully.",
                    "success"
                );

            }
        );

    }


    /* =====================================================
       DASHBOARD CARDS
    ===================================================== */

    dashboardCards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const panelId =
                        card.getAttribute(
                            "data-panel"
                        );

                    openPanel(
                        panelId
                    );

                }
            );

        }
    );


    /* =====================================================
       OPEN DASHBOARD PANEL
    ===================================================== */

    function openPanel(panelId) {

        closeAllPanels();


        const panel =
            document.getElementById(
                panelId
            );


        if (!panel) {
            return;
        }


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
            100
        );

    }


    /* =====================================================
       CLOSE ALL PANELS
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


    /* =====================================================
       CLOSE PANEL BUTTONS
    ===================================================== */

    closePanelButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    closeAllPanels();

                }
            );

        }
    );


    /* =====================================================
       LOAD PROFILE
    ===================================================== */

    function loadProfile(user) {

        if (!user) {
            return;
        }


        if (profileName) {

            profileName.value =
                user.profile?.name ||
                user.name ||
                "";

        }


        if (profileContact) {

            profileContact.value =
                user.profile?.contact ||
                user.contact ||
                "";

        }

    }


    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                clearMessage(
                    profileMessage
                );


                const user =
                    getCurrentUser();


                if (!user) {

                    showMessage(
                        profileMessage,
                        "Please login first.",
                        "error"
                    );

                    return;

                }


                const name =
                    profileName
                        ? profileName.value.trim()
                        : "";

                const contact =
                    profileContact
                        ? profileContact.value.trim()
                        : "";


                /* -----------------------------------------
                   VALIDATION
                ----------------------------------------- */

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


                const index =
                    users.findIndex(
                        function (account) {

                            return (
                                account.id ===
                                user.id
                            );

                        }
                    );


                if (index === -1) {

                    showMessage(
                        profileMessage,
                        "Account could not be found.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   DUPLICATE CONTACT
                ----------------------------------------- */

                const duplicate =
                    users.find(
                        function (account) {

                            return (
                                account.id !==
                                user.id
                                &&
                                normalizeContact(
                                    account.contact
                                ) ===
                                normalizeContact(
                                    contact
                                )
                            );

                        }
                    );


                if (duplicate) {

                    showMessage(
                        profileMessage,
                        "This email or mobile number is already used by another account.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   UPDATE USER
                ----------------------------------------- */

                users[index].name =
                    name;

                users[index].contact =
                    contact;


                users[index].profile = {

                    name:
                        name,

                    contact:
                        contact

                };


                const saved =
                    saveUsers(users);


                if (!saved) {

                    showMessage(
                        profileMessage,
                        "Profile could not be saved. Please try again.",
                        "error"
                    );

                    return;

                }


                saveCurrentUser(
                    users[index]
                );


                if (welcomeUser) {

                    welcomeUser.textContent =
                        "Welcome, " +
                        name +
                        "!";

                }


                showMessage(
                    profileMessage,
                    "Profile updated successfully.",
                    "success"
                );

            }
        );

    }


    /* =====================================================
       LOAD ADDRESS
    ===================================================== */

    function loadAddress(user) {

        if (
            !user ||
            !user.address
        ) {
            return;
        }


        if (addressName) {

            addressName.value =
                user.address.name ||
                "";

        }


        if (addressPhone) {

            addressPhone.value =
                user.address.phone ||
                "";

        }


        if (addressLine) {

            addressLine.value =
                user.address.line ||
                "";

        }


        if (addressCity) {

            addressCity.value =
                user.address.city ||
                "";

        }


        if (addressState) {

            addressState.value =
                user.address.state ||
                "";

        }


        if (addressPincode) {

            addressPincode.value =
                user.address.pincode ||
                "";

        }

    }


    /* =====================================================
       SAVE ADDRESS
    ===================================================== */

    if (addressForm) {

        addressForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                clearMessage(
                    addressMessage
                );


                const user =
                    getCurrentUser();


                if (!user) {

                    showMessage(
                        addressMessage,
                        "Please login first.",
                        "error"
                    );

                    return;

                }


                const name =
                    addressName
                        ? addressName.value.trim()
                        : "";

                const phone =
                    addressPhone
                        ? addressPhone.value.trim()
                        : "";

                const line =
                    addressLine
                        ? addressLine.value.trim()
                        : "";

                const city =
                    addressCity
                        ? addressCity.value.trim()
                        : "";

                const state =
                    addressState
                        ? addressState.value.trim()
                        : "";

                const pincode =
                    addressPincode
                        ? addressPincode.value.trim()
                        : "";


                /* -----------------------------------------
                   REQUIRED FIELDS
                ----------------------------------------- */

                if (
                    !name ||
                    !phone ||
                    !line ||
                    !city ||
                    !state ||
                    !pincode
                ) {

                    showMessage(
                        addressMessage,
                        "Please fill in all address fields.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   PHONE VALIDATION
                ----------------------------------------- */

                if (!isMobile(phone)) {

                    showMessage(
                        addressMessage,
                        "Please enter a valid mobile number.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   PINCODE VALIDATION
                ----------------------------------------- */

                if (
                    !/^[0-9]{6}$/.test(
                        pincode
                    )
                ) {

                    showMessage(
                        addressMessage,
                        "Please enter a valid 6-digit pincode.",
                        "error"
                    );

                    return;

                }


                const users =
                    getUsers();


                const index =
                    users.findIndex(
                        function (account) {

                            return (
                                account.id ===
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


                /* -----------------------------------------
                   SAVE ADDRESS
                ----------------------------------------- */

                users[index].address = {

                    name:
                        name,

                    phone:
                        phone,

                    line:
                        line,

                    city:
                        city,

                    state:
                        state,

                    pincode:
                        pincode

                };


                const saved =
                    saveUsers(users);


                if (!saved) {

                    showMessage(
                        addressMessage,
                        "Address could not be saved. Please try again.",
                        "error"
                    );

                    return;

                }


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

    }


    /* =====================================================
       CHANGE PASSWORD
    ===================================================== */

    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                clearMessage(
                    passwordMessage
                );


                const user =
                    getCurrentUser();


                if (!user) {

                    showMessage(
                        passwordMessage,
                        "Please login first.",
                        "error"
                    );

                    return;

                }


                const current =
                    currentPassword
                        ? currentPassword.value
                        : "";

                const newPass =
                    newPassword
                        ? newPassword.value
                        : "";

                const confirm =
                    confirmNewPassword
                        ? confirmNewPassword.value
                        : "";


                /* -----------------------------------------
                   CURRENT PASSWORD
                ----------------------------------------- */

                if (
                    current !==
                    user.password
                ) {

                    showMessage(
                        passwordMessage,
                        "Current password is incorrect.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   NEW PASSWORD
                ----------------------------------------- */

                if (
                    newPass.length < 6
                ) {

                    showMessage(
                        passwordMessage,
                        "New password must contain at least 6 characters.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   CONFIRM PASSWORD
                ----------------------------------------- */

                if (
                    newPass !==
                    confirm
                ) {

                    showMessage(
                        passwordMessage,
                        "New passwords do not match.",
                        "error"
                    );

                    return;

                }


                /* -----------------------------------------
                   DIFFERENT PASSWORD
                ----------------------------------------- */

                if (
                    newPass ===
                    current
                ) {

                    showMessage(
                        passwordMessage,
                        "New password must be different from your current password.",
                        "error"
                    );

                    return;

                }


                const users =
                    getUsers();


                const index =
                    users.findIndex(
                        function (account) {

                            return (
                                account.id ===
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


                /* -----------------------------------------
                   UPDATE PASSWORD
                ----------------------------------------- */

                users[index].password =
                    newPass;


                const saved =
                    saveUsers(users);


                if (!saved) {

                    showMessage(
                        passwordMessage,
                        "Password could not be updated. Please try again.",
                        "error"
                    );

                    return;

                }


                saveCurrentUser(
                    users[index]
                );


                passwordForm.reset();


                showMessage(
                    passwordMessage,
                    "Password updated successfully.",
                    "success"
                );

            }
        );

    }


    /* =====================================================
       OPEN FORGOT PASSWORD MODAL
    ===================================================== */

    if (forgotPasswordBtn) {

        forgotPasswordBtn.addEventListener(
            "click",
            function () {

                if (!forgotModal) {
                    return;
                }


                forgotModal.classList.remove(
                    "hidden"
                );


                clearMessage(
                    forgotMessage
                );


                if (forgotForm) {
                    forgotForm.reset();
                }


                setTimeout(
                    function () {

                        if (forgotContact) {
                            forgotContact.focus();
                        }

                    },
                    100
                );

            }
        );

    }


    /* =====================================================
       CLOSE FORGOT PASSWORD MODAL
    ===================================================== */

    function closeForgotPasswordModal() {

        if (!forgotModal) {
            return;
        }


        forgotModal.classList.add(
            "hidden"
        );


        clearMessage(
            forgotMessage
        );

    }


    if (closeForgotModal) {

        closeForgotModal.addEventListener(
            "click",
            function () {

                closeForgotPasswordModal();

            }
        );

    }


    /* =====================================================
       MODAL OVERLAY
    ===================================================== */

    const forgotOverlay =
        document.querySelector(
            ".modal-overlay"
        );


    if (forgotOverlay) {

        forgotOverlay.addEventListener(
            "click",
            function () {

                closeForgotPasswordModal();

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            if (
                forgotModal &&
                !forgotModal.classList.contains(
                    "hidden"
                )
            ) {

                closeForgotPasswordModal();

            }


            closeAllPanels();

        }
    );


    /* =====================================================
       FORGOT PASSWORD
    ===================================================== */

    if (forgotForm) {

        forgotForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                clearMessage(
                    forgotMessage
                );


                const contact =
                    forgotContact
                        ? forgotContact.value.trim()
                        : "";


                if (
                    !isValidContact(
                        contact
                    )
                ) {

                    showMessage(
                        forgotMessage,
                        "Please enter a valid email address or mobile number.",
                        "error"
                    );

                    return;

                }


                const users =
                    getUsers();


                const normalizedContact =
                    normalizeContact(
                        contact
                    );


                const user =
                    users.find(
                        function (account) {

                            return (
                                normalizeContact(
                                    account.contact
                                ) ===
                                normalizedContact
                            );

                        }
                    );


                if (!user) {

                    showMessage(
                        forgotMessage,
                        "No account was found with this email or mobile number.",
                        "error"
                    );

                    return;

                }


                /*
                   FRONTEND DEMO ONLY

                   Do not display the password.

                   Real password recovery should use:
                   - Backend
                   - OTP
                   - Email verification
                   - Password reset token
                */

                showMessage(
                    forgotMessage,
                    "Account found. Password recovery will be available after backend and OTP setup.",
                    "success"
                );

            }
        );

    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    function updateCartCount() {

        const cartCount =
            document.getElementById(
                "cartCount"
            );


        if (!cartCount) {
            return;
        }


        try {

            const savedCart =
                localStorage.getItem(
                    CART_KEY
                );


            if (!savedCart) {

                cartCount.textContent =
                    "0";

                return;

            }


            const cart =
                JSON.parse(
                    savedCart
                );


            if (!Array.isArray(cart)) {

                cartCount.textContent =
                    "0";

                return;

            }


            const totalQuantity =
                cart.reduce(
                    function (
                        total,
                        item
                    ) {

                        return (
                            total +
                            Number(
                                item.quantity || 0
                            )
                        );

                    },
                    0
                );


            cartCount.textContent =
                totalQuantity;

        } catch (error) {

            console.error(
                "Unable to read cart:",
                error
            );

            cartCount.textContent =
                "0";

        }

    }


    /* =====================================================
       CART STORAGE UPDATE
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key === CART_KEY
            ) {

                updateCartCount();

            }

        }
    );


    /* =====================================================
       INITIAL ACCOUNT STATE
    ===================================================== */

    const currentUser =
        getCurrentUser();


    if (currentUser) {

        showDashboard(
            currentUser
        );

    } else {

        showLogin();

    }


    /* =====================================================
       INITIAL CART COUNT
    ===================================================== */

    updateCartCount();


});