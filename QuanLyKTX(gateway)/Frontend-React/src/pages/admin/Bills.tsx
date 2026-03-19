import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { Bill, BillDetail } from '../../types/api';

export default function Bills() {
  const [items, setItems] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billDetails, setBillDetails] = useState<BillDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [createForm, setCreateForm] = useState({ thang: '', nam: '' });

  const columns = [
    { key: 'maHoaDon', label: 'Mã HĐ' },
    { key: 'hoTen', label: 'Sinh viên' },
    { key: 'thang', label: 'Tháng' },
    { key: 'nam', label: 'Năm' },
    { key: 'tongTien', label: 'Tổng tiền', render: (v: number) => formatCurrency(v ?? '') },
    { key: 'trangThai', label: 'Trạng thái', render: (v: string) => {
      const cls = v === 'Đã thanh toán' ? 'badge-success' : v === 'Chưa thanh toán' ? 'badge-warning' : 'badge-danger';
      return <span className={`badge ${cls}`}>{v}</span>;
    }},
  ];

  const actions = (item: Bill) => (
    <div className="action-buttons">
      <button className="btn btn-sm btn-info" onClick={() => openDetailModal(item)} title="Chi tiết">
        <i className="fas fa-eye"></i>
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maHoaDon)} title="Xóa">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const detailColumns = [
    { key: 'loaiPhi', label: 'Loại phí' },
    { key: 'tenPhi', label: 'Tên phí' },
    { key: 'soLuong', label: 'Số lượng' },
    { key: 'donGia', label: 'Đơn giá', render: (v: number) => formatCurrency(v ?? '') },
    { key: 'thanhTien', label: 'Thành tiền', render: (v: number) => formatCurrency(v ?? '') },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Bill[]>(ENDPOINTS.BILLS);
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openDetailModal = async (item: Bill) => {
    setSelectedBill(item);
    setDetailsLoading(true);
    setDetailModalOpen(true);
    try {
      const details = await apiClient.get<BillDetail[]>(ENDPOINTS.BILL_DETAILS(item.maHoaDon));
      setBillDetails(Array.isArray(details) ? details : []);
    } catch (err: any) {
      setAlert({ msg: err.message || 'Không thể tải chi tiết hóa đơn', type: 'danger' });
      setBillDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreateBill = async () => {
    try {
      const thang = Number(createForm.thang);
      const nam = Number(createForm.nam);
      await apiClient.post(`${ENDPOINTS.BILL_CALCULATE_MONTHLY}?thang=${thang}&nam=${nam}`);
      setAlert({ msg: 'Tạo hóa đơn hàng tháng thành công!', type: 'success' });
      setCreateModalOpen(false);
      setCreateForm({ thang: '', nam: '' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi tạo hóa đơn', type: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.BILL_BY_ID(id));
      setAlert({ msg: 'Xóa hóa đơn thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi xóa hóa đơn', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-file-invoice-dollar"></i> Quản lý Hóa đơn</h1>
        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
          <i className="fas fa-plus"></i> Tạo hóa đơn
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có hóa đơn nào" />

      {/* Detail Modal */}
      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Chi tiết hóa đơn">
        {selectedBill && (
          <div className="mb-3">
            <div className="row">
              <div className="col-6"><strong>Mã hóa đơn:</strong> {selectedBill.maHoaDon}</div>
              <div className="col-6"><strong>Sinh viên:</strong> {selectedBill.hoTen}</div>
              <div className="col-6"><strong>Tháng/Năm:</strong> {selectedBill.thang}/{selectedBill.nam}</div>
              <div className="col-6"><strong>Tổng tiền:</strong> {formatCurrency(selectedBill.tongTien)}</div>
              <div className="col-6"><strong>Trạng thái:</strong> <span className={`badge ${selectedBill.trangThai === 'Đã thanh toán' ? 'badge-success' : 'badge-warning'}`}>{selectedBill.trangThai}</span></div>
            </div>
            <hr />
            <h5>Chi tiết các khoản phí</h5>
            {detailsLoading ? (
              <div className="text-center"><i className="fas fa-spinner fa-spin"></i> Đang tải...</div>
            ) : (
              <DataTable columns={detailColumns} data={billDetails} emptyMessage="Không có chi tiết" />
            )}
            {!detailsLoading && billDetails.length > 0 && (
              <div className="text-end mt-2">
                <h5>Tổng cộng: <span className="text-danger">{formatCurrency(selectedBill.tongTien)}</span></h5>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Bill Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Tạo hóa đơn hàng tháng" onSave={handleCreateBill}>
        <div className="form-group">
          <label>Tháng</label>
          <input type="number" className="form-control" min="1" max="12" value={createForm.thang}
            onChange={e => setCreateForm({ ...createForm, thang: e.target.value })} placeholder="1-12" required />
        </div>
        <div className="form-group">
          <label>Năm</label>
          <input type="number" className="form-control" min="2020" value={createForm.nam}
            onChange={e => setCreateForm({ ...createForm, nam: e.target.value })} placeholder="2020" required />
        </div>
      </Modal>
    </div>
  );
}
