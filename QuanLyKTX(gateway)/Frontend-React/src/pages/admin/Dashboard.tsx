// Dashboard - Admin Overview with React Query + Recharts
import React, { useState } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useReportOccupancy } from '../../hooks/useReports';
import { useReportRevenue } from '../../hooks/useReports';
import { useGenerateMonthlyBills } from '../../hooks/useBills';
import { formatCurrency, formatNumber, getCurrentMonth, getCurrentYear } from '../../utils/formatters';
import Alert from '../../components/common/Alert';
import { OccupancyPieChart, OccupancyAreaChart, RevenueBarChart } from '../../components/charts/OccupancyChart';

export default function Dashboard() {
  const { data: stats, isLoading, error, refetch } = useDashboard();
  const [thang, setThang] = useState(getCurrentMonth());
  const [nam, setNam] = useState(getCurrentYear());
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'danger' | 'warning' | 'info'>('info');

  // Charts data
  const { data: occupancyData } = useReportOccupancy(thang, nam);
  const { data: revenueData } = useReportRevenue(thang, nam);

  // Mutation for generating bills
  const generateBills = useGenerateMonthlyBills();

  const handleGenerateBills = async () => {
    if (!window.confirm(`Tạo hóa đơn tháng ${thang}/${nam}?`)) return;
    try {
      await generateBills.mutateAsync({ thang, nam });
      setAlertMsg(`Đã tạo hóa đơn tháng ${thang}/${nam} thành công!`);
      setAlertType('success');
      refetch();
    } catch (err) {
      setAlertMsg(err instanceof Error ? err.message : 'Tạo hóa đơn thất bại');
      setAlertType('danger');
    }
  };

  // Pie chart data
  const pieData = stats
    ? [
        { name: 'Đã thuê', value: stats.totalRooms - stats.emptyRooms },
        { name: 'Trống', value: stats.emptyRooms },
        { name: 'Đầy', value: stats.fullRooms },
      ]
    : [];

  const statCards = [
    { label: 'Tổng số tòa nhà', value: formatNumber(stats?.totalBuildings ?? 0), icon: 'fa-building', color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Tổng số phòng', value: formatNumber(stats?.totalRooms ?? 0), icon: 'fa-door-open', color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Tổng số sinh viên', value: formatNumber(stats?.totalStudents ?? 0), icon: 'fa-user-graduate', color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Hóa đơn chưa thanh toán', value: formatNumber(stats?.unpaidBills ?? 0), icon: 'fa-file-invoice-dollar', color: '#ef4444', bg: '#fef2f2' },
  ];

  const quickStats = [
    { label: 'Tỷ lệ lấp đầy', value: `${stats?.occupancyRate ?? 0}%`, icon: 'fa-chart-pie', color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Phòng trống', value: formatNumber(stats?.emptyRooms ?? 0), icon: 'fa-bed', color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Phòng đầy', value: formatNumber(stats?.fullRooms ?? 0), icon: 'fa-house-user', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Yêu cầu chờ duyệt', value: formatNumber(stats?.pendingRequests ?? 0), icon: 'fa-clock', color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1><i className="fas fa-tachometer-alt"></i> Dashboard</h1>
        <p>Trang quản trị tổng quan hệ thống Ký túc xá</p>
      </div>

      {alertMsg && <Alert message={alertMsg} type={alertType} onClose={() => setAlertMsg('')} />}

      {/* Bill Generation */}
      <div className="card mb-3">
        <div className="card-header">
          <h3><i className="fas fa-file-invoice-dollar"></i> Tạo hóa đơn tháng</h3>
        </div>
        <div className="card-body">
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <label>Tháng:</label>
            <select className="form-control w-auto" value={thang} onChange={(e) => setThang(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <label>Năm:</label>
            <select className="form-control w-auto" value={nam} onChange={(e) => setNam(Number(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleGenerateBills} disabled={generateBills.isPending}>
              {generateBills.isPending ? (
                <><i className="fas fa-spinner fa-spin"></i> Đang tạo...</>
              ) : (
                <><i className="fas fa-plus"></i> Tạo hóa đơn tháng</>
              )}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-5"><i className="fas fa-spinner fa-spin fa-2x"></i></div>
      ) : error ? (
        <Alert message={error.message} type="danger" />
      ) : (
        <>
          {/* Stat Cards */}
          <div className="stats-grid">
            {statCards.map((card) => (
              <div key={card.label} className="stat-card" style={{ borderLeft: `4px solid ${card.color}`, background: card.bg }}>
                <div className="stat-icon" style={{ color: card.color, background: 'rgba(255,255,255,0.7)' }}>
                  <i className={`fas ${card.icon}`}></i>
                </div>
                <div className="stat-info">
                  <span className="stat-label">{card.label}</span>
                  <span className="stat-value">{card.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="stats-grid mt-3">
            {quickStats.map((stat) => (
              <div key={stat.label} className="stat-card" style={{ borderLeft: `4px solid ${stat.color}`, background: stat.bg }}>
                <div className="stat-icon" style={{ color: stat.color, background: 'rgba(255,255,255,0.7)' }}>
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <div className="stat-info">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card">
                <div className="card-header"><h4><i className="fas fa-chart-pie"></i> Tỷ lệ lấp đầy</h4></div>
                <div className="card-body">
                  <OccupancyPieChart data={pieData} />
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="card">
                <div className="card-header"><h4><i className="fas fa-chart-bar"></i> Tỷ lệ lấp đầy theo tòa nhà</h4></div>
                <div className="card-body">
                  <OccupancyAreaChart data={occupancyData ?? []} />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header"><h4><i className="fas fa-dollar-sign"></i> Doanh thu theo tháng</h4></div>
                <div className="card-body">
                  <RevenueBarChart data={revenueData ?? []} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
