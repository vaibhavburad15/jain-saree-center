# 📧 Email & SMS Notification Setup Guide

## Overview

Currently, the website logs notifications to the browser console. To enable actual email and SMS notifications, you need to integrate with third-party services. This guide explains how to implement production-ready notifications.

---

## 🎯 What Gets Notified

### When Customer Places Order:

**To Business Owner:**
- Order ID and timestamp
- Customer name, email, phone
- Delivery address
- Complete order details (items, sets, pieces)
- Total amount
- Customer message (if any)

**To Customer:**
- Order confirmation
- Order ID for reference
- Order summary
- Business contact information
- Thank you message

---

## 📧 Email Integration Options

### Option 1: SendGrid (Recommended)

**Why SendGrid?**
- Free tier: 100 emails/day
- Easy API integration
- High deliverability
- Email templates support

**Setup Steps:**

1. **Create SendGrid Account**
   - Go to https://sendgrid.com
   - Sign up for free account
   - Verify your email

2. **Get API Key**
   - Go to Settings → API Keys
   - Create new API key
   - Copy and save securely

3. **Integration Code**

Add to `js/checkout.js` in the `sendOrderNotifications` function:

```javascript
async function sendOrderNotifications(orderData) {
    const SENDGRID_API_KEY = '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';
    
    // Email to Owner
    await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            personalizations: [{
                to: [{ email: 'Buradvaibhav5@gmail.com' }],
                subject: `New Wholesale Order - ${orderData.orderId}`
            }],
            from: { email: 'noreply@jainsareecenter.com' },
            content: [{
                type: 'text/html',
                value: generateOwnerEmailHTML(orderData)
            }]
        })
    });
    
    // Email to Customer
    await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            personalizations: [{
                to: [{ email: orderData.customerEmail }],
                subject: `Order Confirmation - ${orderData.orderId}`
            }],
            from: { email: 'noreply@jainsareecenter.com' },
            content: [{
                type: 'text/html',
                value: generateCustomerEmailHTML(orderData)
            }]
        })
    });
}

function generateOwnerEmailHTML(orderData) {
    const cart = JSON.parse(orderData.orderItems);
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #C41E3A;">New Wholesale Order Received</h2>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Date:</strong> ${new Date(orderData.orderDate).toLocaleString()}</p>
            
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${orderData.customerName}</p>
            <p><strong>Email:</strong> ${orderData.customerEmail}</p>
            <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
            <p><strong>Address:</strong> ${orderData.customerAddress}, ${orderData.customerCity}, ${orderData.customerState} - ${orderData.customerPincode}</p>
            ${orderData.customerMessage ? `<p><strong>Message:</strong> ${orderData.customerMessage}</p>` : ''}
            
            <h3>Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Product</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Sets</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Price/Set</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map(item => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${item.name} (${item.piecesPerSet} pcs/set)</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">₹${item.pricePerSet}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">₹${item.pricePerSet * item.quantity}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h3 style="color: #C41E3A;">Total Amount: ₹${orderData.totalAmount}</h3>
            <p>Total Sets: ${orderData.totalSets}</p>
        </div>
    `;
}

function generateCustomerEmailHTML(orderData) {
    const cart = JSON.parse(orderData.orderItems);
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #C41E3A;">Thank You for Your Order!</h2>
            <p>Dear ${orderData.customerName},</p>
            <p>Your wholesale order has been received successfully.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Order ID:</strong> ${orderData.orderId}</p>
                <p style="margin: 0;"><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleString()}</p>
            </div>
            
            <h3>Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Sets</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map(item => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">₹${item.pricePerSet * item.quantity}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h3 style="color: #C41E3A;">Total: ₹${orderData.totalAmount}</h3>
            
            <p>Our team will contact you within 24 hours to confirm your order and arrange delivery.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
                <h4>Contact Us</h4>
                <p style="margin: 5px 0;">📍 Jain Saree Center, Malkapur</p>
                <p style="margin: 5px 0;">📞 +91 XXXXX-XXXXX</p>
                <p style="margin: 5px 0;">📧 info@jainsareecenter.com</p>
            </div>
            
            <p>Thank you for choosing Jain Saree Center!</p>
        </div>
    `;
}
```

### Option 2: Mailgun

**Setup:**
1. Sign up at https://www.mailgun.com
2. Verify domain or use sandbox domain
3. Get API key from Settings
4. Use similar integration as SendGrid

### Option 3: EmailJS (Frontend-Only)

**Pros:** No backend required
**Cons:** API keys exposed in frontend

```javascript
// Add EmailJS SDK to checkout.html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>

// Initialize in checkout.js
emailjs.init('YOUR_PUBLIC_KEY');

// Send email
emailjs.send('service_id', 'template_id', {
    to_email: 'owner@jainsareecenter.com',
    order_id: orderData.orderId,
    customer_name: orderData.customerName,
    // ... other variables
});
```

---

## 📱 SMS Integration Options

### Option 1: Twilio (Recommended)

**Why Twilio?**
- Reliable global coverage
- Pay-as-you-go pricing
- Simple API
- Good documentation

**Setup Steps:**

1. **Create Twilio Account**
   - Go to https://www.twilio.com
   - Sign up and verify phone
   - Get free credits

2. **Get Credentials**
   - Account SID
   - Auth Token
   - Twilio phone number

3. **Integration Code**

Add to `js/checkout.js`:

```javascript
async function sendSMSNotification(orderData) {
    const TWILIO_ACCOUNT_SID = 'YOUR_ACCOUNT_SID';
    const TWILIO_AUTH_TOKEN = 'YOUR_AUTH_TOKEN';
    const TWILIO_PHONE = '+1234567890'; // Your Twilio number
    const OWNER_PHONE = '+91XXXXXXXXXX'; // Owner's number
    
    const message = `New Order: ${orderData.orderId}\nCustomer: ${orderData.customerName}\nAmount: ₹${orderData.totalAmount}\nPhone: ${orderData.customerPhone}`;
    
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            To: OWNER_PHONE,
            From: TWILIO_PHONE,
            Body: message
        })
    });
}
```

### Option 2: MSG91 (For India)

**Better for Indian numbers:**
- Lower costs in India
- Good local support
- Easy integration

```javascript
async function sendSMSNotification(orderData) {
    const MSG91_AUTH_KEY = 'YOUR_AUTH_KEY';
    const MSG91_SENDER_ID = 'TXTIND'; // Your sender ID
    const OWNER_PHONE = '91XXXXXXXXXX'; // Without +
    
    const message = `New Order ${orderData.orderId} from ${orderData.customerName}. Amount: Rs.${orderData.totalAmount}`;
    
    await fetch(`https://api.msg91.com/api/v5/flow/`, {
        method: 'POST',
        headers: {
            'authkey': MSG91_AUTH_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sender: MSG91_SENDER_ID,
            short_url: '0',
            mobiles: OWNER_PHONE,
            message: message
        })
    });
}
```

---

## 🔒 Security Best Practices

### 1. Never Expose API Keys in Frontend

**❌ Bad:**
```javascript
const API_KEY = 'sk_live_xxx'; // Visible in browser
```

**✅ Good:**
Create a backend endpoint:
```javascript
// Backend (Node.js/Express)
app.post('/api/send-notification', async (req, res) => {
    const API_KEY = process.env.SENDGRID_API_KEY; // From environment variable
    // Send notification
});

// Frontend
await fetch('/api/send-notification', {
    method: 'POST',
    body: JSON.stringify(orderData)
});
```

### 2. Use Environment Variables

Create `.env` file:
```
SENDGRID_API_KEY=SG.xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
OWNER_EMAIL=owner@jainsareecenter.com
OWNER_PHONE=+91XXXXXXXXXX
```

### 3. Validate Data

Always validate before sending:
```javascript
function validateOrderData(data) {
    if (!data.customerEmail || !validateEmail(data.customerEmail)) {
        throw new Error('Invalid email');
    }
    if (!data.customerPhone || !validatePhone(data.customerPhone)) {
        throw new Error('Invalid phone');
    }
    // ... more validation
}
```

---

## 🧪 Testing

### Test Email Sending

1. **Use Test Mode:** Most services have test/sandbox mode
2. **Send to Yourself:** Test with your own email first
3. **Check Spam Folder:** Ensure emails aren't marked as spam
4. **Test Templates:** Verify HTML renders correctly

### Test SMS Sending

1. **Use Test Numbers:** Twilio provides test credentials
2. **Check Character Limits:** SMS has 160 character limit
3. **Test Special Characters:** Verify emojis and symbols work
4. **Check Delivery Status:** Use service dashboards

---

## 💰 Cost Estimates

### SendGrid
- **Free:** 100 emails/day forever
- **Essential:** $19.95/month (50,000 emails)
- **Pro:** $89.95/month (100,000 emails)

### Twilio SMS (India)
- **Cost:** ~₹0.50 per SMS
- **100 orders/month:** ~₹50/month
- **500 orders/month:** ~₹250/month

### MSG91 (India)
- **Promotional:** ₹0.15 per SMS
- **Transactional:** ₹0.25 per SMS
- More economical for India

---

## 📝 Implementation Checklist

- [ ] Choose email service provider
- [ ] Create account and get API keys
- [ ] Set up email templates
- [ ] Implement sendOrderNotifications function
- [ ] Test with sample order
- [ ] Verify owner receives email
- [ ] Verify customer receives confirmation
- [ ] Choose SMS service provider
- [ ] Get SMS API credentials
- [ ] Implement SMS function
- [ ] Test SMS delivery
- [ ] Secure API keys in environment variables
- [ ] Set up error handling and logging
- [ ] Monitor delivery rates
- [ ] Set up backup notification method

---

## 🆘 Troubleshooting

### Emails Not Sending
- Check API key is correct
- Verify sender email is verified
- Check spam folder
- Review service dashboard for errors
- Ensure JSON payload is correct

### SMS Not Delivering
- Verify phone number format
- Check account balance
- Ensure number isn't blocked
- Verify sender ID is approved
- Check message length

### CORS Errors
- Use backend proxy for API calls
- Don't call APIs directly from browser
- Set up proper CORS headers on backend

---

## 📚 Additional Resources

### Documentation
- [SendGrid Docs](https://docs.sendgrid.com)
- [Twilio SMS Docs](https://www.twilio.com/docs/sms)
- [Mailgun Docs](https://documentation.mailgun.com)
- [MSG91 Docs](https://docs.msg91.com)

### Templates
- [Email Templates](https://github.com/leemunroe/responsive-html-email-template)
- [Transactional Emails](https://github.com/mailchimp/email-blueprints)

---

## 🎯 Quick Win: EmailJS Setup (5 minutes)

For quick testing without backend:

1. Go to https://www.emailjs.com
2. Sign up (free plan: 200 emails/month)
3. Add email service (Gmail, Outlook, etc.)
4. Create email template
5. Get Public Key, Service ID, Template ID
6. Add to your code - Done!

**Note:** For production, use backend implementation for security.

---

**Need help? Check the main README.md or contact support.**