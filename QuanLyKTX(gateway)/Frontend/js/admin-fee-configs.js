// Admin Fee Configs Module
class AdminFeeConfigs {
    constructor() {
        this.configs = [];
        this.editingConfig = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            await this.loadConfigs();
            this.setupForm();
            this.setupStatusToggle();
        } catch (error) {
            console.error('Failed to initialize AdminFeeConfigs:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
        }
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = user.hoTen || user.HoTen || user.tenDangNhap || user.TenDangNhap || 'Admin';
            }
            const userRoleEl = document.getElementById('userRole');
            if (userRoleEl) {
                const roleMap = {
                    'Admin': 'Quản trị viên',
                    'Officer': 'Nhân viên',
                    'Student': 'Sinh viên'
                };
                const role = user.vaiTro || user.VaiTro || '';
                userRoleEl.textContent = roleMap[role] || role;
            }
        }
    }

    setupForm() {
        const form = document.getElementById('configForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveConfig();
            });
        }
    }

    setupStatusToggle() {
        const statusToggle = document.getElementById('trangThai');
        const statusText = document.getElementById('statusText');
        if (statusToggle && statusText) {
            statusToggle.addEventListener('change', () => {
                statusText.textContent = statusToggle.checked ? 'Hoạt động' : 'Ngừng hoạt động';
            });
        }
    }

    async loadConfigs() {
        try {
            Utils.showLoading();

            console.log('Loading fee configs from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FEE_CONFIGS);
            const response = await $api.get(CONFIG.ENDPOINTS.FEE_CONFIGS);
            console.log('Fee configs response received:', response);
            
            // Handle different response formats
            let configsArray = [];
            if (Array.isArray(response)) {
                configsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    configsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    configsArray = response.data;
                } else {
                    console.warn('Unexpected fee configs data format:', response);
                }
            }
            
            this.configs = configsArray || [];
            console.log('Fee configs loaded:', this.configs.length);
            this.renderConfigsTable();
            
        } catch (error) {
            console.error('Error loading fee configs:', error);
            const tbody = document.getElementById('configsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminFeeConfigs.loadConfigs()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách cấu hình phí: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderConfigsTable(configs = null) {
        const tbody = document.getElementById('configsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayConfigs = configs || this.configs;
        
        if (displayConfigs.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayConfigs.map(config => {
            // Handle both camelCase and PascalCase
            const maCauHinh = config.maCauHinh || config.MaCauHinh || '';
            const loai = config.loai || config.Loai || '';
            const mucToiThieu = config.mucToiThieu || config.MucToiThieu || 0;
            const trangThai = config.trangThai !== undefined ? config.trangThai : (config.TrangThai !== undefined ? config.TrangThai : true);

            const statusClass = trangThai ? 'badge-success' : 'badge-secondary';
            const statusText = trangThai ? 'Hoạt động' : 'Ngừng hoạt động';
            const loaiText = loai === 'Dien' ? 'Điện' : (loai === 'Nuoc' ? 'Nước' : loai);

            return `
                <tr>
                    <td data-label="Mã"><strong>${maCauHinh}</strong></td>
                    <td data-label="Loại">${loaiText}</td>
                    <td data-label="Mức tối thiểu"><strong>${Utils.formatCurrency(mucToiThieu)}</strong></td>
                    <td data-label="Trạng thái">
                        <span class="badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="editConfig(${maCauHinh})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteConfig(${maCauHinh})" title="Xóa">
                                <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openModal(config = null) {
        this.editingConfig = config;
        const modal = document.getElementById('configModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const statusText = document.getElementById('statusText');
        
        if (config) {
            if (modalTitleText) modalTitleText.textContent = 'Chỉnh sửa cấu hình';
            this.fillForm(config);
        } else {
            if (modalTitleText) modalTitleText.textContent = 'Thêm cấu hình';
            this.clearForm();
        }
        
        if (statusText) {
            const statusToggle = document.getElementById('trangThai');
            statusText.textContent = statusToggle && statusToggle.checked ? 'Hoạt động' : 'Ngừng hoạt động';
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('configModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingConfig = null;
        this.clearForm();
    }

    fillForm(config) {
        // Handle both camelCase and PascalCase
        const maCauHinh = config.maCauHinh || config.MaCauHinh || '';
        const loai = config.loai || config.Loai || '';
        const mucToiThieu = config.mucToiThieu || config.MucToiThieu || 0;
        const trangThai = config.trangThai !== undefined ? config.trangThai : (config.TrangThai !== undefined ? config.TrangThai : true);

        document.getElementById('configId').value = maCauHinh;
        document.getElementById('loai').value = loai;
        document.getElementById('mucToiThieu').value = mucToiThieu;
        document.getElementById('trangThai').checked = trangThai;
        
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = trangThai ? 'Hoạt động' : 'Ngừng hoạt động';
        }
    }

    clearForm() {
        const form = document.getElementById('configForm');
        if (form) form.reset();
        document.getElementById('configId').value = '';
        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = 'Hoạt động';
    }

    async saveConfig() {
        const form = document.getElementById('configForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        // Backend expects PascalCase field names
        const configData = {
            Loai: document.getElementById('loai').value.trim(),
            MucToiThieu: parseFloat(document.getElementById('mucToiThieu').value),
            TrangThai: document.getElementById('trangThai').checked
        };

        try {
            Utils.showLoading();

            const configId = this.editingConfig ? (this.editingConfig.maCauHinh || this.editingConfig.MaCauHinh) : null;

            if (this.editingConfig && configId) {
                await $api.put(CONFIG.ENDPOINTS.FEE_CONFIG_BY_ID(configId), configData);
                Utils.showAlert('Cập nhật cấu hình phí thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.FEE_CONFIGS, configData);
                Utils.showAlert('Thêm cấu hình phí thành công!', 'success');
            }
            
            this.closeModal();
            await this.loadConfigs();

        } catch (error) {
            console.error('Error saving fee config:', error);
            Utils.showAlert('Lỗi lưu cấu hình phí: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteConfig(configId) {
        if (!confirm('Bạn có chắc chắn muốn xóa cấu hình phí này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.FEE_CONFIG_BY_ID(configId));

            Utils.showAlert('Xóa cấu hình phí thành công!', 'success');
            await this.loadConfigs();

        } catch (error) {
            console.error('Error deleting fee config:', error);
            Utils.showAlert('Lỗi xóa cấu hình phí: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function openConfigModal() {
    window.adminFeeConfigs.openModal();
}

function closeConfigModal() {
    window.adminFeeConfigs.closeModal();
}

function saveConfig() {
    window.adminFeeConfigs.saveConfig();
}

async function editConfig(configId) {
    try {
        Utils.showLoading();
        
        const response = await $api.get(CONFIG.ENDPOINTS.FEE_CONFIG_BY_ID(configId));
        console.log('Fee config response:', response);
        
        // Handle different response formats
        let config = null;
        if (response && typeof response === 'object') {
            if (response.maCauHinh || response.MaCauHinh) {
                config = response;
            } else if (response.data) {
                config = response.data;
            } else if (response.success && response.data) {
                config = response.data;
            }
        }
        
        if (!config) {
            throw new Error('Không tìm thấy thông tin cấu hình phí');
        }
        
        window.adminFeeConfigs.openModal(config);
    } catch (error) {
        console.error('Error loading fee config:', error);
        Utils.showAlert('Lỗi tải thông tin cấu hình phí: ' + error.message, 'danger');
    } finally {
        Utils.hideLoading();
    }
}

function deleteConfig(configId) {
    window.adminFeeConfigs.deleteConfig(configId);
}

function filterConfigs() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = window.adminFeeConfigs.configs.filter(config => {
        // Handle both camelCase and PascalCase
        const maCauHinh = (config.maCauHinh || config.MaCauHinh || '').toString();
        const loai = (config.loai || config.Loai || '').toLowerCase();
        const trangThai = config.trangThai !== undefined ? config.trangThai : (config.TrangThai !== undefined ? config.TrangThai : true);
        
        const matchSearch = !searchInput || 
            loai.includes(searchInput) ||
            maCauHinh.includes(searchInput);
        
        const matchType = !typeFilter || loai === typeFilter.toLowerCase();
        
        const matchStatus = !statusFilter || 
            (statusFilter === 'true' && trangThai) ||
            (statusFilter === 'false' && !trangThai);
        
        return matchSearch && matchType && matchStatus;
    });
    
    window.adminFeeConfigs.renderConfigsTable(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    window.adminFeeConfigs.renderConfigsTable();
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        Utils.removeToken();
        Utils.removeUser();
        window.location.href = '../index.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.adminFeeConfigs = new AdminFeeConfigs();
});


