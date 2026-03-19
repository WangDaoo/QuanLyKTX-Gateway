import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { PriceTier } from '../../types/api';

export default function PriceTiers() {
  const [items, setItems] = useState<PriceTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceTier | null>(null);

  const [formData, setFormData] = useState({
    loai: 'Điện',
    tuKwh: '',
    denKwh: '',
    giaDonVi: '',
    moTa: '',
    trangThai: true,
  });

  const columns = [
    { key: 'maBacGia', label: 'Mã bậc giá' },
    { key: 'loai', label: 'Loại' },
    { key: 'tuKwh', label: 'Từ (kWh)' },
    { key: 'denKwh', label: 'Đến (kWh)' },
    { key: 'giaDonVi', label: 'Giá đơn vị', render: (v: number) => formatCurrency(v ?? '') },
    { key: 'trangThai', label: 'Trạng thái', render: (v: boolean) => (
      <span className={`badge ${v ? 'badge-success' : 'badge-secondary'}`}>{v ? 'Hoạt động' : 'Không hoạt động'}</span>
    )},
  ];

  const actions = (item: PriceTier) => (
    <div className="action-buttons">
      <button className="btn btn-sm btn-warning" onClick={() => openEditModal(item)} title="Sửa">
        <i className="fas fa-edit"></i>
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maBacGia)} title="Xóa">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<PriceTier[]>(ENDPOINTS.PRICE_TIERS);
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
    setFormData({ loai: 'Điện', tuKwh: '', denKwh: '', giaDonVi: '', moTa: '', trangThai: true });
    setModalOpen(true);
  };

  const openEditModal = (item: PriceTier) => {
    setEditingItem(item);
    setFormData({
      loai: item.loai,
      tuKwh: String(item.tuKwh ?? ''),
      denKwh: String(item.denKwh ?? ''),
      giaDonVi: String(item.giaDonVi),
      moTa: item.moTa || '',
      trangThai: item.trangThai ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        loai: formData.loai,
        tuKwh: Number(formData.tuKwh),
        denKwh: Number(formData.denKwh),
        giaDonVi: Number(formData.giaDonVi),
        moTa: formData.moTa,
        trangThai: formData.trangThai,
      };
      if (editingItem) {
        await apiClient.put(ENDPOINTS.PRICE_TIER_BY_ID(editingItem.maBacGia), payload);
        setAlert({ msg: 'Cập nhật bậc giá thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.PRICE_TIERS, payload);
        setAlert({ msg: 'Thêm bậc giá thành công!', type: 'success' });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi lưu bậc giá', type: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bậc giá này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.PRICE_TIER_BY_ID(id));
      setAlert({ msg: 'Xóa bậc giá thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi xóa bậc giá', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-layer-group"></i> Quản lý Bậc Giá Điện/Nước</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm bậc giá
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có bậc giá nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Sửa bậc giá' : 'Thêm bậc giá mới'} onSave={handleSave}>
        <div className="form-group">
          <label>Loại</label>
          <select className="form-control" value={formData.loai}
            onChange={e => setFormData({ ...formData, loai: e.target.value })}>
            <option value="Điện">Điện</option>
            <option value="Nước">Nước</option>
          </select>
        </div>
        <div className="form-group">
          <label>Từ (kWh / m³)</label>
          <input type="number" className="form-control" value={formData.tuKwh}
            onChange={e => setFormData({ ...formData, tuKwh: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Đến (kWh / m³)</label>
          <input type="number" className="form-control" value={formData.denKwh}
            onChange={e => setFormData({ ...formData, denKwh: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Giá đơn vị (VNĐ)</label>
          <input type="number" className="form-control" value={formData.giaDonVi}
            onChange={e => setFormData({ ...formData, giaDonVi: e.target.value })} required />
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
