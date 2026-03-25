// Student Profile Module
class StudentProfile {
    constructor() {
        this.studentInfo = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.loadProfile();
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

    async loadProfile() {
        try {
            Utils.showLoading();
            
            const user = Utils.getUser();
            const data = await $api.get(CONFIG.ENDPOINTS.USER_PROFILE);
            this.studentInfo = data;
            
            this.renderProfile();
            
        } catch (error) {
            console.error('Error loading profile:', error);
            Utils.showAlert('Lỗi tải thông tin hồ sơ: ' + error.message, 'danger');
            // Use user data from localStorage as fallback
            const user = Utils.getUser();
            if (user) {
                this.studentInfo = user;
                this.renderProfile();
            }
        } finally {
            Utils.hideLoading();
        }
    }

    renderProfile() {
        if (!this.studentInfo) return;
        
        const info = this.studentInfo;
        
        // Personal Info
        document.getElementById('mssv').textContent = info.mssv || info.MSSV || '-';
        document.getElementById('hoTen').textContent = info.hoTen || info.HoTen || '-';
        document.getElementById('ngaySinh').textContent = info.ngaySinh ? Utils.formatDate(info.ngaySinh) : (info.NgaySinh ? Utils.formatDate(info.NgaySinh) : '-');
        document.getElementById('gioiTinh').textContent = info.gioiTinh || info.GioiTinh || '-';
        document.getElementById('soDienThoai').textContent = info.soDienThoai || info.SoDienThoai || '-';
        document.getElementById('email').textContent = info.email || info.Email || '-';
        document.getElementById('diaChi').textContent = info.diaChi || info.DiaChi || '-';
        document.getElementById('khoa').textContent = info.khoa || info.Khoa || '-';
        document.getElementById('nganh').textContent = info.nganh || info.Nganh || '-';
        document.getElementById('namHoc').textContent = info.namHoc || info.NamHoc || '-';
        
        // Account Info
        const user = Utils.getUser();
        document.getElementById('tenDangNhap').textContent = user?.tenDangNhap || info.tenDangNhap || '-';
    }

    openEditModal() {
        if (!this.studentInfo) {
            Utils.showAlert('Không có thông tin để chỉnh sửa', 'warning');
            return;
        }
        
        const info = this.studentInfo;
        
        document.getElementById('maSinhVien').value = info.maSinhVien || info.MaSinhVien || '';
        document.getElementById('editHoTen').value = info.hoTen || info.HoTen || '';
        
        if (info.ngaySinh || info.NgaySinh) {
            const date = new Date(info.ngaySinh || info.NgaySinh);
            document.getElementById('editNgaySinh').value = date.toISOString().split('T')[0];
        }
        
        document.getElementById('editGioiTinh').value = info.gioiTinh || info.GioiTinh || '';
        document.getElementById('editSoDienThoai').value = info.soDienThoai || info.SoDienThoai || '';
        document.getElementById('editEmail').value = info.email || info.Email || '';
        document.getElementById('editDiaChi').value = info.diaChi || info.DiaChi || '';
        document.getElementById('editKhoa').value = info.khoa || info.Khoa || '';
        document.getElementById('editNganh').value = info.nganh || info.Nganh || '';
        
        const modal = document.getElementById('editProfileModal');
        modal.classList.add('show');
    }

    closeEditModal() {
        const modal = document.getElementById('editProfileModal');
        modal.classList.remove('show');
        document.getElementById('profileForm').reset();
    }

    async saveProfile() {
        const form = document.getElementById('profileForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const profileData = {
            hoTen: document.getElementById('editHoTen').value,
            ngaySinh: document.getElementById('editNgaySinh').value,
            gioiTinh: document.getElementById('editGioiTinh').value,
            soDienThoai: document.getElementById('editSoDienThoai').value,
            email: document.getElementById('editEmail').value,
            diaChi: document.getElementById('editDiaChi').value,
            khoa: document.getElementById('editKhoa').value || null,
            nganh: document.getElementById('editNganh').value || null
        };

        try {
            Utils.showLoading();
            
            await $api.put(CONFIG.ENDPOINTS.USER_PROFILE, profileData);
            
            Utils.showAlert('Cập nhật hồ sơ thành công!', 'success');
            this.closeEditModal();
            await this.loadProfile();

        } catch (error) {
            console.error('Error saving profile:', error);
            Utils.showAlert('Lỗi cập nhật hồ sơ: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    openChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        modal.classList.add('show');
    }

    closeChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        modal.classList.remove('show');
        document.getElementById('changePasswordForm').reset();
    }

    async savePassword() {
        const form = document.getElementById('changePasswordForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            Utils.showAlert('Mật khẩu mới và xác nhận không khớp!', 'danger');
            return;
        }

        const passwordData = {
            OldPassword: document.getElementById('currentPassword').value,
            NewPassword: newPassword
        };

        try {
            Utils.showLoading();
            
            await $api.post(CONFIG.ENDPOINTS.CHANGE_PASSWORD, passwordData);
            
            Utils.showAlert('Đổi mật khẩu thành công!', 'success');
            this.closeChangePasswordModal();

        } catch (error) {
            console.error('Error changing password:', error);
            Utils.showAlert('Lỗi đổi mật khẩu: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function openEditModal() {
    window.studentProfile.openEditModal();
}

function closeEditModal() {
    window.studentProfile.closeEditModal();
}

function saveProfile() {
    window.studentProfile.saveProfile();
}

function openChangePasswordModal() {
    window.studentProfile.openChangePasswordModal();
}

function closeChangePasswordModal() {
    window.studentProfile.closeChangePasswordModal();
}

function savePassword() {
    window.studentProfile.savePassword();
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
    window.studentProfile = new StudentProfile();
});

