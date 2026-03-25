// Admin Overdue Notices Module
class AdminOverdueNotices {
    constructor() {
        this.notices = [];
        this.students = [];
        this.bills = [];
        this.editingNotice = null;
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
            this.populateStudentSelects();
            this.populateBillSelect();
            await this.loadNotices();
            this.setupForm();
        } catch (error) {
            console.error('Failed to initialize AdminOverdueNotices:', error);
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

    async loadNotices() {
        try {
            Utils.showLoading();

            console.log('Loading notices from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.OVERDUE_NOTICES);
            const response = await $api.get(CONFIG.ENDPOINTS.OVERDUE_NOTICES);
            console.log('Notices response received:', response);
            
            // Handle different response formats
            let noticesArray = [];
            if (Array.isArray(response)) {
                noticesArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    noticesArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    noticesArray = response.data;
                } else {
                    console.warn('Unexpected notices data format:', response);
                }
            }
            
            this.notices = noticesArray || [];
            console.log('Notices loaded:', this.notices.length);
            this.renderTable();
            
        } catch (error) {
            console.error('Error loading notices:', error);
            const tbody = document.getElementById('noticesTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminOverdueNotices.loadNotices()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách thông báo: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    populateStudentSelects() {
        const filterSelect = document.getElementById('studentFilter');
        const formSelect = document.getElementById('maSinhVien');
        
        const students = this.students
            .map(student => {
                const id = student.maSinhVien || student.MaSinhVien || '';
                const hoTen = student.hoTen || student.HoTen || '';
                const mssv = student.mssv || student.MSSV || '';
                return { id, label: mssv ? `${hoTen} (${mssv})` : hoTen };
            })
            .sort((a, b) => a.label.localeCompare(b.label, 'vi'));

        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Tất cả sinh viên</option>';
            students.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.label;
                filterSelect.appendChild(option);
            });
        }

        if (formSelect) {
            formSelect.innerHTML = '<option value="">Chọn sinh viên</option>';
            students.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.label;
                formSelect.appendChild(option);
            });
        }
    }

    populateBillSelect(studentId = null) {
        const formSelect = document.getElementById('maHoaDon');
        if (!formSelect) return;
        formSelect.innerHTML = '<option value="">Chọn hóa đơn</option>';

        const relevantBills = this.bills.filter(bill => !studentId || (bill.maSinhVien || bill.MaSinhVien) === studentId);
        relevantBills
            .sort((a, b) => (a.maHoaDon || a.MaHoaDon || 0) - (b.maHoaDon || b.MaHoaDon || 0))
            .forEach(bill => {
                const id = bill.maHoaDon || bill.MaHoaDon || '';
                const thang = bill.thang || bill.Thang || 0;
                const nam = bill.nam || bill.Nam || 0;
                const amount = bill.tongTien || bill.TongTien || 0;
                const option = document.createElement('option');
                option.value = id;
                option.textContent = `HĐ #${id} - ${thang}/${nam} - ${Utils.formatCurrency(amount)}`;
                formSelect.appendChild(option);
            });
    }

    setupForm() {
        const form = document.getElementById('noticeForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNotice();
            });
        }

        const studentSelect = document.getElementById('maSinhVien');
        if (studentSelect) {
            studentSelect.addEventListener('change', () => {
                const studentId = studentSelect.value ? parseInt(studentSelect.value, 10) : null;
                this.populateBillSelect(studentId);
            });
        }
    }

    renderTable(list = null) {
        const tbody = document.getElementById('noticesTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayNotices = list || this.notices;
        
        if (displayNotices.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        if (tbody) {
            tbody.innerHTML = displayNotices.map(notice => {
                // Handle both camelCase and PascalCase
                const maThongBao = notice.maThongBao || notice.MaThongBao || '';
                const maSinhVien = notice.maSinhVien || notice.MaSinhVien;
                const maHoaDon = notice.maHoaDon || notice.MaHoaDon;
                const ngayThongBao = notice.ngayThongBao || notice.NgayThongBao;
                const noiDung = notice.noiDung || notice.NoiDung || '';
                const trangThai = notice.trangThai || notice.TrangThai || '';

                const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
                const studentName = student ? (student.hoTen || student.HoTen || `SV #${maSinhVien}`) : `SV #${maSinhVien}`;
                const mssv = student ? (student.mssv || student.MSSV || '') : '';

                const bill = this.bills.find(b => (b.maHoaDon || b.MaHoaDon) === maHoaDon);
                const billLabel = bill ? `HĐ #${maHoaDon} (${bill.thang || bill.Thang}/${bill.nam || bill.Nam})` : (maHoaDon ? `HĐ #${maHoaDon}` : 'N/A');

                let badgeClass = 'badge-secondary';
                if (trangThai === 'Đã gửi') badgeClass = 'badge-warning';
                if (trangThai === 'Đã xem') badgeClass = 'badge-info';
                if (trangThai === 'Đã xử lý') badgeClass = 'badge-success';

                return `
                    <tr>
                        <td data-label="Mã"><strong>${maThongBao}</strong></td>
                        <td data-label="Sinh viên">${studentName}${mssv ? ` (${mssv})` : ''}</td>
                        <td data-label="Hóa đơn">${billLabel}</td>
                        <td data-label="Ngày thông báo">${ngayThongBao ? Utils.formatDate(ngayThongBao) : 'N/A'}</td>
                        <td data-label="Nội dung">${noiDung}</td>
                        <td data-label="Trạng thái"><span class="badge ${badgeClass}">${trangThai}</span></td>
                        <td data-label="Thao tác">
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-warning" onclick="editNotice(${maThongBao})" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteNotice(${maThongBao})" title="Xóa">
                                    <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    openModal(notice = null) {
        this.editingNotice = notice;
        const modal = document.getElementById('noticeModal');
        const modalTitleText = document.getElementById('modalTitleText');
        
        if (notice) {
            if (modalTitleText) modalTitleText.textContent = 'Chỉnh sửa thông báo';
            this.fillForm(notice);
        } else {
            if (modalTitleText) modalTitleText.textContent = 'Tạo thông báo';
            this.clearForm();
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('noticeModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingNotice = null;
        this.clearForm();
    }

    fillForm(notice) {
        // Handle both camelCase and PascalCase
        const maThongBao = notice.maThongBao || notice.MaThongBao || '';
        const maSinhVien = notice.maSinhVien || notice.MaSinhVien || '';
        const maHoaDon = notice.maHoaDon || notice.MaHoaDon || '';
        const ngayThongBao = notice.ngayThongBao || notice.NgayThongBao;
        const noiDung = notice.noiDung || notice.NoiDung || '';
        const trangThai = notice.trangThai || notice.TrangThai || 'Đã gửi';
        const ghiChu = notice.ghiChu || notice.GhiChu || '';

        const ngayThongBaoFormatted = ngayThongBao ? new Date(ngayThongBao).toISOString().split('T')[0] : '';

        document.getElementById('noticeId').value = maThongBao;
        document.getElementById('maSinhVien').value = maSinhVien;
        this.populateBillSelect(parseInt(maSinhVien, 10));
        document.getElementById('maHoaDon').value = maHoaDon;
        document.getElementById('ngayThongBao').value = ngayThongBaoFormatted;
        document.getElementById('noiDung').value = noiDung;
        document.getElementById('trangThai').value = trangThai;
        document.getElementById('ghiChu').value = ghiChu;
    }

    clearForm() {
        const form = document.getElementById('noticeForm');
        if (form) form.reset();
        document.getElementById('noticeId').value = '';
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        document.getElementById('ngayThongBao').value = `${year}-${month}-${day}`;
        this.populateBillSelect(null);
    }

    async saveNotice() {
        const form = document.getElementById('noticeForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        // Backend expects PascalCase field names
        const noticeData = {
            MaSinhVien: parseInt(document.getElementById('maSinhVien').value, 10),
            MaHoaDon: document.getElementById('maHoaDon').value ? parseInt(document.getElementById('maHoaDon').value, 10) : null,
            NgayThongBao: document.getElementById('ngayThongBao').value,
            NoiDung: document.getElementById('noiDung').value.trim(),
            TrangThai: document.getElementById('trangThai').value.trim(),
            GhiChu: document.getElementById('ghiChu').value.trim() || null
        };

        try {
            Utils.showLoading();

            const noticeId = this.editingNotice ? (this.editingNotice.maThongBao || this.editingNotice.MaThongBao) : null;

            if (this.editingNotice && noticeId) {
                await $api.put(CONFIG.ENDPOINTS.OVERDUE_NOTICE_BY_ID(noticeId), noticeData);
                Utils.showAlert('Cập nhật thông báo thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.OVERDUE_NOTICES, noticeData);
                Utils.showAlert('Tạo thông báo thành công!', 'success');
            }
            
            this.closeModal();
            await this.loadNotices();

        } catch (error) {
            console.error('Error saving notice:', error);
            Utils.showAlert('Lỗi lưu thông báo: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteNotice(noticeId) {
        if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.OVERDUE_NOTICE_BY_ID(noticeId));

            Utils.showAlert('Xóa thông báo thành công!', 'success');
            await this.loadNotices();

        } catch (error) {
            console.error('Error deleting notice:', error);
            Utils.showAlert('Lỗi xóa thông báo: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    filterNotices() {
        const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const studentFilter = document.getElementById('studentFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        let filtered = this.notices.filter(notice => {
            // Handle both camelCase and PascalCase
            const maSinhVien = notice.maSinhVien || notice.MaSinhVien;
            const noiDung = (notice.noiDung || notice.NoiDung || '').toLowerCase();
            const trangThai = notice.trangThai || notice.TrangThai || '';

            const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            const studentName = (student?.hoTen || student?.HoTen || '').toLowerCase();
            const mssv = (student?.mssv || student?.MSSV || '').toLowerCase();

            const matchSearch = !searchInput ||
                studentName.includes(searchInput) ||
                mssv.includes(searchInput) ||
                noiDung.includes(searchInput);

            const matchStudent = !studentFilter || maSinhVien?.toString() === studentFilter.toString();
            const matchStatus = !statusFilter || trangThai === statusFilter;

            return matchSearch && matchStudent && matchStatus;
        });
        
        this.renderTable(filtered);
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('studentFilter').value = '';
        document.getElementById('statusFilter').value = '';
        this.renderTable();
    }
}

// Global functions
function openNoticeModal() {
    window.adminOverdueNotices.openModal();
}

function closeNoticeModal() {
    window.adminOverdueNotices.closeModal();
}

function saveNotice() {
    window.adminOverdueNotices.saveNotice();
}

async function editNotice(noticeId) {
    try {
        Utils.showLoading();
        
        const response = await $api.get(CONFIG.ENDPOINTS.OVERDUE_NOTICE_BY_ID(noticeId));
        console.log('Notice response:', response);
        
        // Handle different response formats
        let notice = null;
        if (response && typeof response === 'object') {
            if (response.maThongBao || response.MaThongBao) {
                notice = response;
            } else if (response.data) {
                notice = response.data;
            } else if (response.success && response.data) {
                notice = response.data;
            }
        }
        
        if (!notice) {
            throw new Error('Không tìm thấy thông tin thông báo');
        }
        
        window.adminOverdueNotices.openModal(notice);
    } catch (error) {
        console.error('Error loading notice:', error);
        Utils.showAlert('Lỗi tải thông tin thông báo: ' + error.message, 'danger');
    } finally {
        Utils.hideLoading();
    }
}

function deleteNotice(noticeId) {
    window.adminOverdueNotices.deleteNotice(noticeId);
}

function filterNotices() {
    window.adminOverdueNotices.filterNotices();
}

function resetFilters() {
    window.adminOverdueNotices.resetFilters();
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
    window.adminOverdueNotices = new AdminOverdueNotices();
});
