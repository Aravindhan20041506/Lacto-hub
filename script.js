// LACTO HUB - Main JavaScript File

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('LACTO HUB - Premium Dairy Website Loaded');
    
    // Initialize cart count display
    updateCartCount();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize animations
    initAnimations();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
});

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Add animation when count changes
        if (totalItems > 0) {
            cartCount.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                cartCount.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
        }
    }
}

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('lactohub_cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('lactohub_cart', JSON.stringify(cart));
    updateCartCount();
}

// Add item to cart
function addToCart(id, name, price) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: parseFloat(price),
            quantity: 1
        });
    }
    
    saveCart(cart);
    showNotification(`${name} added to cart!`, 'success');
}

// Remove item from cart
function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    showNotification('Item removed from cart', 'info');
}

// Update item quantity in cart
function updateCartItemQuantity(id, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === id);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(id);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
    }
}

// Calculate cart total
function calculateCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} notification`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Initialize smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize animations
function initAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification {
            animation: slideInRight 0.3s ease-out;
        }
        
        .fade-in {
            animation: fadeInUp 0.6s ease-out;
        }
        
        .scale-in {
            animation: scaleIn 0.3s ease-out;
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.highlight-card, .contact-card, .product-card, .delivery-time-card').forEach(el => {
        observer.observe(el);
    });
}

// Initialize navbar scroll effect
function initNavbarScroll() {
    const navbar = document.querySelector('.luxury-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `LH${timestamp}${randomStr}`.toUpperCase();
}

// Validate form data
function validateForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone)) {
        errors.push('Please enter a valid 10-digit phone number');
    }
    
    if (!formData.address || formData.address.trim().length < 10) {
        errors.push('Address must be at least 10 characters long');
    }
    
    if (!formData.landmark || formData.landmark.trim().length < 3) {
        errors.push('Landmark must be at least 3 characters long');
    }
    
    if (!formData.deliveryTime) {
        errors.push('Please select a delivery time');
    }
    
    if (!formData.paymentMethod) {
        errors.push('Please select a payment method');
    }
    
    return errors;
}

// Save order to localStorage
function saveOrder(orderData) {
    const orders = getOrders();
    orders.push(orderData);
    localStorage.setItem('lactohub_orders', JSON.stringify(orders));
}

// Get orders from localStorage
function getOrders() {
    const orders = localStorage.getItem('lactohub_orders');
    return orders ? JSON.parse(orders) : [];
}

// Clear cart
function clearCart() {
    localStorage.removeItem('lactohub_cart');
    updateCartCount();
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export orders to CSV
function exportOrdersToCSV() {
    const orders = getOrders();
    if (orders.length === 0) {
        showNotification('No orders to export', 'info');
        return;
    }
    
    const headers = ['Order ID', 'Customer Name', 'Phone', 'Address', 'Items', 'Total', 'Payment Method', 'Delivery Time', 'Status', 'Date'];
    const csvContent = [
        headers.join(','),
        ...orders.map(order => [
            order.orderId,
            `"${order.customerInfo.name}"`,
            order.customerInfo.phone,
            `"${order.deliveryInfo.address}"`,
            `"${order.items.map(item => `${item.name} (${item.quantity})`).join('; ')}"`,
            order.total,
            order.paymentMethod,
            order.deliveryInfo.deliveryTime,
            order.status,
            formatDate(order.orderDate)
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lactohub_orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Orders exported successfully', 'success');
}

// Initialize tooltips and popovers (if using Bootstrap)
function initBootstrapComponents() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

// Call bootstrap initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initBootstrapComponents);

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Application Error:', e.error);
    showNotification('An unexpected error occurred. Please try again.', 'error');
});

// Service worker registration (for future PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker can be registered here in the future
        console.log('Service Worker support detected');
    });
}