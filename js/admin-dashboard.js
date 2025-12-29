// ===============================================
// ADMIN DASHBOARD JAVASCRIPT (FIXED)
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initializeDashboard();
});

let allProducts = [];
let allOrders = [];

function checkAdminAuth() {
    const adminSession = sessionStorage.getItem('adminLoggedIn');
    if (adminSession !== 'true') {
        window.location.href = 'admin-login.html';
    }
}

async function initializeDashboard() {
    initializeTabNavigation();
    initializeLogout();
    initializeMobileMenu();
    await loadDashboardData();
    initializeProductManagement();
    initializeOrderManagement();
    initializeSettings();
}

function initializeTabNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const tabs = document.querySelectorAll('.admin-tab');
    const pageTitle = document.getElementById('adminPageTitle');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            tabs.forEach(t => t.classList.remove('active'));
            document.getElementById(`${tabName}Tab`).classList.add('active');
            
            const titles = {
                'dashboard': 'Dashboard',
                'products': 'Product Management',
                'orders': 'Order Management',
                'settings': 'Settings'
            };
            pageTitle.textContent = titles[tabName] || 'Dashboard';
        });
    });
}

function initializeLogout() {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminUsername');
            window.location.href = 'admin-login.html';
        }
    });
}

function initializeMobileMenu() {
    const menuToggle = document.getElementById('adminMenuToggle');
    const sidebar = document.getElementById('adminSidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

// ========== DATA MANAGEMENT (USING LOCALSTORAGE) ==========
async function loadDashboardData() {
    try {
        // Load from localStorage
        allProducts = JSON.parse(localStorage.getItem('jsc_products') || '[]');
        allOrders = JSON.parse(localStorage.getItem('jsc_orders') || '[]');
        
        // Initialize with sample data if empty
        if (allProducts.length === 0) {
            initializeSampleProducts();
        }
        
        updateDashboardStats();
        displayRecentOrders();
        displayProductsTable();
        displayOrdersTable();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading data', 'error');
    }
}

function initializeSampleProducts() {
    const sampleProducts = [
        {
            id: 'prod_001',
            name: 'Designer Silk Saree',
            category: 'Sarees',
            piecesPerSet: 6,
            pricePerSet: 4500,
            description: 'Premium quality silk sarees with intricate designs',
            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
            inStock: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'prod_002',
            name: 'Cotton Kurti Set',
            category: 'Kurti',
            piecesPerSet: 5,
            pricePerSet: 2500,
            description: 'Comfortable cotton kurti perfect for daily wear',
            imageUrl: 'https://images.unsplash.com/photo-1583391733981-5ae2f0f8f5b5?w=400',
            inStock: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'prod_003',
            name: 'Premium Bedsheet Set',
            category: 'Bedsheet',
            piecesPerSet: 4,
            pricePerSet: 1800,
            description: 'Double bed bedsheet with pillow covers',
            imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
            inStock: true,
            created_at: new Date().toISOString()
        }
    ];
    
    allProducts = sampleProducts;
    localStorage.setItem('jsc_products', JSON.stringify(allProducts));
}

function updateDashboardStats() {
    document.getElementById('totalProducts').textContent = allProducts.length;
    document.getElementById('totalOrders').textContent = allOrders.length;
    
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
}

function displayRecentOrders() {
    const recentOrdersContainer = document.getElementById('recentOrdersContainer');
    const recentOrders = allOrders.slice(0, 5);
    
    if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = '<p class="no-data">No orders yet</p>';
        return;
    }
    
    const tableHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${recentOrders.map(order => `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>${order.customerName}</td>
                        <td>${formatCurrency(order.totalAmount)}</td>
                        <td><span class="stock-badge ${order.orderStatus === 'completed' ? 'in-stock' : 'out-of-stock'}">${order.orderStatus}</span></td>
                        <td>${formatDate(order.orderDate)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    recentOrdersContainer.innerHTML = tableHTML;
}

// ========== PRODUCT MANAGEMENT ==========
function initializeProductManagement() {
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const productForm = document.getElementById('productForm');
    
    addProductBtn.addEventListener('click', () => openProductModal());
    closeProductModal.addEventListener('click', () => closeModal(productModal));
    cancelProductBtn.addEventListener('click', () => closeModal(productModal));
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleProductFormSubmit();
    });
}

function openProductModal(product = null) {
    const productModal = document.getElementById('productModal');
    const productModalTitle = document.getElementById('productModalTitle');
    const productForm = document.getElementById('productForm');
    
    if (product) {
        productModalTitle.textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('piecesPerSet').value = product.piecesPerSet;
        document.getElementById('pricePerSet').value = product.pricePerSet;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImage').value = product.imageUrl;
        document.getElementById('inStock').checked = product.inStock;
    } else {
        productModalTitle.textContent = 'Add New Product';
        productForm.reset();
        document.getElementById('productId').value = '';
    }
    
    productModal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

async function handleProductFormSubmit() {
    const productId = document.getElementById('productId').value;
    const isEdit = productId !== '';
    
    const productData = {
        id: isEdit ? productId : 'prod_' + Date.now(),
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        piecesPerSet: parseInt(document.getElementById('piecesPerSet').value),
        pricePerSet: parseFloat(document.getElementById('pricePerSet').value),
        description: document.getElementById('productDescription').value.trim(),
        imageUrl: document.getElementById('productImage').value.trim(),
        inStock: document.getElementById('inStock').checked,
        created_at: isEdit ? allProducts.find(p => p.id === productId)?.created_at : new Date().toISOString()
    };
    
    try {
        if (isEdit) {
            const index = allProducts.findIndex(p => p.id === productId);
            if (index !== -1) {
                allProducts[index] = productData;
            }
            showNotification('Product updated successfully', 'success');
        } else {
            allProducts.push(productData);
            showNotification('Product added successfully', 'success');
        }
        
        // Save to localStorage
        localStorage.setItem('jsc_products', JSON.stringify(allProducts));
        
        await loadDashboardData();
        closeModal(document.getElementById('productModal'));
        
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product', 'error');
    }
}

function displayProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    
    if (allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No products available</td></tr>';
        return;
    }
    
    tbody.innerHTML = allProducts.map(product => `
        <tr>
            <td><img src="${product.imageUrl}" alt="${product.name}" class="product-thumb" style="width:50px;height:50px;object-fit:cover;border-radius:4px;" onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.piecesPerSet}</td>
            <td>${formatCurrency(product.pricePerSet)}</td>
            <td><span class="stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">${product.inStock ? 'In Stock' : 'Out of Stock'}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn btn-delete" onclick="deleteProduct('${product.id}', '${product.name.replace(/'/g, "\\'")}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        openProductModal(product);
    }
}

async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
        return;
    }
    
    try {
        allProducts = allProducts.filter(p => p.id !== productId);
        localStorage.setItem('jsc_products', JSON.stringify(allProducts));
        
        showNotification('Product deleted successfully', 'success');
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
    }
}

// ========== ORDER MANAGEMENT ==========
function initializeOrderManagement() {
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    orderStatusFilter.addEventListener('change', function() {
        displayOrdersTable(this.value);
    });
}

function displayOrdersTable(statusFilter = '') {
    const tbody = document.getElementById('ordersTableBody');
    
    let filteredOrders = [...allOrders];
    
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(o => o.orderStatus === statusFilter);
    }
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No orders available</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>${order.orderId}</td>
            <td>${order.customerName}</td>
            <td>${order.customerPhone}<br><small>${order.customerEmail}</small></td>
            <td>${order.totalSets}</td>
            <td>${formatCurrency(order.totalAmount)}</td>
            <td>${formatDate(order.orderDate)}</td>
            <td><span class="stock-badge ${order.orderStatus === 'completed' ? 'in-stock' : 'out-of-stock'}">${order.orderStatus}</span></td>
            <td>
                <button class="action-btn btn-view" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
}

function viewOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const orderModal = document.getElementById('orderModal');
    const orderModalContent = document.getElementById('orderModalContent');
    
    let orderItems = [];
    try {
        orderItems = JSON.parse(order.orderItems);
    } catch (e) {
        console.error('Error parsing order items:', e);
    }
    
    const modalHTML = `
        <div style="padding: 20px;">
            <h3>Order Details</h3>
            <div style="margin-bottom: 20px;">
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Status:</strong> <span class="stock-badge ${order.orderStatus === 'completed' ? 'in-stock' : 'out-of-stock'}">${order.orderStatus}</span></p>
                <p><strong>Date:</strong> ${formatDate(order.orderDate)}</p>
            </div>
            
            <h4>Customer Information</h4>
            <div style="margin-bottom: 20px;">
                <p><strong>Name:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Phone:</strong> ${order.customerPhone}</p>
                <p><strong>Address:</strong> ${order.customerAddress}, ${order.customerCity}, ${order.customerState} - ${order.customerPincode}</p>
                ${order.customerMessage ? `<p><strong>Message:</strong> ${order.customerMessage}</p>` : ''}
            </div>
            
            <h4>Order Items</h4>
            <table class="admin-table" style="margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Sets</th>
                        <th>Pieces/Set</th>
                        <th>Price/Set</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderItems.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.category}</td>
                            <td>${item.quantity}</td>
                            <td>${item.piecesPerSet}</td>
                            <td>${formatCurrency(item.pricePerSet)}</td>
                            <td>${formatCurrency(item.pricePerSet * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="text-align: right;">
                <h3>Total Amount: ${formatCurrency(order.totalAmount)}</h3>
            </div>
        </div>
    `;
    
    orderModalContent.innerHTML = modalHTML;
    orderModal.classList.add('active');
    
    const closeOrderModal = document.getElementById('closeOrderModal');
    closeOrderModal.onclick = () => closeModal(orderModal);
}

// ========== SETTINGS ==========
function initializeSettings() {
    const businessSettingsForm = document.getElementById('businessSettingsForm');
    const notificationSettingsForm = document.getElementById('notificationSettingsForm');
    
    businessSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification('Settings saved successfully', 'success');
    });
    
    notificationSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification('Notification settings saved successfully', 'success');
    });
}

// ========== UTILITY FUNCTIONS ==========
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-IN', options);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${type === 'success' ? '#28A745' : type === 'error' ? '#DC3545' : '#17A2B8'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Make functions available globally
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewOrder = viewOrder;