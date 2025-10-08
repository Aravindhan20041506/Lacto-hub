// LACTO HUB - Admin Panel JavaScript

// Admin credentials
const ADMIN_CREDENTIALS = {
    id: 'Lactohub2004',
    password: 'LACTOHUB'
};

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin.html')) {
        initAdminPage();
    }
});

// Initialize admin page
function initAdminPage() {
    // Check if already logged in
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    
    if (isLoggedIn === 'true') {
        showAdminDashboard();
    } else {
        showLoginForm();
    }
    
    // Initialize login form
    initLoginForm();
    
    // Initialize dashboard if logged in
    if (isLoggedIn === 'true') {
        initDashboard();
    }
}

// Initialize login form
function initLoginForm() {
    const loginForm = document.getElementById('adminLoginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }
}

// Handle admin login
function handleLogin() {
    const adminId = document.getElementById('adminId').value.trim();
    const adminPassword = document.getElementById('adminPassword').value.trim();
    const loginError = document.getElementById('loginError');
    const submitBtn = document.querySelector('#adminLoginForm button[type="submit"]');
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';
    submitBtn.disabled = true;
    
    // Hide previous errors
    loginError.style.display = 'none';
    
    // Simulate authentication delay
    setTimeout(() => {
        if (adminId === ADMIN_CREDENTIALS.id && adminPassword === ADMIN_CREDENTIALS.password) {
            // Successful login
            sessionStorage.setItem('admin_logged_in', 'true');
            sessionStorage.setItem('admin_login_time', new Date().toISOString());
            
            showNotification('Login successful! Welcome to admin panel.', 'success');
            showAdminDashboard();
            initDashboard();
        } else {
            // Failed login
            loginError.style.display = 'block';
            loginError.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                Invalid credentials. Please check your Admin ID and Password.
            `;
            
            // Add shake animation to form
            const loginCard = document.querySelector('.admin-login-card');
            loginCard.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                loginCard.style.animation = '';
            }, 500);
        }
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Handle admin logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('admin_logged_in');
        sessionStorage.removeItem('admin_login_time');
        
        showNotification('Logged out successfully', 'info');
        showLoginForm();
    }
}

// Show login form
function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (loginForm) loginForm.style.display = 'block';
    if (adminDashboard) adminDashboard.style.display = 'none';
    
    // Clear form
    const form = document.getElementById('adminLoginForm');
    if (form) form.reset();
}

// Show admin dashboard
function showAdminDashboard() {
    const loginForm = document.getElementById('loginForm');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (loginForm) loginForm.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'block';
}

// Initialize dashboard
function initDashboard() {
    loadDashboardStats();
    loadOrdersTable();
    initDashboardEvents();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        if (sessionStorage.getItem('admin_logged_in') === 'true') {
            loadDashboardStats();
            loadOrdersTable();
        }
    }, 30000);
}

// Initialize dashboard events
function initDashboardEvents() {
    const refreshBtn = document.getElementById('refreshOrders');
    const exportBtn = document.getElementById('exportOrders');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.innerHTML = '<span class="spinner"></span> Refreshing...';
            this.disabled = true;
            
            setTimeout(() => {
                loadDashboardStats();
                loadOrdersTable();
                this.innerHTML = '<i class="fas fa-refresh me-1"></i>Refresh';
                this.disabled = false;
                showNotification('Data refreshed', 'success');
            }, 1000);
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportOrdersToCSV();
        });
    }
}

// Load dashboard statistics
function loadDashboardStats() {
    const orders = getOrders();
    const today = new Date().toDateString();
    
    // Calculate stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const todayOrders = orders.filter(order => new Date(order.orderDate).toDateString() === today).length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Update DOM
    updateStatCard('totalOrders', totalOrders);
    updateStatCard('pendingOrders', pendingOrders);
    updateStatCard('todayOrders', todayOrders);
    updateStatCard('totalRevenue', formatCurrency(totalRevenue));
    
    // Add animations
    document.querySelectorAll('.stat-card').forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('scale-in');
            setTimeout(() => {
                card.classList.remove('scale-in');
            }, 300);
        }, index * 100);
    });
}

// Update stat card
function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // Add counting animation for numbers
        if (typeof value === 'number' || (typeof value === 'string' && value.match(/^\d+$/))) {
            animateNumber(element, parseInt(value) || 0);
        } else {
            element.textContent = value;
        }
    }
}

// Animate number counting
function animateNumber(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = Date.now();
    
    function updateNumber() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    updateNumber();
}

// Load orders table
function loadOrdersTable() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const noOrdersMessage = document.getElementById('noOrders');
    const orders = getOrders().sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    if (!ordersTableBody) return;
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = '';
        if (noOrdersMessage) noOrdersMessage.style.display = 'block';
        return;
    }
    
    if (noOrdersMessage) noOrdersMessage.style.display = 'none';
    
    ordersTableBody.innerHTML = orders.map(order => `
        <tr>
            <td>
                <strong>${order.orderId}</strong>
            </td>
            <td>
                <div>
                    <strong>${order.customerInfo.name}</strong>
                    ${order.customerInfo.email ? `<br><small class="text-muted">${order.customerInfo.email}</small>` : ''}
                </div>
            </td>
            <td>
                <a href="tel:${order.customerInfo.phone}" class="text-decoration-none">
                    <i class="fas fa-phone me-1"></i>${order.customerInfo.phone}
                </a>
            </td>
            <td>
                <div class="text-truncate" style="max-width: 200px;" title="${order.deliveryInfo.address}">
                    ${order.deliveryInfo.address}
                    <br><small class="text-muted">Near: ${order.deliveryInfo.landmark}</small>
                </div>
            </td>
            <td>
                <button class="btn btn-outline-primary btn-sm" onclick="showOrderItems('${order.orderId}')">
                    ${order.items.length} item(s)
                </button>
            </td>
            <td>
                <strong class="text-success">${formatCurrency(order.total)}</strong>
            </td>
            <td>
                <span class="badge ${order.paymentMethod === 'cod' ? 'bg-warning' : 'bg-info'}">
                    ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </span>
            </td>
            <td>
                <span class="badge ${order.deliveryInfo.deliveryTime === 'morning' ? 'bg-warning' : 'bg-info'}">
                    ${order.deliveryInfo.deliveryTime === 'morning' ? 'Morning (7-9 AM)' : 'Evening (7-9 PM)'}
                </span>
            </td>
            <td>
                <span class="status-badge status-${order.status}">
                    ${order.status}
                </span>
            </td>
            <td>
                <small>${formatDate(order.orderDate)}</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewOrderDetails('${order.orderId}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-outline-success" onclick="markAsDelivered('${order.orderId}')" title="Mark as Delivered">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-outline-danger" onclick="deleteOrder('${order.orderId}')" title="Delete Order">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Show order items in a tooltip or modal
function showOrderItems(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) return;
    
    const itemsList = order.items.map(item => 
        `• ${item.name} × ${item.quantity} = ${formatCurrency(item.price * item.quantity)}`
    ).join('\n');
    
    alert(`Order Items for ${orderId}:\n\n${itemsList}\n\nTotal: ${formatCurrency(order.total)}`);
}

// View order details in modal
function viewOrderDetails(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) return;
    
    const modal = document.getElementById('orderDetailsModal');
    const modalBody = document.getElementById('orderDetailsBody');
    const markDeliveredBtn = document.getElementById('markDeliveredBtn');
    
    if (!modal || !modalBody) return;
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6><i class="fas fa-user me-2"></i>Customer Information</h6>
                <p><strong>Name:</strong> ${order.customerInfo.name}</p>
                <p><strong>Phone:</strong> <a href="tel:${order.customerInfo.phone}">${order.customerInfo.phone}</a></p>
                ${order.customerInfo.email ? `<p><strong>Email:</strong> <a href="mailto:${order.customerInfo.email}">${order.customerInfo.email}</a></p>` : ''}
                
                <h6 class="mt-4"><i class="fas fa-map-marker-alt me-2"></i>Delivery Information</h6>
                <p><strong>Address:</strong> ${order.deliveryInfo.address}</p>
                <p><strong>Landmark:</strong> ${order.deliveryInfo.landmark}</p>
                <p><strong>Delivery Time:</strong> 
                    <span class="badge ${order.deliveryInfo.deliveryTime === 'morning' ? 'bg-warning' : 'bg-info'}">
                        ${order.deliveryInfo.deliveryTime === 'morning' ? 'Morning (7-9 AM)' : 'Evening (7-9 PM)'}
                    </span>
                </p>
            </div>
            <div class="col-md-6">
                <h6><i class="fas fa-shopping-bag me-2"></i>Order Items</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colspan="3">Total</th>
                                <th>${formatCurrency(order.total)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <h6 class="mt-4"><i class="fas fa-info-circle me-2"></i>Order Details</h6>
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Status:</strong> 
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </p>
                <p><strong>Payment:</strong> 
                    <span class="badge ${order.paymentMethod === 'cod' ? 'bg-warning' : 'bg-info'}">
                        ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                </p>
                <p><strong>Order Date:</strong> ${formatDate(order.orderDate)}</p>
                ${order.specialInstructions ? `<p><strong>Special Instructions:</strong> ${order.specialInstructions}</p>` : ''}
            </div>
        </div>
    `;
    
    // Configure mark delivered button
    if (markDeliveredBtn) {
        markDeliveredBtn.style.display = order.status === 'pending' ? 'block' : 'none';
        markDeliveredBtn.onclick = () => {
            markAsDelivered(orderId);
            bootstrap.Modal.getInstance(modal).hide();
        };
    }
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Mark order as delivered
function markAsDelivered(orderId) {
    if (!confirm('Mark this order as delivered?')) return;
    
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'delivered';
        orders[orderIndex].deliveredDate = new Date().toISOString();
        
        localStorage.setItem('lactohub_orders', JSON.stringify(orders));
        
        loadDashboardStats();
        loadOrdersTable();
        showNotification(`Order ${orderId} marked as delivered`, 'success');
    }
}

// Delete order
function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    
    let orders = getOrders();
    orders = orders.filter(o => o.orderId !== orderId);
    
    localStorage.setItem('lactohub_orders', JSON.stringify(orders));
    
    loadDashboardStats();
    loadOrdersTable();
    showNotification(`Order ${orderId} deleted`, 'info');
}

// Add shake animation CSS
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

// Auto-logout after 2 hours of inactivity
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (sessionStorage.getItem('admin_logged_in') === 'true') {
            showNotification('Session expired due to inactivity', 'warning');
            handleLogout();
        }
    }, 2 * 60 * 60 * 1000); // 2 hours
}

// Track user activity
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Initialize inactivity timer when logged in
document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('admin_logged_in') === 'true') {
        resetInactivityTimer();
    }
});

// Prevent multiple admin sessions (optional security feature)
window.addEventListener('storage', function(e) {
    if (e.key === 'admin_logged_in' && e.newValue === 'true' && e.oldValue !== 'true') {
        if (sessionStorage.getItem('admin_logged_in') === 'true') {
            alert('Another admin session has been detected. You will be logged out for security.');
            handleLogout();
        }
    }
});

// Add keyboard shortcuts for admin panel
document.addEventListener('keydown', function(e) {
    if (sessionStorage.getItem('admin_logged_in') !== 'true') return;
    
    // Ctrl/Cmd + R to refresh orders
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        const refreshBtn = document.getElementById('refreshOrders');
        if (refreshBtn) refreshBtn.click();
    }
    
    // Ctrl/Cmd + E to export orders
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        const exportBtn = document.getElementById('exportOrders');
        if (exportBtn) exportBtn.click();
    }
    
    // Ctrl/Cmd + L to logout
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.click();
    }
});