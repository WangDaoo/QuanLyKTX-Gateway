import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { FeeConfig } from '../../types/api';

export default function FeeConfigs() {
  const [items, setItems] = useState<FeeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeeConfig | null>(null);

  const [formData, setFormData] = useState({
    maPhi: '',
    loai: 'Cố định',
    giaTri: '',
    moTa: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    trangThai: true,
  });

  const columns = [
    { key: 'maCauHinh', label: 'Mã cấu hình' },
    { key: 'tenPhi', label: 'Tên phí' },
    { key: 'loai', label: 'Loại' },
    { key: 'giaTri', label: 'Giá trị', render: (v: number) => formatCurrency(v ?? '') },
    { key: 'trangThai', label: 'Trạng thái', render: (v: boolean) => (
      <span className={`badge ${v ? 'badge-success' : 'badge-secondary'}`}>{v ? 'Hoạt động' : 'Không hoạt động'}</span>
    )},
  ];

  const actions = (item: FeeConfig) => (
    <div className="action-buttons">
      <button className="btn btn-sm btn-warning" onClick={() => openEditModal(item)} title="Sửa">
        <i className="fas fa-edit"></i>
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maCauHinh)} title="Xóa">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<FeeConfig[]>(ENDPOINTS.FEE_CONFIGS);
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
    setFormData({ maPhi: '', loai: 'Cố định', giaTri: '', moTa: '', ngayBatDau: '', ngayKetThuc: '', trangThai: true });
    setModalOpen(true);
  };

  const openEditModal = (item: FeeConfig) => {
    setEditingItem(item);
    setFormData({
      maPhi: String(item.maPhi),
      loai: item.loai,
      giaTri: String(item.giaTri),
      moTa: item.moTa || '',
      ngayBatDau: item.ngayBatDau ? item.ngayBatDau.split('T')[0] : '',
      ngayKetThuc: item.ngayKetThuc ? item.ngayKetThuc.split('T')[0] : '',
      trangThai: item.trangThai ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        maPhi: Number(formData.maPhi),
        loai: formData.loai,
        giaTri: Number(formData.giaTri),
        moTa: formData.moTa,
        ngayBatDau: formData.ngayBatDau || undefined,
        ngayKetThuc: formData.ngayKetThuc || undefined,
        trangThai: formData.trangThai,
      };
      if (editingItem) {
        await apiClient.put(ENDPOINTS.FEE_CONFIG_BY_ID(editingItem.maCauHinh), payload);
        setAlert({ msg: 'Cập nhật cấu hình phí thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.FEE_CONFIGS, payload);
        setAlert({ msg: 'Thêm cấu hình phí thành công!', type: 'success' });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi lưu cấu hình phí', type: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.FEE_CONFIG_BY_ID(id));
      setAlert({ msg: 'Xóa cấu hình phí thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi xóa cấu hình phí', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-cog"></i> Quản lý Cấu hình Phí</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm cấu hình
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có cấu hình nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Sửa cấu hình phí' : 'Thêm cấu hình phí'} onSave={handleSave}>
        <div className="form-group">
          <label>Mã phí</label>
          <input type="number" className="form-control" value={formData.maPhi}
            onChange={e => setFormData({ ...formData, maPhi: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Loại</label>
          <select className="form-control" value={formData.loai}
            onChange={e => setFormData({ ...formData, loai: e.target.value })}>
            <option value="Cố định">Cố định</option>
            <option value="Theo bậc">Theo bậc</option>
            <option value="Theo lũy tiến">Theo lũy tiến</option>
          </select>
        </div>
        <div className="form-group">
          <label>Giá trị (VNĐ)</label>
          <input type="number" className="form-control" value={formData.giaTri}
            onChange={e => setFormData({ ...formData, giaTri: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Mô tả</label>
          <textarea className="form-control" rows={2} value={formData.moTa}
            onChange={e => setFormData({ ...formData, moTa: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Ngày bắt đầu</label>
          <input type="date" className="form-control" value={formData.ngayBatDau}
            onChange={e => setFormData({ ...formData, ngayBatDau: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Ngày kết thúc</label>
          <input type="date" className="form-control" value={formData.ngayKetThuc}
            onChange={e => setFormData({ ...formData, ngayKetThuc: e.target.value })} />
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
