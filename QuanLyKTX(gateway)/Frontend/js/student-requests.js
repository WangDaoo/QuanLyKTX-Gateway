// Student Requests Module
class StudentRequests {
    constructor() {
        this.requests = [];
        this.currentRequestType = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.loadRequests();
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

    async loadRequests() {
        try {
            Utils.showLoading();
            
            // Load both change requests and registrations
            const [changeRequests, registrations] = await Promise.allSettled([
                $api.get(CONFIG.ENDPOINTS.USER_CHANGE_REQUESTS_MY || `${CONFIG.ENDPOINTS.USER_CHANGE_REQUESTS}/my-requests`),
                $api.get(CONFIG.ENDPOINTS.USER_REGISTRATIONS)
            ]);
            
            const changeRequestsData = changeRequests.status === 'fulfilled' && Array.isArray(changeRequests.value) 
                ? changeRequests.value : [];
            const registrationsData = registrations.status === 'fulfilled' && Array.isArray(registrations.value) 
                ? registrations.value : [];
            
            // Combine both types of requests
            this.requests = [
                ...changeRequestsData.map(r => ({
                    maYeuCau: r.maYeuCau || r.MaYeuCau,
                    loaiYeuCau: 'Chuyển phòng',
                    noiDung: r.lyDo || r.LyDo || '',
                    ngayTao: r.ngayYeuCau || r.NgayYeuCau || r.ngayTao || r.NgayTao,
                    trangThai: r.trangThai || r.TrangThai,
                    ghiChu: r.ghiChu || r.GhiChu
                })),
                ...registrationsData.map(r => ({
                    maYeuCau: r.maDonDangKy || r.MaDonDangKy,
                    loaiYeuCau: 'Đăng ký phòng',
                    noiDung: r.lyDo || r.LyDo || 'Đăng ký phòng mới',
                    ngayTao: r.ngayTao || r.NgayTao,
                    trangThai: r.trangThai || r.TrangThai,
                    ghiChu: r.ghiChu || r.GhiChu
                }))
            ];
            
            this.renderRequests();
            
        } catch (error) {
            console.error('Error loading requests:', error);
            Utils.showAlert('Lỗi tải danh sách yêu cầu: ' + error.message, 'danger');
            this.requests = [];
            this.renderRequests();
        } finally {
            Utils.hideLoading();
        }
    }

    renderRequests() {
        const tbody = document.getElementById('requestsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        
        if (!tbody) return;
        
        if (this.requests.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = this.requests.map(request => {
            let statusClass = 'badge-secondary';
            const trangThai = request.trangThai || '';
            if (trangThai === 'Đã duyệt' || trangThai === 'Da duyet') statusClass = 'badge-success';
            else if (trangThai === 'Đang chờ' || trangThai === 'Dang cho' || trangThai === 'Chờ duyệt' || trangThai === 'Cho duyet') statusClass = 'badge-warning';
            else if (trangThai === 'Từ chối' || trangThai === 'Tu choi') statusClass = 'badge-danger';
            
            return `
                <tr>
                    <td><strong>${request.maYeuCau || request.MaYeuCau}</strong></td>
                    <td>${request.loaiYeuCau || request.LoaiYeuCau}</td>
                    <td>${request.noiDung || request.NoiDung || '-'}</td>
                    <td>${request.ngayTao ? Utils.formatDate(request.ngayTao) : (request.NgayTao ? Utils.formatDate(request.NgayTao) : '-')}</td>
                    <td>
                        <span class="badge ${statusClass}">
                            ${trangThai}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-info" onclick="viewRequestDetails(${request.maYeuCau || request.MaYeuCau})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openRequestModal(type) {
        this.currentRequestType = type;
        
        let title = 'Tạo Yêu Cầu';
        let typeName = '';
        
        switch(type) {
            case 'change-room':
                title = 'Yêu Cầu Chuyển Phòng';
                typeName = 'Chuyển phòng';
                break;
            case 'registration':
                title = 'Đăng Ký Phòng';
                typeName = 'Đăng ký phòng';
                break;
            case 'repair':
                title = 'Yêu Cầu Sửa Chữa';
                typeName = 'Sửa chữa';
                break;
            case 'other':
                title = 'Yêu Cầu Khác';
                typeName = 'Khác';
                break;
        }
        
        document.getElementById('requestModalTitle').innerHTML = `<i class="fas fa-plus"></i> ${title}`;
        document.getElementById('requestType').value = typeName;
        document.getElementById('requestForm').reset();
        document.getElementById('requestType').value = typeName;
        
        const modal = document.getElementById('requestModal');
        modal.classList.add('show');
    }

    closeRequestModal() {
        const modal = document.getElementById('requestModal');
        modal.classList.remove('show');
        this.currentRequestType = null;
        document.getElementById('requestForm').reset();
    }

    async submitRequest() {
        const form = document.getElementById('requestForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const user = Utils.getUser();
        if (!user || !(user.maSinhVien || user.MaSinhVien)) {
            Utils.showAlert('Không tìm thấy thông tin sinh viên', 'danger');
            return;
        }

        const requestData = {
            maSinhVien: user.maSinhVien || user.MaSinhVien,
            loaiYeuCau: document.getElementById('requestType').value,
            noiDung: document.getElementById('requestContent').value,
            ghiChu: document.getElementById('requestNote').value || null
        };

        try {
            Utils.showLoading();
            
            if (this.currentRequestType === 'change-room') {
                let currentRoomId = null;
                try {
                    const currentRoom = await $api.get(CONFIG.ENDPOINTS.USER_ROOMS_CURRENT || (CONFIG.ENDPOINTS.USER_ROOMS + '/current'));
                    currentRoomId = currentRoom?.maPhong || currentRoom?.MaPhong || currentRoom?.maPhongHienTai;
                } catch (roomError) {
                    console.warn('Không thể lấy thông tin phòng hiện tại:', roomError);
                }

                if (!currentRoomId) {
                    Utils.showAlert('Không xác định được phòng hiện tại, vui lòng thử lại sau.', 'danger');
                    return;
                }

                await $api.post(CONFIG.ENDPOINTS.USER_CHANGE_REQUESTS || CONFIG.ENDPOINTS.CHANGE_REQUESTS, {
                    phongHienTai: currentRoomId,
                    phongMongMuon: null,
                    lyDo: requestData.noiDung,
                    ghiChu: requestData.ghiChu
                });
            } else if (this.currentRequestType === 'registration') {
                // Load available rooms for selection
                let availableRooms = [];
                try {
                    availableRooms = await $api.get(CONFIG.ENDPOINTS.USER_ROOMS_AVAILABLE);
                    if (!Array.isArray(availableRooms)) {
                        availableRooms = [];
                    }
                } catch (error) {
                    console.warn('Could not load available rooms:', error);
                }
                
                // If rooms available, let user select, otherwise submit with null
                let selectedRoomId = null;
                if (availableRooms.length > 0) {
                    // Show room selection dialog
                    const roomOptions = availableRooms.map(room => 
                        `${room.soPhong || room.SoPhong} - ${room.tenToaNha || room.TenToaNha || ''}`
                    ).join('\n');
                    const selectedIndex = prompt(`Chọn phòng muốn đăng ký:\n${availableRooms.map((r, i) => `${i + 1}. ${r.soPhong || r.SoPhong} - ${r.tenToaNha || r.TenToaNha || ''}`).join('\n')}\n\nNhập số thứ tự (1-${availableRooms.length}):`);
                    if (selectedIndex && !isNaN(selectedIndex) && selectedIndex >= 1 && selectedIndex <= availableRooms.length) {
                        selectedRoomId = availableRooms[selectedIndex - 1].maPhong || availableRooms[selectedIndex - 1].MaPhong;
                    }
                }
                
                // Tạo đơn đăng ký phòng
                await $api.post(CONFIG.ENDPOINTS.USER_REGISTRATIONS_CREATE, {
                    MaPhongDeXuat: selectedRoomId,
                    LyDo: requestData.noiDung,
                    GhiChu: requestData.ghiChu
                });
            } else {
                // For other requests, might need a different endpoint
                Utils.showAlert('Chức năng này đang được phát triển', 'info');
                this.closeRequestModal();
                return;
            }
            
            Utils.showAlert('Gửi yêu cầu thành công!', 'success');
            this.closeRequestModal();
            await this.loadRequests();

        } catch (error) {
            console.error('Error submitting request:', error);
            Utils.showAlert('Lỗi gửi yêu cầu: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    viewRequestDetails(requestId) {
        const request = this.requests.find(r => (r.maYeuCau || r.MaYeuCau) === requestId);
        if (!request) {
            Utils.showAlert('Không tìm thấy yêu cầu', 'danger');
            return;
        }
        
        let details = `Mã yêu cầu: ${request.maYeuCau || request.MaYeuCau}\n`;
        details += `Loại: ${request.loaiYeuCau || request.LoaiYeuCau}\n`;
        details += `Nội dung: ${request.noiDung || request.NoiDung}\n`;
        details += `Trạng thái: ${request.trangThai || request.TrangThai}\n`;
        details += `Ngày tạo: ${request.ngayTao ? Utils.formatDate(request.ngayTao) : (request.NgayTao ? Utils.formatDate(request.NgayTao) : '-')}\n`;
        if (request.ghiChu || request.GhiChu) {
            details += `Ghi chú: ${request.ghiChu || request.GhiChu}`;
        }
        
        alert(details);
    }
}

// Global functions
function openRequestModal(type) {
    window.studentRequests.openRequestModal(type);
}

function closeRequestModal() {
    window.studentRequests.closeRequestModal();
}

function submitRequest() {
    window.studentRequests.submitRequest();
}

function viewRequestDetails(requestId) {
    window.studentRequests.viewRequestDetails(requestId);
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
    window.studentRequests = new StudentRequests();
});

