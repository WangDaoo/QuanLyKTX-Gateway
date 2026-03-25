// Admin Students Module
class AdminStudents {
    constructor() {
        this.students = [];
        this.rooms = [];
        this.editingStudent = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            await this.loadRooms();
            await this.loadStudents();
            this.setupForm();
        } catch (error) {
            console.error('Failed to initialize AdminStudents:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
        }
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) userNameEl.textContent = user.hoTen || user.tenDangNhap;
            
            const userRole = document.querySelector('.user-role');
            if (userRole) {
                const roleMap = {
                    'Admin': 'Quản trị viên',
                    'Officer': 'Nhân viên',
                    'Student': 'Sinh viên'
                };
                userRole.textContent = roleMap[user.vaiTro] || user.vaiTro;
            }
        }
    }

    async loadRooms() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.ROOMS);
            this.rooms = Array.isArray(data) ? data : [];
            this.populateRoomFilter();
            this.populateRoomSelect();
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.rooms = [];
        }
    }

    populateRoomFilter() {
        const filter = document.getElementById('roomFilter');
        if (!filter) return;

        filter.innerHTML = '<option value="">Tất cả phòng</option>';
        this.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.maPhong;
            const buildingName = room.tenToaNha || room.TenToaNha || '';
            option.textContent = `${room.soPhong}${buildingName ? ' - ' + buildingName : ''}`;
            filter.appendChild(option);
        });
    }

    populateRoomSelect() {
        const select = document.getElementById('maPhong');
        if (!select) return;

        select.innerHTML = '<option value="">Chưa phân phòng</option>';
        this.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.maPhong;
            const buildingName = room.tenToaNha || room.TenToaNha || '';
            option.textContent = `${room.soPhong}${buildingName ? ' - ' + buildingName : ''}`;
            select.appendChild(option);
        });
    }

    setupForm() {
        const form = document.getElementById('studentForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveStudent();
            });
        }
    }

    async loadStudents() {
        try {
            Utils.showLoading();

            const data = await $api.get(CONFIG.ENDPOINTS.STUDENTS);
            this.students = Array.isArray(data) ? data : [];
            this.renderStudentsTable();
            
        } catch (error) {
            console.error('Error loading students:', error);
            Utils.showAlert('Lỗi tải danh sách sinh viên: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderStudentsTable(students = null) {
        const tbody = document.getElementById('studentsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayStudents = students || this.students;
        
        if (displayStudents.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayStudents.map(student => {
            const room = this.rooms.find(r => r.maPhong === student.maPhong);
            let roomInfo = 'Chưa có';
            if (room) {
                const buildingName = room.tenToaNha || room.TenToaNha || '';
                roomInfo = buildingName ? `${room.soPhong} (${buildingName})` : room.soPhong;
            }
            
            return `
                <tr>
                    <td><strong>${student.maSinhVien}</strong></td>
                    <td>
                        <div class="building-name">
                            <i class="fas fa-user"></i>
                            ${student.hoTen}
                        </div>
                    </td>
                    <td>${student.mssv || student.MSSV}</td>
                    <td>${student.lop || student.Lop}</td>
                    <td>${student.khoa || student.Khoa}</td>
                    <td>${roomInfo}</td>
                    <td>
                        <span class="badge ${student.trangThai ? 'badge-success' : 'badge-danger'}">
                            ${student.trangThai ? 'Đang ở' : 'Ngừng ở'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="editStudent(${student.maSinhVien})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="viewStudentDetails(${student.maSinhVien})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteStudent(${student.maSinhVien})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openModal(student = null) {
        this.editingStudent = student;
        const modal = document.getElementById('studentModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const saveButtonText = document.getElementById('saveButtonText');
        
        if (student) {
            modalTitleText.textContent = 'Chỉnh sửa sinh viên';
            saveButtonText.textContent = 'Cập nhật';
            this.fillForm(student);
        } else {
            modalTitleText.textContent = 'Thêm sinh viên';
            saveButtonText.textContent = 'Thêm mới';
            this.clearForm();
        }
        
        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('studentModal');
        modal.classList.remove('show');
        this.editingStudent = null;
        this.clearForm();
    }

    fillForm(student) {
        document.getElementById('studentId').value = student.maSinhVien;
        document.getElementById('hoTen').value = student.hoTen || '';
        document.getElementById('mssv').value = student.mssv || student.MSSV || '';
        document.getElementById('lop').value = student.lop || student.Lop || '';
        document.getElementById('khoa').value = student.khoa || student.Khoa || '';
        
        if (student.ngaySinh) {
            const date = new Date(student.ngaySinh);
            document.getElementById('ngaySinh').value = date.toISOString().split('T')[0];
        }
        
        document.getElementById('gioiTinh').value = student.gioiTinh || '';
        document.getElementById('sdt').value = student.sdt || student.SDT || '';
        document.getElementById('email').value = student.email || student.Email || '';
        document.getElementById('diaChi').value = student.diaChi || '';
        document.getElementById('maPhong').value = student.maPhong || '';
    }

    clearForm() {
        document.getElementById('studentForm').reset();
        document.getElementById('studentId').value = '';
    }

    async saveStudent() {
        const form = document.getElementById('studentForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const studentData = {
            hoTen: document.getElementById('hoTen').value,
            mssv: document.getElementById('mssv').value,
            lop: document.getElementById('lop').value,
            khoa: document.getElementById('khoa').value,
            ngaySinh: document.getElementById('ngaySinh').value || null,
            gioiTinh: document.getElementById('gioiTinh').value || null,
            sdt: document.getElementById('sdt').value || null,
            email: document.getElementById('email').value || null,
            diaChi: document.getElementById('diaChi').value || null,
            maPhong: document.getElementById('maPhong').value ? parseInt(document.getElementById('maPhong').value) : null
        };

        try {
            Utils.showLoading();

            if (this.editingStudent) {
                await $api.put(`${CONFIG.ENDPOINTS.STUDENTS}/${this.editingStudent.maSinhVien}`, studentData);
                Utils.showAlert('Cập nhật sinh viên thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.STUDENTS, studentData);
                Utils.showAlert('Thêm sinh viên thành công!', 'success');
            }
            
            this.closeModal();
            this.loadStudents();

        } catch (error) {
            console.error('Error saving student:', error);
            Utils.showAlert('Lỗi lưu sinh viên: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteStudent(studentId) {
        if (!confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
            return;
        }

        try {
            Utils.showLoading();

            await $api.delete(`${CONFIG.ENDPOINTS.STUDENTS}/${studentId}`);

            Utils.showAlert('Xóa sinh viên thành công!', 'success');
            this.loadStudents();

        } catch (error) {
            console.error('Error deleting student:', error);
            Utils.showAlert('Lỗi xóa sinh viên: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function openStudentModal() {
    window.adminStudents.openModal();
}

function closeStudentModal() {
    window.adminStudents.closeModal();
}

function saveStudent() {
    window.adminStudents.saveStudent();
}

function editStudent(studentId) {
    const student = window.adminStudents.students.find(s => s.maSinhVien === studentId);
    if (student) {
        window.adminStudents.openModal(student);
    }
}

function deleteStudent(studentId) {
    window.adminStudents.deleteStudent(studentId);
}

function viewStudentDetails(studentId) {
    const student = window.adminStudents.students.find(s => s.maSinhVien === studentId);
    if (student) {
        alert(`Chi tiết sinh viên:\n\nHọ tên: ${student.hoTen}\nMSSV: ${student.mssv || student.MSSV}\nLớp: ${student.lop || student.Lop}\nKhoa: ${student.khoa || student.Khoa}\nEmail: ${student.email || student.Email || 'Chưa có'}\nSĐT: ${student.sdt || student.SDT || 'Chưa có'}`);
    }
}

function filterStudents() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const roomFilter = document.getElementById('roomFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = window.adminStudents.students.filter(student => {
        const matchSearch = !searchInput || 
            (student.hoTen && student.hoTen.toLowerCase().includes(searchInput)) ||
            ((student.mssv || student.MSSV) && (student.mssv || student.MSSV).toLowerCase().includes(searchInput)) ||
            ((student.lop || student.Lop) && (student.lop || student.Lop).toLowerCase().includes(searchInput));
        
        const matchRoom = !roomFilter || student.maPhong === parseInt(roomFilter);
        const matchStatus = !statusFilter || 
            (statusFilter === 'true' && student.trangThai) ||
            (statusFilter === 'false' && !student.trangThai);
        
        return matchSearch && matchRoom && matchStatus;
    });
    
    window.adminStudents.renderStudentsTable(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('roomFilter').value = '';
    document.getElementById('statusFilter').value = '';
    window.adminStudents.renderStudentsTable();
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
    window.adminStudents = new AdminStudents();
});

