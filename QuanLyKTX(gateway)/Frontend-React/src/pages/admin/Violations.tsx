import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { Violation, Student } from '../../types/api';

export default function Violations() {
  const [items, setItems] = useState<Violation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Violation | null>(null);

  const [formData, setFormData] = useState({
    maSinhVien: '',
    loaiViPham: 'Vi phạm nội quy',
    moTa: '',
    mucPhat: '',
    ngayViPham: '',
    trangThai: 'Chưa xử lý',
  });

  const columns = [
    { key: 'maKyLuat', label: 'Mã VP' },
    { key: 'tenSinhVien', label: 'Sinh viên' },
    { key: 'loaiViPham', label: 'Loại vi phạm' },
    { key: 'moTa', label: 'Mô tả' },
    { key: 'mucPhat', label: 'Mức phạt', render: (v: number) => formatCurrency(v) },
    { key: 'ngayViPham', label: 'Ngày vi phạm', render: (v: string) => formatDate(v) },
    { key: 'trangThai', label: 'Trạng thái', render: (v: string) => {
      const cls = v === 'Đã xử lý' ? 'badge-success' : v === 'Chưa xử lý' ? 'badge-warning' : 'badge-danger';
      return <span className={`badge ${cls}`}>{v}</span>;
    }},
  ];

  const actions = (item: Violation) => (
    <div className="action-buttons">
      <button className="btn btn-sm btn-warning" onClick={() => openEditModal(item)} title="Sửa">
        <i className="fas fa-edit"></i>
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maKyLuat)} title="Xóa">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [violData, stuData] = await Promise.all([
        apiClient.get<Violation[]>(ENDPOINTS.VIOLATIONS),
        apiClient.get<Student[]>(ENDPOINTS.STUDENTS),
      ]);
      setItems(Array.isArray(violData) ? violData : []);
      setStudents(Array.isArray(stuData) ? stuData : []);
    } catch (err: any) {
      setAlert({ msg: err.message || 'Không thể tải dữ liệu', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ maSinhVien: '', loaiViPham: 'Vi phạm nội quy', moTa: '', mucPhat: '', ngayViPham: '', trangThai: 'Chưa xử lý' });
    setModalOpen(true);
  };

  const openEditModal = (item: Violation) => {
    setEditingItem(item);
    setFormData({
      maSinhVien: String(item.maSinhVien),
      loaiViPham: item.loaiViPham,
      moTa: item.moTa,
      mucPhat: String(item.mucPhat),
      ngayViPham: item.ngayViPham?.split('T')[0] || '',
      trangThai: item.trangThai,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.maSinhVien) {
      setAlert({ msg: 'Vui lòng chọn sinh viên', type: 'warning' });
      return;
    }
    try {
      const payload = {
        maSinhVien: Number(formData.maSinhVien),
        loaiViPham: formData.loaiViPham,
        moTa: formData.moTa,
        mucPhat: Number(formData.mucPhat),
        ngayViPham: formData.ngayViPham,
        trangThai: formData.trangThai,
      };
      if (editingItem) {
        await apiClient.put(ENDPOINTS.VIOLATION_BY_ID(editingItem.maKyLuat), payload);
        setAlert({ msg: 'Cập nhật vi phạm thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.VIOLATIONS, payload);
        setAlert({ msg: 'Thêm vi phạm thành công!', type: 'success' });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi lưu vi phạm', type: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vi phạm này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.VIOLATION_BY_ID(id));
      setAlert({ msg: 'Xóa vi phạm thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi xóa vi phạm', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-exclamation-triangle"></i> Quản lý Vi Phạm</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm vi phạm
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có vi phạm nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Sửa vi phạm' : 'Thêm vi phạm mới'} onSave={handleSave}>
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
          <label>Loại vi phạm</label>
          <select className="form-control" value={formData.loaiViPham}
            onChange={e => setFormData({ ...formData, loaiViPham: e.target.value })}>
            <option value="Vi phạm nội quy">Vi phạm nội quy</option>
            <option value="Vi phạm an toàn">Vi phạm an toàn</option>
            <option value="Vi phạm vệ sinh">Vi phạm vệ sinh</option>
            <option value="Vi phạm tài sản">Vi phạm tài sản</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div className="form-group">
          <label>Mô tả</label>
          <textarea className="form-control" rows={3} value={formData.moTa}
            onChange={e => setFormData({ ...formData, moTa: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Mức phạt (VNĐ)</label>
          <input type="number" className="form-control" value={formData.mucPhat}
            onChange={e => setFormData({ ...formData, mucPhat: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Ngày vi phạm</label>
          <input type="date" className="form-control" value={formData.ngayViPham}
            onChange={e => setFormData({ ...formData, ngayViPham: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Trạng thái</label>
          <select className="form-control" value={formData.trangThai}
            onChange={e => setFormData({ ...formData, trangThai: e.target.value })}>
            <option value="Chưa xử lý">Chưa xử lý</option>
            <option value="Đã xử lý">Đã xử lý</option>
            <option value="Bị hủy">Bị hủy</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
