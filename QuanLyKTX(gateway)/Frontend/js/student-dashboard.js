// Student Dashboard Module
class StudentDashboard {
    constructor() {
        this.studentInfo = null;
        this.currentRoom = null;
        this.bills = [];
        this.contracts = [];
        this.init();
    }

    init() {
        // Check authentication
        const token = Utils.getToken();
        const user = Utils.getUser();
        console.log('Student dashboard init:', { hasToken: !!token, user: user });
        
        if (!token) {
            console.warn('No token found, redirecting to login');
            Utils.requireAuth();
            return;
        }
        
        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeDashboard();
            });
        } else {
            this.initializeDashboard();
        }
    }
    
    initializeDashboard() {
        // Load user info first
        this.loadUserInfo();
        
        // Initialize sidebar
        this.initSidebar();
        
        // Load dashboard data
        this.loadDashboardData();
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = user.hoTen || user.HoTen || user.tenDangNhap || 'Sinh viên';
            }
            
            const userRole = document.querySelector('.user-role');
            if (userRole) {
                userRole.textContent = 'Sinh viên';
            }
            
            const studentNameEl = document.getElementById('studentName');
            if (studentNameEl) {
                studentNameEl.textContent = user.hoTen || user.HoTen || user.tenDangNhap || 'Sinh viên';
            }
            
            console.log('User info loaded:', user);
        } else {
            console.warn('No user data found');
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
                if (sidebar && !sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
    }

    async loadDashboardData() {
        try {
            Utils.showLoading();
            
            // Try to load home data first (if available)
            try {
                const homeData = await $api.get(CONFIG.ENDPOINTS.USER_HOME);
                if (homeData) {
                    // Use home data if available for faster loading
                    console.log('Home data loaded:', homeData);
                    // You can use homeData to populate dashboard stats
                }
            } catch (homeError) {
                console.warn('Home endpoint not available, using individual endpoints:', homeError);
            }
            
            // Load all data in parallel for better performance
            await Promise.allSettled([
                this.loadStudentProfile(),
                this.loadCurrentRoom(),
                this.loadBills(),
                this.loadContracts()
            ]);
            
            // Update stats after all data is loaded
            this.updateStats();
            
            // Load recent bills
            this.loadRecentBills();
            
            // Load notifications
            await this.loadNotifications();
            
            console.log('Dashboard data loaded successfully');

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Utils.showAlert('Lỗi tải dữ liệu dashboard!', 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async loadStudentProfile() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.USER_PROFILE);
            this.studentInfo = data;
            console.log('Student profile loaded:', data);
        } catch (error) {
            console.error('Error loading student profile:', error);
            const user = Utils.getUser();
            if (user) {
                this.studentInfo = user;
                console.log('Using user data from localStorage as profile');
            }
        }
    }

    async loadCurrentRoom() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.USER_ROOMS_CURRENT || (CONFIG.ENDPOINTS.USER_ROOMS + '/current'));
            this.currentRoom = data;
            console.log('Current room loaded:', data);
        } catch (error) {
            console.error('Error loading current room:', error);
            this.currentRoom = null;
        }
    }

    async loadBills() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.USER_BILLS);
            this.bills = Array.isArray(data) ? data : [];
            console.log('Bills loaded from user endpoint:', this.bills.length);
        } catch (error) {
            console.error('Error loading bills:', error);
            this.bills = [];
        }
    }

    async loadContracts() {
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.USER_CONTRACTS);
            this.contracts = Array.isArray(data) ? data : [];
            console.log('Contracts loaded from user endpoint:', this.contracts.length);
        } catch (error) {
            console.error('Error loading contracts:', error);
            this.contracts = [];
        }
    }

    updateStats() {
        try {
            // Update current room
            const currentRoomEl = document.getElementById('currentRoom');
            if (currentRoomEl) {
                if (this.currentRoom) {
                    const roomInfo = this.currentRoom.soPhong || 
                                    this.currentRoom.tenPhong || 
                                    this.currentRoom.SoPhong || 
                                    this.currentRoom.soPhong || 
                                    'N/A';
                    currentRoomEl.textContent = roomInfo;
                    console.log('Updated current room:', roomInfo);
                } else {
                    currentRoomEl.textContent = 'N/A';
                    console.log('No current room found');
                }
            } else {
                console.warn('currentRoom element not found');
            }
        
            // Update unpaid bills
            const unpaidBillsEl = document.getElementById('unpaidBills');
            if (unpaidBillsEl) {
                const unpaidBills = this.bills.filter(bill => {
                    const status = (bill.trangThai || bill.TrangThai || '').toString().toLowerCase();
                    return status !== 'đã thanh toán' && 
                           status !== 'da thanh toan' && 
                           status !== 'đã trả' &&
                           status !== 'da tra' &&
                           status !== 'paid';
                });
                unpaidBillsEl.textContent = unpaidBills.length;
                console.log('Updated unpaid bills:', unpaidBills.length, 'out of', this.bills.length);
            } else {
                console.warn('unpaidBills element not found');
            }
        
            // Update active contracts
            const activeContractsEl = document.getElementById('activeContracts');
            if (activeContractsEl) {
                const activeContracts = this.contracts.filter(contract => {
                    const status = (contract.trangThai || contract.TrangThai || '').toString().toLowerCase();
                    return status === 'đang hiệu lực' || 
                           status === 'dang hieu luc' ||
                           status === 'hoạt động' ||
                           status === 'hoat dong' ||
                           status === 'đang hoạt động' ||
                           status === 'dang hoat dong' ||
                           status === 'active' ||
                           status === 'đang có hiệu lực';
                });
                activeContractsEl.textContent = activeContracts.length;
                console.log('Updated active contracts:', activeContracts.length, 'out of', this.contracts.length);
            } else {
                console.warn('activeContracts element not found');
            }
        
            // Update pending requests (mock data for now)
            const pendingRequestsEl = document.getElementById('pendingRequests');
            if (pendingRequestsEl) {
                pendingRequestsEl.textContent = '0';
            }
            
            console.log('Stats updated:', {
                room: this.currentRoom,
                billsCount: this.bills.length,
                contractsCount: this.contracts.length,
                unpaidBills: this.bills.filter(b => {
                    const s = (b.trangThai || b.TrangThai || '').toString().toLowerCase();
                    return s !== 'đã thanh toán' && s !== 'da thanh toan' && s !== 'paid';
                }).length
            });
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    loadRecentBills() {
        const billsContainer = document.getElementById('recentBills');
        if (!billsContainer) {
            console.warn('Recent bills container not found');
            return;
        }
        
        if (this.bills.length === 0) {
            billsContainer.innerHTML = '<p class="text-center">Không có hóa đơn nào</p>';
            return;
        }

        const recentBills = this.bills.slice(0, 5);
        
        billsContainer.innerHTML = recentBills.map(bill => {
            const thang = bill.thang || bill.Thang || '';
            const nam = bill.nam || bill.Nam || '';
            const trangThai = bill.trangThai || bill.TrangThai || '';
            const tongTien = bill.tongTien || bill.TongTien || 0;
            const ngayTao = bill.ngayTao || bill.NgayTao || '';
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e9ecef;">
                    <div>
                        <div style="font-weight: 500;">Tháng ${thang}/${nam}</div>
                        <div style="font-size: 0.8rem; color: #666;">${ngayTao ? Utils.formatDate(ngayTao) : ''}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; color: ${trangThai === 'Đã thanh toán' || trangThai === 'Da thanh toan' ? '#27ae60' : '#e74c3c'};">
                            ${Utils.formatCurrency(tongTien)}
                        </div>
                        <div style="font-size: 0.8rem; color: #666;">
                            ${trangThai}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadNotifications() {
        const notificationsContainer = document.getElementById('notifications');
        if (!notificationsContainer) return;
        
        try {
            const data = await $api.get(CONFIG.ENDPOINTS.USER_NOTIFICATIONS);
            const notifications = Array.isArray(data) ? data : [];
            
            if (notifications.length === 0) {
                notificationsContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #666;">
                        <i class="fas fa-bell-slash" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>Không có thông báo mới</p>
                    </div>
                `;
                return;
            }

            notificationsContainer.innerHTML = notifications.map(notification => {
                const maThongBao = notification.maThongBao || notification.MaThongBao || '';
                const noiDung = notification.noiDung || notification.NoiDung || '';
                const ngayThongBao = notification.ngayThongBao || notification.NgayThongBao;
                const trangThai = notification.trangThai || notification.TrangThai || '';
                
                // Xác định icon và màu dựa trên nội dung
                let icon = 'fas fa-info-circle';
                let color = '#34495e';
                if (noiDung.toLowerCase().includes('quá hạn') || noiDung.toLowerCase().includes('qua han')) {
                    icon = 'fas fa-exclamation-triangle';
                    color = '#e74c3c';
                } else if (noiDung.toLowerCase().includes('hóa đơn') || noiDung.toLowerCase().includes('hoa don')) {
                    icon = 'fas fa-file-invoice-dollar';
                    color = '#f39c12';
                } else if (noiDung.toLowerCase().includes('hợp đồng') || noiDung.toLowerCase().includes('hop dong')) {
                    icon = 'fas fa-file-contract';
                    color = '#3498db';
                }
                
                const timeAgo = ngayThongBao ? this.getTimeAgo(new Date(ngayThongBao)) : '';
                const isUnread = trangThai !== 'Đã xem' && trangThai !== 'Da xem';
                
                return `
                    <div style="display: flex; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e9ecef; ${isUnread ? 'background-color: #f8f9fa;' : ''}; cursor: pointer;" onclick="viewNotificationDetails(${maThongBao})">
                        <i class="${icon}" style="color: ${color}; margin-right: 1rem; width: 20px;"></i>
                        <div style="flex: 1;">
                            <div style="font-size: 0.9rem; ${isUnread ? 'font-weight: bold;' : ''}">${noiDung}</div>
                            <div style="font-size: 0.8rem; color: #666;">${timeAgo}</div>
                        </div>
                        ${isUnread ? '<i class="fas fa-circle" style="color: #3498db; font-size: 0.5rem;"></i>' : ''}
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading notifications:', error);
            notificationsContainer.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Lỗi tải thông báo</p>
                </div>
            `;
        }
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} ngày trước`;
        if (hours > 0) return `${hours} giờ trước`;
        if (minutes > 0) return `${minutes} phút trước`;
        return 'Vừa xong';
    }
    
    async viewNotificationDetails(notificationId) {
        try {
            Utils.showLoading();
            const data = await $api.get(CONFIG.ENDPOINTS.USER_NOTIFICATION_BY_ID(notificationId));
            
            const noiDung = data.noiDung || data.NoiDung || '';
            const ngayThongBao = data.ngayThongBao || data.NgayThongBao;
            const trangThai = data.trangThai || data.TrangThai || '';
            
            alert(`Thông báo:\n\n${noiDung}\n\nNgày: ${ngayThongBao ? Utils.formatDate(ngayThongBao) : 'N/A'}\nTrạng thái: ${trangThai}`);
            
            // Reload notifications để cập nhật trạng thái
            await this.loadNotifications();
        } catch (error) {
            console.error('Error loading notification details:', error);
            Utils.showAlert('Lỗi tải chi tiết thông báo: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Toggle sidebar function
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// Logout function
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        Utils.removeToken();
        window.location.href = '../index.html';
    }
}

// View notification details
function viewNotificationDetails(notificationId) {
    if (window.studentDashboard) {
        window.studentDashboard.viewNotificationDetails(notificationId);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studentDashboard = new StudentDashboard();
});
