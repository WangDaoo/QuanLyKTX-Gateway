// Admin Layout Component
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';
import NotificationDropdown from './NotificationDropdown';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.header-user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
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
            <div className="user-name">{user?.hoTen || user?.tenDangNhap || 'Admin'}</div>
            <div className="user-role">{ROLE_LABELS[user?.vaiTro || 'Admin']}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Tổng quan</div>
            <ul className="nav-list">
              <li className="nav-item">
                <NavLink to="/admin/dashboard" className="nav-link">
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Quản lý</div>
            <ul className="nav-list">
              <li className="nav-item"><NavLink to="/admin/buildings" className="nav-link"><i className="fas fa-building"></i> Tòa nhà</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/rooms" className="nav-link"><i className="fas fa-door-open"></i> Phòng</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/beds" className="nav-link"><i className="fas fa-bed"></i> Giường</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/students" className="nav-link"><i className="fas fa-user-graduate"></i> Sinh viên</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/contracts" className="nav-link"><i className="fas fa-file-contract"></i> Hợp đồng</NavLink></li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Tài chính</div>
            <ul className="nav-list">
              <li className="nav-item"><NavLink to="/admin/bills" className="nav-link"><i className="fas fa-file-invoice-dollar"></i> Hóa đơn</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/receipts" className="nav-link"><i className="fas fa-receipt"></i> Biên lai</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/fees" className="nav-link"><i className="fas fa-coins"></i> Mức phí</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/price-tiers" className="nav-link"><i className="fas fa-layer-group"></i> Bậc giá điện nước</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/fee-configs" className="nav-link"><i className="fas fa-sliders-h"></i> Cấu hình phí</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/meter-readings" className="nav-link"><i className="fas fa-tachometer-alt"></i> Chỉ số điện nước</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/reports" className="nav-link"><i className="fas fa-chart-bar"></i> Báo cáo</NavLink></li>
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Hệ thống</div>
            <ul className="nav-list">
              <li className="nav-item"><NavLink to="/admin/users" className="nav-link"><i className="fas fa-users-cog"></i> Tài khoản</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/change-password" className="nav-link"><i className="fas fa-key"></i> Đổi mật khẩu</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/registrations" className="nav-link"><i className="fas fa-clipboard-check"></i> Đăng ký</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/violations" className="nav-link"><i className="fas fa-exclamation-triangle"></i> Kỷ luật</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/discipline-scores" className="nav-link"><i className="fas fa-star"></i> Điểm rèn luyện</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/change-requests" className="nav-link"><i className="fas fa-exchange-alt"></i> Yêu cầu chuyển phòng</NavLink></li>
              <li className="nav-item"><NavLink to="/admin/overdue-notices" className="nav-link"><i className="fas fa-bell"></i> Thông báo quá hạn</NavLink></li>
              <li className="nav-item">
                <a className="nav-link" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Đăng xuất
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button className="header-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="header-title">Dashboard</h1>
          </div>
          <div className="header-right">
            <NotificationDropdown />
            <div className="header-user-menu" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <i className="fas fa-user-circle header-icon"></i>
              {userMenuOpen && (
                <div className="user-menu-dropdown show">
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/users'); }}><i className="fas fa-user"></i> Hồ sơ</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}><i className="fas fa-sign-out-alt"></i> Đăng xuất</a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
