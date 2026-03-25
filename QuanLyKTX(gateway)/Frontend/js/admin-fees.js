// Admin Fees Module
class AdminFees {
    constructor() {
        this.fees = [];
        this.editingFee = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            await this.loadFees();
            this.setupForm();
            this.setupStatusToggle();
        } catch (error) {
            console.error('Failed to initialize AdminFees:', error);
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
        const form = document.getElementById('feeForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveFee();
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

    async loadFees() {
        try {
            Utils.showLoading();

            console.log('Loading fees from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FEES);
            const response = await $api.get(CONFIG.ENDPOINTS.FEES);
            console.log('Fees response received:', response);
            
            // Handle different response formats
            let feesArray = [];
            if (Array.isArray(response)) {
                feesArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    feesArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    feesArray = response.data;
                } else {
                    console.warn('Unexpected fees data format:', response);
                }
            }
            
            this.fees = feesArray || [];
            console.log('Fees loaded:', this.fees.length);
            this.renderFeesTable();
            this.populateTypeFilter();
            
        } catch (error) {
            console.error('Error loading fees:', error);
            const tbody = document.getElementById('feesTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminFees.loadFees()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách mức phí: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    populateTypeFilter() {
        const filter = document.getElementById('typeFilter');
        if (!filter) return;

        const types = [...new Set(this.fees.map(fee => fee.loaiPhi || fee.LoaiPhi || '').filter(Boolean))];
        filter.innerHTML = '<option value="">Tất cả loại phí</option>';
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            filter.appendChild(option);
        });
    }

    async loadFeesByType(loaiPhi) {
        try {
            Utils.showLoading();
            console.log('Loading fees by type:', loaiPhi);
            
            const response = await $api.get(CONFIG.ENDPOINTS.FEES_BY_TYPE(loaiPhi));
            console.log('Fees by type response:', response);
            
            let feesArray = [];
            if (Array.isArray(response)) {
                feesArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    feesArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    feesArray = response.data;
                }
            }
            
            this.renderFeesTable(feesArray);
            Utils.showAlert(`Đã tải ${feesArray.length} mức phí loại "${loaiPhi}"`, 'success');
        } catch (error) {
            console.error('Error loading fees by type:', error);
            Utils.showAlert('Lỗi tải mức phí theo loại: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderFeesTable(fees = null) {
        const tbody = document.getElementById('feesTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayFees = fees || this.fees;
        
        if (displayFees.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayFees.map(fee => {
            // Handle both camelCase and PascalCase
            const maMucPhi = fee.maMucPhi || fee.MaMucPhi || '';
            const tenMucPhi = fee.tenMucPhi || fee.TenMucPhi || '';
            const loaiPhi = fee.loaiPhi || fee.LoaiPhi || '';
            const giaTien = fee.giaTien || fee.GiaTien || 0;
            const donVi = fee.donVi || fee.DonVi || '';
            const trangThai = fee.trangThai !== undefined ? fee.trangThai : (fee.TrangThai !== undefined ? fee.TrangThai : true);
            const ghiChu = fee.ghiChu || fee.GhiChu || '';

            const statusClass = trangThai ? 'badge-success' : 'badge-secondary';
            const statusText = trangThai ? 'Hoạt động' : 'Ngừng hoạt động';

            return `
                <tr>
                    <td data-label="Mã"><strong>${maMucPhi}</strong></td>
                    <td data-label="Tên mức phí">${tenMucPhi}</td>
                    <td data-label="Loại phí">${loaiPhi}</td>
                    <td data-label="Giá tiền"><strong>${Utils.formatCurrency(giaTien)}</strong></td>
                    <td data-label="Đơn vị">${donVi || 'N/A'}</td>
                    <td data-label="Trạng thái">
                        <span class="badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="editFee(${maMucPhi})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="viewFeeDetails(${maMucPhi})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i> <span class="btn-text">Xem</span>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteFee(${maMucPhi})" title="Xóa">
                                <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openModal(fee = null) {
        this.editingFee = fee;
        const modal = document.getElementById('feeModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const statusText = document.getElementById('statusText');
        
        if (fee) {
            if (modalTitleText) modalTitleText.textContent = 'Chỉnh sửa mức phí';
            this.fillForm(fee);
        } else {
            if (modalTitleText) modalTitleText.textContent = 'Thêm mức phí';
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
        const modal = document.getElementById('feeModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingFee = null;
        this.clearForm();
    }

    fillForm(fee) {
        // Handle both camelCase and PascalCase
        const maMucPhi = fee.maMucPhi || fee.MaMucPhi || '';
        const tenMucPhi = fee.tenMucPhi || fee.TenMucPhi || '';
        const loaiPhi = fee.loaiPhi || fee.LoaiPhi || '';
        const giaTien = fee.giaTien || fee.GiaTien || 0;
        const donVi = fee.donVi || fee.DonVi || '';
        const trangThai = fee.trangThai !== undefined ? fee.trangThai : (fee.TrangThai !== undefined ? fee.TrangThai : true);
        const ghiChu = fee.ghiChu || fee.GhiChu || '';

        document.getElementById('feeId').value = maMucPhi;
        document.getElementById('tenMucPhi').value = tenMucPhi;
        document.getElementById('loaiPhi').value = loaiPhi;
        document.getElementById('giaTien').value = giaTien;
        document.getElementById('donVi').value = donVi;
        document.getElementById('trangThai').checked = trangThai;
        document.getElementById('ghiChu').value = ghiChu;
        
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = trangThai ? 'Hoạt động' : 'Ngừng hoạt động';
        }
    }

    clearForm() {
        const form = document.getElementById('feeForm');
        if (form) form.reset();
        document.getElementById('feeId').value = '';
        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = 'Hoạt động';
    }

    async saveFee() {
        const form = document.getElementById('feeForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        // Backend expects PascalCase field names
        const feeData = {
            TenMucPhi: document.getElementById('tenMucPhi').value.trim(),
            LoaiPhi: document.getElementById('loaiPhi').value.trim(),
            GiaTien: parseFloat(document.getElementById('giaTien').value),
            DonVi: document.getElementById('donVi').value.trim() || null,
            TrangThai: document.getElementById('trangThai').checked,
            GhiChu: document.getElementById('ghiChu').value.trim() || null
        };

        try {
            Utils.showLoading();

            const feeId = this.editingFee ? (this.editingFee.maMucPhi || this.editingFee.MaMucPhi) : null;

            if (this.editingFee && feeId) {
                await $api.put(CONFIG.ENDPOINTS.FEE_BY_ID(feeId), feeData);
                Utils.showAlert('Cập nhật mức phí thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.FEES, feeData);
                Utils.showAlert('Thêm mức phí thành công!', 'success');
            }
            
            this.closeModal();
            await this.loadFees();

        } catch (error) {
            console.error('Error saving fee:', error);
            Utils.showAlert('Lỗi lưu mức phí: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteFee(feeId) {
        if (!confirm('Bạn có chắc chắn muốn xóa mức phí này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.FEE_BY_ID(feeId));

            Utils.showAlert('Xóa mức phí thành công!', 'success');
            await this.loadFees();

        } catch (error) {
            console.error('Error deleting fee:', error);
            Utils.showAlert('Lỗi xóa mức phí: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async viewDetails(feeId) {
        try {
            Utils.showLoading();
            
            const response = await $api.get(CONFIG.ENDPOINTS.FEE_BY_ID(feeId));
            console.log('Fee details response:', response);
            
            // Handle different response formats
            let fee = null;
            if (response && typeof response === 'object') {
                if (response.maMucPhi || response.MaMucPhi) {
                    fee = response;
                } else if (response.data) {
                    fee = response.data;
                } else if (response.success && response.data) {
                    fee = response.data;
                }
            }
            
            if (!fee) {
                throw new Error('Không tìm thấy thông tin mức phí');
            }
            
            // Handle both camelCase and PascalCase
            const maMucPhi = fee.maMucPhi || fee.MaMucPhi || '';
            const tenMucPhi = fee.tenMucPhi || fee.TenMucPhi || '';
            const loaiPhi = fee.loaiPhi || fee.LoaiPhi || '';
            const giaTien = fee.giaTien || fee.GiaTien || 0;
            const donVi = fee.donVi || fee.DonVi || '';
            const trangThai = fee.trangThai !== undefined ? fee.trangThai : (fee.TrangThai !== undefined ? fee.TrangThai : true);
            const ghiChu = fee.ghiChu || fee.GhiChu || '';
            
            const details = `Chi tiết mức phí:\n\n` +
                `Mã: ${maMucPhi}\n` +
                `Tên mức phí: ${tenMucPhi}\n` +
                `Loại phí: ${loaiPhi}\n` +
                `Giá tiền: ${Utils.formatCurrency(giaTien)}\n` +
                `Đơn vị: ${donVi || 'N/A'}\n` +
                `Trạng thái: ${trangThai ? 'Hoạt động' : 'Ngừng hoạt động'}\n` +
                `Ghi chú: ${ghiChu || 'Không có'}`;
            
            alert(details);
        } catch (error) {
            console.error('Error loading fee details:', error);
            Utils.showAlert('Lỗi tải chi tiết mức phí: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function openFeeModal() {
    window.adminFees.openModal();
}

function closeFeeModal() {
    window.adminFees.closeModal();
}

function saveFee() {
    window.adminFees.saveFee();
}

async function editFee(feeId) {
    try {
        Utils.showLoading();
        
        const response = await $api.get(CONFIG.ENDPOINTS.FEE_BY_ID(feeId));
        console.log('Fee response:', response);
        
        // Handle different response formats
        let fee = null;
        if (response && typeof response === 'object') {
            if (response.maMucPhi || response.MaMucPhi) {
                fee = response;
            } else if (response.data) {
                fee = response.data;
            } else if (response.success && response.data) {
                fee = response.data;
            }
        }
        
        if (!fee) {
            throw new Error('Không tìm thấy thông tin mức phí');
        }
        
        window.adminFees.openModal(fee);
    } catch (error) {
        console.error('Error loading fee:', error);
        Utils.showAlert('Lỗi tải thông tin mức phí: ' + error.message, 'danger');
    } finally {
        Utils.hideLoading();
    }
}

function deleteFee(feeId) {
    window.adminFees.deleteFee(feeId);
}

function viewFeeDetails(feeId) {
    window.adminFees.viewDetails(feeId);
}

async function filterFees() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    // Nếu có chọn loại phí, gọi API endpoint
    if (typeFilter) {
        try {
            Utils.showLoading();
            const response = await $api.get(CONFIG.ENDPOINTS.FEES_BY_TYPE(typeFilter));
            
            let feesArray = [];
            if (Array.isArray(response)) {
                feesArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    feesArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    feesArray = response.data;
                }
            }
            
            // Filter thêm theo search và status (client-side)
            let filtered = feesArray.filter(fee => {
                const maMucPhi = (fee.maMucPhi || fee.MaMucPhi || '').toString();
                const tenMucPhi = (fee.tenMucPhi || fee.TenMucPhi || '').toLowerCase();
                const trangThai = fee.trangThai !== undefined ? fee.trangThai : (fee.TrangThai !== undefined ? fee.TrangThai : true);
                
                const matchSearch = !searchInput || 
                    tenMucPhi.includes(searchInput) ||
                    maMucPhi.includes(searchInput);
                
                const matchStatus = !statusFilter || 
                    (statusFilter === 'true' && trangThai) ||
                    (statusFilter === 'false' && !trangThai);
                
                return matchSearch && matchStatus;
            });
            
            window.adminFees.renderFeesTable(filtered);
        } catch (error) {
            console.error('Error filtering fees by type:', error);
            Utils.showAlert('Lỗi lọc mức phí theo loại: ' + error.message, 'danger');
            // Fallback to client-side filtering
            filterFeesClientSide();
        } finally {
            Utils.hideLoading();
        }
    } else {
        // Nếu không chọn loại phí, filter client-side như cũ
        filterFeesClientSide();
    }
}

function filterFeesClientSide() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = window.adminFees.fees.filter(fee => {
        // Handle both camelCase and PascalCase
        const maMucPhi = (fee.maMucPhi || fee.MaMucPhi || '').toString();
        const tenMucPhi = (fee.tenMucPhi || fee.TenMucPhi || '').toLowerCase();
        const loaiPhi = (fee.loaiPhi || fee.LoaiPhi || '').toLowerCase();
        const trangThai = fee.trangThai !== undefined ? fee.trangThai : (fee.TrangThai !== undefined ? fee.TrangThai : true);
        
        const matchSearch = !searchInput || 
            tenMucPhi.includes(searchInput) ||
            maMucPhi.includes(searchInput);
        
        const matchType = !typeFilter || loaiPhi === typeFilter.toLowerCase();
        
        const matchStatus = !statusFilter || 
            (statusFilter === 'true' && trangThai) ||
            (statusFilter === 'false' && !trangThai);
        
        return matchSearch && matchType && matchStatus;
    });
    
    window.adminFees.renderFeesTable(filtered);
}

async function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    // Reload all fees from server
    await window.adminFees.loadFees();
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
    window.adminFees = new AdminFees();
});

