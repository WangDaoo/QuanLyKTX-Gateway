// Admin Dashboard Module
class AdminDashboard {
    constructor() {
        this.init();
    }

    init() {
        // Check authentication
        Utils.requireAuth();
        
        // Load user info
        this.loadUserInfo();
        
        // Load dashboard data
        this.loadDashboardData();
        
        // Setup navigation
        this.setupNavigation();
        
        // Initialize sidebar
        this.initSidebar();
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            const adminNameEl = document.getElementById('adminName');
            
            const displayName = user.hoTen || user.tenDangNhap || 'Admin';
            
            if (userNameEl) userNameEl.textContent = displayName;
            if (adminNameEl) adminNameEl.textContent = displayName;
            
            const userRole = document.querySelector('.user-role');
            if (userRole) {
                const roleMap = {
                    'Admin': 'Quản trị viên',
                    'Officer': 'Nhân viên',
                    'Student': 'Sinh viên'
                };
                userRole.textContent = roleMap[user.vaiTro] || user.vaiTro || 'Quản trị viên';
            }
        }
    }

    initSidebar() {
        // Toggle sidebar on mobile
        const menuToggle = document.querySelector('.header-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
    }

    setupNavigation() {
        // Set active nav item
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    async loadDashboardData() {
        try {
            Utils.showLoading();
            
            // Load stats in parallel
            const [buildings, rooms, students, bills, beds, contracts, requests] = await Promise.all([
                this.loadBuildings(),
                this.loadRooms(),
                this.loadStudents(),
                this.loadBills(),
                this.loadBeds(),
                this.loadContracts(),
                this.loadChangeRequests()
            ]);

            // Filter unpaid bills
            const unpaidBills = bills.filter(b => b.trangThai === 'Chưa thanh toán' || b.trangThai === 'Chưa thanh toan');

            // Update stats
            document.getElementById('totalBuildings').textContent = buildings.length || 0;
            document.getElementById('totalRooms').textContent = rooms.length || 0;
            document.getElementById('totalStudents').textContent = students.length || 0;
            document.getElementById('totalBills').textContent = unpaidBills.length || 0;
            document.getElementById('totalBeds').textContent = beds.length || 0;

            // Calculate occupancy rate
            const occupiedRooms = rooms.filter(r => r.trangThai !== 'Trống' && r.trangThai !== 'Trong').length;
            const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
            document.getElementById('occupancyRate').textContent = occupancyRate + '%';

            // Update change indicators
            document.getElementById('buildingsChange').textContent = buildings.length || 0;
            document.getElementById('roomsChange').textContent = rooms.length || 0;
            document.getElementById('studentsChange').textContent = students.length || 0;

            // Update quick stats
            const emptyRooms = rooms.filter(r => r.trangThai === 'Trống' || r.trangThai === 'Trong').length;
            const fullRooms = rooms.filter(r => r.trangThai !== 'Trống' && r.trangThai !== 'Trong').length;
            const activeContractsList = contracts.filter(c => c.trangThai === 'Đang hoạt động' || c.trangThai === 'Dang hoat dong');
            const pendingRequestsList = requests.filter(r => r.trangThai === 'Chờ duyệt' || r.trangThai === 'Cho duyet');

            document.getElementById('emptyRooms').textContent = emptyRooms || 0;
            document.getElementById('fullRooms').textContent = fullRooms || 0;
            document.getElementById('activeContracts').textContent = activeContractsList.length || 0;
            document.getElementById('pendingRequests').textContent = pendingRequestsList.length || 0;

            // Set current date
            const today = new Date();
            const dateStr = today.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            document.getElementById('currentDate').textContent = dateStr;

            // Load recent activities
            this.loadRecentActivities();
            
            // Load notifications
            this.loadNotifications();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Utils.showAlert('Lỗi tải dữ liệu dashboard!', 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async loadBuildings() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.BUILDINGS);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error loading buildings:', error);
            return [];
        }
    }

    async loadRooms() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.ROOMS);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error loading rooms:', error);
            return [];
        }
    }

    async loadStudents() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.STUDENTS);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error loading students:', error);
            return [];
        }
    }

    async loadBills() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.BILLS);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error loading bills:', error);
            return [];
        }
    }

    async loadBeds() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.BEDS || '/admin/api/beds');
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error loading beds:', error);
            return [];
        }
    }

    async loadContracts() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.CONTRACTS);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error loading contracts:', error);
            return [];
        }
    }

    async loadChangeRequests() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.CHANGE_REQUESTS || '/admin/api/change-requests');
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error loading change requests:', error);
            return [];
        }
    }

    loadNotifications() {
        const notificationsContainer = document.getElementById('importantNotifications');
        const badge = document.getElementById('notificationBadge');
        
        // Mock notifications - có thể thay bằng API call thực tế
        const notifications = [
            { type: 'warning', icon: 'exclamation-triangle', text: 'Có 5 hóa đơn quá hạn thanh toán', time: '2 giờ trước' },
            { type: 'info', icon: 'info-circle', text: '3 yêu cầu chuyển phòng đang chờ duyệt', time: '1 ngày trước' }
        ];

        if (notifications.length === 0) {
            notificationsContainer.innerHTML = `
                <div class="notification-item">
                    <i class="fas fa-info-circle text-info"></i>
                    <span>Không có thông báo mới</span>
                </div>
            `;
            if (badge) badge.textContent = '0';
            return;
        }

        notificationsContainer.innerHTML = notifications.map(notif => `
            <div class="notification-item ${notif.type}">
                <i class="fas fa-${notif.icon} text-${notif.type}"></i>
                <div class="notification-content">
                    <div class="notification-text">${notif.text}</div>
                    <div class="notification-time">${notif.time}</div>
                </div>
            </div>
        `).join('');

        if (badge) badge.textContent = notifications.length.toString();
    }

    loadRecentActivities() {
        const activitiesContainer = document.getElementById('recentActivities');
        
        // Mock recent activities - có thể thay bằng API call thực tế
        const activities = [
            { icon: 'user-plus', text: 'Thêm sinh viên mới: Nguyễn Văn A', time: '2 phút trước', color: 'success' },
            { icon: 'building', text: 'Cập nhật thông tin tòa nhà A', time: '15 phút trước', color: 'info' },
            { icon: 'file-invoice', text: 'Tạo hóa đơn tháng 10/2024', time: '1 giờ trước', color: 'primary' },
            { icon: 'door-open', text: 'Phòng A101 đã được phân bổ', time: '2 giờ trước', color: 'success' },
            { icon: 'tachometer-alt', text: 'Cập nhật chỉ số điện nước', time: '3 giờ trước', color: 'warning' }
        ];

        if (activities.length === 0) {
            activitiesContainer.innerHTML = `
                <div class="activity-empty">
                    <i class="fas fa-inbox"></i>
                    <p>Chưa có hoạt động nào</p>
                </div>
            `;
            return;
        }

        activitiesContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon bg-${activity.color}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
}

// Generate monthly bills function
async function generateMonthlyBills() {
    if (!confirm('Bạn có chắc chắn muốn tạo hóa đơn cho tháng hiện tại?')) {
        return;
    }

    try {
        Utils.showLoading();
        
        const currentDate = new Date();
        const thang = currentDate.getMonth() + 1;
        const nam = currentDate.getFullYear();
        
        await $api.post(`${CONFIG.ENDPOINTS.REPORTS}/generate-monthly-bills?thang=${thang}&nam=${nam}`, {});

        Utils.showAlert('Tạo hóa đơn thành công!', 'success');
        
        // Reload dashboard data
        setTimeout(() => {
            if (window.adminDashboard) {
                window.adminDashboard.loadDashboardData();
            } else {
                window.location.reload();
            }
        }, 2000);

    } catch (error) {
        console.error('Error generating monthly bills:', error);
        Utils.showAlert('Lỗi tạo hóa đơn: ' + error.message, 'danger');
    } finally {
        Utils.hideLoading();
    }
}

// Toggle sidebar function
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// Toggle notifications
function toggleNotifications() {
    // Có thể mở modal hoặc dropdown hiển thị thông báo
    console.log('Toggle notifications');
}

// Toggle user menu
function toggleUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.header-user-menu');
    const dropdown = document.getElementById('userMenuDropdown');
    
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// View profile
function viewProfile() {
    alert('Chức năng xem hồ sơ đang được phát triển');
}

// Logout function
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        Utils.removeToken();
        window.location.href = '../index.html';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});

