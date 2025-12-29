// ===============================================
// JAIN SAREE CENTER - MAIN JAVASCRIPT
// Common functions used across all pages
// ===============================================

// ========== GLOBAL VARIABLES ==========
let cart = [];

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load cart from localStorage
    loadCart();
    
    // Update cart count
    updateCartCount();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Smooth scroll for anchor links
    initializeSmoothScroll();
}

// ========== MOBILE MENU ==========
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.navbar-content')) {
                navMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

// ========== CART MANAGEMENT ==========
function loadCart() {
    const savedCart = localStorage.getItem('jainSareeCenterCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Error loading cart:', e);
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem('jainSareeCenterCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function addToCart(product, quantity = 1) {
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            piecesPerSet: product.piecesPerSet,
            pricePerSet: product.pricePerSet,
            imageUrl: product.imageUrl,
            quantity: quantity
        });
    }
    
    saveCart();
    showNotification('Product added to cart!', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
        }
    }
}

function clearCart() {
    cart = [];
    saveCart();
}

function getCart() {
    return cart;
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.pricePerSet * item.quantity), 0);
}

function getCartSetsCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartPiecesCount() {
    return cart.reduce((sum, item) => sum + (item.piecesPerSet * item.quantity), 0);
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${type === 'success' ? '#28A745' : type === 'error' ? '#DC3545' : '#17A2B8'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations to head
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========== SMOOTH SCROLL ==========
function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
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

function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `JSC${timestamp}${random}`;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\s+/g, ''));
}

// ========== API HELPERS ==========
async function fetchProducts(filters = {}) {
    try {
        let url = 'tables/products?limit=100';
        
        if (filters.category) {
            url += `&search=${filters.category}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        let products = data.data || [];
        
        // Apply client-side filtering if needed
        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }
        
        // Apply sorting
        if (filters.sort) {
            products = sortProducts(products, filters.sort);
        }
        
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'price-low':
            sorted.sort((a, b) => a.pricePerSet - b.pricePerSet);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.pricePerSet - a.pricePerSet);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
        default:
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
    }
    
    return sorted;
}

async function createOrder(orderData) {
    try {
        const response = await fetch('tables/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create order');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

// ========== EXPORT FUNCTIONS (for use in other scripts) ==========
window.cartFunctions = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCart,
    getCartTotal,
    getCartSetsCount,
    getCartPiecesCount
};

window.utilityFunctions = {
    formatCurrency,
    formatDate,
    generateOrderId,
    validateEmail,
    validatePhone,
    showNotification
};

window.apiFunctions = {
    fetchProducts,
    createOrder
};