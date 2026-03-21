// Officer Reports - React Query + Recharts
import React, { useState } from 'react';
import { useReportOccupancy, useReportRevenue, useReportDebt } from '../../hooks/useReports';
import { formatCurrency, getCurrentMonth, getCurrentYear } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import { RevenueBarChart, OccupancyPieChart } from '../../components/charts/OccupancyChart';

type Tab = 'occupancy' | 'revenue' | 'debt';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'occupancy', label: 'Tỷ lệ lấp đầy', icon: 'fa-building' },
  { key: 'revenue', label: 'Doanh thu', icon: 'fa-coins' },
  { key: 'debt', label: 'Công nợ', icon: 'fa-exclamation-triangle' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<Tab>('occupancy');
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [filterYear, setFilterYear] = useState(getCurrentYear());

  const { data: occupancy = [], isLoading: loadingOcc } = useReportOccupancy(filterMonth, filterYear);
  const { data: revenue = [], isLoading: loadingRev } = useReportRevenue(filterMonth, filterYear);
  const { data: debt = [], isLoading: loadingDebt } = useReportDebt(filterMonth, filterYear);

  const totalRooms = occupancy.reduce((s, r) => s + r.tongSoPhong, 0);
  const occupiedRooms = occupancy.reduce((s, r) => s + r.soPhongCoSinhVien, 0);
  const avgOccupancy = totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(1) : '0';
  const totalRevenue = revenue.reduce((s, r) => s + r.tongDoanhThu, 0);
  const totalDebt = debt.reduce((s, r) => s + r.tongCongNo, 0);

  const pieData = [
    { name: 'Đã thuê', value: occupiedRooms, color: '#22c55e' },
    { name: 'Trống', value: totalRooms - occupiedRooms, color: '#94a3b8' },
  ];

  const occCols = [
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-chart-bar"></i> Báo cáo thống kê</h1>
      </div>

      {/* Summary */}
      <div className="stats-grid mb-3">
        <div className="stat-card" style={{ borderLeft: '4px solid #1976d2', background: '#e3f2fd' }}>
          <div className="stat-icon" style={{ color: '#1976d2' }}><i className="fas fa-chart-pie"></i></div>
          <div><span className="stat-value">{avgOccupancy}%</span><span className="stat-label">Tỷ lệ lấp đầy TB</span></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #388e3c', background: '#e8f5e9' }}>
          <div className="stat-icon" style={{ color: '#388e3c' }}><i className="fas fa-coins"></i></div>
          <div><span className="stat-value">{formatCurrency(totalRevenue)}</span><span className="stat-label">Tổng doanh thu</span></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #c62828', background: '#fce4ec' }}>
          <div className="stat-icon" style={{ color: '#c62828' }}><i className="fas fa-exclamation-triangle"></i></div>
          <div><span className="stat-value">{formatCurrency(totalDebt)}</span><span className="stat-label">Tổng công nợ</span></div>
        </div>
      </div>

      {/* Filter */}
      <div className="card mb-3">
        <div className="card-body d-flex gap-3 align-items-center flex-wrap">
          <label className="fw-bold">Lọc:</label>
          <input type="number" className="form-control" style={{ width: 100 }} min={1} max={12}
            value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} placeholder="Tháng" />
          <input type="number" className="form-control" style={{ width: 120 }} min={2020}
            value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} placeholder="Năm" />
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {TABS.map((tab) => (
          <li key={tab.key} className="nav-item">
            <button className={`nav-link ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              <i className={`fas ${tab.icon}`}></i> {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === 'occupancy' && (
        <div className="row">
          <div className="col-md-4">
            <div className="card"><div className="card-body"><OccupancyPieChart data={pieData} title="Tổng quan" /></div></div>
          </div>
          <div className="col-md-8">
            <div className="card"><div className="card-body">
              <DataTable columns={occCols} data={occupancy} loading={loadingOcc} emptyMessage="Không có dữ liệu" />
            </div></div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="row">
          <div className="col-12">
            <div className="card mb-3"><div className="card-body"><RevenueBarChart data={revenue} /></div></div>
            <div className="card"><div className="card-body">
              <DataTable columns={revenueCols} data={revenue} loading={loadingRev} emptyMessage="Không có dữ liệu doanh thu" />
            </div></div>
          </div>
        </div>
      )}

      {activeTab === 'debt' && (
        <div className="card">
          <div className="card-body">
            <DataTable columns={debtCols} data={debt} loading={loadingDebt} emptyMessage="Không có công nợ" />
          </div>
        </div>
      )}
    </div>
  );
}
