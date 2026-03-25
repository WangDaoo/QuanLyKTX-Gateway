
// Admin Buildings Module
class AdminBuildings {
    constructor() {
        this.buildings = [];
        this.editingBuilding = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            await this.loadBuildings();
            this.setupForm();
        } catch (error) {
            console.error('Failed to initialize AdminBuildings:', error);
            Utils.showAlert('Lỗi khởi tạo hệ thống. Vui lòng refresh trang!', 'danger');
        }
    }

    loadUserInfo() {
        const user = Utils.getUser();
        if (user) {
            const userNameEl = document.getElementById('userName');
            const userRoleEl = document.getElementById('userRole');
            const userAvatarEl = document.getElementById('userAvatar');

            if (userNameEl) {
                userNameEl.textContent = user.hoTen || user.tenDangNhap;
            }
            if (userRoleEl) {
                userRoleEl.textContent = user.vaiTro;
            }
            if (userAvatarEl) {
                userAvatarEl.textContent = (user.hoTen || user.tenDangNhap).charAt(0).toUpperCase();
            }
        }
    }

    setupForm() {
        const form = document.getElementById('buildingForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBuilding();
            });
        }
    }

    async loadBuildings() {
        try {
            Utils.showLoading();

            console.log('Loading buildings from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.BUILDINGS);

            const data = await $api.get(CONFIG.ENDPOINTS.BUILDINGS);
            console.log('Buildings data received:', data);
            
            // Handle different response formats
            let buildingsArray = [];
            if (Array.isArray(data)) {
                buildingsArray = data;
            } else if (data && Array.isArray(data.data)) {
                buildingsArray = data.data;
            } else if (data && data.success && Array.isArray(data.data)) {
                buildingsArray = data.data;
            } else {
                console.warn('Unexpected data format:', data);
            }
            
            this.buildings = buildingsArray;
            console.log('Buildings array:', this.buildings);
            
            this.renderBuildingsTable();
            
        } catch (error) {
            console.error('Error loading buildings:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                endpoint: CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.BUILDINGS
            });
            
            // Show error in table
            const tbody = document.getElementById('buildingsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <p style="font-size: 0.8rem; color: #666;">Vui lòng kiểm tra console để biết thêm chi tiết</p>
                        </td>
                    </tr>
                `;
            }
            
            Utils.showAlert('Lỗi tải danh sách tòa nhà: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderBuildingsTable(buildings = null) {
        const tbody = document.getElementById('buildingsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayBuildings = buildings || this.buildings;
        
        if (displayBuildings.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayBuildings.map(building => {
            const maToaNha = building.maToaNha || 'N/A';
            const tenToaNha = building.tenToaNha || building.TenToaNha || 'N/A';
            const diaChi = building.diaChi || '';
            const soTang = building.soTang || 0;
            const trangThai = building.trangThai !== false && building.trangThai !== 0;
            const ngayTao = building.ngayTao ? Utils.formatDate(building.ngayTao) : 'N/A';
            
            return `
            <tr>
                <td data-label="Mã tòa nhà"><strong>${maToaNha}</strong></td>
                <td data-label="Tên tòa nhà">
                    <div class="building-name">
                        <i class="fas fa-building"></i>
                        ${tenToaNha}
                    </div>
                </td>
                <td data-label="Địa chỉ">${diaChi || '<span class="text-muted">Chưa có</span>'}</td>
                <td data-label="Số tầng">
                    <span class="badge badge-info">
                        <i class="fas fa-layer-group"></i> ${soTang} tầng
                    </span>
                </td>
                <td data-label="Trạng thái">
                    <span class="badge ${trangThai ? 'badge-success' : 'badge-danger'}">
                        ${trangThai ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                </td>
                <td data-label="Ngày tạo">${ngayTao}</td>
                <td data-label="Thao tác">
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editBuilding(${maToaNha})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="viewBuildingDetails(${maToaNha})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBuilding(${maToaNha})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    }

    openModal(building = null) {
        this.editingBuilding = building;
        const modal = document.getElementById('buildingModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const saveButtonText = document.getElementById('saveButtonText');
        
        if (building) {
            modalTitleText.textContent = 'Chỉnh sửa tòa nhà';
            saveButtonText.textContent = 'Cập nhật';
            this.fillForm(building);
        } else {
            modalTitleText.textContent = 'Thêm tòa nhà';
            saveButtonText.textContent = 'Thêm mới';
            this.clearForm();
        }
        
        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('buildingModal');
        modal.classList.remove('show');
        this.editingBuilding = null;
        this.clearForm();
    }

    fillForm(building) {
        document.getElementById('buildingId').value = building.maToaNha;
        document.getElementById('tenToaNha').value = building.tenToaNha || building.TenToaNha || '';
        document.getElementById('diaChi').value = building.diaChi || '';
        document.getElementById('soTang').value = building.soTang || '';
        document.getElementById('moTa').value = building.moTa || '';
        document.getElementById('trangThai').checked = building.trangThai !== false;
    }

    clearForm() {
        document.getElementById('buildingForm').reset();
        document.getElementById('buildingId').value = '';
    }

    async saveBuilding() {
        const form = document.getElementById('buildingForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        
        const buildingData = {
            tenToaNha: formData.get('tenToaNha'),
            diaChi: formData.get('diaChi') || null,
            soTang: formData.get('soTang') ? parseInt(formData.get('soTang')) : null,
            moTa: formData.get('moTa') || null,
            trangThai: document.getElementById('trangThai').checked
        };

        try {
            Utils.showLoading();

            if (this.editingBuilding) {
                await $api.put(`${CONFIG.ENDPOINTS.BUILDINGS}/${this.editingBuilding.maToaNha}`, buildingData);
                Utils.showAlert('Cập nhật tòa nhà thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.BUILDINGS, buildingData);
                Utils.showAlert('Thêm tòa nhà thành công!', 'success');
            }

            this.closeModal();
            this.loadBuildings();

        } catch (error) {
            console.error('Error saving building:', error);
            Utils.showAlert('Lỗi lưu tòa nhà: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteBuilding(buildingId) {
        if (!confirm('Bạn có chắc chắn muốn xóa tòa nhà này?')) {
            return;
        }

        try {
            Utils.showLoading();

            await $api.delete(`${CONFIG.ENDPOINTS.BUILDINGS}/${buildingId}`);

            Utils.showAlert('Xóa tòa nhà thành công!', 'success');
            this.loadBuildings();

        } catch (error) {
            console.error('Error deleting building:', error);
            Utils.showAlert('Lỗi xóa tòa nhà: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions for HTML onclick events
function openBuildingModal() {
    window.adminBuildings.openModal();
}

function closeBuildingModal() {
    window.adminBuildings.closeModal();
}

function saveBuilding() {
    window.adminBuildings.saveBuilding();
}

function editBuilding(buildingId) {
    const building = window.adminBuildings.buildings.find(b => b.maToaNha === buildingId);
    if (building) {
        window.adminBuildings.openModal(building);
    }
}

function deleteBuilding(buildingId) {
    window.adminBuildings.deleteBuilding(buildingId);
}

function viewBuildingDetails(buildingId) {
    const building = window.adminBuildings.buildings.find(b => b.maToaNha === buildingId);
    if (building) {
        const buildingName = building.tenToaNha || building.TenToaNha || 'N/A';
        alert(`Chi tiết tòa nhà:\n\nTên: ${buildingName}\nĐịa chỉ: ${building.diaChi || 'Chưa có'}\nSố tầng: ${building.soTang || 'N/A'}\nTrạng thái: ${building.trangThai ? 'Hoạt động' : 'Ngừng hoạt động'}`);
    }
}

function filterBuildings() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = window.adminBuildings.buildings.filter(building => {
        const matchSearch = !searchInput || 
            (building.tenToaNha || building.TenToaNha || '').toLowerCase().includes(searchInput) ||
            (building.diaChi && building.diaChi.toLowerCase().includes(searchInput));
        
        const matchStatus = !statusFilter || 
            (statusFilter === 'true' && building.trangThai) ||
            (statusFilter === 'false' && !building.trangThai);
        
        return matchSearch && matchStatus;
    });
    
    window.adminBuildings.renderBuildingsTable(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    window.adminBuildings.renderBuildingsTable();
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
    window.adminBuildings = new AdminBuildings();
});


