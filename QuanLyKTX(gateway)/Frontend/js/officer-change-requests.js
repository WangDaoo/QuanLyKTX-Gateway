// Officer Change Requests Module
class OfficerChangeRequests {
    constructor() {
        this.changeRequests = [];
        this.students = [];
        this.rooms = [];
        this.currentRequest = null;
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
            if (userNameEl) userNameEl.textContent = user.hoTen || user.tenDangNhap || 'Officer';
            
            const userRole = document.querySelector('.user-role');
            if (userRole) {
                userRole.textContent = 'Nhân viên';
            }
        }
    }

    async bootstrap() {
        try {
            await Promise.all([
                this.loadRooms(),
                this.loadStudents()
            ]);
            await this.loadChangeRequests();
        } catch (error) {
            console.error('Failed to initialize OfficerChangeRequests:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
        }
    }

    async loadRooms() {
        try {
            const response = await $api.get(CONFIG.ENDPOINTS.ROOMS);
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
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.rooms = [];
        }
    }

    async loadStudents() {
        try {
            const response = await $api.get(CONFIG.ENDPOINTS.STUDENTS);
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
        } catch (error) {
            console.error('Error loading students:', error);
            this.students = [];
        }
    }

    async loadChangeRequests() {
        try {
            Utils.showLoading();
            
            const response = await $api.get(CONFIG.ENDPOINTS.CHANGE_REQUESTS);
            
            let requestsArray = [];
            if (Array.isArray(response)) {
                requestsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    requestsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    requestsArray = response.data;
                }
            }
            
            this.changeRequests = requestsArray || [];
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
                            <button class="btn btn-sm btn-primary" onclick="window.officerChangeRequests.loadChangeRequests()" style="margin-top: 10px;">
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
            const maYeuCau = req.maYeuCau || req.MaYeuCau || '';
            const maSinhVien = req.maSinhVien || req.MaSinhVien;
            const phongHienTai = req.phongHienTai || req.PhongHienTai;
            const phongMongMuon = req.phongMongMuon || req.PhongMongMuon;
            const lyDo = req.lyDo || req.LyDo || '';
            const ngayYeuCau = req.ngayYeuCau || req.NgayYeuCau;
            const trangThai = req.trangThai || req.TrangThai || '';
            
            let studentName = 'N/A';
            const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            if (student) {
                studentName = student.hoTen || student.HoTen || 'N/A';
            }
            
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
                            ${canApprove ? `
                                <button class="btn btn-sm btn-success" onclick="openDecisionModal(${maYeuCau}, 'Đã duyệt')" title="Duyệt">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="openDecisionModal(${maYeuCau}, 'Đã từ chối')" title="Từ chối">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : '<span class="text-muted">--</span>'}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
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
}

// Global functions
function openDecisionModal(requestId, defaultStatus = null) {
    window.officerChangeRequests.openDecisionModal(requestId, defaultStatus);
}

function closeDecisionModal() {
    window.officerChangeRequests.closeDecisionModal();
}

function confirmDecision() {
    window.officerChangeRequests.confirmDecision();
}

function filterRequests() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = window.officerChangeRequests.changeRequests.filter(req => {
        const maYeuCau = (req.maYeuCau || req.MaYeuCau || '').toString();
        const maSinhVien = req.maSinhVien || req.MaSinhVien;
        const trangThai = req.trangThai || req.TrangThai || '';
        const lyDo = (req.lyDo || req.LyDo || '').toLowerCase();
        
        let studentName = '';
        const student = window.officerChangeRequests.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
        if (student) {
            studentName = (student.hoTen || student.HoTen || '').toLowerCase();
        }
        
        const matchSearch = !searchInput || 
            studentName.includes(searchInput) ||
            maYeuCau.includes(searchInput) ||
            lyDo.includes(searchInput);
        
        const matchStatus = !statusFilter || trangThai === statusFilter;
        
        return matchSearch && matchStatus;
    });
    
    window.officerChangeRequests.renderChangeRequestsTable(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    window.officerChangeRequests.renderChangeRequestsTable();
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
    window.officerChangeRequests = new OfficerChangeRequests();
});

