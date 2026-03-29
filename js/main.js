// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Invoice System initialized!');
    
    // Check if user is logged in
    if (authManager.getCurrentUser()) {
        authManager.showApp();
        dashboardManager.init();
    }
});

// Global functions for onclick handlers
window.dashboardManager = dashboardManager;
