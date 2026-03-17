// Student Layout Component
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';
import NotificationDropdown from './NotificationDropdown';

export default function StudentLayout() {
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
            <div className="user-name">{user?.hoTen || user?.tenDangNhap || 'Sinh viên'}</div>
            <div className="user-role">{ROLE_LABELS[user?.vaiTro || 'Student']}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Tổng quan</div>
            <ul className="nav-list">
              <li className="nav-item">
                <NavLink to="/student/dashboard" className="nav-link">
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Thông tin cá nhân</div>
            <ul className="nav-list">
              <li className="nav-item"><NavLink to="/student/profile" className="nav-link"><i className="fas fa-user"></i> Hồ sơ cá nhân</NavLink></li>
              <li className="nav-item"><NavLink to="/student/room" className="nav-link"><i className="fas fa-door-open"></i> Phòng ở</NavLink></li>
              <li className="nav-item"><NavLink to="/student/contract" className="nav-link"><i className="fas fa-file-contract"></i> Hợp đồng</NavLink></li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Tài chính</div>
            <ul className="nav-list">
              <li className="nav-item"><NavLink to="/student/bills" className="nav-link"><i className="fas fa-file-invoice-dollar"></i> Hóa đơn</NavLink></li>
              <li className="nav-item"><NavLink to="/student/payments" className="nav-link"><i className="fas fa-credit-card"></i> Thanh toán</NavLink></li>
              <li className="nav-item"><NavLink to="/student/fees" className="nav-link"><i className="fas fa-money-bill-wave"></i> Bảng giá phí</NavLink></li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Dịch vụ</div>
            <ul className="nav-list">
              <li className="nav-item"><NavLink to="/student/services" className="nav-link"><i className="fas fa-concierge-bell"></i> Dịch vụ</NavLink></li>
              <li className="nav-item"><NavLink to="/student/requests" className="nav-link"><i className="fas fa-clipboard-list"></i> Yêu cầu</NavLink></li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Học tập & Rèn luyện</div>
            <ul className="nav-list">
              <li className="nav-item"><NavLink to="/student/discipline-scores" className="nav-link"><i className="fas fa-star"></i> Điểm rèn luyện</NavLink></li>
              <li className="nav-item"><NavLink to="/student/violations" className="nav-link"><i className="fas fa-exclamation-triangle"></i> Kỷ luật</NavLink></li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Hệ thống</div>
            <ul className="nav-list">
              <li className="nav-item"><NavLink to="/student/change-password" className="nav-link"><i className="fas fa-key"></i> Đổi mật khẩu</NavLink></li>
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
