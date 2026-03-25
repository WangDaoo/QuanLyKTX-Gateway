// Admin Contracts Module
class AdminContracts {
    constructor() {
        this.contracts = [];
        this.students = [];
        this.beds = [];
        this.editingContract = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            Utils.showLoading();
            await Promise.all([
                this.loadStudents(),
                this.loadBeds(),
                this.loadContracts()
            ]);
            this.setupForm();
        } catch (error) {
            console.error('Failed to initialize AdminContracts:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = user.hoTen || user.HoTen || user.tenDangNhap || user.TenDangNhap || 'Admin';
            }
            
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
            this.populateStudentSelect();
        } catch (error) {
            console.error('Error loading students:', error);
            this.students = [];
        }
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
            option.textContent = mssv ? `${hoTen} - ${mssv}` : hoTen;
            select.appendChild(option);
        });
    }

    async loadBeds() {
        try {
            const response = await $api.get(CONFIG.ENDPOINTS.BEDS);
            console.log('Beds response:', response);
            
            let bedsArray = [];
            if (Array.isArray(response)) {
                bedsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    bedsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    bedsArray = response.data;
                }
            }
            
            this.beds = bedsArray || [];
            console.log('Beds loaded:', this.beds.length);
            this.populateBedSelect();
        } catch (error) {
            console.error('Error loading beds:', error);
            this.beds = [];
        }
    }

    populateBedSelect() {
        const select = document.getElementById('maGiuong');
        if (!select) return;

        select.innerHTML = '<option value="">Chọn giường</option>';
        this.beds.forEach(bed => {
            const option = document.createElement('option');
            option.value = bed.maGiuong || bed.MaGiuong || '';
            const soGiuong = bed.soGiuong || bed.SoGiuong || '';
            const maPhong = bed.maPhong || bed.MaPhong || '';
            option.textContent = maPhong ? `Giường ${soGiuong} - Phòng ${maPhong}` : `Giường ${soGiuong}`;
            select.appendChild(option);
        });
    }

    setupForm() {
        const form = document.getElementById('contractForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveContract();
            });
        }
    }

    async loadContracts() {
        try {
            Utils.showLoading();

            console.log('Loading contracts from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.CONTRACTS);
            const response = await $api.get(CONFIG.ENDPOINTS.CONTRACTS);
            console.log('Contracts response received:', response);
            
            // Handle different response formats
            let contractsArray = [];
            if (Array.isArray(response)) {
                contractsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    contractsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    contractsArray = response.data;
                } else {
                    console.warn('Unexpected contracts data format:', response);
                }
            }
            
            this.contracts = contractsArray || [];
            console.log('Contracts loaded:', this.contracts.length);
            this.renderContractsTable();
            
        } catch (error) {
            console.error('Error loading contracts:', error);
            const tbody = document.getElementById('contractsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminContracts.loadContracts()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách hợp đồng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderContractsTable(contracts = null) {
        const tbody = document.getElementById('contractsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayContracts = contracts || this.contracts;
        
        if (displayContracts.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayContracts.map(contract => {
            // Handle both camelCase and PascalCase
            const maHopDong = contract.maHopDong || contract.MaHopDong || '';
            const maSinhVien = contract.maSinhVien || contract.MaSinhVien;
            const maGiuong = contract.maGiuong || contract.MaGiuong;
            const ngayBatDau = contract.ngayBatDau || contract.NgayBatDau;
            const ngayKetThuc = contract.ngayKetThuc || contract.NgayKetThuc;
            const giaPhong = contract.giaPhong || contract.GiaPhong || 0;
            const trangThai = contract.trangThai || contract.TrangThai || '';
            
            // Get student info
            let studentName = 'N/A';
            const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            if (student) {
                studentName = student.hoTen || student.HoTen || 'N/A';
            }
            
            // Get bed info
            let bedInfo = `Giường ${maGiuong}`;
            const bed = this.beds.find(b => (b.maGiuong || b.MaGiuong) === maGiuong);
            if (bed) {
                const soGiuong = bed.soGiuong || bed.SoGiuong || '';
                const maPhong = bed.maPhong || bed.MaPhong || '';
                bedInfo = maPhong ? `Giường ${soGiuong} - Phòng ${maPhong}` : `Giường ${soGiuong}`;
            }
            
            let statusClass = 'badge-secondary';
            if (trangThai === 'Đang hoạt động' || trangThai === 'Dang hoat dong') statusClass = 'badge-success';
            else if (trangThai === 'Chờ duyệt' || trangThai === 'Cho duyet') statusClass = 'badge-warning';
            else if (trangThai === 'Đã kết thúc' || trangThai === 'Da ket thuc') statusClass = 'badge-danger';
            else if (trangThai === 'Đã hủy' || trangThai === 'Da huy') statusClass = 'badge-secondary';

            const isExpired = new Date(ngayKetThuc) < new Date();
            const expiredStyle = isExpired && trangThai !== 'Đã kết thúc' && trangThai !== 'Da ket thuc' ? 'style="background-color: #fff3cd;"' : '';
            
            return `
                <tr ${expiredStyle}>
                    <td data-label="Mã HĐ"><strong>${maHopDong}</strong></td>
                    <td data-label="Sinh viên">${studentName}</td>
                    <td data-label="Giường">${bedInfo}</td>
                    <td data-label="Ngày bắt đầu">${Utils.formatDate(ngayBatDau)}</td>
                    <td data-label="Ngày kết thúc">${Utils.formatDate(ngayKetThuc)}</td>
                    <td data-label="Giá phòng"><strong>${Utils.formatCurrency(giaPhong)}</strong></td>
                    <td data-label="Trạng thái">
                        <span class="badge ${statusClass}">
                            ${trangThai}
                        </span>
                    </td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="editContract(${maHopDong})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="viewContractDetails(${maHopDong})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i> <span class="btn-text">Xem</span>
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="viewCurrentContractByStudent(${maSinhVien})" title="Xem hợp đồng hiện tại">
                                <i class="fas fa-file-contract"></i> <span class="btn-text">HĐ hiện tại</span>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="extendContractFromList(${maHopDong})" title="Gia hạn">
                                <i class="fas fa-calendar-plus"></i> <span class="btn-text">Gia hạn</span>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteContract(${maHopDong})" title="Xóa">
                                <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openModal(contract = null) {
        this.editingContract = contract;
        const modal = document.getElementById('contractModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const saveButtonText = document.getElementById('saveButtonText');
        const extendButton = document.getElementById('extendButton');
        
        if (contract) {
            if (modalTitleText) modalTitleText.textContent = 'Chỉnh sửa hợp đồng';
            if (saveButtonText) saveButtonText.textContent = 'Cập nhật';
            if (extendButton) extendButton.style.display = 'inline-block';
            this.fillForm(contract);
        } else {
            if (modalTitleText) modalTitleText.textContent = 'Thêm hợp đồng';
            if (saveButtonText) saveButtonText.textContent = 'Thêm mới';
            if (extendButton) extendButton.style.display = 'none';
            this.clearForm();
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('contractModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingContract = null;
        this.clearForm();
    }

    fillForm(contract) {
        // Handle both camelCase and PascalCase
        const maHopDong = contract.maHopDong || contract.MaHopDong || '';
        const maSinhVien = contract.maSinhVien || contract.MaSinhVien || '';
        const maGiuong = contract.maGiuong || contract.MaGiuong || '';
        const ngayBatDau = contract.ngayBatDau || contract.NgayBatDau;
        const ngayKetThuc = contract.ngayKetThuc || contract.NgayKetThuc;
        const giaPhong = contract.giaPhong || contract.GiaPhong || 0;
        const trangThai = contract.trangThai || contract.TrangThai || '';
        const ghiChu = contract.ghiChu || contract.GhiChu || '';

        document.getElementById('contractId').value = maHopDong;
        document.getElementById('maSinhVien').value = maSinhVien;
        document.getElementById('maGiuong').value = maGiuong;
        
        if (ngayBatDau) {
            const date = new Date(ngayBatDau);
            document.getElementById('ngayBatDau').value = date.toISOString().split('T')[0];
        }
        
        if (ngayKetThuc) {
            const date = new Date(ngayKetThuc);
            document.getElementById('ngayKetThuc').value = date.toISOString().split('T')[0];
        }
        
        document.getElementById('giaPhong').value = giaPhong;
        document.getElementById('trangThai').value = trangThai;
        document.getElementById('ghiChu').value = ghiChu;
    }

    clearForm() {
        document.getElementById('contractForm').reset();
        document.getElementById('contractId').value = '';
    }

    async saveContract() {
        const form = document.getElementById('contractForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        // Backend expects PascalCase field names
        const contractData = {
            MaSinhVien: parseInt(document.getElementById('maSinhVien').value),
            MaGiuong: parseInt(document.getElementById('maGiuong').value),
            NgayBatDau: new Date(document.getElementById('ngayBatDau').value),
            NgayKetThuc: new Date(document.getElementById('ngayKetThuc').value),
            GiaPhong: parseFloat(document.getElementById('giaPhong').value),
            TrangThai: document.getElementById('trangThai').value,
            GhiChu: document.getElementById('ghiChu').value.trim() || null
        };

        try {
            Utils.showLoading();

            const contractId = this.editingContract ? (this.editingContract.maHopDong || this.editingContract.MaHopDong) : null;

            if (this.editingContract && contractId) {
                await $api.put(CONFIG.ENDPOINTS.CONTRACT_BY_ID(contractId), contractData);
                Utils.showAlert('Cập nhật hợp đồng thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.CONTRACTS, contractData);
                Utils.showAlert('Thêm hợp đồng thành công!', 'success');
            }
            
            this.closeModal();
            await this.loadContracts();

        } catch (error) {
            console.error('Error saving contract:', error);
            Utils.showAlert('Lỗi lưu hợp đồng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async extendContract(contractId = null, months = null) {
        const targetContractId = contractId || (this.editingContract ? (this.editingContract.maHopDong || this.editingContract.MaHopDong) : null);
        
        if (!targetContractId) {
            Utils.showAlert('Không tìm thấy hợp đồng!', 'warning');
            return;
        }
        
        if (!months) {
            months = prompt('Nhập số tháng muốn gia hạn:', '6');
            if (!months) return;
            months = parseInt(months);
        }

        if (isNaN(months) || months <= 0) {
            Utils.showAlert('Số tháng không hợp lệ!', 'warning');
            return;
        }

        try {
            Utils.showLoading();

            // Backend expects PascalCase field name
            await $api.post(CONFIG.ENDPOINTS.CONTRACT_EXTEND(targetContractId), {
                SoThangGiaHan: months
            });

            Utils.showAlert(`Gia hạn hợp đồng thành công thêm ${months} tháng!`, 'success');
            if (this.editingContract) {
                this.closeModal();
            }
            await this.loadContracts();

        } catch (error) {
            console.error('Error extending contract:', error);
            Utils.showAlert('Lỗi gia hạn hợp đồng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteContract(contractId) {
        if (!confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
            return;
        }

        try {
            Utils.showLoading();

            await $api.delete(CONFIG.ENDPOINTS.CONTRACT_BY_ID(contractId));

            Utils.showAlert('Xóa hợp đồng thành công!', 'success');
            await this.loadContracts();

        } catch (error) {
            console.error('Error deleting contract:', error);
            Utils.showAlert('Lỗi xóa hợp đồng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async getCurrentContractByStudent(studentId) {
        try {
            Utils.showLoading();
            
            const response = await $api.get(CONFIG.ENDPOINTS.CONTRACT_CURRENT_BY_STUDENT(studentId));
            console.log('Current contract by student response:', response);
            
            // Handle different response formats
            let contract = null;
            if (response && typeof response === 'object') {
                if (response.maHopDong || response.MaHopDong) {
                    contract = response;
                } else if (response.data) {
                    contract = response.data;
                } else if (response.success && response.data) {
                    contract = response.data;
                }
            }
            
            if (!contract) {
                Utils.showAlert('Sinh viên này chưa có hợp đồng hiện tại', 'info');
                return null;
            }
            
            return contract;
        } catch (error) {
            console.error('Error loading current contract by student:', error);
            Utils.showAlert('Lỗi tải hợp đồng hiện tại của sinh viên: ' + error.message, 'danger');
            return null;
        } finally {
            Utils.hideLoading();
        }
    }

    async viewDetails(contractId) {
        try {
            Utils.showLoading();
            
            const response = await $api.get(CONFIG.ENDPOINTS.CONTRACT_BY_ID(contractId));
            console.log('Contract details response:', response);
            
            // Handle different response formats
            let contract = null;
            if (response && typeof response === 'object') {
                if (response.maHopDong || response.MaHopDong) {
                    contract = response;
                } else if (response.data) {
                    contract = response.data;
                } else if (response.success && response.data) {
                    contract = response.data;
                }
            }
            
            if (!contract) {
                throw new Error('Không tìm thấy thông tin hợp đồng');
            }
            
            // Handle both camelCase and PascalCase
            const maHopDong = contract.maHopDong || contract.MaHopDong || '';
            const maSinhVien = contract.maSinhVien || contract.MaSinhVien;
            const maGiuong = contract.maGiuong || contract.MaGiuong;
            const ngayBatDau = contract.ngayBatDau || contract.NgayBatDau;
            const ngayKetThuc = contract.ngayKetThuc || contract.NgayKetThuc;
            const giaPhong = contract.giaPhong || contract.GiaPhong || 0;
            const trangThai = contract.trangThai || contract.TrangThai || '';
            const ghiChu = contract.ghiChu || contract.GhiChu || '';
            
            // Get student info
            let studentInfo = 'N/A';
            const student = this.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
            if (student) {
                const hoTen = student.hoTen || student.HoTen;
                const mssv = student.mssv || student.MSSV || '';
                studentInfo = mssv ? `${hoTen} - ${mssv}` : hoTen;
            }
            
            // Get bed info
            let bedInfo = `Giường ${maGiuong}`;
            const bed = this.beds.find(b => (b.maGiuong || b.MaGiuong) === maGiuong);
            if (bed) {
                const soGiuong = bed.soGiuong || bed.SoGiuong || '';
                const maPhong = bed.maPhong || bed.MaPhong || '';
                bedInfo = maPhong ? `Giường ${soGiuong} - Phòng ${maPhong}` : `Giường ${soGiuong}`;
            }
            
            const details = `Chi tiết hợp đồng:\n\n` +
                `Mã HĐ: ${maHopDong}\n` +
                `Sinh viên: ${studentInfo}\n` +
                `Giường: ${bedInfo}\n` +
                `Ngày bắt đầu: ${Utils.formatDate(ngayBatDau)}\n` +
                `Ngày kết thúc: ${Utils.formatDate(ngayKetThuc)}\n` +
                `Giá phòng: ${Utils.formatCurrency(giaPhong)}\n` +
                `Trạng thái: ${trangThai}\n` +
                `Ghi chú: ${ghiChu || 'Không có'}`;
            
            alert(details);
        } catch (error) {
            console.error('Error loading contract details:', error);
            Utils.showAlert('Lỗi tải chi tiết hợp đồng: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function openContractModal() {
    window.adminContracts.openModal();
}

function closeContractModal() {
    window.adminContracts.closeModal();
}

function saveContract() {
    window.adminContracts.saveContract();
}

function extendContract() {
    if (window.adminContracts.editingContract) {
        const contractId = window.adminContracts.editingContract.maHopDong || window.adminContracts.editingContract.MaHopDong;
        window.adminContracts.extendContract(contractId);
    } else {
        Utils.showAlert('Vui lòng chọn hợp đồng để gia hạn!', 'warning');
    }
}

function extendContractFromList(contractId) {
    window.adminContracts.extendContract(contractId);
}

async function editContract(contractId) {
    try {
        Utils.showLoading();
        
        const response = await $api.get(CONFIG.ENDPOINTS.CONTRACT_BY_ID(contractId));
        console.log('Contract response:', response);
        
        // Handle different response formats
        let contract = null;
        if (response && typeof response === 'object') {
            if (response.maHopDong || response.MaHopDong) {
                contract = response;
            } else if (response.data) {
                contract = response.data;
            } else if (response.success && response.data) {
                contract = response.data;
            }
        }
        
        if (!contract) {
            throw new Error('Không tìm thấy thông tin hợp đồng');
        }
        
        window.adminContracts.openModal(contract);
    } catch (error) {
        console.error('Error loading contract:', error);
        Utils.showAlert('Lỗi tải thông tin hợp đồng: ' + error.message, 'danger');
    } finally {
        Utils.hideLoading();
    }
}

function deleteContract(contractId) {
    window.adminContracts.deleteContract(contractId);
}

function viewContractDetails(contractId) {
    window.adminContracts.viewDetails(contractId);
}

async function viewCurrentContractByStudent(studentId) {
    try {
        const contract = await window.adminContracts.getCurrentContractByStudent(studentId);
        if (contract) {
            // Hiển thị chi tiết hợp đồng hiện tại
            window.adminContracts.viewDetails(contract.maHopDong || contract.MaHopDong);
        }
    } catch (error) {
        console.error('Error viewing current contract:', error);
        Utils.showAlert('Lỗi xem hợp đồng hiện tại: ' + error.message, 'danger');
    }
}

function filterContracts() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    let filtered = window.adminContracts.contracts.filter(contract => {
        // Handle both camelCase and PascalCase
        const maHopDong = (contract.maHopDong || contract.MaHopDong || '').toString();
        const maSinhVien = contract.maSinhVien || contract.MaSinhVien;
        const trangThai = contract.trangThai || contract.TrangThai || '';
        
        // Get student info
        let studentName = '';
        const student = window.adminContracts.students.find(s => (s.maSinhVien || s.MaSinhVien) === maSinhVien);
        if (student) {
            studentName = (student.hoTen || student.HoTen || '').toLowerCase();
        }
        
        const matchSearch = !searchInput || 
            studentName.includes(searchInput) ||
            maHopDong.includes(searchInput);
        
        const matchStatus = !statusFilter || trangThai === statusFilter;
        
        return matchSearch && matchStatus;
    });
    
    window.adminContracts.renderContractsTable(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    window.adminContracts.renderContractsTable();
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
    window.adminContracts = new AdminContracts();
});

