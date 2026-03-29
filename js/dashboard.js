class DashboardManager {
    constructor() {
        this.currentUserRole = authManager.getCurrentUser()?.role;
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.renderMenu();
        this.loadDashboard();
        
        // Event listeners
        document.getElementById('logoutBtn').addEventListener('click', () => authManager.logout());
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    }

    renderMenu() {
        const menuConfig = {
            admin: [
                { icon: 'fas fa-tachometer-alt', title: 'Dashboard', page: 'dashboard' },
                { icon: 'fas fa-users', title: 'Kelola User', page: 'users' },
                { icon: 'fas fa-file-invoice', title: 'Semua Invoice', page: 'invoices' },
                { icon: 'fas fa-box', title: 'Kelola Stok', page: 'stock' }
            ],
            gudang: [
                { icon: 'fas fa-tachometer-alt', title: 'Dashboard', page: 'dashboard' },
                { icon: 'fas fa-file-invoice-dollar', title: 'Invoice Pending', page: 'pending-invoices' },
                { icon: 'fas fa-box-open', title: 'Stok Barang', page: 'stock' }
            ],
            sales: [
                { icon: 'fas fa-tachometer-alt', title: 'Dashboard', page: 'dashboard' },
                { icon: 'fas fa-plus', title: 'Buat Invoice', page: 'create-invoice' },
                { icon: 'fas fa-file-invoice', title: 'Invoice Saya', page: 'my-invoices' }
            ],
            customer: [
                { icon: 'fas fa-tachometer-alt', title: 'Dashboard', page: 'dashboard' },
                { icon: 'fas fa-file-invoice', title: 'Invoice Saya', page: 'my-invoices' }
            ],
            finance: [
                { icon: 'fas fa-tachometer-alt', title: 'Dashboard', page: 'dashboard' },
                { icon: 'fas fa-file-invoice-dollar', title: 'Invoice Menunggu', page: 'pending-invoices' },
                { icon: 'fas fa-file-invoice-check', title: 'Invoice Selesai', page: 'approved-invoices' }
            ]
        };

        const menuItems = menuConfig[this.currentUserRole] || [];
        const navMenu = document.querySelector('.nav-menu');
        navMenu.innerHTML = menuItems.map(item => 
            `<li><a href="#" class="nav-item ${this.currentPage === item.page ? 'active' : ''}" data-page="${item.page}">
                <i class="${item.icon}"></i>
                ${item.title}
            </a></li>`
        ).join('');

        // Add click handlers
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.showPage(page);
            });
        });
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (authManager.login(username, password)) {
            location.reload(); // Refresh untuk init ulang
        } else {
            alert('Username atau password salah!');
        }
    }

    showPage(page) {
        this.currentPage = page;
        this.renderMenu();
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        setTimeout(() => {
            switch(page) {
                case 'dashboard': this.renderDashboard(); break;
                case 'users': this.renderUsers(); break;
                case 'invoices': this.renderInvoices(); break;
                case 'stock': this.renderStock(); break;
                case 'create-invoice': this.renderCreateInvoice(); break;
                case 'my-invoices': this.renderMyInvoices(); break;
                case 'pending-invoices': this.renderPendingInvoices(); break;
                case 'approved-invoices': this.renderApprovedInvoices(); break;
                default: this.renderDashboard();
            }
        }, 500);
    }

    // Dashboard
    renderDashboard() {
        const invoices = dataManager.getInvoices();
        const stats = {
            total: invoices.length,
            pending: invoices.filter(i => i.status === 'pending').length,
            approved: invoices.filter(i => i.status === 'approved').length,
            paid: invoices.filter(i => i.status === 'paid').length
        };

        const html = `
            <div class="card">
                <h3><i class="fas fa-tachometer-alt"></i> Dashboard ${this.currentUserRole.toUpperCase()}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <div style="font-size: 2.5rem; color: #667eea; margin-bottom: 0.5rem;">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <h2>${stats.total}</h2>
                        <p>Total Invoice</p>
                    </div>
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <div style="font-size: 2.5rem; color: #f39c12; margin-bottom: 0.5rem;">
                            <i class="fas fa-clock"></i>
                        </div>
                        <h2>${stats.pending}</h2>
                        <p>Menunggu</p>
                    </div>
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <div style="font-size: 2.5rem; color: #27ae60; margin-bottom: 0.5rem;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h2>${stats.approved}</h2>
                        <p>Terverifikasi</p>
                    </div>
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <div style="font-size: 2.5rem; color: #3498db; margin-bottom: 0.5rem;">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <h2>Rp ${this.formatRupiah(invoices.reduce((sum, inv) => sum + inv.total, 0))}</h2>
                        <p>Total Nilai</p>
                    </div>
                </div>
                <div class="card" style="margin-top: 2rem;">
                    <h4>Invoice Terbaru</h4>
                    ${this.renderRecentInvoices(invoices.slice(0, 5))}
                </div>
            </div>
        `;
        document.getElementById('contentArea').innerHTML = html;
    }

    // Users Management (Admin Only)
    renderUsers() {
        const users = dataManager.getUsers();
        const html = `
            <div class="card">
                <h3><i class="fas fa-users"></i> Kelola Pengguna</h3>
                <button class="btn btn-primary" onclick="dashboardManager.showAddUserForm()">
                    <i class="fas fa-plus"></i> Tambah User
                </button>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.username}</td>
                                <td><span class="badge" style="background: ${this.getRoleColor(user.role)}">${user.role}</span></td>
                                <td>
                                    <button class="btn btn-warning btn-sm" onclick="dashboardManager.editUser(${user.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="dashboardManager.deleteUser(${user.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('contentArea').innerHTML = html;
    }

    // Invoices List
    renderInvoices() {
        const invoices = dataManager.getInvoices();
        const html = `
            <div class="card">
                <h3><i class="fas fa-file-invoice"></i> Daftar Invoice</h3>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Invoice #</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoices.map((invoice, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>#${invoice.id}</td>
                                    <td>${invoice.customer}</td>
                                    <td>Rp ${this.formatRupiah(invoice.total)}</td>
                                    <td><span class="badge ${invoice.status}">${invoice.status}</span></td>
                                    <td>${new Date(invoice.createdAt).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <button class="btn btn-primary btn-sm" onclick="dashboardManager.viewInvoice(${invoice.id})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('contentArea').innerHTML = html;
    }

    // Stock Management
    renderStock() {
        const products = dataManager.getProducts();
        const html = `
            <div class="card">
                <h3><i class="fas fa-box"></i> Manajemen Stok</h3>
                <button class="btn btn-primary" onclick="dashboardManager.showAddProductForm()">
                    <i class="fas fa-plus"></i> Tambah Produk
                </button>
                <div class="table-responsive" style="margin-top: 1rem;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Nama Produk</th>
                                <th>Stok</th>
                                <th>Harga</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr ${product.stock === 0 ? 'style="background: #ffebee;"' : ''}>
                                    <td>${product.code}</td>
                                    <td>${product.name}</td>
                                    <td>
                                        <strong style="color: ${product.stock === 0 ? '#e74c3c' : '#27ae60'}">
                                            ${product.stock}
                                        </strong>
                                    </td>
                                    <td>Rp ${this.formatRupiah(product.price)}</td>
                                    <td>
                                        <button class="btn btn-warning btn-sm" onclick="dashboardManager.editProduct(${product.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('contentArea').innerHTML = html;
    }

    // Create Invoice (Sales)
    renderCreateInvoice() {
        const products = dataManager.getProducts();
        const html = `
            <div class="card">
                <h3><i class="fas fa-plus"></i> Buat Invoice Baru</h3>
                <form id="invoiceForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Customer</label>
                            <input type="text" id="customerName" required>
                        </div>
                        <div class="form-group">
                            <label>No. HP</label>
                            <input type="text" id="customerPhone">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Produk</label>
                        <div id="productList">
                            <div class="product-row">
                                <select class="product-select" required>
                                    <option value="">Pilih Produk</option>
                                    ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-stock="${p.stock}">${p.code} - ${p.name} (Stok: ${p.stock})</option>`).join('')}
                                </select>
                                <input type="number" class="qty-input" placeholder="Qty" min="1">
                                <span class="item-total">Rp 0</span>
                                <button type="button" class="btn btn-danger remove-item" style="display:none;">Hapus</button>
                            </div>
                        </div>
                        <button type="button" class="btn btn-secondary" onclick="dashboardManager.addProductRow()">+ Tambah Produk</button>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Total</label>
                            <input type="text" id="invoiceTotal" readonly>
                        </div>
                        <div class="form-group">
                            <label>Catatan</label>
                            <textarea id="notes" rows="3"></textarea>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-save"></i> Simpan Invoice
                    </button>
                </form>
            </div>
        `;
        document.getElementById('contentArea').innerHTML = html;
        this.initInvoiceForm();
    }

    initInvoiceForm() {
        document.getElementById('invoiceForm').addEventListener('submit', (e) => this.saveInvoice(e));
        document.querySelectorAll('.product-select').forEach(select => {
            select.addEventListener('change', this.updateItemTotal);
        });
        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('input', this.updateItemTotal);
        });
    }

    // My Invoices (Sales/Customer)
    renderMyInvoices() {
        const userId = authManager.getCurrentUser().id;
        const invoices = dataManager.getInvoices().filter(inv => 
            inv.createdBy === userId || inv.customerId === userId
        );
        const html = `
            <div class="card">
                <h3><i class="fas fa-file-invoice"></i> Invoice Saya</h3>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoices.map(invoice => `
                                <tr>
                                    <td>#${invoice.id}</td>
                                    <td>Rp ${this.formatRupiah(invoice.total)}</td>
                                    <td><span class="badge ${invoice.status}">${invoice.status}</span></td>
                                    <td>${new Date(invoice.createdAt).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <button class="btn btn-primary btn-sm" onclick="dashboardManager.viewInvoice(${invoice.id})">
                                            <i class="fas fa-eye"></i> Lihat
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('contentArea').innerHTML = html;
    }

    renderPendingInvoices() {
        const invoices = dataManager.getInvoices().filter(inv => inv.status === 'pending');
        // Similar to renderInvoices but filtered
        this.renderInvoicesFiltered(invoices, 'Invoice Menunggu');
    }

    renderApprovedInvoices() {
        const invoices = dataManager.getInvoices().filter(inv => inv.status === 'approved' || inv.status === 'paid');
        this.renderInvoicesFiltered(invoices, 'Invoice Terverifikasi');
    }

    renderInvoicesFiltered(invoices, title) {
        const html = `
            <div class="card">
                <h3><i class="fas fa-file-invoice-dollar"></i> ${title}</h3>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>No Invoice</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoices.map((inv, idx) => `
                                <tr>
                                    <td>#${inv.id}</td>
                                    <td>${inv.customer}</td>
                                    <td>Rp ${this.formatRupiah(inv.total)}</td>
                                    <td><span class="badge ${inv.status}">${inv.status}</span></td>
                                    <td>${new Date(inv.createdAt).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        ${authManager.currentUser.role === 'finance' ? 
                                            `<button class="btn btn-success btn-sm" onclick="dashboardManager.approveInvoice(${inv.id})">
                                                <i class="fas fa-check"></i> Approve
                                            </button>` : ''}
                                        <button class="btn btn-primary btn-sm" onclick="dashboardManager.viewInvoice(${inv.id})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('contentArea').innerHTML = html;
    }

    // Utility Methods
    formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

        getRoleColor(role) {
        const colors = {
            admin: '#e74c3c',
            gudang: '#f39c12',
            sales: '#3498db',
            customer: '#9b59b6',
            finance: '#27ae60'
        };
        return colors[role] || '#95a5a6';
    }

    renderRecentInvoices(invoices) {
        if (invoices.length === 0) {
            return '<p style="text-align: center; color: #666; padding: 2rem;">Belum ada invoice</p>';
        }
        return `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoices.map(inv => `
                            <tr>
                                <td>#${inv.id}</td>
                                <td>${inv.customer}</td>
                                <td>Rp ${this.formatRupiah(inv.total)}</td>
                                <td><span class="badge ${inv.status}">${inv.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Form Handlers
    showAddUserForm() {
        const html = `
            <div class="card">
                <h3><i class="fas fa-user-plus"></i> Tambah Pengguna</h3>
                <form id="userForm">
                    <div class="form-group">
                        <label>Nama</label>
                        <input type="text" id="userName" required>
                    </div>
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="userUsername" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="userPassword" required>
                    </div>
                    <div class="form-group">
                        <label>Role</label>
                        <select id="userRole" required>
                            <option value="admin">Admin</option>
                            <option value="gudang">Gudang</option>
                            <option value="sales">Sales</option>
                            <option value="customer">Customer</option>
                            <option value="finance">Finance</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" class="btn btn-success">Simpan</button>
                        <button type="button" class="btn btn-secondary" onclick="dashboardManager.showPage('users')">Batal</button>
                    </div>
                </form>
            </div>
        `;
        document.getElementById('contentArea').innerHTML = html;
        
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const user = {
                name: document.getElementById('userName').value,
                username: document.getElementById('userUsername').value,
                password: document.getElementById('userPassword').value,
                role: document.getElementById('userRole').value
            };
            dataManager.saveUser(user);
            alert('User berhasil ditambahkan!');
            this.showPage('users');
        });
    }

    showAddProductForm() {
        const html = `
            <div class="card">
                <h3><i class="fas fa-box"></i> Tambah Produk</h3>
                <form id="productForm">
                    <div class="form-group">
                        <label>Nama Produk</label>
                        <input type="text" id="productName" required>
                    </div>
                    <div class="form-group">
                        <label>Kode Produk</label>
                        <input type="text" id="productCode" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Stok</label>
                            <input type="number" id="productStock" min="0" required>
                        </div>
                        <div class="form-group">
                            <label>Harga</label>
                            <input type="number" id="productPrice" required>
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" class="btn btn-success">Simpan</button>
                        <button type="button" class="btn btn-secondary" onclick="dashboardManager.showPage('stock')">Batal</button>
                    </div>
                </form>
            </div>
        `;
        document.getElementById('contentArea').innerHTML = html;
        
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const product = {
                name: document.getElementById('productName').value,
                code: document.getElementById('productCode').value,
                stock: parseInt(document.getElementById('productStock').value),
                price: parseInt(document.getElementById('productPrice').value)
            };
            dataManager.saveProduct(product);
            alert('Produk berhasil ditambahkan!');
            this.showPage('stock');
        });
    }

    // Invoice Form Helpers
    addProductRow() {
        const productList = document.getElementById('productList');
        const products = dataManager.getProducts();
        const newRow = document.createElement('div');
        newRow.className = 'product-row';
        newRow.innerHTML = `
            <select class="product-select" required>
                <option value="">Pilih Produk</option>
                ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-stock="${p.stock}">${p.code} - ${p.name} (Stok: ${p.stock})</option>`).join('')}
            </select>
            <input type="number" class="qty-input" placeholder="Qty" min="1">
            <span class="item-total">Rp 0</span>
            <button type="button" class="btn btn-danger remove-item">Hapus</button>
        `;
        productList.appendChild(newRow);
        
        newRow.querySelector('.product-select').addEventListener('change', this.updateItemTotal);
        newRow.querySelector('.qty-input').addEventListener('input', this.updateItemTotal);
        newRow.querySelector('.remove-item').addEventListener('click', () => {
            newRow.remove();
            this.updateInvoiceTotal();
        });
    }

    updateItemTotal(e) {
        const row = e.target.closest('.product-row');
        const select = row.querySelector('.product-select');
        const qtyInput = row.querySelector('.qty-input');
        const totalSpan = row.querySelector('.item-total');
        
        const productId = select.value;
        const qty = parseInt(qtyInput.value) || 0;
        const price = parseInt(select.selectedOptions[0]?.dataset.price) || 0;
        
        const total = price * qty;
        totalSpan.textContent = `Rp ${dashboardManager.formatRupiah(total)}`;
        
        dashboardManager.updateInvoiceTotal();
    }

    updateInvoiceTotal() {
        let grandTotal = 0;
        document.querySelectorAll('.item-total').forEach(span => {
            const amount = parseInt(span.textContent.replace(/[^\d]/g, '')) || 0;
            grandTotal += amount;
        });
        document.getElementById('invoiceTotal').value = dashboardManager.formatRupiah(grandTotal);
    }

    saveInvoice(e) {
        e.preventDefault();
        
        const rows = document.querySelectorAll('.product-row');
        const items = [];
        
        for (let row of rows) {
            const select = row.querySelector('.product-select');
            const qtyInput = row.querySelector('.qty-input');
            
            if (select.value && qtyInput.value) {
                items.push({
                    productId: select.value,
                    quantity: parseInt(qtyInput.value),
                    price: parseInt(select.selectedOptions[0]?.dataset.price)
                });
            }
        }
        
        if (items.length === 0) {
            alert('Tambahkan minimal 1 produk!');
            return;
        }

        const invoice = {
            customer: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            customerId: authManager.getCurrentUser().id,
            items: items,
            total: parseInt(document.getElementById('invoiceTotal').value.replace(/[^\d]/g, '')),
            notes: document.getElementById('notes').value,
            status: 'pending',
            createdBy: authManager.getCurrentUser().id
        };

        dataManager.saveInvoice(invoice);
        
        // Update stock
        items.forEach(item => {
            dataManager.updateStock(item.productId, item.quantity);
        });

        alert('Invoice berhasil dibuat!');
        dashboardManager.showPage('my-invoices');
    }

    approveInvoice(invoiceId) {
        if (confirm('Approve invoice ini?')) {
            const invoices = dataManager.getInvoices();
            const invoice = invoices.find(inv => inv.id == invoiceId);
            if (invoice) {
                invoice.status = 'approved';
                invoice.approvedBy = authManager.getCurrentUser().id;
                invoice.approvedAt = new Date().toISOString();
                dataManager.saveInvoice(invoice);
                alert('Invoice berhasil di-approve!');
                dashboardManager.showPage('approved-invoices');
            }
        }
    }

    viewInvoice(invoiceId) {
        const invoice = dataManager.getInvoices().find(inv => inv.id == invoiceId);
        if (!invoice) return;

        const html = `
            <div class="card">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-file-invoice-dollar"></i> Invoice #${invoice.id}</h2>
                    <p style="color: #666;">${new Date(invoice.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h4>Customer</h4>
                        <p><strong>${invoice.customer}</strong></p>
                        <p>${invoice.customerPhone || '-'}</p>
                    </div>
                    <div style="text-align: right;">
                        <h4>Status</h4>
                        <span class="badge ${invoice.status}" style="font-size: 16px; padding: 10px 20px;">${invoice.status}</span>
                        ${invoice.approvedAt ? `<p>Approved: ${new Date(invoice.approvedAt).toLocaleDateString('id-ID')}</p>` : ''}
                    </div>
                </div>

                <div class="card">
                    <h4>Detail Barang</h4>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Produk</th>
                                    <th>Qty</th>
                                    <th>Harga</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoice.items.map(item => {
                                    const product = dataManager.getProducts().find(p => p.id == item.productId);
                                    return `
                                        <tr>
                                            <td>${product ? product.name : 'Produk tidak ditemukan'}</td>
                                            <td>${item.quantity}</td>
                                            <td>Rp ${dashboardManager.formatRupiah(item.price)}</td>
                                            <td>Rp ${dashboardManager.formatRupiah(item.price * item.quantity)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="text-align: right; margin-top: 1rem;">
                        <h3>TOTAL: Rp ${dashboardManager.formatRupiah(invoice.total)}</h3>
                    </div>
                    ${invoice.notes ? `<p><strong>Catatan:</strong> ${invoice.notes}</p>` : ''}
                </div>

                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="dashboardManager.showPage('invoices')">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </button>
                    <button class="btn btn-primary" onclick="window.print()" style="margin-left: 1rem;">
                        <i class="fas fa-print"></i> Print
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('contentArea').innerHTML = html;
        
        // Print styles
        const printStyle = document.createElement('style');
        printStyle.innerHTML = `
            @media print {
                .sidebar, .header { display: none !important; }
                .main-content { padding: 0 !important; background: white !important; }
                .btn { display: none !important; }
            }
        `;
        document.head.appendChild(printStyle);
    }
}

// Global instance
const dashboardManager = new DashboardManager();
