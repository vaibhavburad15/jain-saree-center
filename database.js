const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = process.env.NODE_ENV === 'production'
    ? path.join('/tmp', 'jain_saree_center.db')
    : path.join(__dirname, 'jain_saree_center.db');

// Create database connection
let db;
let SQL;
let dbBuffer;

async function initializeDatabase() {
    try {
        SQL = await initSqlJs();
        console.log('SQL.js initialized.');

        // Try to load existing database file
        if (fs.existsSync(dbPath)) {
            const filebuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(filebuffer);
            console.log('Loaded existing SQLite database.');
        } else {
            db = new SQL.Database();
            console.log('Created new SQLite database.');
        }

        initializeTables();
    } catch (err) {
        console.error('Error initializing database:', err.message);
        throw err;
    }
}

// Save database to file periodically
function saveDatabase() {
    if (db) {
        try {
            dbBuffer = db.export();
            const buffer = Buffer.from(dbBuffer);
            fs.writeFileSync(dbPath, buffer);
            console.log('Database saved to file.');
        } catch (err) {
            console.error('Error saving database:', err.message);
        }
    }
}

// Initialize database on module load
initializeDatabase();

// Initialize database tables
function initializeTables() {
    try {
        // Products table
        db.exec(`
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
        `);
        console.log('Products table ready.');

        // Orders table
        db.exec(`
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
        `);
        console.log('Orders table ready.');

        // Settings table
        db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Settings table ready.');
        initializeDefaultSettings();
    } catch (err) {
        console.error('Error initializing tables:', err.message);
        throw err;
    }
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

    try {
        const insertStmt = db.prepare(`
            INSERT OR IGNORE INTO settings (key, value, created_at, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        defaultSettings.forEach(setting => {
            insertStmt.run(setting.key, setting.value);
        });
    } catch (err) {
        console.error('Error inserting default settings:', err.message);
    }
}

// Product operations
const productOperations = {
    getAll: (callback) => {
        try {
            const stmt = db.prepare('SELECT id, name, category, piecesPerSet AS pieces_per_set, pricePerSet AS price_per_set, description, imageUrl AS image_url, inStock AS in_stock, created_at FROM products ORDER BY created_at DESC');
            const rows = stmt.all();
            callback(null, rows);
        } catch (err) {
            callback(err, null);
        }
    },

    getById: (id, callback) => {
        try {
            const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
            const row = stmt.get(id);
            callback(null, row);
        } catch (err) {
            callback(err, null);
        }
    },

    create: (product, callback) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO products (id, name, category, piecesPerSet, pricePerSet, description, imageUrl, inStock)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(
                product.id,
                product.name,
                product.category,
                product.piecesPerSet,
                product.pricePerSet,
                product.description || '',
                product.imageUrl || '',
                product.inStock ? 1 : 0
            );
            callback(null, { id: product.id, changes: result.changes });
        } catch (err) {
            callback(err, null);
        }
    },

    update: (id, product, callback) => {
        try {
            const stmt = db.prepare(`
                UPDATE products
                SET name = ?, category = ?, piecesPerSet = ?, pricePerSet = ?,
                    description = ?, imageUrl = ?, inStock = ?
                WHERE id = ?
            `);
            const result = stmt.run(
                product.name,
                product.category,
                product.piecesPerSet,
                product.pricePerSet,
                product.description || '',
                product.imageUrl || '',
                product.inStock ? 1 : 0,
                id
            );
            callback(null, { changes: result.changes });
        } catch (err) {
            callback(err, null);
        }
    },

    delete: (id, callback) => {
        try {
            const stmt = db.prepare('DELETE FROM products WHERE id = ?');
            const result = stmt.run(id);
            callback(null, { changes: result.changes });
        } catch (err) {
            callback(err, null);
        }
    }
};

// Order operations
const orderOperations = {
    getAll: (callback) => {
        try {
            const stmt = db.prepare('SELECT id, orderId, customerName AS customer_name, customerEmail AS customer_email, customerPhone AS customer_phone, customerAddress AS customer_address, customerCity, customerState, customerPincode, customerMessage, orderItems, totalSets AS total_sets, totalAmount AS total_amount, orderStatus AS status, orderDate AS created_at FROM orders ORDER BY orderDate DESC');
            const rows = stmt.all();
            callback(null, rows);
        } catch (err) {
            callback(err, null);
        }
    },

    getById: (id, callback) => {
        try {
            const stmt = db.prepare('SELECT id, orderId, customerName AS customer_name, customerEmail AS customer_email, customerPhone AS customer_phone, customerAddress AS customer_address, customerCity, customerState, customerPincode, customerMessage, orderItems, totalSets AS total_sets, totalAmount AS total_amount, orderStatus AS status, orderDate AS created_at FROM orders WHERE id = ?');
            const row = stmt.get(id);
            callback(null, row);
        } catch (err) {
            callback(err, null);
        }
    },

    create: (order, callback) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO orders (id, orderId, customerName, customerEmail, customerPhone,
                                  customerAddress, customerCity, customerState, customerPincode,
                                  customerMessage, orderItems, totalSets, totalAmount, orderStatus)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(
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
            );
            callback(null, { id: order.id, changes: result.changes });
        } catch (err) {
            callback(err, null);
        }
    },

    updateStatus: (id, status, callback) => {
        try {
            const stmt = db.prepare('UPDATE orders SET orderStatus = ? WHERE id = ?');
            const result = stmt.run(status, id);
            callback(null, { changes: result.changes });
        } catch (err) {
            callback(err, null);
        }
    }
};

// Settings operations
const settingsOperations = {
    getAll: (callback) => {
        try {
            const stmt = db.prepare('SELECT * FROM settings ORDER BY key');
            const rows = stmt.all();
            callback(null, rows);
        } catch (err) {
            callback(err, null);
        }
    },

    getByKey: (key, callback) => {
        try {
            const stmt = db.prepare('SELECT * FROM settings WHERE key = ?');
            const row = stmt.get(key);
            callback(null, row);
        } catch (err) {
            callback(err, null);
        }
    },

    update: (key, value, callback) => {
        try {
            const stmt = db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?');
            const result = stmt.run(value, key);
            callback(null, { changes: result.changes });
        } catch (err) {
            callback(err, null);
        }
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
