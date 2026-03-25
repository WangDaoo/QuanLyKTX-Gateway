// Admin Meter Readings Module
class AdminMeterReadings {
    constructor() {
        this.meterReadings = [];
        this.rooms = [];
        this.editingReading = null;
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
                this.loadRooms(),
                this.loadMeterReadings()
            ]);
            this.setupForm();
            
            // Set current year and month as default
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const namInput = document.getElementById('nam');
            const thangSelect = document.getElementById('thang');
            if (namInput) namInput.value = currentYear;
            if (thangSelect) thangSelect.value = currentMonth;
        } catch (error) {
            console.error('Failed to initialize AdminMeterReadings:', error);
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
            this.populateRoomSelect();
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.rooms = [];
        }
    }

    populateRoomFilter() {
        const filter = document.getElementById('roomFilter');
        if (!filter) return;

        filter.innerHTML = '<option value="">Tất cả phòng</option>';
        this.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.maPhong || room.MaPhong || '';
            const soPhong = room.soPhong || room.SoPhong || '';
            const buildingName = room.tenToaNha || room.TenToaNha || '';
            option.textContent = buildingName ? `${soPhong} - ${buildingName}` : soPhong;
            filter.appendChild(option);
        });
    }

    populateRoomSelect() {
        const select = document.getElementById('maPhong');
        if (!select) return;

        select.innerHTML = '<option value="">Chọn phòng</option>';
        this.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.maPhong || room.MaPhong || '';
            const soPhong = room.soPhong || room.SoPhong || '';
            const buildingName = room.tenToaNha || room.TenToaNha || '';
            option.textContent = buildingName ? `${soPhong} - ${buildingName}` : soPhong;
            select.appendChild(option);
        });
    }

    setupForm() {
        const form = document.getElementById('meterReadingForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveMeterReading();
            });
        }
    }

    async loadMeterReadings() {
        try {
            Utils.showLoading();

            console.log('Loading meter readings from:', CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.METER_READINGS);
            const response = await $api.get(CONFIG.ENDPOINTS.METER_READINGS);
            console.log('Meter readings response received:', response);
            
            // Handle different response formats
            let readingsArray = [];
            if (Array.isArray(response)) {
                readingsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    readingsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    readingsArray = response.data;
                } else {
                    console.warn('Unexpected meter readings data format:', response);
                }
            }
            
            this.meterReadings = readingsArray || [];
            console.log('Meter readings loaded:', this.meterReadings.length);
            this.renderMeterReadingsTable();
            
        } catch (error) {
            console.error('Error loading meter readings:', error);
            const tbody = document.getElementById('meterReadingsTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" class="text-center" style="color: #e74c3c;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Lỗi tải dữ liệu: ${error.message}</p>
                            <button class="btn btn-sm btn-primary" onclick="window.adminMeterReadings.loadMeterReadings()" style="margin-top: 10px;">
                                <i class="fas fa-redo"></i> Thử lại
                            </button>
                        </td>
                    </tr>
                `;
            }
            Utils.showAlert('Lỗi tải danh sách chỉ số điện nước: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    renderMeterReadingsTable(readings = null) {
        const tbody = document.getElementById('meterReadingsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const displayReadings = readings || this.meterReadings;
        
        if (displayReadings.length === 0) {
            tbody.innerHTML = '';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        }

        if (noDataMessage) noDataMessage.style.display = 'none';

        tbody.innerHTML = displayReadings.map(reading => {
            // Handle both camelCase and PascalCase
            const maChiSo = reading.maChiSo || reading.MaChiSo || '';
            const maPhong = reading.maPhong || reading.MaPhong;
            const thang = reading.thang || reading.Thang || 0;
            const nam = reading.nam || reading.Nam || 0;
            const chiSoDien = reading.chiSoDien || reading.ChiSoDien || 0;
            const chiSoNuoc = reading.chiSoNuoc || reading.ChiSoNuoc || 0;
            const nguoiGhi = reading.nguoiGhi || reading.NguoiGhi || 'N/A';
            const ngayTao = reading.ngayTao || reading.NgayTao;
            const trangThai = reading.trangThai || reading.TrangThai || '';

            const room = this.rooms.find(r => (r.maPhong || r.MaPhong) === maPhong);
            let roomInfo = `Phòng ${maPhong}`;
            if (room) {
                const soPhong = room.soPhong || room.SoPhong || '';
                const buildingName = room.tenToaNha || room.TenToaNha || '';
                roomInfo = buildingName ? `${soPhong} - ${buildingName}` : soPhong;
            }
            
            let statusClass = 'badge-secondary';
            if (trangThai === 'Đã xác nhận' || trangThai === 'Da xac nhan') statusClass = 'badge-success';
            else if (trangThai === 'Chờ xác nhận' || trangThai === 'Cho xac nhan') statusClass = 'badge-warning';
            else if (trangThai === 'Đã ghi' || trangThai === 'Da ghi') statusClass = 'badge-info';

            return `
                <tr>
                    <td data-label="Mã chỉ số"><strong>${maChiSo}</strong></td>
                    <td data-label="Phòng">${roomInfo}</td>
                    <td data-label="Tháng/Năm">
                        <span class="badge badge-info">
                            ${thang}/${nam}
                        </span>
                    </td>
                    <td data-label="Chỉ số điện">
                        <strong>${chiSoDien}</strong> kWh
                    </td>
                    <td data-label="Chỉ số nước">
                        <strong>${chiSoNuoc}</strong> m³
                    </td>
                    <td data-label="Người ghi">${nguoiGhi}</td>
                    <td data-label="Ngày ghi">${Utils.formatDate(ngayTao)}</td>
                    <td data-label="Trạng thái">
                        <span class="badge ${statusClass}">
                            ${trangThai}
                        </span>
                    </td>
                    <td data-label="Thao tác">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="editMeterReading(${maChiSo})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i> <span class="btn-text">Sửa</span>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="viewMeterReadingDetails(${maChiSo})" title="Xem chi tiết">
                                <i class="fas fa-eye"></i> <span class="btn-text">Xem</span>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteMeterReading(${maChiSo})" title="Xóa">
                                <i class="fas fa-trash"></i> <span class="btn-text">Xóa</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openModal(reading = null) {
        this.editingReading = reading;
        const modal = document.getElementById('meterReadingModal');
        const modalTitleText = document.getElementById('modalTitleText');
        const saveButtonText = document.getElementById('saveButtonText');
        
        if (reading) {
            if (modalTitleText) modalTitleText.textContent = 'Chỉnh sửa chỉ số điện nước';
            if (saveButtonText) saveButtonText.textContent = 'Cập nhật';
            this.fillForm(reading);
        } else {
            if (modalTitleText) modalTitleText.textContent = 'Thêm chỉ số điện nước';
            if (saveButtonText) saveButtonText.textContent = 'Thêm mới';
            this.clearForm();
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('meterReadingModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingReading = null;
        this.clearForm();
    }

    fillForm(reading) {
        // Handle both camelCase and PascalCase
        const maChiSo = reading.maChiSo || reading.MaChiSo || '';
        const maPhong = reading.maPhong || reading.MaPhong || '';
        const thang = reading.thang || reading.Thang || '';
        const nam = reading.nam || reading.Nam || '';
        const chiSoDien = reading.chiSoDien || reading.ChiSoDien || 0;
        const chiSoNuoc = reading.chiSoNuoc || reading.ChiSoNuoc || 0;
        const nguoiGhi = reading.nguoiGhi || reading.NguoiGhi || '';
        const trangThai = reading.trangThai || reading.TrangThai || '';
        const ghiChu = reading.ghiChu || reading.GhiChu || '';

        document.getElementById('meterReadingId').value = maChiSo;
        document.getElementById('maPhong').value = maPhong;
        document.getElementById('thang').value = thang;
        document.getElementById('nam').value = nam;
        document.getElementById('chiSoDien').value = chiSoDien;
        document.getElementById('chiSoNuoc').value = chiSoNuoc;
        document.getElementById('trangThai').value = trangThai;
        document.getElementById('nguoiGhi').value = nguoiGhi;
        document.getElementById('ghiChu').value = ghiChu;
    }

    clearForm() {
        const form = document.getElementById('meterReadingForm');
        if (form) form.reset();
        document.getElementById('meterReadingId').value = '';
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        document.getElementById('nam').value = currentYear;
        document.getElementById('thang').value = currentMonth;
    }

    async saveMeterReading() {
        const form = document.getElementById('meterReadingForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        // Backend expects PascalCase field names
        const readingData = {
            MaPhong: parseInt(document.getElementById('maPhong').value),
            Thang: parseInt(document.getElementById('thang').value),
            Nam: parseInt(document.getElementById('nam').value),
            ChiSoDien: parseInt(document.getElementById('chiSoDien').value),
            ChiSoNuoc: parseInt(document.getElementById('chiSoNuoc').value),
            TrangThai: document.getElementById('trangThai').value,
            NguoiGhi: document.getElementById('nguoiGhi').value.trim() || null,
            GhiChu: document.getElementById('ghiChu').value.trim() || null
        };

        try {
            Utils.showLoading();

            const readingId = this.editingReading ? (this.editingReading.maChiSo || this.editingReading.MaChiSo) : null;

            if (this.editingReading && readingId) {
                await $api.put(CONFIG.ENDPOINTS.METER_READING_BY_ID(readingId), readingData);
                Utils.showAlert('Cập nhật chỉ số điện nước thành công!', 'success');
            } else {
                await $api.post(CONFIG.ENDPOINTS.METER_READINGS, readingData);
                Utils.showAlert('Thêm chỉ số điện nước thành công!', 'success');
            }
            
            this.closeModal();
            await this.loadMeterReadings();

        } catch (error) {
            console.error('Error saving meter reading:', error);
            Utils.showAlert('Lỗi lưu chỉ số điện nước: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async deleteMeterReading(readingId) {
        if (!confirm('Bạn có chắc chắn muốn xóa chỉ số điện nước này?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            await $api.delete(CONFIG.ENDPOINTS.METER_READING_BY_ID(readingId));

            Utils.showAlert('Xóa chỉ số điện nước thành công!', 'success');
            await this.loadMeterReadings();

        } catch (error) {
            console.error('Error deleting meter reading:', error);
            Utils.showAlert('Lỗi xóa chỉ số điện nước: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async viewDetails(readingId) {
        try {
            Utils.showLoading();
            
            const response = await $api.get(CONFIG.ENDPOINTS.METER_READING_BY_ID(readingId));
            console.log('Meter reading details response:', response);
            
            // Handle different response formats
            let reading = null;
            if (response && typeof response === 'object') {
                if (response.maChiSo || response.MaChiSo) {
                    reading = response;
                } else if (response.data) {
                    reading = response.data;
                } else if (response.success && response.data) {
                    reading = response.data;
                }
            }
            
            if (!reading) {
                throw new Error('Không tìm thấy thông tin chỉ số điện nước');
            }
            
            // Handle both camelCase and PascalCase
            const maChiSo = reading.maChiSo || reading.MaChiSo || '';
            const maPhong = reading.maPhong || reading.MaPhong;
            const thang = reading.thang || reading.Thang || 0;
            const nam = reading.nam || reading.Nam || 0;
            const chiSoDien = reading.chiSoDien || reading.ChiSoDien || 0;
            const chiSoNuoc = reading.chiSoNuoc || reading.ChiSoNuoc || 0;
            const nguoiGhi = reading.nguoiGhi || reading.NguoiGhi || 'N/A';
            const ngayTao = reading.ngayTao || reading.NgayTao;
            const trangThai = reading.trangThai || reading.TrangThai || '';
            const ghiChu = reading.ghiChu || reading.GhiChu || '';
            
            const room = this.rooms.find(r => (r.maPhong || r.MaPhong) === maPhong);
            let roomInfo = `Phòng ${maPhong}`;
            if (room) {
                const soPhong = room.soPhong || room.SoPhong || '';
                const buildingName = room.tenToaNha || room.TenToaNha || '';
                roomInfo = buildingName ? `${soPhong} - ${buildingName}` : soPhong;
            }
            
            const details = `Chi tiết chỉ số điện nước:\n\n` +
                `Mã: ${maChiSo}\n` +
                `Phòng: ${roomInfo}\n` +
                `Tháng/Năm: ${thang}/${nam}\n` +
                `Chỉ số điện: ${chiSoDien} kWh\n` +
                `Chỉ số nước: ${chiSoNuoc} m³\n` +
                `Người ghi: ${nguoiGhi}\n` +
                `Ngày ghi: ${Utils.formatDate(ngayTao)}\n` +
                `Trạng thái: ${trangThai}\n` +
                `Ghi chú: ${ghiChu || 'Không có'}`;
            
            alert(details);
        } catch (error) {
            console.error('Error loading meter reading details:', error);
            Utils.showAlert('Lỗi tải chi tiết chỉ số điện nước: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async downloadTemplate() {
        try {
            Utils.showLoading();
            
            const token = Utils.getToken();
            const url = CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.METER_READINGS_TEMPLATE;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    Utils.removeToken();
                    Utils.removeUser();
                    window.location.href = '../index.html';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'Template_ChiSoDienNuoc.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
            
            Utils.showAlert('Tải template thành công!', 'success');
        } catch (error) {
            console.error('Error downloading template:', error);
            Utils.showAlert('Lỗi tải template: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async importExcel(file) {
        if (!file) {
            Utils.showAlert('Vui lòng chọn file Excel!', 'warning');
            return;
        }

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            Utils.showAlert('Chỉ hỗ trợ file Excel (.xlsx, .xls)!', 'warning');
            return;
        }

        try {
            Utils.showLoading();
            
            const token = Utils.getToken();
            const url = CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.METER_READINGS_IMPORT;
            
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    Utils.removeToken();
                    Utils.removeUser();
                    window.location.href = '../index.html';
                    return;
                }
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Import result:', result);
            
            // Handle different response formats
            let importData = null;
            if (result && typeof result === 'object') {
                if (result.importedCount !== undefined) {
                    importData = result;
                } else if (result.data) {
                    importData = result.data;
                } else if (result.success && result.data) {
                    importData = result.data;
                }
            }
            
            if (importData) {
                const importedCount = importData.importedCount || 0;
                const errorCount = importData.errorCount || 0;
                const errors = importData.errors || [];
                const totalErrors = importData.totalErrors || errors.length;
                
                let message = `Import hoàn thành!\n` +
                    `- Đã import: ${importedCount} bản ghi\n` +
                    `- Lỗi: ${errorCount} bản ghi`;
                
                if (errors.length > 0) {
                    message += `\n\nCác lỗi (hiển thị tối đa 10):\n${errors.slice(0, 10).join('\n')}`;
                    if (totalErrors > 10) {
                        message += `\n... và ${totalErrors - 10} lỗi khác`;
                    }
                }
                
                alert(message);
                
                if (importedCount > 0) {
                    await this.loadMeterReadings();
                }
            } else {
                Utils.showAlert('Import hoàn thành!', 'success');
                await this.loadMeterReadings();
            }
            
        } catch (error) {
            console.error('Error importing Excel:', error);
            Utils.showAlert('Lỗi import Excel: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function openMeterReadingModal() {
    window.adminMeterReadings.openModal();
}

function closeMeterReadingModal() {
    window.adminMeterReadings.closeModal();
}

function saveMeterReading() {
    window.adminMeterReadings.saveMeterReading();
}

async function editMeterReading(readingId) {
    try {
        Utils.showLoading();
        
        const response = await $api.get(CONFIG.ENDPOINTS.METER_READING_BY_ID(readingId));
        console.log('Meter reading response:', response);
        
        // Handle different response formats
        let reading = null;
        if (response && typeof response === 'object') {
            if (response.maChiSo || response.MaChiSo) {
                reading = response;
            } else if (response.data) {
                reading = response.data;
            } else if (response.success && response.data) {
                reading = response.data;
            }
        }
        
        if (!reading) {
            throw new Error('Không tìm thấy thông tin chỉ số điện nước');
        }
        
        window.adminMeterReadings.openModal(reading);
    } catch (error) {
        console.error('Error loading meter reading:', error);
        Utils.showAlert('Lỗi tải thông tin chỉ số điện nước: ' + error.message, 'danger');
    } finally {
        Utils.hideLoading();
    }
}

function deleteMeterReading(readingId) {
    window.adminMeterReadings.deleteMeterReading(readingId);
}

function viewMeterReadingDetails(readingId) {
    window.adminMeterReadings.viewDetails(readingId);
}

function downloadTemplate() {
    window.adminMeterReadings.downloadTemplate();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (file) {
        window.adminMeterReadings.importExcel(file);
    }
    // Reset input để có thể chọn lại cùng file
    event.target.value = '';
}

async function filterMeterReadings() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const roomFilter = document.getElementById('roomFilter')?.value || '';
    const monthFilter = document.getElementById('monthFilter')?.value || '';
    const yearFilter = document.getElementById('yearFilter')?.value || '';
    
    // Nếu có filter theo phòng, gọi API by-room
    if (roomFilter) {
        try {
            Utils.showLoading();
            const response = await $api.get(CONFIG.ENDPOINTS.METER_READINGS_BY_ROOM(roomFilter));
            
            let readingsArray = [];
            if (Array.isArray(response)) {
                readingsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    readingsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    readingsArray = response.data;
                }
            }
            
            // Filter thêm theo month, year và search (client-side)
            let filtered = readingsArray.filter(reading => {
                const maChiSo = (reading.maChiSo || reading.MaChiSo || '').toString();
                const thang = reading.thang || reading.Thang || 0;
                const nam = reading.nam || reading.Nam || 0;
                
                const room = window.adminMeterReadings.rooms.find(r => (r.maPhong || r.MaPhong) === (reading.maPhong || reading.MaPhong));
                let roomInfo = '';
                if (room) {
                    const soPhong = room.soPhong || room.SoPhong || '';
                    const buildingName = room.tenToaNha || room.TenToaNha || '';
                    roomInfo = buildingName ? `${soPhong} ${buildingName}`.toLowerCase() : soPhong.toLowerCase();
                }
                
                const matchSearch = !searchInput || 
                    roomInfo.includes(searchInput) ||
                    maChiSo.includes(searchInput);
                
                const matchMonth = !monthFilter || thang.toString() === monthFilter.toString();
                const matchYear = !yearFilter || nam.toString() === yearFilter.toString();
                
                return matchSearch && matchMonth && matchYear;
            });
            
            window.adminMeterReadings.renderMeterReadingsTable(filtered);
        } catch (error) {
            console.error('Error filtering meter readings by room:', error);
            Utils.showAlert('Lỗi lọc chỉ số theo phòng: ' + error.message, 'danger');
            filterMeterReadingsClientSide();
        } finally {
            Utils.hideLoading();
        }
    }
    // Nếu có filter theo tháng/năm (không có roomFilter), gọi API by-month
    else if (monthFilter && yearFilter) {
        try {
            Utils.showLoading();
            const response = await $api.get(CONFIG.ENDPOINTS.METER_READINGS_BY_MONTH(monthFilter, yearFilter));
            
            let readingsArray = [];
            if (Array.isArray(response)) {
                readingsArray = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    readingsArray = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    readingsArray = response.data;
                }
            }
            
            // Filter thêm theo search (client-side)
            let filtered = readingsArray.filter(reading => {
                const maChiSo = (reading.maChiSo || reading.MaChiSo || '').toString();
                const room = window.adminMeterReadings.rooms.find(r => (r.maPhong || r.MaPhong) === (reading.maPhong || reading.MaPhong));
                let roomInfo = '';
                if (room) {
                    const soPhong = room.soPhong || room.SoPhong || '';
                    const buildingName = room.tenToaNha || room.TenToaNha || '';
                    roomInfo = buildingName ? `${soPhong} ${buildingName}`.toLowerCase() : soPhong.toLowerCase();
                }
                
                const matchSearch = !searchInput || 
                    roomInfo.includes(searchInput) ||
                    maChiSo.includes(searchInput);
                
                return matchSearch;
            });
            
            window.adminMeterReadings.renderMeterReadingsTable(filtered);
        } catch (error) {
            console.error('Error filtering meter readings by month:', error);
            Utils.showAlert('Lỗi lọc chỉ số theo tháng/năm: ' + error.message, 'danger');
            filterMeterReadingsClientSide();
        } finally {
            Utils.hideLoading();
        }
    }
    // Nếu không có filter đặc biệt, filter client-side như cũ
    else {
        filterMeterReadingsClientSide();
    }
}

function filterMeterReadingsClientSide() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const roomFilter = document.getElementById('roomFilter')?.value || '';
    const monthFilter = document.getElementById('monthFilter')?.value || '';
    const yearFilter = document.getElementById('yearFilter')?.value || '';
    
    let filtered = window.adminMeterReadings.meterReadings.filter(reading => {
        // Handle both camelCase and PascalCase
        const maChiSo = (reading.maChiSo || reading.MaChiSo || '').toString();
        const maPhong = reading.maPhong || reading.MaPhong;
        const thang = reading.thang || reading.Thang || 0;
        const nam = reading.nam || reading.Nam || 0;
        
        const room = window.adminMeterReadings.rooms.find(r => (r.maPhong || r.MaPhong) === maPhong);
        let roomInfo = '';
        if (room) {
            const soPhong = room.soPhong || room.SoPhong || '';
            const buildingName = room.tenToaNha || room.TenToaNha || '';
            roomInfo = buildingName ? `${soPhong} ${buildingName}`.toLowerCase() : soPhong.toLowerCase();
        }
        
        const matchSearch = !searchInput || 
            roomInfo.includes(searchInput) ||
            maChiSo.includes(searchInput);
        
        const matchRoom = !roomFilter || maPhong.toString() === roomFilter.toString();
        const matchMonth = !monthFilter || thang.toString() === monthFilter.toString();
        const matchYear = !yearFilter || nam.toString() === yearFilter.toString();
        
        return matchSearch && matchRoom && matchMonth && matchYear;
    });
    
    window.adminMeterReadings.renderMeterReadingsTable(filtered);
}

async function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('roomFilter').value = '';
    document.getElementById('monthFilter').value = '';
    document.getElementById('yearFilter').value = '';
    // Reload all meter readings from server
    await window.adminMeterReadings.loadMeterReadings();
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
    window.adminMeterReadings = new AdminMeterReadings();
});
