// Admin Change Password Module
class AdminChangePassword {
    constructor() {
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.setupForm();
        this.fixSidebarScroll();
    }

    fixSidebarScroll() {
        // Đảm bảo sidebar không tự động scroll khi trang load
        // Đợi DOM load xong rồi mới scroll
        setTimeout(() => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                // Scroll sidebar về đầu
                sidebar.scrollTop = 0;
                // Ngăn auto-scroll behavior
                sidebar.style.scrollBehavior = 'auto';
            }
            
            // Scroll main content về đầu
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 100);
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) userNameEl.textContent = user.hoTen || user.HoTen || user.tenDangNhap || user.TenDangNhap;
            
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

    setupForm() {
        const form = document.getElementById('changePasswordForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleChangePassword();
            });
        }
    }

    async handleChangePassword() {
        const form = document.getElementById('changePasswordForm');
        if (!form || !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate password match
        if (newPassword !== confirmPassword) {
            Utils.showAlert('Mật khẩu mới và xác nhận mật khẩu không khớp!', 'warning');
            return;
        }

        // Validate password length
        if (newPassword.length < 6) {
            Utils.showAlert('Mật khẩu mới phải có ít nhất 6 ký tự!', 'warning');
            return;
        }

        // Validate old password is different from new password
        if (oldPassword === newPassword) {
            Utils.showAlert('Mật khẩu mới phải khác mật khẩu hiện tại!', 'warning');
            return;
        }

        try {
            Utils.showLoading();

            const passwordData = {
                OldPassword: oldPassword,
                NewPassword: newPassword
            };

            console.log('Changing password...');
            await $api.post(CONFIG.ENDPOINTS.CHANGE_PASSWORD, passwordData);
            
            Utils.showAlert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
            
            // Clear form
            form.reset();
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                Utils.removeToken();
                Utils.removeUser();
                window.location.href = '../index.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error changing password:', error);
            let errorMessage = 'Lỗi đổi mật khẩu: ';
            if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Vui lòng thử lại!';
            }
            Utils.showAlert(errorMessage, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AdminChangePassword();
});

