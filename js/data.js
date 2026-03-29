class DataManager {
    constructor() {
        this.init();
    }

    init() {
        // Initialize default data if not exists
        if (!localStorage.getItem('users')) {
            this.users = [
                { id: 1, username: 'admin', password: '123456', role: 'admin', name: 'Administrator' },
                { id: 2, username: 'gudang', password: '123456', role: 'gudang', name: 'Gudang' },
                { id: 3, username: 'sales', password: '123456', role: 'sales', name: 'Sales Team' },
                { id: 4, username: 'customer', password: '123456', role: 'customer', name: 'Customer' },
                { id: 5, username: 'finance', password: '123456', role: 'finance', name: 'Finance' }
            ];
            localStorage.setItem('users', JSON.stringify(this.users));
        }

        if (!localStorage.getItem('invoices')) {
            this.invoices = [];
            localStorage.setItem('invoices', JSON.stringify(this.invoices));
        }

        if (!localStorage.getItem('products')) {
            this.products = [
                { id: 1, name: 'Laptop Dell', code: 'LAP001', stock: 50, price: 15000000 },
                { id: 2, name: 'Mouse Wireless', code: 'MOU001', stock: 100, price: 150000 },
                { id: 3, name: 'Keyboard Mechanical', code: 'KEY001', stock: 75, price: 800000 }
            ];
            localStorage.setItem('products', JSON.stringify(this.products));
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    getInvoices() {
        return JSON.parse(localStorage.getItem('invoices') || '[]');
    }

    getProducts() {
        return JSON.parse(localStorage.getItem('products') || '[]');
    }

    saveUser(user) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index] = user;
        } else {
            user.id = Date.now();
            users.push(user);
        }
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }

    saveInvoice(invoice) {
        const invoices = this.getInvoices();
        const index = invoices.findIndex(inv => inv.id === invoice.id);
        if (index !== -1) {
            invoices[index] = invoice;
        } else {
            invoice.id = Date.now();
            invoice.createdAt = new Date().toISOString();
            invoices.push(invoice);
        }
        localStorage.setItem('invoices', JSON.stringify(invoices));
        return invoice;
    }

    saveProduct(product) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = product;
        } else {
            product.id = Date.now();
            products.push(product);
        }
        localStorage.setItem('products', JSON.stringify(products));
        return product;
    }

    deleteInvoice(id) {
        let invoices = this.getInvoices();
        invoices = invoices.filter(inv => inv.id != id);
        localStorage.setItem('invoices', JSON.stringify(invoices));
    }

    updateStock(productId, quantity) {
        const products = this.getProducts();
        const product = products.find(p => p.id == productId);
        if (product) {
            product.stock -= quantity;
            localStorage.setItem('products', JSON.stringify(products));
        }
    }
}

const dataManager = new DataManager();
