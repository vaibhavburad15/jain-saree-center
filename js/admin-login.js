// ===============================================
// ADMIN LOGIN JAVASCRIPT
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    checkAdminSession();
    
    // Initialize login form
    initializeLoginForm();
});

function checkAdminSession() {
    const adminSession = sessionStorage.getItem('adminLoggedIn');
    
    if (adminSession === 'true') {
        window.location.href = 'admin-dashboard.html';
    }
}

function initializeLoginForm() {
    const loginForm = document.getElementById('adminLoginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
}

function handleLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const loginError = document.getElementById('loginError');
    const loginErrorMessage = document.getElementById('loginErrorMessage');
    
    // Hide any previous errors
    loginError.style.display = 'none';
    
    // Demo credentials (In production, this would be handled by backend authentication)
    const validUsername = 'admin';
    const validPassword = 'admin123';
    
    if (username === validUsername && password === validPassword) {
        // Set session
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUsername', username);
        
        // Redirect to dashboard
        window.location.href = 'admin-dashboard.html';
    } else {
        // Show error
        loginErrorMessage.textContent = 'Invalid username or password';
        loginError.style.display = 'flex';
    }
}