// ===============================================
// PRODUCTS PAGE JAVASCRIPT (FIXED)
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
});

let allProducts = [];
let currentFilters = {
    category: '',
    sort: 'newest'
};

async function initializeProductsPage() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        currentFilters.category = categoryParam;
        document.getElementById('categoryFilter').value = categoryParam;
    }
    
    // Initialize filters
    initializeFilters();
    
    // Load products
    await loadProducts();
}

function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const resetFilter = document.getElementById('resetFilter');
    
    categoryFilter.addEventListener('change', function() {
        currentFilters.category = this.value;
        displayProducts();
    });
    
    sortFilter.addEventListener('change', function() {
        currentFilters.sort = this.value;
        displayProducts();
    });
    
    resetFilter.addEventListener('click', function() {
        currentFilters.category = '';
        currentFilters.sort = 'newest';
        categoryFilter.value = '';
        sortFilter.value = 'newest';
        
        // Update URL
        window.history.pushState({}, '', 'products.html');
        
        displayProducts();
    });
}

async function loadProducts() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const productsGrid = document.getElementById('productsGrid');
    
    loadingSpinner.style.display = 'block';
    productsGrid.innerHTML = '';
    
    try {
        // Load products from localStorage
        const productsData = localStorage.getItem('jsc_products');
        
        if (productsData) {
            allProducts = JSON.parse(productsData);
        } else {
            // Initialize with sample products if none exist
            allProducts = initializeSampleProducts();
        }
        
        console.log('Loaded products:', allProducts); // Debug
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showNoProducts('Error loading products. Please try again.');
    } finally {
        loadingSpinner.style.display = 'none';
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
        },
        {
            id: 'prod_004',
            name: 'Designer Blouse Piece',
            category: 'Blouse Piece',
            piecesPerSet: 6,
            pricePerSet: 1200,
            description: 'Trendy blouse pieces with latest designs',
            imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
            inStock: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'prod_005',
            name: 'Cotton Petticoat',
            category: 'Petticoat',
            piecesPerSet: 5,
            pricePerSet: 800,
            description: 'Comfortable cotton petticoat for daily use',
            imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
            inStock: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'prod_006',
            name: 'Luxury Bath Towel',
            category: 'Towel',
            piecesPerSet: 4,
            pricePerSet: 1000,
            description: 'Soft and absorbent bath towels',
            imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400',
            inStock: true,
            created_at: new Date().toISOString()
        }
    ];
    
    // Save to localStorage
    localStorage.setItem('jsc_products', JSON.stringify(sampleProducts));
    return sampleProducts;
}

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const productsCount = document.getElementById('productsCount');
    const noProducts = document.getElementById('noProducts');
    
    // Filter products
    let filteredProducts = [...allProducts];
    
    if (currentFilters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === currentFilters.category);
    }
    
    // Sort products
    filteredProducts = sortProductsLocal(filteredProducts, currentFilters.sort);
    
    // Update count
    productsCount.textContent = `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;
    
    // Display products
    if (filteredProducts.length === 0) {
        productsGrid.style.display = 'none';
        noProducts.style.display = 'block';
    } else {
        productsGrid.style.display = 'grid';
        noProducts.style.display = 'none';
        
        productsGrid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
        
        // Add event listeners to add-to-cart buttons
        attachCartButtonListeners();
    }
}

function sortProductsLocal(products, sortBy) {
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

function createProductCard(product) {
    const inStock = product.inStock;
    const stockBadge = inStock 
        ? `<span class="product-badge">${product.piecesPerSet} Pieces/Set</span>`
        : `<span class="product-badge out-of-stock-badge">Out of Stock</span>`;
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
                ${stockBadge}
            </div>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-set-info">
                    <span class="set-quantity">${product.piecesPerSet} pieces per set</span>
                    <span class="product-price">${window.utilityFunctions.formatCurrency(product.pricePerSet)}</span>
                </div>
                <div class="product-actions">
                    <button class="btn-add-to-cart" data-product-id="${product.id}" ${!inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> ${inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function attachCartButtonListeners() {
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = allProducts.find(p => p.id === productId);
            
            if (product && product.inStock) {
                window.cartFunctions.addToCart(product, 1);
            }
        });
    });
}

function showNoProducts(message = 'No products found') {
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    
    productsGrid.style.display = 'none';
    noProducts.style.display = 'block';
    
    const noProductsP = noProducts.querySelector('p');
    if (noProductsP) {
        noProductsP.textContent = message;
    }
}