/* =========================================================
   THE FRIENDS HERITAGE
   ADMIN.JS
   ---------------------------------------------------------
   ADMIN DASHBOARD CONTROLLER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE_URL = window.location.origin;

    /* =====================================================
       DOM ELEMENTS
    ===================================================== */
    const statRevenue = document.getElementById("statRevenue");
    const statOrders = document.getElementById("statOrders");
    const statProducts = document.getElementById("statProducts");
    const statUsers = document.getElementById("statUsers");
    const ordersTableBody = document.getElementById("ordersTableBody");
    const addProductForm = document.getElementById("addProductForm");

    /* =====================================================
       FETCH ADMIN DASHBOARD DATA
    ===================================================== */
    async function loadAdminDashboard() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
                method: "GET",
                credentials: "include", // Required for session cookies
                headers: { "Accept": "application/json" }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Unauthorized access. Admins only.");
                window.location.href = "/account.html";
                return;
            }

            // 1. Populate Stats
            if (statRevenue) {
                statRevenue.textContent = "₹" + Number(data.stats.totalRevenue || 0).toLocaleString("en-IN");
            }
            if (statOrders) {
                statOrders.textContent = data.stats.totalOrders || 0;
            }
            if (statProducts) {
                statProducts.textContent = data.stats.totalProducts || 0;
            }
            if (statUsers) {
                statUsers.textContent = data.stats.usersCount || 0;
            }

            // 2. Populate Orders Table
            renderOrders(data.orders || []);

        } catch (error) {
            console.error("Admin Dashboard Load Error:", error);
            if (ordersTableBody) {
                ordersTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Failed to load dashboard data.</td></tr>`;
            }
        }
    }

    /* =====================================================
       RENDER ORDERS TABLE
    ===================================================== */
    function renderOrders(orders) {
        if (!ordersTableBody) return;

        if (orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No customer orders found.</td></tr>`;
            return;
        }

        ordersTableBody.innerHTML = orders.map(o => `
            <tr>
                <td><strong>#${escapeHTML(o.order_id)}</strong></td>
                <td>${escapeHTML(o.customer_name)}</td>
                <td>${escapeHTML(o.customer_phone)}<br><small style="color:#666;">${escapeHTML(o.customer_email || '')}</small></td>
                <td>${escapeHTML(o.address)}, ${escapeHTML(o.city)} - ${escapeHTML(o.pincode)}</td>
                <td><strong>₹${Number(o.total || 0).toLocaleString("en-IN")}</strong></td>
                <td>${escapeHTML(o.payment_method)}</td>
                <td>
                    <select id="status_${o.order_id}" style="padding: 6px; border-radius: 4px; border: 1px solid #ccc;">
                        <option value="Order Placed" ${o.status === 'Order Placed' ? 'selected' : ''}>Order Placed</option>
                        <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Dispatched" ${o.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button type="button" onclick="window.updateOrderStatus('${o.order_id}')" class="btn" style="padding: 6px 12px; font-size: 12px;">
                        Save
                    </button>
                </td>
            </tr>
        `).join("");
    }

    /* =====================================================
       UPDATE ORDER STATUS
    ===================================================== */
    window.updateOrderStatus = async function(orderId) {
        const selectEl = document.getElementById(`status_${orderId}`);
        if (!selectEl) return;
        const newStatus = selectEl.value;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ status: newStatus }),
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`Order #${orderId} status updated to "${newStatus}"!`);
            } else {
                alert(data.message || "Failed to update order status.");
            }
        } catch (error) {
            console.error("Update Status Error:", error);
            alert("Network error updating order status.");
        }
    };

    /* =====================================================
       ADD NEW PRODUCT FORM SUBMISSION
    ===================================================== */
    if (addProductForm) {
        addProductForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(addProductForm);

            const submitBtn = addProductForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Uploading Product...";
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
                    method: "POST",
                    body: formData, // FormData automatically handles file uploads and text fields
                    credentials: "include"
                });

                const data = await response.json();

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Upload Product";
                }

                if (response.ok && data.success) {
                    alert("Product uploaded successfully!");
                    addProductForm.reset();
                    loadAdminDashboard(); // Refresh stats and counts
                } else {
                    alert(data.message || "Failed to upload product.");
                }
            } catch (error) {
                console.error("Product Upload Error:", error);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Upload Product";
                }
                alert("Server error uploading product.");
            }
        });
    }

    /* =====================================================
       ADMIN LOGOUT
    ===================================================== */
    window.logoutAdmin = async function() {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include"
            });
            window.location.href = "/account.html";
        } catch (error) {
            window.location.href = "/account.html";
        }
    };

    /* =====================================================
       UTILITY: ESCAPE HTML
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
       INITIALIZE
    ===================================================== */
    loadAdminDashboard();

});

/* =====================================================
       LOAD EXISTING CATEGORIES INTO DROPDOWN
    ===================================================== */
    async function loadCategories() {
        const categorySelect = document.getElementById("productCategorySelect");
        if (!categorySelect) return;

        try {
            // Fetch products to extract existing categories
            const response = await fetch(`${API_BASE_URL}/api/products`, { credentials: "include" });
            const data = await response.json();

            // Also fetch home products to make sure we catch all categories
            const homeResponse = await fetch(`${API_BASE_URL}/api/home-products`, { credentials: "include" });
            const homeData = await homeResponse.json();

            let allProducts = [];
            if (data.success && Array.isArray(data.products)) allProducts = allProducts.concat(data.products);
            if (homeData.success && Array.isArray(homeData.products)) allProducts = allProducts.concat(homeData.products);

            // Extract unique category names
            const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];

            // Populate select dropdown
            categorySelect.innerHTML = `<option value="">Select an existing category...</option>` + 
                categories.map(cat => `<option value="${escapeHTML(cat)}">${escapeHTML(cat)}</option>`).join("");

        } catch (error) {
            console.error("Error loading categories:", error);
        }
    }