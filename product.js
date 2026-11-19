/* =========================================================
   THE FRIENDS HERITAGE - PRODUCT PAGE
   Loads one product from /api/products/:id and handles the
   photo gallery, sizes with prices, quantity and add to cart.
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const API = "/api";
    const TOKEN_KEY = "friendsHeritageCartToken";
    const SLIDE_MS = 5000;

    let product = null, images = [], index = 0, timer = null, variant = null, qty = 1;

    const $ = (id) => document.getElementById(id);
    const setText = (id, text) => { const e = $(id); if (e) e.textContent = text; };
    const money = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const imgUrl = (u) => {
        u = String(u || "").trim();
        if (!u) return "/logo.png";
        return /^(https?:|data:image\/|\/)/.test(u) ? u : "/" + u;
    };

    // Returns { ok, status, data }. data is null when the server sent a web page instead of JSON.
    async function api(path, options) {
        const r = await fetch(API + path, options);
        let data = null;
        try { data = await r.json(); } catch (e) { /* not JSON */ }
        return { ok: r.ok, status: r.status, data };
    }

    function token() {
        let t = localStorage.getItem(TOKEN_KEY);
        if (!t) {
            t = "cart_" + Date.now() + "_" + Math.random().toString(36).slice(2, 12);
            localStorage.setItem(TOKEN_KEY, t);
        }
        return t;
    }

    /* ---------- small styles for the gallery and message ---------- */
    const css = document.createElement("style");
    css.textContent = `
        .tfh-thumbs{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}
        .tfh-thumbs button{width:72px;height:72px;padding:3px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer;overflow:hidden}
        .tfh-thumbs button.on{border:2px solid #b68a20}
        .tfh-thumbs img{width:100%;height:100%;object-fit:cover}
        .tfh-nav{position:absolute;top:40%;transform:translateY(-50%);width:42px;height:42px;border:0;border-radius:50%;background:rgba(44,62,80,.85);color:#fff;font-size:22px;cursor:pointer;z-index:10}
        .tfh-prev{left:12px}.tfh-next{right:12px}
        #tfhToast{position:fixed;right:20px;bottom:20px;z-index:99999;padding:14px 20px;border-radius:10px;font:600 14px sans-serif;color:#fff;background:#2c3e50;box-shadow:0 8px 30px rgba(0,0,0,.2);transition:opacity .3s}
        #tfhToast.error{background:#c0392b}`;
    document.head.appendChild(css);

    function toast(message, error) {
        let t = $("tfhToast");
        if (!t) { t = document.createElement("div"); t.id = "tfhToast"; document.body.appendChild(t); }
        t.textContent = message;
        t.className = error ? "error" : "";
        t.style.opacity = "1";
        clearTimeout(t.timer);
        t.timer = setTimeout(() => { t.style.opacity = "0"; }, 3000);
    }

    /* ---------- photo gallery ---------- */
    const main = $("mainProductImage");

    function show(i) {
        if (!main || !images.length) return;
        index = (i + images.length) % images.length;
        main.src = images[index];
        document.querySelectorAll(".tfh-thumbs button").forEach((b, n) => b.classList.toggle("on", n === index));
    }
    function stop() { clearInterval(timer); timer = null; }
    function start() {
        stop();
        if (images.length > 1) timer = setInterval(() => show(index + 1), SLIDE_MS);
    }
    function go(i) { show(i); start(); }

    function buildGallery() {
        if (!main) return;
        let g = main.closest(".product-image-gallery");
        if (!g) {
            g = document.createElement("div");
            g.className = "product-image-gallery";
            main.parentElement.insertBefore(g, main);
            g.appendChild(main);
        }
        g.style.position = "relative";
        g.querySelectorAll(".tfh-gen").forEach((e) => e.remove());

        const thumbs = document.createElement("div");
        thumbs.className = "tfh-gen tfh-thumbs";
        thumbs.innerHTML = images.map((u, i) =>
            `<button type="button" data-i="${i}" class="${i === index ? "on" : ""}"><img src="${esc(u)}" alt="Photo ${i + 1}"></button>`).join("");
        thumbs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) go(+b.dataset.i); });
        thumbs.addEventListener("error", (e) => { if (e.target.tagName === "IMG") e.target.src = "/logo.png"; }, true);
        g.appendChild(thumbs);

        if (images.length > 1) {
            [["tfh-prev", "\u276E", -1], ["tfh-next", "\u276F", 1]].forEach(([cls, label, step]) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "tfh-gen tfh-nav " + cls;
                b.textContent = label;
                b.setAttribute("aria-label", step < 0 ? "Previous photo" : "Next photo");
                b.addEventListener("click", () => go(index + step));
                g.appendChild(b);
            });
        }
        g.onmouseenter = stop;
        g.onmouseleave = start;
    }

    function collectImages(p) {
        const list = [];
        (Array.isArray(p.images) ? p.images : []).forEach((item) => {
            const raw = typeof item === "string" ? item : item && (item.image || item.url || item.src);
            if (raw) list.push(imgUrl(raw));
        });
        if (!list.length && p.image) list.push(imgUrl(p.image));
        if (!list.length) list.push("/logo.png");
        return [...new Set(list)];
    }

    /* ---------- sizes and prices ---------- */
    function pick(v, button) {
        variant = v;
        document.querySelectorAll(".product-variant-btn").forEach((b) => b.classList.toggle("active", b === button));
        setText("selectedVariantText", "Selected: " + (v.name || "Standard"));
        const sale = Number(v.sale_price) || 0, orig = Number(v.original_price) || 0;
        setText("productPrice", money(sale));
        const old = $("productOldPrice");
        if (old) {
            const crossed = orig > sale;
            old.textContent = crossed ? money(orig) : "";
            old.style.display = crossed ? "inline" : "none";
        }
    }

    function renderVariants(p) {
        const box = $("productVariants");
        if (!box) return;
        let list = Array.isArray(p.variants) ? p.variants.slice() : [];
        if (!list.length) list = [{ id: null, name: "Standard", original_price: p.original_price, sale_price: p.sale_price }];
        box.innerHTML = "";
        list.forEach((v, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "product-variant-btn";
            b.textContent = v.name || "Standard";
            b.addEventListener("click", () => pick(v, b));
            box.appendChild(b);
            if (i === 0) pick(v, b);
        });
    }

    /* ---------- product information ---------- */
    function howToUse(p) {
        const t = ((p.category || "") + " " + (p.name || "")).toLowerCase();
        if (/saffron/.test(t)) return "Soak a few saffron strands in warm water or milk for several minutes before adding them to your favourite dishes, desserts or beverages.";
        if (/dry|nut|almond|walnut|cashew|raisin/.test(t)) return "Enjoy directly as a snack or add to breakfast, desserts, drinks and your favourite recipes.";
        if (/kahwa/.test(t)) return "Add the recommended quantity to hot water and allow it to steep for a few minutes. Add saffron, honey or nuts according to your preference.";
        if (/shilajit/.test(t)) return "Use only according to the product's labelled serving instructions. Mix the recommended quantity with a suitable warm beverage if specified on the packaging.";
        return "Use the product according to your preferred routine and keep it stored properly after use.";
    }

    function renderInfo(p) {
        const sizes = (p.variants || []).map((v) => v.name).filter(Boolean);

        setText("productCategory", p.category || "Kashmir Collection");
        setText("productName", p.name || "Product");
        setText("productShortDescription", p.description || "Premium authentic products from Kashmir.");
        setText("productDescription", p.description || "The Friends Heritage brings you authentic premium products sourced from the beautiful Kashmir Valley.");
        setText("specProductName", p.name || "—");
        setText("specCategory", p.category || "—");
        setText("specOrigin", "Kashmir, India");
        setText("specSizes", sizes.length ? sizes.join(", ") : "Standard");
        setText("productHowToUse", howToUse(p));
        setText("productStorage", "Store in a cool, dry place away from direct sunlight. Keep the package tightly closed after every use.");
        setText("faqAuthenticity", "Yes. The Friends Heritage focuses on authentic premium products sourced from Kashmir and carefully selected for quality.");
        setText("faqSizes", sizes.length ? "Available sizes: " + sizes.join(", ") : "This product is currently available in its standard size.");

        const stock = $("specStock");
        if (stock) (stock.closest("tr") || stock).style.display = "none";

        let benefits = p.benefits;
        if (typeof benefits === "string") benefits = benefits.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
        if (!Array.isArray(benefits) || !benefits.length) {
            benefits = ["Premium quality", "Authentically sourced from Kashmir", "Carefully selected", "Fresh and naturally preserved"];
        }
        const list = $("productBenefits");
        if (list) list.innerHTML = benefits.map((b) => `<li><i class="fa-solid fa-check"></i> ${esc(b)}</li>`).join("");
    }

    function render(p) {
        product = p;
        images = collectImages(p);
        index = 0;
        if (main) {
            main.alt = p.name || "Product image";
            main.style.transition = "opacity .25s ease";
            main.onerror = function () { this.onerror = null; this.src = "/logo.png"; };
        }
        show(0);
        buildGallery();
        start();
        renderInfo(p);
        renderVariants(p);
    }

    /* ---------- quantity ---------- */
    const qtyBox = $("productQuantity");
    const showQty = () => { if (qtyBox) { qtyBox.value = qty; if (qtyBox.tagName !== "INPUT") qtyBox.textContent = qty; } };
    $("decreaseQuantity")?.addEventListener("click", () => { qty = Math.max(1, qty - 1); showQty(); });
    $("increaseQuantity")?.addEventListener("click", () => { qty += 1; showQty(); });
    qtyBox?.addEventListener("change", () => { qty = Math.max(1, parseInt(qtyBox.value, 10) || 1); showQty(); });

    /* ---------- cart ---------- */
    async function refreshCartCount() {
        try {
            const headers = { "X-Cart-Token": token() };
            let res = await api("/cart/count", { headers });
            let n;
            if (res.data && res.data.count != null) {
                n = Number(res.data.count);
            } else {
                res = await api("/cart", { headers });   // older server: count the items ourselves
                n = ((res.data && res.data.items) || []).reduce((t, i) => t + (Number(i.quantity) || 0), 0);
            }
            const badge = $("cartCount");
            if (badge) { badge.textContent = n || 0; badge.style.display = n > 0 ? "inline-flex" : ""; }
        } catch (e) { /* the cart count is not critical */ }
    }

    async function addToCart() {
        if (!product || !variant) return toast("Please select a product size.", true);
        const button = $("addProductToCart"), note = $("productCartMessage");
        try {
            if (button) button.disabled = true;
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Cart-Token": token() },
                body: JSON.stringify({
                    product_id: Number(product.id),
                    variant_id: variant.id == null || variant.id === "" ? null : Number(variant.id),
                    quantity: qty
                })
            };
            let res = await api("/cart/items", options);
            if (res.data === null) res = await api("/cart", options);   // older server
            if (!res.ok || !res.data || !res.data.success) throw new Error((res.data && res.data.message) || "Could not add product to cart.");
            if (note) { note.textContent = "Product added to cart successfully."; note.style.color = "#2e7d32"; }
            toast("Product added to cart.");
            refreshCartCount();
        } catch (e) {
            if (note) { note.textContent = e.message; note.style.color = "#c0392b"; }
            toast(e.message || "Could not add product to cart.", true);
        } finally {
            if (button) button.disabled = false;
        }
    }
    $("addProductToCart")?.addEventListener("click", addToCart);

    /* ---------- load the product ---------- */
    function fail(message) {
        setText("productName", "Product unavailable");
        setText("productShortDescription", message);
        setText("productPrice", "—");
        toast(message, true);
    }

    async function load() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id") || params.get("product") || params.get("productId");
        if (!id) return fail("No product was selected.");
        try {
            const res = await api("/products/" + encodeURIComponent(id), { headers: { Accept: "application/json" } });
            let p = res.data && res.data.success ? res.data.product : null;
            if (!p && res.data === null) {
                // older server without the single-product route: find the product in the lists instead
                for (const path of ["/products", "/home-products"]) {
                    const list = await api(path);
                    p = ((list.data && list.data.products) || []).find((x) => String(x.id) === String(id));
                    if (p) break;
                }
            }
            if (!p) throw new Error((res.data && res.data.message) || "Product could not be loaded. Please try again.");
            render(p);
        } catch (e) {
            fail(e.message || "Unable to load product.");
        }
    }

    /* ---------- arrow keys change the photo ---------- */
    document.addEventListener("keydown", (e) => {
        if (images.length < 2 || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
    });

    showQty();
    refreshCartCount();
    load();
});