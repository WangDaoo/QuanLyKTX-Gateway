// Student Contract Module
class StudentContract {
    constructor() {
        this.contracts = [];
        this.currentContract = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.loadContracts();
        this.loadCurrentContract();
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

    async loadContracts() {
        try {
            Utils.showLoading();
            
            const data = await $api.get(CONFIG.ENDPOINTS.USER_CONTRACTS);
            this.contracts = Array.isArray(data) ? data : [];
            
            this.renderContracts();
            
        } catch (error) {
            console.error('Error loading contracts:', error);
            Utils.showAlert('Lỗi tải danh sách hợp đồng: ' + error.message, 'danger');
            this.contracts = [];
            this.renderContracts();
        } finally {
            Utils.hideLoading();
        }
    }

    renderContracts() {
        const tbody = document.getElementById('contractsTableBody');
        const noContractMessage = document.getElementById('noContractMessage');
        const contractsTableContainer = document.getElementById('contractsTableContainer');
        
        if (!tbody) return;
        
        if (this.contracts.length === 0) {
            tbody.innerHTML = '';
            if (noContractMessage) noContractMessage.style.display = 'block';
            if (contractsTableContainer) contractsTableContainer.style.display = 'none';
            return;
        }

        if (noContractMessage) noContractMessage.style.display = 'none';
        if (contractsTableContainer) contractsTableContainer.style.display = 'block';

        tbody.innerHTML = this.contracts.map(contract => {
            let statusClass = 'badge-secondary';
            const trangThai = contract.trangThai || contract.TrangThai || '';
            if (trangThai === 'Đang hoạt động' || trangThai === 'Dang hoat dong') statusClass = 'badge-success';
            else if (trangThai === 'Đã hết hạn' || trangThai === 'Da het han') statusClass = 'badge-danger';
            else if (trangThai === 'Đang chờ' || trangThai === 'Dang cho') statusClass = 'badge-warning';
            
            return `
                <tr>
                    <td><strong>${contract.maHopDong || contract.MaHopDong}</strong></td>
                    <td>${contract.soPhong || contract.SoPhong || '-'}</td>
                    <td>${contract.ngayBatDau ? Utils.formatDate(contract.ngayBatDau) : (contract.NgayBatDau ? Utils.formatDate(contract.NgayBatDau) : '-')}</td>
                    <td>${contract.ngayKetThuc ? Utils.formatDate(contract.ngayKetThuc) : (contract.NgayKetThuc ? Utils.formatDate(contract.NgayKetThuc) : '-')}</td>
                    <td>
                        <span class="badge ${statusClass}">
                            ${trangThai}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-info" onclick="viewContractDetails(${contract.maHopDong || contract.MaHopDong})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${(trangThai === 'Chờ duyệt' || trangThai === 'Cho duyet') ? `
                                <button class="btn btn-sm btn-success" onclick="confirmContract(${contract.maHopDong || contract.MaHopDong})" title="Xác nhận hợp đồng">
                                    <i class="fas fa-check"></i> Xác nhận
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async viewContractDetails(contractId) {
        const contract = this.contracts.find(c => (c.maHopDong || c.MaHopDong) === contractId);
        if (!contract) {
            Utils.showAlert('Không tìm thấy hợp đồng', 'danger');
            return;
        }

        try {
            Utils.showLoading();
            
            this.currentContract = contract;
            this.renderContractDetails();
            
            document.getElementById('contractDetailsId').textContent = contractId;
            
            const modal = document.getElementById('contractDetailsModal');
            modal.classList.add('show');
            
        } catch (error) {
            console.error('Error loading contract details:', error);
            Utils.showAlert('Lỗi tải chi tiết hợp đồng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderContractDetails() {
        if (!this.currentContract) return;
        
        const contract = this.currentContract;
        const detailsInfo = document.getElementById('contractDetailsInfo');
        
        if (!detailsInfo) return;
        
        const trangThai = contract.trangThai || contract.TrangThai || '';
        let statusBadge = 'badge-secondary';
        if (trangThai === 'Đang hoạt động' || trangThai === 'Dang hoat dong') statusBadge = 'badge-success';
        else if (trangThai === 'Đã hết hạn' || trangThai === 'Da het han') statusBadge = 'badge-danger';
        else if (trangThai === 'Đang chờ' || trangThai === 'Dang cho') statusBadge = 'badge-warning';
        
        detailsInfo.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="info-item">
                                <label><i class="fas fa-id-card"></i> Mã hợp đồng:</label>
                                <span><strong>${contract.maHopDong || contract.MaHopDong}</strong></span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-door-open"></i> Phòng:</label>
                                <span>${contract.soPhong || contract.SoPhong || '-'}</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-calendar-check"></i> Ngày bắt đầu:</label>
                                <span>${contract.ngayBatDau ? Utils.formatDate(contract.ngayBatDau) : (contract.NgayBatDau ? Utils.formatDate(contract.NgayBatDau) : '-')}</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-calendar-times"></i> Ngày kết thúc:</label>
                                <span>${contract.ngayKetThuc ? Utils.formatDate(contract.ngayKetThuc) : (contract.NgayKetThuc ? Utils.formatDate(contract.NgayKetThuc) : '-')}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="info-item">
                                <label><i class="fas fa-info-circle"></i> Trạng thái:</label>
                                <span><span class="badge ${statusBadge}">${trangThai}</span></span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-money-bill-wave"></i> Tiền cọc:</label>
                                <span class="text-primary">${contract.tienCoc ? Utils.formatCurrency(contract.tienCoc) : (contract.TienCoc ? Utils.formatCurrency(contract.TienCoc) : '-')}</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-money-bill"></i> Tiền phòng/tháng:</label>
                                <span class="text-success">${contract.tienPhong ? Utils.formatCurrency(contract.tienPhong) : (contract.TienPhong ? Utils.formatCurrency(contract.TienPhong) : '-')}</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-align-left"></i> Ghi chú:</label>
                                <span>${contract.ghiChu || contract.GhiChu || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    closeContractDetailsModal() {
        const modal = document.getElementById('contractDetailsModal');
        modal.classList.remove('show');
        this.currentContract = null;
    }
    
    async confirmContract(contractId) {
        if (!confirm('Bạn có chắc chắn muốn xác nhận hợp đồng này? Hợp đồng sẽ có hiệu lực sau khi xác nhận.')) {
            return;
        }
        
        try {
            Utils.showLoading();
            
            await $api.put(CONFIG.ENDPOINTS.USER_CONTRACT_CONFIRM(contractId), {});
            
            Utils.showAlert('Xác nhận hợp đồng thành công! Hợp đồng đã có hiệu lực.', 'success');
            await this.loadContracts();
            
        } catch (error) {
            console.error('Error confirming contract:', error);
            Utils.showAlert('Lỗi xác nhận hợp đồng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
    
    async loadCurrentContract() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.USER_CONTRACTS_CURRENT);
            if (data) {
                // Hiển thị hợp đồng hiện tại nếu có
                console.log('Current contract:', data);
                // Highlight current contract in the list
                this.currentContract = data;
                await this.loadContracts(); // Reload to highlight
            }
        } catch (error) {
            console.error('Error loading current contract:', error);
        }
    }
}

// Global functions
function viewContractDetails(contractId) {
    window.studentContract.viewContractDetails(contractId);
}

function closeContractDetailsModal() {
    window.studentContract.closeContractDetailsModal();
}

function confirmContract(contractId) {
    window.studentContract.confirmContract(contractId);
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
    window.studentContract = new StudentContract();
});

