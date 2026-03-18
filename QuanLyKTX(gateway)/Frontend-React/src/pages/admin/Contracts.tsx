import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { Contract, Student, Bed, Room } from '../../types/api';

export default function Contracts() {
  const [items, setItems] = useState<Contract[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Contract | null>(null);

  const [formData, setFormData] = useState({
    maSinhVien: '',
    maGiuong: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    giaPhong: '',
    trangThai: 'Chờ duyệt',
    ghiChu: '',
  });

  const getStudentName = (maSinhVien: number) => {
    const s = students.find(x => x.maSinhVien === maSinhVien);
    return s?.hoTen || `SV #${maSinhVien}`;
  };

  const getBedLabel = (maGiuong: number) => {
    const b = beds.find(x => x.maGiuong === maGiuong);
    if (!b) return `Giường #${maGiuong}`;
    const r = rooms.find(x => x.maPhong === b.maPhong);
    return `${r?.soPhong || `Phòng #${b.maPhong}`} - Giường ${b.soGiuong}`;
  };

  const columns = [
    { key: 'maHopDong', label: 'Mã HĐ' },
    { key: 'maSinhVien', label: 'Sinh viên', render: (v: number) => getStudentName(v) },
    { key: 'maGiuong', label: 'Giường', render: (v: number) => getBedLabel(v) },
    { key: 'ngayBatDau', label: 'Ngày bắt đầu', render: (v: string) => formatDate(v ?? '') },
    { key: 'ngayKetThuc', label: 'Ngày kết thúc', render: (v: string) => formatDate(v ?? '') },
    { key: 'giaPhong', label: 'Giá phòng', render: (v: number) => formatCurrency(v ?? '') },
    { key: 'trangThai', label: 'Trạng thái' },
  ];

  const actions = (item: Contract) => (
    <div className="action-buttons">
      <button className="btn btn-sm btn-warning" onClick={() => openEditModal(item)} title="Sửa">
        <i className="fas fa-edit"></i>
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maHopDong)} title="Xóa">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [contractData, stuData, bedData, roomData] = await Promise.all([
        apiClient.get<Contract[]>(ENDPOINTS.CONTRACTS),
        apiClient.get<Student[]>(ENDPOINTS.STUDENTS),
        apiClient.get<Bed[]>(ENDPOINTS.BEDS),
        apiClient.get<Room[]>(ENDPOINTS.ROOMS),
      ]);
      setItems(Array.isArray(contractData) ? contractData : []);
      setStudents(Array.isArray(stuData) ? stuData : []);
      setBeds(Array.isArray(bedData) ? bedData : []);
      setRooms(Array.isArray(roomData) ? roomData : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ maSinhVien: '', maGiuong: '', ngayBatDau: '', ngayKetThuc: '', giaPhong: '', trangThai: 'Chờ duyệt', ghiChu: '' });
    setModalOpen(true);
  };

  const openEditModal = (item: Contract) => {
    setEditingItem(item);
    setFormData({
      maSinhVien: String(item.maSinhVien),
      maGiuong: String(item.maGiuong),
      ngayBatDau: item.ngayBatDau?.split('T')[0] || '',
      ngayKetThuc: item.ngayKetThuc?.split('T')[0] || '',
      giaPhong: String(item.giaPhong || ''),
      trangThai: item.trangThai || 'Chờ duyệt',
      ghiChu: item.ghiChu || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.maSinhVien || !formData.maGiuong) {
      setAlert({ msg: 'Vui lòng chọn sinh viên và giường', type: 'warning' });
      return;
    }
    try {
      const payload = {
        maSinhVien: Number(formData.maSinhVien),
        maGiuong: Number(formData.maGiuong),
        ngayBatDau: formData.ngayBatDau,
        ngayKetThuc: formData.ngayKetThuc,
        giaPhong: Number(formData.giaPhong),
        trangThai: formData.trangThai,
        ghiChu: formData.ghiChu || null,
      };
      if (editingItem) {
        await apiClient.put(ENDPOINTS.CONTRACT_BY_ID(editingItem.maHopDong), payload);
        setAlert({ msg: 'Cập nhật hợp đồng thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.CONTRACTS, payload);
        setAlert({ msg: 'Thêm hợp đồng thành công!', type: 'success' });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi lưu hợp đồng', type: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.CONTRACT_BY_ID(id));
      setAlert({ msg: 'Xóa hợp đồng thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi xóa hợp đồng', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-file-contract"></i> Quản lý Hợp đồng</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm hợp đồng
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có hợp đồng nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Sửa hợp đồng' : 'Thêm hợp đồng mới'} onSave={handleSave}>
        <div className="form-group">
          <label>Sinh viên <span className="text-danger">*</span></label>
          <select className="form-control" value={formData.maSinhVien} onChange={e => setFormData({ ...formData, maSinhVien: e.target.value })}>
            <option value="">-- Chọn sinh viên --</option>
            {students.map(s => (
              <option key={s.maSinhVien} value={s.maSinhVien}>{s.hoTen || `SV #${s.maSinhVien}`} ({s.mssv || 'N/A'})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Giường <span className="text-danger">*</span></label>
          <select className="form-control" value={formData.maGiuong} onChange={e => setFormData({ ...formData, maGiuong: e.target.value })}>
            <option value="">-- Chọn giường --</option>
            {beds.map(b => (
              <option key={b.maGiuong} value={b.maGiuong}>{getBedLabel(b.maGiuong)} - {b.trangThai}</option>
            ))}
          </select>
        </div>
        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input type="date" className="form-control" value={formData.ngayBatDau} onChange={e => setFormData({ ...formData, ngayBatDau: e.target.value })} required />
            </div>
          </div>
          <div className="col-6">
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input type="date" className="form-control" value={formData.ngayKetThuc} onChange={e => setFormData({ ...formData, ngayKetThuc: e.target.value })} required />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Giá phòng</label>
          <input type="number" className="form-control" value={formData.giaPhong} onChange={e => setFormData({ ...formData, giaPhong: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Trạng thái</label>
          <select className="form-control" value={formData.trangThai} onChange={e => setFormData({ ...formData, trangThai: e.target.value })}>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đã hủy">Đã hủy</option>
            <option value="Hết hạn">Hết hạn</option>
          </select>
        </div>
        <div className="form-group">
          <label>Ghi chú</label>
          <textarea className="form-control" rows={2} value={formData.ghiChu} onChange={e => setFormData({ ...formData, ghiChu: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
