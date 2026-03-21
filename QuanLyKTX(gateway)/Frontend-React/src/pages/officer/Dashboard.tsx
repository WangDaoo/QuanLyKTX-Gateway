// Officer Dashboard - React Query powered
import React from 'react';
import { useRegistrations, useChangeRequests } from '../../hooks/useRegistrations';
import { useBuildings, useRooms, useStudents } from '../../hooks/useApi';
import { formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';

export default function OfficerDashboard() {
  const { data: regs = [], isLoading: loadingRegs } = useRegistrations();
  const { data: changes = [], isLoading: loadingChanges } = useChangeRequests();
  const { data: buildings = [] } = useBuildings();
  const { data: rooms = [] } = useRooms();
  const { data: students = [] } = useStudents();

  const pendingRegs = regs.filter((r) => r.trangThai === 'Chờ duyệt');
  const pendingChanges = changes.filter((c) => c.trangThai === 'Chờ duyệt');

  const statCards = [
    { label: 'Tổng tòa nhà', value: buildings.length, icon: 'fa-building', color: '#1976d2', bg: '#e3f2fd' },
    { label: 'Tổng phòng', value: rooms.length, icon: 'fa-door-open', color: '#388e3c', bg: '#e8f5e9' },
    { label: 'Tổng sinh viên', value: students.length, icon: 'fa-user-graduate', color: '#f57c00', bg: '#fff3e0' },
    {
      label: 'Yêu cầu chờ duyệt',
      value: pendingRegs.length + pendingChanges.length,
      icon: 'fa-clock',
      color: '#c62828',
      bg: '#fce4ec',
    },
  ];

  const regCols = [
    { key: 'hoTen', label: 'Sinh viên' },
    { key: 'tenToaNha', label: 'Tòa nhà' },
    { key: 'tenPhongYeuCau', label: 'Phòng yêu cầu' },
    { key: 'ngayDangKy', label: 'Ngày đăng ký', render: (v: string) => formatDate(v) },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      render: (v: string) => (
        <span className={`badge ${v === 'Chờ duyệt' ? 'bg-warning' : v === 'Đã duyệt' ? 'bg-success' : 'bg-secondary'}`}>
          {v}
        </span>
      ),
    },
  ];

  const changeCols = [
    { key: 'hoTen', label: 'Sinh viên' },
    { key: 'tenPhongHienTai', label: 'Từ phòng' },
    { key: 'tenPhongYeuCau', label: 'Đến phòng' },
    { key: 'ngayYeuCau', label: 'Ngày yêu cầu', render: (v: string) => formatDate(v) },
    { key: 'lyDo', label: 'Lý do' },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      render: (v: string) => (
        <span className={`badge ${v === 'Chờ duyệt' ? 'bg-warning' : v === 'Đã duyệt' ? 'bg-success' : 'bg-secondary'}`}>
          {v}
        </span>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-user-shield"></i> Trang quản lý nhân viên</h1>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid mb-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeft: `4px solid ${card.color}`, background: card.bg }}>
            <div className="stat-icon" style={{ color: card.color }}><i className={`fas ${card.icon}`}></i></div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        {/* Pending Registrations */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-clipboard-list"></i> Đăng ký chờ duyệt ({pendingRegs.length})</h3>
            </div>
            <div className="card-body">
              {pendingRegs.length === 0 ? (
                <p className="text-muted text-center"><i className="fas fa-check-circle text-success"></i> Không có đăng ký nào chờ duyệt</p>
              ) : (
                <DataTable columns={regCols} data={pendingRegs.slice(0, 5)} loading={loadingRegs} />
              )}
              <a href="/officer/registrations" className="btn btn-sm btn-primary mt-2">
                Xem tất cả <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Pending Change Requests */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3><i className="fas fa-exchange-alt"></i> Chuyển phòng chờ duyệt ({pendingChanges.length})</h3>
            </div>
            <div className="card-body">
              {pendingChanges.length === 0 ? (
                <p className="text-muted text-center"><i className="fas fa-check-circle text-success"></i> Không có yêu cầu nào chờ duyệt</p>
              ) : (
                <DataTable columns={changeCols} data={pendingChanges.slice(0, 5)} loading={loadingChanges} />
              )}
              <a href="/officer/change-requests" className="btn btn-sm btn-primary mt-2">
                Xem tất cả <i className="fas fa-arrow-right"></i>
              </a>
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
                <a href="/officer/registrations" className="quick-action-btn">
                  <i className="fas fa-clipboard-check"></i><span>Phê duyệt đăng ký</span>
                </a>
                <a href="/officer/change-requests" className="quick-action-btn">
                  <i className="fas fa-exchange-alt"></i><span>Yêu cầu chuyển phòng</span>
                </a>
                <a href="/officer/meter-readings" className="quick-action-btn">
                  <i className="fas fa-tachometer-alt"></i><span>Ghi chỉ số điện nước</span>
                </a>
                <a href="/officer/violations" className="quick-action-btn">
                  <i className="fas fa-exclamation-circle"></i><span>Quản lý vi phạm</span>
                </a>
                <a href="/officer/discipline-scores" className="quick-action-btn">
                  <i className="fas fa-star"></i><span>Điểm rèn luyện</span>
                </a>
                <a href="/officer/reports" className="quick-action-btn">
                  <i className="fas fa-chart-bar"></i><span>Báo cáo thống kê</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
