// Reports - Admin Báo cáo với React Query + Recharts
import React, { useState } from 'react';
import {
  useReportOccupancy,
  useReportRevenue,
  useReportDebt,
  useReportElectricityWater,
  useReportViolations,
} from '../../hooks/useReports';
import { formatCurrency, getCurrentMonth, getCurrentYear } from '../../utils/formatters';
import Alert from '../../components/common/Alert';
import DataTable from '../../components/common/DataTable';
import { OccupancyAreaChart, RevenueBarChart, ElectricityWaterLineChart } from '../../components/charts/OccupancyChart';

type ReportTab = 'occupancy' | 'revenue' | 'debt' | 'electricity' | 'violations';

const TABS: { key: ReportTab; label: string; icon: string }[] = [
  { key: 'occupancy', label: 'Tỷ lệ lấp đầy', icon: 'fa-chart-pie' },
  { key: 'revenue', label: 'Doanh thu', icon: 'fa-dollar-sign' },
  { key: 'debt', label: 'Công nợ', icon: 'fa-exclamation-circle' },
  { key: 'electricity', label: 'Điện/Nước', icon: 'fa-bolt' },
  { key: 'violations', label: 'Vi phạm', icon: 'fa-gavel' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('occupancy');
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [filterYear, setFilterYear] = useState(getCurrentYear());

  // React Query hooks
  const { data: occupancy = [], isLoading: loadingOcc } = useReportOccupancy(filterMonth, filterYear);
  const { data: revenue = [], isLoading: loadingRev } = useReportRevenue(filterMonth, filterYear);
  const { data: debt = [], isLoading: loadingDebt } = useReportDebt(filterMonth, filterYear);
  const { data: elecWater = [], isLoading: loadingEw } = useReportElectricityWater(filterMonth, filterYear);
  const { data: violations = [], isLoading: loadingViol } = useReportViolations(filterYear);

  // Summary stats
  const totalRooms = occupancy.reduce((s, r) => s + r.tongSoPhong, 0);
  const occupiedRooms = occupancy.reduce((s, r) => s + r.soPhongCoSinhVien, 0);
  const avgOccupancy = totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(1) : '0';
  const totalRevenue = revenue.reduce((s, r) => s + r.tongDoanhThu, 0);
  const totalDebt = debt.reduce((s, r) => s + r.tongCongNo, 0);
  const totalStudents = debt.length;

  const isLoading =
    (activeTab === 'occupancy' && loadingOcc) ||
    (activeTab === 'revenue' && loadingRev) ||
    (activeTab === 'debt' && loadingDebt) ||
    (activeTab === 'electricity' && loadingEw) ||
    (activeTab === 'violations' && loadingViol);

  // Columns
  const occupancyCols = [
    { key: 'tenToaNha', label: 'Tòa nhà' },
    { key: 'tongSoPhong', label: 'Tổng phòng' },
    { key: 'soPhongCoSinhVien', label: 'Đã thuê' },
    { key: 'tyLeLapDay', label: 'Tỷ lệ (%)', render: (v: number) => (v * 100).toFixed(1) + '%' },
  ];

  const revenueCols = [
    { key: 'thang', label: 'Tháng', render: (v: number) => `T${v}` },
    { key: 'nam', label: 'Năm' },
    { key: 'tongSoHoaDon', label: 'Số hóa đơn' },
    { key: 'tongDoanhThu', label: 'Tổng DT', render: (v: number) => formatCurrency(v) },
    { key: 'doanhThuDaThu', label: 'Đã thu', render: (v: number) => formatCurrency(v) },
    { key: 'doanhThuChuaThu', label: 'Chưa thu', render: (v: number) => formatCurrency(v) },
  ];

  const debtCols = [
    { key: 'hoTen', label: 'Sinh viên' },
    { key: 'mssv', label: 'MSSV' },
    { key: 'soPhong', label: 'Phòng' },
    { key: 'tenToaNha', label: 'Tòa nhà' },
    { key: 'soHoaDonChuaThanhToan', label: 'Số HĐ chưa TT' },
    { key: 'tongCongNo', label: 'Tổng công nợ', render: (v: number) => formatCurrency(v) },
  ];

  const ewCols = [
    { key: 'tenToaNha', label: 'Tòa nhà' },
    { key: 'tongSoPhong', label: 'Số phòng' },
    { key: 'tongSoDien', label: 'Tổng điện (kWh)' },
    { key: 'tongSoNuoc', label: 'Tổng nước (m³)' },
    { key: 'trungBinhDien', label: 'TB điện', render: (v?: number) => (v != null ? v.toFixed(2) : '—') },
    { key: 'trungBinhNuoc', label: 'TB nước', render: (v?: number) => (v != null ? v.toFixed(2) : '—') },
  ];

  const violationCols = [
    { key: 'hoTen', label: 'Sinh viên' },
    { key: 'mssv', label: 'MSSV' },
    { key: 'soPhong', label: 'Phòng' },
    { key: 'loaiViPham', label: 'Loại VP' },
    { key: 'ngayViPham', label: 'Ngày VP' },
    { key: 'mucPhat', label: 'Mức phạt', render: (v: number) => formatCurrency(v) },
    { key: 'trangThai', label: 'Trạng thái' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-chart-bar"></i> Báo cáo - Thống kê</h1>
      </div>

      {/* Filter bar */}
      <div className="card mb-3">
        <div className="card-body d-flex align-items-center gap-3 flex-wrap">
          <label className="fw-bold">Lọc:</label>
          <div className="d-flex align-items-center gap-2">
            <label>Tháng:</label>
            <input type="number" className="form-control" style={{ width: '100px' }} min="1" max="12"
              value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} />
          </div>
          <div className="d-flex align-items-center gap-2">
            <label>Năm:</label>
            <input type="number" className="form-control" style={{ width: '120px' }} min="2020"
              value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid mb-3">
        <div className="stat-card" style={{ borderLeft: '4px solid #4f46e5', background: '#eef2ff' }}>
          <div className="stat-icon" style={{ color: '#4f46e5' }}><i className="fas fa-chart-pie"></i></div>
          <div><span className="stat-value">{avgOccupancy}%</span><span className="stat-label">Tỷ lệ lấp đầy TB</span></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #22c55e', background: '#f0fdf4' }}>
          <div className="stat-icon" style={{ color: '#22c55e' }}><i className="fas fa-dollar-sign"></i></div>
          <div><span className="stat-value">{formatCurrency(totalRevenue)}</span><span className="stat-label">Tổng doanh thu</span></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444', background: '#fef2f2' }}>
          <div className="stat-icon" style={{ color: '#ef4444' }}><i className="fas fa-exclamation-circle"></i></div>
          <div><span className="stat-value">{formatCurrency(totalDebt)}</span><span className="stat-label">Tổng công nợ</span></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb' }}>
          <div className="stat-icon" style={{ color: '#f59e0b' }}><i className="fas fa-users"></i></div>
          <div><span className="stat-value">{totalStudents}</span><span className="stat-label">SV nợ tiền</span></div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {TABS.map((tab) => (
          <li key={tab.key} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`fas ${tab.icon}`}></i> {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Content */}
      {isLoading ? (
        <div className="text-center p-5"><i className="fas fa-spinner fa-spin fa-2x"></i></div>
      ) : (
        <>
          {/* Occupancy: chart + table */}
          {activeTab === 'occupancy' && (
            <>
              <div className="card mb-3">
                <div className="card-body">
                  <OccupancyAreaChart data={occupancy} />
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <DataTable columns={occupancyCols} data={occupancy} emptyMessage="Không có dữ liệu tỷ lệ lấp đầy" />
                </div>
              </div>
            </>
          )}

          {/* Revenue: chart + table */}
          {activeTab === 'revenue' && (
            <>
              <div className="card mb-3">
                <div className="card-body">
                  <RevenueBarChart data={revenue} />
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <DataTable columns={revenueCols} data={revenue} emptyMessage="Không có dữ liệu doanh thu" />
                </div>
              </div>
            </>
          )}

          {/* Debt */}
          {activeTab === 'debt' && (
            <div className="card">
              <div className="card-body">
                <DataTable columns={debtCols} data={debt} emptyMessage="Không có công nợ" />
              </div>
            </div>
          )}

          {/* Electricity/Water: chart + table */}
          {activeTab === 'electricity' && (
            <>
              <div className="card mb-3">
                <div className="card-body">
                  <ElectricityWaterLineChart data={elecWater} />
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <DataTable columns={ewCols} data={elecWater} emptyMessage="Không có dữ liệu điện nước" />
                </div>
              </div>
            </>
          )}

          {/* Violations */}
          {activeTab === 'violations' && (
            <div className="card">
              <div className="card-body">
                <DataTable columns={violationCols} data={violations} emptyMessage="Không có dữ liệu vi phạm" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
