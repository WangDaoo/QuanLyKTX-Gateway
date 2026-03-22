import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Receipt } from '../../types/api';

export default function Payments() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadReceipts(); }, []);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<Receipt[]>(ENDPOINTS.USER_RECEIPTS);
      setReceipts(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const totalPaid = receipts.reduce((sum, r) => sum + r.soTien, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-receipt"></i> Lịch sử thanh toán</h1>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Tổng biên lai</h5>
            <h3>{receipts.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Đã thanh toán</h5>
            <h3 className="text-success">{formatCurrency(totalPaid)}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {receipts.length === 0 ? (
            <p className="text-muted">Chưa có biên lai thanh toán nào</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã BL</th>
                  <th>Mã HĐ</th>
                  <th>Ngày thanh toán</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map(r => (
                  <tr key={r.maBienLai}>
                    <td>{r.maBienLai}</td>
                    <td>{r.maHoaDon}</td>
                    <td>{formatDate(r.ngayThanhToan)}</td>
                    <td className="fw-bold text-success">{formatCurrency(r.soTien)}</td>
                    <td>{r.phuongThuc}</td>
                    <td>{r.ghiChu || '-'}</td>
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
