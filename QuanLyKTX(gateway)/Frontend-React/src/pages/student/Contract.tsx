import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Contract } from '../../types/api';

export default function ContractPage() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState({ msg: '', type: '' });
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<Contract>(ENDPOINTS.USER_CONTRACTS_CURRENT);
      setContract(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!contract) return;
    setConfirming(true);
    try {
      await apiClient.post(ENDPOINTS.USER_CONTRACT_CONFIRM(contract.maHopDong));
      setShowAlert({ msg: 'Xác nhận hợp đồng thành công!', type: 'success' });
      loadData();
    } catch (err) {
      setShowAlert({ msg: err instanceof Error ? err.message : 'Lỗi xác nhận', type: 'danger' });
    } finally {
      setConfirming(false);
    }
  };

  const needsConfirmation = contract?.trangThai === 'Chờ xác nhận';

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-file-contract"></i> Hợp đồng thuê phòng</h1>
      </div>

      {showAlert.msg && (
        <div className={`alert alert-${showAlert.type}`}>{showAlert.msg}</div>
      )}

      {!contract ? (
        <div className="alert alert-info">Bạn chưa có hợp đồng thuê phòng.</div>
      ) : (
        <>
          {needsConfirmation && (
            <div className="alert alert-warning mb-3">
              <i className="fas fa-exclamation-triangle"></i>
              <strong> Hợp đồng này cần được xác nhận.</strong>
              <button className="btn btn-success btn-sm ms-3" onClick={handleConfirm} disabled={confirming}>
                {confirming ? 'Đang xác nhận...' : 'Xác nhận hợp đồng'}
              </button>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3>Thông tin hợp đồng #{contract.maHopDong}</h3>
            </div>
            <div className="card-body">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th width="200">Mã hợp đồng</th>
                    <td>{contract.maHopDong}</td>
                  </tr>
                  <tr>
                    <th>Sinh viên</th>
                    <td>{contract.hoTen || contract.maSinhVien}</td>
                  </tr>
                  <tr>
                    <th>Phòng</th>
                    <td>{contract.tenPhong || contract.maPhong}</td>
                  </tr>
                  <tr>
                    <th>Ngày bắt đầu</th>
                    <td>{formatDate(contract.ngayBatDau)}</td>
                  </tr>
                  <tr>
                    <th>Ngày kết thúc</th>
                    <td>{formatDate(contract.ngayKetThuc)}</td>
                  </tr>
                  <tr>
                    <th>Tiền đặt cọc</th>
                    <td className="text-primary fw-bold">{formatCurrency(contract.tienDatCoc)}</td>
                  </tr>
                  <tr>
                    <th>Trạng thái</th>
                    <td>
                      <span className={`badge bg-${
                        contract.trangThai === 'Đang hoạt động' ? 'success' :
                        contract.trangThai === 'Đã hết hạn' ? 'secondary' :
                        contract.trangThai === 'Chờ xác nhận' ? 'warning' : 'info'
                      }`}>
                        {contract.trangThai}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Ngày tạo</th>
                    <td>{formatDate(contract.ngayTao || '')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
