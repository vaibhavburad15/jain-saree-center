# 🚀 Quick Start Guide - Jain Saree Center

## Welcome! 👋

This guide will help you get started with your new wholesale e-commerce website in just a few minutes.

---

## 📋 Step-by-Step Setup

### Step 1: Access Your Website
Open your browser and navigate to:
- **Homepage:** `index.html`
- You'll see the beautiful homepage with categories and features

### Step 2: Admin Login 🔐
1. Click on **"Admin Login"** in the footer or go to `admin-login.html`
2. Enter credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Click **Login**

### Step 3: Add Your Products 📦
1. In the admin dashboard, click **"Products"** in the sidebar
2. Click **"Add New Product"** button
3. Fill in the product details:
   - **Product Name:** e.g., "Designer Silk Saree"
   - **Category:** Select from dropdown (Sarees, Kurti, etc.)
   - **Pieces per Set:** Choose 4, 5, or 6
   - **Price per Set:** Enter wholesale price in rupees
   - **Description:** Write product details
   - **Image URL:** Paste image link (e.g., from Unsplash)
   - **In Stock:** Check if available
4. Click **"Save Product"**

### Step 4: Manage Products 📝
- **Edit Product:** Click "Edit" button on any product
- **Delete Product:** Click "Delete" button (with confirmation)
- **View All:** See all products in the table

### Step 5: Test Customer Experience 🛍️
1. Go back to homepage (`index.html`)
2. Click **"Browse Products"** or any category
3. Add products to cart
4. Go to cart and adjust quantities (sets)
5. Proceed to checkout
6. Fill in customer details
7. Place order

### Step 6: View Orders 📊
1. Go back to admin dashboard
2. Click **"Orders"** in the sidebar
3. See all customer orders
4. Click **"View"** to see order details
5. Filter by status if needed

---

## 🎨 Customization Tips

### Update Business Information
1. In admin dashboard, go to **"Settings"**
2. Update:
   - Phone number
   - Email address
   - Owner notification details

### Change Colors
Edit `css/style.css` and modify these variables:
```css
:root {
    --primary-color: #C41E3A;  /* Main red color */
    --secondary-color: #D4AF37; /* Gold accent */
}
```

### Add Your Logo
Replace the text logo in the navbar with your image:
```html
<div class="logo">
    <img src="your-logo.png" alt="Jain Saree Center">
</div>
```

---

## 📱 Test on Mobile

1. Open browser DevTools (F12)
2. Click the mobile icon (responsive view)
3. Test different screen sizes
4. Check menu, cart, and checkout

---

## ✅ Pre-Launch Checklist

Before going live, make sure to:

- [ ] Add all your products
- [ ] Update contact information
- [ ] Test complete shopping flow
- [ ] Test on mobile devices
- [ ] Change admin password (in production)
- [ ] Add your actual business images
- [ ] Update "Wholesale Only" badge if needed
- [ ] Test all forms (contact, checkout)
- [ ] Review About page content
- [ ] Update Google Maps location on Contact page

---

## 🆘 Troubleshooting

### Products Not Showing?
- Check if products are added in admin panel
- Ensure "In Stock" is checked
- Clear browser cache and refresh

### Cart Not Working?
- Check if JavaScript is enabled
- Look at browser console for errors (F12)
- Clear localStorage and try again

### Can't Login to Admin?
- Use exact credentials: `admin` / `admin123`
- Check for caps lock
- Try clearing browser cache

### Images Not Loading?
- Verify image URLs are correct
- Check internet connection
- Use HTTPS URLs for images

---

## 📞 Need Help?

### Demo Data
The website comes with 12 sample products. You can:
- Keep them as examples
- Edit them to match your products
- Delete them and add your own

### Important Files
- **Main CSS:** `css/style.css`
- **Main JS:** `js/main.js`
- **Products JS:** `js/products.js`
- **Admin JS:** `js/admin-dashboard.js`

---

## 🎯 Common Tasks

### How to Change Homepage Hero Text?
Edit `index.html` around line 50-60:
```html
<h1 class="hero-title">Your Custom Title</h1>
<p class="hero-subtitle">Your Tagline</p>
```

### How to Add More Categories?
1. Edit the category dropdown in `admin-dashboard.html`
2. Add new category card in `index.html`
3. Update filter in `products.html`

### How to Change Pieces Per Set Options?
Edit `admin-dashboard.html` around line 140:
```html
<option value="4">4 Pieces</option>
<option value="5">5 Pieces</option>
<option value="6">6 Pieces</option>
<option value="8">8 Pieces</option> <!-- New option -->
```

---

## 🌟 Pro Tips

1. **Use High-Quality Images:** Product images should be at least 500x500px
2. **Write Clear Descriptions:** Help customers understand the product
3. **Update Regularly:** Keep adding new products
4. **Monitor Orders:** Check admin dashboard daily
5. **Respond Quickly:** Contact customers who place orders
6. **Take Backups:** Save your product data regularly

---

## 🎉 You're All Set!

Your wholesale e-commerce website is ready to use. Start by:
1. Adding your products
2. Testing the complete flow
3. Sharing with potential customers

For detailed information, check the main `README.md` file.

---

**Happy Selling! 🛍️**

*Jain Saree Center - Quality Wholesale Textiles*