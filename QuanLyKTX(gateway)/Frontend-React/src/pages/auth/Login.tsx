// Login Page — Clean SaaS Style
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!tenDangNhap || !matKhau) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    try {
      await login(tenDangNhap, matKhau);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại!');
    }
  };

  const fillDemo = (user: string, pw: string) => {
    setTenDangNhap(user);
    setMatKhau(pw);
    setError('');
  };

  return (
    <div className="login-page">
      {/* Left Panel — Branding */}
      <div className="login-panel login-panel-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <i className="fas fa-university"></i>
          </div>
          <div className="login-brand-text">
            <h1>Quản Lý KTX</h1>
            <p>Hệ thống quản lý ký túc xá sinh viên</p>
          </div>
        </div>

        <div className="login-features">
          <div className="login-feature-item">
            <div className="login-feature-icon"><i className="fas fa-building"></i></div>
            <div>
              <strong>Quản lý toàn diện</strong>
              <p>Tòa nhà, phòng, giường, sinh viên</p>
            </div>
          </div>
          <div className="login-feature-item">
            <div className="login-feature-icon"><i className="fas fa-file-invoice-dollar"></i></div>
            <div>
              <strong>Tài chính minh bạch</strong>
              <p>Hóa đơn, biên lai, công nợ tự động</p>
            </div>
          </div>
          <div className="login-feature-item">
            <div className="login-feature-icon"><i className="fas fa-chart-line"></i></div>
            <div>
              <strong>Báo cáo thông minh</strong>
              <p>Biểu đồ trực quan, theo dõi realtime</p>
            </div>
          </div>
        </div>

        <div className="login-panel-decor">
          <div className="deco-circle deco-1"></div>
          <div className="deco-circle deco-2"></div>
          <div className="deco-circle deco-3"></div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="login-panel login-panel-right">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>Đăng nhập</h2>
            <p>Chào mừng bạn quay trở lại</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="tenDangNhap">
                <i className="fas fa-user"></i> Tên đăng nhập
              </label>
              <input
                id="tenDangNhap"
                type="text"
                className="form-control"
                placeholder="Nhập tên đăng nhập"
                value={tenDangNhap}
                onChange={(e) => setTenDangNhap(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="matKhau">
                <i className="fas fa-lock"></i> Mật khẩu
              </label>
              <div className="password-wrapper">
                <input
                  id="matKhau"
                  type={showPw ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Nhập mật khẩu"
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <i className={showPw ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={isLoading}
            >
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> Đang đăng nhập...</>
              ) : (
                <><i className="fas fa-arrow-right"></i> Đăng nhập</>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="demo-section">
            <div className="demo-label">
              <span>Tài khoản demo</span>
            </div>
            <div className="demo-cards">
              <button className="demo-card" onClick={() => fillDemo('admin', 'admin@123')} type="button">
                <div className="demo-card-icon admin"><i className="fas fa-shield-halved"></i></div>
                <div className="demo-card-info">
                  <strong>Admin</strong>
                  <span>admin / admin@123</span>
                </div>
              </button>
              <button className="demo-card" onClick={() => fillDemo('officer', 'officer@123')} type="button">
                <div className="demo-card-icon officer"><i className="fas fa-user-gear"></i></div>
                <div className="demo-card-info">
                  <strong>Officer</strong>
                  <span>officer / officer@123</span>
                </div>
              </button>
              <button className="demo-card" onClick={() => fillDemo('student', 'student@123')} type="button">
                <div className="demo-card-icon student"><i className="fas fa-user-graduate"></i></div>
                <div className="demo-card-info">
                  <strong>Student</strong>
                  <span>student / student@123</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
