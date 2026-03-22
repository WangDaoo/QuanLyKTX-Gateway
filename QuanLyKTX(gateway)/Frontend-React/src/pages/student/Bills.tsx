import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Bill, BillDetail } from '../../types/api';

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState<BillDetail[] | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => { loadBills(); }, []);

  const loadBills = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<Bill[]>(ENDPOINTS.USER_BILLS);
      setBills(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadBillDetails = async (maHoaDon: number) => {
    setLoadingDetails(true);
    try {
      const result = await apiClient.get<BillDetail[]>(ENDPOINTS.USER_BILL_DETAILS(maHoaDon));
      setSelectedBill(result || []);
    } catch {
      setSelectedBill([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRowClick = (bill: Bill) => {
    if (selectedBill && selectedBill.length > 0) {
      setSelectedBill(null);
    } else {
      loadBillDetails(bill.maHoaDon);
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const unpaidCount = bills.filter(b => b.trangThai === 'Chưa thanh toán').length;
  const totalUnpaid = bills
    .filter(b => b.trangThai === 'Chưa thanh toán')
    .reduce((sum, b) => sum + b.tongTien, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-file-invoice-dollar"></i> Hóa đơn</h1>
      </div>

      {/* Summary */}
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Tổng hóa đơn</h5>
            <h3>{bills.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Chưa thanh toán</h5>
            <h3 className="text-warning">{unpaidCount}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Tổng nợ</h5>
            <h3 className="text-danger">{formatCurrency(totalUnpaid)}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {bills.length === 0 ? (
            <p className="text-muted">Không có hóa đơn nào</p>
          ) : (
            <>
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Mã HĐ</th>
                    <th>Tháng/Năm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(bill => (
                    <tr key={bill.maHoaDon} onClick={() => handleRowClick(bill)} style={{ cursor: 'pointer' }}>
                      <td>{bill.maHoaDon}</td>
                      <td>{bill.thang}/{bill.nam}</td>
                      <td className="fw-bold">{formatCurrency(bill.tongTien)}</td>
                      <td>
                        <span className={`badge bg-${bill.trangThai === 'Đã thanh toán' ? 'success' : 'warning'}`}>
                          {bill.trangThai}
                        </span>
                      </td>
                      <td>{formatDate(bill.ngayTao || '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedBill !== null && (
                <div className="mt-3 p-3 border rounded bg-light">
                  <h5>Chi tiết hóa đơn</h5>
                  {loadingDetails ? (
                    <p>Đang tải...</p>
                  ) : selectedBill.length === 0 ? (
                    <p className="text-muted">Không có chi tiết</p>
                  ) : (
                    <table className="table table-sm">
                      <thead>
                        <tr><th>Loại phí</th><th>Tên phí</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr>
                      </thead>
                      <tbody>
                        {selectedBill.map(d => (
                          <tr key={d.maChiTiet}>
                            <td>{d.loaiPhi}</td>
                            <td>{d.tenPhi}</td>
                            <td>{d.soLuong ?? '-'}</td>
                            <td>{d.donGia ? formatCurrency(d.donGia) : '-'}</td>
                            <td>{formatCurrency(d.thanhTien)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
