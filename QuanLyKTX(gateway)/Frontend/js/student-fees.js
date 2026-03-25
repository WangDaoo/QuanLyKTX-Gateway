// Student Fees Module
class StudentFees {
    constructor() {
        this.fees = [];
        this.buildings = [];
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.loadFees();
        this.loadBuildings();
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = user.hoTen || user.HoTen || user.tenDangNhap || 'Sinh viên';
            }
        }
    }

    async loadFees() {
        try {
            Utils.showLoading();
            
            const data = await $api.get(CONFIG.ENDPOINTS.USER_FEES);
            this.fees = Array.isArray(data) ? data : [];
            
            this.renderFeesTable();
            
        } catch (error) {
            console.error('Error loading fees:', error);
            Utils.showAlert('Lỗi tải danh sách mức phí: ' + error.message, 'danger');
            this.fees = [];
            this.renderFeesTable();
        } finally {
            Utils.hideLoading();
        }
    }

    async loadBuildings() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.USER_BUILDINGS);
            this.buildings = Array.isArray(data) ? data : [];
        } catch (error) {
            console.warn('Could not load buildings:', error);
            this.buildings = [];
        }
    }

    renderFeesTable(fees = null) {
        const tbody = document.getElementById('feesTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayFees = fees || this.fees;
        
        if (!tbody) return;
        
        if (displayFees.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayFees.map(fee => {
            const maMucPhi = fee.maMucPhi || fee.MaMucPhi || '';
            const tenMucPhi = fee.tenMucPhi || fee.TenMucPhi || '';
            const loaiPhi = fee.loaiPhi || fee.LoaiPhi || '';
            const donGia = fee.donGia || fee.DonGia || 0;
            const donVi = fee.donVi || fee.DonVi || '';
            const moTa = fee.moTa || fee.MoTa || '';
            const apDungTu = fee.apDungTu || fee.ApDungTu;
            const trangThai = fee.trangThai || fee.TrangThai || '';

            let statusClass = 'badge-secondary';
            if (trangThai === 'Đang áp dụng' || trangThai === 'Dang ap dung') statusClass = 'badge-success';
            else if (trangThai === 'Ngừng áp dụng' || trangThai === 'Ngung ap dung') statusClass = 'badge-danger';

            let typeIcon = 'fas fa-tag';
            let typeColor = '#6c757d';
            if (loaiPhi === 'Điện') {
                typeIcon = 'fas fa-bolt';
                typeColor = '#ffc107';
            } else if (loaiPhi === 'Nước') {
                typeIcon = 'fas fa-tint';
                typeColor = '#17a2b8';
            } else if (loaiPhi === 'Phí phòng') {
                typeIcon = 'fas fa-home';
                typeColor = '#28a745';
            } else if (loaiPhi === 'Phí dịch vụ') {
                typeIcon = 'fas fa-concierge-bell';
                typeColor = '#dc3545';
            }

            return `
                <tr>
                    <td><strong>${maMucPhi}</strong></td>
                    <td>
                        <i class="${typeIcon}" style="color: ${typeColor}; margin-right: 0.5rem;"></i>
                        ${tenMucPhi}
                    </td>
                    <td><span class="badge badge-info">${loaiPhi}</span></td>
                    <td class="text-right">
                        <strong class="text-primary">${Utils.formatCurrency(donGia)}</strong>
                        ${donVi ? `<small class="text-muted">/${donVi}</small>` : ''}
                    </td>
                    <td>${moTa || '<span class="text-muted">(Không có)</span>'}</td>
                    <td>${apDungTu ? Utils.formatDate(apDungTu) : '-'}</td>
                    <td><span class="badge ${statusClass}">${trangThai}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewFeeDetails(${maMucPhi})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async viewFeeDetails(feeId) {
        try {
            Utils.showLoading();
            
            const data = await $api.get(CONFIG.ENDPOINTS.USER_FEE_BY_ID(feeId));
            
            const tenMucPhi = data.tenMucPhi || data.TenMucPhi || '';
            const loaiPhi = data.loaiPhi || data.LoaiPhi || '';
            const donGia = data.donGia || data.DonGia || 0;
            const donVi = data.donVi || data.DonVi || '';
            const moTa = data.moTa || data.MoTa || '';
            const apDungTu = data.apDungTu || data.ApDungTu;
            const trangThai = data.trangThai || data.TrangThai || '';
            
            const details = `Chi tiết mức phí:\n\n` +
                `Tên mức phí: ${tenMucPhi}\n` +
                `Loại phí: ${loaiPhi}\n` +
                `Đơn giá: ${Utils.formatCurrency(donGia)}${donVi ? `/${donVi}` : ''}\n` +
                `Mô tả: ${moTa || 'Không có'}\n` +
                `Áp dụng từ: ${apDungTu ? Utils.formatDate(apDungTu) : 'N/A'}\n` +
                `Trạng thái: ${trangThai}`;
            
            alert(details);
        } catch (error) {
            console.error('Error loading fee details:', error);
            Utils.showAlert('Lỗi tải chi tiết mức phí: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    filterFees() {
        const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('typeFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        let filtered = this.fees.filter(fee => {
            const tenMucPhi = (fee.tenMucPhi || fee.TenMucPhi || '').toLowerCase();
            const loaiPhi = fee.loaiPhi || fee.LoaiPhi || '';
            const trangThai = fee.trangThai || fee.TrangThai || '';
            
            const matchSearch = !searchInput || 
                tenMucPhi.includes(searchInput);
            
            const matchType = !typeFilter || loaiPhi === typeFilter;
            const matchStatus = !statusFilter || trangThai === statusFilter;
            
            return matchSearch && matchType && matchStatus;
        });
        
        this.renderFeesTable(filtered);
    }

    async loadFeesByType(loaiPhi) {
        if (!loaiPhi) {
            this.renderFeesTable();
            return;
        }
        
        try {
            Utils.showLoading();
            const data = await $api.get(CONFIG.ENDPOINTS.USER_FEES_BY_TYPE(loaiPhi));
            const fees = Array.isArray(data) ? data : [];
            this.renderFeesTable(fees);
        } catch (error) {
            console.error('Error loading fees by type:', error);
            Utils.showAlert('Lỗi tải mức phí theo loại: ' + error.message, 'danger');
            this.renderFeesTable();
        } finally {
            Utils.hideLoading();
        }
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('statusFilter').value = '';
        this.renderFeesTable();
    }
}

// Global functions
function viewFeeDetails(feeId) {
    window.studentFees.viewFeeDetails(feeId);
}

function filterFees() {
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    if (typeFilter) {
        window.studentFees.loadFeesByType(typeFilter);
    } else {
        window.studentFees.filterFees();
    }
}

function resetFilters() {
    window.studentFees.resetFilters();
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        Utils.removeToken();
        window.location.href = '../index.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.studentFees = new StudentFees();
});

