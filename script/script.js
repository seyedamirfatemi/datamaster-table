class DataMasterTable {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.currentPage = 1;
        this.rowsPerPage = 25;
        this.sortColumn = 'id';
        this.sortDirection = 'asc';
        this.searchTerm = '';
        this.statusFilter = 'all';
        this.roleFilter = 'all';
        this.deleteTarget = null;
        
        this.init();
        this.generateMockData();
    }
    
    init() {
        this.tableBody = document.getElementById('tableBody');
        this.searchInput = document.getElementById('searchInput');
        this.statusFilterEl = document.getElementById('statusFilter');
        this.roleFilterEl = document.getElementById('roleFilter');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        this.rowsPerPageSelect = document.getElementById('rowsPerPage');
        this.firstPageBtn = document.getElementById('firstPage');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.lastPageBtn = document.getElementById('lastPage');
        this.currentPageSpan = document.getElementById('currentPage');
        this.totalPagesSpan = document.getElementById('totalPages');
        this.exportBtn = document.getElementById('exportBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        
        this.deleteModal = document.getElementById('deleteModal');
        this.deleteUserName = document.getElementById('deleteUserName');
        this.confirmDeleteBtn = document.querySelector('.confirm-delete');
        this.cancelDeleteBtns = document.querySelectorAll('.cancel-btn, .close-modal');
        
        this.toast = document.getElementById('toast');
        
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.render();
    }
    
    generateMockData() {
        const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas'];
        const roles = ['user', 'user', 'user', 'user', 'admin', 'moderator', 'user', 'user'];
        const statuses = ['active', 'active', 'active', 'inactive', 'pending', 'active', 'active'];
        
        for (let i = 1; i <= 187; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
            const role = roles[Math.floor(Math.random() * roles.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const orders = Math.floor(Math.random() * 50);
            const spent = orders * (Math.random() * 200 + 20);
            const joined = new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
            
            this.users.push({
                id: i,
                name,
                email,
                role,
                status,
                orders,
                spent: Math.round(spent * 100) / 100,
                joined: joined.toISOString().split('T')[0],
                avatar: this.getInitials(name)
            });
        }
        
        this.filteredUsers = [...this.users];
    }
    
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.statusFilterEl.addEventListener('change', (e) => {
            this.statusFilter = e.target.value;
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.roleFilterEl.addEventListener('change', (e) => {
            this.roleFilter = e.target.value;
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.clearFiltersBtn.addEventListener('click', () => {
            this.searchTerm = '';
            this.statusFilter = 'all';
            this.roleFilter = 'all';
            this.searchInput.value = '';
            this.statusFilterEl.value = 'all';
            this.roleFilterEl.value = 'all';
            this.currentPage = 1;
            this.applyFilters();
            this.showToast('Filters cleared', 'info');
        });
        
        this.rowsPerPageSelect.addEventListener('change', (e) => {
            this.rowsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.render();
        });
        
        this.firstPageBtn.addEventListener('click', () => this.goToPage(1));
        this.prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        this.nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        this.lastPageBtn.addEventListener('click', () => this.goToPage(this.totalPages));
        
        this.exportBtn.addEventListener('click', () => this.exportToCSV());
        this.refreshBtn.addEventListener('click', () => {
            this.showToast('Data refreshed', 'success');
            this.render();
        });
        
        document.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                this.applyFilters();
            });
        });
        
        this.confirmDeleteBtn.addEventListener('click', () => this.deleteUser());
        this.cancelDeleteBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.searchInput.focus();
            }
            if (e.key === 'Escape') {
                this.closeModal();
                this.searchInput.blur();
            }
        });
    }
    
    applyFilters() {
        let filtered = [...this.users];
        
        if (this.searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(this.searchTerm) ||
                user.email.toLowerCase().includes(this.searchTerm)
            );
        }
        
        if (this.statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === this.statusFilter);
        }
        
        if (this.roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === this.roleFilter);
        }
        
        filtered.sort((a, b) => {
            let aVal = a[this.sortColumn];
            let bVal = b[this.sortColumn];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        this.filteredUsers = filtered;
        this.totalPages = Math.ceil(this.filteredUsers.length / this.rowsPerPage);
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
        
        this.render();
    }
    
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.render();
    }
    
    render() {
        this.updateStats();
        this.renderTable();
        this.renderPagination();
        this.updateSortIcons();
    }
    
    updateStats() {
        document.getElementById('totalUsers').textContent = this.filteredUsers.length;
        document.getElementById('activeUsers').textContent = this.filteredUsers.filter(u => u.status === 'active').length;
        
        const avgOrders = this.filteredUsers.length > 0 
            ? (this.filteredUsers.reduce((sum, u) => sum + u.orders, 0) / this.filteredUsers.length).toFixed(1)
            : 0;
        document.getElementById('avgOrders').textContent = avgOrders;
        
        const totalSpent = this.filteredUsers.reduce((sum, u) => sum + u.spent, 0);
        document.getElementById('totalSpent').textContent = `$${totalSpent.toLocaleString()}`;
    }
    
    renderTable() {
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        const pageUsers = this.filteredUsers.slice(start, end);
        
        if (pageUsers.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 48px;">
                        <i class="fas fa-inbox" style="font-size: 48px; color: #ccc;"></i>
                        <p style="margin-top: 12px; color: #999;">No users found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.tableBody.innerHTML = pageUsers.map(user => `
            <tr>
                <td>#${user.id}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${user.avatar}</div>
                        <div class="user-info-cell">
                            <div class="user-name-cell">${user.name}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role}">${user.role}</span></td>
                <td><span class="badge ${user.status}">${user.status}</span></td>
                <td>${user.orders}</td>
                <td>$${user.spent.toLocaleString()}</td>
                <td>${user.joined}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="dataTable.openEditModal(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="dataTable.openDeleteModal(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    renderPagination() {
        this.currentPageSpan.textContent = this.currentPage;
        this.totalPagesSpan.textContent = this.totalPages;
        
        this.firstPageBtn.disabled = this.currentPage === 1;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
        this.lastPageBtn.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
    }
    
    updateSortIcons() {
        document.querySelectorAll('th.sortable').forEach(th => {
            const column = th.dataset.sort;
            const icon = th.querySelector('i');
            icon.classList.remove('fa-sort', 'fa-sort-up', 'fa-sort-down');
            
            if (this.sortColumn === column) {
                icon.classList.add(this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
            } else {
                icon.classList.add('fa-sort');
            }
        });
    }
    
    openDeleteModal(id) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            this.deleteTarget = id;
            this.deleteUserName.textContent = user.name;
            this.deleteModal.classList.add('active');
        }
    }
    
    closeModal() {
        this.deleteModal.classList.remove('active');
        this.deleteTarget = null;
    }
    
    deleteUser() {
        if (this.deleteTarget) {
            const index = this.users.findIndex(u => u.id === this.deleteTarget);
            if (index !== -1) {
                this.users.splice(index, 1);
                this.applyFilters();
                this.showToast('User deleted successfully', 'success');
            }
            this.closeModal();
        }
    }
    
    openEditModal(id) {
        this.showToast('Edit feature coming soon!', 'info');
    }
    
    exportToCSV() {
        const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Orders', 'Total Spent', 'Joined'];
        const rows = this.filteredUsers.map(user => [
            user.id,
            user.name,
            user.email,
            user.role,
            user.status,
            user.orders,
            user.spent,
            user.joined
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(`Exported ${this.filteredUsers.length} users to CSV`, 'success');
    }
    
    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

const dataTable = new DataMasterTable();