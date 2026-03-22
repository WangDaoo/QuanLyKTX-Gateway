import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Violation } from '../../types/api';

export default function Violations() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadViolations(); }, []);

  const loadViolations = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<Violation[]>(ENDPOINTS.USER_VIOLATIONS);
      setViolations(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const totalFines = violations.reduce((sum, v) => sum + v.mucPhat, 0);
  const unpaidViolations = violations.filter(v => v.trangThai === 'Chưa nộp phạt').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-exclamation-triangle"></i> Vi phạm</h1>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Tổng vi phạm</h5>
            <h3>{violations.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Tổng tiền phạt</h5>
            <h3 className="text-danger">{formatCurrency(totalFines)}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Chưa nộp phạt</h5>
            <h3 className="text-warning">{unpaidViolations}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {violations.length === 0 ? (
            <p className="text-muted text-center">
              <i className="fas fa-check-circle text-success fa-2x d-block mb-2"></i>
              Bạn không có vi phạm nào
            </p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã VP</th>
                  <th>Loại vi phạm</th>
                  <th>Mô tả</th>
                  <th>Mức phạt</th>
                  <th>Ngày vi phạm</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {violations.map(v => (
                  <tr key={v.maViPham}>
                    <td>{v.maViPham}</td>
                    <td>
                      <span className="badge bg-danger">{v.loaiViPham}</span>
                    </td>
                    <td>{v.moTa}</td>
                    <td className="text-danger fw-bold">{formatCurrency(v.mucPhat)}</td>
                    <td>{formatDate(v.ngayViPham)}</td>
                    <td>
                      <span className={`badge bg-${v.trangThai === 'Đã nộp phạt' ? 'success' : 'warning'}`}>
                        {v.trangThai}
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
