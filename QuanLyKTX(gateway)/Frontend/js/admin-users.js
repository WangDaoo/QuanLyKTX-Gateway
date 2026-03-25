// Admin Users Module
class AdminUsers {
    constructor() {
        this.users = [];
        this.editingUser = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            await this.loadUsers();
            this.setupForm();
        } catch (error) {
            console.error('Failed to initialize AdminUsers:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
        }
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) userNameEl.textContent = user.hoTen || user.tenDangNhap;
            
            const userRole = document.querySelector('.user-role');
            if (userRole) {
                const roleMap = {
                    'Admin': 'Quản trị viên',
                    'Officer': 'Nhân viên',
                    'Student': 'Sinh viên'
                };
                userRole.textContent = roleMap[user.vaiTro] || user.vaiTro;
            }
        }
    }

    setupForm() {
        const form = document.getElementById('userForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveUser();
            });
        }
    }

    async loadUsers() {
        try {
            Utils.showLoading();

            console.log('Loading users from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.USERS);
            const response = await $api.get(CONFIG.ENDPOINTS.USERS);
            console.log('Users response received:', response);
            
            // Handle different response formats
            let usersArray = [];
            if (Array.isArray(response)) {
                usersArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    usersArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    usersArray = response.data;
                } else {
                    console.warn('Unexpected users data format:', response);
                }
            }
            
            this.users = usersArray || [];
            console.log('Users loaded:', this.users.length);
            this.renderUsersTable();
            
        } catch (error) {
            console.error('Error loading users:', error);
            const tbody = document.getElementById('usersTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminUsers.loadUsers()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách người dùng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderUsersTable(users = null) {
        const tbody = document.getElementById('usersTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayUsers = users || this.users;
        
        if (displayUsers.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }
        
        if (noDataMessage) noDataMessage.style.display = 'none';
        
        tbody.innerHTML = displayUsers.map(user => {
            const roleMap = {
                'Admin': 'Quản trị viên',
                'Officer': 'Nhân viên',
                'Student': 'Sinh viên'
            };
            
            const statusBadge = user.trangThai 
                ? '<span class="badge badge-success">Hoạt động</span>'
                : '<span class="badge badge-danger">Bị khóa</span>';
            
            const roleBadge = `<span class="badge badge-info">${roleMap[user.vaiTro] || user.vaiTro}</span>`;
            
            return `
                <tr>
                    <td data-label="Mã TK">${user.maTaiKhoan || ''}</td>
                    <td data-label="Tên đăng nhập">${user.tenDangNhap || ''}</td>
                    <td data-label="Họ tên">${user.hoTen || ''}</td>
                    <td data-label="Email">${user.email || ''}</td>
                    <td data-label="Vai trò">${roleBadge}</td>
                    <td data-label="Trạng thái">${statusBadge}</td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="adminUsers.editUser(${user.maTaiKhoan})" title="Sửa">
                                <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="adminUsers.resetPassword(${user.maTaiKhoan})" title="Reset mật khẩu">
                                <i class="fas fa-key"></i> <span class="btn-text">Reset</span>
                            </button>
                            <button class="btn btn-sm ${user.trangThai ? 'btn-danger' : 'btn-success'}" 
                                    onclick="adminUsers.toggleLock(${user.maTaiKhoan}, ${!user.trangThai})" 
                                    title="${user.trangThai ? 'Khóa' : 'Mở khóa'}">
                                <i class="fas fa-${user.trangThai ? 'lock' : 'unlock'}"></i> 
                                <span class="btn-text">${user.trangThai ? 'Khóa' : 'Mở khóa'}</span>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="adminUsers.deleteUser(${user.maTaiKhoan})" title="Xóa">
                                <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openModal(user = null) {
        this.editingUser = user;
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        const modalTitle = document.getElementById('modalTitleText');
        
        if (modalTitle) {
            modalTitle.textContent = user ? 'Sửa tài khoản' : 'Thêm tài khoản';
        }
        
        if (form) {
            form.reset();
            
            if (user) {
                // Handle both camelCase and PascalCase field names
                const maTaiKhoan = user.maTaiKhoan || user.MaTaiKhoan || '';
                const tenDangNhap = user.tenDangNhap || user.TenDangNhap || '';
                const hoTen = user.hoTen || user.HoTen || '';
                const email = user.email || user.Email || '';
                const vaiTro = user.vaiTro || user.VaiTro || '';
                
                document.getElementById('maTaiKhoan').value = maTaiKhoan;
                document.getElementById('tenDangNhap').value = tenDangNhap;
                document.getElementById('tenDangNhap').disabled = true; // Không cho sửa tên đăng nhập
                document.getElementById('hoTen').value = hoTen;
                document.getElementById('email').value = email;
                document.getElementById('vaiTro').value = vaiTro;
                
                const passwordGroup = document.getElementById('passwordGroup');
                if (passwordGroup) {
                    passwordGroup.style.display = 'none';
                }
                const matKhauInput = document.getElementById('matKhau');
                if (matKhauInput) {
                    matKhauInput.required = false;
                }
            } else {
                document.getElementById('maTaiKhoan').value = '';
                document.getElementById('tenDangNhap').value = '';
                document.getElementById('tenDangNhap').disabled = false;
                
                const passwordGroup = document.getElementById('passwordGroup');
                if (passwordGroup) {
                    passwordGroup.style.display = 'block';
                }
                const matKhauInput = document.getElementById('matKhau');
                if (matKhauInput) {
                    matKhauInput.required = true;
                }
            }
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingUser = null;
        const form = document.getElementById('userForm');
        if (form) {
            form.reset();
        }
    }

    async saveUser() {
        try {
            const form = document.getElementById('userForm');
            if (!form || !form.checkValidity()) {
                form.reportValidity();
                return;
            }

            Utils.showLoading();

            const formData = {
                hoTen: document.getElementById('hoTen').value.trim(),
                email: document.getElementById('email').value.trim() || null,
                vaiTro: document.getElementById('vaiTro').value,
                trangThai: true // Mặc định là hoạt động
            };

            // Chỉ thêm tenDangNhap và matKhau khi tạo mới
            if (!this.editingUser) {
                formData.tenDangNhap = document.getElementById('tenDangNhap').value.trim();
                const matKhau = document.getElementById('matKhau').value;
                if (!matKhau) {
                    Utils.showAlert('Vui lòng nhập mật khẩu!', 'warning');
                    Utils.hideLoading();
                    return;
                }
                formData.matKhau = matKhau;
            }

            if (this.editingUser) {
                // Update user - không cần tenDangNhap và matKhau
                await $api.put(CONFIG.ENDPOINTS.USER_BY_ID(this.editingUser.maTaiKhoan || this.editingUser.MaTaiKhoan), formData);
                Utils.showAlert('Cập nhật người dùng thành công!', 'success');
            } else {
                // Create user - cần dùng register endpoint
                await $api.post(CONFIG.ENDPOINTS.REGISTER, formData);
                Utils.showAlert('Tạo người dùng thành công!', 'success');
            }

            this.closeModal();
            await this.loadUsers();
            
        } catch (error) {
            console.error('Error saving user:', error);
            Utils.showAlert('Lỗi: ' + (error.message || 'Không thể lưu người dùng'), 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async editUser(id) {
        try {
            Utils.showLoading();

            const response = await $api.get(CONFIG.ENDPOINTS.USER_BY_ID(id));
            console.log('User response:', response);
            
            // Handle different response formats
            let user = null;
            if (response && typeof response === 'object') {
                if (response.maTaiKhoan || response.MaTaiKhoan) {
                    user = response;
                } else if (response.data) {
                    user = response.data;
                } else if (response.success && response.data) {
                    user = response.data;
                }
            }
            
            if (!user) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
            
            this.openModal(user);
            
        } catch (error) {
            console.error('Error loading user:', error);
            Utils.showAlert('Lỗi tải thông tin người dùng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteUser(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            return;
        }

        try {
            Utils.showLoading();

            await $api.delete(CONFIG.ENDPOINTS.USER_BY_ID(id));
            Utils.showAlert('Xóa người dùng thành công!', 'success');
            await this.loadUsers();
            
        } catch (error) {
            console.error('Error deleting user:', error);
            Utils.showAlert('Lỗi xóa người dùng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async resetPassword(id) {
        const newPassword = prompt('Nhập mật khẩu mới:');
        if (!newPassword || newPassword.length < 6) {
            Utils.showAlert('Mật khẩu phải có ít nhất 6 ký tự!', 'warning');
            return;
        }

        try {
            Utils.showLoading();

            // Backend expect { NewPassword: string }
            await $api.put(CONFIG.ENDPOINTS.USER_RESET_PASSWORD(id), { NewPassword: newPassword });
            Utils.showAlert('Reset mật khẩu thành công!', 'success');
            
        } catch (error) {
            console.error('Error resetting password:', error);
            Utils.showAlert('Lỗi reset mật khẩu: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async toggleLock(id, lock) {
        try {
            Utils.showLoading();

            // Backend expect { IsLocked: boolean }
            await $api.put(CONFIG.ENDPOINTS.USER_LOCK(id), { IsLocked: lock });
            Utils.showAlert(`${lock ? 'Khóa' : 'Mở khóa'} người dùng thành công!`, 'success');
            await this.loadUsers();
            
        } catch (error) {
            console.error('Error toggling lock:', error);
            Utils.showAlert('Lỗi: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    filterUsers() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const roleFilter = document.getElementById('roleFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        let filtered = this.users;
        
        if (searchTerm) {
            filtered = filtered.filter(user => 
                (user.tenDangNhap && user.tenDangNhap.toLowerCase().includes(searchTerm)) ||
                (user.hoTen && user.hoTen.toLowerCase().includes(searchTerm)) ||
                (user.email && user.email.toLowerCase().includes(searchTerm))
            );
        }
        
        if (roleFilter) {
            filtered = filtered.filter(user => user.vaiTro === roleFilter);
        }
        
        if (statusFilter !== '') {
            const isActive = statusFilter === 'true';
            filtered = filtered.filter(user => user.trangThai === isActive);
        }
        
        this.renderUsersTable(filtered);
    }
}

// Initialize when DOM is ready
let adminUsers;
document.addEventListener('DOMContentLoaded', () => {
    adminUsers = new AdminUsers();
    window.adminUsers = adminUsers;
});

// Global functions for HTML onclick handlers
function openUserModal() {
    if (adminUsers) adminUsers.openModal();
}

function closeUserModal() {
    if (adminUsers) adminUsers.closeModal();
}

function filterUsers() {
    if (adminUsers) adminUsers.filterUsers();
}

