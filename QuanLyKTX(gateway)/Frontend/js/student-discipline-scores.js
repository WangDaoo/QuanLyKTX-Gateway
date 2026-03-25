// Student Discipline Scores Module
class StudentDisciplineScores {
    constructor() {
        this.scores = [];
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.loadScores();
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

    async loadScores() {
        try {
            Utils.showLoading();
            
            const data = await $api.get(CONFIG.ENDPOINTS.USER_DISCIPLINE_SCORES);
            this.scores = Array.isArray(data) ? data : [];
            
            this.renderScoresTable();
            
        } catch (error) {
            console.error('Error loading discipline scores:', error);
            Utils.showAlert('Lỗi tải danh sách điểm rèn luyện: ' + error.message, 'danger');
            this.scores = [];
            this.renderScoresTable();
        } finally {
            Utils.hideLoading();
        }
    }

    renderScoresTable(scores = null) {
        const tbody = document.getElementById('scoresTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayScores = scores || this.scores;
        
        if (!tbody) return;
        
        if (displayScores.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayScores.map(score => {
            const thang = score.thang || score.Thang || 0;
            const nam = score.nam || score.Nam || 0;
            const diemSo = score.diemSo || score.DiemSo || 0;
            const xepLoai = score.xepLoai || score.XepLoai || 'Không xếp loại';
            const ghiChu = score.ghiChu || score.GhiChu || '';

            // Determine badge class based on xepLoai
            let badgeClass = 'badge-secondary';
            if (xepLoai === 'Xuất sắc') badgeClass = 'badge-success';
            else if (xepLoai === 'Tốt') badgeClass = 'badge-info';
            else if (xepLoai === 'Khá') badgeClass = 'badge-primary';
            else if (xepLoai === 'Trung bình') badgeClass = 'badge-warning';
            else if (xepLoai === 'Yếu') badgeClass = 'badge-danger';

            // Determine score color
            let scoreClass = '';
            if (diemSo >= 90) scoreClass = 'text-success';
            else if (diemSo >= 80) scoreClass = 'text-info';
            else if (diemSo >= 70) scoreClass = 'text-primary';
            else if (diemSo >= 60) scoreClass = 'text-warning';
            else scoreClass = 'text-danger';

            return `
                <tr>
                    <td>
                        <span class="badge badge-info">
                            ${thang}/${nam}
                        </span>
                    </td>
                    <td><strong class="${scoreClass}">${diemSo.toFixed(1)}</strong></td>
                    <td><span class="badge ${badgeClass}">${xepLoai}</span></td>
                    <td>${ghiChu || '<span class="text-muted">(Không có)</span>'}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewScoreDetails(${thang}, ${nam})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async viewScoreDetails(thang, nam) {
        try {
            Utils.showLoading();
            
            const data = await $api.get(CONFIG.ENDPOINTS.USER_DISCIPLINE_SCORE_BY_MONTH(thang, nam));
            
            const diemSo = data.diemSo || data.DiemSo || 0;
            const xepLoai = data.xepLoai || data.XepLoai || 'Không xếp loại';
            const ghiChu = data.ghiChu || data.GhiChu || '(Không có)';
            
            let badgeClass = 'badge-secondary';
            if (xepLoai === 'Xuất sắc') badgeClass = 'badge-success';
            else if (xepLoai === 'Tốt') badgeClass = 'badge-info';
            else if (xepLoai === 'Khá') badgeClass = 'badge-primary';
            else if (xepLoai === 'Trung bình') badgeClass = 'badge-warning';
            else if (xepLoai === 'Yếu') badgeClass = 'badge-danger';
            
            alert(`Chi tiết điểm rèn luyện:\n\nTháng/Năm: ${thang}/${nam}\nĐiểm số: ${diemSo.toFixed(1)}\nXếp loại: ${xepLoai}\nGhi chú: ${ghiChu}`);
        } catch (error) {
            console.error('Error loading score details:', error);
            Utils.showAlert('Lỗi tải chi tiết điểm rèn luyện: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    filterScores() {
        const monthFilter = document.getElementById('monthFilter')?.value || '';
        const yearFilter = document.getElementById('yearFilter')?.value || '';
        const rankFilter = document.getElementById('rankFilter')?.value || '';
        
        let filtered = this.scores.filter(score => {
            const thang = score.thang || score.Thang || 0;
            const nam = score.nam || score.Nam || 0;
            const xepLoai = score.xepLoai || score.XepLoai || '';
            
            const matchMonth = !monthFilter || thang.toString() === monthFilter.toString();
            const matchYear = !yearFilter || nam.toString() === yearFilter.toString();
            const matchRank = !rankFilter || xepLoai === rankFilter;
            
            return matchMonth && matchYear && matchRank;
        });
        
        this.renderScoresTable(filtered);
    }

    resetFilters() {
        document.getElementById('monthFilter').value = '';
        document.getElementById('yearFilter').value = '';
        document.getElementById('rankFilter').value = '';
        this.renderScoresTable();
    }
}

// Global functions
function viewScoreDetails(thang, nam) {
    window.studentDisciplineScores.viewScoreDetails(thang, nam);
}

function filterScores() {
    window.studentDisciplineScores.filterScores();
}

function resetFilters() {
    window.studentDisciplineScores.resetFilters();
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
    window.studentDisciplineScores = new StudentDisciplineScores();
});

