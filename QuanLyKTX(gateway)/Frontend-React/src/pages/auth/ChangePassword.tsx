import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

export default function ChangePassword() {
  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!matKhauCu || !matKhauMoi || !xacNhanMatKhau) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (matKhauMoi !== xacNhanMatKhau) {
      setError('Mật khẩu mới không khớp!');
      return;
    }

    if (matKhauMoi.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      if (user?.vaiTro === 'Student') {
        await apiClient.post(ENDPOINTS.USER_CHANGE_PASSWORD, {
          matKhauCu,
          matKhauMoi,
        });
      } else {
        await apiClient.post(ENDPOINTS.CHANGE_PASSWORD, {
          matKhauCu,
          matKhauMoi,
        });
      }
      setSuccess('Đổi mật khẩu thành công!');
      setMatKhauCu('');
      setMatKhauMoi('');
      setXacNhanMatKhau('');
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi đổi mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-key"></i> Đổi mật khẩu</h1>
      </div>
      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-danger"><i className="fas fa-exclamation-circle"></i> {error}</div>}
          {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Mật khẩu cũ</label>
              <input type="password" className="form-control" value={matKhauCu}
                onChange={(e) => setMatKhauCu(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input type="password" className="form-control" value={matKhauMoi}
                onChange={(e) => setMatKhauMoi(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input type="password" className="form-control" value={xacNhanMatKhau}
                onChange={(e) => setXacNhanMatKhau(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Đang xử lý...</> : <><i className="fas fa-save"></i> Lưu</>}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left"></i> Quay lại
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
