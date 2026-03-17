// Officer Layout Component
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';
import NotificationDropdown from './NotificationDropdown';

export default function OfficerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="layout-container">
      <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fas fa-university"></i>
            Quản Lý KTX
          </div>
          <div className="sidebar-subtitle">Hệ thống quản lý ký túc xá</div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="user-info">
            <div className="user-name">{user?.hoTen || user?.tenDangNhap || 'Nhân viên'}</div>
            <div className="user-role">{ROLE_LABELS[user?.vaiTro || 'Officer']}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Tổng quan</div>
            <ul className="nav-list">
              <li className="nav-item">
                <NavLink to="/officer/dashboard" className="nav-link">
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Quản lý</div>
            <ul className="nav-list">
              <li className="nav-item"><NavLink to="/officer/registrations" className="nav-link"><i className="fas fa-clipboard-check"></i> Đăng ký</NavLink></li>
              <li className="nav-item"><NavLink to="/officer/change-requests" className="nav-link"><i className="fas fa-exchange-alt"></i> Yêu cầu chuyển phòng</NavLink></li>
              <li className="nav-item"><NavLink to="/officer/meter-readings" className="nav-link"><i className="fas fa-tachometer-alt"></i> Chỉ số điện nước</NavLink></li>
              <li className="nav-item"><NavLink to="/officer/violations" className="nav-link"><i className="fas fa-exclamation-triangle"></i> Kỷ luật</NavLink></li>
              <li className="nav-item"><NavLink to="/officer/discipline-scores" className="nav-link"><i className="fas fa-star"></i> Điểm rèn luyện</NavLink></li>
              <li className="nav-item"><NavLink to="/officer/reports" className="nav-link"><i className="fas fa-chart-bar"></i> Báo cáo</NavLink></li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Hệ thống</div>
            <ul className="nav-list">
              <li className="nav-item"><NavLink to="/officer/change-password" className="nav-link"><i className="fas fa-key"></i> Đổi mật khẩu</NavLink></li>
              <li className="nav-item">
                <a className="nav-link" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Đăng xuất
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <button className="header-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="header-title">Dashboard</h1>
          </div>
          <div className="header-right">
            <NotificationDropdown />
            <i className="fas fa-user-circle header-icon"></i>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
