// Admin Price Tiers Module
class AdminPriceTiers {
    constructor() {
        this.priceTiers = [];
        this.editingPriceTier = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            await this.loadPriceTiers();
            this.setupForm();
            this.setupStatusToggle();
        } catch (error) {
            console.error('Failed to initialize AdminPriceTiers:', error);
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
        const form = document.getElementById('priceTierForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePriceTier();
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

    async loadPriceTiers() {
        try {
            Utils.showLoading();

            console.log('Loading price tiers from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PRICE_TIERS);
            const response = await $api.get(CONFIG.ENDPOINTS.PRICE_TIERS);
            console.log('Price tiers response received:', response);
            
            // Handle different response formats
            let priceTiersArray = [];
            if (Array.isArray(response)) {
                priceTiersArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    priceTiersArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    priceTiersArray = response.data;
                } else {
                    console.warn('Unexpected price tiers data format:', response);
                }
            }
            
            this.priceTiers = priceTiersArray || [];
            console.log('Price tiers loaded:', this.priceTiers.length);
            this.renderPriceTiersTable();
            
        } catch (error) {
            console.error('Error loading price tiers:', error);
            const tbody = document.getElementById('priceTiersTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminPriceTiers.loadPriceTiers()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách bậc giá: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderPriceTiersTable(priceTiers = null) {
        const tbody = document.getElementById('priceTiersTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayPriceTiers = priceTiers || this.priceTiers;
        
        if (displayPriceTiers.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayPriceTiers.map(tier => {
            // Handle both camelCase and PascalCase
            const maBac = tier.maBac || tier.MaBac || '';
            const loai = tier.loai || tier.Loai || '';
            const thuTu = tier.thuTu || tier.ThuTu || 0;
            const tuSo = tier.tuSo !== null && tier.tuSo !== undefined ? tier.tuSo : (tier.TuSo !== null && tier.TuSo !== undefined ? tier.TuSo : null);
            const denSo = tier.denSo !== null && tier.denSo !== undefined ? tier.denSo : (tier.DenSo !== null && tier.DenSo !== undefined ? tier.DenSo : null);
            const donGia = tier.donGia || tier.DonGia || 0;
            const trangThai = tier.trangThai !== undefined ? tier.trangThai : (tier.TrangThai !== undefined ? tier.TrangThai : true);

            const statusClass = trangThai ? 'badge-success' : 'badge-secondary';
            const statusText = trangThai ? 'Hoạt động' : 'Ngừng hoạt động';
            const loaiText = loai === 'Dien' ? 'Điện' : (loai === 'Nuoc' ? 'Nước' : loai);
            const rangeText = tuSo !== null && denSo !== null ? `${tuSo} - ${denSo}` : (tuSo !== null ? `≥ ${tuSo}` : 'Không giới hạn');

            return `
                <tr>
                    <td data-label="Mã"><strong>${maBac}</strong></td>
                    <td data-label="Loại">${loaiText}</td>
                    <td data-label="Thứ tự">${thuTu}</td>
                    <td data-label="Từ số">${tuSo !== null ? tuSo : 'N/A'}</td>
                    <td data-label="Đến số">${denSo !== null ? denSo : 'N/A'}</td>
                    <td data-label="Đơn giá"><strong>${Utils.formatCurrency(donGia)}</strong></td>
                    <td data-label="Trạng thái">
                        <span class="badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="editPriceTier(${maBac})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deletePriceTier(${maBac})" title="Xóa">
                                <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openModal(priceTier = null) {
        this.editingPriceTier = priceTier;
        const modal = document.getElementById('priceTierModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const statusText = document.getElementById('statusText');
        
        if (priceTier) {
            if (modalTitleText) modalTitleText.textContent = 'Chỉnh sửa bậc giá';
            this.fillForm(priceTier);
        } else {
            if (modalTitleText) modalTitleText.textContent = 'Thêm bậc giá';
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
        const modal = document.getElementById('priceTierModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingPriceTier = null;
        this.clearForm();
    }

    fillForm(priceTier) {
        // Handle both camelCase and PascalCase
        const maBac = priceTier.maBac || priceTier.MaBac || '';
        const loai = priceTier.loai || priceTier.Loai || '';
        const thuTu = priceTier.thuTu || priceTier.ThuTu || 0;
        const tuSo = priceTier.tuSo !== null && priceTier.tuSo !== undefined ? priceTier.tuSo : (priceTier.TuSo !== null && priceTier.TuSo !== undefined ? priceTier.TuSo : '');
        const denSo = priceTier.denSo !== null && priceTier.denSo !== undefined ? priceTier.denSo : (priceTier.DenSo !== null && priceTier.DenSo !== undefined ? priceTier.DenSo : '');
        const donGia = priceTier.donGia || priceTier.DonGia || 0;
        const trangThai = priceTier.trangThai !== undefined ? priceTier.trangThai : (priceTier.TrangThai !== undefined ? priceTier.TrangThai : true);

        document.getElementById('priceTierId').value = maBac;
        document.getElementById('loai').value = loai;
        document.getElementById('thuTu').value = thuTu;
        document.getElementById('tuSo').value = tuSo !== null ? tuSo : '';
        document.getElementById('denSo').value = denSo !== null ? denSo : '';
        document.getElementById('donGia').value = donGia;
        document.getElementById('trangThai').checked = trangThai;
        
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = trangThai ? 'Hoạt động' : 'Ngừng hoạt động';
        }
    }

    clearForm() {
        const form = document.getElementById('priceTierForm');
        if (form) form.reset();
        document.getElementById('priceTierId').value = '';
        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = 'Hoạt động';
    }

    async savePriceTier() {
        const form = document.getElementById('priceTierForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        // Backend expects PascalCase field names
        const priceTierData = {
            Loai: document.getElementById('loai').value.trim(),
            ThuTu: parseInt(document.getElementById('thuTu').value),
            TuSo: document.getElementById('tuSo').value ? parseInt(document.getElementById('tuSo').value) : null,
            DenSo: document.getElementById('denSo').value ? parseInt(document.getElementById('denSo').value) : null,
            DonGia: parseFloat(document.getElementById('donGia').value),
            TrangThai: document.getElementById('trangThai').checked
        };

        try {
            Utils.showLoading();

            const priceTierId = this.editingPriceTier ? (this.editingPriceTier.maBac || this.editingPriceTier.MaBac) : null;

            if (this.editingPriceTier && priceTierId) {
                await $api.put(CONFIG.ENDPOINTS.PRICE_TIER_BY_ID(priceTierId), priceTierData);
                Utils.showAlert('Cập nhật bậc giá thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.PRICE_TIERS, priceTierData);
                Utils.showAlert('Thêm bậc giá thành công!', 'success');
            }
            
            this.closeModal();
            await this.loadPriceTiers();

        } catch (error) {
            console.error('Error saving price tier:', error);
            Utils.showAlert('Lỗi lưu bậc giá: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deletePriceTier(priceTierId) {
        if (!confirm('Bạn có chắc chắn muốn xóa bậc giá này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.PRICE_TIER_BY_ID(priceTierId));

            Utils.showAlert('Xóa bậc giá thành công!', 'success');
            await this.loadPriceTiers();

        } catch (error) {
            console.error('Error deleting price tier:', error);
            Utils.showAlert('Lỗi xóa bậc giá: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function openPriceTierModal() {
    window.adminPriceTiers.openModal();
}

function closePriceTierModal() {
    window.adminPriceTiers.closeModal();
}

function savePriceTier() {
    window.adminPriceTiers.savePriceTier();
}

async function editPriceTier(priceTierId) {
    try {
        Utils.showLoading();
        
        const response = await $api.get(CONFIG.ENDPOINTS.PRICE_TIER_BY_ID(priceTierId));
        console.log('Price tier response:', response);
        
        // Handle different response formats
        let priceTier = null;
        if (response && typeof response === 'object') {
            if (response.maBac || response.MaBac) {
                priceTier = response;
            } else if (response.data) {
                priceTier = response.data;
            } else if (response.success && response.data) {
                priceTier = response.data;
            }
        }
        
        if (!priceTier) {
            throw new Error('Không tìm thấy thông tin bậc giá');
        }
        
        window.adminPriceTiers.openModal(priceTier);
    } catch (error) {
        console.error('Error loading price tier:', error);
        Utils.showAlert('Lỗi tải thông tin bậc giá: ' + error.message, 'danger');
    } finally {
        Utils.hideLoading();
    }
}

function deletePriceTier(priceTierId) {
    window.adminPriceTiers.deletePriceTier(priceTierId);
}

async function filterPriceTiers() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    // Nếu có chọn loại, gọi API endpoint
    if (typeFilter) {
        try {
            Utils.showLoading();
            const response = await $api.get(CONFIG.ENDPOINTS.PRICE_TIERS_BY_TYPE(typeFilter));
            
            let tiersArray = [];
            if (Array.isArray(response)) {
                tiersArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    tiersArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    tiersArray = response.data;
                }
            }
            
            // Filter thêm theo search và status (client-side)
            let filtered = tiersArray.filter(tier => {
                const maBac = (tier.maBac || tier.MaBac || '').toString();
                const loai = (tier.loai || tier.Loai || '').toLowerCase();
                const thuTu = (tier.thuTu || tier.ThuTu || 0).toString();
                const trangThai = tier.trangThai !== undefined ? tier.trangThai : (tier.TrangThai !== undefined ? tier.TrangThai : true);
                
                const matchSearch = !searchInput || 
                    loai.includes(searchInput) ||
                    maBac.includes(searchInput) ||
                    thuTu.includes(searchInput);
                
                const matchStatus = !statusFilter || 
                    (statusFilter === 'true' && trangThai) ||
                    (statusFilter === 'false' && !trangThai);
                
                return matchSearch && matchStatus;
            });
            
            window.adminPriceTiers.renderPriceTiersTable(filtered);
        } catch (error) {
            console.error('Error filtering price tiers by type:', error);
            Utils.showAlert('Lỗi lọc bậc giá theo loại: ' + error.message, 'danger');
            // Fallback to client-side filtering
            filterPriceTiersClientSide();
        } finally {
            Utils.hideLoading();
        }
    } else {
        // Nếu không chọn loại, filter client-side như cũ
        filterPriceTiersClientSide();
    }
}

function filterPriceTiersClientSide() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = window.adminPriceTiers.priceTiers.filter(tier => {
        // Handle both camelCase and PascalCase
        const maBac = (tier.maBac || tier.MaBac || '').toString();
        const loai = (tier.loai || tier.Loai || '').toLowerCase();
        const thuTu = (tier.thuTu || tier.ThuTu || 0).toString();
        const trangThai = tier.trangThai !== undefined ? tier.trangThai : (tier.TrangThai !== undefined ? tier.TrangThai : true);
        
        const matchSearch = !searchInput || 
            loai.includes(searchInput) ||
            maBac.includes(searchInput) ||
            thuTu.includes(searchInput);
        
        const matchType = !typeFilter || loai === typeFilter.toLowerCase();
        
        const matchStatus = !statusFilter || 
            (statusFilter === 'true' && trangThai) ||
            (statusFilter === 'false' && !trangThai);
        
        return matchSearch && matchType && matchStatus;
    });
    
    window.adminPriceTiers.renderPriceTiersTable(filtered);
}

async function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    // Reload all price tiers from server
    await window.adminPriceTiers.loadPriceTiers();
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
    window.adminPriceTiers = new AdminPriceTiers();
});

