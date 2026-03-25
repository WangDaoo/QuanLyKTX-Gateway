// Admin Registrations Module
class AdminRegistrations {
    constructor() {
        this.registrations = [];
        this.students = [];
        this.rooms = [];
        this.currentRegistration = null;
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

    async bootstrap() {
        try {
            await Promise.all([
                this.loadStudents(),
                this.loadRooms()
            ]);
            await this.loadRegistrations();
        } catch (error) {
            console.error('Failed to initialize AdminRegistrations:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
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
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.rooms = [];
        }
    }

    async loadRegistrations() {
        try {
            Utils.showLoading();
            
            console.log('Loading registrations from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.REGISTRATIONS);
            const response = await $api.get(CONFIG.ENDPOINTS.REGISTRATIONS);
            console.log('Registrations response received:', response);
            
            // Handle different response formats
            let registrationsArray = [];
            if (Array.isArray(response)) {
                registrationsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    registrationsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    registrationsArray = response.data;
                } else {
                    console.warn('Unexpected registrations data format:', response);
                }
            }
            
            this.registrations = registrationsArray || [];
            console.log('Registrations loaded:', this.registrations.length);
            this.renderRegistrationsTable();
            
        } catch (error) {
            console.error('Error loading registrations:', error);
            const tbody = document.getElementById('registrationsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminRegistrations.loadRegistrations()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách đơn đăng ký: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderRegistrationsTable(registrations = null) {
        const tbody = document.getElementById('registrationsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayRegistrations = registrations || this.registrations;
        
        if (displayRegistrations.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayRegistrations.map(reg => {
            // Handle both camelCase and PascalCase
            const maDon = reg.maDon || reg.MaDon || '';
            const maSinhVien = reg.maSinhVien || reg.MaSinhVien;
            const maPhongDeXuat = reg.maPhongDeXuat || reg.MaPhongDeXuat;
            const trangThai = reg.trangThai || reg.TrangThai || '';
            const ngayDangKy = reg.ngayDangKy || reg.NgayDangKy;
            const lyDo = reg.lyDo || reg.LyDo || '';
            
            // Use response data if available (DonDangKyResponse includes student info)
            const studentName = reg.tenSinhVien || reg.TenSinhVien || 
                (() => {
                    const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
                    return student ? (student.hoTen || student.HoTen) : 'N/A';
                })();
            
            // Use response data if available
            let roomInfo = 'Không đề xuất';
            if (reg.phongDeXuat || reg.PhongDeXuat) {
                const phong = reg.phongDeXuat || reg.PhongDeXuat;
                const toaNha = reg.toaNhaDeXuat || reg.ToaNhaDeXuat;
                roomInfo = toaNha ? `${phong} - ${toaNha}` : phong;
            } else if (maPhongDeXuat) {
                const room = this.rooms.find(r => (r.maPhong || r.MaPhong) === maPhongDeXuat);
                if (room) {
                    const roomNumber = room.soPhong || room.SoPhong || '';
                    const buildingName = room.tenToaNha || room.TenToaNha || '';
                    roomInfo = buildingName ? `${roomNumber} - ${buildingName}` : roomNumber;
                }
            }
            
            let statusClass = 'badge-secondary';
            if (trangThai === 'Đã duyệt' || trangThai === 'Da duyet') statusClass = 'badge-success';
            else if (trangThai === 'Chờ duyệt' || trangThai === 'Cho duyet') statusClass = 'badge-warning';
            else if (trangThai === 'Đã từ chối' || trangThai === 'Da tu choi') statusClass = 'badge-danger';

            const lyDoDisplay = lyDo ? (lyDo.length > 50 ? lyDo.substring(0, 50) + '...' : lyDo) : 'N/A';
            const canApprove = trangThai === 'Chờ duyệt' || trangThai === 'Cho duyet';

            return `
                <tr>
                    <td data-label="Mã đơn"><strong>${maDon}</strong></td>
                    <td data-label="Sinh viên">${studentName}</td>
                    <td data-label="Phòng đề xuất">${roomInfo}</td>
                    <td data-label="Ngày đăng ký">${Utils.formatDate(ngayDangKy)}</td>
                    <td data-label="Lý do">${lyDoDisplay}</td>
                    <td data-label="Trạng thái">
                        <span class="badge ${statusClass}">
                            ${trangThai}
                        </span>
                    </td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-info" onclick="viewRegistrationDetails(${maDon})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i> <span class="btn-text">Xem</span>
                            </button>
                            ${canApprove ? `
                                <button class="btn btn-sm btn-success" onclick="approveRegistrationFromList(${maDon})" title="Duyệt">
                                    <i class="fas fa-check"></i> <span class="btn-text">Duyệt</span>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="rejectRegistrationFromList(${maDon})" title="Từ chối">
                                    <i class="fas fa-times"></i> <span class="btn-text">Từ chối</span>
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-danger" onclick="deleteRegistration(${maDon})" title="Xóa">
                                <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async viewDetails(registrationId) {
        try {
            Utils.showLoading();
            
            const response = await $api.get(CONFIG.ENDPOINTS.REGISTRATION_BY_ID(registrationId));
            console.log('Registration details response:', response);
            
            // Handle different response formats
            let data = null;
            if (response && typeof response === 'object') {
                if (response.maDon || response.MaDon) {
                    data = response;
                } else if (response.data) {
                    data = response.data;
                } else if (response.success && response.data) {
                    data = response.data;
                }
            }
            
            if (!data) {
                throw new Error('Không tìm thấy thông tin đơn đăng ký');
            }
            
            this.currentRegistration = data;
            
            // Handle both camelCase and PascalCase
            const maDon = data.maDon || data.MaDon || '';
            const maSinhVien = data.maSinhVien || data.MaSinhVien;
            const maPhongDeXuat = data.maPhongDeXuat || data.MaPhongDeXuat;
            const trangThai = data.trangThai || data.TrangThai || '';
            const ngayDangKy = data.ngayDangKy || data.NgayDangKy;
            const lyDo = data.lyDo || data.LyDo || '';
            const ghiChu = data.ghiChu || data.GhiChu || '';
            
            // Use response data if available (DonDangKyResponse includes student info)
            let studentInfo = 'N/A';
            if (data.tenSinhVien || data.TenSinhVien) {
                const tenSinhVien = data.tenSinhVien || data.TenSinhVien;
                const mssv = data.mssv || data.MSSV || '';
                studentInfo = mssv ? `${tenSinhVien} - ${mssv}` : tenSinhVien;
            } else {
                const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
                if (student) {
                    const hoTen = student.hoTen || student.HoTen;
                    const mssv = student.mssv || student.MSSV || '';
                    studentInfo = mssv ? `${hoTen} - ${mssv}` : hoTen;
                }
            }
            
            // Use response data if available
            let roomInfo = 'Không đề xuất';
            if (data.phongDeXuat || data.PhongDeXuat) {
                const phong = data.phongDeXuat || data.PhongDeXuat;
                const toaNha = data.toaNhaDeXuat || data.ToaNhaDeXuat;
                roomInfo = toaNha ? `${phong} - ${toaNha}` : phong;
            } else if (maPhongDeXuat) {
                const room = this.rooms.find(r => (r.maPhong || r.MaPhong) === maPhongDeXuat);
                if (room) {
                    const roomNumber = room.soPhong || room.SoPhong || '';
                    const buildingName = room.tenToaNha || room.TenToaNha || '';
                    roomInfo = buildingName ? `${roomNumber} - ${buildingName}` : roomNumber;
                }
            }
            
            let statusClass = 'badge-secondary';
            if (trangThai === 'Đã duyệt' || trangThai === 'Da duyet') statusClass = 'badge-success';
            else if (trangThai === 'Chờ duyệt' || trangThai === 'Cho duyet') statusClass = 'badge-warning';
            else if (trangThai === 'Đã từ chối' || trangThai === 'Da tu choi') statusClass = 'badge-danger';
            
            const details = `
                <div class="form-group">
                    <label><strong>Mã đơn:</strong></label>
                    <p>${maDon}</p>
                </div>
                <div class="form-group">
                    <label><strong>Sinh viên:</strong></label>
                    <p>${studentInfo}</p>
                </div>
                <div class="form-group">
                    <label><strong>Phòng đề xuất:</strong></label>
                    <p>${roomInfo}</p>
                </div>
                <div class="form-group">
                    <label><strong>Ngày đăng ký:</strong></label>
                    <p>${Utils.formatDate(ngayDangKy)}</p>
                </div>
                <div class="form-group">
                    <label><strong>Trạng thái:</strong></label>
                    <p>
                        <span class="badge ${statusClass}">
                            ${trangThai}
                        </span>
                    </p>
                </div>
                <div class="form-group">
                    <label><strong>Lý do:</strong></label>
                    <p>${lyDo || 'N/A'}</p>
                </div>
                <div class="form-group">
                    <label><strong>Ghi chú:</strong></label>
                    <p>${ghiChu || 'Không có'}</p>
                </div>
            `;
            
            document.getElementById('registrationDetails').innerHTML = details;
            
            const modal = document.getElementById('registrationModal');
            const approveBtn = document.getElementById('approveButton');
            const rejectBtn = document.getElementById('rejectButton');
            
            const canApprove = trangThai === 'Chờ duyệt' || trangThai === 'Cho duyet';
            if (approveBtn) approveBtn.style.display = canApprove ? 'inline-block' : 'none';
            if (rejectBtn) rejectBtn.style.display = canApprove ? 'inline-block' : 'none';
            
            if (modal) {
                modal.style.display = 'flex';
            }
            
        } catch (error) {
            console.error('Error loading registration details:', error);
            Utils.showAlert('Lỗi tải chi tiết đơn đăng ký: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    closeModal() {
        const modal = document.getElementById('registrationModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentRegistration = null;
    }

    async approveRegistration() {
        if (!this.currentRegistration) return;
        
        if (!confirm('Bạn có chắc chắn muốn duyệt đơn đăng ký này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            const maDon = this.currentRegistration.maDon || this.currentRegistration.MaDon;
            if (!maDon) {
                throw new Error('Không tìm thấy mã đơn');
            }
            
            // Backend expects PascalCase field names
            const updateData = {
                MaSinhVien: this.currentRegistration.maSinhVien || this.currentRegistration.MaSinhVien,
                MaPhongDeXuat: this.currentRegistration.maPhongDeXuat || this.currentRegistration.MaPhongDeXuat || null,
                TrangThai: 'Đã duyệt',
                LyDo: this.currentRegistration.lyDo || this.currentRegistration.LyDo || null,
                NgayDangKy: this.currentRegistration.ngayDangKy || this.currentRegistration.NgayDangKy,
                GhiChu: this.currentRegistration.ghiChu || this.currentRegistration.GhiChu || null
            };
            
            await $api.put(CONFIG.ENDPOINTS.REGISTRATION_BY_ID(maDon), updateData);

            Utils.showAlert('Duyệt đơn đăng ký thành công!', 'success');
            this.closeModal();
            await this.loadRegistrations();

        } catch (error) {
            console.error('Error approving registration:', error);
            Utils.showAlert('Lỗi duyệt đơn đăng ký: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async rejectRegistration() {
        if (!this.currentRegistration) return;
        
        const reason = prompt('Nhập lý do từ chối (nếu có):');
        if (reason === null) return; // User cancelled

        try {
            Utils.showLoading();
            
            const maDon = this.currentRegistration.maDon || this.currentRegistration.MaDon;
            if (!maDon) {
                throw new Error('Không tìm thấy mã đơn');
            }
            
            // Backend expects PascalCase field names
            const updateData = {
                MaSinhVien: this.currentRegistration.maSinhVien || this.currentRegistration.MaSinhVien,
                MaPhongDeXuat: this.currentRegistration.maPhongDeXuat || this.currentRegistration.MaPhongDeXuat || null,
                TrangThai: 'Đã từ chối',
                LyDo: this.currentRegistration.lyDo || this.currentRegistration.LyDo || null,
                NgayDangKy: this.currentRegistration.ngayDangKy || this.currentRegistration.NgayDangKy,
                GhiChu: reason || 'Đã từ chối bởi quản trị viên'
            };
            
            await $api.put(CONFIG.ENDPOINTS.REGISTRATION_BY_ID(maDon), updateData);

            Utils.showAlert('Từ chối đơn đăng ký thành công!', 'success');
            this.closeModal();
            await this.loadRegistrations();

        } catch (error) {
            console.error('Error rejecting registration:', error);
            Utils.showAlert('Lỗi từ chối đơn đăng ký: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteRegistration(registrationId) {
        if (!confirm('Bạn có chắc chắn muốn xóa đơn đăng ký này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.REGISTRATION_BY_ID(registrationId));

            Utils.showAlert('Xóa đơn đăng ký thành công!', 'success');
            await this.loadRegistrations();

        } catch (error) {
            console.error('Error deleting registration:', error);
            Utils.showAlert('Lỗi xóa đơn đăng ký: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function viewRegistrationDetails(registrationId) {
    window.adminRegistrations.viewDetails(registrationId);
}

function closeRegistrationModal() {
    window.adminRegistrations.closeModal();
}

function approveRegistration() {
    window.adminRegistrations.approveRegistration();
}

function approveRegistrationFromList(registrationId) {
    window.adminRegistrations.viewDetails(registrationId);
    setTimeout(() => {
        approveRegistration();
    }, 500);
}

function rejectRegistration() {
    window.adminRegistrations.rejectRegistration();
}

function rejectRegistrationFromList(registrationId) {
    window.adminRegistrations.viewDetails(registrationId);
    setTimeout(() => {
        rejectRegistration();
    }, 500);
}

function deleteRegistration(registrationId) {
    window.adminRegistrations.deleteRegistration(registrationId);
}

function filterRegistrations() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = window.adminRegistrations.registrations.filter(reg => {
        // Handle both camelCase and PascalCase
        const maDon = reg.maDon || reg.MaDon || '';
        const maSinhVien = reg.maSinhVien || reg.MaSinhVien;
        const trangThai = reg.trangThai || reg.TrangThai || '';
        const lyDo = (reg.lyDo || reg.LyDo || '').toLowerCase();
        
        // Use response data if available
        let studentName = '';
        if (reg.tenSinhVien || reg.TenSinhVien) {
            studentName = (reg.tenSinhVien || reg.TenSinhVien).toLowerCase();
        } else {
            const student = window.adminRegistrations.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            if (student) {
                studentName = (student.hoTen || student.HoTen || '').toLowerCase();
            }
        }
        
        const mssv = (reg.mssv || reg.MSSV || '').toLowerCase();
        
        const matchSearch = !searchInput || 
            studentName.includes(searchInput) ||
            mssv.includes(searchInput) ||
            maDon.toString().includes(searchInput) ||
            lyDo.includes(searchInput);
        
        const matchStatus = !statusFilter || trangThai === statusFilter;
        
        return matchSearch && matchStatus;
    });
    
    window.adminRegistrations.renderRegistrationsTable(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    window.adminRegistrations.renderRegistrationsTable();
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
    window.adminRegistrations = new AdminRegistrations();
});

