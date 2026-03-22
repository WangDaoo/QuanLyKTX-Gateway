// Student Dashboard - React Query powered
import React from 'react';
import { useStudentHome } from '../../hooks/useStudentHome';
import { formatCurrency, formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';

export default function Dashboard() {
  const { data, isLoading, error } = useStudentHome();

  const unpaidBills = data?.bills?.filter((b) => b.trangThai === 'Chưa thanh toán').length ?? 0;
  const activeContracts = data?.contracts?.filter((c) => c.trangThai === 'Đang hoạt động').length ?? 0;
  const pendingRequests = data?.requests?.filter((r) => r.trangThai === 'Chờ duyệt').length ?? 0;
  const recentBills = data?.bills?.slice(0, 5) ?? [];
  const recentNotifications = data?.notifications?.filter((n) => !n.daDoc).slice(0, 5) ?? [];

  const statCards = [
    {
      label: 'Phòng hiện tại',
      value: data?.room ? `${data.room.tenPhong} - ${data.room.building?.tenToaNha ?? ''}` : 'Chưa có phòng',
      icon: 'fa-bed',
      color: '#1976d2',
      bg: '#e3f2fd',
      isText: true,
    },
    {
      label: 'Hóa đơn chưa thanh toán',
      value: unpaidBills,
      icon: 'fa-file-invoice-dollar',
      color: '#f57c00',
      bg: '#fff3e0',
    },
    {
      label: 'Hợp đồng đang hoạt động',
      value: activeContracts,
      icon: 'fa-file-contract',
      color: '#388e3c',
      bg: '#e8f5e9',
    },
    {
      label: 'Yêu cầu đang chờ duyệt',
      value: pendingRequests,
      icon: 'fa-clock',
      color: '#c62828',
      bg: '#fce4ec',
    },
  ];

  const billCols = [
    { key: 'thang', label: 'Tháng', render: (v: number, r: typeof recentBills[0]) => `${v}/${r.nam}` },
    { key: 'tongTien', label: 'Tổng tiền', render: (v: number) => formatCurrency(v) },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      render: (v: string) => (
        <span className={`badge ${v === 'Đã thanh toán' ? 'bg-success' : v === 'Quá hạn' ? 'bg-danger' : 'bg-warning'}`}>
          {v}
        </span>
      ),
    },
  ];

  if (isLoading) return <div className="text-center p-5"><i className="fas fa-spinner fa-spin fa-2x"></i></div>;
  if (error) return <div className="alert alert-danger m-3">{error.message}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-home"></i> Trang chủ sinh viên</h1>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid mb-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeft: `4px solid ${card.color}`, background: card.bg }}>
            <div className="stat-icon" style={{ color: card.color }}><i className={`fas ${card.icon}`}></i></div>
            <div className="stat-info">
              <span className="stat-value" style={{ fontSize: card.isText ? '1rem' : undefined }}>{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        {/* Recent Bills */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-file-invoice"></i> Hóa đơn gần đây</h3>
            </div>
            <div className="card-body">
              {recentBills.length === 0 ? (
                <p className="text-muted text-center">Không có hóa đơn nào</p>
              ) : (
                <DataTable columns={billCols} data={recentBills} />
              )}
              <a href="/student/bills" className="btn btn-sm btn-primary mt-2">
                Xem tất cả <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-bell"></i> Thông báo</h3>
            </div>
            <div className="card-body">
              {recentNotifications.length === 0 ? (
                <p className="text-muted text-center"><i className="fas fa-check-circle text-success"></i> Không có thông báo mới</p>
              ) : (
                <ul className="list-group">
                  {recentNotifications.map((n) => (
                    <li key={n.maThongBao} className={`list-group-item ${!n.daDoc ? 'fw-bold' : ''}`}>
                      <div className="d-flex justify-content-between">
                        <span>{n.tieuDe}</span>
                        <small className="text-muted">{formatDate(n.ngayTao)}</small>
                      </div>
                      {n.noiDung && <div className="text-muted small">{n.noiDung}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-bolt"></i> Thao tác nhanh</h3>
            </div>
            <div className="card-body">
              <div className="quick-actions">
                <a href="/student/bills" className="quick-action-btn">
                  <i className="fas fa-file-invoice-dollar"></i><span>Xem hóa đơn</span>
                </a>
                <a href="/student/room" className="quick-action-btn">
                  <i className="fas fa-bed"></i><span>Thông tin phòng</span>
                </a>
                <a href="/student/contract" className="quick-action-btn">
                  <i className="fas fa-file-contract"></i><span>Hợp đồng</span>
                </a>
                <a href="/student/requests" className="quick-action-btn">
                  <i className="fas fa-paper-plane"></i><span>Gửi yêu cầu</span>
                </a>
                <a href="/student/payments" className="quick-action-btn">
                  <i className="fas fa-receipt"></i><span>Lịch sử thanh toán</span>
                </a>
                <a href="/student/profile" className="quick-action-btn">
                  <i className="fas fa-user"></i><span>Hồ sơ cá nhân</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
