const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { productOperations, orderOperations, settingsOperations } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure multer for file uploads
const uploadsDir = path.join('/tmp', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(uploadsDir));

// Email transporter setup
let transporter;

function setupEmailTransporter() {
    // Wait a bit for database initialization
    setTimeout(() => {
        settingsOperations.getByKey('smtp_host', (err, host) => {
            if (err) {
                console.error('Error getting SMTP host:', err);
                return;
            }

            settingsOperations.getByKey('smtp_port', (err, port) => {
                if (err) {
                    console.error('Error getting SMTP port:', err);
                    return;
                }

                settingsOperations.getByKey('smtp_user', (err, user) => {
                    if (err) {
                        console.error('Error getting SMTP user:', err);
                        return;
                    }

                    settingsOperations.getByKey('smtp_pass', (err, pass) => {
                        if (err) {
                            console.error('Error getting SMTP pass:', err);
                            return;
                        }

                        transporter = nodemailer.createTransport({
                            host: host ? host.value : 'smtp.gmail.com',
                            port: port ? parseInt(port.value) : 587,
                            secure: false,
                            auth: {
                                user: user ? user.value : '',
                                pass: pass ? pass.value : ''
                            }
                        });

                        console.log('Email transporter configured.');
                    });
                });
            });
        });
    }, 1000); // Wait 1 second for database initialization
}

// Initialize email setup
setupEmailTransporter();

// API Routes

// Products API
app.get('/api/products', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const search = req.query.search;

    productOperations.getAll((err, products) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }

        let filteredProducts = products;

        // Apply search filter
        if (search) {
            filteredProducts = filteredProducts.filter(p =>
                p.category.toLowerCase().includes(search.toLowerCase()) ||
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Apply limit
        if (limit) {
            filteredProducts = filteredProducts.slice(0, limit);
        }

        res.json({ data: filteredProducts });
    });
});

app.post('/api/products', upload.single('productImage'), (req, res) => {
    console.log('All req.body keys:', Object.keys(req.body));
    console.log('Raw req.body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.file);

    // Build product object from form data
    const product = {
        name: req.body.name && req.body.name.trim() ? req.body.name.trim() : '',
        category: req.body.category && req.body.category.trim() ? req.body.category.trim() : '',
        piecesPerSet: req.body.piecesPerSet ? parseInt(req.body.piecesPerSet) : null,
        pricePerSet: req.body.pricePerSet ? parseFloat(req.body.pricePerSet) : null,
        description: req.body.description ? req.body.description.trim() : '',
        inStock: req.body.inStock === 'true'
    };

    // Generate ID if not provided
    if (!req.body.id) {
        product.id = 'prod_' + Date.now();
    } else {
        product.id = req.body.id;
    }

    // Handle image URL
    if (req.file) {
        product.imageUrl = `/uploads/${req.file.filename}`;
    } else {
        product.imageUrl = '';
    }

    console.log('Constructed product object:', JSON.stringify(product, null, 2));

    // Validate required fields
    if (!product.name || !product.category || product.piecesPerSet === null || product.pricePerSet === null) {
        console.error('Missing required fields:', { name: product.name, category: product.category, piecesPerSet: product.piecesPerSet, pricePerSet: product.pricePerSet });
        return res.status(400).json({ success: false, message: `Missing required fields: ${!product.name ? 'name ' : ''}${!product.category ? 'category ' : ''}${product.piecesPerSet === null ? 'piecesPerSet ' : ''}${product.pricePerSet === null ? 'pricePerSet ' : ''}`.trim() });
    }

    productOperations.create(product, (err, result) => {
        if (err) {
            console.error('Error creating product:', err);
            return res.status(500).json({ success: false, message: 'Failed to create product', error: err.message });
        }

        res.status(201).json({ success: true, product: { ...product, id: result.id } });
    });
});

app.put('/api/products/:id', upload.single('productImage'), (req, res) => {
    const id = req.params.id;
    const product = req.body;

    // Handle image URL for updates
    if (req.file) {
        product.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Convert inStock to boolean
    product.inStock = product.inStock === 'true' || product.inStock === true;

    productOperations.update(id, product, (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ error: 'Failed to update product' });
        }

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ success: true, message: 'Product updated successfully' });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;

    productOperations.delete(id, (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Failed to delete product' });
        }

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    });
});

// Orders API
app.get('/api/orders', (req, res) => {
    orderOperations.getAll((err, orders) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        res.json({ data: orders });
    });
});

app.post('/api/orders', (req, res) => {
    const orderData = req.body;

    // Generate order ID if not provided
    if (!orderData.id) {
        orderData.id = Date.now().toString();
    }

    orderOperations.create(orderData, (err, result) => {
        if (err) {
            console.error('Error creating order:', err);
            return res.status(500).json({ error: 'Failed to create order' });
        }

        // Send email notifications
        sendOrderEmails(orderData);

        res.status(201).json({
            success: true,
            orderId: orderData.orderId,
            message: 'Order created successfully'
        });
    });
});

app.get('/api/orders/:id', (req, res) => {
    const id = req.params.id;

    orderOperations.getById(id, (err, order) => {
        if (err) {
            console.error('Error fetching order:', err);
            return res.status(500).json({ error: 'Failed to fetch order' });
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    });
});

app.put('/api/orders/:id/status', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    orderOperations.updateStatus(id, status, (err, result) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({ error: 'Failed to update order status' });
        }

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ success: true, message: 'Order status updated successfully' });
    });
});

// Admin API Routes
app.get('/api/admin/stats', (req, res) => {
    // Get total products count
    productOperations.getAll((err, products) => {
        if (err) {
            console.error('Error fetching products for stats:', err);
            return res.status(500).json({ error: 'Failed to fetch stats' });
        }

        const totalProducts = products.length;

        // Get total orders and revenue
        orderOperations.getAll((err, orders) => {
            if (err) {
                console.error('Error fetching orders for stats:', err);
                return res.status(500).json({ error: 'Failed to fetch stats' });
            }

            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

            res.json({
                totalProducts,
                totalOrders,
                totalRevenue
            });
        });
    });
});

app.get('/api/admin/recent-orders', (req, res) => {
    const limit = 5; // Show last 5 orders

    orderOperations.getAll((err, orders) => {
        if (err) {
            console.error('Error fetching recent orders:', err);
            return res.status(500).json({ error: 'Failed to fetch recent orders' });
        }

        // Sort by creation date (newest first) and limit
        const recentOrders = orders
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);

        res.json(recentOrders);
    });
});

app.get('/api/admin/orders', (req, res) => {
    const status = req.query.status;

    orderOperations.getAll((err, orders) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        let filteredOrders = orders;

        // Filter by status if provided
        if (status) {
            filteredOrders = orders.filter(order => order.status === status);
        }

        // Sort by creation date (newest first)
        filteredOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json(filteredOrders);
    });
});

app.get('/api/admin/orders/:id', (req, res) => {
    const id = req.params.id;

    orderOperations.getById(id, (err, order) => {
        if (err) {
            console.error('Error fetching order:', err);
            return res.status(500).json({ error: 'Failed to fetch order' });
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    });
});

app.put('/api/admin/orders/:id/status', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    orderOperations.updateStatus(id, status, (err, result) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({ error: 'Failed to update order status' });
        }

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ success: true, message: 'Order status updated successfully' });
    });
});

app.get('/api/admin/settings', (req, res) => {
    settingsOperations.getAll((err, settings) => {
        if (err) {
            console.error('Error fetching settings:', err);
            return res.status(500).json({ error: 'Failed to fetch settings' });
        }

        // Group settings by category
        const groupedSettings = {
            business: {},
            notifications: {}
        };

        settings.forEach(setting => {
            if (setting.key.startsWith('business_')) {
                groupedSettings.business[setting.key.replace('business_', '')] = setting.value;
            } else if (setting.key.startsWith('owner_')) {
                groupedSettings.notifications[setting.key] = setting.value;
            }
        });

        res.json(groupedSettings);
    });
});

app.put('/api/admin/settings/business', (req, res) => {
    const { phone, email } = req.body;

    // Update business settings
    let updatesCompleted = 0;
    const totalUpdates = 2;

    const checkComplete = () => {
        updatesCompleted++;
        if (updatesCompleted === totalUpdates) {
            res.json({ success: true, message: 'Business settings updated successfully' });
        }
    };

    settingsOperations.update('business_phone', phone, (err) => {
        if (err) {
            console.error('Error updating business phone:', err);
            return res.status(500).json({ error: 'Failed to update business settings' });
        }
        checkComplete();
    });

    settingsOperations.update('business_email', email, (err) => {
        if (err) {
            console.error('Error updating business email:', err);
            return res.status(500).json({ error: 'Failed to update business settings' });
        }
        checkComplete();
    });
});

app.put('/api/admin/settings/notifications', (req, res) => {
    const { owner_email, owner_phone } = req.body;

    // Update notification settings
    let updatesCompleted = 0;
    const totalUpdates = 2;

    const checkComplete = () => {
        updatesCompleted++;
        if (updatesCompleted === totalUpdates) {
            res.json({ success: true, message: 'Notification settings updated successfully' });
        }
    };

    settingsOperations.update('owner_email', owner_email, (err) => {
        if (err) {
            console.error('Error updating owner email:', err);
            return res.status(500).json({ error: 'Failed to update notification settings' });
        }
        checkComplete();
    });

    settingsOperations.update('owner_phone', owner_phone, (err) => {
        if (err) {
            console.error('Error updating owner phone:', err);
            return res.status(500).json({ error: 'Failed to update notification settings' });
        }
        checkComplete();
    });
});

// Settings API
app.get('/api/settings', (req, res) => {
    settingsOperations.getAll((err, settings) => {
        if (err) {
            console.error('Error fetching settings:', err);
            return res.status(500).json({ error: 'Failed to fetch settings' });
        }

        res.json({ data: settings });
    });
});

app.put('/api/settings/:key', (req, res) => {
    const key = req.params.key;
    const { value } = req.body;

    settingsOperations.update(key, value, (err, result) => {
        if (err) {
            console.error('Error updating setting:', err);
            return res.status(500).json({ error: 'Failed to update setting' });
        }

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        // Reconfigure email if SMTP settings changed
        if (key.startsWith('smtp_')) {
            setupEmailTransporter();
        }

        res.json({ success: true, message: 'Setting updated successfully' });
    });
});

// Email functions
function sendOrderEmails(orderData) {
    if (!transporter) {
        console.log('Email transporter not configured. Skipping email notifications.');
        return;
    }

    // Get business settings
    settingsOperations.getByKey('business_name', (err, businessName) => {
        if (err) return;

        settingsOperations.getByKey('business_email', (err, businessEmail) => {
            if (err) return;

            settingsOperations.getByKey('owner_email', (err, ownerEmail) => {
                if (err) return;

                // Send email to customer
                sendCustomerEmail(orderData, businessName.value, businessEmail.value);

                // Send email to owner
                sendOwnerEmail(orderData, businessName.value, ownerEmail.value);
            });
        });
    });
}

function sendCustomerEmail(orderData, businessName, businessEmail) {
    const customerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #C41E3A;">Order Confirmation - ${businessName}</h2>
            <p>Dear ${orderData.customerName},</p>
            <p>Thank you for your order! Your order has been successfully placed.</p>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                <p><strong>Total Amount:</strong> ₹${orderData.totalAmount.toLocaleString('en-IN')}</p>
                <p><strong>Total Sets:</strong> ${orderData.totalSets}</p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3>Delivery Address</h3>
                <p>${orderData.customerAddress}<br>
                ${orderData.customerCity}, ${orderData.customerState} - ${orderData.customerPincode}</p>
            </div>

            <p>We will process your order and contact you soon with further updates.</p>
            <p>For any queries, please contact us at ${businessEmail}</p>

            <p>Best regards,<br>${businessName} Team</p>
        </div>
    `;

    const mailOptions = {
        from: businessEmail,
        to: orderData.customerEmail,
        subject: `Order Confirmation - ${orderData.orderId} - ${businessName}`,
        html: customerEmailHtml
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending customer email:', error);
        } else {
            console.log('Customer email sent:', info.response);
        }
    });
}

function sendOwnerEmail(orderData, businessName, ownerEmail) {
    const orderItems = JSON.parse(orderData.orderItems);
    const itemsHtml = orderItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>${item.piecesPerSet}</td>
            <td>₹${item.pricePerSet.toLocaleString('en-IN')}</td>
            <td>₹${(item.pricePerSet * item.quantity).toLocaleString('en-IN')}</td>
        </tr>
    `).join('');

    const ownerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #C41E3A;">New Order Received - ${businessName}</h2>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3>Order Information</h3>
                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleString('en-IN')}</p>
                <p><strong>Total Amount:</strong> ₹${orderData.totalAmount.toLocaleString('en-IN')}</p>
                <p><strong>Total Sets:</strong> ${orderData.totalSets}</p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3>Customer Details</h3>
                <p><strong>Name:</strong> ${orderData.customerName}</p>
                <p><strong>Email:</strong> ${orderData.customerEmail}</p>
                <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
                <p><strong>Address:</strong> ${orderData.customerAddress}, ${orderData.customerCity}, ${orderData.customerState} - ${orderData.customerPincode}</p>
                ${orderData.customerMessage ? `<p><strong>Message:</strong> ${orderData.customerMessage}</p>` : ''}
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3>Order Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #e9ecef;">
                            <th style="padding: 10px; text-align: left; border: 1px solid #dee2e6;">Product</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #dee2e6;">Category</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #dee2e6;">Sets</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #dee2e6;">Pieces/Set</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #dee2e6;">Price/Set</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #dee2e6;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>

            <p>Please process this order and contact the customer for payment and delivery arrangements.</p>
        </div>
    `;

    const mailOptions = {
        from: ownerEmail,
        to: ownerEmail,
        subject: `New Order - ${orderData.orderId} - ₹${orderData.totalAmount.toLocaleString('en-IN')}`,
        html: ownerEmailHtml
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending owner email:', error);
        } else {
            console.log('Owner email sent:', info.response);
        }
    });
}

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
