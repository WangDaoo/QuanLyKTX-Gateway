// Student Room Module
class StudentRoom {
    constructor() {
        this.roomInfo = null;
        this.roommates = [];
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.loadRoomInfo();
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

    async loadRoomInfo() {
        try {
            Utils.showLoading();
            
            const user = Utils.getUser();
            if (!user) {
                this.showNoRoom();
                return;
            }
            
            // Try to get room from dedicated student endpoints
            let roomData = null;
            
            try {
                roomData = await $api.get(CONFIG.ENDPOINTS.USER_ROOMS_CURRENT || (CONFIG.ENDPOINTS.USER_ROOMS + '/current'));
            } catch (error) {
                console.warn('User rooms current endpoint failed, trying profile fallback:', error);
            }
            
            // If no room from current endpoint, try to get from student profile
            if (!roomData) {
                try {
                    const studentProfile = await $api.get(CONFIG.ENDPOINTS.USER_PROFILE);
                    if (studentProfile && (studentProfile.maPhong || studentProfile.MaPhong)) {
                        const roomId = studentProfile.maPhong || studentProfile.MaPhong;
                        roomData = await $api.get(CONFIG.ENDPOINTS.USER_ROOM_BY_ID(roomId));
                    }
                } catch (error) {
                    console.warn('Could not load room from profile:', error);
                }
            }
            
            if (roomData) {
                this.roomInfo = roomData;
                this.renderRoomInfo();
                await this.loadRoommates();
                // Load building info if available
                await this.loadBuildingInfo();
            } else {
                this.showNoRoom();
            }
            
        } catch (error) {
            console.error('Error loading room info:', error);
            Utils.showAlert('Lỗi tải thông tin phòng: ' + error.message, 'danger');
            this.showNoRoom();
        } finally {
            Utils.hideLoading();
        }
    }
    
    async loadBuildingInfo() {
        if (!this.roomInfo || !(this.roomInfo.maToaNha || this.roomInfo.MaToaNha)) {
            return;
        }
        
        try {
            const buildingId = this.roomInfo.maToaNha || this.roomInfo.MaToaNha;
            const buildingData = await $api.get(CONFIG.ENDPOINTS.USER_BUILDING_BY_ID(buildingId));
            
            // Display building info if needed
            if (buildingData) {
                console.log('Building info loaded:', buildingData);
                // You can add building details to the UI here if needed
            }
        } catch (error) {
            console.warn('Could not load building info:', error);
        }
    }

    renderRoomInfo() {
        if (!this.roomInfo) {
            this.showNoRoom();
            return;
        }
        
        const room = this.roomInfo;
        const roomInfoDiv = document.getElementById('roomInfo');
        const noRoomMessage = document.getElementById('noRoomMessage');
        
        if (roomInfoDiv) roomInfoDiv.style.display = 'block';
        if (noRoomMessage) noRoomMessage.style.display = 'none';
        
        document.getElementById('tenToaNha').textContent = room.tenToaNha || room.TenToaNha || '-';
        document.getElementById('soPhong').textContent = room.soPhong || room.SoPhong || '-';
        document.getElementById('soGiuong').textContent = room.soGiuong || room.SoGiuong || '-';
        document.getElementById('sucChua').textContent = room.sucChua || room.SucChua || '-';
        
        const trangThai = room.trangThai || room.TrangThai || 'N/A';
        let statusBadge = 'badge-secondary';
        if (trangThai === 'Đang sử dụng' || trangThai === 'Dang su dung') statusBadge = 'badge-success';
        else if (trangThai === 'Đang sửa chữa' || trangThai === 'Dang sua chua') statusBadge = 'badge-warning';
        else if (trangThai === 'Ngừng sử dụng' || trangThai === 'Ngung su dung') statusBadge = 'badge-danger';
        
        document.getElementById('trangThaiPhong').innerHTML = `<span class="badge ${statusBadge}">${trangThai}</span>`;
        document.getElementById('giaPhong').textContent = room.giaPhong ? Utils.formatCurrency(room.giaPhong) : (room.GiaPhong ? Utils.formatCurrency(room.GiaPhong) : '-');
        document.getElementById('ngayVaoO').textContent = room.ngayVaoO ? Utils.formatDate(room.ngayVaoO) : (room.NgayVaoO ? Utils.formatDate(room.NgayVaoO) : '-');
        document.getElementById('ghiChuPhong').textContent = room.ghiChu || room.GhiChu || '-';
    }

    async loadRoommates() {
        if (!this.roomInfo) return;
        
        try {
            // Hiện tại API người dùng chưa cung cấp danh sách bạn cùng phòng nên hiển thị thông báo tạm
            this.roommates = [];
            const roommatesCard = document.getElementById('roommatesCard');
            if (roommatesCard) {
                roommatesCard.style.display = 'none';
            }
            const roommatesTable = document.getElementById('roommatesTableBody');
            if (roommatesTable) {
                roommatesTable.innerHTML = '<tr><td colspan="4" class="text-center">Chức năng đang được cập nhật</td></tr>';
            }
        } catch (error) {
            console.error('Error loading roommates:', error);
        }
    }

    renderRoommates() {
        const tbody = document.getElementById('roommatesTableBody');
        if (!tbody) return;
        
        if (this.roommates.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Chưa có bạn cùng phòng</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.roommates.map(roommate => `
            <tr>
                <td>${roommate.mssv || roommate.MSSV || '-'}</td>
                <td>${roommate.hoTen || roommate.HoTen || '-'}</td>
                <td>${roommate.soDienThoai || roommate.SoDienThoai || '-'}</td>
                <td>${roommate.email || roommate.Email || '-'}</td>
            </tr>
        `).join('');
    }

    showNoRoom() {
        const roomInfoDiv = document.getElementById('roomInfo');
        const noRoomMessage = document.getElementById('noRoomMessage');
        const roommatesCard = document.getElementById('roommatesCard');
        
        if (roomInfoDiv) roomInfoDiv.style.display = 'none';
        if (noRoomMessage) noRoomMessage.style.display = 'block';
        if (roommatesCard) roommatesCard.style.display = 'none';
    }
}

// Global functions
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
    window.studentRoom = new StudentRoom();
});

