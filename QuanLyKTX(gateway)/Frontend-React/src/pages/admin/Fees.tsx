import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { Fee } from '../../types/api';

export default function Fees() {
  const [items, setItems] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Fee | null>(null);

  const [formData, setFormData] = useState({
    tenPhi: '',
    loaiPhi: 'Tiền phòng',
    soTien: '',
    donVi: 'VNĐ/tháng',
    moTa: '',
    trangThai: true,
  });

  const columns = [
    { key: 'maMucPhi', label: 'Mã phí' },
    { key: 'tenMucPhi', label: 'Tên phí' },
    { key: 'loaiPhi', label: 'Loại phí' },
    { key: 'giaTien', label: 'Số tiền', render: (v: number) => formatCurrency(v) },
    { key: 'donVi', label: 'Đơn vị' },
    { key: 'trangThai', label: 'Trạng thái', render: (v: boolean) => (
      <span className={`badge ${v ? 'badge-success' : 'badge-secondary'}`}>{v ? 'Hoạt động' : 'Không hoạt động'}</span>
    )},
  ];

  const actions = (item: Fee) => (
    <div className="action-buttons">
      <button className="btn btn-sm btn-warning" onClick={() => openEditModal(item)} title="Sửa">
        <i className="fas fa-edit"></i>
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maMucPhi)} title="Xóa">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Fee[]>(ENDPOINTS.FEES);
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ tenPhi: '', loaiPhi: 'Tiền phòng', soTien: '', donVi: 'VNĐ/tháng', moTa: '', trangThai: true });
    setModalOpen(true);
  };

  const openEditModal = (item: Fee) => {
    setEditingItem(item);
    setFormData({
      tenPhi: item.tenMucPhi,
      loaiPhi: item.loaiPhi,
      soTien: String(item.giaTien),
      donVi: item.donVi || 'VNĐ/tháng',
      moTa: item.ghiChu || '',
      trangThai: item.trangThai ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        tenMucPhi: formData.tenPhi,
        loaiPhi: formData.loaiPhi,
        giaTien: Number(formData.soTien),
        donVi: formData.donVi,
        ghiChu: formData.moTa,
        trangThai: formData.trangThai,
      };
      if (editingItem) {
        await apiClient.put(ENDPOINTS.FEE_BY_ID(editingItem.maMucPhi), payload);
        setAlert({ msg: 'Cập nhật phí thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.FEES, payload);
        setAlert({ msg: 'Thêm phí thành công!', type: 'success' });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi lưu phí', type: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phí này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.FEE_BY_ID(id));
      setAlert({ msg: 'Xóa phí thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi xóa phí', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-money-bill-wave"></i> Quản lý Phí</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm phí mới
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có phí nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Sửa phí' : 'Thêm phí mới'} onSave={handleSave}>
        <div className="form-group">
          <label>Tên phí</label>
          <input type="text" className="form-control" value={formData.tenPhi}
            onChange={e => setFormData({ ...formData, tenPhi: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Loại phí</label>
          <select className="form-control" value={formData.loaiPhi}
            onChange={e => setFormData({ ...formData, loaiPhi: e.target.value })}>
            <option value="Tiền phòng">Tiền phòng</option>
            <option value="Tiền điện">Tiền điện</option>
            <option value="Tiền nước">Tiền nước</option>
            <option value="Phí dịch vụ">Phí dịch vụ</option>
            <option value="Phí khác">Phí khác</option>
          </select>
        </div>
        <div className="form-group">
          <label>Số tiền (VNĐ)</label>
          <input type="number" className="form-control" value={formData.soTien}
            onChange={e => setFormData({ ...formData, soTien: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Đơn vị</label>
          <input type="text" className="form-control" value={formData.donVi}
            onChange={e => setFormData({ ...formData, donVi: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Mô tả</label>
          <textarea className="form-control" rows={2} value={formData.moTa}
            onChange={e => setFormData({ ...formData, moTa: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Trạng thái</label>
          <select className="form-control" value={String(formData.trangThai)}
            onChange={e => setFormData({ ...formData, trangThai: e.target.value === 'true' })}>
            <option value="true">Hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
