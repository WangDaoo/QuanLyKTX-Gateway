import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import type { Fee } from '../../types/api';

export default function Fees() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadFees(); }, []);

  const loadFees = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<Fee[]>(ENDPOINTS.USER_FEES);
      setFees(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const totalFees = fees.reduce((sum, f) => sum + (f.giaTien || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-coins"></i> Các loại phí</h1>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Tổng loại phí</h5>
            <h3>{fees.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Tổng tiền phí</h5>
            <h3 className="text-primary">{formatCurrency(totalFees)}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {fees.length === 0 ? (
            <p className="text-muted">Không có thông tin phí</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã phí</th>
                  <th>Tên phí</th>
                  <th>Loại phí</th>
                  <th>Số tiền</th>
                  <th>Đơn vị</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => (
                  <tr key={fee.maMucPhi}>
                    <td>{fee.maMucPhi}</td>
                    <td className="fw-bold">{fee.tenMucPhi}</td>
                    <td>
                      <span className="badge bg-info">{fee.loaiPhi}</span>
                    </td>
                    <td className="text-primary fw-bold">{formatCurrency(fee.giaTien)}</td>
                    <td>{fee.donVi || '-'}</td>
                    <td>{fee.ghiChu || '-'}</td>
                    <td>
                      <span className={`badge bg-${fee.trangThai ? 'success' : 'secondary'}`}>
                        {fee.trangThai ? 'Đang áp dụng' : 'Không áp dụng'}
                      </span>
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
