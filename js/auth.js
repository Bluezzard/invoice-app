class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showApp();
        }
    }

    login(username, password) {
        const users = dataManager.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showApp();
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasPermission(role, permission) {
        const permissions = {
            admin: ['all'],
            gudang: ['stock', 'invoice-read'],
            sales: ['invoice-create', 'invoice-read'],
            customer: ['invoice-read'],
            finance: ['invoice-approve', 'invoice-read']
        };
        return permissions[role]?.includes(permission) || permissions[role]?.includes('all');
    }

    showApp() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('currentUser').textContent = this.currentUser.name;
        document.getElementById('appTitle').textContent = `Invoice System - ${this.currentUser.role.toUpperCase()}`;
    }
}

const authManager = new AuthManager();
