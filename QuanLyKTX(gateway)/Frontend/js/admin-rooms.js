// Admin Rooms Module
class AdminRooms {
    constructor() {
        this.rooms = [];
        this.buildings = [];
        this.editingRoom = null;
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
                this.loadBuildings(),
                this.loadRooms()
            ]);
            this.setupForm();
        } catch (error) {
            console.error('Failed to initialize AdminRooms:', error);
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

    async loadBuildings() {
        try {
            const buildingsData = await $api.get(CONFIG.ENDPOINTS.BUILDINGS);
            
            // Handle different response formats
            let buildingsArray = [];
            if (Array.isArray(buildingsData)) {
                buildingsArray = buildingsData;
            } else if (buildingsData && Array.isArray(buildingsData.data)) {
                buildingsArray = buildingsData.data;
            } else if (buildingsData && buildingsData.success && Array.isArray(buildingsData.data)) {
                buildingsArray = buildingsData.data;
            } else {
                console.warn('Unexpected buildings data format:', buildingsData);
            }
            
            this.buildings = buildingsArray;
            this.populateBuildingFilter();
            this.populateBuildingSelect();
        } catch (error) {
            console.error('Error loading buildings:', error);
            this.buildings = [];
        }
    }

    populateBuildingFilter() {
        const filter = document.getElementById('buildingFilter');
        if (!filter) return;

        filter.innerHTML = '<option value="">Tất cả tòa nhà</option>';
        this.buildings.forEach(building => {
            const option = document.createElement('option');
            option.value = building.maToaNha;
            option.textContent = building.tenToaNha || building.TenToaNha || `Tòa nhà ${building.maToaNha}`;
            filter.appendChild(option);
        });
    }

    populateBuildingSelect() {
        const select = document.getElementById('maToaNha');
        if (!select) return;

        select.innerHTML = '<option value="">Chọn tòa nhà</option>';
        this.buildings.forEach(building => {
            const option = document.createElement('option');
            option.value = building.maToaNha;
            option.textContent = building.tenToaNha || building.TenToaNha || `Tòa nhà ${building.maToaNha}`;
            select.appendChild(option);
        });
    }

    setupForm() {
        const form = document.getElementById('roomForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRoom();
            });
        }
    }

    async loadRooms() {
        try {
            Utils.showLoading();

            console.log('Loading rooms from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.ROOMS);

            const data = await $api.get(CONFIG.ENDPOINTS.ROOMS);
            console.log('Rooms data received:', data);
            
            // Handle different response formats
            let roomsArray = [];
            if (Array.isArray(data)) {
                roomsArray = data;
            } else if (data && Array.isArray(data.data)) {
                roomsArray = data.data;
            } else if (data && data.success && Array.isArray(data.data)) {
                roomsArray = data.data;
            } else {
                console.warn('Unexpected data format:', data);
            }
            
            this.rooms = roomsArray;
            console.log('Rooms array:', this.rooms);
            
            this.renderRoomsTable();
            
        } catch (error) {
            console.error('Error loading rooms:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                endpoint: CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.ROOMS
            });
            
            // Show error in table
            const tbody = document.getElementById('roomsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <p style="font-size: 0.8rem; color: #666;">Vui lòng kiểm tra console để biết thêm chi tiết</p>
                        </td>
                    </tr>
                `;
            }
            
            Utils.showAlert('Lỗi tải danh sách phòng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderRoomsTable(rooms = null) {
        const tbody = document.getElementById('roomsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayRooms = rooms || this.rooms;
        
        if (displayRooms.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayRooms.map(room => {
            const maPhong = room.maPhong || 'N/A';
            const soPhong = room.soPhong || 'N/A';
            const building = this.buildings.find(b => b.maToaNha === room.maToaNha);
            const buildingName = building ? (building.tenToaNha || building.TenToaNha || 'N/A') : (room.tenToaNha || room.TenToaNha || 'N/A');
            const soGiuong = room.soGiuong || 0;
            const loaiPhong = room.loaiPhong || 'N/A';
            const giaPhong = room.giaPhong || 0;
            const trangThai = room.trangThai || 'N/A';
            
            let statusClass = 'badge-secondary';
            if (trangThai === 'Trống') statusClass = 'badge-success';
            else if (trangThai === 'Đã đầy') statusClass = 'badge-danger';
            else if (trangThai === 'Đang sửa chữa') statusClass = 'badge-warning';

            return `
                <tr>
                    <td data-label="Mã phòng"><strong>${maPhong}</strong></td>
                    <td data-label="Số phòng">
                        <div class="building-name">
                            <i class="fas fa-door-open"></i>
                            ${soPhong}
                        </div>
                    </td>
                    <td data-label="Tòa nhà">${buildingName}</td>
                    <td data-label="Số giường">
                        <span class="badge badge-info">
                            <i class="fas fa-bed"></i> ${soGiuong}
                        </span>
                    </td>
                    <td data-label="Loại phòng">${loaiPhong}</td>
                    <td data-label="Giá phòng"><strong>${Utils.formatCurrency(giaPhong)}</strong></td>
                    <td data-label="Trạng thái">
                        <span class="badge ${statusClass}">
                            ${trangThai}
                        </span>
                    </td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="editRoom(${maPhong})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="viewRoomDetails(${maPhong})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteRoom(${maPhong})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openModal(room = null) {
        this.editingRoom = room;
        const modal = document.getElementById('roomModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const saveButtonText = document.getElementById('saveButtonText');
        
        if (room) {
            modalTitleText.textContent = 'Chỉnh sửa phòng';
            saveButtonText.textContent = 'Cập nhật';
            this.fillForm(room);
        } else {
            modalTitleText.textContent = 'Thêm phòng';
            saveButtonText.textContent = 'Thêm mới';
            this.clearForm();
        }
        
        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('roomModal');
        modal.classList.remove('show');
        this.editingRoom = null;
        this.clearForm();
    }

    fillForm(room) {
        document.getElementById('roomId').value = room.maPhong;
        document.getElementById('maToaNha').value = room.maToaNha;
        document.getElementById('soPhong').value = room.soPhong;
        document.getElementById('soGiuong').value = room.soGiuong;
        document.getElementById('loaiPhong').value = room.loaiPhong;
        document.getElementById('giaPhong').value = room.giaPhong;
        document.getElementById('trangThai').value = room.trangThai;
        document.getElementById('moTa').value = room.moTa || '';
    }

    clearForm() {
        document.getElementById('roomForm').reset();
        document.getElementById('roomId').value = '';
    }

    async saveRoom() {
        const form = document.getElementById('roomForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const roomData = {
            maToaNha: parseInt(document.getElementById('maToaNha').value),
            soPhong: document.getElementById('soPhong').value,
            soGiuong: parseInt(document.getElementById('soGiuong').value),
            loaiPhong: document.getElementById('loaiPhong').value,
            giaPhong: parseFloat(document.getElementById('giaPhong').value),
            trangThai: document.getElementById('trangThai').value,
            moTa: document.getElementById('moTa').value || null
        };

        try {
            Utils.showLoading();

            if (this.editingRoom) {
                await $api.put(`${CONFIG.ENDPOINTS.ROOMS}/${this.editingRoom.maPhong}`, roomData);
                Utils.showAlert('Cập nhật phòng thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.ROOMS, roomData);
                Utils.showAlert('Thêm phòng thành công!', 'success');
            }
            
            this.closeModal();
            this.loadRooms();

        } catch (error) {
            console.error('Error saving room:', error);
            Utils.showAlert('Lỗi lưu phòng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteRoom(roomId) {
        if (!confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
            return;
        }

        try {
            Utils.showLoading();

            await $api.delete(`${CONFIG.ENDPOINTS.ROOMS}/${roomId}`);

            Utils.showAlert('Xóa phòng thành công!', 'success');
            this.loadRooms();

        } catch (error) {
            console.error('Error deleting room:', error);
            Utils.showAlert('Lỗi xóa phòng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async loadEmptyRooms() {
        try {
            Utils.showLoading();

            console.log('Loading empty rooms from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.ROOMS_EMPTY);

            const data = await $api.get(CONFIG.ENDPOINTS.ROOMS_EMPTY);
            console.log('Empty rooms data received:', data);
            
            // Handle different response formats
            let roomsArray = [];
            if (Array.isArray(data)) {
                roomsArray = data;
            } else if (data && Array.isArray(data.data)) {
                roomsArray = data.data;
            } else if (data && data.success && Array.isArray(data.data)) {
                roomsArray = data.data;
            } else {
                console.warn('Unexpected data format:', data);
            }
            
            if (roomsArray.length === 0) {
                Utils.showAlert('Không có phòng trống nào!', 'info');
                Utils.hideLoading();
                return;
            }

            // Show empty rooms in table
            this.renderRoomsTable(roomsArray);
            Utils.showAlert(`Tìm thấy ${roomsArray.length} phòng trống!`, 'success');

        } catch (error) {
            console.error('Error loading empty rooms:', error);
            Utils.showAlert('Lỗi tải danh sách phòng trống: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function openRoomModal() {
    window.adminRooms.openModal();
}

function closeRoomModal() {
    window.adminRooms.closeModal();
}

function saveRoom() {
    window.adminRooms.saveRoom();
}

function editRoom(roomId) {
    const room = window.adminRooms.rooms.find(r => r.maPhong === roomId);
    if (room) {
        window.adminRooms.openModal(room);
    }
}

function deleteRoom(roomId) {
    window.adminRooms.deleteRoom(roomId);
}

function viewRoomDetails(roomId) {
    const room = window.adminRooms.rooms.find(r => r.maPhong === roomId);
    if (room) {
        const building = window.adminRooms.buildings.find(b => b.maToaNha === room.maToaNha);
        const buildingName = building ? (building.tenToaNha || building.TenToaNha) : (room.tenToaNha || room.TenToaNha || 'N/A');
        alert(`Chi tiết phòng:\n\nSố phòng: ${room.soPhong}\nTòa nhà: ${buildingName}\nSố giường: ${room.soGiuong}\nLoại phòng: ${room.loaiPhong}\nGiá phòng: ${Utils.formatCurrency(room.giaPhong)}\nTrạng thái: ${room.trangThai}`);
    }
}

function filterRooms() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const buildingFilter = document.getElementById('buildingFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = window.adminRooms.rooms.filter(room => {
        const matchSearch = !searchInput || 
            room.soPhong.toLowerCase().includes(searchInput) ||
            (room.moTa && room.moTa.toLowerCase().includes(searchInput));
        
        const matchBuilding = !buildingFilter || room.maToaNha === parseInt(buildingFilter);
        const matchStatus = !statusFilter || room.trangThai === statusFilter;
        
        return matchSearch && matchBuilding && matchStatus;
    });
    
    window.adminRooms.renderRoomsTable(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('buildingFilter').value = '';
    document.getElementById('statusFilter').value = '';
    window.adminRooms.renderRoomsTable();
}

function showEmptyRooms() {
    window.adminRooms.loadEmptyRooms();
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
    window.adminRooms = new AdminRooms();
});

