/* =========================================================
   THE FRIENDS HERITAGE - SHOP PAGE
   Shows the products added in the dashboard: search, category
   filter, sorting, sizes with prices and add to cart.

   Uses API_BASE_URL, getCartToken() and updateCartCount()
   from script.js (they are not redeclared here).
========================================================= */
(function () {
    "use strict";

    const BASE = typeof API_BASE_URL === "string" ? API_BASE_URL : "";
    const $ = (id) => document.getElementById(id);

    let products = [], searchText = "", category = "all", sortBy = "featured";

    /* ---------- helpers ---------- */
    const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const money = (n) => (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    const slug = (c) => String(c || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
    const pretty = (c) => c ? String(c).replace(/[-_]+/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Product";

    function imageSrc(u) {
        u = String(u || "").trim();
        if (!u) return "logo.png";
        if (/^(https?:|data:|\/)/.test(u)) return u;
        return /^(uploads|static)\//.test(u) ? "/" + u : u;
    }

    function firstPrice(p) {
        const v = p.variants[0];
        return Number(v && (v.sale_price || v.original_price)) || 0;
    }

    /* ---------- product data ---------- */
    function normalize(p) {
        const salePrice = Number(p.sale_price ?? p.salePrice ?? p.price ?? 0);
        const originalPrice = Number(p.original_price ?? p.originalPrice ?? p.price ?? 0);
        let variants = Array.isArray(p.variants) ? p.variants : (Array.isArray(p.product_variants) ? p.product_variants : []);
        if (!variants.length) variants = [{ id: null, name: p.weight ?? p.size ?? "Standard", sale_price: salePrice, original_price: originalPrice }];

        return {
            id: p.id ?? p.product_id ?? 0,
            name: p.name ?? p.title ?? "Unnamed Product",
            category: p.category ?? "other",
            description: p.description ?? "",
            image: p.image ?? p.image_url ?? "",
            badge: p.badge ?? "",
            variants: variants.map((v) => ({
                id: v.id ?? v.variant_id ?? null,
                name: v.name ?? v.weight ?? v.size ?? "Standard",
                original_price: Number(v.original_price ?? v.price ?? originalPrice ?? 0),
                sale_price: Number(v.sale_price ?? v.price ?? salePrice ?? 0)
            }))
        };
    }

    async function loadProducts() {
        try {
            const r = await fetch(BASE + "/api/products", { headers: { Accept: "application/json" } });
            if (!r.ok) throw new Error("Products API returned " + r.status);
            const data = await r.json();
            const list = Array.isArray(data) ? data : (data.products || data.data || []);
            products = list.map(normalize);
            syncCategories();
            render();
        } catch (e) {
            console.error("Shop products error:", e);
            products = [];
            showError();
        }
    }

    // categories added in the dashboard appear in the filter automatically
    function syncCategories() {
        const select = $("categoryFilter");
        if (!select) return;
        const have = new Set(Array.from(select.options).map((o) => slug(o.value)));
        [...new Set(products.map((p) => p.category).filter(Boolean))].forEach((c) => {
            if (have.has(slug(c))) return;
            const option = document.createElement("option");
            option.value = slug(c);
            option.textContent = pretty(c);
            select.appendChild(option);
            have.add(slug(c));
        });
    }

    /* ---------- filters ---------- */
    function visibleProducts() {
        let list = products.filter((p) => {
            if (searchText && ![p.name, p.category, p.description].join(" ").toLowerCase().includes(searchText)) return false;
            return category === "all" || slug(p.category) === slug(category);
        });
        if (sortBy === "low-high") list.sort((a, b) => firstPrice(a) - firstPrice(b));
        else if (sortBy === "high-low") list.sort((a, b) => firstPrice(b) - firstPrice(a));
        else if (sortBy === "name") list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
        return list;
    }

    function clearFilters() {
        searchText = ""; category = "all"; sortBy = "featured";
        if ($("productSearch")) $("productSearch").value = "";
        if ($("categoryFilter")) $("categoryFilter").value = "all";
        if ($("sortProducts")) $("sortProducts").value = "featured";
        render();
    }

    function setupControls() {
        $("productSearch")?.addEventListener("input", function () { searchText = this.value.trim().toLowerCase(); render(); });
        $("categoryFilter")?.addEventListener("change", function () { category = this.value.trim().toLowerCase(); render(); });
        $("sortProducts")?.addEventListener("change", function () { sortBy = this.value; render(); });
        $("clearFiltersBtn")?.addEventListener("click", clearFilters);
        $("emptyClearBtn")?.addEventListener("click", clearFilters);
    }

    /* ---------- rendering ---------- */
    function priceHTML(v) {
        const sale = Number(v.sale_price) || 0, orig = Number(v.original_price) || 0;
        if (orig > sale && sale > 0) {
            return `<span class="shop-sale-price">₹${money(sale)}</span>` +
                   `<span class="shop-original-price">₹${money(orig)}</span>` +
                   `<span class="shop-save-price">Save ₹${money(orig - sale)}</span>`;
        }
        return `<span class="shop-sale-price">₹${money(sale || orig)}</span>`;
    }

    function render() {
        const grid = $("productsGrid");
        if (!grid) return;
        const list = visibleProducts();
        grid.innerHTML = "";
        if ($("shopProductCount")) $("shopProductCount").textContent = list.length === 1 ? "1 Product" : list.length + " Products";
        if ($("shopEmpty")) $("shopEmpty").hidden = list.length > 0;
        list.forEach((p) => grid.appendChild(createCard(p)));
    }

    function createCard(p) {
        const card = document.createElement("article");
        card.className = "shop-product-card";
        card.dataset.productId = p.id;
        let variant = p.variants[0];

        card.innerHTML = `
            <div class="shop-product-image">
                ${p.badge ? `<span class="shop-product-badge">${esc(p.badge)}</span>` : ""}
                <img src="${esc(imageSrc(p.image))}" alt="${esc(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='logo.png'">
            </div>
            <div class="shop-product-body">
                <div class="shop-product-category">${esc(pretty(p.category))}</div>
                <h3 class="shop-product-name">${esc(p.name)}</h3>
                ${p.description ? `<p class="shop-product-description">${esc(p.description)}</p>` : ""}
                <div class="shop-product-variants" data-variants>
                    ${p.variants.map((v, i) => `<button type="button" class="shop-variant-btn ${i === 0 ? "active" : ""}" data-variant-index="${i}">${esc(v.name)}</button>`).join("")}
                </div>
                <div class="shop-product-price" data-price>${priceHTML(variant)}</div>
                <button type="button" class="shop-add-cart-btn" data-add-cart><i class="fa-solid fa-cart-plus"></i><span>Add To Cart</span></button>
                <a href="product.html?id=${encodeURIComponent(p.id)}" class="shop-view-product-btn"><span>View Product</span><i class="fa-solid fa-arrow-right"></i></a>
            </div>`;

        const buttons = card.querySelectorAll(".shop-variant-btn");
        buttons.forEach((button, i) => button.addEventListener("click", () => {
            variant = p.variants[i];
            buttons.forEach((b) => b.classList.toggle("active", b === button));
            card.querySelector("[data-price]").innerHTML = priceHTML(variant);
        }));

        const add = card.querySelector("[data-add-cart]");
        add.addEventListener("click", () => addToCart(p, variant, add));
        return card;
    }

    /* ---------- cart ---------- */
    async function post(path, body) {
        const r = await fetch(BASE + path, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Cart-Token": typeof getCartToken === "function" ? getCartToken() : "" },
            body: JSON.stringify(body)
        });
        let data = null;
        try { data = await r.json(); } catch (e) { /* the server sent a web page instead of data */ }
        return { ok: r.ok, data };
    }

    async function addToCart(p, variant, button) {
        if (!p.id) return alert("Unable to add this product to cart.");
        const original = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Adding...</span>';
        try {
            const body = { product_id: Number(p.id), variant_id: variant && variant.id ? Number(variant.id) : null, quantity: 1 };
            let res = await post("/api/cart/items", body);
            if (res.data === null) res = await post("/api/cart", body);   // older server
            if (!res.ok || !res.data || !res.data.success) throw new Error((res.data && res.data.message) || "Unable to add product to cart.");
            if (typeof updateCartCount === "function") await updateCartCount();
            button.classList.add("added");
            button.innerHTML = '<i class="fa-solid fa-check"></i><span>Added To Cart</span>';
            setTimeout(() => { button.classList.remove("added"); button.innerHTML = original; button.disabled = false; }, 1200);
        } catch (e) {
            console.error("Shop add-to-cart error:", e);
            button.innerHTML = original;
            button.disabled = false;
            alert(e.message || "Something went wrong while adding the product.");
        }
    }

    /* ---------- error state ---------- */
    function showError() {
        if ($("shopProductCount")) $("shopProductCount").textContent = "Unable to load products";
        if ($("shopEmpty")) $("shopEmpty").hidden = true;
        const grid = $("productsGrid");
        if (grid) grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:55px 20px;color:#71808b">
                <i class="fa-solid fa-circle-exclamation" style="font-size:35px;color:#d4a62a;margin-bottom:15px"></i>
                <h3 style="margin:0 0 8px;color:#1f2d3a">Products Could Not Be Loaded</h3>
                <p style="margin:0;font-size:14px">Please make sure the server is running and refresh the page.</p>
            </div>`;
    }

    document.addEventListener("DOMContentLoaded", () => {
        $("shopLoading")?.remove();
        setupControls();
        loadProducts();
    });
})();