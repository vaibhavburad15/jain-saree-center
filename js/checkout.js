// ===============================================
// CHECKOUT PAGE JAVASCRIPT (FIXED)
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeCheckoutPage();
});

function initializeCheckoutPage() {
    const cart = window.cartFunctions.getCart();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'products.html';
        return;
    }
    
    displayOrderSummary();
    initializeCheckoutForm();
}

function displayOrderSummary() {
    const cart = window.cartFunctions.getCart();
    const orderItems = document.getElementById('orderItems');
    
    orderItems.innerHTML = cart.map(item => createOrderItemHTML(item)).join('');
    updateOrderTotals();
}

function createOrderItemHTML(item) {
    const totalPieces = item.piecesPerSet * item.quantity;
    const totalPrice = item.pricePerSet * item.quantity;
    
    return `
        <div class="order-item">
            <div class="order-item-details">
                <h4>${item.name}</h4>
                <p>${item.quantity} set${item.quantity > 1 ? 's' : ''} × ${item.piecesPerSet} pieces = ${totalPieces} pieces</p>
            </div>
            <div class="order-item-price">
                <p>${window.utilityFunctions.formatCurrency(totalPrice)}</p>
                <span>${window.utilityFunctions.formatCurrency(item.pricePerSet)} per set</span>
            </div>
        </div>
    `;
}

function updateOrderTotals() {
    const totalSets = window.cartFunctions.getCartSetsCount();
    const totalPieces = window.cartFunctions.getCartPiecesCount();
    const grandTotal = window.cartFunctions.getCartTotal();
    
    document.getElementById('orderTotalSets').textContent = totalSets;
    document.getElementById('orderTotalPieces').textContent = totalPieces;
    document.getElementById('orderGrandTotal').textContent = window.utilityFunctions.formatCurrency(grandTotal);
}

function initializeCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateCheckoutForm()) {
            return;
        }
        
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        try {
            await processOrder();
        } catch (error) {
            console.error('Error processing order:', error);
            window.utilityFunctions.showNotification('Error placing order. Please try again.', 'error');
            
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = '<i class="fas fa-check-circle"></i> Place Order';
        }
    });
}

function validateCheckoutForm() {
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const city = document.getElementById('customerCity').value.trim();
    const state = document.getElementById('customerState').value.trim();
    const pincode = document.getElementById('customerPincode').value.trim();
    
    if (!name) {
        window.utilityFunctions.showNotification('Please enter your name', 'error');
        return false;
    }
    
    if (!window.utilityFunctions.validateEmail(email)) {
        window.utilityFunctions.showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!window.utilityFunctions.validatePhone(phone)) {
        window.utilityFunctions.showNotification('Please enter a valid 10-digit phone number', 'error');
        return false;
    }
    
    if (!address || !city || !state) {
        window.utilityFunctions.showNotification('Please fill in all address fields', 'error');
        return false;
    }
    
    if (!/^[0-9]{6}$/.test(pincode)) {
        window.utilityFunctions.showNotification('Please enter a valid 6-digit pincode', 'error');
        return false;
    }
    
    return true;
}

async function processOrder() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    const customerCity = document.getElementById('customerCity').value.trim();
    const customerState = document.getElementById('customerState').value.trim();
    const customerPincode = document.getElementById('customerPincode').value.trim();
    const customerMessage = document.getElementById('customerMessage').value.trim();
    
    const cart = window.cartFunctions.getCart();
    const orderId = window.utilityFunctions.generateOrderId();
    
    const orderData = {
        orderId: orderId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        customerCity: customerCity,
        customerState: customerState,
        customerPincode: customerPincode,
        customerMessage: customerMessage,
        orderItems: JSON.stringify(cart),
        totalSets: window.cartFunctions.getCartSetsCount(),
        totalAmount: window.cartFunctions.getCartTotal(),
        orderStatus: 'pending',
        orderDate: new Date().toISOString()
    };
    
    try {
        const result = await window.apiFunctions.createOrder(orderData);
        
        // Log order for owner (in console for demo)
        console.log('=== NEW ORDER RECEIVED ===');
        console.log('Order ID:', orderId);
        console.log('Customer:', customerName);
        console.log('Email:', customerEmail);
        console.log('Phone:', customerPhone);
        console.log('Total:', window.utilityFunctions.formatCurrency(orderData.totalAmount));
        console.log('========================');
        
        window.cartFunctions.clearCart();
        showSuccessModal(orderId);
        
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

function showSuccessModal(orderId) {
    const successModal = document.getElementById('successModal');
    const orderIdDisplay = document.getElementById('orderIdDisplay');
    
    orderIdDisplay.textContent = orderId;
    successModal.classList.add('active');
    
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            e.stopPropagation();
        }
    });
}