require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Op, DataTypes } = require('sequelize');
const { User, Product, ProductVariant, Cart, CartItem, Order, sequelize } = require('./database');

// Remembers what was in each order (created automatically by sequelize.sync)
const OrderItem = sequelize.define('OrderItem', {
    order_id: { type: DataTypes.STRING, allowNull: false },
    product_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    variant: DataTypes.STRING,
    price: DataTypes.FLOAT,
    quantity: DataTypes.INTEGER,
    image: DataTypes.STRING
}, { tableName: 'order_items', timestamps: false });

// Customers the admin has "removed" (signed out once, kept in the dashboard; they become Active again when they log in)
const CustomerStatus = sequelize.define('CustomerStatus', {
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    removed_at: DataTypes.DATE
}, { tableName: 'customer_status', timestamps: false });

// Archive of deleted customers: the website account is gone, but the details stay for the admin
const DeletedCustomer = sequelize.define('DeletedCustomer', {
    original_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    pincode: DataTypes.STRING,
    joined_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE
}, { tableName: 'deleted_customers', timestamps: false });

// Staff accounts: created by the owner, usable only while Active
const StaffAccount = sequelize.define('StaffAccount', {
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    last_login_at: DataTypes.DATE,
    created_at: DataTypes.DATE
}, { tableName: 'staff_accounts', timestamps: false });

// Which staff member confirmed (took) an order. Unassigned orders are visible to every staff member.
const OrderAssignment = sequelize.define('OrderAssignment', {
    order_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    staff_id: { type: DataTypes.INTEGER, allowNull: false },
    staff_name: DataTypes.STRING,
    assigned_at: DataTypes.DATE
}, { tableName: 'order_assignments', timestamps: false });

// Extra photos for a product. The first photo is also saved as the product's main image.
const ProductImage = sequelize.define('ProductImage', {
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    position: DataTypes.INTEGER
}, { tableName: 'product_images', timestamps: false });

// Adds an `images` list (in order) to each product
async function attachImages(products) {
    let rows = [];
    try {
        rows = await ProductImage.findAll({ order: [['position', 'ASC']], raw: true });
    } catch (e) {
        // The photos table is not ready yet (restart the server so it can be created). Products still load with their main photo.
        console.error("Product photos table is not available yet:", e.message);
    }
    const by = {};
    rows.forEach(r => { (by[r.product_id] = by[r.product_id] || []).push(r.url); });
    return products.map(p => {
        const j = p.toJSON();
        if (Array.isArray(j.variants)) j.variants.sort((a, b) => a.id - b.id);
        j.images = by[j.id] && by[j.id].length ? by[j.id] : (j.image && j.image !== '/logo.png' ? [j.image] : []);
        return j;
    });
}

async function setProductImages(product, urls) {
    const list = urls.filter(Boolean).slice(0, 10);
    try {
        await ProductImage.destroy({ where: { product_id: product.id } });
        if (list.length) {
            await ProductImage.bulkCreate(list.map((url, i) => ({ product_id: product.id, url, position: i })));
        }
    } catch (e) {
        console.error("Could not save the extra photos (restart the server so the photos table is created):", e.message);
    }
    await product.update({ image: list[0] || '/logo.png' });
}

// Reads the photos sent from the dashboard: uploaded files and kept links, in the order the staff arranged them
function buildImageList(req) {
    const uploaded = (req.files || []).map(f => '/uploads/' + f.filename);
    let order = null;
    try { order = JSON.parse(req.body.image_order); } catch (e) {}
    const okUrl = (u) => typeof u === 'string' && /^(\/|https?:\/\/)/.test(u) && u.length < 500;
    let list = [];
    if (Array.isArray(order)) {
        order.forEach(t => {
            if (t && okUrl(t.url)) list.push(t.url);
            else if (t && Number.isInteger(t.file) && uploaded[t.file]) list.push(uploaded[t.file]);
        });
    } else {
        list = uploaded.slice();
    }
    const link = String(req.body.image_url || '').trim();
    if (okUrl(link)) list.push(link);
    return { list: list.slice(0, 10), provided: Array.isArray(order) || uploaded.length > 0 || !!link };
}

// Payment confirmation: a row means the payment for that order has been confirmed
const OrderPayment = sequelize.define('OrderPayment', {
    order_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    confirmed_by_id: DataTypes.INTEGER,
    confirmed_by_name: DataTypes.STRING,
    confirmed_at: DataTypes.DATE
}, { tableName: 'order_payments', timestamps: false });

// Money a staff member collected (confirmed a payment) and later hands to the owner
const PaymentHandover = sequelize.define('PaymentHandover', {
    order_id: { type: DataTypes.STRING, allowNull: false, unique: true },
    staff_id: { type: DataTypes.INTEGER, allowNull: false },
    staff_name: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    confirmed_at: DataTypes.DATE,
    received_at: DataTypes.DATE      // empty until the owner confirms receiving the money
}, { tableName: 'payment_handovers', timestamps: false });

// Payments staff confirmed before this feature existed also appear in their account
async function backfillHandovers() {
    const payments = await OrderPayment.findAll({ raw: true });
    const have = new Set((await PaymentHandover.findAll({ raw: true })).map(h => h.order_id));
    const todo = payments.filter(p => p.confirmed_by_id != null && !have.has(p.order_id));
    if (!todo.length) return;
    const totals = {};
    (await Order.findAll({ where: { order_id: todo.map(p => p.order_id) }, attributes: ['order_id', 'total'], raw: true })).forEach(o => { totals[o.order_id] = o.total; });
    await PaymentHandover.bulkCreate(todo.map(p => ({
        order_id: p.order_id, staff_id: p.confirmed_by_id, staff_name: p.confirmed_by_name,
        amount: Number(totals[p.order_id]) || 0, confirmed_at: p.confirmed_at, received_at: null
    })));
}

const escapeHtml = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_VERSION = 13;   // the dashboard warns if the running server is older than this

// Secrets / config come from the .env file (never hard-code them)
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// Never send the password hash / reset token back to the browser
const safeUser = (user) => {
    if (!user) return null;
    const data = user.toJSON ? user.toJSON() : { ...user };
    delete data.password_hash;
    delete data.reset_token;
    delete data.reset_token_expires;
    return data;
};

// ==========================================
// MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Block private project files from being downloaded through the static folder
app.use((req, res, next) => {
    const blocked = /^\/(server\.js|database\.js|package(-lock)?\.json|node_modules(\/.*)?|\.env.*|.*\.(sqlite|sqlite3|db))$/i;
    if (blocked.test(req.path)) return res.status(404).end();
    next();
});
app.use(express.static(__dirname, { dotfiles: 'ignore' }));

// Ensure uploads directory exists for images
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// Session Setup for Logins
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

// If a customer's account was removed, sign them out on their next request
app.use(async (req, res, next) => {
    if (req.session && req.session.customer_id) {
        try {
            const exists = await User.count({ where: { id: req.session.customer_id } });
            const removed = exists ? await CustomerStatus.count({ where: { user_id: req.session.customer_id } }) : 0;
            if (!exists || removed) req.session.customer_id = null;
        } catch (e) {}
    }
    next();
});

// ==========================================
// MAILER SETUP (Order Confirmations & Password Reset)
// ==========================================
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    }
});

// Verify Gmail SMTP connection as soon as server starts
transporter.verify((error) => {
    if (error) {
        console.error("❌ GMAIL SMTP ERROR:", error.message);
    } else {
        console.log("✅ Gmail SMTP Server is connected and ready to send emails!");
    }
});

// ==========================================
// IMAGE UPLOAD SETUP (Multer)
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 10 },
    fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype))
});
// Up to 10 photos per product, with clear messages if something is wrong
const uploadImages = (req, res, next) => {
    upload.array('images', 10)(req, res, (err) => {
        if (err) {
            const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Each photo must be under 5 MB.'
                : (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') ? 'You can add up to 10 photos.'
                : 'Photo upload failed.';
            return res.status(400).json({ success: false, message: msg });
        }
        next();
    });
};


// ==========================================
// 1. AUTHENTICATION & USER PROFILE
// ==========================================

app.get('/api/version', (req, res) => res.json({ success: true, version: SERVER_VERSION }));

app.post('/api/auth/register', async (req, res) => {
    try {
        let { name, email, phone, password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
        }

        email = email ? email.toLowerCase().trim() : null;
        phone = phone ? phone.trim() : null;

        if (!email && !phone) {
            return res.status(400).json({ success: false, message: "Please provide an email or phone number." });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, phone, password_hash });

        req.session.customer_id = user.id;

        req.session.save((err) => {
            if (err) return res.status(500).json({ success: false, message: "Session error." });
            res.json({ success: true, message: "Account created successfully.", user: safeUser(user) });
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(400).json({ success: false, message: "Email or phone already exists." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, phone, identifier, password } = req.body;
        const loginVal = (email || phone || identifier || "").toLowerCase().trim();

        if (!loginVal || !password) {
            return res.status(400).json({ success: false, message: "Please enter your login details and password." });
        }

        const user = await User.findOne({
            where: { [Op.or]: [{ email: loginVal }, { phone: loginVal }] }
        });

        if (user && await bcrypt.compare(password, user.password_hash)) {
            // A removed customer who logs in again becomes Active automatically
            await CustomerStatus.destroy({ where: { user_id: user.id } });
            req.session.customer_id = user.id;

            req.session.save((err) => {
                if (err) return res.status(500).json({ success: false, message: "Session error." });
                res.json({ success: true, message: "Login successful", user: safeUser(user) });
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid login details." });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

app.get('/api/auth/me', async (req, res) => {
    try {
        if (!req.session.customer_id) {
            return res.status(401).json({ success: false, authenticated: false });
        }
        const user = await User.findByPk(req.session.customer_id, {
            attributes: { exclude: ['password_hash', 'reset_token', 'reset_token_expires'] }
        });
        if (!user) {
            return res.status(401).json({ success: false, authenticated: false });
        }
        res.json({ success: true, authenticated: true, user });
    } catch (error) {
        res.status(500).json({ success: false, authenticated: false });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Logged out successfully." });
    });
});


// ==========================================
// FORGOT & RESET PASSWORD ROUTES (OTP SYSTEM)
// ==========================================

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const rawInput = req.body.email || req.body.contact || req.body.identifier;
        if (!rawInput) {
            return res.status(400).json({ success: false, message: "Please provide your registered email address." });
        }

        const targetEmail = rawInput.toLowerCase().trim();
        const user = await User.findOne({
            where: { [Op.or]: [{ email: targetEmail }, { phone: targetEmail }] }
        });

        if (!user || !user.email) {
            return res.status(404).json({ success: false, message: "No account found with this email address." });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.reset_token = otp;
        user.reset_token_expires = tokenExpiry;
        await user.save();

        const mailOptions = {
            from: `"The Friends Heritage" <${GMAIL_USER}>`,
            to: user.email,
            subject: 'Your Password Reset OTP | The Friends Heritage',
            text: `Hello ${user.name},\n\nYour 6-digit OTP to reset your password is: ${otp}\n\nValid for 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e0d8; border-radius: 10px; background-color: #fdfbf7; text-align: center;">
                    <h2 style="color: #8b0000; margin-top: 0;">The Friends Heritage</h2>
                    <p style="color: #333; font-size: 15px;">Hello <strong>${user.name}</strong>,</p>
                    <p style="color: #555; font-size: 14px;">Use the 6-digit OTP below to reset your account password:</p>
                    <div style="margin: 24px auto; padding: 14px 24px; background: #f4eee1; border: 2px dashed #8b0000; border-radius: 8px; display: inline-block;">
                        <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #8b0000;">${otp}</span>
                    </div>
                    <p style="color: #777; font-size: 12px;">This code will expire in <strong>10 minutes</strong>.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: `A 6-digit OTP has been sent to ${user.email}.` });
    } catch (error) {
        console.error("❌ Forgot Password OTP Error:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP email: " + error.message });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Please enter your email and the OTP." });
        }

        const user = await User.findOne({
            where: {
                email: email.toLowerCase().trim(),
                reset_token: String(otp).trim(),
                reset_token_expires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP. Please try again." });
        }

        res.json({ success: true, message: "OTP verified! Please enter your new password." });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ success: false, message: "Server error verifying OTP." });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, otp, token, password, new_password, newPassword } = req.body;
        const targetOtp = String(otp || token || "").trim();
        const targetPassword = password || new_password || newPassword;

        if (!targetOtp || !targetPassword || targetPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Please provide a valid OTP and a password of at least 6 characters." });
        }

        const whereClause = {
            reset_token: targetOtp,
            reset_token_expires: { [Op.gt]: new Date() }
        };
        if (email) {
            whereClause.email = email.toLowerCase().trim();
        }

        const user = await User.findOne({ where: whereClause });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP. Please request a new one." });
        }

        user.password_hash = await bcrypt.hash(targetPassword, 10);
        user.reset_token = null;
        user.reset_token_expires = null;
        await user.save();

        res.json({ success: true, message: "Password reset successfully! Please log in with your new password." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


// ==========================================
// 2. PRODUCTS DICTIONARY
// ==========================================

app.get('/api/home-products', async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { homepage_only: true },
            include: [{ model: ProductVariant, as: 'variants' }]
        });
        res.json({ success: true, products: await attachImages(products) });
    } catch (error) {
        console.error("Home Products Error:", error);
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: ProductVariant, as: 'variants' }]
        });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        const [full] = await attachImages([product]);
        res.json({ success: true, product: full });
    } catch (error) {
        console.error("Product Error:", error);
        res.status(500).json({ success: false, message: "Error fetching product" });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { homepage_only: false },
            include: [{ model: ProductVariant, as: 'variants' }]
        });
        res.json({ success: true, products: await attachImages(products) });
    } catch (error) {
        console.error("Products Error:", error);
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
});


// ==========================================
// 3. CART MANAGEMENT
// ==========================================

const getCart = async (req) => {
    let cartToken = req.headers['x-cart-token'] || crypto.randomUUID();
    let cart = null;

    if (req.session.customer_id) {
        cart = await Cart.findOne({ where: { user_id: req.session.customer_id } });
    }
    if (!cart) {
        cart = await Cart.findOne({ where: { cart_token: cartToken } });
    }
    if (!cart) {
        cart = await Cart.create({
            cart_token: cartToken,
            user_id: req.session.customer_id || null
        });
    }
    return { cart, cartToken };
};

const fetchCartWithDetails = async (req) => {
    const { cart, cartToken } = await getCart(req);
    const items = await CartItem.findAll({
        where: { cart_id: cart.id },
        include: [Product, ProductVariant]
    });

    let subtotal = 0;
    const formattedItems = items.map(item => {
        const prod = item.product || {};
        const variant = item.product_variant || {};

        const price = variant.sale_price !== undefined && variant.sale_price > 0 ? variant.sale_price : prod.sale_price;
        const originalPrice = variant.original_price !== undefined && variant.original_price > 0 ? variant.original_price : prod.original_price;
        const itemName = variant.name ? variant.name : null;

        subtotal += price * item.quantity;

        return {
            id: item.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            name: prod.name,
            product_name: prod.name,
            variant: itemName,
            price: price,
            original_price: originalPrice,
            quantity: item.quantity,
            image: prod.image
        };
    });

    return {
        id: cart.id,
        cart_token: cartToken,
        items: formattedItems,
        subtotal: subtotal,
        total: subtotal
    };
};

app.get('/api/cart/count', async (req, res) => {
    try {
        const { cart } = await getCart(req);
        const items = await CartItem.findAll({ where: { cart_id: cart.id } });
        const count = items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
        res.json({ success: true, count });
    } catch (error) {
        console.error("Cart Count Error:", error);
        res.status(500).json({ success: false, count: 0 });
    }
});

app.get('/api/cart', async (req, res) => {
    try {
        const cartData = await fetchCartWithDetails(req);
        res.json({ success: true, cart_token: cartData.cart_token, cart: cartData, items: cartData.items });
    } catch (error) {
        console.error("Fetch Cart Error:", error);
        res.status(500).json({ success: false, error: "Unable to load cart." });
    }
});

app.post(['/api/cart', '/api/cart/items'], async (req, res) => {
    try {
        const { product_id, variant_id, quantity } = req.body;
        const { cart } = await getCart(req);

        let item = await CartItem.findOne({
            where: { cart_id: cart.id, product_id: product_id, variant_id: variant_id || null }
        });

        if (item) {
            item.quantity += (quantity || 1);
            await item.save();
        } else {
            await CartItem.create({
                cart_id: cart.id,
                product_id,
                variant_id: variant_id || null,
                quantity: quantity || 1
            });
        }
        res.json({ success: true, message: "Item added to cart." });
    } catch (error) {
        console.error("Add To Cart Error:", error);
        res.status(500).json({ success: false, message: "Error adding to cart." });
    }
});

app.put('/api/cart/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity <= 0) {
            return res.status(400).json({ success: false, error: "Invalid quantity." });
        }

        const cartItem = await CartItem.findByPk(itemId);
        if (!cartItem) {
            return res.status(404).json({ success: false, error: "Cart item not found." });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        const cartData = await fetchCartWithDetails(req);
        res.json({ success: true, message: "Quantity updated.", cart: cartData });
    } catch (error) {
        console.error("Update Quantity Error:", error);
        res.status(500).json({ success: false, error: "Unable to update quantity." });
    }
});

app.delete('/api/cart/remove', async (req, res) => {
    try {
        const { item_id } = req.body;
        await CartItem.destroy({ where: { id: item_id } });
        res.json({ success: true, message: "Item removed." });
    } catch (error) {
        console.error("Remove Item Error:", error);
        res.status(500).json({ success: false, error: "Error removing item." });
    }
});

app.delete('/api/cart/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const deleted = await CartItem.destroy({ where: { id: itemId } });
        if (!deleted) {
            return res.status(404).json({ success: false, error: "Cart item not found." });
        }

        const cartData = await fetchCartWithDetails(req);
        res.json({ success: true, message: "Item removed.", cart: cartData });
    } catch (error) {
        console.error("Remove Item Error:", error);
        res.status(500).json({ success: false, error: "Unable to remove item." });
    }
});

app.delete('/api/cart', async (req, res) => {
    try {
        const { cart } = await getCart(req);
        await CartItem.destroy({ where: { cart_id: cart.id } });
        res.json({ success: true, message: "Cart cleared." });
    } catch (error) {
        console.error("Clear Cart Error:", error);
        res.status(500).json({ success: false, error: "Error clearing cart." });
    }
});


// ==========================================
// 4. CHECKOUT & ORDERS
// ==========================================

app.post('/api/orders', async (req, res) => {
    try {
        if (!req.session.customer_id) {
            return res.status(401).json({ success: false, message: "Please login to place an order." });
        }

        const user = await User.findByPk(req.session.customer_id);
        const { address, city, state, pincode, phone, payment_method, payment_reference } = req.body;

        const { cart } = await getCart(req);
        const items = await CartItem.findAll({
            where: { cart_id: cart.id },
            include: [Product, ProductVariant]
        });

        if (!items.length) {
            return res.status(400).json({ success: false, message: "Your cart is empty." });
        }

        let subtotal = 0;
        let itemsListHtml = '';
        let itemsListText = '';

        items.forEach(i => {
            const productName = i.product ? i.product.name : 'Product';
            const variantName = i.product_variant ? ` (${i.product_variant.name})` : '';
            const price = i.product_variant ? i.product_variant.sale_price : i.product.sale_price;
            const lineTotal = price * i.quantity;
            subtotal += lineTotal;

            itemsListText += `- ${productName}${variantName}: ₹${price} x ${i.quantity} = ₹${lineTotal}\n`;
            itemsListHtml += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${productName}${variantName}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${price}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${lineTotal}</td>
                </tr>
            `;
        });

        const orderId = 'TFH-' + Date.now().toString().slice(-6);
        const customerPhone = user.phone || phone || 'N/A';

        const order = await Order.create({
            order_id: orderId,
            customer_name: user.name,
            customer_phone: customerPhone,
            customer_email: user.email,
            address,
            city,
            state,
            pincode,
            subtotal: subtotal,
            total: subtotal,
            payment_method: payment_method || 'Cash on Delivery',
            payment_reference: payment_reference || null
        });

        await OrderItem.bulkCreate(items.map(i => ({
            order_id: orderId,
            product_id: i.product_id,
            name: i.product ? i.product.name : 'Product',
            variant: i.product_variant ? i.product_variant.name : null,
            price: i.product_variant ? i.product_variant.sale_price : (i.product ? i.product.sale_price : 0),
            quantity: i.quantity,
            image: i.product ? i.product.image : null
        })));

        await CartItem.destroy({ where: { cart_id: cart.id } });
        try {
            await user.update({ address, city, state, pincode, phone: user.phone || phone || null });
        } catch (profileError) {
            // The phone number may already belong to another account: the order is still placed, only the address is saved
            await user.update({ address, city, state, pincode });
        }

        const mailOptions = {
            from: `"The Friends Heritage" <${GMAIL_USER}>`,
            to: user.email || GMAIL_USER,
            bcc: GMAIL_USER,
            subject: `Order Confirmed #${order.order_id} | The Friends Heritage`,
            text: `Hello ${user.name},\n\nThank you for shopping with The Friends Heritage!\n\nOrder ID: ${order.order_id}\n\nItems Ordered:\n${itemsListText}\nTotal: ₹${order.total}\nPayment Method: ${order.payment_method}\n\nDelivery Address:\n${address}, ${city}, ${state} - ${pincode}\nPhone: ${customerPhone}\n\nWarm Regards,\nThe Friends Heritage Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e0d8; border-radius: 8px; background-color: #fdfbf7;">
                    <h2 style="color: #8b0000; margin-top: 0;">Order Confirmation</h2>
                    <p style="color: #333;">Hello <strong>${user.name}</strong>, thank you for your order with <strong>The Friends Heritage</strong>!</p>
                    <p style="background: #f4eee1; padding: 10px 14px; border-radius: 6px; font-size: 14px;">
                        <strong>Order ID:</strong> #${order.order_id}<br>
                        <strong>Payment Method:</strong> ${order.payment_method}
                    </p>
                    <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px;">
                        <thead>
                            <tr style="background: #8b0000; color: #fff;">
                                <th style="padding: 8px; text-align: left;">Item</th>
                                <th style="padding: 8px; text-align: right;">Rate</th>
                                <th style="padding: 8px; text-align: center;">Qty</th>
                                <th style="padding: 8px; text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsListHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="padding: 10px 8px; text-align: right; font-weight: bold;">Total:</td>
                                <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #8b0000; font-size: 16px;">₹${order.total}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <div style="font-size: 13px; color: #555; line-height: 1.5; margin-top: 16px;">
                        <strong>Shipping Address:</strong><br>
                        ${user.name}<br>
                        ${address}, ${city}, ${state} - ${pincode}<br>
                        Phone: ${customerPhone}
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.error("❌ Order Email Error:", error.message);
            else console.log("✅ Order Confirmation Email Sent:", info.messageId);
        });

        res.json({ success: true, message: "Order placed successfully.", order });
    } catch (error) {
        console.error("Order Error:", error);
        res.status(500).json({ success: false, message: "Failed to process order." });
    }
});


// ==========================================
// 5. ADMIN DASHBOARD API ROUTES
// ==========================================
// Admin signs in with a password only (ADMIN_PASSWORD in .env).
// This is separate from normal customer logins, so a customer can stay
// signed in on the shop while the admin panel is open in the same browser.
const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000;   // admin stays signed in for 8 hours
const MAX_ADMIN_ATTEMPTS = 5;                  // wrong passwords allowed...
const ADMIN_LOCK_MS = 15 * 60 * 1000;          // ...per 15 minutes, per IP address
const adminAttempts = new Map();

async function sendOrderStatusEmail(order, status, rawNote) {
    const note = String(rawNote || '').trim();
    try {
        await transporter.sendMail({
            from: `"The Friends Heritage" <${GMAIL_USER}>`,
            to: order.customer_email,
            subject: `Your order #${order.order_id} is ${status} | The Friends Heritage`,
            text: `Hello ${order.customer_name},\n\nYour order #${order.order_id} is now: ${status}.\n${note ? '\n' + note + '\n' : ''}\nThank you for shopping with The Friends Heritage.`,
            html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e0d8;border-radius:8px;background:#fdfbf7">
                <h2 style="color:#8b0000;margin-top:0">Order update</h2>
                <p>Hello <strong>${escapeHtml(order.customer_name)}</strong>,</p>
                <p>Your order <strong>#${escapeHtml(order.order_id)}</strong> is now <strong style="color:#8b0000">${escapeHtml(status)}</strong>.</p>
                ${note ? `<p style="background:#f4eee1;padding:10px 14px;border-radius:6px">${escapeHtml(note).replace(/\n/g, '<br>')}</p>` : ''}
                <p style="color:#555;font-size:13px">Thank you for shopping with The Friends Heritage.</p></div>`
        });
        return true;
    } catch (mailErr) {
        console.error("Status Email Error:", mailErr.message);
        return false;
    }
}

const safeEqual = (a, b) => {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
};

const isAdmin = (req, res, next) => {
    const since = req.session && req.session.admin_at;
    if (!req.session.is_admin || !since || Date.now() - since > ADMIN_SESSION_MS) {
        if (req.session) { req.session.is_admin = false; req.session.admin_at = null; }
        return res.status(401).json({ success: false, message: "Admin sign-in required." });
    }
    next();
};

// Owner or an Active staff member (used for the shop's products)
const isOps = (req, res, next) => {
    const since = req.session && req.session.admin_at;
    if (req.session.is_admin && since && Date.now() - since <= ADMIN_SESSION_MS) return next();
    return isStaff(req, res, next);
};

app.post('/api/admin/login', (req, res) => {
    if (!ADMIN_PASSWORD) {
        return res.status(503).json({ success: false, message: "Admin password is not set. Add ADMIN_PASSWORD to the .env file and restart the server." });
    }

    const ip = req.ip || 'unknown';
    const now = Date.now();
    let record = adminAttempts.get(ip);
    if (record && now - record.first > ADMIN_LOCK_MS) {
        adminAttempts.delete(ip);
        record = null;
    }
    if (record && record.count >= MAX_ADMIN_ATTEMPTS) {
        const mins = Math.ceil((ADMIN_LOCK_MS - (now - record.first)) / 60000);
        return res.status(429).json({ success: false, message: `Too many wrong attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` });
    }

    const password = req.body && req.body.password;
    if (typeof password === 'string' && password.length && safeEqual(password, ADMIN_PASSWORD)) {
        adminAttempts.delete(ip);
        req.session.staff_id = null;
        req.session.staff_at = null;
        req.session.is_admin = true;
        req.session.admin_at = now;
        return req.session.save((err) => {
            if (err) return res.status(500).json({ success: false, message: "Session error." });
            res.json({ success: true, message: "Welcome back." });
        });
    }

    if (!record) record = { count: 0, first: now };
    record.count += 1;
    adminAttempts.set(ip, record);
    const left = MAX_ADMIN_ATTEMPTS - record.count;
    res.status(401).json({
        success: false,
        message: left > 0 ? `Incorrect password. ${left} attempt${left === 1 ? '' : 's'} left.` : "Too many wrong attempts. Try again in 15 minutes."
    });
});

app.post('/api/admin/logout', (req, res) => {
    req.session.is_admin = false;
    req.session.admin_at = null;
    req.session.save(() => res.json({ success: true, message: "Signed out." }));
});

app.get('/api/admin/me', isAdmin, (req, res) => {
    res.json({ success: true, admin: true });
});

app.get('/api/admin/dashboard', isAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.count();
        const totalProducts = await Product.count();
        const usersCount = await User.count();
        const orders = await Order.findAll({ order: [['created_at', 'DESC']] });

        let totalRevenue = 0;
        orders.forEach(o => totalRevenue += o.total);

        const byOrder = {};
        (await OrderItem.findAll({ raw: true })).forEach(it => { (byOrder[it.order_id] = byOrder[it.order_id] || []).push(it); });

        const handledBy = {};
        (await OrderAssignment.findAll({ raw: true })).forEach(a => { handledBy[a.order_id] = a.staff_name; });
        const paidMap = {};
        (await OrderPayment.findAll({ raw: true })).forEach(p => { paidMap[p.order_id] = p; });

        res.json({
            success: true,
            stats: { totalOrders, totalProducts, usersCount, totalRevenue },
            orders: orders.map(o => ({ ...o.toJSON(), items: byOrder[o.order_id] || [], handled_by: handledBy[o.order_id] || null, payment_confirmed: !!paidMap[o.order_id], payment_confirmed_by: paidMap[o.order_id] ? paidMap[o.order_id].confirmed_by_name : null }))
        });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Failed to load dashboard data." });
    }
});

// Sizes are stored as product variants (same price as the product)
const VARIANT_FK = (Product.associations && Product.associations.variants && Product.associations.variants.foreignKey) || 'product_id';
async function syncSizes(product, rawSizes) {
    if (rawSizes === undefined) return;
    let sizes;
    try { sizes = JSON.parse(rawSizes); } catch (e) { return; }
    if (!Array.isArray(sizes)) return;

    // Each size: { name, sale_price, original_price }
    const want = [];
    sizes.forEach(item => {
        const obj = typeof item === 'string' ? { name: item } : (item || {});
        const name = String(obj.name || '').trim().slice(0, 40);
        if (!name || want.some(w => w.name.toLowerCase() === name.toLowerCase())) return;
        const sale = parseFloat(obj.sale_price);
        const salePrice = isNaN(sale) ? product.sale_price : sale;
        const orig = parseFloat(obj.original_price);
        want.push({ name, sale_price: salePrice, original_price: (isNaN(orig) || !orig) ? salePrice : orig });
    });

    const existing = await ProductVariant.findAll({ where: { [VARIANT_FK]: product.id } });
    for (const v of existing) {
        const w = want.find(x => x.name.toLowerCase() === String(v.name).toLowerCase());
        if (!w) {
            try { await CartItem.destroy({ where: { variant_id: v.id } }); } catch (e) {}
            await v.destroy();
        } else {
            await v.update({ original_price: w.original_price, sale_price: w.sale_price });
        }
    }
    for (const w of want) {
        if (!existing.some(v => String(v.name).toLowerCase() === w.name.toLowerCase())) {
            await ProductVariant.create({ [VARIANT_FK]: product.id, name: w.name, original_price: w.original_price, sale_price: w.sale_price });
        }
    }
}

app.post('/api/admin/products', isOps, uploadImages, async (req, res) => {
    try {
        const { name, category, description, original_price, sale_price, badge, homepage_only, image_url } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ success: false, message: "Product name is required." });
        }
        const op = parseFloat(original_price) || 0, sp = parseFloat(sale_price) || 0;
        if (op && sp && sp > op) {
            return res.status(400).json({ success: false, message: "The sale price cannot be higher than the original price." });
        }
        const imgs = buildImageList(req);
        const imagePath = imgs.list[0] || '/logo.png';

        const product = await Product.create({
            name,
            category,
            description,
            image: imagePath,
            original_price: parseFloat(original_price) || 0,
            sale_price: parseFloat(sale_price) || 0,
            badge: badge || null,
            homepage_only: homepage_only === 'true' || homepage_only === true
        });

        await setProductImages(product, imgs.list);
        await syncSizes(product, req.body.sizes);
        res.json({ success: true, message: "Product created successfully!", product });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ success: false, message: "Failed to create product." });
    }
});

app.put('/api/admin/orders/:orderId', isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || typeof status !== 'string') {
            return res.status(400).json({ success: false, message: "Please choose a status." });
        }
        const order = await Order.findOne({ where: { order_id: req.params.orderId } });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        if (order.status === 'Delivered') {
            return res.status(403).json({ success: false, message: "This order is Delivered and locked. Its status can no longer be changed." });
        }

        order.status = status;
        await order.save();

        const wantsEmail = req.body.notify === true || req.body.notify === 'true';
        const emailed = wantsEmail && order.customer_email ? await sendOrderStatusEmail(order, status, req.body.note) : false;

        res.json({ success: true, message: "Order updated successfully.", order, emailed });
    } catch (error) {
        console.error("Update Order Error:", error);
        res.status(500).json({ success: false, message: "Failed to update order." });
    }
});


// Orders are never deleted: the owner keeps every order.

app.get('/api/admin/products', isOps, async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: ProductVariant, as: 'variants' }],
            order: [['id', 'DESC']]
        });
        res.json({ success: true, products: await attachImages(products) });
    } catch (error) {
        console.error("Admin Products Error:", error);
        res.status(500).json({ success: false, message: "Failed to load products: " + error.message });
    }
});

app.put('/api/admin/products/:id', isOps, uploadImages, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        const { name, category, description, original_price, sale_price, badge, homepage_only, image_url } = req.body;
        if (name !== undefined && !String(name).trim()) {
            return res.status(400).json({ success: false, message: "Product name is required." });
        }

        const updates = {
            name: name !== undefined ? name : product.name,
            category: category !== undefined ? category : product.category,
            description: description !== undefined ? description : product.description,
            original_price: original_price !== undefined ? (parseFloat(original_price) || 0) : product.original_price,
            sale_price: sale_price !== undefined ? (parseFloat(sale_price) || 0) : product.sale_price,
            badge: badge !== undefined ? (badge || null) : product.badge,
            homepage_only: homepage_only !== undefined ? (homepage_only === 'true' || homepage_only === true) : product.homepage_only
        };
        if (updates.original_price && updates.sale_price && updates.sale_price > updates.original_price) {
            return res.status(400).json({ success: false, message: "The sale price cannot be higher than the original price." });
        }

        await product.update(updates);
        const imgs = buildImageList(req);
        if (imgs.provided) await setProductImages(product, imgs.list);
        await syncSizes(product, req.body.sizes);
        res.json({ success: true, message: "Product updated.", product });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ success: false, message: "Failed to update product." });
    }
});

app.delete('/api/admin/products/:id', isOps, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Clear things that point at this product first (ignore if a table/column differs)
        try { await CartItem.destroy({ where: { product_id: product.id } }); } catch (e) {}
        try { await ProductVariant.destroy({ where: { product_id: product.id } }); } catch (e) {}
        try { await ProductImage.destroy({ where: { product_id: product.id } }); } catch (e) {}

        await product.destroy();
        res.json({ success: true, message: "Product deleted." });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete product." });
    }
});

app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash', 'reset_token', 'reset_token_expires'] },
            order: [['id', 'DESC']]
        });
        const removedIds = new Set((await CustomerStatus.findAll({ raw: true })).map(r => Number(r.user_id)));
        const deleted_users = await DeletedCustomer.findAll({ order: [['id', 'DESC']], raw: true });
        res.json({ success: true, users: users.map(u => ({ ...u.toJSON(), removed: removedIds.has(Number(u.id)) })), deleted_users });
    } catch (error) {
        console.error("Admin Users Error:", error);
        res.status(500).json({ success: false, message: "Failed to load customers." });
    }
});


// Remove = sign the customer out and block login, but keep them in the dashboard
app.post('/api/admin/users/:id/remove', isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "Customer not found." });
        await CustomerStatus.findOrCreate({ where: { user_id: user.id }, defaults: { removed_at: new Date() } });
        res.json({ success: true, message: "Customer removed and signed out." });
    } catch (error) {
        console.error("Remove Customer Error:", error);
        res.status(500).json({ success: false, message: "Failed to remove customer." });
    }
});

app.post('/api/admin/users/:id/restore', isAdmin, async (req, res) => {
    try {
        await CustomerStatus.destroy({ where: { user_id: req.params.id } });
        res.json({ success: true, message: "Customer restored." });
    } catch (error) {
        console.error("Restore Customer Error:", error);
        res.status(500).json({ success: false, message: "Failed to restore customer." });
    }
});

// Delete = close the website account, but keep their details and orders in the dashboard (Deleted section)
app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "Customer not found." });

        const customerName = user.name;
        const customerEmail = user.email;

        const j = user.toJSON();
        const removeEverything = async (t) => {
            const opt = t ? { transaction: t } : {};
            await DeletedCustomer.create({
                original_id: user.id, name: j.name, email: j.email, phone: j.phone,
                address: j.address, city: j.city, state: j.state, pincode: j.pincode,
                joined_at: j.created_at || j.createdAt || null, deleted_at: new Date()
            }, opt);
            const carts = await Cart.findAll({ where: { user_id: user.id }, ...opt });
            for (const c of carts) {
                await CartItem.destroy({ where: { cart_id: c.id }, ...opt });
                await c.destroy(opt);
            }
            await CustomerStatus.destroy({ where: { user_id: user.id }, ...opt });
            await user.destroy(opt);
        };

        try {
            // all-or-nothing: if any step fails, nothing is deleted
            await sequelize.transaction((t) => removeEverything(t));
        } catch (err) {
            // Another table in the database still points at this customer: retry without that link check
            const blocked = err && (err.name === 'SequelizeForeignKeyConstraintError' || /FOREIGN KEY/i.test(err.message || ''));
            if (!blocked || sequelize.getDialect() !== 'sqlite') throw err;
            console.warn("Customer delete was blocked by a database link, retrying:", err.message);
            await sequelize.query('PRAGMA foreign_keys = OFF');
            try {
                await removeEverything(null);
            } catch (err2) {
                await DeletedCustomer.destroy({ where: { original_id: user.id } });
                throw err2;
            } finally {
                await sequelize.query('PRAGMA foreign_keys = ON');
            }
        }

        // Answer straight away; the email is sent in the background so the dashboard never waits for it
        let emailed = false;
        const wantsEmailEarly = req.body && (req.body.notify === true || req.body.notify === 'true');
        res.json({ success: true, message: "Customer account deleted.", emailing: !!(wantsEmailEarly && customerEmail) });
        const wantsEmail = req.body && (req.body.notify === true || req.body.notify === 'true');
        if (wantsEmail && customerEmail) {
            const note = String((req.body && req.body.note) || '').trim();
            try {
                await transporter.sendMail({
                    from: `"The Friends Heritage" <${GMAIL_USER}>`,
                    to: customerEmail,
                    subject: 'Your account has been deleted | The Friends Heritage',
                    text: `Hello ${customerName},\n\nYour account with The Friends Heritage has been deleted by the store. You can no longer log in with it.\n${note ? '\n' + note + '\n' : ''}\nIf you think this was a mistake, please contact us at ${GMAIL_USER}.\n\nThe Friends Heritage Team`,
                    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e0d8;border-radius:8px;background:#fdfbf7">
                        <h2 style="color:#8b0000;margin-top:0">Your account has been deleted</h2>
                        <p>Hello <strong>${escapeHtml(customerName)}</strong>,</p>
                        <p>Your account with <strong>The Friends Heritage</strong> has been deleted by the store. You can no longer log in with it.</p>
                        ${note ? `<p style="background:#f4eee1;padding:10px 14px;border-radius:6px">${escapeHtml(note).replace(/\n/g, '<br>')}</p>` : ''}
                        <p style="color:#555;font-size:13px">If you think this was a mistake, please contact us at ${escapeHtml(GMAIL_USER)}.</p></div>`
                });
                emailed = true;
            } catch (mailErr) {
                console.error("Delete Customer Email Error:", mailErr.message);
            }
        }

    } catch (error) {
        console.error("Delete Customer Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete customer: " + error.message });
    }
});


// Erase = permanently remove a deleted customer's saved details and their orders
app.delete('/api/admin/deleted-users/:id', isAdmin, async (req, res) => {
    try {
        const rec = await DeletedCustomer.findByPk(req.params.id);
        if (!rec) return res.status(404).json({ success: false, message: "Record not found." });
        await rec.destroy();   // only the saved customer record goes; their orders always stay
        res.json({ success: true, message: "Erased.", ordersKept: true });
    } catch (error) {
        console.error("Erase Deleted Customer Error:", error);
        res.status(500).json({ success: false, message: "Failed to erase: " + error.message });
    }
});

// ==========================================
// STAFF: accounts are created by the owner and work only while Active
// ==========================================
const STAFF_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
const staffPublic = (st) => ({ id: st.id, name: st.name, username: st.username, active: !!st.active, last_login_at: st.last_login_at, created_at: st.created_at });

const isStaff = async (req, res, next) => {
    try {
        const since = req.session.staff_at;
        if (!req.session.staff_id || !since || Date.now() - since > ADMIN_SESSION_MS) {
            req.session.staff_id = null;
            req.session.staff_at = null;
            return res.status(401).json({ success: false, message: "Staff sign-in required." });
        }
        const staff = await StaffAccount.findByPk(req.session.staff_id);
        if (!staff || !staff.active) {
            req.session.staff_id = null;
            req.session.staff_at = null;
            return res.status(401).json({ success: false, message: "Your staff account is not active. Please contact the owner." });
        }
        req.staff = staff;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

app.post('/api/staff/login', async (req, res) => {
    try {
        const username = String(req.body.username || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Enter your username and password." });
        }

        const key = 'staff|' + (req.ip || 'unknown') + '|' + username;
        const now = Date.now();
        let record = adminAttempts.get(key);
        if (record && now - record.first > ADMIN_LOCK_MS) { adminAttempts.delete(key); record = null; }
        if (record && record.count >= MAX_ADMIN_ATTEMPTS) {
            const mins = Math.ceil((ADMIN_LOCK_MS - (now - record.first)) / 60000);
            return res.status(429).json({ success: false, message: `Too many wrong attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` });
        }

        const staff = await StaffAccount.findOne({ where: { username } });
        if (!staff || !(await bcrypt.compare(password, staff.password_hash))) {
            if (!record) record = { count: 0, first: now };
            record.count += 1;
            adminAttempts.set(key, record);
            return res.status(401).json({ success: false, message: "Incorrect username or password." });
        }
        if (!staff.active) {
            return res.status(403).json({ success: false, message: "Your account is not active. Please ask the owner to activate it." });
        }

        adminAttempts.delete(key);
        await staff.update({ last_login_at: new Date() });
        req.session.is_admin = false;
        req.session.admin_at = null;
        req.session.staff_id = staff.id;
        req.session.staff_at = now;
        req.session.save((err) => {
            if (err) return res.status(500).json({ success: false, message: "Session error." });
            res.json({ success: true, staff: staffPublic(staff) });
        });
    } catch (error) {
        console.error("Staff Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

app.post('/api/staff/logout', (req, res) => {
    req.session.staff_id = null;
    req.session.staff_at = null;
    req.session.save(() => res.json({ success: true, message: "Signed out." }));
});

app.get('/api/staff/me', isStaff, (req, res) => {
    res.json({ success: true, staff: staffPublic(req.staff) });
});

// Orders a staff member may see: new ones nobody has taken yet, plus the ones they confirmed themselves
async function visibleOrdersFor(staffId) {
    const [orders, assignments] = await Promise.all([
        Order.findAll({ order: [['created_at', 'DESC']] }),
        OrderAssignment.findAll({ raw: true })
    ]);
    const takenBy = {};
    assignments.forEach(a => { takenBy[a.order_id] = Number(a.staff_id); });
    return orders
        .filter(o => takenBy[o.order_id] === undefined || takenBy[o.order_id] === Number(staffId))
        .map(o => ({ order: o, mine: takenBy[o.order_id] === Number(staffId) }));
}

// Staff only get what they need to pack and deliver: no item prices and no revenue figures.
// Once an order is Delivered, only the customer's name stays in the staff view (the owner keeps everything).
app.get('/api/staff/orders', isStaff, async (req, res) => {
    try {
        const visible = await visibleOrdersFor(req.staff.id);
        const byOrder = {};
        (await OrderItem.findAll({ raw: true })).forEach(it => {
            (byOrder[it.order_id] = byOrder[it.order_id] || []).push({ name: it.name, variant: it.variant, quantity: it.quantity, price: it.price });
        });
        const paid = {};
        (await OrderPayment.findAll({ raw: true })).forEach(p => { paid[p.order_id] = p; });
        res.json({
            success: true,
            orders: visible.map(({ order, mine }) => {
                const j = order.toJSON();
                const closed = j.status === 'Delivered';
                const keep = (value) => closed ? null : value;
                const pay = paid[j.order_id];
                return {
                    order_id: j.order_id,
                    customer_name: j.customer_name, customer_phone: keep(j.customer_phone), customer_email: keep(j.customer_email),
                    address: keep(j.address), city: keep(j.city), state: keep(j.state), pincode: keep(j.pincode),
                    details_removed: closed,
                    payment_method: j.payment_method, payment_reference: j.payment_reference, total: j.total, status: j.status,
                    created_at: j.created_at || j.createdAt, has_email: !closed && !!j.customer_email,
                    payment_confirmed: !!pay, payment_confirmed_by: pay ? pay.confirmed_by_name : null,
                    payment_by_me: !!pay && pay.confirmed_by_id != null && Number(pay.confirmed_by_id) === Number(req.staff.id),
                    mine, items: byOrder[j.order_id] || []
                };
            })
        });
    } catch (error) {
        console.error("Staff Orders Error:", error);
        res.status(500).json({ success: false, message: "Failed to load orders." });
    }
});

// The first staff member to confirm an order takes it; from then on only they (and the owner) see it
app.put('/api/staff/orders/:orderId', isStaff, async (req, res) => {
    try {
        const status = String(req.body.status || '');
        if (STAFF_STATUSES.indexOf(status) === -1) {
            return res.status(400).json({ success: false, message: "Choose Pending, Confirmed, Shipped or Delivered." });
        }
        const orderId = req.params.orderId;
        const order = await Order.findOne({ where: { order_id: orderId } });
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });

        const taken = await OrderAssignment.findOne({ where: { order_id: orderId } });
        if (taken && Number(taken.staff_id) !== Number(req.staff.id)) {
            return res.status(403).json({ success: false, message: `This order is being handled by ${taken.staff_name}.` });
        }
        if (order.status === 'Cancelled') {
            return res.status(403).json({ success: false, message: "Cancelled orders can only be changed by the owner." });
        }
        if (order.status === 'Delivered') {
            return res.status(403).json({ success: false, message: "This order is Delivered and locked. Its status can no longer be changed." });
        }
        if (!taken && status !== 'Pending') {
            const [row, created] = await OrderAssignment.findOrCreate({
                where: { order_id: orderId },
                defaults: { staff_id: req.staff.id, staff_name: req.staff.name, assigned_at: new Date() }
            });
            if (!created && Number(row.staff_id) !== Number(req.staff.id)) {
                return res.status(409).json({ success: false, message: `${row.staff_name} just confirmed this order.` });
            }
        }

        order.status = status;
        await order.save();
        const wantsEmail = req.body.notify === true || req.body.notify === 'true';
        const emailed = wantsEmail && order.customer_email ? await sendOrderStatusEmail(order, status, req.body.note) : false;
        res.json({ success: true, message: "Order updated.", emailed });
    } catch (error) {
        console.error("Staff Update Order Error:", error);
        res.status(500).json({ success: false, message: "Failed to update order." });
    }
});

// Payment confirmation by a staff member: the first staff member to act on an order takes it
app.put('/api/staff/orders/:orderId/payment', isStaff, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findOne({ where: { order_id: orderId } });
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        const me = Number(req.staff.id);

        const taken = await OrderAssignment.findOne({ where: { order_id: orderId } });
        if (taken && Number(taken.staff_id) !== me) {
            return res.status(403).json({ success: false, message: `This order is being handled by ${taken.staff_name}.` });
        }
        if (order.status === 'Cancelled') {
            return res.status(403).json({ success: false, message: "Cancelled orders can only be changed by the owner." });
        }

        const paid = req.body.paid === true || req.body.paid === 'true';
        if (paid) {
            if (!taken) {
                const [row, created] = await OrderAssignment.findOrCreate({
                    where: { order_id: orderId },
                    defaults: { staff_id: req.staff.id, staff_name: req.staff.name, assigned_at: new Date() }
                });
                if (!created && Number(row.staff_id) !== me) {
                    return res.status(409).json({ success: false, message: `${row.staff_name} just took this order.` });
                }
            }
            await OrderPayment.findOrCreate({
                where: { order_id: orderId },
                defaults: { confirmed_by_id: req.staff.id, confirmed_by_name: req.staff.name, confirmed_at: new Date() }
            });
            await PaymentHandover.findOrCreate({
                where: { order_id: orderId },
                defaults: { staff_id: req.staff.id, staff_name: req.staff.name, amount: order.total, confirmed_at: new Date(), received_at: null }
            });
        } else {
            const row = await OrderPayment.findOne({ where: { order_id: orderId } });
            if (row && Number(row.confirmed_by_id) !== me) {
                return res.status(403).json({ success: false, message: `Payment was confirmed by ${row.confirmed_by_name || 'the owner'}.` });
            }
            const handed = await PaymentHandover.findOne({ where: { order_id: orderId } });
            if (handed && handed.received_at) {
                return res.status(403).json({ success: false, message: "The owner has already received this payment, so it cannot be undone." });
            }
            await PaymentHandover.destroy({ where: { order_id: orderId } });
            await OrderPayment.destroy({ where: { order_id: orderId } });
        }
        res.json({ success: true, payment_confirmed: paid });
    } catch (error) {
        console.error("Staff Payment Error:", error);
        res.status(500).json({ success: false, message: "Failed to update payment." });
    }
});

// Staff: the payments I confirmed and whether the owner has received the money
app.get('/api/staff/payments', isStaff, async (req, res) => {
    try {
        const rows = await PaymentHandover.findAll({ where: { staff_id: req.staff.id }, order: [['confirmed_at', 'DESC']], raw: true });
        const names = {};
        if (rows.length) (await Order.findAll({ where: { order_id: rows.map(r => r.order_id) }, attributes: ['order_id', 'customer_name'], raw: true })).forEach(o => { names[o.order_id] = o.customer_name; });
        const list = rows.map(r => ({ order_id: r.order_id, customer_name: names[r.order_id] || '', amount: Number(r.amount) || 0, confirmed_at: r.confirmed_at, received_at: r.received_at }));
        const collected = list.reduce((t, r) => t + r.amount, 0);
        const received = list.filter(r => r.received_at).reduce((t, r) => t + r.amount, 0);
        res.json({ success: true, payments: list, collected, received, pending: collected - received });
    } catch (error) {
        console.error("Staff Payments Error:", error);
        res.status(500).json({ success: false, message: "Failed to load payments." });
    }
});

// Owner: every payment collected, grouped by who collected it, with "received" confirmation
app.get('/api/admin/payments', isAdmin, async (req, res) => {
    try {
        const handovers = await PaymentHandover.findAll({ order: [['confirmed_at', 'DESC']], raw: true });
        const ownerPays = await OrderPayment.findAll({ where: { confirmed_by_id: null }, raw: true });
        const ids = handovers.map(h => h.order_id).concat(ownerPays.map(p => p.order_id));
        const info = {};
        if (ids.length) (await Order.findAll({ where: { order_id: ids }, attributes: ['order_id', 'customer_name', 'total'], raw: true })).forEach(o => { info[o.order_id] = o; });

        const groups = {};
        handovers.forEach(h => {
            const g = groups[h.staff_id] = groups[h.staff_id] || { staff_id: h.staff_id, staff_name: h.staff_name, collected: 0, received: 0, pending: 0, rows: [] };
            const amount = Number(h.amount) || 0;
            g.collected += amount;
            if (h.received_at) g.received += amount; else g.pending += amount;
            g.rows.push({ order_id: h.order_id, customer_name: (info[h.order_id] || {}).customer_name || '', amount, confirmed_at: h.confirmed_at, received_at: h.received_at });
        });
        const ownerRows = ownerPays.map(p => ({ order_id: p.order_id, customer_name: (info[p.order_id] || {}).customer_name || '', amount: Number((info[p.order_id] || {}).total) || 0, confirmed_at: p.confirmed_at }));
        res.json({
            success: true,
            staff: Object.values(groups),
            owner: { collected: ownerRows.reduce((t, r) => t + r.amount, 0), rows: ownerRows }
        });
    } catch (error) {
        console.error("Admin Payments Error:", error);
        res.status(500).json({ success: false, message: "Failed to load payments." });
    }
});

// Owner confirms (or undoes) receiving the money for one payment
app.put('/api/admin/payments/:orderId/received', isAdmin, async (req, res) => {
    try {
        const row = await PaymentHandover.findOne({ where: { order_id: req.params.orderId } });
        if (!row) return res.status(404).json({ success: false, message: "Payment not found." });
        const received = req.body.received === true || req.body.received === 'true';
        await row.update({ received_at: received ? new Date() : null });
        res.json({ success: true, received });
    } catch (error) {
        console.error("Receive Payment Error:", error);
        res.status(500).json({ success: false, message: "Failed to update the payment." });
    }
});

// Owner confirms receiving everything a staff member is holding
app.put('/api/admin/payments/staff/:staffId/received', isAdmin, async (req, res) => {
    try {
        const [count] = await PaymentHandover.update({ received_at: new Date() }, { where: { staff_id: req.params.staffId, received_at: null } });
        res.json({ success: true, count });
    } catch (error) {
        console.error("Receive All Error:", error);
        res.status(500).json({ success: false, message: "Failed to update the payments." });
    }
});

// Owner emails the bill (invoice) to the customer
app.post('/api/admin/orders/:orderId/bill', isAdmin, async (req, res) => {
    try {
        const order = await Order.findOne({ where: { order_id: req.params.orderId } });
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        if (!order.customer_email) return res.status(400).json({ success: false, message: "This customer has no email address on file." });

        const items = await OrderItem.findAll({ where: { order_id: order.order_id }, raw: true });
        const paid = await OrderPayment.findOne({ where: { order_id: order.order_id } });
        const money = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');
        const j = order.toJSON();
        const when = new Date(j.created_at || j.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const method = /^cod$/i.test(order.payment_method || '') ? 'Cash on Delivery' : (order.payment_method || '');
        const status = paid ? 'Paid' : 'Payment pending';

        const rows = items.map(i => `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(i.name)}${i.variant ? ' (' + escapeHtml(i.variant) + ')' : ''}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${money(i.price)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${money(Number(i.price) * Number(i.quantity))}</td></tr>`).join('');
        const text = `Bill for order #${order.order_id} (${when})\n\n` +
            items.map(i => `- ${i.name}${i.variant ? ' (' + i.variant + ')' : ''}: ${money(i.price)} x ${i.quantity} = ${money(Number(i.price) * Number(i.quantity))}`).join('\n') +
            `\n\nTotal: ${money(order.total)}\nPayment: ${method} - ${status}\n\nThank you for shopping with The Friends Heritage.`;

        await transporter.sendMail({
            from: `"The Friends Heritage" <${GMAIL_USER}>`,
            to: order.customer_email,
            subject: `Your bill for order #${order.order_id} | The Friends Heritage`,
            text,
            html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;border:1px solid #e5e0d8;border-radius:8px;background:#fdfbf7">
                <h2 style="color:#8b0000;margin-top:0">The Friends Heritage</h2>
                <p>Bill for order <strong>#${escapeHtml(order.order_id)}</strong><br><span style="color:#777">${escapeHtml(when)}</span></p>
                <p>${escapeHtml(order.customer_name)}<br>${escapeHtml([order.address, order.city, order.state].filter(Boolean).join(', '))}${order.pincode ? ' - ' + escapeHtml(order.pincode) : ''}</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
                    <thead><tr style="background:#8b0000;color:#fff"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:right">Rate</th><th style="padding:8px">Qty</th><th style="padding:8px;text-align:right">Amount</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4" style="padding:8px">Order total</td></tr>'}</tbody>
                    <tfoot><tr><td colspan="3" style="padding:10px 8px;text-align:right;font-weight:bold">Total</td><td style="padding:10px 8px;text-align:right;font-weight:bold;color:#8b0000">${money(order.total)}</td></tr></tfoot>
                </table>
                <p style="background:#f4eee1;padding:10px 14px;border-radius:6px">Payment: <strong>${escapeHtml(method)}</strong> - ${status}</p>
                <p style="color:#555;font-size:13px">Thank you for shopping with The Friends Heritage.</p></div>`
        });
        res.json({ success: true, message: "Bill sent.", to: order.customer_email });
    } catch (error) {
        console.error("Bill Email Error:", error);
        res.status(502).json({ success: false, message: "Could not send the email: " + error.message });
    }
});

// Owner can confirm (or undo) the payment of any order
app.put('/api/admin/orders/:orderId/payment', isAdmin, async (req, res) => {
    try {
        const order = await Order.findOne({ where: { order_id: req.params.orderId } });
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        const paid = req.body.paid === true || req.body.paid === 'true';
        if (paid) {
            await OrderPayment.findOrCreate({
                where: { order_id: order.order_id },
                defaults: { confirmed_by_id: null, confirmed_by_name: 'Owner', confirmed_at: new Date() }
            });
        } else {
            const handed = await PaymentHandover.findOne({ where: { order_id: order.order_id } });
            if (handed && handed.received_at) {
                return res.status(403).json({ success: false, message: "This payment was already received from the staff member. Mark it as not received first." });
            }
            await PaymentHandover.destroy({ where: { order_id: order.order_id } });
            await OrderPayment.destroy({ where: { order_id: order.order_id } });
        }
        res.json({ success: true, payment_confirmed: paid });
    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ success: false, message: "Failed to update payment." });
    }
});

// Owner can hand an order back so every staff member sees it again
app.post('/api/admin/orders/:orderId/release', isAdmin, async (req, res) => {
    try {
        await OrderAssignment.destroy({ where: { order_id: req.params.orderId } });
        res.json({ success: true, message: "Order released." });
    } catch (error) {
        console.error("Release Order Error:", error);
        res.status(500).json({ success: false, message: "Failed to release order." });
    }
});

// Owner manages staff accounts
app.get('/api/admin/staff', isAdmin, async (req, res) => {
    try {
        const [staff, assigns, payments, handovers] = await Promise.all([
            StaffAccount.findAll({ order: [['id', 'DESC']] }),
            OrderAssignment.findAll({ raw: true }),
            OrderPayment.findAll({ raw: true }),
            PaymentHandover.findAll({ raw: true })
        ]);
        const statusOf = {};
        (await Order.findAll({ attributes: ['order_id', 'status'], raw: true })).forEach(o => { statusOf[o.order_id] = o.status; });
        const paidSet = new Set(payments.map(p => p.order_id));
        res.json({
            success: true,
            staff: staff.map(st => {
                const mine = assigns.filter(a => Number(a.staff_id) === Number(st.id));
                return {
                    ...staffPublic(st),
                    orders_taken: mine.length,
                    orders_with_payment: mine.filter(a => paidSet.has(a.order_id)).length,
                    delivered: mine.filter(a => statusOf[a.order_id] === 'Delivered').length,
                    to_receive: handovers.filter(h => Number(h.staff_id) === Number(st.id) && !h.received_at).reduce((t, h) => t + (Number(h.amount) || 0), 0)
                };
            })
        });
    } catch (error) {
        console.error("List Staff Error:", error);
        res.status(500).json({ success: false, message: "Failed to load staff." });
    }
});

app.post('/api/admin/staff', isAdmin, async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const username = String(req.body.username || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        if (name.length < 2) return res.status(400).json({ success: false, message: "Enter the staff member's name." });
        if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
            return res.status(400).json({ success: false, message: "Username must be 3 to 30 letters, numbers, dots, dashes or underscores." });
        }
        if (password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });

        const staff = await StaffAccount.create({
            name, username, password_hash: await bcrypt.hash(password, 10), active: true, created_at: new Date()
        });
        res.json({ success: true, staff: staffPublic(staff) });
    } catch (error) {
        const taken = error && error.name === 'SequelizeUniqueConstraintError';
        if (!taken) console.error("Create Staff Error:", error);
        res.status(taken ? 400 : 500).json({ success: false, message: taken ? "That username is already taken." : "Failed to create staff account." });
    }
});

app.put('/api/admin/staff/:id', isAdmin, async (req, res) => {
    try {
        const staff = await StaffAccount.findByPk(req.params.id);
        if (!staff) return res.status(404).json({ success: false, message: "Staff account not found." });
        const updates = {};
        if (req.body.active !== undefined) updates.active = req.body.active === true || req.body.active === 'true';
        if (req.body.password !== undefined) {
            const pw = String(req.body.password);
            if (pw.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
            updates.password_hash = await bcrypt.hash(pw, 10);
        }
        await staff.update(updates);
        res.json({ success: true, staff: staffPublic(staff) });
    } catch (error) {
        console.error("Update Staff Error:", error);
        res.status(500).json({ success: false, message: "Failed to update staff account." });
    }
});

app.delete('/api/admin/staff/:id', isAdmin, async (req, res) => {
    try {
        await OrderAssignment.destroy({ where: { staff_id: req.params.id } });
        const deleted = await StaffAccount.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ success: false, message: "Staff account not found." });
        res.json({ success: true, message: "Staff account deleted." });
    } catch (error) {
        console.error("Delete Staff Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete staff account." });
    }
});


// ==========================================
// CUSTOMER ACCOUNT PAGE (profile, address, my orders)
// ==========================================
const requireCustomer = async (req, res, next) => {
    try {
        if (!req.session.customer_id) {
            return res.status(401).json({ success: false, message: "Please log in." });
        }
        const user = await User.findByPk(req.session.customer_id);
        if (!user) {
            req.session.customer_id = null;
            return res.status(401).json({ success: false, message: "Please log in." });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

app.get('/api/orders/me', requireCustomer, async (req, res) => {
    try {
        const match = [];
        if (req.user.email) match.push({ customer_email: req.user.email });
        if (req.user.phone) match.push({ customer_phone: req.user.phone });
        if (!match.length) return res.json({ success: true, orders: [] });

        const orders = await Order.findAll({ where: { [Op.or]: match }, order: [['created_at', 'DESC']] });
        const items = orders.length
            ? await OrderItem.findAll({ where: { order_id: orders.map(o => o.order_id) }, raw: true })
            : [];
        const byOrder = {};
        items.forEach(it => { (byOrder[it.order_id] = byOrder[it.order_id] || []).push(it); });

        const paidSet = new Set((orders.length ? await OrderPayment.findAll({ where: { order_id: orders.map(o => o.order_id) }, raw: true }) : []).map(p => p.order_id));
        res.json({ success: true, orders: orders.map(o => ({ ...o.toJSON(), items: byOrder[o.order_id] || [], payment_confirmed: paidSet.has(o.order_id) })) });
    } catch (error) {
        console.error("My Orders Error:", error);
        res.status(500).json({ success: false, message: "Failed to load your orders." });
    }
});

app.put('/api/auth/profile', requireCustomer, async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        if (name.length < 2) {
            return res.status(400).json({ success: false, message: "Please enter your full name." });
        }
        await req.user.update({ name });
        res.json({ success: true, message: "Profile updated.", user: safeUser(req.user) });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Could not update profile." });
    }
});

app.put('/api/auth/address', requireCustomer, async (req, res) => {
    try {
        const clean = (v) => String(v == null ? '' : v).trim();
        const phone = clean(req.body.phone).replace(/\D/g, '');
        const pincode = clean(req.body.pincode);
        if (phone && !/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ success: false, message: "Enter a valid 10-digit mobile number." });
        }
        if (pincode && !/^\d{6}$/.test(pincode)) {
            return res.status(400).json({ success: false, message: "Enter a valid 6-digit pincode." });
        }
        await req.user.update({
            phone: phone || req.user.phone,
            address: clean(req.body.address),
            city: clean(req.body.city),
            state: clean(req.body.state),
            pincode
        });
        res.json({ success: true, message: "Address saved.", user: safeUser(req.user) });
    } catch (error) {
        console.error("Update Address Error:", error);
        const taken = error && error.name === 'SequelizeUniqueConstraintError';
        res.status(taken ? 400 : 500).json({ success: false, message: taken ? "That mobile number is already used by another account." : "Could not save address." });
    }
});


// ==========================================
// SAFETY NETS (log errors instead of dying silently)
// ==========================================
process.on('unhandledRejection', (err) => console.error("❌ Unhandled Rejection:", err));
process.on('uncaughtException', (err) => console.error("❌ Uncaught Exception:", err));


// ==========================================
// START SERVER & SYNC DATABASE
// ==========================================
sequelize.sync().then(() => backfillHandovers().catch(e => console.error("Handover backfill:", e.message))).then(() => {
    console.log("Database Synced successfully!");
    if (!ADMIN_PASSWORD) console.warn("⚠️  ADMIN_PASSWORD is not set in .env, so the admin panel cannot be opened.");

    // THIS was missing: without app.listen() Node has nothing to keep running,
    // so the process finished and returned you to the prompt.
    const server = app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`       THE FRIENDS HERITAGE NODE.JS BACKEND`);
        console.log(`====================================================`);
        console.log(`       Status : ONLINE`);
        console.log(`       Server : http://localhost:${PORT}`);
        console.log(`====================================================`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use. Close the other server or change PORT in .env.`);
        } else {
            console.error("❌ Server error:", err);
        }
        process.exit(1);
    });
}).catch(err => {
    console.error("❌ Database sync error:", err);
    process.exit(1);
}); 