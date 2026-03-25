// Admin Reports Module
class AdminReports {
    constructor() {
        this.currentReport = null;
        this.calculateType = null; // 'electricity' or 'water'
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        
        // Set current year and month as default
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const yearFilter = document.getElementById('yearFilter');
        const monthFilter = document.getElementById('monthFilter');
        if (yearFilter) yearFilter.value = currentYear;
        if (monthFilter) monthFilter.value = currentMonth;
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

    async loadReport() {
        const reportType = document.getElementById('reportType')?.value;
        const month = document.getElementById('monthFilter')?.value;
        const year = document.getElementById('yearFilter')?.value;

        if (!year) {
            Utils.showAlert('Vui lòng chọn năm!', 'warning');
            return;
        }

        // Occupancy, Revenue, Electricity-Water, Violations require month
        if (['occupancy', 'revenue', 'electricity-water', 'violations'].includes(reportType)) {
            if (!month) {
                Utils.showAlert('Vui lòng chọn tháng!', 'warning');
                return;
            }
        }

        try {
            Utils.showLoading();

            let data;
            let title = '';

            // Handle different response formats
            const extractData = (response) => {
                if (Array.isArray(response)) {
                    return response;
                } else if (response && typeof response === 'object') {
                    if (Array.isArray(response.data)) {
                        return response.data;
                    } else if (response.success && Array.isArray(response.data)) {
                        return response.data;
                    }
                }
                return [];
            };

            switch (reportType) {
                case 'occupancy':
                    title = `Báo Cáo Tỷ Lệ Lấp Đầy - Tháng ${month}/${year}`;
                    const occupancyResponse = await $api.get(CONFIG.ENDPOINTS.REPORT_OCCUPANCY_RATE, {
                        thang: parseInt(month),
                        nam: parseInt(year)
                    });
                    data = extractData(occupancyResponse);
                    this.renderOccupancyReport(data);
                    break;

                case 'revenue':
                    title = `Báo Cáo Doanh Thu - Tháng ${month}/${year}`;
                    const revenueResponse = await $api.get(CONFIG.ENDPOINTS.REPORT_REVENUE, {
                        thang: parseInt(month),
                        nam: parseInt(year)
                    });
                    data = extractData(revenueResponse);
                    this.renderRevenueReport(data);
                    break;

                case 'debt':
                    title = month ? `Báo Cáo Công Nợ - Tháng ${month}/${year}` : `Báo Cáo Công Nợ - Năm ${year}`;
                    const debtParams = { nam: parseInt(year) };
                    if (month) debtParams.thang = parseInt(month);
                    const debtResponse = await $api.get(CONFIG.ENDPOINTS.REPORT_DEBT, debtParams);
                    data = extractData(debtResponse);
                    this.renderDebtReport(data);
                    break;

                case 'electricity-water':
                    title = `Báo Cáo Điện Nước - Tháng ${month}/${year}`;
                    const ewResponse = await $api.get(CONFIG.ENDPOINTS.REPORT_ELECTRICITY_WATER, {
                        thang: parseInt(month),
                        nam: parseInt(year)
                    });
                    data = extractData(ewResponse);
                    this.renderElectricityWaterReport(data);
                    break;

                case 'violations':
                    title = `Báo Cáo Kỷ Luật - Tháng ${month}/${year}`;
                    const violationsResponse = await $api.get(CONFIG.ENDPOINTS.REPORT_VIOLATIONS, {
                        thang: parseInt(month),
                        nam: parseInt(year)
                    });
                    data = extractData(violationsResponse);
                    this.renderViolationsReport(data);
                    break;
            }

            const reportTitle = document.getElementById('reportTitle');
            if (reportTitle) {
                reportTitle.innerHTML = `<i class="fas fa-chart-bar"></i> ${title}`;
            }
            this.currentReport = { type: reportType, data: data };

        } catch (error) {
            console.error('Error loading report:', error);
            Utils.showAlert('Lỗi tải báo cáo: ' + error.message, 'danger');
            const reportContent = document.getElementById('reportContent');
            if (reportContent) {
                reportContent.innerHTML = `
                    <div class="text-center" style="padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                        <p>Không thể tải báo cáo. Vui lòng thử lại.</p>
                        <button class="btn btn-primary" onclick="window.adminReports.loadReport()" style="margin-top: 1rem;">
                            <i class="fas fa-redo"></i> Thử lại
                        </button>
                    </div>
                `;
            }
        } finally {
            Utils.hideLoading();
        }
    }

    renderOccupancyReport(data) {
        const reportContent = document.getElementById('reportContent');
        if (!reportContent) return;

        if (!Array.isArray(data) || data.length === 0) {
            reportContent.innerHTML = `
                <div class="text-center" style="padding: 2rem;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; color: #3498db; margin-bottom: 1rem;"></i>
                    <p>Không có dữ liệu cho báo cáo này.</p>
                </div>
            `;
            return;
        }

        const table = `
            <div class="table-container">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Tòa nhà</th>
                            <th>Tổng số phòng</th>
                            <th>Số phòng có sinh viên</th>
                            <th>Tỷ lệ lấp đầy</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => {
                            // Handle both camelCase and PascalCase
                            const tenToaNha = item.tenToaNha || item.TenToaNha || 'N/A';
                            const tongSoPhong = item.tongSoPhong || item.TongSoPhong || 0;
                            const soPhongCoSinhVien = item.soPhongCoSinhVien || item.SoPhongCoSinhVien || 0;
                            const tyLeLapDay = parseFloat(item.tyLeLapDay || item.TyLeLapDay || 0);
                            
                            let badgeClass = 'badge-danger';
                            if (tyLeLapDay >= 80) badgeClass = 'badge-success';
                            else if (tyLeLapDay >= 50) badgeClass = 'badge-warning';

                            return `
                                <tr>
                                    <td data-label="Tòa nhà"><strong>${tenToaNha}</strong></td>
                                    <td data-label="Tổng số phòng">${tongSoPhong}</td>
                                    <td data-label="Số phòng có sinh viên">${soPhongCoSinhVien}</td>
                                    <td data-label="Tỷ lệ lấp đầy">
                                        <span class="badge ${badgeClass}">
                                            ${tyLeLapDay.toFixed(2)}%
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        reportContent.innerHTML = table;
    }

    renderRevenueReport(data) {
        const reportContent = document.getElementById('reportContent');
        if (!reportContent) return;

        if (!Array.isArray(data) || data.length === 0) {
            reportContent.innerHTML = `
                <div class="text-center" style="padding: 2rem;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; color: #3498db; margin-bottom: 1rem;"></i>
                    <p>Không có dữ liệu cho báo cáo này.</p>
                </div>
            `;
            return;
        }

        const total = data[0]; // Usually one record per month
        // Handle both camelCase and PascalCase
        const tongSoHoaDon = total.tongSoHoaDon || total.TongSoHoaDon || 0;
        const tongDoanhThu = parseFloat(total.tongDoanhThu || total.TongDoanhThu || 0);
        const doanhThuDaThu = parseFloat(total.doanhThuDaThu || total.DoanhThuDaThu || 0);
        const doanhThuChuaThu = parseFloat(total.doanhThuChuaThu || total.DoanhThuChuaThu || 0);

        const stats = `
            <div class="stats-grid" style="margin-bottom: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div class="stat-card info" style="background: #e3f2fd; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div class="stat-icon info" style="font-size: 2rem; color: #2196f3; margin-bottom: 0.5rem;">
                        <i class="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div class="stat-value" style="font-size: 2rem; font-weight: bold; color: #1976d2;">${tongSoHoaDon}</div>
                    <div class="stat-label" style="color: #666; margin-top: 0.5rem;">Tổng số hóa đơn</div>
                </div>
                <div class="stat-card success" style="background: #e8f5e9; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div class="stat-icon success" style="font-size: 2rem; color: #4caf50; margin-bottom: 0.5rem;">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-value" style="font-size: 1.5rem; font-weight: bold; color: #388e3c;">${Utils.formatCurrency(tongDoanhThu)}</div>
                    <div class="stat-label" style="color: #666; margin-top: 0.5rem;">Tổng doanh thu</div>
                </div>
                <div class="stat-card success" style="background: #e8f5e9; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div class="stat-icon success" style="font-size: 2rem; color: #4caf50; margin-bottom: 0.5rem;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-value" style="font-size: 1.5rem; font-weight: bold; color: #388e3c;">${Utils.formatCurrency(doanhThuDaThu)}</div>
                    <div class="stat-label" style="color: #666; margin-top: 0.5rem;">Đã thu</div>
                </div>
                <div class="stat-card danger" style="background: #ffebee; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div class="stat-icon danger" style="font-size: 2rem; color: #f44336; margin-bottom: 0.5rem;">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="stat-value" style="font-size: 1.5rem; font-weight: bold; color: #c62828;">${Utils.formatCurrency(doanhThuChuaThu)}</div>
                    <div class="stat-label" style="color: #666; margin-top: 0.5rem;">Chưa thu</div>
                </div>
            </div>
        `;

        reportContent.innerHTML = stats;
    }

    renderDebtReport(data) {
        const reportContent = document.getElementById('reportContent');
        if (!reportContent) return;

        if (!Array.isArray(data) || data.length === 0) {
            reportContent.innerHTML = `
                <div class="text-center" style="padding: 2rem;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; color: #3498db; margin-bottom: 1rem;"></i>
                    <p>Không có dữ liệu công nợ.</p>
                </div>
            `;
            return;
        }

        // Calculate totals
        let totalDebt = 0;
        let totalBills = 0;
        data.forEach(item => {
            // Handle both camelCase and PascalCase
            totalDebt += parseFloat(item.tongCongNo || item.TongCongNo || 0);
            totalBills += parseInt(item.soHoaDonChuaThanhToan || item.SoHoaDonChuaThanhToan || 0);
        });

        const summary = `
            <div class="stats-grid" style="margin-bottom: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div class="stat-card warning" style="background: #fff3e0; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div class="stat-icon warning" style="font-size: 2rem; color: #ff9800; margin-bottom: 0.5rem;">
                        <i class="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div class="stat-value" style="font-size: 2rem; font-weight: bold; color: #f57c00;">${totalBills}</div>
                    <div class="stat-label" style="color: #666; margin-top: 0.5rem;">Tổng số hóa đơn nợ</div>
                </div>
                <div class="stat-card danger" style="background: #ffebee; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div class="stat-icon danger" style="font-size: 2rem; color: #f44336; margin-bottom: 0.5rem;">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-value" style="font-size: 1.5rem; font-weight: bold; color: #c62828;">${Utils.formatCurrency(totalDebt)}</div>
                    <div class="stat-label" style="color: #666; margin-top: 0.5rem;">Tổng công nợ</div>
                </div>
            </div>
        `;

        const table = `
            <div class="table-container">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Sinh viên</th>
                            <th>MSSV</th>
                            <th>Lớp</th>
                            <th>Khoa</th>
                            <th>Phòng</th>
                            <th>Tòa nhà</th>
                            <th>Số hóa đơn nợ</th>
                            <th>Tổng nợ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => {
                            // Handle both camelCase and PascalCase
                            const hoTen = item.hoTen || item.HoTen || 'N/A';
                            const mssv = item.mssv || item.MSSV || 'N/A';
                            const lop = item.lop || item.Lop || 'N/A';
                            const khoa = item.khoa || item.Khoa || 'N/A';
                            const soPhong = item.soPhong || item.SoPhong || 'N/A';
                            const tenToaNha = item.tenToaNha || item.TenToaNha || 'N/A';
                            const soHoaDonChuaThanhToan = item.soHoaDonChuaThanhToan || item.SoHoaDonChuaThanhToan || 0;
                            const tongCongNo = parseFloat(item.tongCongNo || item.TongCongNo || 0);

                            return `
                                <tr>
                                    <td data-label="Sinh viên"><strong>${hoTen}</strong></td>
                                    <td data-label="MSSV">${mssv}</td>
                                    <td data-label="Lớp">${lop}</td>
                                    <td data-label="Khoa">${khoa}</td>
                                    <td data-label="Phòng">${soPhong}</td>
                                    <td data-label="Tòa nhà">${tenToaNha}</td>
                                    <td data-label="Số hóa đơn nợ">${soHoaDonChuaThanhToan}</td>
                                    <td data-label="Tổng nợ"><strong class="text-danger">${Utils.formatCurrency(tongCongNo)}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        reportContent.innerHTML = summary + table;
    }

    renderElectricityWaterReport(data) {
        const reportContent = document.getElementById('reportContent');
        if (!reportContent) return;

        if (!Array.isArray(data) || data.length === 0) {
            reportContent.innerHTML = `
                <div class="text-center" style="padding: 2rem;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; color: #3498db; margin-bottom: 1rem;"></i>
                    <p>Không có dữ liệu cho báo cáo này.</p>
                </div>
            `;
            return;
        }

        const table = `
            <div class="table-container">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Tòa nhà</th>
                            <th>Tổng số phòng</th>
                            <th>Tổng số điện (kWh)</th>
                            <th>Tổng số nước (m³)</th>
                            <th>Trung bình điện/phòng</th>
                            <th>Trung bình nước/phòng</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => {
                            // Handle both camelCase and PascalCase
                            const tenToaNha = item.tenToaNha || item.TenToaNha || 'N/A';
                            const tongSoPhong = item.tongSoPhong || item.TongSoPhong || 0;
                            const tongSoDien = item.tongSoDien ?? item.TongSoDien ?? null;
                            const tongSoNuoc = item.tongSoNuoc ?? item.TongSoNuoc ?? null;
                            const trungBinhDien = item.trungBinhDien ?? item.TrungBinhDien ?? null;
                            const trungBinhNuoc = item.trungBinhNuoc ?? item.TrungBinhNuoc ?? null;

                            return `
                                <tr>
                                    <td data-label="Tòa nhà"><strong>${tenToaNha}</strong></td>
                                    <td data-label="Tổng số phòng">${tongSoPhong}</td>
                                    <td data-label="Tổng số điện">${tongSoDien !== null ? tongSoDien : 'N/A'}</td>
                                    <td data-label="Tổng số nước">${tongSoNuoc !== null ? tongSoNuoc : 'N/A'}</td>
                                    <td data-label="TB điện/phòng">${trungBinhDien !== null ? trungBinhDien.toFixed(2) + ' kWh' : 'N/A'}</td>
                                    <td data-label="TB nước/phòng">${trungBinhNuoc !== null ? trungBinhNuoc.toFixed(2) + ' m³' : 'N/A'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        reportContent.innerHTML = table;
    }

    renderViolationsReport(data) {
        const reportContent = document.getElementById('reportContent');
        if (!reportContent) return;

        if (!Array.isArray(data) || data.length === 0) {
            reportContent.innerHTML = `
                <div class="text-center" style="padding: 2rem;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; color: #3498db; margin-bottom: 1rem;"></i>
                    <p>Không có dữ liệu kỷ luật trong tháng này.</p>
                </div>
            `;
            return;
        }

        const table = `
            <div class="table-container">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>MSSV</th>
                            <th>Sinh viên</th>
                            <th>Phòng</th>
                            <th>Tòa nhà</th>
                            <th>Loại vi phạm</th>
                            <th>Mô tả</th>
                            <th>Ngày vi phạm</th>
                            <th>Mức phạt</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => {
                            // Handle both camelCase and PascalCase
                            const mssv = item.mssv || item.MSSV || 'N/A';
                            const hoTen = item.hoTen || item.HoTen || 'N/A';
                            const soPhong = item.soPhong || item.SoPhong || 'N/A';
                            const tenToaNha = item.tenToaNha || item.TenToaNha || 'N/A';
                            const loaiViPham = item.loaiViPham || item.LoaiViPham || 'N/A';
                            const moTa = item.moTa || item.MoTa || '(Không có)';
                            const ngayViPham = item.ngayViPham || item.NgayViPham;
                            const mucPhat = parseFloat(item.mucPhat || item.MucPhat || 0);
                            const trangThai = item.trangThai || item.TrangThai || 'N/A';

                            let statusClass = 'badge-secondary';
                            if (trangThai === 'Chờ xử lý') statusClass = 'badge-warning';
                            else if (trangThai === 'Đã xử lý') statusClass = 'badge-success';
                            else if (trangThai === 'Đã hủy') statusClass = 'badge-secondary';

                            return `
                                <tr>
                                    <td data-label="MSSV">${mssv}</td>
                                    <td data-label="Sinh viên"><strong>${hoTen}</strong></td>
                                    <td data-label="Phòng">${soPhong}</td>
                                    <td data-label="Tòa nhà">${tenToaNha}</td>
                                    <td data-label="Loại vi phạm">${loaiViPham}</td>
                                    <td data-label="Mô tả">${moTa}</td>
                                    <td data-label="Ngày vi phạm">${ngayViPham ? Utils.formatDate(ngayViPham) : 'N/A'}</td>
                                    <td data-label="Mức phạt"><strong class="text-danger">${Utils.formatCurrency(mucPhat)}</strong></td>
                                    <td data-label="Trạng thái"><span class="badge ${statusClass}">${trangThai}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        reportContent.innerHTML = table;
    }

    openCalculateModal(type) {
        this.calculateType = type;
        const modal = document.getElementById('calculateModal');
        const modalTitleText = document.getElementById('calculateModalTitleText');
        const amountLabel = document.getElementById('calculateAmountLabel');
        const calculateForm = document.getElementById('calculateForm');
        
        if (type === 'electricity') {
            if (modalTitleText) modalTitleText.textContent = 'Tính tiền điện';
            if (amountLabel) amountLabel.textContent = 'Số kWh';
        } else if (type === 'water') {
            if (modalTitleText) modalTitleText.textContent = 'Tính tiền nước';
            if (amountLabel) amountLabel.textContent = 'Số m³';
        }
        
        // Reset form
        if (calculateForm) calculateForm.reset();
        const calculateResultGroup = document.getElementById('calculateResultGroup');
        if (calculateResultGroup) calculateResultGroup.style.display = 'none';
        
        // Set default month and year
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const calculateYear = document.getElementById('calculateYear');
        const calculateMonth = document.getElementById('calculateMonth');
        if (calculateYear) calculateYear.value = currentYear;
        if (calculateMonth) calculateMonth.value = currentMonth;
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeCalculateModal() {
        const modal = document.getElementById('calculateModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.calculateType = null;
    }

    async calculateAmount() {
        const form = document.getElementById('calculateForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        const amount = parseInt(document.getElementById('calculateAmount').value, 10);
        const month = parseInt(document.getElementById('calculateMonth').value, 10);
        const year = parseInt(document.getElementById('calculateYear').value, 10);

        if (!this.calculateType) {
            Utils.showAlert('Vui lòng chọn loại tính toán!', 'warning');
            return;
        }

        try {
            Utils.showLoading();

            let endpoint;
            if (this.calculateType === 'electricity') {
                endpoint = `${CONFIG.ENDPOINTS.REPORT_CALCULATE_ELECTRICITY}?soKwh=${amount}&thang=${month}&nam=${year}`;
            } else if (this.calculateType === 'water') {
                endpoint = `${CONFIG.ENDPOINTS.REPORT_CALCULATE_WATER}?soKhoi=${amount}&thang=${month}&nam=${year}`;
            } else {
                throw new Error('Loại tính toán không hợp lệ');
            }

            const response = await $api.post(endpoint, {});

            // Handle different response formats
            let result = null;
            if (response && typeof response === 'object') {
                if (Array.isArray(response)) {
                    result = response[0];
                } else if (Array.isArray(response.data)) {
                    result = response.data[0];
                } else if (response.success && Array.isArray(response.data)) {
                    result = response.data[0];
                }
            }

            if (result) {
                const tongTienDien = result.tongTienDien || result.TongTienDien;
                const tongTienNuoc = result.tongTienNuoc || result.TongTienNuoc;
                const amount = tongTienDien !== undefined ? tongTienDien : tongTienNuoc;

                const calculateResultGroup = document.getElementById('calculateResultGroup');
                const calculateResultText = document.getElementById('calculateResultText');
                if (calculateResultGroup) calculateResultGroup.style.display = 'block';
                if (calculateResultText) {
                    calculateResultText.textContent = Utils.formatCurrency(amount || 0);
                }
            } else {
                throw new Error('Không nhận được kết quả tính toán');
            }

        } catch (error) {
            console.error('Error calculating:', error);
            Utils.showAlert('Lỗi tính toán: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async generateMonthlyBills() {
        const month = document.getElementById('monthFilter')?.value;
        const year = document.getElementById('yearFilter')?.value;

        if (!month || !year) {
            Utils.showAlert('Vui lòng chọn tháng và năm!', 'warning');
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn tạo hóa đơn cho tháng ${month}/${year}?`)) {
            return;
        }

        try {
            Utils.showLoading();
            
            const endpoint = `${CONFIG.ENDPOINTS.REPORT_GENERATE_MONTHLY_BILLS}?thang=${parseInt(month)}&nam=${parseInt(year)}`;
            const response = await $api.post(endpoint, {});

            // Handle response
            let result = null;
            if (response && typeof response === 'object') {
                if (Array.isArray(response)) {
                    result = response;
                } else if (Array.isArray(response.data)) {
                    result = response.data;
                } else if (response.success && Array.isArray(response.data)) {
                    result = response.data;
                }
            }

            let message = 'Tạo hóa đơn thành công!';
            if (result && result.length > 0) {
                const ketQua = result[0]?.ketQua || result[0]?.KetQua || '';
                if (ketQua) message = ketQua;
            }

            Utils.showAlert(message, 'success');
            
            // Reload revenue report if it's currently displayed
            setTimeout(() => {
                if (this.currentReport && this.currentReport.type === 'revenue') {
                    this.loadReport();
                }
            }, 1500);

        } catch (error) {
            console.error('Error generating monthly bills:', error);
            Utils.showAlert('Lỗi tạo hóa đơn: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Global functions
function onReportTypeChange() {
    const reportType = document.getElementById('reportType')?.value;
    const monthFilter = document.getElementById('monthFilter');
    
    // Debt report doesn't require month (optional)
    if (reportType === 'debt') {
        if (monthFilter) {
            monthFilter.disabled = false;
            monthFilter.value = '';
        }
    } else {
        if (monthFilter) {
            monthFilter.disabled = false;
            if (!monthFilter.value) {
                monthFilter.value = new Date().getMonth() + 1;
            }
        }
    }
}

function loadReport() {
    window.adminReports.loadReport();
}

function generateMonthlyBills() {
    window.adminReports.generateMonthlyBills();
}

function openCalculateModal(type) {
    window.adminReports.openCalculateModal(type);
}

function closeCalculateModal() {
    window.adminReports.closeCalculateModal();
}

function calculateAmount() {
    window.adminReports.calculateAmount();
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
    window.adminReports = new AdminReports();
});
