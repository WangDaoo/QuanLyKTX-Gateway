// Officer Violations Module
class OfficerViolations {
    constructor() {
        this.violations = [];
        this.students = [];
        this.editingViolation = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = user.hoTen || user.tenDangNhap || 'Officer';
            }
            const userRole = document.querySelector('.user-role');
            if (userRole) {
                userRole.textContent = 'Nhân viên';
            }
        }
    }

    async bootstrap() {
        try {
            await this.loadStudents();
            this.populateStudentFilter();
            this.populateStudentSelect();
            await this.loadViolations();
            this.setupForm();
        } catch (error) {
            console.error('Failed to initialize OfficerViolations:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
        }
    }

    async loadStudents() {
        try {
            const response = await $api.get(CONFIG.ENDPOINTS.STUDENTS);
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
            option.textContent = mssv ? `${hoTen} (${mssv})` : hoTen;
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
            option.textContent = mssv ? `${hoTen} (${mssv})` : hoTen;
            select.appendChild(option);
        });
    }

    setupForm() {
        const form = document.getElementById('violationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveViolation();
            });
        }
        
        const ngayViPhamInput = document.getElementById('ngayViPham');
        if (ngayViPhamInput && !ngayViPhamInput.value) {
            const today = new Date().toISOString().split('T')[0];
            ngayViPhamInput.value = today;
        }
    }

    async loadViolations() {
        try {
            Utils.showLoading();

            const response = await $api.get(CONFIG.ENDPOINTS.VIOLATIONS);
            
            let violationsArray = [];
            if (Array.isArray(response)) {
                violationsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    violationsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    violationsArray = response.data;
                }
            }
            
            this.violations = violationsArray || [];
            this.renderViolationsTable();
            
        } catch (error) {
            console.error('Error loading violations:', error);
            const tbody = document.getElementById('violationsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.officerViolations.loadViolations()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách vi phạm: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderViolationsTable(violations = null) {
        const tbody = document.getElementById('violationsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayViolations = violations || this.violations;
        
        if (displayViolations.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        if (tbody) {
            tbody.innerHTML = displayViolations.map(violation => {
                const maKyLuat = violation.maKyLuat || violation.MaKyLuat || '';
                const maSinhVien = violation.maSinhVien || violation.MaSinhVien;
                const loaiViPham = violation.loaiViPham || violation.LoaiViPham || '';
                const moTa = violation.moTa || violation.MoTa || '';
                const ngayViPham = violation.ngayViPham || violation.NgayViPham;
                const mucPhat = violation.mucPhat || violation.MucPhat || 0;
                const trangThai = violation.trangThai || violation.TrangThai || 'Chưa xử lý';

                const tenSinhVien = violation.tenSinhVien || violation.TenSinhVien;
                const mssv = violation.mssv || violation.MSSV;
                let studentName = tenSinhVien || 'N/A';
                if (!tenSinhVien) {
                    const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
                    if (student) {
                        studentName = student.hoTen || student.HoTen || 'N/A';
                    }
                }
                const studentDisplay = mssv ? `${studentName} (${mssv})` : studentName;

                let statusClass = 'badge-secondary';
                if (trangThai === 'Đã xử lý' || trangThai === 'Da xu ly') statusClass = 'badge-success';
                else if (trangThai === 'Chờ xử lý' || trangThai === 'Cho xu ly' || trangThai === 'Chưa xử lý') statusClass = 'badge-warning';
                else if (trangThai === 'Đã hủy' || trangThai === 'Da huy') statusClass = 'badge-secondary';

                const moTaDisplay = moTa ? (moTa.length > 50 ? moTa.substring(0, 50) + '...' : moTa) : '(Không có)';

                return `
                    <tr>
                        <td data-label="Mã"><strong>${maKyLuat}</strong></td>
                        <td data-label="Sinh viên">${studentDisplay}</td>
                        <td data-label="Loại vi phạm">${loaiViPham}</td>
                        <td data-label="Mô tả">${moTaDisplay}</td>
                        <td data-label="Ngày vi phạm">${ngayViPham ? Utils.formatDate(ngayViPham) : 'N/A'}</td>
                        <td data-label="Mức phạt"><strong>${Utils.formatCurrency(mucPhat)}</strong></td>
                        <td data-label="Trạng thái"><span class="badge ${statusClass}">${trangThai}</span></td>
                        <td data-label="Thao tác">
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-warning" onclick="editViolation(${maKyLuat})" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-info" onclick="viewViolationDetails(${maKyLuat})" title="Xem chi tiết">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    openModal(violation = null) {
        this.editingViolation = violation;
        const modal = document.getElementById('violationModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const saveButtonText = document.getElementById('saveButtonText');
        
        if (violation) {
            if (modalTitleText) modalTitleText.textContent = 'Chỉnh sửa vi phạm';
            if (saveButtonText) saveButtonText.textContent = 'Cập nhật';
            this.fillForm(violation);
        } else {
            if (modalTitleText) modalTitleText.textContent = 'Thêm vi phạm';
            if (saveButtonText) saveButtonText.textContent = 'Thêm mới';
            this.clearForm();
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('violationModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingViolation = null;
        this.clearForm();
    }

    fillForm(violation) {
        const maKyLuat = violation.maKyLuat || violation.MaKyLuat || '';
        const maSinhVien = violation.maSinhVien || violation.MaSinhVien || '';
        const loaiViPham = violation.loaiViPham || violation.LoaiViPham || '';
        const moTa = violation.moTa || violation.MoTa || '';
        const ngayViPham = violation.ngayViPham || violation.NgayViPham;
        const mucPhat = violation.mucPhat || violation.MucPhat || 0;
        const trangThai = violation.trangThai || violation.TrangThai || 'Chưa xử lý';
        const ghiChu = violation.ghiChu || violation.GhiChu || '';

        const ngayViPhamFormatted = ngayViPham ? new Date(ngayViPham).toISOString().split('T')[0] : '';

        document.getElementById('violationId').value = maKyLuat;
        document.getElementById('maSinhVien').value = maSinhVien;
        document.getElementById('loaiViPham').value = loaiViPham;
        document.getElementById('moTa').value = moTa;
        document.getElementById('ngayViPham').value = ngayViPhamFormatted;
        document.getElementById('mucPhat').value = mucPhat;
        document.getElementById('trangThai').value = trangThai;
        document.getElementById('ghiChu').value = ghiChu;
    }

    clearForm() {
        const form = document.getElementById('violationForm');
        if (form) form.reset();
        document.getElementById('violationId').value = '';
        const today = new Date().toISOString().split('T')[0];
        const ngayViPhamInput = document.getElementById('ngayViPham');
        if (ngayViPhamInput) ngayViPhamInput.value = today;
    }

    async saveViolation() {
        const form = document.getElementById('violationForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        const violationData = {
            MaSinhVien: parseInt(document.getElementById('maSinhVien').value, 10),
            LoaiViPham: document.getElementById('loaiViPham').value.trim(),
            MoTa: document.getElementById('moTa').value.trim(),
            NgayViPham: document.getElementById('ngayViPham').value,
            MucPhat: parseFloat(document.getElementById('mucPhat').value) || 0,
            TrangThai: document.getElementById('trangThai').value.trim(),
            GhiChu: document.getElementById('ghiChu').value.trim() || null
        };

        try {
            Utils.showLoading();

            const violationId = this.editingViolation ? (this.editingViolation.maKyLuat || this.editingViolation.MaKyLuat) : null;

            if (this.editingViolation && violationId) {
                await $api.put(CONFIG.ENDPOINTS.VIOLATION_BY_ID(violationId), violationData);
                Utils.showAlert('Cập nhật vi phạm thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.VIOLATIONS, violationData);
                Utils.showAlert('Thêm vi phạm thành công!', 'success');
            }
            
            this.closeModal();
            await this.loadViolations();

        } catch (error) {
            console.error('Error saving violation:', error);
            Utils.showAlert('Lỗi lưu vi phạm: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async viewDetails(violationId) {
        try {
            Utils.showLoading();
            
            const response = await $api.get(CONFIG.ENDPOINTS.VIOLATION_BY_ID(violationId));
            
            let violation = null;
            if (response && typeof response === 'object') {
                if (response.maKyLuat || response.MaKyLuat) {
                    violation = response;
                } else if (response.data) {
                    violation = response.data;
                } else if (response.success && response.data) {
                    violation = response.data;
                }
            }
            
            if (!violation) {
                throw new Error('Không tìm thấy thông tin vi phạm');
            }
            
            const maKyLuat = violation.maKyLuat || violation.MaKyLuat || '';
            const maSinhVien = violation.maSinhVien || violation.MaSinhVien;
            const loaiViPham = violation.loaiViPham || violation.LoaiViPham || '';
            const moTa = violation.moTa || violation.MoTa || '';
            const ngayViPham = violation.ngayViPham || violation.NgayViPham;
            const mucPhat = violation.mucPhat || violation.MucPhat || 0;
            const trangThai = violation.trangThai || violation.TrangThai || '';
            const ghiChu = violation.ghiChu || violation.GhiChu || '(Không có)';
            
            const tenSinhVien = violation.tenSinhVien || violation.TenSinhVien;
            const mssv = violation.mssv || violation.MSSV;
            const lop = violation.lop || violation.Lop;
            const khoa = violation.khoa || violation.Khoa;
            const soPhong = violation.soPhong || violation.SoPhong;
            const tenToaNha = violation.tenToaNha || violation.TenToaNha;
            
            let studentName = tenSinhVien || 'N/A';
            if (!tenSinhVien) {
                const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
                if (student) {
                    studentName = student.hoTen || student.HoTen || 'N/A';
                }
            }
            
            const details = `Chi tiết vi phạm:\n\n` +
                `Mã kỷ luật: ${maKyLuat}\n` +
                `Sinh viên: ${studentName}${mssv ? ` (${mssv})` : ''}\n` +
                `${lop ? `Lớp: ${lop}\n` : ''}` +
                `${khoa ? `Khoa: ${khoa}\n` : ''}` +
                `${soPhong ? `Phòng: ${soPhong}` : ''}${tenToaNha ? ` - ${tenToaNha}` : ''}${soPhong || tenToaNha ? '\n' : ''}` +
                `Loại vi phạm: ${loaiViPham}\n` +
                `Mô tả: ${moTa || 'N/A'}\n` +
                `Ngày vi phạm: ${ngayViPham ? Utils.formatDate(ngayViPham) : 'N/A'}\n` +
                `Mức phạt: ${Utils.formatCurrency(mucPhat)}\n` +
                `Trạng thái: ${trangThai}\n` +
                `Ghi chú: ${ghiChu}`;
            
            alert(details);
        } catch (error) {
            console.error('Error loading violation details:', error);
            Utils.showAlert('Lỗi tải chi tiết vi phạm: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    filterViolations() {
        const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const studentFilter = document.getElementById('studentFilter')?.value || '';
        const loaiViPhamFilter = document.getElementById('loaiViPhamFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        let filtered = this.violations.filter(violation => {
            const maSinhVien = violation.maSinhVien || violation.MaSinhVien;
            const loaiViPham = (violation.loaiViPham || violation.LoaiViPham || '').toLowerCase();
            const moTa = (violation.moTa || violation.MoTa || '').toLowerCase();
            const trangThai = violation.trangThai || violation.TrangThai || '';

            const tenSinhVien = violation.tenSinhVien || violation.TenSinhVien;
            const mssv = violation.mssv || violation.MSSV;
            let studentName = (tenSinhVien || '').toLowerCase();
            if (!tenSinhVien) {
                const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
                if (student) {
                    studentName = (student.hoTen || student.HoTen || '').toLowerCase();
                }
            }
            const mssvLower = (mssv || '').toLowerCase();

            const matchSearch = !searchInput ||
                studentName.includes(searchInput) ||
                mssvLower.includes(searchInput) ||
                loaiViPham.includes(searchInput) ||
                moTa.includes(searchInput);

            const matchStudent = !studentFilter || maSinhVien?.toString() === studentFilter.toString();
            const matchLoaiViPham = !loaiViPhamFilter || loaiViPham === loaiViPhamFilter.toLowerCase();
            const matchStatus = !statusFilter || trangThai === statusFilter;

            return matchSearch && matchStudent && matchLoaiViPham && matchStatus;
        });
        
        this.renderViolationsTable(filtered);
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('studentFilter').value = '';
        document.getElementById('loaiViPhamFilter').value = '';
        document.getElementById('statusFilter').value = '';
        this.renderViolationsTable();
    }
}

// Global functions
function openViolationModal() {
    window.officerViolations.openModal();
}

function closeViolationModal() {
    window.officerViolations.closeModal();
}

function saveViolation() {
    window.officerViolations.saveViolation();
}

async function editViolation(violationId) {
    try {
        Utils.showLoading();
        
        const response = await $api.get(CONFIG.ENDPOINTS.VIOLATION_BY_ID(violationId));
        
        let violation = null;
        if (response && typeof response === 'object') {
            if (response.maKyLuat || response.MaKyLuat) {
                violation = response;
            } else if (response.data) {
                violation = response.data;
            } else if (response.success && response.data) {
                violation = response.data;
            }
        }
        
        if (!violation) {
            throw new Error('Không tìm thấy thông tin vi phạm');
        }
        
        window.officerViolations.openModal(violation);
    } catch (error) {
        console.error('Error loading violation:', error);
        Utils.showAlert('Lỗi tải thông tin vi phạm: ' + error.message, 'danger');
    } finally {
        Utils.hideLoading();
    }
}

function viewViolationDetails(violationId) {
    window.officerViolations.viewDetails(violationId);
}

function filterViolations() {
    window.officerViolations.filterViolations();
}

function resetFilters() {
    window.officerViolations.resetFilters();
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
    window.officerViolations = new OfficerViolations();
});

