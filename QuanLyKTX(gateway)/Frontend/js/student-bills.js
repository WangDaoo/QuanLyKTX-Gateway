// Student Bills Module
class StudentBills {
    constructor() {
        this.bills = [];
        this.currentBillDetails = [];
        this.currentBillId = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.loadBills();
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

    async loadBills() {
        try {
            Utils.showLoading();
            
            const data = await $api.get(CONFIG.ENDPOINTS.USER_BILLS);
            this.bills = Array.isArray(data) ? data : [];
            
            this.renderBillsTable();
            
        } catch (error) {
            console.error('Error loading bills:', error);
            Utils.showAlert('Lỗi tải danh sách hóa đơn: ' + error.message, 'danger');
            this.bills = [];
            this.renderBillsTable();
        } finally {
            Utils.hideLoading();
        }
    }

    renderBillsTable(bills = null) {
        const tbody = document.getElementById('billsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayBills = bills || this.bills;
        
        if (!tbody) return;
        
        if (displayBills.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayBills.map(bill => {
            let statusClass = 'badge-secondary';
            if (bill.trangThai === 'Đã thanh toán' || bill.trangThai === 'Da thanh toan') statusClass = 'badge-success';
            else if (bill.trangThai === 'Chưa thanh toán' || bill.trangThai === 'Chua thanh toan') statusClass = 'badge-warning';
            else if (bill.trangThai === 'Quá hạn' || bill.trangThai === 'Qua han') statusClass = 'badge-danger';

            const hanThanhToan = bill.hanThanhToan ? Utils.formatDate(bill.hanThanhToan) : 'Chưa có';
            const isOverdue = bill.hanThanhToan && new Date(bill.hanThanhToan) < new Date() && bill.trangThai !== 'Đã thanh toán' && bill.trangThai !== 'Da thanh toan';
            
            return `
                <tr ${isOverdue ? 'style="background-color: #fff3cd;"' : ''}>
                    <td><strong>${bill.maHoaDon || bill.MaHoaDon}</strong></td>
                    <td>
                        <span class="badge badge-info">
                            ${bill.thang || bill.Thang}/${bill.nam || bill.Nam}
                        </span>
                    </td>
                    <td><strong>${Utils.formatCurrency(bill.tongTien || bill.TongTien)}</strong></td>
                    <td>
                        <span class="badge ${statusClass}">
                            ${bill.trangThai || bill.TrangThai}
                        </span>
                    </td>
                    <td>${hanThanhToan}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-info" onclick="viewBillDetails(${bill.maHoaDon || bill.MaHoaDon})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async viewBillDetails(billId) {
        const bill = this.bills.find(b => (b.maHoaDon || b.MaHoaDon) === billId);
        if (!bill) {
            Utils.showAlert('Không tìm thấy hóa đơn', 'danger');
            return;
        }

        try {
            Utils.showLoading();
            
            // Load bill details từ user endpoint (nếu có)
            let details = [];
            try {
                // Thử lấy chi tiết hóa đơn (các khoản phí)
                const billDetails = await $api.get(CONFIG.ENDPOINTS.USER_BILL_DETAILS(billId));
                if (billDetails && Array.isArray(billDetails)) {
                    details = billDetails;
                } else if (billDetails && (billDetails.chiTiet || billDetails.ChiTiet || billDetails.chiTietHoaDon || billDetails.ChiTietHoaDon)) {
                    details = billDetails.chiTiet || billDetails.ChiTiet || billDetails.chiTietHoaDon || billDetails.ChiTietHoaDon || [];
                }
            } catch (detailError) {
                console.warn('Không thể tải chi tiết hóa đơn, hiển thị thông tin cơ bản.', detailError);
            }

            this.currentBillDetails = Array.isArray(details) ? details : [];
            this.currentBillId = billId;
            
            // Display bill info
            const billInfo = document.getElementById('billDetailsInfo');
            if (billInfo) {
                billInfo.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Mã HĐ:</strong> ${bill.maHoaDon || bill.MaHoaDon}</p>
                                    <p><strong>Tháng/Năm:</strong> ${bill.thang || bill.Thang}/${bill.nam || bill.Nam}</p>
                                    <p><strong>Hạn thanh toán:</strong> ${bill.hanThanhToan ? Utils.formatDate(bill.hanThanhToan) : 'Chưa có'}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Tổng tiền:</strong> <span class="text-primary">${Utils.formatCurrency(bill.tongTien || bill.TongTien)}</span></p>
                                    <p><strong>Trạng thái:</strong> <span class="badge ${bill.trangThai === 'Đã thanh toán' || bill.trangThai === 'Da thanh toan' ? 'badge-success' : bill.trangThai === 'Quá hạn' || bill.trangThai === 'Qua han' ? 'badge-danger' : 'badge-warning'}">${bill.trangThai || bill.TrangThai}</span></p>
                                    ${bill.ngayThanhToan ? `<p><strong>Ngày thanh toán:</strong> ${Utils.formatDate(bill.ngayThanhToan)}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            document.getElementById('billDetailsId').textContent = billId;
            this.renderBillDetailsTable();
            
            const modal = document.getElementById('billDetailsModal');
            modal.classList.add('show');
            
        } catch (error) {
            console.error('Error loading bill details:', error);
            Utils.showAlert('Lỗi tải chi tiết hóa đơn: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderBillDetailsTable() {
        const tbody = document.getElementById('billDetailsTableBody');
        if (!tbody) return;
        
        if (!this.currentBillDetails || this.currentBillDetails.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có chi tiết hóa đơn</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.currentBillDetails.map(detail => `
            <tr>
                <td>${detail.loaiChiPhi || detail.LoaiChiPhi}</td>
                <td>${detail.soLuong || detail.SoLuong}</td>
                <td>${Utils.formatCurrency(detail.donGia || detail.DonGia)}</td>
                <td><strong>${Utils.formatCurrency(detail.thanhTien || detail.ThanhTien)}</strong></td>
                <td>${detail.ghiChu || detail.GhiChu || '-'}</td>
            </tr>
        `).join('');
    }

    closeBillDetailsModal() {
        const modal = document.getElementById('billDetailsModal');
        modal.classList.remove('show');
        this.currentBillDetails = [];
        this.currentBillId = null;
    }
}

// Global functions
function viewBillDetails(billId) {
    window.studentBills.viewBillDetails(billId);
}

function closeBillDetailsModal() {
    window.studentBills.closeBillDetailsModal();
}

function filterBills() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const monthFilter = document.getElementById('monthFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = window.studentBills.bills.filter(bill => {
        const matchSearch = !searchInput || 
            (bill.maHoaDon || bill.MaHoaDon).toString().includes(searchInput);
        
        const matchMonth = !monthFilter || (bill.thang || bill.Thang) === parseInt(monthFilter);
        const matchStatus = !statusFilter || (bill.trangThai || bill.TrangThai) === statusFilter;
        
        return matchSearch && matchMonth && matchStatus;
    });
    
    window.studentBills.renderBillsTable(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('monthFilter').value = '';
    document.getElementById('statusFilter').value = '';
    window.studentBills.renderBillsTable();
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
    window.studentBills = new StudentBills();
});

