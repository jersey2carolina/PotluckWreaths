document.addEventListener('DOMContentLoaded', function() {
    var dropdown = document.getElementById('categoriesDropdown');
    if (dropdown) {
        dropdown.addEventListener('change', function() {
            if (dropdown.value === 'wreaths') {
                window.location.href = 'wreaths.html';
            } else if (dropdown.value === 'custom') {
                window.location.href = 'customorder.html';
            }
        });
    }

    // Account menu logic
    var form = document.getElementById('accountForm');
    var accountMenu = document.getElementById('accountMenu');
    var signOutBtn = document.getElementById('signOutBtn');
    var accountLead = document.getElementById('account-lead');
    var signupPrompt = document.getElementById('signupPrompt');
    var showSignUp = document.getElementById('showSignUp');
    var signInBtn = document.getElementById('signInBtn');
    var accountEmailSpan = document.getElementById('accountEmail');
    var isSignUp = false;

    var errorMsg = null;
    if (form) {
        // Add error message element if not present
        errorMsg = document.createElement('div');
        errorMsg.id = 'accountErrorMsg';
        errorMsg.style.color = '#b86b36';
        errorMsg.style.marginTop = '0.7rem';
        errorMsg.style.fontSize = '1rem';
        errorMsg.style.display = 'none';
        form.appendChild(errorMsg);
    }

    function showError(msg) {
        if (errorMsg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = '';
        }
    }
    function clearError() {
        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.style.display = 'none';
        }
    }

    function showMenu(email) {
        if (form) form.style.display = 'none';
        if (signupPrompt) signupPrompt.style.display = 'none';
        if (accountMenu) accountMenu.style.display = '';
        if (accountLead) accountLead.textContent = "Welcome to your account dashboard.";
        if (accountEmailSpan) accountEmailSpan.textContent = email;
    }
    function hideMenu() {
        if (form) form.style.display = '';
        if (signupPrompt) signupPrompt.style.display = '';
        if (accountMenu) accountMenu.style.display = 'none';
        if (accountLead) accountLead.textContent = "Sign in to view your orders, wishlist, and account details.";
        if (accountEmailSpan) accountEmailSpan.textContent = '';
        form.reset();
        clearError();
    }

    // Firebase Auth logic for sign in/up
    if (form && accountMenu && signOutBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            clearError();
            var email = form.email.value;
            var password = form.password.value;
            if (isSignUp) {
                // Sign up with Firebase
                auth.createUserWithEmailAndPassword(email, password)
                    .then(function(userCredential) {
                        showMenu(email);
                    })
                    .catch(function(error) {
                        showError(error.message);
                    });
            } else {
                // Sign in with Firebase
                auth.signInWithEmailAndPassword(email, password)
                    .then(function(userCredential) {
                        showMenu(email);
                    })
                    .catch(function(error) {
                        showError(error.message);
                    });
            }
        });
        signOutBtn.addEventListener('click', function() {
            auth.signOut().then(function() {
                hideMenu();
            });
        });
    }

    // Toggle between sign in and sign up (UI only)
    if (showSignUp && signInBtn && form) {
        showSignUp.addEventListener('click', function(e) {
            e.preventDefault();
            isSignUp = !isSignUp;
            clearError();
            if (isSignUp) {
                signInBtn.textContent = "Sign Up";
                showSignUp.textContent = "Back to Sign In";
                accountLead.textContent = "Create an account to track orders and save favorites.";
            } else {
                signInBtn.textContent = "Sign In";
                showSignUp.textContent = "Sign up";
                accountLead.textContent = "Sign in to view your orders, wishlist, and account details.";
            }
        });
    }

    // Auto-login if already signed in
    if (typeof auth !== "undefined") {
        auth.onAuthStateChanged(function(user) {
            if (user && user.email) {
                showMenu(user.email);
            } else {
                hideMenu();
            }
        });
    }
});
