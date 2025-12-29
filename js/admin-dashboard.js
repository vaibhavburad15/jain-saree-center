// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initializeDashboard();
    loadDashboardData();
});

function checkAdminAuth() {
    // For development/demo purposes, automatically set admin session
    // In production, implement proper authentication
    sessionStorage.setItem('adminLoggedIn', 'true');
    sessionStorage.setItem('adminUsername', 'admin');

    // Uncomment the lines below for proper authentication
    // const adminSession = sessionStorage.getItem('adminLoggedIn');
    // if (adminSession !== 'true') {
    //     window.location.href = 'admin-login.html';
    // }
}

function initializeDashboard() {
    // Tab switching functionality
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const tabs = document.querySelectorAll('.admin-tab');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links and tabs
            navLinks.forEach(l => l.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Show corresponding tab
            const tabId = this.getAttribute('data-tab') + 'Tab';
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
                updatePageTitle(this.textContent.trim());
            }

            // Load tab-specific data
            loadTabData(this.getAttribute('data-tab'));
        });
    });

    // Logout functionality
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminUsername');
            window.location.href = 'admin-login.html';
        });
    }

    // Menu toggle for mobile
    const menuToggle = document.getElementById('adminMenuToggle');
    const sidebar = document.getElementById('adminSidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Product management
    initializeProductManagement();

    // Order management
    initializeOrderManagement();

    // Settings
    initializeSettings();
}

function updatePageTitle(title) {
    const pageTitle = document.getElementById('adminPageTitle');
    if (pageTitle) {
        pageTitle.textContent = title;
    }
}

function loadTabData(tabName) {
    switch(tabName) {
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'dashboard':
            loadDashboardData();
            break;
    }
}

function loadDashboardData() {
    // Load dashboard statistics
    fetch('/api/admin/stats')
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalProducts').textContent = data.totalProducts || 0;
            document.getElementById('totalOrders').textContent = data.totalOrders || 0;
            document.getElementById('totalRevenue').textContent = '₹' + (data.totalRevenue || 0);
        })
        .catch(error => console.error('Error loading dashboard data:', error));

    // Load recent orders
    fetch('/api/admin/recent-orders')
        .then(response => response.json())
        .then(data => {
            displayRecentOrders(data);
        })
        .catch(error => console.error('Error loading recent orders:', error));
}

function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrdersContainer');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<p class="no-data">No orders yet</p>';
        return;
    }

    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(order => {
        html += `
            <tr>
                <td>${order.id}</td>
                <td>${order.customer_name}</td>
                <td>₹${order.total_amount}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td><span class="status-${order.status}">${order.status}</span></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function initializeProductManagement() {
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const productForm = document.getElementById('productForm');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            openProductModal();
        });
    }

    if (closeProductModal) {
        closeProductModal.addEventListener('click', function() {
            closeModal(productModal);
        });
    }

    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', function() {
            closeModal(productModal);
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }

    // Close modal when clicking outside
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal) {
                closeModal(productModal);
            }
        });
    }
}

function loadProducts() {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            displayProducts(data);
        })
        .catch(error => console.error('Error loading products:', error));
}

function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No products available</td></tr>';
        return;
    }

    let html = '';
    products.forEach(product => {
        html += `
            <tr>
                <td><img src="${product.image_url || '/uploads/default.jpg'}" alt="${product.name}" class="product-thumb"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.pieces_per_set}</td>
                <td>₹${product.price_per_set}</td>
                <td><span class="stock-${product.in_stock ? 'in' : 'out'}">${product.in_stock ? 'In Stock' : 'Out of Stock'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');

    if (productId) {
        title.textContent = 'Edit Product';
        // Load product data for editing
        fetch(`/api/products/${productId}`)
            .then(response => response.json())
            .then(data => {
                populateProductForm(data);
            });
    } else {
        title.textContent = 'Add New Product';
        form.reset();
        document.getElementById('productId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

function populateProductForm(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('piecesPerSet').value = product.pieces_per_set;
    document.getElementById('pricePerSet').value = product.price_per_set;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('inStock').checked = product.in_stock;
}

function saveProduct() {
    const form = document.getElementById('productForm');
    const formData = new FormData(form);
    const productId = formData.get('productId');

    // Validate required fields
    const name = formData.get('productName');
    const category = formData.get('productCategory');
    const piecesPerSet = formData.get('piecesPerSet');
    const pricePerSet = formData.get('pricePerSet');
    const description = formData.get('productDescription');

    if (!name || !category || !piecesPerSet || !pricePerSet || !description) {
        alert('Please fill in all required fields');
        return;
    }

    // Create a new FormData with correct field names for the server
    const serverFormData = new FormData();
    serverFormData.append('name', name.trim());
    serverFormData.append('category', category.trim());
    serverFormData.append('piecesPerSet', piecesPerSet.trim());
    serverFormData.append('pricePerSet', pricePerSet.trim());
    serverFormData.append('description', description.trim());
    serverFormData.append('inStock', formData.get('inStock') ? 'true' : 'false');

    // Handle image file
    const imageFile = formData.get('productImage');
    if (imageFile && imageFile.size > 0) {
        serverFormData.append('productImage', imageFile);
    }

    const url = productId ? `/api/products/${productId}` : '/api/products';
    const method = productId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        body: serverFormData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal(document.getElementById('productModal'));
            loadProducts();
            loadDashboardData(); // Update stats
        } else {
            alert('Error saving product: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error saving product:', error);
        alert('Error saving product: ' + error.message);
    });
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadProducts();
                loadDashboardData(); // Update stats
            } else {
                alert('Error deleting product: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        });
    }
}

function initializeOrderManagement() {
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');

    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', function() {
            loadOrders(this.value);
        });
    }

    if (closeOrderModal) {
        closeOrderModal.addEventListener('click', function() {
            closeModal(orderModal);
        });
    }

    if (orderModal) {
        orderModal.addEventListener('click', function(e) {
            if (e.target === orderModal) {
                closeModal(orderModal);
            }
        });
    }
}

function loadOrders(status = '') {
    let url = '/api/admin/orders';
    if (status) {
        url += `?status=${status}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayOrders(data);
        })
        .catch(error => console.error('Error loading orders:', error));
}

function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No orders available</td></tr>';
        return;
    }

    let html = '';
    orders.forEach(order => {
        html += `
            <tr>
                <td>${order.id}</td>
                <td>${order.customer_name}</td>
                <td>${order.customer_phone}</td>
                <td>${order.total_sets}</td>
                <td>₹${order.total_amount}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="updateOrderStatus(${order.id}, '${order.status}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function viewOrder(orderId) {
    fetch(`/api/admin/orders/${orderId}`)
        .then(response => response.json())
        .then(data => {
            displayOrderDetails(data);
        })
        .catch(error => console.error('Error loading order details:', error));
}

function displayOrderDetails(order) {
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderModalContent');

    // Parse order items from JSON string
    const items = JSON.parse(order.orderItems);

    let html = `
        <div class="order-details">
            <div class="order-info">
                <h3>Order #${order.id}</h3>
                <p><strong>Customer:</strong> ${order.customer_name}</p>
                <p><strong>Phone:</strong> ${order.customer_phone}</p>
                <p><strong>Email:</strong> ${order.customer_email || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.customer_address}</p>
                <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-${order.status}">${order.status}</span></p>
            </div>

            <div class="order-items">
                <h4>Order Items</h4>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    items.forEach(item => {
        const total = item.quantity * item.pricePerSet;
        html += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.pricePerSet}</td>
                <td>₹${total}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>

            <div class="order-total">
                <p><strong>Total Amount: ₹${order.total_amount}</strong></p>
            </div>
        </div>
    `;

    content.innerHTML = html;
    modal.style.display = 'block';
}

function updateOrderStatus(orderId, currentStatus) {
    const newStatus = prompt('Enter new status (pending/processing/completed/cancelled):', currentStatus);
    if (newStatus && newStatus !== currentStatus) {
        fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadOrders();
                loadDashboardData(); // Update stats
            } else {
                alert('Error updating order status: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating order status:', error);
            alert('Error updating order status');
        });
    }
}

function initializeSettings() {
    const businessSettingsForm = document.getElementById('businessSettingsForm');
    const notificationSettingsForm = document.getElementById('notificationSettingsForm');

    if (businessSettingsForm) {
        businessSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveBusinessSettings();
        });
    }

    if (notificationSettingsForm) {
        notificationSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNotificationSettings();
        });
    }

    // Load current settings
    loadSettings();
}

function loadSettings() {
    fetch('/api/admin/settings')
        .then(response => response.json())
        .then(data => {
            if (data.business) {
                document.getElementById('businessPhone').value = data.business.phone || '';
                document.getElementById('businessEmail').value = data.business.email || '';
            }
            if (data.notifications) {
                document.getElementById('ownerEmail').value = data.notifications.owner_email || '';
                document.getElementById('ownerPhone').value = data.notifications.owner_phone || '';
            }
        })
        .catch(error => console.error('Error loading settings:', error));
}

function saveBusinessSettings() {
    const settings = {
        phone: document.getElementById('businessPhone').value,
        email: document.getElementById('businessEmail').value
    };

    fetch('/api/admin/settings/business', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Business settings saved successfully!');
        } else {
            alert('Error saving business settings: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error saving business settings:', error);
        alert('Error saving business settings');
    });
}

function saveNotificationSettings() {
    const settings = {
        owner_email: document.getElementById('ownerEmail').value,
        owner_phone: document.getElementById('ownerPhone').value
    };

    fetch('/api/admin/settings/notifications', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Notification settings saved successfully!');
        } else {
            alert('Error saving notification settings: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error saving notification settings:', error);
        alert('Error saving notification settings');
    });
}
