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
async function fetchProducts(filters = {}) {
    try {
        let url = '/api/products?limit=100';

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
