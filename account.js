/* =========================================================
   THE FRIENDS HERITAGE
   ACCOUNT.JS

   Handles:
   1. Login
   2. Create Account
   3. Logout
   4. Password visibility
   5. Dashboard
   6. My Orders
   7. Profile
   8. Address
   9. Change Password
   10. Forgot Password
   11. Cart Count
   12. Order synchronization

   IMPORTANT:
   This file controls the existing account.html.
   It does NOT replace the HTML structure.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    const USERS_KEY = "friendsHeritageUsers";
    const CURRENT_USER_KEY = "friendsHeritageCurrentUser";
    const CART_KEY = "friendsHeritageCart";
    const LATEST_ORDER_KEY = "friendsHeritageLatestOrder";


    /* =====================================================
       LOGIN ELEMENTS
    ===================================================== */

    const loginSection =
        document.getElementById("loginSection");

    const loginForm =
        document.getElementById("loginForm");

    const loginEmail =
        document.getElementById("loginEmail");

    const loginPassword =
        document.getElementById("loginPassword");

    const loginMessage =
        document.getElementById("loginMessage");

    const loginPasswordToggle =
        document.getElementById("loginPasswordToggle");

    const forgotPasswordBtn =
        document.getElementById("forgotPasswordBtn");

    const showRegisterBtn =
        document.getElementById("showRegisterBtn");


    /* =====================================================
       REGISTER ELEMENTS
    ===================================================== */

    const registerSection =
        document.getElementById("registerSection");

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

    const registerPasswordToggle =
        document.getElementById("registerPasswordToggle");

    const confirmPasswordToggle =
        document.getElementById("confirmPasswordToggle");

    const backToLoginBtn =
        document.getElementById("backToLoginBtn");


    /* =====================================================
       DASHBOARD ELEMENTS
    ===================================================== */

    const dashboardSection =
        document.getElementById("dashboardSection");

    const welcomeUser =
        document.getElementById("welcomeUser");

    const logoutBtn =
        document.getElementById("logoutBtn");


    /* =====================================================
       DASHBOARD PANELS
    ===================================================== */

    const ordersPanel =
        document.getElementById("ordersPanel");

    const profilePanel =
        document.getElementById("profilePanel");

    const addressPanel =
        document.getElementById("addressPanel");

    const passwordPanel =
        document.getElementById("passwordPanel");


    /* =====================================================
       PROFILE ELEMENTS
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
       ADDRESS ELEMENTS
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
       PASSWORD ELEMENTS
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
       FORGOT PASSWORD ELEMENTS
    ===================================================== */

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
       CART
    ===================================================== */

    const cartCount =
        document.getElementById("cartCount");


    /* =====================================================
       STORAGE FUNCTIONS
    ===================================================== */

    function getUsers() {

        try {

            const data =
                localStorage.getItem(USERS_KEY);

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
                "Error reading users:",
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
                "Error saving users:",
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

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "Error reading current user:",
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
                "Error saving current user:",
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
            .toLowerCase()
            .replace(/\s+/g, "");
    }


    /* =====================================================
       FIND USER
       ID FIRST
       CONTACT SECOND
    ===================================================== */

    function findUserIndex(
        users,
        currentUser
    ) {

        if (
            !Array.isArray(users) ||
            !currentUser
        ) {
            return -1;
        }


        /* Find by ID */

        if (currentUser.id) {

            const idIndex =
                users.findIndex(
                    function (user) {

                        return String(user.id) ===
                            String(currentUser.id);

                    }
                );


            if (idIndex !== -1) {
                return idIndex;
            }
        }


        /* Find by contact */

        const currentContact =
            normalizeContact(
                currentUser.contact ||
                currentUser.email
            );


        if (!currentContact) {
            return -1;
        }


        return users.findIndex(
            function (user) {

                const userContact =
                    normalizeContact(
                        user.contact ||
                        user.email
                    );

                return (
                    userContact &&
                    userContact === currentContact
                );
            }
        );
    }


    /* =====================================================
       SYNC CURRENT USER
    ===================================================== */

    function refreshCurrentUserFromUsers() {

        const currentUser =
            getCurrentUser();


        if (!currentUser) {
            return null;
        }


        const users =
            getUsers();


        const userIndex =
            findUserIndex(
                users,
                currentUser
            );


        if (userIndex === -1) {
            return currentUser;
        }


        if (
            !Array.isArray(
                users[userIndex].orders
            )
        ) {

            users[userIndex].orders = [];
        }


        saveCurrentUser(
            users[userIndex]
        );


        return users[userIndex];
    }


    /* =====================================================
       MESSAGE
    ===================================================== */

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


    /* =====================================================
       VALIDATION
    ===================================================== */

    function isEmail(value) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(value);
    }


    function isMobile(value) {

        const digits =
            String(value || "")
                .replace(/\D/g, "");


        return (
            digits.length >= 10 &&
            digits.length <= 15
        );
    }


    function isValidContact(value) {

        return (
            isEmail(value) ||
            isMobile(value)
        );
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

                if (
                    input.type ===
                    "password"
                ) {

                    input.type =
                        "text";


                    button.innerHTML =
                        '<i class="fa-regular fa-eye-slash"></i>';


                    button.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    input.type =
                        "password";


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


        if (forgotModal) {
            forgotModal.classList.add(
                "hidden"
            );
        }


        closeAllPanels();
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


        showMessage(
            loginMessage,
            "",
            ""
        );


        showMessage(
            registerMessage,
            "",
            ""
        );
    }


    /* =====================================================
       SHOW DASHBOARD
    ===================================================== */

    function showDashboard(user) {

        if (!user) {
            showLogin();
            return;
        }


        if (
            !Array.isArray(user.orders)
        ) {

            user.orders = [];
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


        const name =
            String(
                user.name ||
                user.profile?.name ||
                "Customer"
            ).trim();


        if (welcomeUser) {

            welcomeUser.textContent =
                "Welcome, " + name;
        }


        loadProfile(user);

        loadAddress(user);

        loadOrders(user);

        closeAllPanels();
    }


    /* =====================================================
       CLOSE ALL PANELS
    ===================================================== */

    function closeAllPanels() {

        document
            .querySelectorAll(
                ".dashboard-panel"
            )
            .forEach(
                function (panel) {

                    panel.classList.add(
                        "hidden"
                    );

                }
            );
    }


    /* =====================================================
       DASHBOARD CARDS
    ===================================================== */

    document
        .querySelectorAll(
            ".dashboard-card"
        )
        .forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        const panelId =
                            card.getAttribute(
                                "data-panel"
                            );


                        if (!panelId) {
                            return;
                        }


                        openPanel(
                            panelId
                        );

                    }
                );

            }
        );


    /* =====================================================
       OPEN PANEL
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


        const user =
            refreshCurrentUserFromUsers();


        if (!user) {
            return;
        }


        if (
            panelId ===
            "ordersPanel"
        ) {

            loadOrders(user);
        }


        if (
            panelId ===
            "profilePanel"
        ) {

            loadProfile(user);
        }


        if (
            panelId ===
            "addressPanel"
        ) {

            loadAddress(user);
        }
    }


    /* =====================================================
       CLOSE PANEL BUTTONS
    ===================================================== */

    document
        .querySelectorAll(
            ".close-panel"
        )
        .forEach(
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
       REGISTER
    ===================================================== */

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    registerName.value.trim();


                const contact =
                    registerEmail.value.trim();


                const password =
                    registerPassword.value;


                const confirm =
                    confirmPassword.value;


                showMessage(
                    registerMessage,
                    "",
                    ""
                );


                if (name.length < 2) {

                    showMessage(
                        registerMessage,
                        "Please enter your full name.",
                        "error"
                    );

                    return;
                }


                if (
                    !isValidContact(
                        contact
                    )
                ) {

                    showMessage(
                        registerMessage,
                        "Please enter a valid email or mobile number.",
                        "error"
                    );

                    return;
                }


                if (
                    password.length < 6
                ) {

                    showMessage(
                        registerMessage,
                        "Password must contain at least 6 characters.",
                        "error"
                    );

                    return;
                }


                if (
                    password !== confirm
                ) {

                    showMessage(
                        registerMessage,
                        "Passwords do not match.",
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


                const existingUser =
                    users.find(
                        function (user) {

                            return (
                                normalizeContact(
                                    user.contact ||
                                    user.email
                                ) ===
                                normalizedContact
                            );

                        }
                    );


                if (existingUser) {

                    showMessage(
                        registerMessage,
                        "An account with this email or mobile number already exists.",
                        "error"
                    );

                    return;
                }


                /* Create new account */

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


                if (
                    !saveUsers(users)
                ) {

                    showMessage(
                        registerMessage,
                        "Unable to create your account. Please try again.",
                        "error"
                    );

                    return;
                }


                saveCurrentUser(
                    newUser
                );


                showMessage(
                    registerMessage,
                    "Account created successfully.",
                    "success"
                );


                registerForm.reset();


                setTimeout(
                    function () {

                        showDashboard(
                            newUser
                        );

                    },
                    400
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


                const contact =
                    loginEmail.value.trim();


                const password =
                    loginPassword.value;


                if (!contact) {

                    showMessage(
                        loginMessage,
                        "Please enter your email or mobile number.",
                        "error"
                    );

                    return;
                }


                if (!password) {

                    showMessage(
                        loginMessage,
                        "Please enter your password.",
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
                                    account.contact ||
                                    account.email
                                ) ===
                                normalizedContact
                            );

                        }
                    );


                if (!user) {

                    showMessage(
                        loginMessage,
                        "Account not found. Please check your email or mobile number.",
                        "error"
                    );

                    return;
                }


                if (
                    user.password !==
                    password
                ) {

                    showMessage(
                        loginMessage,
                        "Incorrect password. Please try again.",
                        "error"
                    );

                    return;
                }


                if (
                    !Array.isArray(
                        user.orders
                    )
                ) {

                    user.orders = [];
                }


                saveCurrentUser(
                    user
                );


                showMessage(
                    loginMessage,
                    "Login successful.",
                    "success"
                );


                loginForm.reset();


                setTimeout(
                    function () {

                        showDashboard(
                            user
                        );

                    },
                    300
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
       SHOW REGISTER
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
       PROFILE
    ===================================================== */

    function loadProfile(user) {

        if (!user) {
            return;
        }


        const profile =
            user.profile || {};


        if (profileName) {

            profileName.value =
                profile.name ||
                user.name ||
                "";
        }


        if (profileContact) {

            profileContact.value =
                profile.contact ||
                user.contact ||
                user.email ||
                "";
        }
    }


    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const currentUser =
                    getCurrentUser();


                if (!currentUser) {
                    return;
                }


                const name =
                    profileName.value.trim();


                const contact =
                    profileContact.value.trim();


                if (name.length < 2) {

                    showMessage(
                        profileMessage,
                        "Please enter your full name.",
                        "error"
                    );

                    return;
                }


                if (
                    !isValidContact(
                        contact
                    )
                ) {

                    showMessage(
                        profileMessage,
                        "Please enter a valid email or mobile number.",
                        "error"
                    );

                    return;
                }


                const users =
                    getUsers();


                const userIndex =
                    findUserIndex(
                        users,
                        currentUser
                    );


                if (userIndex === -1) {

                    showMessage(
                        profileMessage,
                        "Account could not be found.",
                        "error"
                    );

                    return;
                }


                const normalizedContact =
                    normalizeContact(
                        contact
                    );


                const duplicate =
                    users.some(
                        function (
                            user,
                            index
                        ) {

                            if (
                                index ===
                                userIndex
                            ) {
                                return false;
                            }


                            return (
                                normalizeContact(
                                    user.contact ||
                                    user.email
                                ) ===
                                normalizedContact
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


                users[userIndex].name =
                    name;


                users[userIndex].contact =
                    contact;


                if (
                    !users[userIndex].profile
                ) {

                    users[userIndex].profile =
                        {};
                }


                users[userIndex]
                    .profile
                    .name =
                    name;


                users[userIndex]
                    .profile
                    .contact =
                    contact;


                if (
                    !saveUsers(users)
                ) {

                    showMessage(
                        profileMessage,
                        "Unable to save changes.",
                        "error"
                    );

                    return;
                }


                saveCurrentUser(
                    users[userIndex]
                );


                if (welcomeUser) {

                    welcomeUser.textContent =
                        "Welcome, " + name;
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
       ADDRESS
    ===================================================== */

    function loadAddress(user) {

        if (!user) {
            return;
        }


        const address =
            user.address || {};


        if (addressName) {

            addressName.value =
                address.name || "";
        }


        if (addressPhone) {

            addressPhone.value =
                address.phone || "";
        }


        if (addressLine) {

            addressLine.value =
                address.line || "";
        }


        if (addressCity) {

            addressCity.value =
                address.city || "";
        }


        if (addressState) {

            addressState.value =
                address.state || "";
        }


        if (addressPincode) {

            addressPincode.value =
                address.pincode || "";
        }
    }


    if (addressForm) {

        addressForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const currentUser =
                    getCurrentUser();


                if (!currentUser) {
                    return;
                }


                const users =
                    getUsers();


                const userIndex =
                    findUserIndex(
                        users,
                        currentUser
                    );


                if (userIndex === -1) {

                    showMessage(
                        addressMessage,
                        "Account could not be found.",
                        "error"
                    );

                    return;
                }


                const name =
                    addressName.value.trim();


                const phone =
                    addressPhone.value.trim();


                const line =
                    addressLine.value.trim();


                const city =
                    addressCity.value.trim();


                const state =
                    addressState.value.trim();


                const pincode =
                    addressPincode.value.trim();


                if (!name) {

                    showMessage(
                        addressMessage,
                        "Please enter the full name.",
                        "error"
                    );

                    return;
                }


                if (!phone) {

                    showMessage(
                        addressMessage,
                        "Please enter the mobile number.",
                        "error"
                    );

                    return;
                }


                if (!line) {

                    showMessage(
                        addressMessage,
                        "Please enter your address.",
                        "error"
                    );

                    return;
                }


                if (!city) {

                    showMessage(
                        addressMessage,
                        "Please enter your city.",
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


                if (!pincode) {

                    showMessage(
                        addressMessage,
                        "Please enter your pincode.",
                        "error"
                    );

                    return;
                }


                users[userIndex].address = {

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


                if (
                    !saveUsers(users)
                ) {

                    showMessage(
                        addressMessage,
                        "Unable to save address.",
                        "error"
                    );

                    return;
                }


                saveCurrentUser(
                    users[userIndex]
                );


                showMessage(
                    addressMessage,
                    "Address saved successfully.",
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


                const currentUser =
                    getCurrentUser();


                if (!currentUser) {
                    return;
                }


                const oldPassword =
                    currentPassword.value;


                const newPass =
                    newPassword.value;


                const confirmPass =
                    confirmNewPassword.value;


                if (!oldPassword) {

                    showMessage(
                        passwordMessage,
                        "Please enter your current password.",
                        "error"
                    );

                    return;
                }


                if (
                    oldPassword !==
                    currentUser.password
                ) {

                    showMessage(
                        passwordMessage,
                        "Current password is incorrect.",
                        "error"
                    );

                    return;
                }


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


                if (
                    newPass !==
                    confirmPass
                ) {

                    showMessage(
                        passwordMessage,
                        "New passwords do not match.",
                        "error"
                    );

                    return;
                }


                const users =
                    getUsers();


                const userIndex =
                    findUserIndex(
                        users,
                        currentUser
                    );


                if (userIndex === -1) {

                    showMessage(
                        passwordMessage,
                        "Account could not be found.",
                        "error"
                    );

                    return;
                }


                users[userIndex].password =
                    newPass;


                if (
                    !saveUsers(users)
                ) {

                    showMessage(
                        passwordMessage,
                        "Unable to update password.",
                        "error"
                    );

                    return;
                }


                saveCurrentUser(
                    users[userIndex]
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
       FORGOT PASSWORD
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


                if (forgotContact) {
                    forgotContact.focus();
                }

            }
        );
    }


    if (closeForgotModal) {

        closeForgotModal.addEventListener(
            "click",
            function () {

                if (forgotModal) {

                    forgotModal.classList.add(
                        "hidden"
                    );
                }

            }
        );
    }


    if (forgotModal) {

        const overlay =
            forgotModal.querySelector(
                ".modal-overlay"
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                function () {

                    forgotModal.classList.add(
                        "hidden"
                    );

                }
            );
        }
    }


    if (forgotForm) {

        forgotForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const contact =
                    forgotContact.value.trim();


                if (
                    !isValidContact(
                        contact
                    )
                ) {

                    showMessage(
                        forgotMessage,
                        "Please enter a valid email or mobile number.",
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
                                    account.contact ||
                                    account.email
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


                showMessage(
                    forgotMessage,
                    "Your account was found. Secure password recovery requires backend verification.",
                    "success"
                );

            }
        );
    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
    }


    /* =====================================================
       PRICE FORMAT
    ===================================================== */

    function formatPrice(value) {

        const number =
            Number(value) || 0;


        return (
            "₹" +
            number.toLocaleString(
                "en-IN"
            )
        );
    }


    /* =====================================================
       ORDER DATE
    ===================================================== */

    function formatOrderDate(value) {

        if (!value) {
            return "Date unavailable";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Date unavailable";
        }


        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    /* =====================================================
       LOAD ORDERS
    ===================================================== */

    function loadOrders(user) {

        if (
            !ordersPanel ||
            !user
        ) {
            return;
        }


        const orders =
            Array.isArray(user.orders)
                ? user.orders
                : [];


        /*
           Create a dedicated container
           inside the existing orders panel.
        */

        let ordersContainer =
            ordersPanel.querySelector(
                ".orders-container"
            );


        if (!ordersContainer) {

            ordersContainer =
                document.createElement(
                    "div"
                );

            ordersContainer.className =
                "orders-container";

            ordersPanel.appendChild(
                ordersContainer
            );
        }


        ordersContainer.innerHTML =
            "";


        const emptyState =
            ordersPanel.querySelector(
                ".empty-state"
            );


        /* =================================================
           NO ORDERS
        ================================================= */

        if (orders.length === 0) {

            if (emptyState) {

                emptyState.style.display =
                    "flex";
            }


            return;
        }


        /* =================================================
           HAS ORDERS
        ================================================= */

        if (emptyState) {

            emptyState.style.display =
                "none";
        }


        orders.forEach(
            function (order) {

                const orderCard =
                    createOrderCard(
                        order
                    );


                ordersContainer.appendChild(
                    orderCard
                );

            }
        );
    }


    /* =====================================================
       CREATE ORDER CARD
    ===================================================== */

    function createOrderCard(order) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "order-card";


        /* =================================================
           BASIC ORDER DATA
        ================================================= */

        const orderId =
            escapeHTML(
                order.orderId ||
                "N/A"
            );


        const orderDate =
            formatOrderDate(
                order.orderDate ||
                order.timestamp
            );


        const status =
            escapeHTML(
                order.status ||
                "Order Placed"
            );


        const paymentMethod =
            String(
                order.paymentMethod ||
                "cod"
            ).toLowerCase();


        const paymentText =
            paymentMethod === "online"
                ? "Online Payment"
                : "Cash on Delivery";


        /* =================================================
           CUSTOMER
        ================================================= */

        const customer =
            order.customer || {};


        const customerName =
            escapeHTML(
                customer.fullName ||
                customer.name ||
                ""
            );


        const customerPhone =
            escapeHTML(
                customer.phone ||
                ""
            );


        const customerEmail =
            escapeHTML(
                customer.email ||
                ""
            );


        /* =================================================
           ADDRESS
        ================================================= */

        const address =
            order.address || {};


        const addressLine =
            escapeHTML(
                address.address ||
                address.line ||
                ""
            );


        const town =
            escapeHTML(
                address.town ||
                address.city ||
                ""
            );


        const state =
            escapeHTML(
                address.state ||
                ""
            );


        const pincode =
            escapeHTML(
                address.pincode ||
                ""
            );


        const landmark =
            escapeHTML(
                address.landmark ||
                ""
            );


        /* =================================================
           ITEMS
        ================================================= */

        const items =
            Array.isArray(order.items)
                ? order.items
                : [];


        let itemsHTML = "";


        items.forEach(
            function (item) {

                const name =
                    escapeHTML(
                        item.name ||
                        "Product"
                    );


                const variant =
                    escapeHTML(
                        item.variant ||
                        ""
                    );


                const image =
                    escapeHTML(
                        item.image ||
                        "logo.png"
                    );


                const quantity =
                    Number(
                        item.quantity
                    ) || 1;


                const price =
                    Number(
                        item.price
                    ) || 0;


                const originalPrice =
                    Number(
                        item.originalPrice
                    ) || 0;


                const itemTotal =
                    price * quantity;


                itemsHTML += `

                    <div class="order-product">

                        <div class="order-product-image">

                            <img
                                src="${image}"
                                alt="${name}"
                            >

                        </div>


                        <div class="order-product-info">

                            <h4>
                                ${name}
                            </h4>

                            ${
                                variant
                                    ? `
                                        <span class="order-product-variant">
                                            ${variant}
                                        </span>
                                    `
                                    : ""
                            }

                            <div class="order-product-meta">

                                <span>
                                    Qty: ${quantity}
                                </span>

                                <span>
                                    ${formatPrice(price)}
                                </span>

                            </div>

                        </div>


                        <div class="order-product-total">

                            ${
                                originalPrice > price
                                    ? `
                                        <small>
                                            ${formatPrice(
                                                originalPrice *
                                                quantity
                                            )}
                                        </small>
                                    `
                                    : ""
                            }

                            <strong>
                                ${formatPrice(
                                    itemTotal
                                )}
                            </strong>

                        </div>

                    </div>

                `;
            }
        );


        if (!itemsHTML) {

            itemsHTML = `

                <div class="order-no-items">

                    Order item information
                    is unavailable.

                </div>

            `;
        }


        /* =================================================
           TOTALS
        ===================================================== */

        const subtotal =
            Number(
                order.subtotal
            ) || 0;


        const delivery =
            Number(
                order.deliveryCharge
            ) || 0;


        const total =
            Number(
                order.total
            ) ||
            (
                subtotal +
                delivery
            );


        /* =================================================
           ORDER NOTE
        ===================================================== */

        const orderNote =
            escapeHTML(
                order.orderNote ||
                ""
            );


        /* =================================================
           CARD HTML
        ===================================================== */

        card.innerHTML = `

            <!-- =========================================
                 ORDER HEADER
            ========================================== -->

            <div class="order-card-header">

                <div class="order-header-left">

                    <span class="order-label">
                        ORDER
                    </span>

                    <h3>
                        #${orderId}
                    </h3>

                    <p>
                        ${orderDate}
                    </p>

                </div>


                <div class="order-header-right">

                    <span class="order-status">
                        ${status}
                    </span>

                    <button
                        type="button"
                        class="order-details-btn"
                    >

                        <span>
                            View Details
                        </span>

                        <i class="fa-solid fa-chevron-down"></i>

                    </button>

                </div>

            </div>


            <!-- =========================================
                 QUICK SUMMARY
            ========================================== -->

            <div class="order-quick-summary">

                <div>

                    <span>
                        Items
                    </span>

                    <strong>
                        ${items.length}
                    </strong>

                </div>


                <div>

                    <span>
                        Payment
                    </span>

                    <strong>
                        ${paymentText}
                    </strong>

                </div>


                <div>

                    <span>
                        Order Total
                    </span>

                    <strong>
                        ${formatPrice(total)}
                    </strong>

                </div>

            </div>


            <!-- =========================================
                 DETAILS
            ========================================== -->

            <div class="order-details hidden">


                <!-- PRODUCTS -->

                <div class="order-section">

                    <div class="order-section-title">

                        <i class="fa-solid fa-bag-shopping"></i>

                        <h4>
                            Ordered Products
                        </h4>

                    </div>


                    <div class="order-products">

                        ${itemsHTML}

                    </div>

                </div>


                <!-- CUSTOMER -->

                <div class="order-section">

                    <div class="order-section-title">

                        <i class="fa-regular fa-user"></i>

                        <h4>
                            Customer Information
                        </h4>

                    </div>


                    <div class="order-info-grid">

                        ${
                            customerName
                                ? `
                                    <div class="order-info-item">

                                        <span>
                                            Full Name
                                        </span>

                                        <strong>
                                            ${customerName}
                                        </strong>

                                    </div>
                                `
                                : ""
                        }


                        ${
                            customerPhone
                                ? `
                                    <div class="order-info-item">

                                        <span>
                                            Mobile Number
                                        </span>

                                        <strong>
                                            ${customerPhone}
                                        </strong>

                                    </div>
                                `
                                : ""
                        }


                        ${
                            customerEmail
                                ? `
                                    <div class="order-info-item">

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            ${customerEmail}
                                        </strong>

                                    </div>
                                `
                                : ""
                        }

                    </div>

                </div>


                <!-- ADDRESS -->

                <div class="order-section">

                    <div class="order-section-title">

                        <i class="fa-solid fa-location-dot"></i>

                        <h4>
                            Delivery Address
                        </h4>

                    </div>


                    <div class="order-address">

                        ${
                            addressLine
                                ? `
                                    <p>
                                        ${addressLine}
                                    </p>
                                `
                                : ""
                        }


                        ${
                            town
                                ? `
                                    <p>
                                        ${town}

                                        ${
                                            state
                                                ? `, ${state}`
                                                : ""
                                        }

                                        ${
                                            pincode
                                                ? ` - ${pincode}`
                                                : ""
                                        }

                                    </p>
                                `
                                : ""
                        }


                        ${
                            landmark
                                ? `
                                    <p>
                                        Landmark:
                                        ${landmark}
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
                            Payment Method
                        </span>

                        <strong>
                            ${paymentText}
                        </strong>

                    </div>

                </div>


                <!-- ORDER NOTE -->

                ${
                    orderNote
                        ? `
                            <div class="order-section">

                                <div class="order-section-title">

                                    <i class="fa-regular fa-note-sticky"></i>

                                    <h4>
                                        Order Note
                                    </h4>

                                </div>

                                <p class="order-note">
                                    ${orderNote}
                                </p>

                            </div>
                        `
                        : ""
                }


                <!-- PRICE SUMMARY -->

                <div class="order-price-summary">

                    <div>

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ${formatPrice(
                                subtotal
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Delivery
                        </span>

                        <strong>
                            ${formatPrice(
                                delivery
                            )}
                        </strong>

                    </div>


                    <div class="order-grand-total">

                        <span>
                            Grand Total
                        </span>

                        <strong>
                            ${formatPrice(
                                total
                            )}
                        </strong>

                    </div>

                </div>

            </div>

        `;


        /* =================================================
           VIEW / HIDE DETAILS
        ===================================================== */

        const detailsButton =
            card.querySelector(
                ".order-details-btn"
            );


        const details =
            card.querySelector(
                ".order-details"
            );


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


                    const icon =
                        detailsButton.querySelector(
                            "i"
                        );


                    const text =
                        detailsButton.querySelector(
                            "span"
                        );


                    if (isHidden) {

                        details.classList.remove(
                            "hidden"
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
       SAVE ORDER TO ACCOUNT

       Checkout can use this function if needed.
    ===================================================== */

    window.saveOrderToAccount =
        function (order) {

            try {

                if (!order) {
                    return false;
                }


                const currentUser =
                    getCurrentUser();


                if (!currentUser) {
                    return false;
                }


                const users =
                    getUsers();


                const userIndex =
                    findUserIndex(
                        users,
                        currentUser
                    );


                if (userIndex === -1) {
                    return false;
                }


                if (
                    !Array.isArray(
                        users[userIndex].orders
                    )
                ) {

                    users[userIndex].orders =
                        [];
                }


                const orderId =
                    String(
                        order.orderId ||
                        ""
                    ).trim();


                /* Prevent duplicate */

                if (orderId) {

                    const exists =
                        users[userIndex]
                            .orders
                            .some(
                                function (
                                    existingOrder
                                ) {

                                    return (
                                        String(
                                            existingOrder.orderId ||
                                            ""
                                        ).trim() ===
                                        orderId
                                    );

                                }
                            );


                    if (exists) {

                        saveCurrentUser(
                            users[userIndex]
                        );

                        return true;
                    }
                }


                /* Add newest order first */

                users[userIndex]
                    .orders
                    .unshift(order);


                if (
                    !saveUsers(users)
                ) {

                    return false;
                }


                /* Update current user */

                saveCurrentUser(
                    users[userIndex]
                );


                /* Latest order */

                localStorage.setItem(
                    LATEST_ORDER_KEY,
                    JSON.stringify(order)
                );


                return true;

            } catch (error) {

                console.error(
                    "Unable to save order:",
                    error
                );

                return false;
            }
        };


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
                    CART_KEY
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
                    function (
                        total,
                        item
                    ) {

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
                String(
                    totalQuantity
                );

        } catch (error) {

            cartCount.textContent =
                "0";
        }
    }


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    const currentUser =
        refreshCurrentUserFromUsers();


    if (currentUser) {

        showDashboard(
            currentUser
        );

    } else {

        showLogin();
    }


    /* Initial cart count */

    updateCartCount();


    /* =====================================================
       STORAGE EVENT
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key === CART_KEY
            ) {

                updateCartCount();
            }


            if (
                event.key === USERS_KEY ||
                event.key === CURRENT_USER_KEY
            ) {

                const updatedUser =
                    refreshCurrentUserFromUsers();


                if (
                    updatedUser &&
                    dashboardSection &&
                    !dashboardSection.classList.contains(
                        "hidden"
                    )
                ) {

                    loadOrders(
                        updatedUser
                    );

                    loadProfile(
                        updatedUser
                    );

                    loadAddress(
                        updatedUser
                    );
                }
            }

        }
    );

});
