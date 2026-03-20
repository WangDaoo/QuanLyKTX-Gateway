import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { DisciplineScore, Student } from '../../types/api';

export default function DisciplineScores() {
  const [items, setItems] = useState<DisciplineScore[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DisciplineScore | null>(null);

  const [formData, setFormData] = useState({
    maSinhVien: '',
    thang: '',
    nam: '',
    diem: '',
    xepLoai: '',
    nhanXet: '',
  });

  const getXepLoaiBadge = (xepLoai: string) => {
    const cls = xepLoai === 'Tốt' ? 'badge-success'
      : xepLoai === 'Khá' ? 'badge-info'
      : xepLoai === 'Trung bình' ? 'badge-warning'
      : 'badge-danger';
    return <span className={`badge ${cls}`}>{xepLoai || 'N/A'}</span>;
  };

  const columns = [
    { key: 'maDiem', label: 'Mã điểm' },
    { key: 'hoTen', label: 'Sinh viên' },
    { key: 'thang', label: 'Tháng' },
    { key: 'nam', label: 'Năm' },
    { key: 'diem', label: 'Điểm' },
    { key: 'xepLoai', label: 'Xếp loại', render: (v: string) => getXepLoaiBadge(v) },
    { key: 'nhanXet', label: 'Nhận xét' },
  ];

  const actions = (item: DisciplineScore) => (
    <div className="action-buttons">
      <button className="btn btn-sm btn-warning" onClick={() => openEditModal(item)} title="Sửa">
        <i className="fas fa-edit"></i>
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maDiem)} title="Xóa">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [scoreData, stuData] = await Promise.all([
        apiClient.get<DisciplineScore[]>(ENDPOINTS.DISCIPLINE_SCORES),
        apiClient.get<Student[]>(ENDPOINTS.STUDENTS),
      ]);
      setItems(Array.isArray(scoreData) ? scoreData : []);
      setStudents(Array.isArray(stuData) ? stuData : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ maSinhVien: '', thang: '', nam: '', diem: '', xepLoai: '', nhanXet: '' });
    setModalOpen(true);
  };

  const openEditModal = (item: DisciplineScore) => {
    setEditingItem(item);
    setFormData({
      maSinhVien: String(item.maSinhVien),
      thang: String(item.thang),
      nam: String(item.nam),
      diem: String(item.diem),
      xepLoai: item.xepLoai || '',
      nhanXet: item.nhanXet || '',
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
        thang: Number(formData.thang),
        nam: Number(formData.nam),
        diem: Number(formData.diem),
        xepLoai: formData.xepLoai,
        nhanXet: formData.nhanXet,
      };
      if (editingItem) {
        await apiClient.put(ENDPOINTS.DISCIPLINE_SCORE_BY_ID(editingItem.maDiem), payload);
        setAlert({ msg: 'Cập nhật điểm rèn luyện thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.DISCIPLINE_SCORES, payload);
        setAlert({ msg: 'Thêm điểm rèn luyện thành công!', type: 'success' });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi lưu điểm rèn luyện', type: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa điểm rèn luyện này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.DISCIPLINE_SCORE_BY_ID(id));
      setAlert({ msg: 'Xóa điểm rèn luyện thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi xóa điểm rèn luyện', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-star"></i> Quản lý Điểm Rèn Luyện</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm điểm rèn luyện
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có điểm rèn luyện nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Sửa điểm rèn luyện' : 'Thêm điểm rèn luyện'} onSave={handleSave}>
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
        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label>Tháng</label>
              <input type="number" className="form-control" min="1" max="12" value={formData.thang}
                onChange={e => setFormData({ ...formData, thang: e.target.value })} required />
            </div>
          </div>
          <div className="col-6">
            <div className="form-group">
              <label>Năm</label>
              <input type="number" className="form-control" min="2020" value={formData.nam}
                onChange={e => setFormData({ ...formData, nam: e.target.value })} required />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Điểm</label>
          <input type="number" className="form-control" min="0" max="100" step="0.1" value={formData.diem}
            onChange={e => setFormData({ ...formData, diem: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Xếp loại</label>
          <select className="form-control" value={formData.xepLoai}
            onChange={e => setFormData({ ...formData, xepLoai: e.target.value })}>
            <option value="">-- Chọn xếp loại --</option>
            <option value="Tốt">Tốt</option>
            <option value="Khá">Khá</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Yếu">Yếu</option>
          </select>
        </div>
        <div className="form-group">
          <label>Nhận xét</label>
          <textarea className="form-control" rows={3} value={formData.nhanXet}
            onChange={e => setFormData({ ...formData, nhanXet: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
