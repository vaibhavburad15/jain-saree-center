// ===============================================
// CONTACT PAGE JAVASCRIPT
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
});

function initializeContactPage() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactFormSubmit();
        });
    }
}

function handleContactFormSubmit() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validate form
    if (!name || !email || !phone || !subject || !message) {
        window.utilityFunctions.showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!window.utilityFunctions.validateEmail(email)) {
        window.utilityFunctions.showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // In a real application, this would send the message to the backend
    console.log('Contact Form Submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Subject:', subject);
    console.log('Message:', message);
    
    // Show success message
    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
    
    // Reset form after 3 seconds
    setTimeout(() => {
        document.getElementById('contactForm').reset();
        document.getElementById('contactForm').style.display = 'block';
        document.getElementById('formSuccess').style.display = 'none';
    }, 3000);
}