// Admin Change Requests Module
class AdminChangeRequests {
    constructor() {
        this.changeRequests = [];
        this.students = [];
        this.rooms = [];
        this.buildings = [];
        this.currentRequest = null;
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
                this.loadRooms(),
                this.loadStudents()
            ]);
            await this.loadChangeRequests();
        } catch (error) {
            console.error('Failed to initialize AdminChangeRequests:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
        }
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

    async loadBuildings() {
        try {
            const response = await $api.get(CONFIG.ENDPOINTS.BUILDINGS);
            console.log('Buildings response:', response);
            
            let buildingsArray = [];
            if (Array.isArray(response)) {
                buildingsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    buildingsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    buildingsArray = response.data;
                }
            }
            
            this.buildings = buildingsArray || [];
            console.log('Buildings loaded:', this.buildings.length);
            this.populateBuildingFilter();
        } catch (error) {
            console.error('Error loading buildings:', error);
            this.buildings = [];
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
            this.populateRoomFilter();
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.rooms = [];
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

    populateBuildingFilter() {
        const filter = document.getElementById('buildingFilter');
        if (!filter) return;

        filter.innerHTML = '<option value="">Tất cả tòa nhà</option>';
        this.buildings.forEach(building => {
            const option = document.createElement('option');
            option.value = building.maToaNha || building.MaToaNha || '';
            option.textContent = building.tenToaNha || building.TenToaNha || '';
            filter.appendChild(option);
        });
    }

    populateRoomFilter() {
        const filter = document.getElementById('roomFilter');
        if (!filter) return;

        const buildingFilter = document.getElementById('buildingFilter');
        const selectedBuilding = buildingFilter ? buildingFilter.value : '';

        filter.innerHTML = '<option value="">Tất cả phòng</option>';
        
        let filteredRooms = this.rooms;
        if (selectedBuilding) {
            filteredRooms = this.rooms.filter(room => {
                const roomBuildingId = room.maToaNha || room.MaToaNha;
                return roomBuildingId && roomBuildingId.toString() === selectedBuilding.toString();
            });
        }

        filteredRooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.maPhong || room.MaPhong || '';
            const roomNumber = room.soPhong || room.SoPhong || '';
            const buildingName = room.tenToaNha || room.TenToaNha || '';
            option.textContent = buildingName ? `${roomNumber} - ${buildingName}` : roomNumber;
            filter.appendChild(option);
        });
    }

    async loadChangeRequests() {
        try {
            Utils.showLoading();
            
            console.log('Loading change requests from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.CHANGE_REQUESTS);
            const response = await $api.get(CONFIG.ENDPOINTS.CHANGE_REQUESTS);
            console.log('Change requests response received:', response);
            
            // Handle different response formats
            let requestsArray = [];
            if (Array.isArray(response)) {
                requestsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    requestsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    requestsArray = response.data;
                } else {
                    console.warn('Unexpected change requests data format:', response);
                }
            }
            
            this.changeRequests = requestsArray || [];
            console.log('Change requests loaded:', this.changeRequests.length);
            this.renderChangeRequestsTable();
            
        } catch (error) {
            console.error('Error loading change requests:', error);
            const tbody = document.getElementById('requestsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminChangeRequests.loadChangeRequests()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách yêu cầu chuyển phòng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderChangeRequestsTable(requests = null) {
        const tbody = document.getElementById('requestsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayRequests = requests || this.changeRequests;
        
        if (displayRequests.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayRequests.map(req => {
            // Handle both camelCase and PascalCase
            const maYeuCau = req.maYeuCau || req.MaYeuCau || '';
            const maSinhVien = req.maSinhVien || req.MaSinhVien;
            const phongHienTai = req.phongHienTai || req.PhongHienTai;
            const phongMongMuon = req.phongMongMuon || req.PhongMongMuon;
            const lyDo = req.lyDo || req.LyDo || '';
            const ngayYeuCau = req.ngayYeuCau || req.NgayYeuCau;
            const trangThai = req.trangThai || req.TrangThai || '';
            
            // Get student info
            let studentName = 'N/A';
            const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            if (student) {
                studentName = student.hoTen || student.HoTen || 'N/A';
            }
            
            // Get room info
            let currentRoomInfo = 'N/A';
            if (phongHienTai) {
                const currentRoom = this.rooms.find(r => (r.maPhong || r.MaPhong) === phongHienTai);
                if (currentRoom) {
                    const roomNumber = currentRoom.soPhong || currentRoom.SoPhong || '';
                    const buildingName = currentRoom.tenToaNha || currentRoom.TenToaNha || '';
                    currentRoomInfo = buildingName ? `${roomNumber} - ${buildingName}` : roomNumber;
                }
            }
            
            let desiredRoomInfo = 'Không chỉ định';
            if (phongMongMuon) {
                const desiredRoom = this.rooms.find(r => (r.maPhong || r.MaPhong) === phongMongMuon);
                if (desiredRoom) {
                    const roomNumber = desiredRoom.soPhong || desiredRoom.SoPhong || '';
                    const buildingName = desiredRoom.tenToaNha || desiredRoom.TenToaNha || '';
                    desiredRoomInfo = buildingName ? `${roomNumber} - ${buildingName}` : roomNumber;
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
                    <td data-label="Mã"><strong>${maYeuCau}</strong></td>
                    <td data-label="Sinh viên">${studentName}</td>
                    <td data-label="Phòng hiện tại">${currentRoomInfo}</td>
                    <td data-label="Phòng mong muốn">${desiredRoomInfo}</td>
                    <td data-label="Lý do">${lyDoDisplay}</td>
                    <td data-label="Ngày yêu cầu">${Utils.formatDate(ngayYeuCau)}</td>
                    <td data-label="Trạng thái">
                        <span class="badge ${statusClass}">
                            ${trangThai}
                        </span>
                    </td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-info" onclick="viewRequestDetails(${maYeuCau})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i> <span class="btn-text">Xem</span>
                            </button>
                            ${canApprove ? `
                                <button class="btn btn-sm btn-success" onclick="openDecisionModal(${maYeuCau}, 'Đã duyệt')" title="Duyệt">
                                    <i class="fas fa-check"></i> <span class="btn-text">Duyệt</span>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="openDecisionModal(${maYeuCau}, 'Đã từ chối')" title="Từ chối">
                                    <i class="fas fa-times"></i> <span class="btn-text">Từ chối</span>
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-danger" onclick="deleteRequest(${maYeuCau})" title="Xóa">
                                <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async viewDetails(requestId) {
        try {
            Utils.showLoading();
            
            const response = await $api.get(CONFIG.ENDPOINTS.CHANGE_REQUEST_BY_ID(requestId));
            console.log('Change request details response:', response);
            
            // Handle different response formats
            let data = null;
            if (response && typeof response === 'object') {
                if (response.maYeuCau || response.MaYeuCau) {
                    data = response;
                } else if (response.data) {
                    data = response.data;
                } else if (response.success && response.data) {
                    data = response.data;
                }
            }
            
            if (!data) {
                throw new Error('Không tìm thấy thông tin yêu cầu');
            }
            
            this.currentRequest = data;
            
            // Handle both camelCase and PascalCase
            const maYeuCau = data.maYeuCau || data.MaYeuCau || '';
            const maSinhVien = data.maSinhVien || data.MaSinhVien;
            const phongHienTai = data.phongHienTai || data.PhongHienTai;
            const phongMongMuon = data.phongMongMuon || data.PhongMongMuon;
            const lyDo = data.lyDo || data.LyDo || '';
            const ngayYeuCau = data.ngayYeuCau || data.NgayYeuCau;
            const trangThai = data.trangThai || data.TrangThai || '';
            const ghiChu = data.ghiChu || data.GhiChu || '';
            
            // Get student info
            let studentInfo = 'N/A';
            const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            if (student) {
                const hoTen = student.hoTen || student.HoTen;
                const mssv = student.mssv || student.MSSV || '';
                studentInfo = mssv ? `${hoTen} - ${mssv}` : hoTen;
            }
            
            // Get room info
            let currentRoomInfo = 'N/A';
            if (phongHienTai) {
                const currentRoom = this.rooms.find(r => (r.maPhong || r.MaPhong) === phongHienTai);
                if (currentRoom) {
                    const roomNumber = currentRoom.soPhong || currentRoom.SoPhong || '';
                    const buildingName = currentRoom.tenToaNha || currentRoom.TenToaNha || '';
                    currentRoomInfo = buildingName ? `${roomNumber} - ${buildingName}` : roomNumber;
                }
            }
            
            let desiredRoomInfo = 'Không chỉ định';
            if (phongMongMuon) {
                const desiredRoom = this.rooms.find(r => (r.maPhong || r.MaPhong) === phongMongMuon);
                if (desiredRoom) {
                    const roomNumber = desiredRoom.soPhong || desiredRoom.SoPhong || '';
                    const buildingName = desiredRoom.tenToaNha || desiredRoom.TenToaNha || '';
                    desiredRoomInfo = buildingName ? `${roomNumber} - ${buildingName}` : roomNumber;
                }
            }
            
            let statusClass = 'badge-secondary';
            if (trangThai === 'Đã duyệt' || trangThai === 'Da duyet') statusClass = 'badge-success';
            else if (trangThai === 'Chờ duyệt' || trangThai === 'Cho duyet') statusClass = 'badge-warning';
            else if (trangThai === 'Đã từ chối' || trangThai === 'Da tu choi') statusClass = 'badge-danger';
            
            const details = `
                <div class="form-group">
                    <label><strong>Mã yêu cầu:</strong></label>
                    <p>${maYeuCau}</p>
                </div>
                <div class="form-group">
                    <label><strong>Sinh viên:</strong></label>
                    <p>${studentInfo}</p>
                </div>
                <div class="form-group">
                    <label><strong>Phòng hiện tại:</strong></label>
                    <p>${currentRoomInfo}</p>
                </div>
                <div class="form-group">
                    <label><strong>Phòng mong muốn:</strong></label>
                    <p>${desiredRoomInfo}</p>
                </div>
                <div class="form-group">
                    <label><strong>Ngày yêu cầu:</strong></label>
                    <p>${Utils.formatDate(ngayYeuCau)}</p>
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
            
            // Show details in alert or modal (you can create a detail modal if needed)
            alert(`Chi tiết yêu cầu chuyển phòng:\n\n` +
                `Mã: ${maYeuCau}\n` +
                `Sinh viên: ${studentInfo}\n` +
                `Phòng hiện tại: ${currentRoomInfo}\n` +
                `Phòng mong muốn: ${desiredRoomInfo}\n` +
                `Ngày yêu cầu: ${Utils.formatDate(ngayYeuCau)}\n` +
                `Trạng thái: ${trangThai}\n` +
                `Lý do: ${lyDo || 'N/A'}\n` +
                `Ghi chú: ${ghiChu || 'Không có'}`);
            
        } catch (error) {
            console.error('Error loading change request details:', error);
            Utils.showAlert('Lỗi tải chi tiết yêu cầu: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    openDecisionModal(requestId, defaultStatus = null) {
        this.currentRequest = this.changeRequests.find(r => (r.maYeuCau || r.MaYeuCau) === requestId);
        if (!this.currentRequest) {
            Utils.showAlert('Không tìm thấy yêu cầu!', 'warning');
            return;
        }
        
        const modal = document.getElementById('decisionModal');
        const requestIdInput = document.getElementById('requestId');
        const statusSelect = document.getElementById('decisionStatus');
        const noteTextarea = document.getElementById('decisionNote');
        
        if (requestIdInput) requestIdInput.value = requestId;
        if (statusSelect && defaultStatus) statusSelect.value = defaultStatus;
        if (noteTextarea) noteTextarea.value = '';
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeDecisionModal() {
        const modal = document.getElementById('decisionModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentRequest = null;
        const form = document.getElementById('decisionForm');
        if (form) form.reset();
    }

    async confirmDecision() {
        const form = document.getElementById('decisionForm');
        if (!form || !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const requestId = document.getElementById('requestId').value;
        const status = document.getElementById('decisionStatus').value;
        const note = document.getElementById('decisionNote').value;

        if (!requestId) {
            Utils.showAlert('Không tìm thấy mã yêu cầu!', 'warning');
            return;
        }

        try {
            Utils.showLoading();
            
            const request = this.changeRequests.find(r => (r.maYeuCau || r.MaYeuCau).toString() === requestId.toString());
            if (!request) {
                throw new Error('Không tìm thấy yêu cầu');
            }
            
            // Backend expects PascalCase field names
            const updateData = {
                MaSinhVien: request.maSinhVien || request.MaSinhVien,
                PhongHienTai: request.phongHienTai || request.PhongHienTai,
                PhongMongMuon: request.phongMongMuon || request.PhongMongMuon || null,
                LyDo: request.lyDo || request.LyDo || '',
                NgayYeuCau: request.ngayYeuCau || request.NgayYeuCau,
                TrangThai: status,
                GhiChu: note || null
            };
            
            await $api.put(CONFIG.ENDPOINTS.CHANGE_REQUEST_BY_ID(requestId), updateData);

            Utils.showAlert('Cập nhật yêu cầu thành công!', 'success');
            this.closeDecisionModal();
            await this.loadChangeRequests();

        } catch (error) {
            console.error('Error updating change request:', error);
            Utils.showAlert('Lỗi cập nhật yêu cầu: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteRequest(requestId) {
        if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.CHANGE_REQUEST_BY_ID(requestId));

            Utils.showAlert('Xóa yêu cầu thành công!', 'success');
            await this.loadChangeRequests();

        } catch (error) {
            console.error('Error deleting change request:', error);
            Utils.showAlert('Lỗi xóa yêu cầu: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function viewRequestDetails(requestId) {
    window.adminChangeRequests.viewDetails(requestId);
}

function openDecisionModal(requestId, defaultStatus = null) {
    window.adminChangeRequests.openDecisionModal(requestId, defaultStatus);
}

function closeDecisionModal() {
    window.adminChangeRequests.closeDecisionModal();
}

function confirmDecision() {
    window.adminChangeRequests.confirmDecision();
}

function deleteRequest(requestId) {
    window.adminChangeRequests.deleteRequest(requestId);
}

function filterRequests() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const buildingFilter = document.getElementById('buildingFilter')?.value || '';
    const roomFilter = document.getElementById('roomFilter')?.value || '';
    
    let filtered = window.adminChangeRequests.changeRequests.filter(req => {
        // Handle both camelCase and PascalCase
        const maYeuCau = (req.maYeuCau || req.MaYeuCau || '').toString();
        const maSinhVien = req.maSinhVien || req.MaSinhVien;
        const phongHienTai = req.phongHienTai || req.PhongHienTai;
        const phongMongMuon = req.phongMongMuon || req.PhongMongMuon;
        const trangThai = req.trangThai || req.TrangThai || '';
        const lyDo = (req.lyDo || req.LyDo || '').toLowerCase();
        
        // Get student info
        let studentName = '';
        const student = window.adminChangeRequests.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
        if (student) {
            studentName = (student.hoTen || student.HoTen || '').toLowerCase();
        }
        
        // Search filter
        const matchSearch = !searchInput || 
            studentName.includes(searchInput) ||
            maYeuCau.includes(searchInput) ||
            lyDo.includes(searchInput);
        
        // Status filter
        const matchStatus = !statusFilter || trangThai === statusFilter;
        
        // Building filter
        let matchBuilding = true;
        if (buildingFilter) {
            const currentRoom = window.adminChangeRequests.rooms.find(r => (r.maPhong || r.MaPhong) === phongHienTai);
            const desiredRoom = phongMongMuon ? window.adminChangeRequests.rooms.find(r => (r.maPhong || r.MaPhong) === phongMongMuon) : null;
            
            const currentRoomBuildingId = currentRoom ? (currentRoom.maToaNha || currentRoom.MaToaNha) : null;
            const desiredRoomBuildingId = desiredRoom ? (desiredRoom.maToaNha || desiredRoom.MaToaNha) : null;
            
            matchBuilding = (currentRoomBuildingId && currentRoomBuildingId.toString() === buildingFilter.toString()) ||
                           (desiredRoomBuildingId && desiredRoomBuildingId.toString() === buildingFilter.toString());
        }
        
        // Room filter
        const matchRoom = !roomFilter || 
            (phongHienTai && phongHienTai.toString() === roomFilter.toString()) ||
            (phongMongMuon && phongMongMuon.toString() === roomFilter.toString());
        
        return matchSearch && matchStatus && matchBuilding && matchRoom;
    });
    
    window.adminChangeRequests.renderChangeRequestsTable(filtered);
}

function handleBuildingChange() {
    window.adminChangeRequests.populateRoomFilter();
    filterRequests();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('buildingFilter').value = '';
    document.getElementById('roomFilter').value = '';
    window.adminChangeRequests.populateRoomFilter();
    window.adminChangeRequests.renderChangeRequestsTable();
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        Utils.removeToken();
        Utils.removeUser();
        window.location.href = '../index.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.adminChangeRequests = new AdminChangeRequests();
});


