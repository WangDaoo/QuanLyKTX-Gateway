import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { Receipt, Student, Bill } from '../../types/api';

export default function Receipts() {
  const [items, setItems] = useState<Receipt[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Receipt | null>(null);

  const [formData, setFormData] = useState({
    maHoaDon: '',
    maSinhVien: '',
    soTien: '',
    ngayThanhToan: '',
    phuongThuc: 'Tiền mặt',
    ghiChu: '',
  });

  const columns = [
    { key: 'maBienLai', label: 'Mã biên lai' },
    { key: 'hoTen', label: 'Sinh viên' },
    { key: 'soTien', label: 'Số tiền', render: (v: number) => formatCurrency(v ?? '') },
    { key: 'ngayThanhToan', label: 'Ngày thanh toán', render: (v: string) => formatDate(v ?? '') },
    { key: 'phuongThuc', label: 'Phương thức' },
    { key: 'maHoaDon', label: 'Mã hóa đơn' },
  ];

  const actions = (item: Receipt) => (
    <div className="action-buttons">
      <button className="btn btn-sm btn-warning" onClick={() => openEditModal(item)} title="Sửa">
        <i className="fas fa-edit"></i>
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maBienLai)} title="Xóa">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [receiptData, stuData, billData] = await Promise.all([
        apiClient.get<Receipt[]>(ENDPOINTS.RECEIPTS),
        apiClient.get<Student[]>(ENDPOINTS.STUDENTS),
        apiClient.get<Bill[]>(ENDPOINTS.BILLS),
      ]);
      setItems(Array.isArray(receiptData) ? receiptData : []);
      setStudents(Array.isArray(stuData) ? stuData : []);
      setBills(Array.isArray(billData) ? billData : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ maHoaDon: '', maSinhVien: '', soTien: '', ngayThanhToan: '', phuongThuc: 'Tiền mặt', ghiChu: '' });
    setModalOpen(true);
  };

  const openEditModal = (item: Receipt) => {
    setEditingItem(item);
    setFormData({
      maHoaDon: String(item.maHoaDon),
      maSinhVien: String(item.maSinhVien),
      soTien: String(item.soTien),
      ngayThanhToan: item.ngayThanhToan?.split('T')[0] || '',
      phuongThuc: item.phuongThuc,
      ghiChu: item.ghiChu || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.maHoaDon) {
      setAlert({ msg: 'Vui lòng chọn hóa đơn', type: 'warning' });
      return;
    }
    try {
      const payload = {
        maHoaDon: Number(formData.maHoaDon),
        maSinhVien: Number(formData.maSinhVien),
        soTien: Number(formData.soTien),
        ngayThanhToan: formData.ngayThanhToan,
        phuongThuc: formData.phuongThuc,
        ghiChu: formData.ghiChu,
      };
      if (editingItem) {
        await apiClient.put(ENDPOINTS.RECEIPT_BY_ID(editingItem.maBienLai), payload);
        setAlert({ msg: 'Cập nhật biên lai thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.RECEIPTS, payload);
        setAlert({ msg: 'Thêm biên lai thành công!', type: 'success' });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi lưu biên lai', type: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa biên lai này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.RECEIPT_BY_ID(id));
      setAlert({ msg: 'Xóa biên lai thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi xóa biên lai', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-receipt"></i> Quản lý Biên lai</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm biên lai
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có biên lai nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Sửa biên lai' : 'Thêm biên lai mới'} onSave={handleSave}>
        <div className="form-group">
          <label>Sinh viên <span className="text-danger">*</span></label>
          <select
            className="form-control"
            value={formData.maSinhVien}
            onChange={e => setFormData({ ...formData, maSinhVien: e.target.value })}
            required
          >
            <option value="">-- Chọn sinh viên --</option>
            {students.map(s => (
              <option key={s.maSinhVien} value={s.maSinhVien}>
                {s.hoTen || `SV #${s.maSinhVien}`} {s.cccd ? `(${s.cccd})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Hóa đơn <span className="text-danger">*</span></label>
          <select
            className="form-control"
            value={formData.maHoaDon}
            onChange={e => setFormData({ ...formData, maHoaDon: e.target.value })}
            required
          >
            <option value="">-- Chọn hóa đơn --</option>
            {bills.map(b => (
              <option key={b.maHoaDon} value={b.maHoaDon}>
                HĐ #{b.maHoaDon} - {b.hoTen || `SV #${b.maSinhVien}`} - {b.thang}/{b.nam}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Số tiền (VNĐ)</label>
          <input type="number" className="form-control" value={formData.soTien}
            onChange={e => setFormData({ ...formData, soTien: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Ngày thanh toán</label>
          <input type="date" className="form-control" value={formData.ngayThanhToan}
            onChange={e => setFormData({ ...formData, ngayThanhToan: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Phương thức</label>
          <select className="form-control" value={formData.phuongThuc}
            onChange={e => setFormData({ ...formData, phuongThuc: e.target.value })}>
            <option value="Tiền mặt">Tiền mặt</option>
            <option value="Chuyển khoản">Chuyển khoản</option>
            <option value="VNPay">VNPay</option>
          </select>
        </div>
        <div className="form-group">
          <label>Ghi chú</label>
          <textarea className="form-control" rows={2} value={formData.ghiChu}
            onChange={e => setFormData({ ...formData, ghiChu: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
