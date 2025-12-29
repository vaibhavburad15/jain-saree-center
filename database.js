const { sql } = require('@vercel/postgres');

// Initialize database tables
async function initializeTables() {
    try {
        // Products table
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                pieces_per_set INTEGER NOT NULL,
                price_per_set DECIMAL(10,2) NOT NULL,
                description TEXT,
                image_url TEXT,
                in_stock BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('Products table ready.');

        // Orders table
        await sql`
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                order_id TEXT UNIQUE NOT NULL,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                customer_phone TEXT NOT NULL,
                customer_address TEXT NOT NULL,
                customer_city TEXT NOT NULL,
                customer_state TEXT NOT NULL,
                customer_pincode TEXT NOT NULL,
                customer_message TEXT,
                order_items JSONB NOT NULL,
                total_sets INTEGER NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                order_status TEXT DEFAULT 'pending',
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('Orders table ready.');

        // Settings table
        await sql`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('Settings table ready.');

    } catch (err) {
        console.error('Error creating tables:', err);
        throw err;
    }
}

// Initialize tables on startup
initializeTables().catch(console.error);

// Product operations
const productOperations = {
    create: async (product) => {
        try {
            const result = await sql`
                INSERT INTO products (id, name, category, pieces_per_set, price_per_set, description, image_url, in_stock)
                VALUES (${product.id}, ${product.name}, ${product.category}, ${product.piecesPerSet}, ${product.pricePerSet}, ${product.description}, ${product.imageUrl}, ${product.inStock})
                RETURNING id
            `;
            return { id: result[0].id };
        } catch (err) {
            console.error('Error creating product:', err);
            throw err;
        }
    },

    getAll: (callback) => {
        sql`SELECT * FROM products ORDER BY created_at DESC`
            .then(result => {
                const products = result.map(row => ({
                    id: row.id,
                    name: row.name,
                    category: row.category,
                    piecesPerSet: row.pieces_per_set,
                    pricePerSet: parseFloat(row.price_per_set),
                    description: row.description,
                    imageUrl: row.image_url,
                    inStock: row.in_stock,
                    created_at: row.created_at
                }));
                callback(null, products);
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                callback(err, null);
            });
    },

    getById: (id, callback) => {
        sql`SELECT * FROM products WHERE id = ${id}`
            .then(result => {
                if (result.length === 0) {
                    callback(null, null);
                    return;
                }
                const row = result[0];
                const product = {
                    id: row.id,
                    name: row.name,
                    category: row.category,
                    piecesPerSet: row.pieces_per_set,
                    pricePerSet: parseFloat(row.price_per_set),
                    description: row.description,
                    imageUrl: row.image_url,
                    inStock: row.in_stock,
                    created_at: row.created_at
                };
                callback(null, product);
            })
            .catch(err => {
                console.error('Error fetching product:', err);
                callback(err, null);
            });
    },

    update: (id, product, callback) => {
        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        if (product.name !== undefined) {
            updateFields.push(`name = $${paramIndex++}`);
            values.push(product.name);
        }
        if (product.category !== undefined) {
            updateFields.push(`category = $${paramIndex++}`);
            values.push(product.category);
        }
        if (product.piecesPerSet !== undefined) {
            updateFields.push(`pieces_per_set = $${paramIndex++}`);
            values.push(product.piecesPerSet);
        }
        if (product.pricePerSet !== undefined) {
            updateFields.push(`price_per_set = $${paramIndex++}`);
            values.push(product.pricePerSet);
        }
        if (product.description !== undefined) {
            updateFields.push(`description = $${paramIndex++}`);
            values.push(product.description);
        }
        if (product.imageUrl !== undefined) {
            updateFields.push(`image_url = $${paramIndex++}`);
            values.push(product.imageUrl);
        }
        if (product.inStock !== undefined) {
            updateFields.push(`in_stock = $${paramIndex++}`);
            values.push(product.inStock);
        }

        if (updateFields.length === 0) {
            callback(null, { changes: 0 });
            return;
        }

        values.push(id);
        const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
        sql.unsafe(query, values)
            .then(result => callback(null, { changes: result.length }))
            .catch(err => {
                console.error('Error updating product:', err);
                callback(err, null);
            });
    },

    delete: (id, callback) => {
        sql`DELETE FROM products WHERE id = ${id}`
            .then(result => callback(null, { changes: result.length }))
            .catch(err => {
                console.error('Error deleting product:', err);
                callback(err, null);
            });
    }
};

// Order operations
const orderOperations = {
    create: async (order) => {
        try {
            const result = await sql`
                INSERT INTO orders (id, order_id, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_state, customer_pincode, customer_message, order_items, total_sets, total_amount, order_status)
                VALUES (${order.id}, ${order.orderId}, ${order.customerName}, ${order.customerEmail}, ${order.customerPhone}, ${order.customerAddress}, ${order.customerCity}, ${order.customerState}, ${order.customerPincode}, ${order.customerMessage}, ${JSON.stringify(order.orderItems)}, ${order.totalSets}, ${order.totalAmount}, ${order.orderStatus || 'pending'})
                RETURNING id
            `;
            return { id: result[0].id };
        } catch (err) {
            console.error('Error creating order:', err);
            throw err;
        }
    },

    getAll: (callback) => {
        sql`SELECT * FROM orders ORDER BY order_date DESC`
            .then(result => {
                const orders = result.map(row => ({
                    id: row.id,
                    orderId: row.order_id,
                    customerName: row.customer_name,
                    customerEmail: row.customer_email,
                    customerPhone: row.customer_phone,
                    customerAddress: row.customer_address,
                    customerCity: row.customer_city,
                    customerState: row.customer_state,
                    customerPincode: row.customer_pincode,
                    customerMessage: row.customer_message,
                    orderItems: row.order_items,
                    totalSets: row.total_sets,
                    totalAmount: parseFloat(row.total_amount),
                    orderStatus: row.order_status,
                    orderDate: row.order_date
                }));
                callback(null, orders);
            })
            .catch(err => {
                console.error('Error fetching orders:', err);
                callback(err, null);
            });
    },

    getById: (id, callback) => {
        sql`SELECT * FROM orders WHERE id = ${id}`
            .then(result => {
                if (result.length === 0) {
                    callback(null, null);
                    return;
                }
                const row = result[0];
                const order = {
                    id: row.id,
                    orderId: row.order_id,
                    customerName: row.customer_name,
                    customerEmail: row.customer_email,
                    customerPhone: row.customer_phone,
                    customerAddress: row.customer_address,
                    customerCity: row.customer_city,
                    customerState: row.customer_state,
                    customerPincode: row.customer_pincode,
                    customerMessage: row.customer_message,
                    orderItems: row.order_items,
                    totalSets: row.total_sets,
                    totalAmount: parseFloat(row.total_amount),
                    orderStatus: row.order_status,
                    orderDate: row.order_date
                };
                callback(null, order);
            })
            .catch(err => {
                console.error('Error fetching order:', err);
                callback(err, null);
            });
    },

    update: (id, order, callback) => {
        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        if (order.orderStatus !== undefined) {
            updateFields.push(`order_status = $${paramIndex++}`);
            values.push(order.orderStatus);
        }

        if (updateFields.length === 0) {
            callback(null, { changes: 0 });
            return;
        }

        values.push(id);
        const query = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
        sql.unsafe(query, values)
            .then(result => callback(null, { changes: result.length }))
            .catch(err => {
                console.error('Error updating order:', err);
                callback(err, null);
            });
    }
};

// Settings operations
const settingsOperations = {
    getByKey: (key, callback) => {
        sql`SELECT * FROM settings WHERE key = ${key}`
            .then(result => {
                if (result.length === 0) {
                    callback(null, null);
                    return;
                }
                callback(null, result[0]);
            })
            .catch(err => {
                console.error('Error fetching setting:', err);
                callback(err, null);
            });
    },

    setByKey: (key, value, callback) => {
        sql`
            INSERT INTO settings (key, value)
            VALUES (${key}, ${value})
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `
            .then(() => callback(null, { key, value }))
            .catch(err => {
                console.error('Error setting setting:', err);
                callback(err, null);
            });
    }
};

module.exports = { productOperations, orderOperations, settingsOperations, initializeTables };
