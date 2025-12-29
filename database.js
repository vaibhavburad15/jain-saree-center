const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = process.env.NODE_ENV === 'production' 
    ? path.join('/tmp', 'jain_saree_center.db') 
    : path.join(__dirname, 'jain_saree_center.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeTables();
    }
});

// Initialize database tables
function initializeTables() {
    // Products table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            piecesPerSet INTEGER NOT NULL,
            pricePerSet REAL NOT NULL,
            description TEXT,
            imageUrl TEXT,
            inStock BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating products table:', err.message);
        } else {
            console.log('Products table ready.');
        }
    });

    // Orders table
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            orderId TEXT UNIQUE NOT NULL,
            customerName TEXT NOT NULL,
            customerEmail TEXT NOT NULL,
            customerPhone TEXT NOT NULL,
            customerAddress TEXT NOT NULL,
            customerCity TEXT NOT NULL,
            customerState TEXT NOT NULL,
            customerPincode TEXT NOT NULL,
            customerMessage TEXT,
            orderItems TEXT NOT NULL,
            totalSets INTEGER NOT NULL,
            totalAmount REAL NOT NULL,
            orderStatus TEXT DEFAULT 'pending',
            orderDate DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating orders table:', err.message);
        } else {
            console.log('Orders table ready.');
        }
    });

    // Settings table
    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating settings table:', err.message);
        } else {
            console.log('Settings table ready.');
            initializeDefaultSettings();
        }
    });
}

// Initialize default settings
function initializeDefaultSettings() {
    const defaultSettings = [
        { key: 'business_name', value: 'Jain Saree Center' },
        { key: 'business_email', value: 'info@jainsareecenter.com' },
        { key: 'owner_email', value: 'owner@jainsareecenter.com' },
        { key: 'smtp_host', value: 'smtp.gmail.com' },
        { key: 'smtp_port', value: '587' },
        { key: 'smtp_user', value: '' },
        { key: 'smtp_pass', value: '' }
    ];

    defaultSettings.forEach(setting => {
        db.run(`
            INSERT OR IGNORE INTO settings (key, value, created_at, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [setting.key, setting.value], (err) => {
            if (err) {
                console.error('Error inserting default setting:', err.message);
            }
        });
    });
}

// Product operations
const productOperations = {
    getAll: (callback) => {
        db.all('SELECT id, name, category, piecesPerSet AS pieces_per_set, pricePerSet AS price_per_set, description, imageUrl AS image_url, inStock AS in_stock, created_at FROM products ORDER BY created_at DESC', [], callback);
    },

    getById: (id, callback) => {
        db.get('SELECT * FROM products WHERE id = ?', [id], callback);
    },

    create: (product, callback) => {
        const sql = `
            INSERT INTO products (id, name, category, piecesPerSet, pricePerSet, description, imageUrl, inStock)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            product.id,
            product.name,
            product.category,
            product.piecesPerSet,
            product.pricePerSet,
            product.description || '',
            product.imageUrl || '',
            product.inStock ? 1 : 0
        ];

        db.run(sql, values, function(err) {
            callback(err, { id: product.id, changes: this.changes });
        });
    },

    update: (id, product, callback) => {
        const sql = `
            UPDATE products
            SET name = ?, category = ?, piecesPerSet = ?, pricePerSet = ?,
                description = ?, imageUrl = ?, inStock = ?
            WHERE id = ?
        `;
        const values = [
            product.name,
            product.category,
            product.piecesPerSet,
            product.pricePerSet,
            product.description || '',
            product.imageUrl || '',
            product.inStock ? 1 : 0,
            id
        ];

        db.run(sql, values, function(err) {
            callback(err, { changes: this.changes });
        });
    },

    delete: (id, callback) => {
        db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
            callback(err, { changes: this.changes });
        });
    }
};

// Order operations
const orderOperations = {
    getAll: (callback) => {
        db.all('SELECT id, orderId, customerName AS customer_name, customerEmail AS customer_email, customerPhone AS customer_phone, customerAddress AS customer_address, customerCity, customerState, customerPincode, customerMessage, orderItems, totalSets AS total_sets, totalAmount AS total_amount, orderStatus AS status, orderDate AS created_at FROM orders ORDER BY orderDate DESC', [], callback);
    },

    getById: (id, callback) => {
        db.get('SELECT id, orderId, customerName AS customer_name, customerEmail AS customer_email, customerPhone AS customer_phone, customerAddress AS customer_address, customerCity, customerState, customerPincode, customerMessage, orderItems, totalSets AS total_sets, totalAmount AS total_amount, orderStatus AS status, orderDate AS created_at FROM orders WHERE id = ?', [id], callback);
    },

    create: (order, callback) => {
        const sql = `
            INSERT INTO orders (id, orderId, customerName, customerEmail, customerPhone,
                              customerAddress, customerCity, customerState, customerPincode,
                              customerMessage, orderItems, totalSets, totalAmount, orderStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            order.id,
            order.orderId,
            order.customerName,
            order.customerEmail,
            order.customerPhone,
            order.customerAddress,
            order.customerCity,
            order.customerState,
            order.customerPincode,
            order.customerMessage || '',
            JSON.stringify(order.orderItems),
            order.totalSets,
            order.totalAmount,
            order.orderStatus || 'pending'
        ];

        db.run(sql, values, function(err) {
            callback(err, { id: order.id, changes: this.changes });
        });
    },

    updateStatus: (id, status, callback) => {
        db.run(
            'UPDATE orders SET orderStatus = ? WHERE id = ?',
            [status, id],
            function(err) {
                callback(err, { changes: this.changes });
            }
        );
    }
};

// Settings operations
const settingsOperations = {
    getAll: (callback) => {
        db.all('SELECT * FROM settings ORDER BY key', [], callback);
    },

    getByKey: (key, callback) => {
        db.get('SELECT * FROM settings WHERE key = ?', [key], callback);
    },

    update: (key, value, callback) => {
        db.run(
            'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
            [value, key],
            function(err) {
                callback(err, { changes: this.changes });
            }
        );
    }
};

// Close database connection on process exit
process.on('exit', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
});

module.exports = {
    productOperations,
    orderOperations,
    settingsOperations
};
