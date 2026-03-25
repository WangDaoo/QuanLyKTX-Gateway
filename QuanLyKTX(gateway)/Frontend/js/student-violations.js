// Student Violations Module
class StudentViolations {
    constructor() {
        this.violations = [];
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.loadViolations();
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

    async loadViolations() {
        try {
            Utils.showLoading();
            
            const data = await $api.get(CONFIG.ENDPOINTS.USER_VIOLATIONS);
            this.violations = Array.isArray(data) ? data : [];
            
            this.renderViolationsTable();
            
        } catch (error) {
            console.error('Error loading violations:', error);
            Utils.showAlert('Lỗi tải danh sách kỷ luật: ' + error.message, 'danger');
            this.violations = [];
            this.renderViolationsTable();
        } finally {
            Utils.hideLoading();
        }
    }

    renderViolationsTable(violations = null) {
        const tbody = document.getElementById('violationsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayViolations = violations || this.violations;
        
        if (!tbody) return;
        
        if (displayViolations.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayViolations.map(violation => {
            const maKyLuat = violation.maKyLuat || violation.MaKyLuat || '';
            const loaiViPham = violation.loaiViPham || violation.LoaiViPham || '';
            const moTa = violation.moTa || violation.MoTa || '';
            const ngayViPham = violation.ngayViPham || violation.NgayViPham;
            const hinhThucPhat = violation.hinhThucPhat || violation.HinhThucPhat || '';
            const trangThai = violation.trangThai || violation.TrangThai || '';
            const soPhong = violation.soPhong || violation.SoPhong || '';
            const tenToaNha = violation.tenToaNha || violation.TenToaNha || '';

            let statusClass = 'badge-secondary';
            if (trangThai === 'Đã xử lý' || trangThai === 'Da xu ly') statusClass = 'badge-success';
            else if (trangThai === 'Đang xử lý' || trangThai === 'Dang xu ly') statusClass = 'badge-warning';
            else if (trangThai === 'Chưa xử lý' || trangThai === 'Chua xu ly') statusClass = 'badge-danger';

            let punishmentClass = 'badge-info';
            if (hinhThucPhat.toLowerCase().includes('cảnh cáo')) punishmentClass = 'badge-warning';
            else if (hinhThucPhat.toLowerCase().includes('đình chỉ') || hinhThucPhat.toLowerCase().includes('dinh chi')) punishmentClass = 'badge-danger';

            return `
                <tr>
                    <td><strong>${maKyLuat}</strong></td>
                    <td>${loaiViPham}</td>
                    <td>${moTa.length > 50 ? moTa.substring(0, 50) + '...' : moTa}</td>
                    <td>${soPhong ? `${soPhong}${tenToaNha ? ' - ' + tenToaNha : ''}` : '-'}</td>
                    <td>${ngayViPham ? Utils.formatDate(ngayViPham) : '-'}</td>
                    <td><span class="badge ${punishmentClass}">${hinhThucPhat || 'Chưa có'}</span></td>
                    <td><span class="badge ${statusClass}">${trangThai}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewViolationDetails(${maKyLuat})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async viewViolationDetails(violationId) {
        const violation = this.violations.find(v => (v.maKyLuat || v.MaKyLuat) === violationId);
        if (!violation) {
            Utils.showAlert('Không tìm thấy kỷ luật', 'danger');
            return;
        }
        
        const maKyLuat = violation.maKyLuat || violation.MaKyLuat || '';
        const loaiViPham = violation.loaiViPham || violation.LoaiViPham || '';
        const moTa = violation.moTa || violation.MoTa || '';
        const ngayViPham = violation.ngayViPham || violation.NgayViPham;
        const hinhThucPhat = violation.hinhThucPhat || violation.HinhThucPhat || '';
        const trangThai = violation.trangThai || violation.TrangThai || '';
        const soPhong = violation.soPhong || violation.SoPhong || '';
        const tenToaNha = violation.tenToaNha || violation.TenToaNha || '';
        const ghiChu = violation.ghiChu || violation.GhiChu || '';
        
        const details = `Chi tiết kỷ luật:\n\n` +
            `Mã kỷ luật: ${maKyLuat}\n` +
            `Loại vi phạm: ${loaiViPham}\n` +
            `Mô tả: ${moTa}\n` +
            `Phòng: ${soPhong ? `${soPhong}${tenToaNha ? ' - ' + tenToaNha : ''}` : 'N/A'}\n` +
            `Ngày vi phạm: ${ngayViPham ? Utils.formatDate(ngayViPham) : 'N/A'}\n` +
            `Hình thức phạt: ${hinhThucPhat || 'Chưa có'}\n` +
            `Trạng thái: ${trangThai}\n` +
            `Ghi chú: ${ghiChu || 'Không có'}`;
        
        alert(details);
    }

    filterViolations() {
        const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('typeFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        let filtered = this.violations.filter(violation => {
            const loaiViPham = (violation.loaiViPham || violation.LoaiViPham || '').toLowerCase();
            const moTa = (violation.moTa || violation.MoTa || '').toLowerCase();
            const trangThai = violation.trangThai || violation.TrangThai || '';
            
            const matchSearch = !searchInput || 
                loaiViPham.includes(searchInput) ||
                moTa.includes(searchInput);
            
            const matchType = !typeFilter || (violation.loaiViPham || violation.LoaiViPham) === typeFilter;
            const matchStatus = !statusFilter || trangThai === statusFilter;
            
            return matchSearch && matchType && matchStatus;
        });
        
        this.renderViolationsTable(filtered);
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('statusFilter').value = '';
        this.renderViolationsTable();
    }
}

// Global functions
function viewViolationDetails(violationId) {
    window.studentViolations.viewViolationDetails(violationId);
}

function filterViolations() {
    window.studentViolations.filterViolations();
}

function resetFilters() {
    window.studentViolations.resetFilters();
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
    window.studentViolations = new StudentViolations();
});

