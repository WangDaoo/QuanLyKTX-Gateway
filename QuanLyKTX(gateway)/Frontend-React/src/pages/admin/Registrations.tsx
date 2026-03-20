import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { Registration, Student, Room } from '../../types/api';

export default function Registrations() {
  const [items, setItems] = useState<Registration[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    maSinhVien: '',
    maPhongDeXuat: '',
    ghiChu: '',
  });

  const getStatusBadge = (trangThai: string) => {
    const cls = trangThai === 'Đã duyệt' ? 'badge-success'
      : trangThai === 'Chờ duyệt' ? 'badge-warning'
      : trangThai === 'Từ chối' ? 'badge-danger'
      : 'badge-secondary';
    return <span className={`badge ${cls}`}>{trangThai}</span>;
  };

  const columns = [
    { key: 'maDon', label: 'Mã ĐK' },
    { key: 'tenSinhVien', label: 'Sinh viên' },
    { key: 'phongDeXuat', label: 'Phòng yêu cầu' },
    { key: 'ngayDangKy', label: 'Ngày đăng ký', render: (v: string) => formatDate(v ?? '') },
    { key: 'trangThai', label: 'Trạng thái', render: (v: string) => getStatusBadge(v ?? '') },
  ];

  const actions = (item: Registration) => (
    <div className="action-buttons">
      {item.trangThai === 'Chờ duyệt' && (
        <>
          <button className="btn btn-sm btn-success" onClick={() => handleApprove(item)} title="Duyệt">
            <i className="fas fa-check"></i> Duyệt
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleReject(item)} title="Từ chối">
            <i className="fas fa-times"></i> Từ chối
          </button>
        </>
      )}
    </div>
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [regData, stuData, roomData] = await Promise.all([
        apiClient.get<Registration[]>(ENDPOINTS.REGISTRATIONS),
        apiClient.get<Student[]>(ENDPOINTS.STUDENTS),
        apiClient.get<Room[]>(ENDPOINTS.ROOMS),
      ]);
      setItems(Array.isArray(regData) ? regData : []);
      setStudents(Array.isArray(stuData) ? stuData : []);
      setRooms(Array.isArray(roomData) ? roomData : []);
    } catch (err: any) {
      setAlert({ msg: err.message || 'Không thể tải dữ liệu', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setFormData({ maSinhVien: '', maPhongDeXuat: '', ghiChu: '' });
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
        maPhongDeXuat: formData.maPhongDeXuat ? Number(formData.maPhongDeXuat) : undefined,
        ghiChu: formData.ghiChu || undefined,
      };
      await apiClient.post(ENDPOINTS.REGISTRATIONS, payload);
      setAlert({ msg: 'Thêm đăng ký thành công!', type: 'success' });
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi thêm đăng ký', type: 'danger' });
    }
  };

  const handleApprove = async (item: Registration) => {
    try {
      await apiClient.put(ENDPOINTS.REGISTRATION_BY_ID(item.maDon), { trangThai: 'Đã duyệt' });
      setAlert({ msg: 'Duyệt đăng ký thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi duyệt đăng ký', type: 'danger' });
    }
  };

  const handleReject = async (item: Registration) => {
    const ghiChu = prompt('Nhập lý do từ chối (không bắt buộc):') ?? '';
    try {
      await apiClient.put(ENDPOINTS.REGISTRATION_BY_ID(item.maDon), { trangThai: 'Từ chối', ghiChu });
      setAlert({ msg: 'Từ chối đăng ký thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi từ chối đăng ký', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-clipboard-list"></i> Quản lý Đăng ký Ở KTX</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm đăng ký
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có đăng ký nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thêm đăng ký mới" onSave={handleSave}>
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
          <label>Phòng yêu cầu</label>
          <select
            className="form-control"
            value={formData.maPhongDeXuat}
            onChange={e => setFormData({ ...formData, maPhongDeXuat: e.target.value })}
          >
            <option value="">-- Chọn phòng --</option>
            {rooms.map(r => (
              <option key={r.maPhong} value={r.maPhong}>
                {r.soPhong} {r.tenToaNha ? `(${r.tenToaNha})` : ''}
              </option>
            ))}
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
