// Admin Receipts Module
class AdminReceipts {
    constructor() {
        this.receipts = [];
        this.bills = [];
        this.students = [];
        this.editingReceipt = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            await Promise.all([
                this.loadStudents(),
                this.loadBills()
            ]);
            this.populateStudentFilter();
            this.populateBillFilter();
            this.populateBillSelect();
            await this.loadReceipts();
            this.setupForm();
        } catch (error) {
            console.error('Failed to initialize AdminReceipts:', error);
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

    async loadStudents() {
        try {
            const response = await $api.get(CONFIG.ENDPOINTS.STUDENTS);
            console.log('Students response:', response);
            
            let studentsArray = [];
            if (Array.isArray(response)) {
                studentsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    studentsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    studentsArray = response.data;
                }
            }
            
            this.students = studentsArray || [];
            console.log('Students loaded:', this.students.length);
        } catch (error) {
            console.error('Error loading students:', error);
            this.students = [];
        }
    }

    async loadBills() {
        try {
            const response = await $api.get(CONFIG.ENDPOINTS.BILLS);
            console.log('Bills response:', response);
            
            let billsArray = [];
            if (Array.isArray(response)) {
                billsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    billsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    billsArray = response.data;
                }
            }
            
            this.bills = billsArray || [];
            console.log('Bills loaded:', this.bills.length);
        } catch (error) {
            console.error('Error loading bills:', error);
            this.bills = [];
        }
    }

    async loadReceipts() {
        try {
            Utils.showLoading();

            console.log('Loading receipts from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.RECEIPTS);
            const response = await $api.get(CONFIG.ENDPOINTS.RECEIPTS);
            console.log('Receipts response received:', response);
            
            // Handle different response formats
            let receiptsArray = [];
            if (Array.isArray(response)) {
                receiptsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    receiptsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    receiptsArray = response.data;
                } else {
                    console.warn('Unexpected receipts data format:', response);
                }
            }
            
            this.receipts = receiptsArray || [];
            console.log('Receipts loaded:', this.receipts.length);
            this.renderReceiptsTable();
            
        } catch (error) {
            console.error('Error loading receipts:', error);
            const tbody = document.getElementById('receiptsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminReceipts.loadReceipts()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách biên lai: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    populateStudentFilter() {
        const filter = document.getElementById('studentFilter');
        if (!filter) return;

        filter.innerHTML = '<option value="">Tất cả sinh viên</option>';
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.maSinhVien || student.MaSinhVien || '';
            const hoTen = student.hoTen || student.HoTen || '';
            const mssv = student.mssv || student.MSSV || '';
            option.textContent = mssv ? `${hoTen} (${mssv})` : hoTen;
            filter.appendChild(option);
        });
    }

    populateBillFilter() {
        const filter = document.getElementById('billFilter');
        if (!filter) return;

        filter.innerHTML = '<option value="">Tất cả hóa đơn</option>';
        this.bills.forEach(bill => {
            const option = document.createElement('option');
            option.value = bill.maHoaDon || bill.MaHoaDon || '';
            const thang = bill.thang || bill.Thang || 0;
            const nam = bill.nam || bill.Nam || 0;
            option.textContent = `HĐ #${option.value} - Tháng ${thang}/${nam}`;
            filter.appendChild(option);
        });
    }

    populateBillSelect() {
        const select = document.getElementById('maHoaDon');
        if (!select) return;

        select.innerHTML = '<option value="">Chọn hóa đơn</option>';
        this.bills.forEach(bill => {
            const option = document.createElement('option');
            option.value = bill.maHoaDon || bill.MaHoaDon || '';
            const thang = bill.thang || bill.Thang || 0;
            const nam = bill.nam || bill.Nam || 0;
            const tongTien = bill.tongTien || bill.TongTien || 0;
            const studentName = this.getStudentName(bill.maSinhVien || bill.MaSinhVien);
            option.textContent = `HĐ #${option.value} - ${studentName} - ${Utils.formatCurrency(tongTien)} (${thang}/${nam})`;
            select.appendChild(option);
        });
    }

    setupForm() {
        const form = document.getElementById('receiptForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveReceipt();
            });
        }

        const billSelect = document.getElementById('maHoaDon');
        if (billSelect) {
            billSelect.addEventListener('change', () => {
                this.updateBillInfo(billSelect.value);
            });
        }
    }

    renderReceiptsTable(receipts = null) {
        const tbody = document.getElementById('receiptsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayReceipts = receipts || this.receipts;
        
        if (displayReceipts.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        if (tbody) {
            tbody.innerHTML = displayReceipts.map(receipt => {
                // Handle both camelCase and PascalCase
                const maBienLai = receipt.maBienLai || receipt.MaBienLai || '';
                const maHoaDon = receipt.maHoaDon || receipt.MaHoaDon;
                const soTienThu = receipt.soTienThu || receipt.SoTienThu || 0;
                const ngayThu = receipt.ngayThu || receipt.NgayThu;
                const phuongThucThanhToan = receipt.phuongThucThanhToan || receipt.PhuongThucThanhToan || '';
                const nguoiThu = receipt.nguoiThu || receipt.NguoiThu || '';

                const bill = this.getBillById(maHoaDon);
                const studentName = bill ? this.getStudentName(bill.maSinhVien || bill.MaSinhVien) : 'N/A';
                const billLabel = bill ? `Tháng ${bill.thang || bill.Thang}/${bill.nam || bill.Nam}` : `Hóa đơn #${maHoaDon}`;

                return `
                    <tr>
                        <td data-label="Mã biên lai"><strong>${maBienLai}</strong></td>
                        <td data-label="Hóa đơn">
                            <div class="building-name">
                                <i class="fas fa-file-invoice-dollar"></i>
                                HĐ #${maHoaDon}
                            </div>
                            <small class="text-muted">${billLabel}</small>
                        </td>
                        <td data-label="Sinh viên">${studentName}</td>
                        <td data-label="Số tiền"><strong>${Utils.formatCurrency(soTienThu)}</strong></td>
                        <td data-label="Ngày thu">${ngayThu ? Utils.formatDate(ngayThu) : 'N/A'}</td>
                        <td data-label="Phương thức">
                            <span class="badge badge-info">${phuongThucThanhToan}</span>
                        </td>
                        <td data-label="Người thu">${nguoiThu || '<span class="text-muted">(Không xác định)</span>'}</td>
                        <td data-label="Thao tác">
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-warning" onclick="editReceipt(${maBienLai})" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                                </button>
                                <button class="btn btn-sm btn-info" onclick="viewReceiptDetails(${maBienLai})" title="Xem chi tiết">
                                    <i class="fas fa-eye"></i> <span class="btn-text">Xem</span>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteReceipt(${maBienLai})" title="Xóa">
                                    <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    openModal(receipt = null) {
        this.editingReceipt = receipt;
        const modal = document.getElementById('receiptModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const saveButtonText = document.getElementById('saveButtonText');
        
        if (receipt) {
            if (modalTitleText) modalTitleText.textContent = 'Chỉnh sửa biên lai';
            if (saveButtonText) saveButtonText.textContent = 'Cập nhật';
            this.fillForm(receipt);
        } else {
            if (modalTitleText) modalTitleText.textContent = 'Tạo biên lai';
            if (saveButtonText) saveButtonText.textContent = 'Thêm mới';
            this.clearForm();
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('receiptModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingReceipt = null;
        this.clearForm();
    }

    fillForm(receipt) {
        // Handle both camelCase and PascalCase
        const maBienLai = receipt.maBienLai || receipt.MaBienLai || '';
        const maHoaDon = receipt.maHoaDon || receipt.MaHoaDon || '';
        const soTienThu = receipt.soTienThu || receipt.SoTienThu || 0;
        const ngayThu = receipt.ngayThu || receipt.NgayThu;
        const phuongThucThanhToan = receipt.phuongThucThanhToan || receipt.PhuongThucThanhToan || 'Tiền mặt';
        const nguoiThu = receipt.nguoiThu || receipt.NguoiThu || '';
        const ghiChu = receipt.ghiChu || receipt.GhiChu || '';

        const ngayThuFormatted = ngayThu ? new Date(ngayThu).toISOString().split('T')[0] : '';

        document.getElementById('receiptId').value = maBienLai;
        document.getElementById('maHoaDon').value = maHoaDon;
        document.getElementById('soTienThu').value = soTienThu;
        document.getElementById('ngayThu').value = ngayThuFormatted;
        document.getElementById('phuongThucThanhToan').value = phuongThucThanhToan;
        document.getElementById('nguoiThu').value = nguoiThu;
        document.getElementById('ghiChu').value = ghiChu;
        this.updateBillInfo(maHoaDon);
    }

    clearForm() {
        const form = document.getElementById('receiptForm');
        if (form) form.reset();
        document.getElementById('receiptId').value = '';
        this.updateBillInfo('');
    }

    updateBillInfo(billId) {
        const infoEl = document.getElementById('billInfo');
        if (!infoEl) return;

        if (!billId) {
            infoEl.textContent = '';
            return;
        }

        const bill = this.getBillById(parseInt(billId, 10));
        if (!bill) {
            infoEl.textContent = 'Không tìm thấy thông tin hóa đơn';
            return;
        }

        const tongTien = bill.tongTien || bill.TongTien || 0;
        const trangThai = bill.trangThai || bill.TrangThai || '';
        const hanThanhToan = bill.hanThanhToan || bill.HanThanhToan;
        const studentName = this.getStudentName(bill.maSinhVien || bill.MaSinhVien);

        const details = [
            `Sinh viên: ${studentName}`,
            `Số tiền: ${Utils.formatCurrency(tongTien)}`,
            `Trạng thái: ${trangThai}`
        ];
        if (hanThanhToan) {
            details.push(`Hạn thanh toán: ${Utils.formatDate(hanThanhToan)}`);
        }

        infoEl.textContent = details.join(' • ');
    }

    async saveReceipt() {
        const form = document.getElementById('receiptForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        // Backend expects PascalCase field names
        const receiptData = {
            MaHoaDon: parseInt(document.getElementById('maHoaDon').value),
            SoTienThu: parseFloat(document.getElementById('soTienThu').value),
            NgayThu: document.getElementById('ngayThu').value,
            PhuongThucThanhToan: document.getElementById('phuongThucThanhToan').value.trim(),
            NguoiThu: document.getElementById('nguoiThu').value.trim() || null,
            GhiChu: document.getElementById('ghiChu').value.trim() || null
        };

        try {
            Utils.showLoading();

            const receiptId = this.editingReceipt ? (this.editingReceipt.maBienLai || this.editingReceipt.MaBienLai) : null;

            if (this.editingReceipt && receiptId) {
                await $api.put(CONFIG.ENDPOINTS.RECEIPT_BY_ID(receiptId), receiptData);
                Utils.showAlert('Cập nhật biên lai thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.RECEIPTS, receiptData);
                Utils.showAlert('Tạo biên lai thành công!', 'success');
            }
            
            this.closeModal();
            await this.loadReceipts();

        } catch (error) {
            console.error('Error saving receipt:', error);
            Utils.showAlert('Lỗi lưu biên lai: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteReceipt(receiptId) {
        if (!confirm('Bạn có chắc chắn muốn xóa biên lai này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.RECEIPT_BY_ID(receiptId));

            Utils.showAlert('Xóa biên lai thành công!', 'success');
            await this.loadReceipts();

        } catch (error) {
            console.error('Error deleting receipt:', error);
            Utils.showAlert('Lỗi xóa biên lai: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async viewDetails(receiptId) {
        try {
            Utils.showLoading();
            
            const response = await $api.get(CONFIG.ENDPOINTS.RECEIPT_BY_ID(receiptId));
            console.log('Receipt details response:', response);
            
            // Handle different response formats
            let receipt = null;
            if (response && typeof response === 'object') {
                if (response.maBienLai || response.MaBienLai) {
                    receipt = response;
                } else if (response.data) {
                    receipt = response.data;
                } else if (response.success && response.data) {
                    receipt = response.data;
                }
            }
            
            if (!receipt) {
                throw new Error('Không tìm thấy thông tin biên lai');
            }
            
            // Handle both camelCase and PascalCase
            const maBienLai = receipt.maBienLai || receipt.MaBienLai || '';
            const maHoaDon = receipt.maHoaDon || receipt.MaHoaDon;
            const soTienThu = receipt.soTienThu || receipt.SoTienThu || 0;
            const ngayThu = receipt.ngayThu || receipt.NgayThu;
            const phuongThucThanhToan = receipt.phuongThucThanhToan || receipt.PhuongThucThanhToan || '';
            const nguoiThu = receipt.nguoiThu || receipt.NguoiThu || '(Không xác định)';
            const ghiChu = receipt.ghiChu || receipt.GhiChu || '(Không có)';
            
            const bill = this.getBillById(maHoaDon);
            const studentName = bill ? this.getStudentName(bill.maSinhVien || bill.MaSinhVien) : 'N/A';
            const billInfo = bill
                ? `Hóa đơn #${bill.maHoaDon || bill.MaHoaDon} - Tháng ${bill.thang || bill.Thang}/${bill.nam || bill.Nam}`
                : `Hóa đơn #${maHoaDon}`;
            
            const details = `Chi tiết biên lai:\n\n` +
                `Mã biên lai: ${maBienLai}\n` +
                `Sinh viên: ${studentName}\n` +
                `${billInfo}\n` +
                `Số tiền thu: ${Utils.formatCurrency(soTienThu)}\n` +
                `Ngày thu: ${ngayThu ? Utils.formatDate(ngayThu) : 'N/A'}\n` +
                `Phương thức: ${phuongThucThanhToan}\n` +
                `Người thu: ${nguoiThu}\n` +
                `Ghi chú: ${ghiChu}`;
            
            alert(details);
        } catch (error) {
            console.error('Error loading receipt details:', error);
            Utils.showAlert('Lỗi tải chi tiết biên lai: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    filterReceipts() {
        const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const studentFilter = document.getElementById('studentFilter')?.value || '';
        const billFilter = document.getElementById('billFilter')?.value || '';
        const dateFilter = document.getElementById('dateFilter')?.value || '';
        const methodFilter = document.getElementById('methodFilter')?.value || '';
        
        let filtered = this.receipts.filter(receipt => {
            // Handle both camelCase and PascalCase
            const maBienLai = (receipt.maBienLai || receipt.MaBienLai || '').toString();
            const maHoaDon = receipt.maHoaDon || receipt.MaHoaDon;
            const soTienThu = receipt.soTienThu || receipt.SoTienThu || 0;
            const ngayThu = receipt.ngayThu || receipt.NgayThu || '';
            const phuongThucThanhToan = receipt.phuongThucThanhToan || receipt.PhuongThucThanhToan || '';
            const nguoiThu = receipt.nguoiThu || receipt.NguoiThu || '';
            const ghiChu = receipt.ghiChu || receipt.GhiChu || '';

            const bill = this.getBillById(maHoaDon);
            const studentName = bill ? this.getStudentName(bill.maSinhVien || bill.MaSinhVien) : '';
            const studentIdFromBill = bill ? (bill.maSinhVien || bill.MaSinhVien)?.toString() : '';

            const matchesSearch = !searchInput ||
                maBienLai.includes(searchInput) ||
                maHoaDon.toString().includes(searchInput) ||
                studentName.toLowerCase().includes(searchInput) ||
                soTienThu.toString().includes(searchInput) ||
                nguoiThu.toLowerCase().includes(searchInput) ||
                ghiChu.toLowerCase().includes(searchInput);

            const matchesStudent = !studentFilter || studentIdFromBill === studentFilter.toString();
            const matchesBill = !billFilter || maHoaDon.toString() === billFilter.toString();
            const matchesDate = !dateFilter || (ngayThu && ngayThu.toString().startsWith(dateFilter));
            const matchesMethod = !methodFilter || phuongThucThanhToan === methodFilter;

            return matchesSearch && matchesStudent && matchesBill && matchesDate && matchesMethod;
        });
        
        this.renderReceiptsTable(filtered);
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('studentFilter').value = '';
        document.getElementById('billFilter').value = '';
        document.getElementById('dateFilter').value = '';
        document.getElementById('methodFilter').value = '';
        this.renderReceiptsTable();
    }

    getBillById(id) {
        return this.bills.find(b => (b.maHoaDon || b.MaHoaDon) === id);
    }

    getStudentName(studentId) {
        if (!studentId) return 'N/A';
        const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === studentId);
        if (!student) return `Mã SV ${studentId}`;
        const name = student.hoTen || student.HoTen || `Mã SV ${studentId}`;
        const mssv = student.mssv || student.MSSV;
        return mssv ? `${name} (${mssv})` : name;
    }
}

// Global functions
function openReceiptModal() {
    window.adminReceipts.openModal();
}

function closeReceiptModal() {
    window.adminReceipts.closeModal();
}

function saveReceipt() {
    window.adminReceipts.saveReceipt();
}

async function editReceipt(receiptId) {
    try {
        Utils.showLoading();
        
        const response = await $api.get(CONFIG.ENDPOINTS.RECEIPT_BY_ID(receiptId));
        console.log('Receipt response:', response);
        
        // Handle different response formats
        let receipt = null;
        if (response && typeof response === 'object') {
            if (response.maBienLai || response.MaBienLai) {
                receipt = response;
            } else if (response.data) {
                receipt = response.data;
            } else if (response.success && response.data) {
                receipt = response.data;
            }
        }
        
        if (!receipt) {
            throw new Error('Không tìm thấy thông tin biên lai');
        }
        
        window.adminReceipts.openModal(receipt);
    } catch (error) {
        console.error('Error loading receipt:', error);
        Utils.showAlert('Lỗi tải thông tin biên lai: ' + error.message, 'danger');
    } finally {
        Utils.hideLoading();
    }
}

function deleteReceipt(receiptId) {
    window.adminReceipts.deleteReceipt(receiptId);
}

function viewReceiptDetails(receiptId) {
    window.adminReceipts.viewDetails(receiptId);
}

function filterReceipts() {
    window.adminReceipts.filterReceipts();
}

function resetFilters() {
    window.adminReceipts.resetFilters();
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
    window.adminReceipts = new AdminReceipts();
});
