document.addEventListener('DOMContentLoaded', function() {
    var dropdown = document.getElementById('categoriesDropdown');
    if (dropdown) {
        dropdown.addEventListener('change', function() {
            if (dropdown.value === 'cross') {
                window.location.href = 'crosses.html';
            } else if (dropdown.value === 'easter') {
                window.location.href = 'easter.html';
            } else if (dropdown.value === 'christmas') {
                window.location.href = 'christmas.html';
            } else if (dropdown.value === 'summer') {
                window.location.href = 'summer.html';
            } else if (dropdown.value === 'wreaths') {
                window.location.href = 'wreaths.html';
            } else if (dropdown.value === 'custom') {
                window.location.href = 'customorder.html';
            } else if (dropdown.value === 'religious') {
                window.location.href = 'religious.html';
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

    // Store grid: Add to Cart button logic
    document.querySelectorAll('.add-to-cart-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var product = btn.getAttribute('data-product');
            // Add to cart logic
            var card = btn.closest('.product-card');
            var image = card ? card.querySelector('img')?.getAttribute('src') : '';
            var priceText = card ? card.querySelector('.product-price')?.textContent : '';
            var price = parseFloat(priceText?.replace(/[^0-9.]/g, '') || 0);
            var cart = JSON.parse(localStorage.getItem('cart') || '[]');
            var existing = cart.find(item => item.name === product);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ name: product, image: image, price: price, qty: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Added "' + product + '" to your cart!');
        });
    });

    // Store grid: Add to Favorites button logic
    document.querySelectorAll('.add-to-favorites-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var productName = btn.getAttribute('data-product');
            // Find product card to get image and price
            var card = btn.closest('.product-card');
            var image = card ? card.querySelector('img')?.getAttribute('src') : '';
            var price = card ? card.querySelector('.product-price')?.textContent : '';
            var favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            // Avoid duplicates
            if (!favorites.some(f => f.name === productName)) {
                favorites.push({ name: productName, image: image, price: price });
                localStorage.setItem('favorites', JSON.stringify(favorites));
            }
            alert('Added "' + productName + '" to your favorites!');
        });
    });

    // --- Shopping Cart (Bag) Page Logic ---
    if (document.getElementById('cartContainer')) {
        function renderCart() {
            var cart = JSON.parse(localStorage.getItem('cart') || '[]');
            var cartTable = document.getElementById('cartTable');
            var cartItems = document.getElementById('cartItems');
            var cartEmpty = document.getElementById('cartEmpty');
            var cartSummary = document.getElementById('cartSummary');
            var cartSubtotal = document.getElementById('cartSubtotal');
            var checkoutBtn = document.getElementById('checkoutBtn');
            if (!cart.length) {
                cartTable.style.display = 'none';
                cartEmpty.style.display = '';
                cartSummary.style.display = 'none';
                checkoutBtn.style.display = 'none';
                return;
            }
            cartTable.style.display = '';
            cartEmpty.style.display = 'none';
            cartSummary.style.display = '';
            checkoutBtn.style.display = '';
            cartItems.innerHTML = '';
            var subtotal = 0;
            cart.forEach(function(item, idx) {
                var row = document.createElement('tr');
                row.innerHTML = `
                    <td style="text-align:left;">
                        <div style="display:flex;align-items:center;gap:0.7rem;">
                            ${item.image ? `<img src="${item.image}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #e2c9a0;">` : ''}
                            <span style="font-size:1.05rem;color:#7c5a2a;">${item.name}</span>
                        </div>
                    </td>
                    <td style="text-align:center;">
                        <input type="number" min="1" value="${item.qty}" data-idx="${idx}" class="cart-qty-input" style="width:48px;text-align:center;font-size:1rem;border:1px solid #bfa77a;border-radius:4px;">
                    </td>
                    <td style="text-align:right;color:#b86b36;">$${item.price.toFixed(2)}</td>
                    <td style="text-align:right;color:#7c5a2a;">$${(item.price * item.qty).toFixed(2)}</td>
                    <td style="text-align:right;">
                        <button data-idx="${idx}" class="cart-remove-btn" style="background:none;border:none;color:#b86b36;cursor:pointer;font-size:1.2rem;" title="Remove">&times;</button>
                    </td>
                `;
                cartItems.appendChild(row);
                subtotal += item.price * item.qty;
            });
            cartSubtotal.textContent = '$' + subtotal.toFixed(2);

            // Quantity change
            cartItems.querySelectorAll('.cart-qty-input').forEach(function(input) {
                input.addEventListener('change', function() {
                    var idx = parseInt(input.getAttribute('data-idx'));
                    var val = Math.max(1, parseInt(input.value) || 1);
                    cart[idx].qty = val;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                });
            });
            // Remove item
            cartItems.querySelectorAll('.cart-remove-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(btn.getAttribute('data-idx'));
                    cart.splice(idx, 1);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                });
            });
            // Checkout button
            checkoutBtn.onclick = function() {
                alert('Checkout is not implemented in this demo.');
            };
        }
        renderCart();
    }
});
