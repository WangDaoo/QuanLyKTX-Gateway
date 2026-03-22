import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import type { Registration, ChangeRequest, Room } from '../../types/api';

export default function Requests() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState({ msg: '', type: '' });
  const [activeTab, setActiveTab] = useState<'registrations' | 'changes'>('registrations');
  const [showNewForm, setShowNewForm] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [saving, setSaving] = useState(false);
  const [newForm, setNewForm] = useState({ maToaNha: 0, maPhongYeuCau: 0, ghiChu: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [regs, changes] = await Promise.all([
        apiClient.get<Registration[]>(ENDPOINTS.USER_REGISTRATIONS),
        apiClient.get<ChangeRequest[]>(ENDPOINTS.USER_CHANGE_REQUESTS_MY),
      ]);
      setRegistrations(regs || []);
      setChangeRequests(changes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableRooms = async () => {
    try {
      const result = await apiClient.get<Room[]>(ENDPOINTS.USER_ROOMS_AVAILABLE);
      setAvailableRooms(result || []);
    } catch { /* ignore */ }
  };

  const handleNewRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post(ENDPOINTS.USER_REGISTRATIONS_CREATE, newForm);
      setShowAlert({ msg: 'Gửi đăng ký thành công!', type: 'success' });
      setShowNewForm(false);
      setNewForm({ maToaNha: 0, maPhongYeuCau: 0, ghiChu: '' });
      loadData();
    } catch (err) {
      setShowAlert({ msg: err instanceof Error ? err.message : 'Lỗi gửi đăng ký', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenForm = () => {
    setShowNewForm(true);
    loadAvailableRooms();
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Chờ duyệt': 'warning',
      'Đã duyệt': 'success',
      'Từ chối': 'danger',
      'Đang xử lý': 'info',
      'Hoàn thành': 'success',
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{status}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-paper-plane"></i> Yêu cầu của tôi</h1>
        <button className="btn btn-primary" onClick={handleOpenForm}>
          <i className="fas fa-plus"></i> Đăng ký phòng mới
        </button>
      </div>

      {showAlert.msg && (
        <div className={`alert alert-${showAlert.type}`}>{showAlert.msg}</div>
      )}

      {/* New Registration Form */}
      {showNewForm && (
        <div className="card mb-3">
          <div className="card-header">
            <h3>Đăng ký phòng mới</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleNewRegistration}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phòng yêu cầu</label>
                  <select className="form-control" required
                    value={newForm.maPhongYeuCau}
                    onChange={e => setNewForm(prev => ({ ...prev, maPhongYeuCau: Number(e.target.value) }))}>
                    <option value={0}>-- Chọn phòng --</option>
                    {availableRooms.map(r => (
                      <option key={r.maPhong} value={r.maPhong}>
                        {r.tenPhong} - {r.tenToaNha}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Ghi chú</label>
                  <input type="text" className="form-control" value={newForm.ghiChu}
                    onChange={e => setNewForm(prev => ({ ...prev, ghiChu: e.target.value }))}
                    placeholder="VD: Muốn ở tầng 2 trở lên" />
                </div>
              </div>
              <button type="submit" className="btn btn-success me-2" disabled={saving}>
                {saving ? 'Đang gửi...' : 'Gửi đăng ký'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowNewForm(false)}>
                Hủy
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}>
            <i className="fas fa-clipboard-list"></i> Đăng ký phòng ({registrations.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'changes' ? 'active' : ''}`}
            onClick={() => setActiveTab('changes')}>
            <i className="fas fa-exchange-alt"></i> Yêu cầu chuyển phòng ({changeRequests.length})
          </button>
        </li>
      </ul>

      {activeTab === 'registrations' && (
        <div className="card">
          <div className="card-body">
            {registrations.length === 0 ? (
              <p className="text-muted">Bạn chưa có đăng ký nào</p>
            ) : (
              <table className="table table-hover">
                <thead>
                  <tr><th>Mã</th><th>Ngày đăng ký</th><th>Tòa nhà</th><th>Phòng yêu cầu</th><th>Trạng thái</th><th>Ghi chú</th></tr>
                </thead>
                <tbody>
                  {registrations.map(r => (
                    <tr key={r.maDangKy}>
                      <td>{r.maDangKy}</td>
                      <td>{formatDate(r.ngayDangKy)}</td>
                      <td>{r.tenToaNha || 'Chưa chọn'}</td>
                      <td>{r.tenPhongYeuCau || 'Chưa chọn'}</td>
                      <td>{statusBadge(r.trangThai)}</td>
                      <td>{r.ghiChu || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'changes' && (
        <div className="card">
          <div className="card-body">
            {changeRequests.length === 0 ? (
              <p className="text-muted">Bạn chưa có yêu cầu chuyển phòng nào</p>
            ) : (
              <table className="table table-hover">
                <thead>
                  <tr><th>Mã</th><th>Ngày yêu cầu</th><th>Phòng hiện tại</th><th>Phòng yêu cầu</th><th>Lý do</th><th>Trạng thái</th></tr>
                </thead>
                <tbody>
                  {changeRequests.map(c => (
                    <tr key={c.maYeuCau}>
                      <td>{c.maYeuCau}</td>
                      <td>{formatDate(c.ngayYeuCau)}</td>
                      <td>{c.tenPhongHienTai || c.maPhongHienTai}</td>
                      <td>{c.tenPhongYeuCau || c.maPhongYeuCau}</td>
                      <td>{c.lyDo || '-'}</td>
                      <td>{statusBadge(c.trangThai)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
