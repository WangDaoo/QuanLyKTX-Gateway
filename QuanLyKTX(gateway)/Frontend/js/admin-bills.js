// Admin Bills Module
class AdminBills {
    constructor() {
        this.bills = [];
        this.students = [];
        this.rooms = [];
        this.editingBill = null;
        this.currentBillDetails = [];
        this.currentBillId = null;
        this.editingDetail = null;
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
                this.loadRooms()
            ]);
            await this.loadBills();
            this.setupForm();

            const currentYear = new Date().getFullYear();
            const namEl = document.getElementById('nam');
            if (namEl) namEl.value = currentYear;
            const currentMonth = new Date().getMonth() + 1;
            const thangEl = document.getElementById('thang');
            if (thangEl) thangEl.value = currentMonth;
        } catch (error) {
            console.error('Failed to initialize AdminBills:', error);
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
            const userRole = document.querySelector('.user-role');
            if (userRole) {
                const roleMap = {
                    'Admin': 'Quản trị viên',
                    'Officer': 'Nhân viên',
                    'Student': 'Sinh viên'
                };
                const role = user.vaiTro || user.VaiTro || '';
                userRole.textContent = roleMap[role] || role;
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
            this.populateStudentFilter();
            this.populateStudentSelect();
        } catch (error) {
            console.error('Error loading students:', error);
            this.students = [];
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
            option.textContent = mssv ? `${hoTen} - ${mssv}` : hoTen;
            filter.appendChild(option);
        });
    }

    populateStudentSelect() {
        const select = document.getElementById('maSinhVien');
        if (!select) return;

        select.innerHTML = '<option value="">Chọn sinh viên</option>';
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.maSinhVien || student.MaSinhVien || '';
            const hoTen = student.hoTen || student.HoTen || '';
            const mssv = student.mssv || student.MSSV || '';
            option.textContent = mssv ? `${hoTen} - ${mssv}` : hoTen;
            select.appendChild(option);
        });
    }

    async loadRooms() {
        try {
            const response = await $api.get(CONFIG.ENDPOINTS.ROOMS);
            console.log('Rooms response:', response);
            
            let roomsArray = [];
            if (Array.isArray(response)) {
                roomsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    roomsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    roomsArray = response.data;
                }
            }
            
            this.rooms = roomsArray || [];
            console.log('Rooms loaded:', this.rooms.length);
            this.populateRoomSelect();
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.rooms = [];
        }
    }

    populateRoomSelect() {
        const select = document.getElementById('maPhong');
        if (!select) return;

        select.innerHTML = '<option value="">Chọn phòng</option>';
        this.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.maPhong || room.MaPhong || '';
            const soPhong = room.soPhong || room.SoPhong || '';
            const buildingName = room.tenToaNha || room.TenToaNha || '';
            option.textContent = buildingName ? `${soPhong} - ${buildingName}` : soPhong;
            select.appendChild(option);
        });
    }

    setupForm() {
        const form = document.getElementById('billForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBill();
            });
        }
    }

    async loadBills() {
        try {
            Utils.showLoading();

            console.log('Loading bills from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.BILLS);
            const response = await $api.get(CONFIG.ENDPOINTS.BILLS);
            console.log('Bills response received:', response);
            
            // Handle different response formats
            let billsArray = [];
            if (Array.isArray(response)) {
                billsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    billsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    billsArray = response.data;
                } else {
                    console.warn('Unexpected bills data format:', response);
                }
            }
            
            this.bills = billsArray || [];
            console.log('Bills loaded:', this.bills.length);
            this.renderBillsTable();
            
        } catch (error) {
            console.error('Error loading bills:', error);
            const tbody = document.getElementById('billsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminBills.loadBills()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách hóa đơn: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderBillsTable(bills = null) {
        const tbody = document.getElementById('billsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayBills = bills || this.bills;
        
        if (displayBills.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayBills.map(bill => {
            // Handle both camelCase and PascalCase
            const maHoaDon = bill.maHoaDon || bill.MaHoaDon || '';
            const maSinhVien = bill.maSinhVien || bill.MaSinhVien;
            const maPhong = bill.maPhong || bill.MaPhong;
            const thang = bill.thang || bill.Thang || 0;
            const nam = bill.nam || bill.Nam || 0;
            const tongTien = bill.tongTien || bill.TongTien || 0;
            const trangThai = bill.trangThai || bill.TrangThai || '';
            const hanThanhToan = bill.hanThanhToan || bill.HanThanhToan;

            const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            let studentName = 'N/A';
            if (student) {
                studentName = student.hoTen || student.HoTen || 'N/A';
            }
            
            const room = this.rooms.find(r => (r.maPhong || r.MaPhong) === maPhong);
            let roomInfo = maPhong ? `Phòng ${maPhong}` : 'N/A';
            if (room) {
                const soPhong = room.soPhong || room.SoPhong || '';
                const buildingName = room.tenToaNha || room.TenToaNha || '';
                roomInfo = buildingName ? `${soPhong} - ${buildingName}` : soPhong;
            }
            
            let statusClass = 'badge-secondary';
            if (trangThai === 'Đã thanh toán' || trangThai === 'Da thanh toan') statusClass = 'badge-success';
            else if (trangThai === 'Chưa thanh toán' || trangThai === 'Chua thanh toan') statusClass = 'badge-warning';
            else if (trangThai === 'Quá hạn' || trangThai === 'Qua han') statusClass = 'badge-danger';

            const hanThanhToanDisplay = hanThanhToan ? Utils.formatDate(hanThanhToan) : 'Chưa có';
            const isOverdue = hanThanhToan && new Date(hanThanhToan) < new Date() && trangThai !== 'Đã thanh toán' && trangThai !== 'Da thanh toan';
            
            return `
                <tr ${isOverdue ? 'style="background-color: #fff3cd;"' : ''}>
                    <td data-label="Mã HĐ"><strong>${maHoaDon}</strong></td>
                    <td data-label="Sinh viên">${studentName}</td>
                    <td data-label="Phòng">${roomInfo}</td>
                    <td data-label="Tháng/Năm">
                        <span class="badge badge-info">
                            ${thang}/${nam}
                        </span>
                    </td>
                    <td data-label="Tổng tiền"><strong>${Utils.formatCurrency(tongTien)}</strong></td>
                    <td data-label="Trạng thái">
                        <span class="badge ${statusClass}">
                            ${trangThai}
                        </span>
                    </td>
                    <td data-label="Hạn thanh toán">${hanThanhToanDisplay}</td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="editBill(${maHoaDon})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="viewBillDetails(${maHoaDon})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i> <span class="btn-text">Xem</span>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteBill(${maHoaDon})" title="Xóa">
                                <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openModal(bill = null) {
        this.editingBill = bill;
        const modal = document.getElementById('billModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const saveButtonText = document.getElementById('saveButtonText');
        
        if (bill) {
            if (modalTitleText) modalTitleText.textContent = 'Chỉnh sửa hóa đơn';
            if (saveButtonText) saveButtonText.textContent = 'Cập nhật';
            this.fillForm(bill);
        } else {
            if (modalTitleText) modalTitleText.textContent = 'Thêm hóa đơn';
            if (saveButtonText) saveButtonText.textContent = 'Thêm mới';
            this.clearForm();
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('billModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingBill = null;
        this.clearForm();
    }

    fillForm(bill) {
        // Handle both camelCase and PascalCase
        const maHoaDon = bill.maHoaDon || bill.MaHoaDon || '';
        const maSinhVien = bill.maSinhVien || bill.MaSinhVien || '';
        const maPhong = bill.maPhong || bill.MaPhong || '';
        const thang = bill.thang || bill.Thang || '';
        const nam = bill.nam || bill.Nam || '';
        const tongTien = bill.tongTien || bill.TongTien || 0;
        const trangThai = bill.trangThai || bill.TrangThai || '';
        const hanThanhToan = bill.hanThanhToan || bill.HanThanhToan;
        const ngayThanhToan = bill.ngayThanhToan || bill.NgayThanhToan;
        const ghiChu = bill.ghiChu || bill.GhiChu || '';

        document.getElementById('billId').value = maHoaDon;
        document.getElementById('maSinhVien').value = maSinhVien;
        document.getElementById('maPhong').value = maPhong;
        document.getElementById('thang').value = thang;
        document.getElementById('nam').value = nam;
        document.getElementById('tongTien').value = tongTien;
        document.getElementById('trangThai').value = trangThai;
        
        if (hanThanhToan) {
            const date = new Date(hanThanhToan);
            document.getElementById('hanThanhToan').value = date.toISOString().split('T')[0];
        }
        
        if (ngayThanhToan) {
            const date = new Date(ngayThanhToan);
            document.getElementById('ngayThanhToan').value = date.toISOString().split('T')[0];
        }
        
        document.getElementById('ghiChu').value = ghiChu;
    }

    clearForm() {
        document.getElementById('billForm').reset();
        document.getElementById('billId').value = '';
        const currentYear = new Date().getFullYear();
        document.getElementById('nam').value = currentYear;
        const currentMonth = new Date().getMonth() + 1;
        document.getElementById('thang').value = currentMonth;
    }

    async saveBill() {
        const form = document.getElementById('billForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        // Backend expects PascalCase field names
        const billData = {
            MaSinhVien: document.getElementById('maSinhVien').value ? parseInt(document.getElementById('maSinhVien').value) : null,
            MaPhong: document.getElementById('maPhong').value ? parseInt(document.getElementById('maPhong').value) : null,
            Thang: parseInt(document.getElementById('thang').value),
            Nam: parseInt(document.getElementById('nam').value),
            TongTien: parseFloat(document.getElementById('tongTien').value),
            TrangThai: document.getElementById('trangThai').value,
            HanThanhToan: document.getElementById('hanThanhToan').value ? new Date(document.getElementById('hanThanhToan').value) : null,
            NgayThanhToan: document.getElementById('ngayThanhToan').value ? new Date(document.getElementById('ngayThanhToan').value) : null,
            GhiChu: document.getElementById('ghiChu').value.trim() || null
        };

        try {
            Utils.showLoading();

            const billId = this.editingBill ? (this.editingBill.maHoaDon || this.editingBill.MaHoaDon) : null;

            if (this.editingBill && billId) {
                await $api.put(CONFIG.ENDPOINTS.BILL_BY_ID(billId), billData);
                Utils.showAlert('Cập nhật hóa đơn thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.BILLS, billData);
                Utils.showAlert('Thêm hóa đơn thành công!', 'success');
            }
            
            this.closeModal();
            await this.loadBills();

        } catch (error) {
            console.error('Error saving bill:', error);
            Utils.showAlert('Lỗi lưu hóa đơn: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteBill(billId) {
        if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.BILL_BY_ID(billId));

            Utils.showAlert('Xóa hóa đơn thành công!', 'success');
            await this.loadBills();

        } catch (error) {
            console.error('Error deleting bill:', error);
            Utils.showAlert('Lỗi xóa hóa đơn: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async calculateMonthly(thang, nam) {
        try {
            Utils.showLoading();
            
            const url = `${CONFIG.ENDPOINTS.BILL_CALCULATE_MONTHLY}?thang=${thang}&nam=${nam}`;
            const response = await $api.post(url, {});
            console.log('Calculate monthly response:', response);
            
            // Handle different response formats
            let result = null;
            if (response && typeof response === 'object') {
                if (response.generated !== undefined) {
                    result = response;
                } else if (response.data) {
                    result = response.data;
                } else if (response.success && response.data) {
                    result = response.data;
                }
            }
            
            const generated = result ? (result.generated || 0) : 0;
            Utils.showAlert(`Đã tạo ${generated} hóa đơn cho tháng ${thang}/${nam}!`, 'success');
            await this.loadBills();

        } catch (error) {
            console.error('Error calculating monthly bills:', error);
            Utils.showAlert('Lỗi tạo hóa đơn: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async viewBillDetails(billId) {
        try {
            Utils.showLoading();
            
            // Load bill info
            const billResponse = await $api.get(CONFIG.ENDPOINTS.BILL_BY_ID(billId));
            console.log('Bill response:', billResponse);
            
            // Handle different response formats
            let bill = null;
            if (billResponse && typeof billResponse === 'object') {
                if (billResponse.maHoaDon || billResponse.MaHoaDon) {
                    bill = billResponse;
                } else if (billResponse.data) {
                    bill = billResponse.data;
                } else if (billResponse.success && billResponse.data) {
                    bill = billResponse.data;
                }
            }
            
            if (!bill) {
                throw new Error('Không tìm thấy hóa đơn');
            }
            
            // Load bill details
            const detailsResponse = await $api.get(CONFIG.ENDPOINTS.BILL_DETAILS(billId));
            console.log('Bill details response:', detailsResponse);
            
            // Handle different response formats
            let detailsArray = [];
            if (Array.isArray(detailsResponse)) {
                detailsArray = detailsResponse;
            } else if (detailsResponse && typeof detailsResponse === 'object') {
                if (Array.isArray(detailsResponse.data)) {
                    detailsArray = detailsResponse.data;
                } else if (detailsResponse.success && Array.isArray(detailsResponse.data)) {
                    detailsArray = detailsResponse.data;
                }
            }
            
            this.currentBillDetails = detailsArray || [];
            this.currentBillId = billId;
            
            // Handle both camelCase and PascalCase
            const maHoaDon = bill.maHoaDon || bill.MaHoaDon || '';
            const maSinhVien = bill.maSinhVien || bill.MaSinhVien;
            const thang = bill.thang || bill.Thang || 0;
            const nam = bill.nam || bill.Nam || 0;
            const tongTien = bill.tongTien || bill.TongTien || 0;
            const trangThai = bill.trangThai || bill.TrangThai || '';
            const hanThanhToan = bill.hanThanhToan || bill.HanThanhToan;
            
            // Display bill info
            const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            const studentName = student ? (student.hoTen || student.HoTen) : 'N/A';
            
            let statusClass = 'badge-warning';
            if (trangThai === 'Đã thanh toán' || trangThai === 'Da thanh toan') statusClass = 'badge-success';
            else if (trangThai === 'Quá hạn' || trangThai === 'Qua han') statusClass = 'badge-danger';
            
            const billInfo = document.getElementById('billDetailsInfo');
            if (billInfo) {
                billInfo.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Mã HĐ:</strong> ${maHoaDon}</p>
                                    <p><strong>Sinh viên:</strong> ${studentName}</p>
                                    <p><strong>Tháng/Năm:</strong> ${thang}/${nam}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Tổng tiền:</strong> <span class="text-primary">${Utils.formatCurrency(tongTien)}</span></p>
                                    <p><strong>Trạng thái:</strong> <span class="badge ${statusClass}">${trangThai}</span></p>
                                    <p><strong>Hạn thanh toán:</strong> ${hanThanhToan ? Utils.formatDate(hanThanhToan) : 'Chưa có'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            const billDetailsIdEl = document.getElementById('billDetailsId');
            if (billDetailsIdEl) billDetailsIdEl.textContent = billId;
            this.renderBillDetailsTable();
            
            const modal = document.getElementById('billDetailsModal');
            if (modal) {
                modal.style.display = 'flex';
            }
            
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
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có chi tiết</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.currentBillDetails.map(detail => {
            // Handle both camelCase and PascalCase
            const maChiTiet = detail.maChiTiet || detail.MaChiTiet || '';
            const loaiChiPhi = detail.loaiChiPhi || detail.LoaiChiPhi || '';
            const soLuong = detail.soLuong || detail.SoLuong || 0;
            const donGia = detail.donGia || detail.DonGia || 0;
            const thanhTien = detail.thanhTien || detail.ThanhTien || 0;
            const ghiChu = detail.ghiChu || detail.GhiChu || '-';
            
            return `
                <tr>
                    <td data-label="Loại chi phí">${loaiChiPhi}</td>
                    <td data-label="Số lượng">${soLuong}</td>
                    <td data-label="Đơn giá">${Utils.formatCurrency(donGia)}</td>
                    <td data-label="Thành tiền"><strong>${Utils.formatCurrency(thanhTien)}</strong></td>
                    <td data-label="Ghi chú">${ghiChu}</td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="editDetail(${maChiTiet})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteDetail(${maChiTiet})" title="Xóa">
                                <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    closeBillDetailsModal() {
        const modal = document.getElementById('billDetailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentBillDetails = [];
        this.currentBillId = null;
    }

    openAddDetailModal() {
        this.editingDetail = null;
        const detailModalTitle = document.getElementById('detailModalTitle');
        const saveDetailButtonText = document.getElementById('saveDetailButtonText');
        const detailForm = document.getElementById('detailForm');
        const detailId = document.getElementById('detailId');
        const detailBillId = document.getElementById('detailBillId');
        const thanhTien = document.getElementById('thanhTien');
        
        if (detailModalTitle) detailModalTitle.innerHTML = '<i class="fas fa-plus"></i> Thêm Chi Tiết';
        if (saveDetailButtonText) saveDetailButtonText.textContent = 'Thêm mới';
        if (detailForm) detailForm.reset();
        if (detailId) detailId.value = '';
        if (detailBillId) detailBillId.value = this.currentBillId;
        if (thanhTien) thanhTien.value = '0';
        
        const modal = document.getElementById('detailModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeDetailModal() {
        const modal = document.getElementById('detailModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingDetail = null;
        const detailForm = document.getElementById('detailForm');
        if (detailForm) detailForm.reset();
    }

    async saveDetail() {
        const form = document.getElementById('detailForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        // Backend expects PascalCase field names
        const detailData = {
            LoaiChiPhi: document.getElementById('loaiChiPhi').value.trim(),
            SoLuong: parseInt(document.getElementById('soLuong').value),
            DonGia: parseFloat(document.getElementById('donGia').value),
            ThanhTien: parseFloat(document.getElementById('thanhTien').value),
            GhiChu: document.getElementById('detailGhiChu').value.trim() || null
        };

        try {
            Utils.showLoading();
            
            const billId = this.currentBillId;
            const detailId = this.editingDetail ? (this.editingDetail.maChiTiet || this.editingDetail.MaChiTiet) : null;
            
            if (this.editingDetail && detailId) {
                await $api.put(CONFIG.ENDPOINTS.BILL_DETAIL_BY_ID(billId, detailId), detailData);
                Utils.showAlert('Cập nhật chi tiết thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.BILL_DETAILS(billId), detailData);
                Utils.showAlert('Thêm chi tiết thành công!', 'success');
            }
            
            this.closeDetailModal();
            await this.viewBillDetails(billId);

        } catch (error) {
            console.error('Error saving detail:', error);
            Utils.showAlert('Lỗi lưu chi tiết: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteDetail(detailId) {
        if (!confirm('Bạn có chắc chắn muốn xóa chi tiết này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.BILL_DETAIL_BY_ID(this.currentBillId, detailId));
            
            Utils.showAlert('Xóa chi tiết thành công!', 'success');
            await this.viewBillDetails(this.currentBillId);

        } catch (error) {
            console.error('Error deleting detail:', error);
            Utils.showAlert('Lỗi xóa chi tiết: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    editDetail(detailId) {
        const detail = this.currentBillDetails.find(d => (d.maChiTiet || d.MaChiTiet) === detailId);
        if (!detail) return;
        
        this.editingDetail = detail;
        const detailModalTitle = document.getElementById('detailModalTitle');
        const saveDetailButtonText = document.getElementById('saveDetailButtonText');
        
        if (detailModalTitle) detailModalTitle.innerHTML = '<i class="fas fa-edit"></i> Chỉnh Sửa Chi Tiết';
        if (saveDetailButtonText) saveDetailButtonText.textContent = 'Cập nhật';
        
        // Handle both camelCase and PascalCase
        const loaiChiPhi = detail.loaiChiPhi || detail.LoaiChiPhi || '';
        const soLuong = detail.soLuong || detail.SoLuong || '';
        const donGia = detail.donGia || detail.DonGia || '';
        const thanhTien = detail.thanhTien || detail.ThanhTien || '';
        const ghiChu = detail.ghiChu || detail.GhiChu || '';
        
        document.getElementById('detailId').value = detailId;
        document.getElementById('detailBillId').value = this.currentBillId;
        document.getElementById('loaiChiPhi').value = loaiChiPhi;
        document.getElementById('soLuong').value = soLuong;
        document.getElementById('donGia').value = donGia;
        document.getElementById('thanhTien').value = thanhTien;
        document.getElementById('detailGhiChu').value = ghiChu;
        
        const modal = document.getElementById('detailModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
}

// Global functions
function viewBillDetails(billId) {
    window.adminBills.viewBillDetails(billId);
}

function closeBillDetailsModal() {
    window.adminBills.closeBillDetailsModal();
}

function openAddDetailModal() {
    window.adminBills.openAddDetailModal();
}

function closeDetailModal() {
    window.adminBills.closeDetailModal();
}

function saveDetail() {
    window.adminBills.saveDetail();
}

function deleteDetail(detailId) {
    window.adminBills.deleteDetail(detailId);
}

function editDetail(detailId) {
    window.adminBills.editDetail(detailId);
}

function calculateDetailTotal() {
    const soLuong = parseFloat(document.getElementById('soLuong').value) || 0;
    const donGia = parseFloat(document.getElementById('donGia').value) || 0;
    const thanhTien = soLuong * donGia;
    document.getElementById('thanhTien').value = thanhTien.toFixed(2);
}

function openCalculateMonthlyModal() {
    const modal = document.getElementById('calculateMonthlyModal');
    if (modal) {
        // Set default to current month/year
        const currentDate = new Date();
        const thangEl = document.getElementById('calculateThang');
        const namEl = document.getElementById('calculateNam');
        if (thangEl) thangEl.value = currentDate.getMonth() + 1;
        if (namEl) namEl.value = currentDate.getFullYear();
        modal.style.display = 'flex';
    }
}

function closeCalculateMonthlyModal() {
    const modal = document.getElementById('calculateMonthlyModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function generateMonthlyBills() {
    const form = document.getElementById('calculateMonthlyForm');
    if (!form || !form.checkValidity()) {
        if (form) form.reportValidity();
        return;
    }

    const thang = parseInt(document.getElementById('calculateThang').value);
    const nam = parseInt(document.getElementById('calculateNam').value);

    if (!confirm(`Bạn có chắc chắn muốn tạo hóa đơn cho tháng ${thang}/${nam}?`)) {
        return;
    }

    try {
        closeCalculateMonthlyModal();
        await window.adminBills.calculateMonthly(thang, nam);
    } catch (error) {
        console.error('Error generating monthly bills:', error);
        Utils.showAlert('Lỗi tạo hóa đơn: ' + error.message, 'danger');
    }
}

function filterBills() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const studentFilter = document.getElementById('studentFilter')?.value || '';
    const monthFilter = document.getElementById('monthFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = window.adminBills.bills.filter(bill => {
        // Handle both camelCase and PascalCase
        const maHoaDon = (bill.maHoaDon || bill.MaHoaDon || '').toString();
        const maSinhVien = bill.maSinhVien || bill.MaSinhVien;
        const thang = bill.thang || bill.Thang || 0;
        const trangThai = bill.trangThai || bill.TrangThai || '';
        
        const student = window.adminBills.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
        let studentName = '';
        if (student) {
            studentName = (student.hoTen || student.HoTen || '').toLowerCase();
        }
        
        const matchSearch = !searchInput || 
            studentName.includes(searchInput) ||
            maHoaDon.includes(searchInput);
        
        const matchStudent = !studentFilter || maSinhVien.toString() === studentFilter.toString();
        const matchMonth = !monthFilter || thang.toString() === monthFilter.toString();
        const matchStatus = !statusFilter || trangThai === statusFilter;
        
        return matchSearch && matchStudent && matchMonth && matchStatus;
    });
    
    window.adminBills.renderBillsTable(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('studentFilter').value = '';
    document.getElementById('monthFilter').value = '';
    document.getElementById('statusFilter').value = '';
    window.adminBills.renderBillsTable();
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
    window.adminBills = new AdminBills();
});
