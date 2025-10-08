// LACTO HUB - Cart Management JavaScript

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
        updateCartSummary();
    }
    
    if (window.location.pathname.includes('products.html')) {
        initProductPage();
    }
    
    if (window.location.pathname.includes('checkout.html')) {
        initCheckoutPage();
    }
});

// Initialize product page
function initProductPage() {
    // Add event listeners to all "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = this.getAttribute('data-price');
            
            // Add loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="spinner"></span> Adding...';
            this.disabled = true;
            
            // Simulate API call delay
            setTimeout(() => {
                addToCart(id, name, price);
                
                // Reset button
                this.innerHTML = originalText;
                this.disabled = false;
                
                // Add success animation
                this.classList.add('scale-in');
                setTimeout(() => {
                    this.classList.remove('scale-in');
                }, 300);
            }, 500);
        });
    });
}

// Load cart items on cart page
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCart');
    const cart = getCart();
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        emptyCartMessage.style.display = 'block';
        return;
    }
    
    cartItemsContainer.style.display = 'block';
    emptyCartMessage.style.display = 'none';
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <div class="cart-item-info">
                        <h5>${item.name}</h5>
                        <p class="text-muted mb-0">Price per unit: ${formatCurrency(item.price)}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="cart-item-price">
                        ${formatCurrency(item.price * item.quantity)}
                    </div>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-outline-danger btn-sm" onclick="removeItem('${item.id}')" title="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update item quantity
function updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
        removeItem(itemId);
        return;
    }
    
    updateCartItemQuantity(itemId, newQuantity);
    loadCartItems();
    updateCartSummary();
    
    // Add animation to updated item
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemElement) {
        itemElement.classList.add('scale-in');
        setTimeout(() => {
            itemElement.classList.remove('scale-in');
        }, 300);
    }
}

// Remove item from cart
function removeItem(itemId) {
    // Add confirmation
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        
        // Add fade out animation
        if (itemElement) {
            itemElement.style.transition = 'all 0.3s ease';
            itemElement.style.transform = 'translateX(-100%)';
            itemElement.style.opacity = '0';
            
            setTimeout(() => {
                removeFromCart(itemId);
                loadCartItems();
                updateCartSummary();
            }, 300);
        } else {
            removeFromCart(itemId);
            loadCartItems();
            updateCartSummary();
        }
    }
}

// Update cart summary
function updateCartSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    const total = calculateCartTotal();
    
    if (subtotalElement) subtotalElement.textContent = formatCurrency(total);
    if (totalElement) totalElement.textContent = formatCurrency(total);
    
    // Disable checkout if cart is empty
    if (checkoutBtn) {
        const cart = getCart();
        if (cart.length === 0) {
            checkoutBtn.classList.add('disabled');
            checkoutBtn.setAttribute('aria-disabled', 'true');
        } else {
            checkoutBtn.classList.remove('disabled');
            checkoutBtn.removeAttribute('aria-disabled');
        }
    }
}

// Initialize checkout page
function initCheckoutPage() {
    loadOrderSummary();
    initOrderForm();
}

// Load order summary on checkout page
function loadOrderSummary() {
    const orderItemsContainer = document.getElementById('orderItems');
    const orderSubtotalElement = document.getElementById('orderSubtotal');
    const orderTotalElement = document.getElementById('orderTotal');
    
    if (!orderItemsContainer) return;
    
    const cart = getCart();
    const total = calculateCartTotal();
    
    // Redirect to cart if empty
    if (cart.length === 0) {
        showNotification('Your cart is empty. Please add items before checkout.', 'info');
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 2000);
        return;
    }
    
    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="order-item mb-2">
            <div class="d-flex justify-content-between">
                <span>${item.name} × ${item.quantity}</span>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
        </div>
    `).join('');
    
    if (orderSubtotalElement) orderSubtotalElement.textContent = formatCurrency(total);
    if (orderTotalElement) orderTotalElement.textContent = formatCurrency(total);
}

// Initialize order form
function initOrderForm() {
    const orderForm = document.getElementById('orderForm');
    if (!orderForm) return;
    
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        processOrder();
    });
    
    // Add real-time validation
    const requiredFields = orderForm.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'tel' && value && !/^[6-9]\d{9}$/.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid 10-digit phone number';
    } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    let errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Process order
function processOrder() {
    const form = document.getElementById('orderForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get form data
    const formData = {
        name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        email: document.getElementById('customerEmail').value.trim(),
        address: document.getElementById('deliveryAddress').value.trim(),
        landmark: document.getElementById('landmark').value.trim(),
        deliveryTime: document.getElementById('deliveryTime').value,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        specialInstructions: document.getElementById('specialInstructions').value.trim()
    };
    
    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Processing Order...';
    submitBtn.disabled = true;
    
    // Simulate order processing
    setTimeout(() => {
        try {
            // Create order object
            const order = {
                orderId: generateOrderId(),
                customerInfo: {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email
                },
                deliveryInfo: {
                    address: formData.address,
                    landmark: formData.landmark,
                    deliveryTime: formData.deliveryTime
                },
                items: getCart(),
                total: calculateCartTotal(),
                paymentMethod: formData.paymentMethod,
                specialInstructions: formData.specialInstructions,
                status: 'pending',
                orderDate: new Date().toISOString()
            };
            
            // Save order
            saveOrder(order);
            
            // Clear cart
            clearCart();
            
            // Show success modal
            showOrderSuccess(order.orderId);
            
            // Reset form
            form.reset();
            
        } catch (error) {
            console.error('Order processing error:', error);
            showNotification('Failed to process order. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 2000);
}

// Show order success modal
function showOrderSuccess(orderId) {
    const modal = document.getElementById('orderSuccessModal');
    const orderIdDisplay = document.getElementById('orderIdDisplay');
    
    if (orderIdDisplay) {
        orderIdDisplay.textContent = orderId;
    }
    
    if (modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Add confetti effect (simple version)
        createConfetti();
    }
}

// Create simple confetti effect
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                z-index: 10000;
                border-radius: 50%;
                pointer-events: none;
                animation: confettiFall 3s linear forwards;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, 3000);
        }, i * 100);
    }
    
    // Add confetti animation CSS
    if (!document.getElementById('confettiStyles')) {
        const style = document.createElement('style');
        style.id = 'confettiStyles';
        style.textContent = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(-100vh) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-save form data (for better UX)
function initAutoSave() {
    const form = document.getElementById('orderForm');
    if (!form) return;
    
    const fields = form.querySelectorAll('input, select, textarea');
    
    // Load saved data
    fields.forEach(field => {
        const savedValue = localStorage.getItem(`form_${field.id}`);
        if (savedValue && field.type !== 'radio') {
            field.value = savedValue;
        } else if (field.type === 'radio' && savedValue === field.value) {
            field.checked = true;
        }
    });
    
    // Save data on input
    fields.forEach(field => {
        field.addEventListener('input', function() {
            if (this.type === 'radio') {
                if (this.checked) {
                    localStorage.setItem(`form_${this.name}`, this.value);
                }
            } else {
                localStorage.setItem(`form_${this.id}`, this.value);
            }
        });
    });
    
    // Clear saved data on successful order
    form.addEventListener('submit', function() {
        fields.forEach(field => {
            localStorage.removeItem(`form_${field.id}`);
            if (field.type === 'radio') {
                localStorage.removeItem(`form_${field.name}`);
            }
        });
    });
}

// Initialize auto-save when checkout page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('checkout.html')) {
        initAutoSave();
    }
});

// Add keyboard shortcuts for cart operations
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to proceed to checkout (on cart page)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && window.location.pathname.includes('cart.html')) {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn && !checkoutBtn.classList.contains('disabled')) {
            checkoutBtn.click();
        }
    }
    
    // Escape to clear cart (with confirmation)
    if (e.key === 'Escape' && window.location.pathname.includes('cart.html')) {
        const cart = getCart();
        if (cart.length > 0 && confirm('Clear entire cart? This action cannot be undone.')) {
            clearCart();
            loadCartItems();
            updateCartSummary();
            showNotification('Cart cleared', 'info');
        }
    }
});

// Add cart persistence across browser sessions
window.addEventListener('beforeunload', function() {
    // Cart is already saved in localStorage, but we can add additional cleanup here
    console.log('Saving cart state before page unload');
});

// Handle online/offline status
window.addEventListener('online', function() {
    showNotification('Connection restored', 'success');
});

window.addEventListener('offline', function() {
    showNotification('You are offline. Orders will be saved locally.', 'warning');
});