/* =========================================================
   THE FRIENDS HERITAGE
   ACCOUNT.JS (WITH 3-STEP EMAIL OTP PASSWORD RESET)
   ---------------------------------------------------------
   NODE.JS + EXPRESS VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const API = window.location.origin + "/api";
    console.log("ACCOUNT API:", API);

    const CART_TOKEN_KEY = "friendsHeritageCartToken";

    /* =====================================================
       DOM ELEMENTS
    ===================================================== */
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    const dashboardSection = document.getElementById("dashboardSection");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const registerName = document.getElementById("registerName");
    const registerEmail = document.getElementById("registerEmail");
    const registerPassword = document.getElementById("registerPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const loginMessage = document.getElementById("loginMessage");
    const registerMessage = document.getElementById("registerMessage");

    const showRegisterBtn = document.getElementById("showRegisterBtn");
    const backToLoginBtn = document.getElementById("backToLoginBtn");
    const loginPasswordToggle = document.getElementById("loginPasswordToggle");
    const registerPasswordToggle = document.getElementById("registerPasswordToggle");
    const confirmPasswordToggle = document.getElementById("confirmPasswordToggle");

    const welcomeUser = document.getElementById("welcomeUser");
    const logoutBtn = document.getElementById("logoutBtn");
    const dashboardCards = document.querySelectorAll(".dashboard-card");
    const dashboardPanels = document.querySelectorAll(".dashboard-panel");
    const closePanelButtons = document.querySelectorAll(".close-panel");
    const ordersPanel = document.getElementById("ordersPanel");

    const profileForm = document.getElementById("profileForm");
    const profileName = document.getElementById("profileName");
    const profileContact = document.getElementById("profileContact");
    const profileMessage = document.getElementById("profileMessage");

    const addressForm = document.getElementById("addressForm");
    const addressName = document.getElementById("addressName");
    const addressPhone = document.getElementById("addressPhone");
    const addressLine = document.getElementById("addressLine");
    const addressCity = document.getElementById("addressCity");
    const addressState = document.getElementById("addressState");
    const addressPincode = document.getElementById("addressPincode");
    const addressMessage = document.getElementById("addressMessage");

    // Forgot Password Elements
    const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
    const forgotModal = document.getElementById("forgotModal");
    const closeForgotModal = document.getElementById("closeForgotModal");
    const forgotForm = document.getElementById("forgotForm");
    const forgotContact = document.getElementById("forgotContact");
    const forgotMessage = document.getElementById("forgotMessage");

    const cartCount = document.getElementById("cartCount");

    let currentUser = null;

    /* =====================================================
       UTILITY FUNCTIONS
    ===================================================== */
    function addEvent(element, event, handler) {
        if (element) element.addEventListener(event, handler);
    }

    function showMessage(element, message, type = "error") {
        if (!element) return;
        element.textContent = message || "";
        element.className = type ? "form-message " + type : "form-message";
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function normalizeEmail(value) { return String(value || "").trim().toLowerCase(); }
    function normalizePhone(value) { return String(value || "").replace(/\D/g, ""); }
    function isEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim()); }
    function isMobile(value) { return /^[6-9]\d{9}$/.test(normalizePhone(value)); }
    function isValidContact(value) { return isEmail(value) || isMobile(value); }

    function getCartToken() {
        let token = localStorage.getItem(CART_TOKEN_KEY);
        if (!token) {
            token = "cart_" + Date.now() + "_" + Math.random().toString(36).substring(2, 12);
            localStorage.setItem(CART_TOKEN_KEY, token);
        }
        return token;
    }

    async function apiRequest(endpoint, options = {}) {
        const finalOptions = {
            method: options.method || "GET",
            credentials: "include",
            headers: {
                "Accept": "application/json",
                ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
                "X-Cart-Token": getCartToken(),
                ...(options.headers || {})
            }
        };
        if (options.body !== undefined) finalOptions.body = options.body;

        try {
            const response = await fetch(API + endpoint, finalOptions);
            const data = await response.json().catch(() => ({ success: false, message: "Invalid JSON response" }));
            return { ok: response.ok, status: response.status, data };
        } catch (error) {
            return { ok: false, status: 0, data: { success: false, message: "Server unreachable." } };
        }
    }

    /* =====================================================
       UI TOGGLES
    ===================================================== */
    function setupPasswordToggle(button, input) {
        if (!button || !input) return;
        button.addEventListener("click", function () {
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            const icon = button.querySelector("i");
            if (icon) icon.className = isPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
        });
    }

    setupPasswordToggle(loginPasswordToggle, loginPassword);
    setupPasswordToggle(registerPasswordToggle, registerPassword);
    setupPasswordToggle(confirmPasswordToggle, confirmPassword);

    function showLogin() {
        if (loginSection) loginSection.classList.remove("hidden");
        if (registerSection) registerSection.classList.add("hidden");
        if (dashboardSection) dashboardSection.classList.add("hidden");
    }

    function showRegister() {
        if (loginSection) loginSection.classList.add("hidden");
        if (registerSection) registerSection.classList.remove("hidden");
        if (dashboardSection) dashboardSection.classList.add("hidden");
    }

    function showDashboard() {
        if (!currentUser) { showLogin(); return; }
        if (loginSection) loginSection.classList.add("hidden");
        if (registerSection) registerSection.classList.add("hidden");
        if (dashboardSection) dashboardSection.classList.remove("hidden");
        if (welcomeUser) welcomeUser.textContent = currentUser.name || "Welcome";

        loadProfile();
        loadAddress();
        loadOrders();
        updateCartCount();
    }

    /* =====================================================
       CHECK AUTHENTICATION
    ===================================================== */
    async function checkAuthentication() {
        const result = await apiRequest("/auth/me");
        if (result.ok && result.data?.authenticated && result.data?.user) {
            currentUser = result.data.user;
            showDashboard();
            return true;
        }
        currentUser = null;
        return false;
    }

    /* =====================================================
       REGISTER
    ===================================================== */
    addEvent(registerForm, "submit", async function (event) {
        event.preventDefault();
        showMessage(registerMessage, "", "");

        const name = registerName ? registerName.value.trim() : "";
        const contact = registerEmail ? registerEmail.value.trim() : "";
        const password = registerPassword ? registerPassword.value : "";
        const confirm = confirmPassword ? confirmPassword.value : "";

        if (name.length < 2) return showMessage(registerMessage, "Please enter your full name.");
        if (!isValidContact(contact)) return showMessage(registerMessage, "Enter a valid email or mobile number.");
        if (password.length < 6) return showMessage(registerMessage, "Password must be at least 6 characters.");
        if (password !== confirm) return showMessage(registerMessage, "Passwords do not match.");

        const payload = {
            name,
            email: isEmail(contact) ? normalizeEmail(contact) : "",
            phone: isMobile(contact) ? normalizePhone(contact) : "",
            password
        };

        const result = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload) });

        if (!result.ok || !result.data?.success) {
            return showMessage(registerMessage, result.data?.message || "Registration failed.");
        }

        showMessage(registerMessage, "Account created successfully!", "success");
        currentUser = result.data.user;
        showDashboard();
    });

    /* =====================================================
       LOGIN
    ===================================================== */
    addEvent(loginForm, "submit", async function (event) {
        event.preventDefault();
        showMessage(loginMessage, "", "");

        const contact = loginEmail ? loginEmail.value.trim() : "";
        const password = loginPassword ? loginPassword.value : "";

        if (!isValidContact(contact)) return showMessage(loginMessage, "Enter a valid email or mobile number.");
        if (!password) return showMessage(loginMessage, "Enter your password.");

        const result = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ identifier: contact, password: password })
        });

        if (!result.ok || !result.data?.success) {
            return showMessage(loginMessage, result.data?.message || "Invalid credentials.");
        }

        showMessage(loginMessage, "Login successful!", "success");
        currentUser = result.data.user;
        showDashboard();
    });

    /* =====================================================
       LOGOUT
    ===================================================== */
    addEvent(logoutBtn, "click", async function () {
        await apiRequest("/auth/logout", { method: "POST" });
        currentUser = null;
        showLogin();
        if (loginForm) loginForm.reset();
        await updateCartCount();
        showMessage(loginMessage, "Logged out successfully.", "success");
    });

    addEvent(showRegisterBtn, "click", showRegister);
    addEvent(backToLoginBtn, "click", showLogin);

    /* =====================================================
       3-STEP FORGOT PASSWORD WITH EMAIL OTP
       Step 1: Enter Email -> Send OTP
       Step 2: Enter 6-Digit OTP -> Verify OTP
       Step 3: Enter New Password & Confirm -> Reset & Go to Login
    ===================================================== */
    let resetState = {
        step: 1,
        email: "",
        otp: ""
    };

    // Inject dynamic OTP & New Password fields inside forgotForm if not already present
    function setupOtpFields() {
        if (!forgotForm || document.getElementById("otpStepContainer")) return;

        const extraFieldsHTML = `
            <div id="otpStepContainer" style="display: none; margin-top: 12px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:6px; color:#333;">Enter 6-Digit OTP</label>
                <input type="text" id="forgotOtpInput" maxlength="6" placeholder="Enter 6-digit OTP from email"
                    style="width:100%; padding:12px; border:1px solid #ccc; border-radius:6px; font-size:16px; letter-spacing:4px; text-align:center; font-weight:bold; box-sizing:border-box; margin-bottom:10px;" />
            </div>

            <div id="newPasswordStepContainer" style="display: none; margin-top: 12px;">
                <div style="margin-bottom: 12px;">
                    <label style="display:block; font-size:13px; font-weight:600; margin-bottom:6px; color:#333;">New Password</label>
                    <input type="password" id="forgotNewPassword" placeholder="Minimum 6 characters"
                        style="width:100%; padding:12px; border:1px solid #ccc; border-radius:6px; font-size:14px; box-sizing:border-box;" />
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="display:block; font-size:13px; font-weight:600; margin-bottom:6px; color:#333;">Confirm New Password</label>
                    <input type="password" id="forgotConfirmPassword" placeholder="Re-enter new password"
                        style="width:100%; padding:12px; border:1px solid #ccc; border-radius:6px; font-size:14px; box-sizing:border-box;" />
                </div>
            </div>
        `;

        const submitBtn = forgotForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.insertAdjacentHTML("beforebegin", extraFieldsHTML);
        } else {
            forgotForm.insertAdjacentHTML("beforeend", extraFieldsHTML);
        }
    }

    function resetForgotModalUI() {
        setupOtpFields();
        resetState = { step: 1, email: "", otp: "" };

        if (forgotContact) {
            forgotContact.disabled = false;
            forgotContact.value = "";
            forgotContact.parentElement.style.display = "block";
        }

        const otpBox = document.getElementById("otpStepContainer");
        const passBox = document.getElementById("newPasswordStepContainer");
        const otpInput = document.getElementById("forgotOtpInput");
        const newPassInput = document.getElementById("forgotNewPassword");
        const confirmPassInput = document.getElementById("forgotConfirmPassword");
        const submitBtn = forgotForm ? forgotForm.querySelector('button[type="submit"]') : null;

        if (otpBox) otpBox.style.display = "none";
        if (passBox) passBox.style.display = "none";
        if (otpInput) otpInput.value = "";
        if (newPassInput) newPassInput.value = "";
        if (confirmPassInput) confirmPassInput.value = "";
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send OTP";
        }
        if (forgotMessage) showMessage(forgotMessage, "", "");
    }

    addEvent(forgotPasswordBtn, "click", () => {
        resetForgotModalUI();
        if (forgotModal) forgotModal.classList.remove("hidden");
        if (forgotContact) forgotContact.focus();
    });

    addEvent(closeForgotModal, "click", () => {
        if (forgotModal) forgotModal.classList.add("hidden");
        resetForgotModalUI();
    });

    addEvent(forgotForm, "submit", async function (event) {
        event.preventDefault();
        setupOtpFields();

        const submitBtn = forgotForm.querySelector('button[type="submit"]');
        const otpBox = document.getElementById("otpStepContainer");
        const passBox = document.getElementById("newPasswordStepContainer");
        const otpInput = document.getElementById("forgotOtpInput");
        const newPassInput = document.getElementById("forgotNewPassword");
        const confirmPassInput = document.getElementById("forgotConfirmPassword");

        // ---------------------------------------------------
        // STEP 1: SEND OTP TO EMAIL
        // ---------------------------------------------------
        if (resetState.step === 1) {
            const contact = forgotContact ? forgotContact.value.trim() : "";
            if (!isEmail(contact)) {
                return showMessage(forgotMessage, "Please enter a valid registered email address.", "error");
            }

            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending OTP..."; }
            showMessage(forgotMessage, "", "");

            const result = await apiRequest("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email: contact })
            });

            if (submitBtn) { submitBtn.disabled = false; }

            if (!result.ok || !result.data?.success) {
                if (submitBtn) submitBtn.textContent = "Send OTP";
                return showMessage(forgotMessage, result.data?.message || "Failed to send OTP.", "error");
            }

            // Advance to Step 2 (Enter OTP)
            resetState.step = 2;
            resetState.email = normalizeEmail(contact);
            if (forgotContact) forgotContact.disabled = true;
            if (otpBox) otpBox.style.display = "block";
            if (submitBtn) submitBtn.textContent = "Verify OTP";
            if (otpInput) otpInput.focus();

            return showMessage(forgotMessage, result.data.message || "OTP sent! Please check your email.", "success");
        }

        // ---------------------------------------------------
        // STEP 2: VERIFY 6-DIGIT OTP
        // ---------------------------------------------------
        if (resetState.step === 2) {
            const enteredOtp = otpInput ? otpInput.value.trim() : "";
            if (!/^\d{6}$/.test(enteredOtp)) {
                return showMessage(forgotMessage, "Please enter the valid 6-digit OTP from your email.", "error");
            }

            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Verifying OTP..."; }

            const result = await apiRequest("/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({ email: resetState.email, otp: enteredOtp })
            });

            if (submitBtn) { submitBtn.disabled = false; }

            if (!result.ok || !result.data?.success) {
                if (submitBtn) submitBtn.textContent = "Verify OTP";
                return showMessage(forgotMessage, result.data?.message || "Invalid or expired OTP.", "error");
            }

            // Advance to Step 3 (Enter New Password & Confirm Password)
            resetState.step = 3;
            resetState.otp = enteredOtp;
            if (forgotContact) forgotContact.parentElement.style.display = "none";
            if (otpBox) otpBox.style.display = "none";
            if (passBox) passBox.style.display = "block";
            if (submitBtn) submitBtn.textContent = "Update Password";
            if (newPassInput) newPassInput.focus();

            return showMessage(forgotMessage, "OTP Verified! Enter your new password below.", "success");
        }

        // ---------------------------------------------------
        // STEP 3: SAVE NEW PASSWORD & GO TO LOGIN
        // ---------------------------------------------------
        if (resetState.step === 3) {
            const pass = newPassInput ? newPassInput.value : "";
            const confirmPass = confirmPassInput ? confirmPassInput.value : "";

            if (pass.length < 6) {
                return showMessage(forgotMessage, "New password must be at least 6 characters.", "error");
            }
            if (pass !== confirmPass) {
                return showMessage(forgotMessage, "Passwords do not match.", "error");
            }

            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Updating Password..."; }

            const result = await apiRequest("/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({
                    email: resetState.email,
                    otp: resetState.otp,
                    password: pass
                })
            });

            if (submitBtn) { submitBtn.disabled = false; }

            if (!result.ok || !result.data?.success) {
                if (submitBtn) submitBtn.textContent = "Update Password";
                return showMessage(forgotMessage, result.data?.message || "Failed to update password.", "error");
            }

            showMessage(forgotMessage, "Password updated! Redirecting to login...", "success");

            // Close modal, pre-fill email in login box, and show Login screen
            const updatedEmail = resetState.email;
            setTimeout(() => {
                if (forgotModal) forgotModal.classList.add("hidden");
                resetForgotModalUI();
                showLogin();
                if (loginEmail) loginEmail.value = updatedEmail;
                if (loginPassword) {
                    loginPassword.value = "";
                    loginPassword.focus();
                }
                showMessage(loginMessage, "Password reset successfully! Please log in with your new password.", "success");
            }, 1000);
        }
    });

    /* =====================================================
       DASHBOARD PANELS & UI
    ===================================================== */
    function closeAllPanels() {
        dashboardPanels.forEach(panel => panel.classList.add("hidden"));
    }

    dashboardCards.forEach(card => {
        card.addEventListener("click", () => {
            const panelId = card.dataset.panel;
            const panel = document.getElementById(panelId);
            if (!panel) return;
            closeAllPanels();
            panel.classList.remove("hidden");
            if (panelId === "ordersPanel") loadOrders();
            setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        });
    });

    closePanelButtons.forEach(btn => btn.addEventListener("click", function () {
        this.closest(".dashboard-panel").classList.add("hidden");
    }));

    /* =====================================================
       LOAD DATA
    ===================================================== */
    function loadProfile() {
        if (!currentUser) return;
        if (profileName) profileName.value = currentUser.name || "";
        if (profileContact) profileContact.value = currentUser.email || currentUser.phone || "";
    }

    function loadAddress() {
        if (!currentUser) return;
        if (addressName) addressName.value = currentUser.name || "";
        if (addressPhone) addressPhone.value = currentUser.phone || "";
        if (addressLine) addressLine.value = currentUser.address || "";
        if (addressCity) addressCity.value = currentUser.city || "";
        if (addressState) addressState.value = currentUser.state || "";
        if (addressPincode) addressPincode.value = currentUser.pincode || "";
    }

    async function loadOrders(silent) {
        if (!currentUser || !ordersPanel) return;

        let container = ordersPanel.querySelector(".orders-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "orders-container";
            ordersPanel.appendChild(container);
        }

        // The page has a built-in "No Orders Yet" box: hide it while orders load, and show it only when there are none
        const emptyState = ordersPanel.querySelector(".empty-state");
        if (emptyState && !silent) emptyState.style.display = "none";

        container.classList.remove("hidden");
        if (!silent) container.innerHTML = `<div class="orders-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>`;

        const result = await apiRequest("/orders/me");

        // Account removed or session ended: go back to the login screen
        if (result.status === 401) {
            currentUser = null;
            showLogin();
            return;
        }
        if (!result.ok || !result.data?.success) {
            if (!silent) container.innerHTML = `<p style="color: red;">Error loading orders. Please try again later.</p>`;
            return;
        }

        const orders = result.data.orders || [];
        if (orders.length === 0) {
            container.innerHTML = "";
            if (emptyState) emptyState.style.display = "";
            return;
        }

        container.innerHTML = orders.map(order => {
            const date = order.created_at || order.createdAt;
            const when = date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
            const inr = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
            const items = (order.items || []).map(i => {
                const rate = Number(i.price) || 0, qty = Number(i.quantity) || 1;
                return `<li>${escapeHTML(i.name)}${i.variant ? " (" + escapeHTML(i.variant) + ")" : ""}
                    <br><small>${inr(rate)} × ${qty} = <strong>${inr(rate * qty)}</strong></small></li>`;
            }).join("");
            return `
                <article class="order-card" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                    <h4>Order #${escapeHTML(order.order_id)} <small>${escapeHTML(when)}</small></h4>
                    ${items ? `<ul style="margin: 8px 0; padding-left: 18px;">${items}</ul>` : ""}
                    <p>Total: <strong>${inr(order.total)}</strong> | Status: <strong>${escapeHTML(order.status || "Pending")}</strong></p>
                    <p>Payment: ${escapeHTML(/^cod$/i.test(order.payment_method || "") ? "Cash on Delivery" : order.payment_method)}
                        &middot; <strong style="color:${order.payment_confirmed ? "#2e7d32" : "#b26a00"}">${order.payment_confirmed ? "Paid" : "Payment pending"}</strong></p>
                </article>`;
        }).join("");
    }

    /* =====================================================
       SAVE PROFILE
    ===================================================== */
    addEvent(profileForm, "submit", async function (event) {
        event.preventDefault();
        showMessage(profileMessage, "", "");

        const name = profileName ? profileName.value.trim() : "";
        if (name.length < 2) return showMessage(profileMessage, "Please enter your full name.");

        const result = await apiRequest("/auth/profile", { method: "PUT", body: JSON.stringify({ name }) });
        if (!result.ok || !result.data?.success) {
            return showMessage(profileMessage, result.data?.message || "Could not update profile.");
        }

        currentUser = result.data.user;
        if (welcomeUser) welcomeUser.textContent = currentUser.name || "Welcome";
        showMessage(profileMessage, "Profile updated successfully!", "success");
    });

    /* =====================================================
       SAVE ADDRESS (shows up in the admin dashboard too)
    ===================================================== */
    addEvent(addressForm, "submit", async function (event) {
        event.preventDefault();
        showMessage(addressMessage, "", "");

        const payload = {
            phone: addressPhone ? addressPhone.value.trim() : "",
            address: addressLine ? addressLine.value.trim() : "",
            city: addressCity ? addressCity.value.trim() : "",
            state: addressState ? addressState.value.trim() : "",
            pincode: addressPincode ? addressPincode.value.trim() : ""
        };

        if (payload.address.length < 5) return showMessage(addressMessage, "Please enter your full address.");
        if (payload.phone && !isMobile(payload.phone)) return showMessage(addressMessage, "Enter a valid 10-digit mobile number.");
        if (!/^\d{6}$/.test(payload.pincode)) return showMessage(addressMessage, "Enter a valid 6-digit pincode.");

        const result = await apiRequest("/auth/address", { method: "PUT", body: JSON.stringify(payload) });
        if (!result.ok || !result.data?.success) {
            return showMessage(addressMessage, result.data?.message || "Could not save address.");
        }

        currentUser = result.data.user;
        showMessage(addressMessage, "Address saved successfully!", "success");
    });

    /* =====================================================
       AUTO LOGOUT IF THE ADMIN REMOVES THIS ACCOUNT
    ===================================================== */
    async function verifySession() {
        if (!currentUser) return;
        const result = await apiRequest("/auth/me");
        if (result.status === 401) {
            currentUser = null;
            showLogin();
            showMessage(loginMessage, "Your session has ended. Please log in again.", "error");
        }
    }

    // keep "My Orders" up to date (payment status, delivery) without the customer reloading the page
    function refreshOrdersQuietly() {
        if (currentUser && ordersPanel && !ordersPanel.classList.contains("hidden")) loadOrders(true);
    }
    setInterval(refreshOrdersQuietly, 30000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) refreshOrdersQuietly(); });

    setInterval(verifySession, 30000);
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) verifySession();
    });

    /* =====================================================
       CART COUNT
    ===================================================== */
    async function updateCartCount() {
        if (!cartCount) return;
        try {
            const result = await apiRequest("/cart");
            if (result.ok && result.data?.items) {
                const totalQuantity = result.data.items.reduce((acc, item) => acc + item.quantity, 0);
                cartCount.textContent = totalQuantity;
            } else {
                cartCount.textContent = "0";
            }
        } catch (error) {
            cartCount.textContent = "0";
        }
    }

    window.addEventListener("cartUpdated", updateCartCount);

    /* =====================================================
       INITIALIZE
    ===================================================== */
    getCartToken();
    updateCartCount();
    setupOtpFields();
    checkAuthentication();

});