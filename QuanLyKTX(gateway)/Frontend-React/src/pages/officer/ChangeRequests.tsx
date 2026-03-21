import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import type { ChangeRequest } from '../../types/api';

export default function ChangeRequests() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState({ msg: '', type: '' });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<ChangeRequest[]>(ENDPOINTS.CHANGE_REQUESTS);
      setRequests(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setActionLoading(id);
    try {
      await apiClient.put<ChangeRequest>(ENDPOINTS.CHANGE_REQUEST_BY_ID(id), { trangThai: newStatus });
      setShowAlert({ msg: `Cập nhật trạng thái thành "${newStatus}" thành công!`, type: 'success' });
      loadRequests();
    } catch (err) {
      setShowAlert({ msg: err instanceof Error ? err.message : 'Lỗi cập nhật', type: 'danger' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter(r => r.trangThai === filterStatus);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Chờ duyệt': 'warning', 'Đã duyệt': 'success', 'Từ chối': 'danger',
      'Đang xử lý': 'info', 'Hoàn thành': 'success',
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{status}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-exchange-alt"></i> Yêu cầu chuyển phòng</h1>
      </div>

      {showAlert.msg && (
        <div className={`alert alert-${showAlert.type}`}>{showAlert.msg}</div>
      )}

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
            <p className="text-muted">Không có yêu cầu nào</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Sinh viên</th>
                  <th>Phòng hiện tại</th>
                  <th>Phòng yêu cầu</th>
                  <th>Lý do</th>
                  <th>Ngày yêu cầu</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.maYeuCau}>
                    <td>{r.maYeuCau}</td>
                    <td>{r.hoTen || r.maSinhVien}</td>
                    <td>{r.tenPhongHienTai || r.maPhongHienTai}</td>
                    <td>{r.tenPhongYeuCau || r.maPhongYeuCau}</td>
                    <td>{r.lyDo || '-'}</td>
                    <td>{formatDate(r.ngayYeuCau)}</td>
                    <td>{statusBadge(r.trangThai)}</td>
                    <td>
                      {r.trangThai === 'Chờ duyệt' && (
                        <>
                          <button className="btn btn-sm btn-success me-1"
                            onClick={() => handleStatusChange(r.maYeuCau, 'Đã duyệt')}
                            disabled={actionLoading === r.maYeuCau}>
                            <i className="fas fa-check"></i>
                          </button>
                          <button className="btn btn-sm btn-danger"
                            onClick={() => handleStatusChange(r.maYeuCau, 'Từ chối')}
                            disabled={actionLoading === r.maYeuCau}>
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
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
