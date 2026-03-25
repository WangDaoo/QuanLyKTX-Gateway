// Officer Dashboard Module
class OfficerDashboard {
    constructor() {
        this.students = [];
        this.rooms = [];
        this.registrations = [];
        this.changeRequests = [];
        this.meterReadings = [];
        this.violations = [];
        this.overdueNotices = [];
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.loadDashboardData();
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (!user) return;

        const userName = user.hoTen || user.HoTen || user.tenDangNhap || 'Officer';
        const userNameEl = document.getElementById('userName');
        const welcomeNameEl = document.getElementById('officerWelcomeName');
        const roleEl = document.querySelector('.user-role');

        if (userNameEl) userNameEl.textContent = userName;
        if (welcomeNameEl) welcomeNameEl.textContent = userName;
        if (roleEl) roleEl.textContent = 'Nhân viên';
    }

    async loadDashboardData() {
        try {
            Utils.showLoading();
            const results = await Promise.allSettled([
                $api.get(CONFIG.ENDPOINTS.STUDENTS),
                $api.get(CONFIG.ENDPOINTS.ROOMS),
                $api.get(CONFIG.ENDPOINTS.REGISTRATIONS),
                $api.get(CONFIG.ENDPOINTS.CHANGE_REQUESTS),
                $api.get(CONFIG.ENDPOINTS.METER_READINGS),
                $api.get(CONFIG.ENDPOINTS.VIOLATIONS),
                $api.get(CONFIG.ENDPOINTS.OVERDUE_NOTICES)
            ]);

            const [
                studentsRes,
                roomsRes,
                registrationsRes,
                changeRequestsRes,
                meterReadingsRes,
                violationsRes,
                overdueRes
            ] = results;

            this.students = Array.isArray(studentsRes.value) ? studentsRes.value : [];
            this.rooms = Array.isArray(roomsRes.value) ? roomsRes.value : [];
            this.registrations = Array.isArray(registrationsRes.value) ? registrationsRes.value : [];
            this.changeRequests = Array.isArray(changeRequestsRes.value) ? changeRequestsRes.value : [];
            this.meterReadings = Array.isArray(meterReadingsRes.value) ? meterReadingsRes.value : [];
            this.violations = Array.isArray(violationsRes.value) ? violationsRes.value : [];
            this.overdueNotices = Array.isArray(overdueRes.value) ? overdueRes.value : [];

            this.updateStats();
            this.renderRegistrations();
            this.renderChangeRequests();
            this.renderTasks();
            this.renderNotifications();
        } catch (error) {
            console.error('Error loading officer dashboard:', error);
            Utils.showAlert('Lỗi tải dữ liệu Officer Dashboard: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    updateStats() {
        const pendingStatuses = ['chờ duyệt', 'cho duyet', 'đang xử lý', 'dang xu ly'];
        const pendingRegistrations = this.registrations.filter(reg =>
            pendingStatuses.includes((reg.trangThai || '').toLowerCase())
        ).length;

        const pendingChanges = this.changeRequests.filter(req =>
            pendingStatuses.includes((req.trangThai || '').toLowerCase())
        ).length;

        const meterPending = this.meterReadings.filter(item => {
            const status = (item.trangThai || '').toLowerCase();
            return status.includes('chưa') || status.includes('cho');
        }).length;

        const now = new Date();
        const thisMonthViolations = this.violations.filter(item => {
            if (!item.ngayViPham) return false;
            const date = new Date(item.ngayViPham);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;

        this.setText('pendingRegistrations', pendingRegistrations);
        this.setText('pendingChangeRequests', pendingChanges);
        this.setText('pendingMeterReadings', meterPending);
        this.setText('newViolations', thisMonthViolations);
    }

    renderRegistrations() {
        const tbody = document.getElementById('registrationsTableBody');
        if (!tbody) return;

        if (!this.registrations.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Không có đơn đăng ký nào</td></tr>';
            return;
        }

        const items = [...this.registrations]
            .sort((a, b) => new Date(b.ngayDangKy) - new Date(a.ngayDangKy))
            .slice(0, 5);

        tbody.innerHTML = items.map(reg => {
            const student = this.students.find(s => s.maSinhVien === reg.maSinhVien);
            const studentName = student ? student.hoTen : 'N/A';
            const room = reg.maPhongDeXuat ? this.rooms.find(r => r.maPhong === reg.maPhongDeXuat) : null;
            const roomInfo = room ? `${room.soPhong} - ${(room.tenToaNha || room.TenToaNha || '')}`.trim() : 'Không đề xuất';
            const statusBadge = this.getStatusBadge(reg.trangThai);

            const actionButtons = this.isPending(reg.trangThai)
                ? `
                    <button class="btn btn-sm btn-success" onclick="updateRegistrationStatus(${reg.maDon}, 'Đã duyệt')" title="Duyệt">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="updateRegistrationStatus(${reg.maDon}, 'Đã từ chối')" title="Từ chối">
                        <i class="fas fa-times"></i>
                    </button>
                `
                : '<span class="text-muted">--</span>';

            return `
                <tr>
                    <td><strong>${reg.maDon}</strong></td>
                    <td>${studentName}</td>
                    <td>${roomInfo}</td>
                    <td>${Utils.formatDate(reg.ngayDangKy)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-buttons">${actionButtons}</div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderChangeRequests() {
        const tbody = document.getElementById('changeRequestsTableBody');
        if (!tbody) return;

        if (!this.changeRequests.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Không có yêu cầu chuyển phòng</td></tr>';
            return;
        }

        const items = [...this.changeRequests]
            .sort((a, b) => new Date(b.ngayYeuCau) - new Date(a.ngayYeuCau))
            .slice(0, 5);

        tbody.innerHTML = items.map(req => {
            const student = this.students.find(s => s.maSinhVien === req.maSinhVien);
            const studentName = student ? student.hoTen : 'N/A';
            const currentRoom = this.rooms.find(r => r.maPhong === req.phongHienTai);
            const desiredRoom = req.phongMongMuon ? this.rooms.find(r => r.maPhong === req.phongMongMuon) : null;
            const statusBadge = this.getStatusBadge(req.trangThai);

            const actionButtons = this.isPending(req.trangThai)
                ? `
                    <button class="btn btn-sm btn-success" onclick="updateChangeRequestStatus(${req.maYeuCau}, 'Đã duyệt')" title="Duyệt">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="updateChangeRequestStatus(${req.maYeuCau}, 'Đã từ chối')" title="Từ chối">
                        <i class="fas fa-times"></i>
                    </button>
                `
                : '<span class="text-muted">--</span>';

            return `
                <tr>
                    <td><strong>${req.maYeuCau}</strong></td>
                    <td>${studentName}</td>
                    <td>${currentRoom ? currentRoom.soPhong : req.phongHienTai}</td>
                    <td>${desiredRoom ? desiredRoom.soPhong : (req.phongMongMuon || 'N/A')}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-buttons">${actionButtons}</div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderTasks() {
        const timeline = document.getElementById('tasksTimeline');
        if (!timeline) return;

        const tasks = [];

        const meterTasks = this.meterReadings
            .filter(item => {
                const status = (item.trangThai || '').toLowerCase();
                return status.includes('chưa') || status.includes('chờ');
            })
            .slice(0, 3)
            .map(item => ({
                type: 'info',
                title: `Ghi chỉ số phòng ${this.getRoomName(item.maPhong)}`,
                time: `Tháng ${item.thang}/${item.nam}`,
                description: 'Chỉ số điện nước chưa ghi'
            }));

        const pendingRegs = this.registrations
            .filter(reg => this.isPending(reg.trangThai))
            .slice(0, 2)
            .map(reg => ({
                type: 'warning',
                title: `Đơn đăng ký #${reg.maDon}`,
                time: Utils.formatDate(reg.ngayDangKy),
                description: 'Chờ duyệt phòng'
            }));

        const pendingChanges = this.changeRequests
            .filter(req => this.isPending(req.trangThai))
            .slice(0, 2)
            .map(req => ({
                type: 'success',
                title: `Chuyển phòng #${req.maYeuCau}`,
                time: Utils.formatDate(req.ngayYeuCau),
                description: 'Yêu cầu chuyển phòng chờ xử lý'
            }));

        tasks.push(...meterTasks, ...pendingRegs, ...pendingChanges);

        if (!tasks.length) {
            timeline.innerHTML = `
                <li class="timeline-item">
                    <div class="timeline-badge success"></div>
                    <div class="timeline-content">
                        <h4>Không có công việc nào</h4>
                        <p>Hiện tại không có công việc tồn đọng.</p>
                    </div>
                </li>
            `;
            return;
        }

        timeline.innerHTML = tasks.map(task => `
            <li class="timeline-item">
                <div class="timeline-badge ${task.type}"></div>
                <div class="timeline-content">
                    <h4>${task.title}</h4>
                    <p class="text-muted">${task.time}</p>
                    <p>${task.description}</p>
                </div>
            </li>
        `).join('');
    }

    renderNotifications() {
        const feed = document.getElementById('notificationsFeed');
        if (!feed) return;

        if (!this.overdueNotices.length) {
            feed.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon" style="background: #ecf0f1; color: #95a5a6;">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">Chưa có thông báo mới</div>
                        <div class="activity-time">--/--/----</div>
                    </div>
                </div>
            `;
            return;
        }

        const items = [...this.overdueNotices]
            .sort((a, b) => new Date(b.ngayThongBao) - new Date(a.ngayThongBao))
            .slice(0, 5);

        feed.innerHTML = items.map(item => {
            const student = this.students.find(s => s.maSinhVien === item.maSinhVien);
            const studentName = student ? student.hoTen : `Mã SV: ${item.maSinhVien}`;
            return `
                <div class="activity-item">
                    <div class="activity-icon" style="background: #fdecea; color: #e74c3c;">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">${item.noiDung || 'Thông báo'}</div>
                        <div class="activity-time">${Utils.formatDate(item.ngayThongBao)} • ${studentName}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async updateRegistrationStatus(registrationId, status) {
        const registration = this.registrations.find(reg => reg.maDon === registrationId || reg.MaDon === registrationId);
        if (!registration) {
            Utils.showAlert('Không tìm thấy đơn đăng ký', 'danger');
            return;
        }

        const payload = {
            maSinhVien: registration.maSinhVien ?? registration.MaSinhVien ?? 0,
            maPhongDeXuat: registration.maPhongDeXuat ?? registration.MaPhongDeXuat ?? null,
            trangThai: status,
            lyDo: registration.lyDo ?? registration.LyDo ?? null,
            ngayDangKy: registration.ngayDangKy ?? registration.NgayDangKy ?? new Date().toISOString(),
            ghiChu: registration.ghiChu ?? registration.GhiChu ?? `Cập nhật bởi Officer vào ${Utils.formatDate(new Date())}`,
            nguoiCapNhat: (Utils.getUser()?.hoTen) || 'Officer'
        };

        try {
            Utils.showLoading();
            await $api.put(`${CONFIG.ENDPOINTS.REGISTRATIONS}/${registrationId}`, payload);
            Utils.showAlert('Cập nhật đơn đăng ký thành công!', 'success');
            await this.loadDashboardData();
        } catch (error) {
            console.error('Error updating registration status:', error);
            Utils.showAlert('Lỗi cập nhật đơn đăng ký: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async updateChangeRequestStatus(requestId, status) {
        const request = this.changeRequests.find(r => r.maYeuCau === requestId || r.MaYeuCau === requestId);
        if (!request) return;

        const payload = {
            maSinhVien: request.maSinhVien ?? request.MaSinhVien ?? 0,
            phongHienTai: request.phongHienTai ?? request.PhongHienTai ?? 0,
            phongMongMuon: request.phongMongMuon ?? request.PhongMongMuon ?? null,
            lyDo: request.lyDo ?? request.LyDo ?? '',
            ngayYeuCau: request.ngayYeuCau ?? request.NgayYeuCau ?? new Date().toISOString(),
            trangThai: status,
            ghiChu: request.ghiChu ?? request.GhiChu ?? `Cập nhật bởi Officer vào ${Utils.formatDate(new Date())}`,
            nguoiCapNhat: (Utils.getUser()?.hoTen) || 'Officer'
        };

        try {
            Utils.showLoading();
            await $api.put(`${CONFIG.ENDPOINTS.CHANGE_REQUESTS}/${requestId}`, payload);
            Utils.showAlert('Cập nhật yêu cầu chuyển phòng thành công!', 'success');
            await this.loadDashboardData();
        } catch (error) {
            console.error('Error updating change request status:', error);
            Utils.showAlert('Lỗi cập nhật yêu cầu chuyển phòng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    // Helpers
    isPending(status = '') {
        const normalized = status.toLowerCase();
        return normalized.includes('chờ') || normalized.includes('cho') || normalized.includes('pending');
    }

    getStatusBadge(status = '') {
        const normalized = status.toLowerCase();
        let badgeClass = 'badge-secondary';
        if (normalized.includes('duyệt') || normalized.includes('approved')) badgeClass = 'badge-success';
        else if (normalized.includes('chờ') || normalized.includes('cho')) badgeClass = 'badge-warning';
        else if (normalized.includes('từ chối') || normalized.includes('tu choi') || normalized.includes('rejected')) badgeClass = 'badge-danger';
        return `<span class="badge ${badgeClass}">${status}</span>`;
    }

    getRoomName(roomId) {
        const room = this.rooms.find(r => r.maPhong === roomId);
        return room ? room.soPhong : roomId;
    }

    setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

// Global functions
function updateRegistrationStatus(registrationId, status) {
    window.officerDashboard.updateRegistrationStatus(registrationId, status);
}

function updateChangeRequestStatus(requestId, status) {
    window.officerDashboard.updateChangeRequestStatus(requestId, status);
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
    window.officerDashboard = new OfficerDashboard();
});

