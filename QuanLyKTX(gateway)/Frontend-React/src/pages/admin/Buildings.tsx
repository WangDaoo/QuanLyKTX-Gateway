// Buildings - CRUD for Buildings
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import type { Building } from '../../types/api';
import { formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal, { useModal } from '../../components/common/Modal';

interface BuildingFormData {
  tenToaNha: string;
  diaChi: string;
  soTang: number;
  moTa: string;
  trangThai: boolean;
}

const emptyForm: BuildingFormData = {
  tenToaNha: '',
  diaChi: '',
  soTang: 1,
  moTa: '',
  trangThai: true,
};

export default function Buildings() {
  const [data, setData] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'danger' | 'warning' | 'info'>('info');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BuildingFormData>(emptyForm);
  const { isOpen, open, close } = useModal();

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiClient.get<Building[]>(ENDPOINTS.BUILDINGS);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    open(true);
  };

  const handleOpenEdit = (item: Building) => {
    setEditingId(item.maToaNha);
    setFormData({
      tenToaNha: item.tenToaNha,
      diaChi: item.diaChi || '',
      soTang: item.soTang || 1,
      moTa: item.moTa || '',
      trangThai: item.trangThai ?? true,
    });
    open(true);
  };

  const handleSave = async () => {
    if (!formData.tenToaNha.trim()) {
      setAlertMsg('Tên tòa nhà không được để trống');
      setAlertType('warning');
      return;
    }
    try {
      if (editingId) {
        await apiClient.put(`${ENDPOINTS.BUILDING_BY_ID(editingId)}`, formData);
        setAlertMsg('Cập nhật tòa nhà thành công!');
        setAlertType('success');
      } else {
        await apiClient.post(ENDPOINTS.BUILDINGS, formData);
        setAlertMsg('Thêm tòa nhà mới thành công!');
        setAlertType('success');
      }
      close();
      loadData();
    } catch (err) {
      setAlertMsg(err instanceof Error ? err.message : 'Lưu thất bại');
      setAlertType('danger');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa tòa nhà này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.BUILDING_BY_ID(id));
      setAlertMsg('Xóa tòa nhà thành công!');
      setAlertType('success');
      loadData();
    } catch (err) {
      setAlertMsg(err instanceof Error ? err.message : 'Xóa thất bại');
      setAlertType('danger');
    }
  };

  const columns = [
    { key: 'maToaNha', label: 'Mã tòa nhà' },
    { key: 'tenToaNha', label: 'Tên tòa nhà' },
    { key: 'diaChi', label: 'Địa chỉ' },
    { key: 'soTang', label: 'Số tầng' },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      render: (_, item: Building) => (
        <span className={`badge ${item.trangThai ? 'badge-success' : 'badge-secondary'}`}>
          {item.trangThai ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      ),
    },
    { key: 'ngayTao', label: 'Ngày tạo', render: (_, item: Building) => formatDate(item.ngayTao) },
    {
      key: 'actions',
      label: 'Hành động',
      render: (_, item: Building) => (
        <div className="d-flex gap-1">
          <button className="btn btn-sm btn-primary" onClick={() => handleOpenEdit(item)} title="Sửa">
            <i className="fas fa-edit"></i>
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maToaNha)} title="Xóa">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1><i className="fas fa-building"></i> Quản lý Tòa nhà</h1>
        <p>Thêm, sửa, xóa thông tin tòa nhà trong ký túc xá</p>
      </div>

      {alertMsg && <Alert message={alertMsg} type={alertType} onClose={() => setAlertMsg('')} />}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><i className="fas fa-list"></i> Danh sách tòa nhà</h3>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <i className="fas fa-plus"></i> Thêm tòa nhà
          </button>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={data} loading={loading} />
        </div>
      </div>

      {/* Modal Form */}
      <Modal id="building-modal" open={isOpen} title={editingId ? 'Sửa tòa nhà' : 'Thêm tòa nhà mới'} onClose={close} footer={
        <>
          <button className="btn btn-secondary" onClick={close}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="fas fa-save"></i> Lưu
          </button>
        </>
      }>
        <div className="form-group">
          <label>Tên tòa nhà <span className="text-danger">*</span></label>
          <input type="text" className="form-control" value={formData.tenToaNha}
            onChange={(e) => setFormData({ ...formData, tenToaNha: e.target.value })} placeholder="VD: Tòa A" />
        </div>
        <div className="form-group">
          <label>Địa chỉ</label>
          <input type="text" className="form-control" value={formData.diaChi}
            onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })} placeholder="VD: 123 Đường ABC" />
        </div>
        <div className="form-group">
          <label>Số tầng</label>
          <input type="number" className="form-control" min={1} value={formData.soTang}
            onChange={(e) => setFormData({ ...formData, soTang: Number(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Mô tả</label>
          <textarea className="form-control" rows={3} value={formData.moTa}
            onChange={(e) => setFormData({ ...formData, moTa: e.target.value })} placeholder="Mô tả tòa nhà..." />
        </div>
        <div className="form-group">
          <label className="d-flex align-items-center gap-2">
            <input type="checkbox" checked={formData.trangThai}
              onChange={(e) => setFormData({ ...formData, trangThai: e.target.checked })} />
            Hoạt động
          </label>
        </div>
      </Modal>
    </div>
  );
}
