import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import type { Registration } from '../../types/api';

export default function Registrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState({ msg: '', type: '' });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { loadRegistrations(); }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<Registration[]>(ENDPOINTS.REGISTRATIONS);
      setRegistrations(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setActionLoading(id);
    try {
      await apiClient.put<Registration>(ENDPOINTS.REGISTRATION_BY_ID(id), { trangThai: newStatus });
      setShowAlert({ msg: `Cập nhật trạng thái thành "${newStatus}" thành công!`, type: 'success' });
      loadRegistrations();
    } catch (err) {
      setShowAlert({ msg: err instanceof Error ? err.message : 'Lỗi cập nhật', type: 'danger' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  const filtered = filterStatus === 'all'
    ? registrations
    : registrations.filter(r => r.trangThai === filterStatus);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Chờ duyệt': 'warning', 'Đã duyệt': 'success', 'Từ chối': 'danger',
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{status}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-clipboard-check"></i> Quản lý đăng ký</h1>
      </div>

      {showAlert.msg && (
        <div className={`alert alert-${showAlert.type}`}>{showAlert.msg}</div>
      )}

      {/* Filter */}
      <div className="mb-3">
        <label className="form-label">Lọc theo trạng thái:</label>
        <select className="form-select w-auto" value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Từ chối">Từ chối</option>
        </select>
      </div>

      <div className="card">
        <div className="card-body">
          {filtered.length === 0 ? (
            <p className="text-muted">Không có đăng ký nào</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Sinh viên</th>
                  <th>Tòa nhà</th>
                  <th>Phòng yêu cầu</th>
                  <th>Ngày đăng ký</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.maDangKy}>
                    <td>{r.maDangKy}</td>
                    <td>{r.hoTen || r.maSinhVien}</td>
                    <td>{r.tenToaNha || 'N/A'}</td>
                    <td>{r.tenPhongYeuCau || 'N/A'}</td>
                    <td>{formatDate(r.ngayDangKy)}</td>
                    <td>{statusBadge(r.trangThai)}</td>
                    <td>{r.ghiChu || '-'}</td>
                    <td>
                      {r.trangThai === 'Chờ duyệt' ? (
                        <div className="d-flex gap-1">
                          <button
                            key={`approve-${r.maDangKy}`}
                            className="btn btn-sm btn-success me-1"
                            onClick={() => handleStatusChange(r.maDangKy, 'Đã duyệt')}
                            disabled={actionLoading === r.maDangKy}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            key={`reject-${r.maDangKy}`}
                            className="btn btn-sm btn-danger"
                            onClick={() => handleStatusChange(r.maDangKy, 'Từ chối')}
                            disabled={actionLoading === r.maDangKy}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
