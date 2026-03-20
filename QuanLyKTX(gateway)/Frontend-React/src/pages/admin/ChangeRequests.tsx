import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { ChangeRequest, Student, Room } from '../../types/api';

export default function ChangeRequests() {
  const [items, setItems] = useState<ChangeRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    maSinhVien: '',
    maPhongHienTai: '',
    maPhongYeuCau: '',
    lyDo: '',
  });

  const getStatusBadge = (trangThai: string) => {
    const cls = trangThai === 'Đã duyệt' ? 'badge-success'
      : trangThai === 'Chờ duyệt' ? 'badge-warning'
      : trangThai === 'Từ chối' ? 'badge-danger'
      : 'badge-secondary';
    return <span className={`badge ${cls}`}>{trangThai}</span>;
  };

  const columns = [
    { key: 'maYeuCau', label: 'Mã YC' },
    { key: 'hoTen', label: 'Sinh viên' },
    { key: 'tenPhongHienTai', label: 'Phòng hiện tại' },
    { key: 'tenPhongYeuCau', label: 'Phòng yêu cầu' },
    { key: 'lyDo', label: 'Lý do' },
    { key: 'ngayYeuCau', label: 'Ngày yêu cầu', render: (v: string) => formatDate(v ?? '') },
    { key: 'trangThai', label: 'Trạng thái', render: (v: string) => getStatusBadge(v ?? '') },
  ];

  const actions = (item: ChangeRequest) => (
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
      const [reqData, stuData, roomData] = await Promise.all([
        apiClient.get<ChangeRequest[]>(ENDPOINTS.CHANGE_REQUESTS),
        apiClient.get<Student[]>(ENDPOINTS.STUDENTS),
        apiClient.get<Room[]>(ENDPOINTS.ROOMS),
      ]);
      setItems(Array.isArray(reqData) ? reqData : []);
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
    setFormData({ maSinhVien: '', maPhongHienTai: '', maPhongYeuCau: '', lyDo: '' });
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
        phongHienTai: Number(formData.maPhongHienTai),
        phongMongMuon: Number(formData.maPhongYeuCau),
        lyDo: formData.lyDo,
      };
      await apiClient.post(ENDPOINTS.CHANGE_REQUESTS, payload);
      setAlert({ msg: 'Thêm yêu cầu chuyển phòng thành công!', type: 'success' });
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi thêm yêu cầu', type: 'danger' });
    }
  };

  const handleApprove = async (item: ChangeRequest) => {
    try {
      await apiClient.put(ENDPOINTS.CHANGE_REQUEST_BY_ID(item.maYeuCau), { trangThai: 'Đã duyệt' });
      setAlert({ msg: 'Duyệt yêu cầu thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi duyệt yêu cầu', type: 'danger' });
    }
  };

  const handleReject = async (item: ChangeRequest) => {
    const ghiChu = prompt('Nhập lý do từ chối (không bắt buộc):') ?? '';
    try {
      await apiClient.put(ENDPOINTS.CHANGE_REQUEST_BY_ID(item.maYeuCau), { trangThai: 'Từ chối', ghiChu });
      setAlert({ msg: 'Từ chối yêu cầu thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi từ chối yêu cầu', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-exchange-alt"></i> Quản lý Yêu cầu Chuyển Phòng</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm yêu cầu
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có yêu cầu nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thêm yêu cầu chuyển phòng" onSave={handleSave}>
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
          <label>Phòng hiện tại <span className="text-danger">*</span></label>
          <select
            className="form-control"
            value={formData.maPhongHienTai}
            onChange={e => setFormData({ ...formData, maPhongHienTai: e.target.value })}
            required
          >
            <option value="">-- Chọn phòng hiện tại --</option>
            {rooms.map(r => (
              <option key={r.maPhong} value={r.maPhong}>
                {r.soPhong} {r.tenToaNha ? `(${r.tenToaNha})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Phòng yêu cầu <span className="text-danger">*</span></label>
          <select
            className="form-control"
            value={formData.maPhongYeuCau}
            onChange={e => setFormData({ ...formData, maPhongYeuCau: e.target.value })}
            required
          >
            <option value="">-- Chọn phòng yêu cầu --</option>
            {rooms.map(r => (
              <option key={r.maPhong} value={r.maPhong}>
                {r.soPhong} {r.tenToaNha ? `(${r.tenToaNha})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Lý do</label>
          <textarea className="form-control" rows={3} value={formData.lyDo}
            onChange={e => setFormData({ ...formData, lyDo: e.target.value })} required />
        </div>
      </Modal>
    </div>
  );
}
