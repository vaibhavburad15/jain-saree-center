// ===============================================
// CART PAGE JAVASCRIPT
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeCartPage();
});

function initializeCartPage() {
    displayCart();
}

function displayCart() {
    const cart = window.cartFunctions.getCart();
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartContent.style.display = 'none';
    } else {
        emptyCart.style.display = 'none';
        cartContent.style.display = 'grid';
        
        // Display cart items
        cartItems.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
        
        // Update summary
        updateCartSummary();
        
        // Attach event listeners
        attachCartEventListeners();
    }
}

function createCartItemHTML(item) {
    const totalPieces = item.piecesPerSet * item.quantity;
    const totalPrice = item.pricePerSet * item.quantity;
    
    return `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/120x120?text=No+Image'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-category">${item.category}</p>
                <p class="cart-item-set-info">${item.piecesPerSet} pieces per set • ${totalPieces} total pieces</p>
                <p class="cart-item-price">${window.utilityFunctions.formatCurrency(item.pricePerSet)} per set</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn quantity-decrease" data-product-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity} set${item.quantity > 1 ? 's' : ''}</span>
                    <button class="quantity-btn quantity-increase" data-product-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="cart-item-remove" data-product-id="${item.id}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
}

function attachCartEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const cart = window.cartFunctions.getCart();
            const item = cart.find(i => i.id === productId);
            
            if (item) {
                window.cartFunctions.updateCartQuantity(productId, item.quantity - 1);
                displayCart();
            }
        });
    });
    
    // Quantity increase buttons
    document.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const cart = window.cartFunctions.getCart();
            const item = cart.find(i => i.id === productId);
            
            if (item) {
                window.cartFunctions.updateCartQuantity(productId, item.quantity + 1);
                displayCart();
            }
        });
    });
    
    // Remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const cart = window.cartFunctions.getCart();
            const item = cart.find(i => i.id === productId);
            
            if (item && confirm(`Remove "${item.name}" from cart?`)) {
                window.cartFunctions.removeFromCart(productId);
                window.utilityFunctions.showNotification('Product removed from cart', 'info');
                displayCart();
            }
        });
    });
}

function updateCartSummary() {
    const totalSets = window.cartFunctions.getCartSetsCount();
    const totalPieces = window.cartFunctions.getCartPiecesCount();
    const subtotal = window.cartFunctions.getCartTotal();
    
    document.getElementById('totalSets').textContent = totalSets;
    document.getElementById('totalPieces').textContent = totalPieces;
    document.getElementById('subtotal').textContent = window.utilityFunctions.formatCurrency(subtotal);
}