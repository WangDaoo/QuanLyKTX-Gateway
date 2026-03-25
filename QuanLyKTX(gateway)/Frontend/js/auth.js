// Authentication Module
class AuthService {
    constructor() {
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (Utils.isAuthenticated()) {
            this.redirectToDashboard();
        }

        // Setup login form
        this.setupLoginForm();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            const handleLoginBound = this.handleLogin.bind(this);
            
            // Attach event listener to the form's submit event
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Form submit event triggered');
                handleLoginBound();
                return false;
            });
            
            // Also attach to button click as a backup, but form submit is primary
            const submitButton = loginForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button click event triggered');
                    handleLoginBound();
                    return false;
                });
            }
            console.log('Login form setup completed');
        } else {
            console.error('Login form not found!');
        }
    }

    async handleLogin() {
        const form = document.getElementById('loginForm');
        if (!form) {
            console.error('Login form not found');
            Utils.showAlert('Lỗi: Không tìm thấy form đăng nhập!', 'danger');
            return;
        }
        
        const formData = new FormData(form);
        
        const tenDangNhap = formData.get('tenDangNhap') || document.getElementById('tenDangNhap')?.value;
        const matKhau = formData.get('matKhau') || document.getElementById('matKhau')?.value;
        
        if (!tenDangNhap || !matKhau) {
            Utils.showAlert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!', 'warning');
            return;
        }
        
        const loginData = {
            tenDangNhap: tenDangNhap.trim(),
            matKhau: matKhau
        };

        try {
            Utils.showLoading();
            console.log('Attempting login:', { tenDangNhap: loginData.tenDangNhap, endpoint: `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.LOGIN}` });
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            console.log('Login response status:', response.status);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.error('Login error response:', errorData);
                } catch (e) {
                    const errorText = await response.text();
                    console.error('Login error text:', errorText);
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Login response data:', data);

            if (data && data.success && data.token) {
                // Store token and user data
                Utils.setToken(data.token);
                if (data.user) {
                    Utils.setUser(data.user);
                }
                
                // Verify token was saved
                const savedToken = Utils.getToken();
                const savedUser = Utils.getUser();
                console.log('Login successful:', {
                    user: data.user,
                    tokenSaved: !!savedToken,
                    userSaved: !!savedUser,
                    savedUser: savedUser
                });
                
                // Show success message
                Utils.showAlert('Đăng nhập thành công!', 'success');
                
                // Redirect to dashboard after short delay (ensure token is saved)
                setTimeout(() => {
                    // Double check token before redirect
                    if (!Utils.getToken()) {
                        console.error('Token not found after login, aborting redirect');
                        Utils.showAlert('Lỗi: Token không được lưu. Vui lòng thử lại!', 'danger');
                        return;
                    }
                    this.redirectToDashboard();
                }, 500);
            } else {
                const errorMsg = data.message || 'Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.';
                console.error('Login failed:', data);
                Utils.showAlert(errorMsg, 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Lỗi đăng nhập: ';
            if (error.message) {
                errorMessage += error.message;
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += 'Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa!';
            } else {
                errorMessage += 'Vui lòng thử lại!';
            }
            Utils.showAlert(errorMessage, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    redirectToDashboard() {
        const user = Utils.getUser();
        console.log('Redirecting user:', user); // Debug log
        
        if (user) {
            // Get current path to determine relative paths
            const currentPath = window.location.pathname;
            const isInSubFolder = currentPath.includes('/admin/') || currentPath.includes('/student/');
            const basePath = isInSubFolder ? '../' : '';
            
            // Normalize role name (case-insensitive)
            const role = (user.vaiTro || user.VaiTro || '').toLowerCase();
            
            if (role === 'student') {
                const redirectUrl = basePath + 'student/dashboard.html';
                console.log('Redirecting to student dashboard:', redirectUrl); // Debug log
                window.location.href = redirectUrl;
            } else if (role === 'admin') {
                const redirectUrl = basePath + 'admin/dashboard.html';
                console.log('Redirecting to admin dashboard:', redirectUrl); // Debug log
                window.location.href = redirectUrl;
            } else if (role === 'officer') {
                const redirectUrl = basePath + 'officer/dashboard.html';
                console.log('Redirecting to officer dashboard:', redirectUrl);
                window.location.href = redirectUrl;
            } else {
                // Fallback to admin dashboard
                console.log('Unknown role, redirecting to admin dashboard');
                window.location.href = basePath + 'admin/dashboard.html';
            }
        } else {
            console.error('No user data found, redirecting to login');
            // Fallback to login
            window.location.href = 'index.html';
        }
    }

    logout() {
        Utils.removeToken();
        window.location.href = '/';
    }
}

// Initialize auth service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthService();
});

