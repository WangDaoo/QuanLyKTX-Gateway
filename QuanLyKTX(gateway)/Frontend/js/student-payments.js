// Student Payments Module
class StudentPayments {
    constructor() {
        this.payments = [];
        this.currentPayment = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.loadPayments();
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

    async loadPayments() {
        try {
            Utils.showLoading();
            
            const data = await $api.get(CONFIG.ENDPOINTS.USER_RECEIPTS);
            this.payments = Array.isArray(data) ? data : [];
            
            this.renderPayments();
            
        } catch (error) {
            console.error('Error loading payments:', error);
            Utils.showAlert('Lỗi tải lịch sử thanh toán: ' + error.message, 'danger');
            this.payments = [];
            this.renderPayments();
        } finally {
            Utils.hideLoading();
        }
    }

    renderPayments(payments = null) {
        const tbody = document.getElementById('paymentsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayPayments = payments || this.payments;
        
        if (!tbody) return;
        
        if (displayPayments.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayPayments.map(payment => {
            return `
                <tr>
                    <td><strong>${payment.maBienLai || payment.MaBienLai}</strong></td>
                    <td>${payment.maHoaDon || payment.MaHoaDon}</td>
                    <td><strong class="text-success">${Utils.formatCurrency(payment.soTien || payment.SoTien || payment.soTienThu || payment.SoTienThu)}</strong></td>
                    <td>${payment.ngayThanhToan ? Utils.formatDate(payment.ngayThanhToan) : (payment.NgayThanhToan ? Utils.formatDate(payment.NgayThanhToan) : (payment.ngayThu ? Utils.formatDate(payment.ngayThu) : (payment.NgayThu ? Utils.formatDate(payment.NgayThu) : '-')))}</td>
                    <td>${payment.phuongThuc || payment.PhuongThuc || payment.phuongThucThanhToan || payment.PhuongThucThanhToan || '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-info" onclick="viewPaymentDetails(${payment.maBienLai || payment.MaBienLai})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async viewPaymentDetails(receiptId) {
        const payment = this.payments.find(p => (p.maBienLai || p.MaBienLai) === receiptId);
        if (!payment) {
            Utils.showAlert('Không tìm thấy biên lai', 'danger');
            return;
        }

        try {
            Utils.showLoading();
            
            this.currentPayment = payment;
            this.renderPaymentDetails();
            
            document.getElementById('paymentDetailsId').textContent = receiptId;
            
            const modal = document.getElementById('paymentDetailsModal');
            modal.classList.add('show');
            
        } catch (error) {
            console.error('Error loading payment details:', error);
            Utils.showAlert('Lỗi tải chi tiết biên lai: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderPaymentDetails() {
        if (!this.currentPayment) return;
        
        const payment = this.currentPayment;
        const detailsInfo = document.getElementById('paymentDetailsInfo');
        
        if (!detailsInfo) return;
        
        detailsInfo.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="info-item">
                                <label><i class="fas fa-id-card"></i> Mã biên lai:</label>
                                <span><strong>${payment.maBienLai || payment.MaBienLai}</strong></span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-file-invoice-dollar"></i> Mã hóa đơn:</label>
                                <span>${payment.maHoaDon || payment.MaHoaDon}</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-calendar-check"></i> Ngày thanh toán:</label>
                                <span>${payment.ngayThanhToan ? Utils.formatDate(payment.ngayThanhToan) : (payment.NgayThanhToan ? Utils.formatDate(payment.NgayThanhToan) : (payment.ngayThu ? Utils.formatDate(payment.ngayThu) : (payment.NgayThu ? Utils.formatDate(payment.NgayThu) : '-')))}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="info-item">
                                <label><i class="fas fa-money-bill-wave"></i> Số tiền:</label>
                                <span class="text-success font-weight-bold">${Utils.formatCurrency(payment.soTien || payment.SoTien || payment.soTienThu || payment.SoTienThu)}</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-credit-card"></i> Phương thức:</label>
                                <span>${payment.phuongThuc || payment.PhuongThuc || payment.phuongThucThanhToan || payment.PhuongThucThanhToan || '-'}</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-align-left"></i> Ghi chú:</label>
                                <span>${payment.ghiChu || payment.GhiChu || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    closePaymentDetailsModal() {
        const modal = document.getElementById('paymentDetailsModal');
        modal.classList.remove('show');
        this.currentPayment = null;
    }
}

// Global functions
function viewPaymentDetails(receiptId) {
    window.studentPayments.viewPaymentDetails(receiptId);
}

function closePaymentDetailsModal() {
    window.studentPayments.closePaymentDetailsModal();
}

function filterPayments() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const dateFrom = document.getElementById('dateFromFilter').value;
    const dateTo = document.getElementById('dateToFilter').value;
    
    let filtered = window.studentPayments.payments.filter(payment => {
        const matchSearch = !searchInput || 
            (payment.maBienLai || payment.MaBienLai).toString().includes(searchInput) ||
            (payment.maHoaDon || payment.MaHoaDon).toString().includes(searchInput);
        
        const paymentDate = payment.ngayThanhToan || payment.NgayThanhToan;
        let matchDateFrom = true;
        let matchDateTo = true;
        
        if (dateFrom && paymentDate) {
            matchDateFrom = new Date(paymentDate) >= new Date(dateFrom);
        }
        
        if (dateTo && paymentDate) {
            const dateToObj = new Date(dateTo);
            dateToObj.setHours(23, 59, 59, 999); // End of day
            matchDateTo = new Date(paymentDate) <= dateToObj;
        }
        
        return matchSearch && matchDateFrom && matchDateTo;
    });
    
    window.studentPayments.renderPayments(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('dateFromFilter').value = '';
    document.getElementById('dateToFilter').value = '';
    window.studentPayments.renderPayments();
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
    window.studentPayments = new StudentPayments();
});

