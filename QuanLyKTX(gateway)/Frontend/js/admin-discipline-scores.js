// Admin Discipline Scores Module
class AdminDisciplineScores {
    constructor() {
        this.scores = [];
        this.students = [];
        this.editingScore = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            await this.loadStudents();
            this.populateStudentFilter();
            this.populateStudentSelect();
            this.populateYearFilter();
            await this.loadScores();
            this.setupForm();
        } catch (error) {
            console.error('Failed to initialize AdminDisciplineScores:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
        }
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = user.hoTen || user.HoTen || user.tenDangNhap || user.TenDangNhap || 'Admin';
            }
            const userRoleEl = document.getElementById('userRole');
            if (userRoleEl) {
                const roleMap = {
                    'Admin': 'Quản trị viên',
                    'Officer': 'Nhân viên',
                    'Student': 'Sinh viên'
                };
                const role = user.vaiTro || user.VaiTro || '';
                userRoleEl.textContent = roleMap[role] || role;
            }
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

    populateStudentFilter() {
        const filter = document.getElementById('studentFilter');
        if (!filter) return;

        filter.innerHTML = '<option value="">Tất cả sinh viên</option>';
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.maSinhVien || student.MaSinhVien || '';
            const hoTen = student.hoTen || student.HoTen || '';
            const mssv = student.mssv || student.MSSV || '';
            option.textContent = mssv ? `${hoTen} (${mssv})` : hoTen;
            filter.appendChild(option);
        });
    }

    populateStudentSelect() {
        const select = document.getElementById('maSinhVien');
        if (!select) return;

        select.innerHTML = '<option value="">Chọn sinh viên</option>';
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.maSinhVien || student.MaSinhVien || '';
            const hoTen = student.hoTen || student.HoTen || '';
            const mssv = student.mssv || student.MSSV || '';
            option.textContent = mssv ? `${hoTen} (${mssv})` : hoTen;
            select.appendChild(option);
        });
    }

    populateYearFilter() {
        const filter = document.getElementById('yearFilter');
        if (!filter) return;

        const currentYear = new Date().getFullYear();
        filter.innerHTML = '<option value="">Tất cả năm</option>';
        
        // Populate years from 2020 to current year + 1
        for (let year = 2020; year <= currentYear + 1; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            filter.appendChild(option);
        }
    }

    setupForm() {
        const form = document.getElementById('scoreForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveScore();
            });
        }
    }

    async loadScores() {
        try {
            Utils.showLoading();

            console.log('Loading scores from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.DISCIPLINE_SCORES);
            const response = await $api.get(CONFIG.ENDPOINTS.DISCIPLINE_SCORES);
            console.log('Scores response received:', response);
            
            // Handle different response formats
            let scoresArray = [];
            if (Array.isArray(response)) {
                scoresArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    scoresArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    scoresArray = response.data;
                } else {
                    console.warn('Unexpected scores data format:', response);
                }
            }
            
            this.scores = scoresArray || [];
            console.log('Scores loaded:', this.scores.length);
            this.renderScoresTable();
            
        } catch (error) {
            console.error('Error loading scores:', error);
            const tbody = document.getElementById('scoresTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminDisciplineScores.loadScores()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách điểm rèn luyện: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async loadScoresByStudent(studentId) {
        try {
            Utils.showLoading();

            const response = await $api.get(CONFIG.ENDPOINTS.DISCIPLINE_SCORES_BY_STUDENT(studentId));
            console.log('Scores by student response:', response);
            
            // Handle different response formats
            let scoresArray = [];
            if (Array.isArray(response)) {
                scoresArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    scoresArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    scoresArray = response.data;
                }
            }
            
            return scoresArray || [];
        } catch (error) {
            console.error('Error loading scores by student:', error);
            return [];
        } finally {
            Utils.hideLoading();
        }
    }

    renderScoresTable(scores = null) {
        const tbody = document.getElementById('scoresTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayScores = scores || this.scores;
        
        if (displayScores.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        if (tbody) {
            tbody.innerHTML = displayScores.map(score => {
                // Handle both camelCase and PascalCase
                const maDiem = score.maDiem || score.MaDiem || '';
                const maSinhVien = score.maSinhVien || score.MaSinhVien;
                const thang = score.thang || score.Thang || 0;
                const nam = score.nam || score.Nam || 0;
                const diemSo = score.diemSo || score.DiemSo || 0;
                const xepLoai = score.xepLoai || score.XepLoai || 'Không xếp loại';
                const ghiChu = score.ghiChu || score.GhiChu || '';

                // Find student from students array
                const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
                const studentName = student ? (student.hoTen || student.HoTen || `SV #${maSinhVien}`) : `SV #${maSinhVien}`;
                const mssv = student ? (student.mssv || student.MSSV || '') : '';
                const studentDisplay = mssv ? `${studentName} (${mssv})` : studentName;

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
                        <td data-label="Mã"><strong>${maDiem}</strong></td>
                        <td data-label="Sinh viên">${studentDisplay}</td>
                        <td data-label="Tháng/Năm">${thang}/${nam}</td>
                        <td data-label="Điểm"><strong class="${scoreClass}">${diemSo.toFixed(1)}</strong></td>
                        <td data-label="Xếp loại"><span class="badge ${badgeClass}">${xepLoai}</span></td>
                        <td data-label="Ghi chú">${ghiChu || '<span class="text-muted">(Không có)</span>'}</td>
                        <td data-label="Thao tác">
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-warning" onclick="editScore(${maDiem})" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                                </button>
                                <button class="btn btn-sm btn-info" onclick="viewScoreDetails(${maDiem})" title="Xem chi tiết">
                                    <i class="fas fa-eye"></i> <span class="btn-text">Xem</span>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteScore(${maDiem})" title="Xóa">
                                    <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    openModal(score = null) {
        this.editingScore = score;
        const modal = document.getElementById('scoreModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const saveButtonText = document.getElementById('saveButtonText');
        
        if (score) {
            if (modalTitleText) modalTitleText.textContent = 'Chỉnh sửa điểm rèn luyện';
            if (saveButtonText) saveButtonText.textContent = 'Cập nhật';
            this.fillForm(score);
        } else {
            if (modalTitleText) modalTitleText.textContent = 'Thêm điểm rèn luyện';
            if (saveButtonText) saveButtonText.textContent = 'Thêm mới';
            this.clearForm();
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingScore = null;
        this.clearForm();
    }

    fillForm(score) {
        // Handle both camelCase and PascalCase
        const maDiem = score.maDiem || score.MaDiem || '';
        const maSinhVien = score.maSinhVien || score.MaSinhVien || '';
        const thang = score.thang || score.Thang || '';
        const nam = score.nam || score.Nam || '';
        const diemSo = score.diemSo || score.DiemSo || 0;
        const xepLoai = score.xepLoai || score.XepLoai || 'Không xếp loại';
        const ghiChu = score.ghiChu || score.GhiChu || '';

        document.getElementById('scoreId').value = maDiem;
        document.getElementById('maSinhVien').value = maSinhVien;
        document.getElementById('thang').value = thang;
        document.getElementById('nam').value = nam;
        document.getElementById('diemSo').value = diemSo;
        document.getElementById('xepLoai').value = xepLoai;
        document.getElementById('ghiChu').value = ghiChu;
    }

    clearForm() {
        const form = document.getElementById('scoreForm');
        if (form) form.reset();
        document.getElementById('scoreId').value = '';
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const namInput = document.getElementById('nam');
        if (namInput) namInput.value = currentYear;
        const thangInput = document.getElementById('thang');
        if (thangInput) thangInput.value = currentMonth;
    }

    calculateXepLoai(diemSo) {
        if (diemSo >= 90) return 'Xuất sắc';
        if (diemSo >= 80) return 'Tốt';
        if (diemSo >= 70) return 'Khá';
        if (diemSo >= 60) return 'Trung bình';
        return 'Yếu';
    }

    async saveScore() {
        const form = document.getElementById('scoreForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        const diemSo = parseFloat(document.getElementById('diemSo').value) || 0;
        const xepLoai = document.getElementById('xepLoai').value || this.calculateXepLoai(diemSo);

        // Backend expects PascalCase field names
        const scoreData = {
            MaSinhVien: parseInt(document.getElementById('maSinhVien').value, 10),
            Thang: parseInt(document.getElementById('thang').value, 10),
            Nam: parseInt(document.getElementById('nam').value, 10),
            DiemSo: diemSo,
            XepLoai: xepLoai,
            GhiChu: document.getElementById('ghiChu').value.trim() || null
        };

        try {
            Utils.showLoading();

            const scoreId = this.editingScore ? (this.editingScore.maDiem || this.editingScore.MaDiem) : null;

            if (this.editingScore && scoreId) {
                await $api.put(CONFIG.ENDPOINTS.DISCIPLINE_SCORE_BY_ID(scoreId), scoreData);
                Utils.showAlert('Cập nhật điểm rèn luyện thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.DISCIPLINE_SCORES, scoreData);
                Utils.showAlert('Thêm điểm rèn luyện thành công!', 'success');
            }
            
            this.closeModal();
            await this.loadScores();

        } catch (error) {
            console.error('Error saving score:', error);
            Utils.showAlert('Lỗi lưu điểm rèn luyện: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteScore(scoreId) {
        if (!confirm('Bạn có chắc chắn muốn xóa điểm rèn luyện này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.DISCIPLINE_SCORE_BY_ID(scoreId));

            Utils.showAlert('Xóa điểm rèn luyện thành công!', 'success');
            await this.loadScores();

        } catch (error) {
            console.error('Error deleting score:', error);
            Utils.showAlert('Lỗi xóa điểm rèn luyện: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async viewDetails(scoreId) {
        try {
            Utils.showLoading();
            
            const response = await $api.get(CONFIG.ENDPOINTS.DISCIPLINE_SCORE_BY_ID(scoreId));
            console.log('Score details response:', response);
            
            // Handle different response formats
            let score = null;
            if (response && typeof response === 'object') {
                if (response.maDiem || response.MaDiem) {
                    score = response;
                } else if (response.data) {
                    score = response.data;
                } else if (response.success && response.data) {
                    score = response.data;
                }
            }
            
            if (!score) {
                throw new Error('Không tìm thấy thông tin điểm rèn luyện');
            }
            
            // Handle both camelCase and PascalCase
            const maDiem = score.maDiem || score.MaDiem || '';
            const maSinhVien = score.maSinhVien || score.MaSinhVien;
            const thang = score.thang || score.Thang || 0;
            const nam = score.nam || score.Nam || 0;
            const diemSo = score.diemSo || score.DiemSo || 0;
            const xepLoai = score.xepLoai || score.XepLoai || 'Không xếp loại';
            const ghiChu = score.ghiChu || score.GhiChu || '(Không có)';
            
            const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            const studentName = student ? (student.hoTen || student.HoTen || `SV #${maSinhVien}`) : `SV #${maSinhVien}`;
            const mssv = student ? (student.mssv || student.MSSV || '') : '';
            
            const details = `Chi tiết điểm rèn luyện:\n\n` +
                `Mã điểm: ${maDiem}\n` +
                `Sinh viên: ${studentName}${mssv ? ` (${mssv})` : ''}\n` +
                `Tháng/Năm: ${thang}/${nam}\n` +
                `Điểm số: ${diemSo.toFixed(1)}\n` +
                `Xếp loại: ${xepLoai}\n` +
                `Ghi chú: ${ghiChu}`;
            
            alert(details);
        } catch (error) {
            console.error('Error loading score details:', error);
            Utils.showAlert('Lỗi tải chi tiết điểm rèn luyện: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    filterScores() {
        const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const studentFilter = document.getElementById('studentFilter')?.value || '';
        const monthFilter = document.getElementById('monthFilter')?.value || '';
        const yearFilter = document.getElementById('yearFilter')?.value || '';
        const rankFilter = document.getElementById('rankFilter')?.value || '';
        
        let filtered = this.scores.filter(score => {
            // Handle both camelCase and PascalCase
            const maSinhVien = score.maSinhVien || score.MaSinhVien;
            const thang = score.thang || score.Thang || 0;
            const nam = score.nam || score.Nam || 0;
            const diemSo = score.diemSo || score.DiemSo || 0;
            const xepLoai = (score.xepLoai || score.XepLoai || '').toLowerCase();
            const ghiChu = (score.ghiChu || score.GhiChu || '').toLowerCase();

            const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            const studentName = (student?.hoTen || student?.HoTen || '').toLowerCase();
            const mssv = (student?.mssv || student?.MSSV || '').toLowerCase();

            const matchSearch = !searchInput ||
                studentName.includes(searchInput) ||
                mssv.includes(searchInput) ||
                xepLoai.includes(searchInput) ||
                ghiChu.includes(searchInput) ||
                diemSo.toString().includes(searchInput);

            const matchStudent = !studentFilter || maSinhVien?.toString() === studentFilter.toString();
            const matchMonth = !monthFilter || thang.toString() === monthFilter.toString();
            const matchYear = !yearFilter || nam.toString() === yearFilter.toString();
            const matchRank = !rankFilter || (score.xepLoai || score.XepLoai) === rankFilter;

            return matchSearch && matchStudent && matchMonth && matchYear && matchRank;
        });
        
        this.renderScoresTable(filtered);
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('studentFilter').value = '';
        document.getElementById('monthFilter').value = '';
        document.getElementById('yearFilter').value = '';
        document.getElementById('rankFilter').value = '';
        this.renderScoresTable();
    }
}

// Global functions
function openScoreModal() {
    window.adminDisciplineScores.openModal();
}

function closeScoreModal() {
    window.adminDisciplineScores.closeModal();
}

function saveScore() {
    window.adminDisciplineScores.saveScore();
}

async function editScore(scoreId) {
    try {
        Utils.showLoading();
        
        const response = await $api.get(CONFIG.ENDPOINTS.DISCIPLINE_SCORE_BY_ID(scoreId));
        console.log('Score response:', response);
        
        // Handle different response formats
        let score = null;
        if (response && typeof response === 'object') {
            if (response.maDiem || response.MaDiem) {
                score = response;
            } else if (response.data) {
                score = response.data;
            } else if (response.success && response.data) {
                score = response.data;
            }
        }
        
        if (!score) {
            throw new Error('Không tìm thấy thông tin điểm rèn luyện');
        }
        
        window.adminDisciplineScores.openModal(score);
    } catch (error) {
        console.error('Error loading score:', error);
        Utils.showAlert('Lỗi tải thông tin điểm rèn luyện: ' + error.message, 'danger');
    } finally {
        Utils.hideLoading();
    }
}

function deleteScore(scoreId) {
    window.adminDisciplineScores.deleteScore(scoreId);
}

function viewScoreDetails(scoreId) {
    window.adminDisciplineScores.viewDetails(scoreId);
}

function filterScores() {
    window.adminDisciplineScores.filterScores();
}

function resetFilters() {
    window.adminDisciplineScores.resetFilters();
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
    window.adminDisciplineScores = new AdminDisciplineScores();
});


