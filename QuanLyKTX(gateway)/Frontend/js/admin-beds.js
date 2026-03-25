// Admin Beds Module
class AdminBeds {
    constructor() {
        this.beds = [];
        this.rooms = [];
        this.buildings = [];
        this.editingBed = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            console.log('AdminBeds: Starting bootstrap...');
            await Promise.all([
                this.loadBuildings(),
                this.loadRooms()
            ]);
            console.log('AdminBeds: Buildings and rooms loaded, loading beds...');
            await this.loadBeds();
            this.setupForm();
            console.log('AdminBeds: Bootstrap completed successfully');
        } catch (error) {
            console.error('Failed to initialize AdminBeds:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
        }
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
        const userNameEl = document.getElementById('userName');
            const userRoleEl = document.getElementById('userRole');

        if (userNameEl) {
                userNameEl.textContent = user.hoTen || user.tenDangNhap;
        }
            if (userRoleEl) {
        const roleMap = {
            'Admin': 'Quản trị viên',
            'Officer': 'Nhân viên',
            'Student': 'Sinh viên'
        };
                userRoleEl.textContent = roleMap[user.vaiTro] || user.vaiTro;
            }
        }
    }

    setupForm() {
        const form = document.getElementById('bedForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBed();
            });
        }
    }

    async loadBuildings() {
        try {
            const response = await $api.get(CONFIG.ENDPOINTS.BUILDINGS);
            console.log('Buildings response:', response);
            
            // Handle different response formats
            let buildingsArray = [];
            if (Array.isArray(response)) {
                buildingsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    buildingsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    buildingsArray = response.data;
                } else {
                    console.warn('Unexpected buildings data format:', response);
                }
            }
            
            this.buildings = buildingsArray || [];
            console.log('Buildings loaded:', this.buildings.length);
            this.populateBuildingFilter();
            this.populateRoomSelect();
        } catch (error) {
            console.error('Error loading buildings:', error);
            this.buildings = [];
        }
    }

    async loadRooms() {
        try {
            const response = await $api.get(CONFIG.ENDPOINTS.ROOMS);
            console.log('Rooms response:', response);
            
            // Handle different response formats
            let roomsArray = [];
            if (Array.isArray(response)) {
                roomsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    roomsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    roomsArray = response.data;
                } else {
                    console.warn('Unexpected rooms data format:', response);
                }
            }
            
            this.rooms = roomsArray || [];
            console.log('Rooms loaded:', this.rooms.length);
            this.populateRoomFilter();
            this.populateRoomSelect();
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.rooms = [];
        }
    }

    async loadBeds() {
        try {
                Utils.showLoading();

            console.log('Loading beds from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.BEDS);

            const response = await $api.get(CONFIG.ENDPOINTS.BEDS);
            console.log('Beds response received:', response);
            console.log('Response type:', typeof response);
            console.log('Is array:', Array.isArray(response));
            
            // api-client.js đã tự động extract data.data, nhưng cần kiểm tra lại
            // vì có thể response format khác
            let bedsArray = [];
            
            if (Array.isArray(response)) {
                // Nếu response đã là array (đã được api-client extract)
                bedsArray = response;
            } else if (response && typeof response === 'object') {
                // Nếu response là object, kiểm tra các format khác nhau
                if (Array.isArray(response.data)) {
                    bedsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    bedsArray = response.data;
                } else if (response.beds && Array.isArray(response.beds)) {
                    bedsArray = response.beds;
        } else {
                    console.warn('Unexpected response format:', response);
                    console.warn('Response keys:', Object.keys(response || {}));
                }
            } else {
                console.warn('Unexpected response type:', typeof response, response);
            }
            
            this.beds = bedsArray || [];
            console.log('Beds array after processing:', this.beds);
            console.log('Number of beds:', this.beds.length);
            
            if (this.beds.length === 0) {
                console.warn('No beds found in response');
            }

        this.renderBedsTable();
            
        } catch (error) {
            console.error('Error loading beds:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                endpoint: CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.BEDS
            });
            
            // Show error in table
        const tbody = document.getElementById('bedsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <p style="font-size: 0.8rem; color: #666;">Vui lòng kiểm tra console để biết thêm chi tiết</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminBeds.loadBeds()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                        </button>
                </td>
            </tr>
        `;
    }

            Utils.showAlert('Lỗi tải danh sách giường: ' + error.message, 'danger');
        } finally {
                Utils.hideLoading();
        }
    }

    populateBuildingFilter() {
        const filter = document.getElementById('buildingFilter');
        if (!filter) return;

        filter.innerHTML = '<option value="">Tất cả tòa nhà</option>';
        this.buildings.forEach(building => {
            const id = building.maToaNha || building.MaToaNha;
            const name = building.tenToaNha || building.TenToaNha || `Tòa nhà ${id}`;
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            filter.appendChild(option);
        });
    }

    populateRoomFilter(buildingId = '') {
        const filter = document.getElementById('roomFilter');
        if (!filter) return;

        filter.innerHTML = '<option value="">Tất cả phòng</option>';

        const roomsToShow = this.rooms.filter(room => {
            const roomBuildingId = room.maToaNha || room.MaToaNha;
            return !buildingId || roomBuildingId === parseInt(buildingId, 10);
        });

        roomsToShow.forEach(room => {
            const roomId = room.maPhong || room.MaPhong;
            const roomName = room.soPhong || room.SoPhong || `Phòng ${roomId}`;
            const option = document.createElement('option');
            option.value = roomId;
            option.textContent = roomName;
            filter.appendChild(option);
        });
    }

    populateRoomSelect() {
        const select = document.getElementById('maPhong');
        if (!select) return;

        select.innerHTML = '<option value="">Chọn phòng</option>';
        this.rooms.forEach(room => {
            const roomId = room.maPhong || room.MaPhong;
            const roomName = room.soPhong || room.SoPhong || `Phòng ${roomId}`;
            const building = this.buildings.find(b => (b.maToaNha || b.MaToaNha) === (room.maToaNha || room.MaToaNha));
            const buildingName = building ? (building.tenToaNha || building.TenToaNha || '') : '';

            const option = document.createElement('option');
            option.value = roomId;
            option.textContent = buildingName ? `${roomName} - ${buildingName}` : roomName;
            select.appendChild(option);
        });
    }

    renderBedsTable(beds = null) {
        const tbody = document.getElementById('bedsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayBeds = beds || this.beds;

        if (displayBeds.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayBeds.map(bed => {
            const maGiuong = bed.maGiuong || bed.MaGiuong || 'N/A';
            const maPhong = bed.maPhong || bed.MaPhong;
            const soGiuong = bed.soGiuong || bed.SoGiuong || 'N/A';
            const trangThai = bed.trangThai || bed.TrangThai || 'N/A';
            const moTa = bed.moTa || bed.MoTa || '';

            const room = this.rooms.find(r => (r.maPhong || r.MaPhong) === maPhong);
            const roomName = room ? (room.soPhong || room.SoPhong || 'N/A') : 'N/A';
            const building = room ? this.buildings.find(b => (b.maToaNha || b.MaToaNha) === (room.maToaNha || room.MaToaNha)) : null;
            const buildingName = building ? (building.tenToaNha || building.TenToaNha || 'N/A') : 'N/A';

        let statusClass = 'badge-secondary';
            if (trangThai === 'Trống') statusClass = 'badge-success';
            else if (trangThai === 'Đã có người') statusClass = 'badge-danger';
            else if (trangThai === 'Đang sửa chữa') statusClass = 'badge-warning';

        return `
            <tr>
                    <td data-label="Mã giường"><strong>${maGiuong}</strong></td>
                    <td data-label="Phòng">
                    <div class="building-name">
                        <i class="fas fa-door-open"></i>
                        ${roomName}
                    </div>
                </td>
                    <td data-label="Tòa nhà">${buildingName}</td>
                    <td data-label="Giường">
                    <span class="badge badge-info">
                            <i class="fas fa-bed"></i> ${soGiuong}
                    </span>
                </td>
                    <td data-label="Trạng thái">
                    <span class="badge ${statusClass}">
                            ${trangThai}
                    </span>
                </td>
                    <td data-label="Mô tả">${moTa || '<span class="text-muted">(Không có)</span>'}</td>
                    <td data-label="Thao tác">
                    <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="editBed(${maGiuong})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                            <button class="btn btn-sm btn-info" onclick="viewBedDetails(${maGiuong})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteBed(${maGiuong})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    }

    openModal(bed = null) {
        this.editingBed = bed;
        const modal = document.getElementById('bedModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const saveButtonText = document.getElementById('saveButtonText');

        if (bed) {
            modalTitleText.textContent = 'Chỉnh sửa giường';
            saveButtonText.textContent = 'Cập nhật';
            this.fillForm(bed);
        } else {
            modalTitleText.textContent = 'Thêm giường';
            saveButtonText.textContent = 'Thêm mới';
            this.clearForm();
        }

            modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('bedModal');
            modal.classList.remove('show');
        this.editingBed = null;
        this.clearForm();
    }

    fillForm(bed) {
        document.getElementById('bedId').value = bed.maGiuong || bed.MaGiuong || '';
        document.getElementById('maPhong').value = bed.maPhong || bed.MaPhong || '';
        document.getElementById('soGiuong').value = bed.soGiuong || bed.SoGiuong || '';
        document.getElementById('trangThai').value = bed.trangThai || bed.TrangThai || 'Trống';
        document.getElementById('moTa').value = bed.moTa || bed.MoTa || '';
    }

    clearForm() {
        document.getElementById('bedForm').reset();
        document.getElementById('bedId').value = '';
    }

    async saveBed() {
        const form = document.getElementById('bedForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const bedData = {
            maPhong: parseInt(document.getElementById('maPhong').value, 10),
            soGiuong: document.getElementById('soGiuong').value,
            trangThai: document.getElementById('trangThai').value,
            moTa: document.getElementById('moTa').value || null
        };

        try {
            Utils.showLoading();

            if (this.editingBed) {
                await $api.put(`${CONFIG.ENDPOINTS.BEDS}/${this.editingBed.maGiuong || this.editingBed.MaGiuong}`, bedData);
                Utils.showAlert('Cập nhật giường thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.BEDS, bedData);
                Utils.showAlert('Thêm giường thành công!', 'success');
            }

            this.closeModal();
            this.loadBeds();

        } catch (error) {
            console.error('Error saving bed:', error);
            Utils.showAlert('Lỗi lưu giường: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteBed(bedId) {
        if (!confirm('Bạn có chắc chắn muốn xóa giường này?')) {
            return;
        }

        try {
            Utils.showLoading();

            await $api.delete(`${CONFIG.ENDPOINTS.BEDS}/${bedId}`);

            Utils.showAlert('Xóa giường thành công!', 'success');
            this.loadBeds();

        } catch (error) {
            console.error('Error deleting bed:', error);
            Utils.showAlert('Lỗi xóa giường: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    handleBuildingFilterChange() {
        const buildingFilter = document.getElementById('buildingFilter');
        const buildingId = buildingFilter ? buildingFilter.value : '';
        this.populateRoomFilter(buildingId);
        filterBeds();
    }

    filterBeds() {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const buildingFilter = document.getElementById('buildingFilter').value;
        const roomFilter = document.getElementById('roomFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        let filtered = this.beds.filter(bed => {
            const maGiuong = (bed.maGiuong || bed.MaGiuong || '').toString();
            const soGiuong = (bed.soGiuong || bed.SoGiuong || '').toLowerCase();
            const moTa = (bed.moTa || bed.MoTa || '').toLowerCase();
            const maPhong = bed.maPhong || bed.MaPhong;
            const trangThai = bed.trangThai || bed.TrangThai || '';
            
            const room = this.rooms.find(r => (r.maPhong || r.MaPhong) === maPhong);
            const roomName = room ? (room.soPhong || room.SoPhong || '').toLowerCase() : '';
            const roomBuildingId = room ? (room.maToaNha || room.MaToaNha) : null;
            const building = roomBuildingId ? this.buildings.find(b => (b.maToaNha || b.MaToaNha) === roomBuildingId) : null;
            const buildingName = building ? (building.tenToaNha || building.TenToaNha || '').toLowerCase() : '';
            
            const matchSearch = !searchInput || 
                maGiuong.includes(searchInput) ||
                soGiuong.includes(searchInput) ||
                moTa.includes(searchInput) ||
                roomName.includes(searchInput) ||
                buildingName.includes(searchInput);
            
            const matchBuilding = !buildingFilter || roomBuildingId === parseInt(buildingFilter, 10);
            const matchRoom = !roomFilter || maPhong === parseInt(roomFilter, 10);
            const matchStatus = !statusFilter || trangThai === statusFilter;
            
            return matchSearch && matchBuilding && matchRoom && matchStatus;
        });
        
        this.renderBedsTable(filtered);
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('buildingFilter').value = '';
        document.getElementById('roomFilter').value = '';
        document.getElementById('statusFilter').value = '';
        this.populateRoomFilter('');
        this.renderBedsTable();
    }
}

// Global functions for HTML onclick events
function openBedModal() {
    window.adminBeds.openModal();
}

function closeBedModal() {
    window.adminBeds.closeModal();
}

function saveBed() {
    window.adminBeds.saveBed();
}

function editBed(bedId) {
    const bed = window.adminBeds.beds.find(b => (b.maGiuong || b.MaGiuong) === bedId);
    if (bed) {
        window.adminBeds.openModal(bed);
    }
}

function deleteBed(bedId) {
    window.adminBeds.deleteBed(bedId);
}

function viewBedDetails(bedId) {
    const bed = window.adminBeds.beds.find(b => (b.maGiuong || b.MaGiuong) === bedId);
    if (bed) {
        const maPhong = bed.maPhong || bed.MaPhong;
        const room = window.adminBeds.rooms.find(r => (r.maPhong || r.MaPhong) === maPhong);
        const roomName = room ? (room.soPhong || room.SoPhong || 'N/A') : 'N/A';
        const building = room ? window.adminBeds.buildings.find(b => (b.maToaNha || b.MaToaNha) === (room.maToaNha || room.MaToaNha)) : null;
        const buildingName = building ? (building.tenToaNha || building.TenToaNha || 'N/A') : 'N/A';
        const soGiuong = bed.soGiuong || bed.SoGiuong || 'N/A';
        const trangThai = bed.trangThai || bed.TrangThai || 'N/A';
        const moTa = bed.moTa || bed.MoTa || '(Không có mô tả)';
        
        alert(`Chi tiết giường:\n\nMã giường: ${bedId}\nGiường: ${soGiuong}\nPhòng: ${roomName}\nTòa nhà: ${buildingName}\nTrạng thái: ${trangThai}\nMô tả: ${moTa}`);
    }
}

function filterBeds() {
    window.adminBeds.filterBeds();
}

function handleBuildingFilterChange() {
    window.adminBeds.handleBuildingFilterChange();
}

function resetFilters() {
    window.adminBeds.resetFilters();
}

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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminBeds = new AdminBeds();
});
