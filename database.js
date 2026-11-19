const { Sequelize, DataTypes, Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Ensure instance folder exists
const instanceDir = path.join(__dirname, 'instance');
if (!fs.existsSync(instanceDir)) fs.mkdirSync(instanceDir);

// Connect to SQLite Database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(instanceDir, 'friends_heritage.db'),
    logging: false
});

// --- MODELS ---
const User = sequelize.define('user', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
    phone: { type: DataTypes.STRING, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    pincode: { type: DataTypes.STRING },
    landmark: { type: DataTypes.STRING },
    // Password Reset Fields
    reset_token: { type: DataTypes.STRING },
    reset_token_expires: { type: DataTypes.DATE }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const Product = sequelize.define('product', {
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING },
    original_price: { type: DataTypes.FLOAT, defaultValue: 0 },
    sale_price: { type: DataTypes.FLOAT, defaultValue: 0 },
    badge: { type: DataTypes.STRING },
    benefits: { type: DataTypes.TEXT },
    homepage_only: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

const ProductVariant = sequelize.define('product_variant', {
    name: { type: DataTypes.STRING, allowNull: false },
    original_price: { type: DataTypes.FLOAT, defaultValue: 0 },
    sale_price: { type: DataTypes.FLOAT, defaultValue: 0 },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: false });

const Cart = sequelize.define('cart', {
    cart_token: { type: DataTypes.STRING, unique: true, allowNull: false }
}, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const CartItem = sequelize.define('cart_item', {
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { timestamps: false });

const Order = sequelize.define('order', {
    order_id: { type: DataTypes.STRING, unique: true, allowNull: false },
    customer_name: { type: DataTypes.STRING, allowNull: false },
    customer_phone: { type: DataTypes.STRING, allowNull: false },
    customer_email: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    pincode: { type: DataTypes.STRING, allowNull: false },
    subtotal: { type: DataTypes.FLOAT, allowNull: false },
    delivery_charge: { type: DataTypes.FLOAT, defaultValue: 0 },
    total: { type: DataTypes.FLOAT, allowNull: false },
    payment_method: { type: DataTypes.STRING, allowNull: false },
    payment_status: { type: DataTypes.STRING, defaultValue: 'Pending' },
    payment_reference: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Order Placed' }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false });

// --- RELATIONSHIPS ---
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(Cart, { foreignKey: 'user_id' });
Cart.belongsTo(User, { foreignKey: 'user_id' });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
Product.hasMany(CartItem, { foreignKey: 'product_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });
ProductVariant.hasMany(CartItem, { foreignKey: 'variant_id' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id' });

// Sync DB Tables safely
sequelize.sync({ alter: true }).then(() => console.log('Database Synced successfully!'));

module.exports = { sequelize, User, Product, ProductVariant, Cart, CartItem, Order, Op };