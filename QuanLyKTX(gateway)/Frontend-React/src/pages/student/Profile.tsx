import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import type { Student } from '../../types/api';

export default function Profile() {
  const [profile, setProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState({ msg: '', type: '' });
  const [form, setForm] = useState<Partial<Student>>({});

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<Student>(ENDPOINTS.USER_PROFILE);
      setProfile(result);
      setForm(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put<Student>(ENDPOINTS.USER_PROFILE, form);
      setShowAlert({ msg: 'Cập nhật hồ sơ thành công!', type: 'success' });
      setEditing(false);
      loadProfile();
    } catch (err) {
      setShowAlert({ msg: err instanceof Error ? err.message : 'Lỗi cập nhật', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Student, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!profile) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-user"></i> Hồ sơ cá nhân</h1>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <i className="fas fa-edit"></i> Chỉnh sửa
          </button>
        )}
      </div>

      {showAlert.msg && (
        <div className={`alert alert-${showAlert.type}`}>{showAlert.msg}</div>
      )}

      <div className="card">
        <div className="card-body">
          {editing ? (
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Họ tên</label>
                  <input type="text" className="form-control" value={form.hoTen || ''}
                    onChange={e => handleChange('hoTen', e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">CCCD</label>
                  <input type="text" className="form-control" value={form.cccd || ''}
                    onChange={e => handleChange('cccd', e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Giới tính</label>
                  <select className="form-control" value={form.gioiTinh || ''}
                    onChange={e => handleChange('gioiTinh', e.target.value)}>
                    <option value="">Chọn</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-control" value={form.ngaySinh || ''}
                    onChange={e => handleChange('ngaySinh', e.target.value)} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Địa chỉ</label>
                  <input type="text" className="form-control" value={form.diaChi || ''}
                    onChange={e => handleChange('diaChi', e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Số điện thoại</label>
                  <input type="text" className="form-control" value={form.soDienThoai || ''}
                    onChange={e => handleChange('soDienThoai', e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={form.email || ''}
                    onChange={e => handleChange('email', e.target.value)} />
                </div>
              </div>
              <div className="col-12 mt-3">
                <button className="btn btn-success me-2" onClick={handleSave} disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm(profile); }}>
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <table className="table table-profile">
              <tbody>
                <tr>
                  <th width="200">Mã sinh viên</th>
                  <td>{profile.maSinhVien}</td>
                </tr>
                <tr>
                  <th>Họ tên</th>
                  <td>{profile.hoTen || 'N/A'}</td>
                </tr>
                <tr>
                  <th>CCCD</th>
                  <td>{profile.cccd || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Giới tính</th>
                  <td>{profile.gioiTinh || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Ngày sinh</th>
                  <td>{formatDate(profile.ngaySinh || '')}</td>
                </tr>
                <tr>
                  <th>Địa chỉ</th>
                  <td>{profile.diaChi || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Số điện thoại</th>
                  <td>{profile.soDienThoai || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{profile.email || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Trạng thái</th>
                  <td>
                    <span className={`badge bg-${profile.trangThai === 'Đang ở' ? 'success' : 'secondary'}`}>
                      {profile.trangThai || 'N/A'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
