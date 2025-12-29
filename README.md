# Jain Saree Center - Wholesale E-Commerce Website

![Wholesale Only](https://img.shields.io/badge/Business%20Model-Wholesale%20Only-red)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Responsive](https://img.shields.io/badge/Design-Responsive-blue)

## 🏪 About

**Jain Saree Center** is a professional wholesale e-commerce website based in Malkapur, specializing in premium textile products. The website provides a complete wholesale shopping experience with set-based pricing, admin management, and automated order processing.

### Business Information
- **Shop Name:** Jain Saree Center
- **Location:** Malkapur, Maharashtra, India
- **Business Model:** Wholesale Only (No Retail)
- **Specialty:** Premium textiles and ethnic wear

---

## ✨ Key Features

### 🛍️ Customer Features
- **Wholesale-Only Shopping:** All products sold in sets (4, 5, or 6 pieces per set)
- **Product Categories:** 8 major categories including Sarees, Kurti, Bedsheet, Towel, and more
- **Smart Shopping Cart:** Set-based quantity management with persistent storage
- **Secure Checkout:** Complete order form with validation
- **Order Confirmation:** Automatic order ID generation and confirmation
- **Mobile Responsive:** Fully optimized for all devices

### 🎛️ Admin Features
- **Secure Admin Panel:** Protected login system
- **Product Management:** Add, edit, delete products with images
- **Set Configuration:** Configure pieces per set (4, 5, or 6) for each product
- **Dynamic Pricing:** Set custom prices per set
- **Order Management:** View all customer orders with complete details
- **Dashboard Analytics:** Real-time statistics and recent orders
- **Stock Management:** Track product availability

### 🎨 Design Features
- **Indian Textile Theme:** Rich colors (reds, golds) perfect for textile business
- **Modern UI/UX:** Clean, professional design with smooth animations
- **Category Navigation:** Easy filtering and sorting
- **Product Showcase:** High-quality product cards with images
- **Responsive Layout:** Works seamlessly on desktop, tablet, and mobile

---

## 📁 Project Structure

```
jain-saree-center/
├── index.html              # Homepage with hero section and categories
├── products.html           # Product listing with filters
├── cart.html              # Shopping cart
├── checkout.html          # Checkout and order form
├── about.html             # About the business
├── contact.html           # Contact information and form
├── admin-login.html       # Admin authentication page
├── admin-dashboard.html   # Admin management panel
├── css/
│   └── style.css          # Complete styling (40KB+)
├── js/
│   ├── main.js           # Core functions and cart management
│   ├── products.js       # Product display and filtering
│   ├── cart.js           # Cart page functionality
│   ├── checkout.js       # Checkout and order processing
│   ├── contact.js        # Contact form handling
│   ├── admin-login.js    # Admin authentication
│   └── admin-dashboard.js # Admin panel functionality
└── README.md             # This file
```

---

## 🗄️ Database Schema

### Products Table
| Field | Type | Description |
|-------|------|-------------|
| id | text | Unique product ID (auto-generated) |
| name | text | Product name |
| category | text | Product category (8 options) |
| description | rich_text | Product description |
| piecesPerSet | number | Number of pieces in one set (4, 5, or 6) |
| pricePerSet | number | Price per set in rupees |
| imageUrl | text | Product image URL |
| inStock | bool | Product availability status |

### Orders Table
| Field | Type | Description |
|-------|------|-------------|
| id | text | Unique record ID (auto-generated) |
| orderId | text | Customer-facing order ID (JSC format) |
| customerName | text | Customer full name |
| customerEmail | text | Customer email address |
| customerPhone | text | Customer phone number |
| customerAddress | text | Delivery address |
| customerCity | text | City |
| customerState | text | State |
| customerPincode | text | Pincode (6 digits) |
| customerMessage | rich_text | Additional customer message |
| orderItems | rich_text | JSON string of order items |
| totalSets | number | Total number of sets ordered |
| totalAmount | number | Total order amount in rupees |
| orderStatus | text | Order status (pending/processing/completed/cancelled) |
| orderDate | datetime | Order timestamp |

### Settings Table
| Field | Type | Description |
|-------|------|-------------|
| id | text | Setting ID |
| key | text | Setting key name |
| value | text | Setting value |

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for CDN resources)

### Installation & Deployment

1. **Access the Admin Panel:**
   - Navigate to `/admin-login.html`
   - Use demo credentials:
     - Username: `admin`
     - Password: `admin123`

2. **Configure Products:**
   - Go to Products tab in admin panel
   - Click "Add New Product"
   - Fill in product details:
     - Product name and category
     - Pieces per set (4, 5, or 6)
     - Price per set
     - Product description
     - Image URL
   - Set stock availability

3. **Manage Orders:**
   - View all orders in Orders tab
   - Filter by status
   - View detailed order information
   - Update order status

4. **Update Settings:**
   - Configure business contact information
   - Set notification preferences

---

## 📋 Functional URIs

### Customer-Facing Pages
| Page | URI | Description |
|------|-----|-------------|
| Homepage | `/index.html` | Main landing page with categories |
| Products | `/products.html` | Product listing with filters |
| Products (Filtered) | `/products.html?category={category}` | Filter by category |
| Cart | `/cart.html` | Shopping cart |
| Checkout | `/checkout.html` | Order form and confirmation |
| About | `/about.html` | Business information |
| Contact | `/contact.html` | Contact details and form |

### Admin Pages
| Page | URI | Description |
|------|-----|-------------|
| Admin Login | `/admin-login.html` | Authentication page |
| Admin Dashboard | `/admin-dashboard.html` | Management panel |

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tables/products` | List all products |
| POST | `/tables/products` | Create new product |
| PUT | `/tables/products/{id}` | Update product |
| DELETE | `/tables/products/{id}` | Delete product |
| GET | `/tables/orders` | List all orders |
| POST | `/tables/orders` | Create new order |
| GET | `/tables/orders/{id}` | Get order details |

---

## 💳 Wholesale Pricing System

### How It Works
1. **Set-Based Sales:** All products sold in complete sets only
2. **Variable Set Sizes:** Each product category has different set sizes:
   - 4 pieces per set
   - 5 pieces per set
   - 6 pieces per set
3. **Minimum Order:** 1 set per product (no individual pieces)
4. **Bulk Pricing:** Competitive wholesale rates per set
5. **Quantity Calculation:** Automatically calculates total pieces from sets

### Example Orders
- **2 sets of Sarees** (4 pieces/set) = 8 total pieces
- **3 sets of Kurtis** (5 pieces/set) = 15 total pieces
- **1 set of Towels** (6 pieces/set) = 6 total pieces

---

## 🛒 Shopping Flow

### Customer Journey
1. **Browse Products**
   - View by category
   - Filter and sort
   - See set details and pricing

2. **Add to Cart**
   - Select products
   - Choose number of sets
   - Cart persists in browser

3. **Checkout**
   - Fill customer details
   - Review order summary
   - Place order

4. **Order Confirmation**
   - Receive order ID
   - Email confirmation sent
   - Owner notified

### Order Processing
```
Customer Places Order
    ↓
Order ID Generated (JSC{timestamp}{random})
    ↓
Order Saved to Database
    ↓
Email Sent to Customer (Order Confirmation)
    ↓
Email Sent to Owner (Order Details)
    ↓
SMS Notification to Owner (Optional)
    ↓
Order Appears in Admin Dashboard
```

---

## 🔧 Technical Implementation

### Frontend Technologies
- **HTML5:** Semantic markup
- **CSS3:** Modern styling with custom properties
- **JavaScript (ES6+):** Vanilla JS for functionality
- **Font Awesome 6:** Icon library
- **Google Fonts:** Poppins & Playfair Display

### Data Storage
- **RESTful Table API:** For products, orders, and settings
- **LocalStorage:** Cart persistence
- **SessionStorage:** Admin authentication

### Key Features Implementation
- **Shopping Cart:** LocalStorage-based with CRUD operations
- **Form Validation:** Client-side validation for all forms
- **Responsive Design:** Mobile-first CSS with flexbox/grid
- **Modal System:** Custom modal implementation
- **Real-time Updates:** Dynamic DOM manipulation
- **Admin Authentication:** Session-based login

---

## 🎯 Product Categories

The website supports 8 major textile categories:

1. **Sarees** - Designer & Traditional
2. **Suiting Shirting** - Premium Fabrics
3. **Blouse Piece** - Latest Designs
4. **Petticoat** - Comfort & Quality
5. **Kurti** - Trendy Collection
6. **Towel** - Soft & Absorbent
7. **Bedsheet** - Comfort Living
8. **Pillow Cover** - Designer Range

---

## 📧 Notification System

### Order Notifications (Conceptual)
When a customer places an order:

**To Owner:**
- Email with complete order details
- Customer contact information
- Order items and total amount
- Delivery address
- SMS alert (optional)

**To Customer:**
- Order confirmation email
- Order ID for reference
- Order summary
- Contact information for queries
- Expected follow-up timeline

**Note:** The current implementation logs notifications to console. For production, integrate with:
- **Email:** SendGrid, Mailgun, AWS SES
- **SMS:** Twilio, MSG91, SMS Gateway

---

## 🔐 Admin Access

### Default Credentials
```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT:** Change these credentials in production!

### Admin Capabilities
- ✅ Add/Edit/Delete products
- ✅ View all orders
- ✅ Filter orders by status
- ✅ View order details
- ✅ Dashboard analytics
- ✅ Manage settings

---

## 📱 Responsive Design

### Breakpoints
- **Desktop:** 1200px and above
- **Tablet:** 768px - 1023px
- **Mobile:** Below 768px

### Mobile Features
- Hamburger menu navigation
- Touch-friendly buttons
- Optimized images
- Stackable layouts
- Easy form inputs

---

## 🎨 Color Scheme

### Primary Colors
- **Primary Red:** `#C41E3A` - Main brand color
- **Primary Dark:** `#9A1829` - Hover states
- **Secondary Gold:** `#D4AF37` - Accents and badges

### Neutral Colors
- **Dark:** `#1A1A1A` - Text
- **Gray:** `#666666` - Secondary text
- **Light Gray:** `#F5F5F5` - Backgrounds
- **White:** `#FFFFFF` - Cards and sections

### Status Colors
- **Success:** `#28A745` - In stock, success messages
- **Warning:** `#FFC107` - Warnings
- **Danger:** `#DC3545` - Out of stock, errors
- **Info:** `#17A2B8` - Information

---

## 📊 Demo Data

The website comes with 12 pre-loaded demo products:
- **Sarees:** Banarasi Silk, Cotton Printed, Chanderi Silk
- **Suiting Shirting:** Premium Suiting, Linen Shirting
- **Blouse Piece:** Designer Blouse Pieces
- **Petticoat:** Cotton Petticoats
- **Kurti:** Embroidered and Printed Collections
- **Towel:** Turkish Bath Towels
- **Bedsheet:** Cotton Bedsheet Sets
- **Pillow Cover:** Designer Pillow Covers

---

## ✅ Completed Features

### Phase 1 - Core Features ✅
- [x] Homepage with hero section
- [x] Product catalog with 8 categories
- [x] Product filtering and sorting
- [x] Shopping cart with set-based quantities
- [x] Checkout system with validation
- [x] Order management
- [x] About and Contact pages

### Phase 2 - Admin Panel ✅
- [x] Admin authentication
- [x] Product management (CRUD)
- [x] Order viewing and management
- [x] Dashboard with statistics
- [x] Settings configuration

### Phase 3 - Polish ✅
- [x] Mobile responsive design
- [x] Indian textile theme styling
- [x] Smooth animations
- [x] Form validation
- [x] Error handling
- [x] User notifications

---

## 🔜 Recommended Next Steps

### Future Enhancements

1. **Backend Integration**
   - [ ] Implement server-side authentication
   - [ ] Set up email service (SendGrid/Mailgun)
   - [ ] Configure SMS gateway (Twilio)
   - [ ] Add payment gateway integration
   - [ ] Implement file upload for product images

2. **Advanced Features**
   - [ ] Customer accounts and order history
   - [ ] Wishlist functionality
   - [ ] Product reviews and ratings
   - [ ] Advanced search with filters
   - [ ] Bulk order requests
   - [ ] Invoice generation (PDF)

3. **Business Features**
   - [ ] Discount and coupon system
   - [ ] Minimum order value enforcement
   - [ ] Shipping cost calculator
   - [ ] GST calculation
   - [ ] Credit terms for regular customers

4. **Analytics & Reporting**
   - [ ] Sales reports
   - [ ] Popular products tracking
   - [ ] Customer analytics
   - [ ] Inventory management
   - [ ] Revenue forecasting

5. **Marketing Features**
   - [ ] Newsletter subscription
   - [ ] WhatsApp integration
   - [ ] Social media sharing
   - [ ] SEO optimization
   - [ ] Blog section

---

## 🐛 Known Limitations

1. **Static Notification System:** Email and SMS notifications are currently logged to console. Requires backend integration for production.
2. **Client-Side Auth:** Admin authentication is session-based. Implement server-side auth for production.
3. **Image Hosting:** Product images use URLs. Consider implementing image upload and hosting.
4. **Payment Integration:** No payment gateway integrated. Manual payment confirmation required.

---

## 🤝 Support & Contact

### For Website Issues
- Check browser console for errors
- Ensure JavaScript is enabled
- Clear cache and reload page
- Verify internet connection for CDN resources

### Business Inquiries
- **Location:** Malkapur, Maharashtra
- **Phone:** +91 XXXXX-XXXXX
- **Email:** info@jainsareecenter.com

---

## 📄 License

This website is created for Jain Saree Center, Malkapur. All rights reserved.

---

## 🙏 Acknowledgments

- **Font Awesome:** Icon library
- **Google Fonts:** Typography
- **Unsplash:** Demo product images
- **Design Inspiration:** Traditional Indian textile aesthetics

---

## 📝 Version History

### Version 1.0 (Current)
- ✅ Complete wholesale e-commerce platform
- ✅ Admin panel with full management
- ✅ Set-based wholesale pricing system
- ✅ Mobile responsive design
- ✅ Order management system
- ✅ 12 demo products across 8 categories

---

## 🎯 Quick Start Checklist

- [ ] Access admin panel at `/admin-login.html`
- [ ] Login with demo credentials (admin/admin123)
- [ ] Add your products with correct set sizes
- [ ] Update business contact information in settings
- [ ] Test the complete shopping flow
- [ ] Review all orders in admin dashboard
- [ ] Customize colors and branding if needed
- [ ] Deploy to your hosting platform
- [ ] Update README with your actual contact details

---

**Built with ❤️ for Jain Saree Center - Your Trusted Wholesale Textile Partner**

---

*Last Updated: 2024*