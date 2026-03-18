// Students - CRUD for Students
import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import type { Room, Student } from '../../types/api';
import { formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal, { useModal } from '../../components/common/Modal';

interface StudentFormData {
  hoTen: string;
  mssv: string;
  lop: string;
  khoa: string;
  gioiTinh: string;
  ngaySinh: string;
  diaChi: string;
  sDT: string;
  email: string;
  maPhong: number | null;
  trangThai: boolean;
}

const emptyForm: StudentFormData = {
  hoTen: '',
  mssv: '',
  lop: '',
  khoa: '',
  gioiTinh: '',
  ngaySinh: '',
  diaChi: '',
  sDT: '',
  email: '',
  maPhong: null,
  trangThai: true,
};

export default function Students() {
  const [data, setData] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'danger' | 'warning' | 'info'>('info');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(emptyForm);
  const { isOpen, open, close } = useModal();

  const loadData = async () => {
    setLoading(true);
    try {
      const [students, roomData] = await Promise.all([
        apiClient.get<Student[]>(ENDPOINTS.STUDENTS),
        apiClient.get<Room[]>(ENDPOINTS.ROOMS),
      ]);
      setData(Array.isArray(students) ? students : []);
      setRooms(Array.isArray(roomData) ? roomData : []);
    } catch (err) {
      setAlertMsg(err instanceof Error ? err.message : 'Không thể tải dữ liệu sinh viên');
      setAlertType('danger');
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

  const handleOpenEdit = (item: Student) => {
    setEditingId(item.maSinhVien);
    setFormData({
      hoTen: item.hoTen || '',
      mssv: item.mssv || '',
      lop: item.lop || '',
      khoa: item.khoa || '',
      gioiTinh: item.gioiTinh || '',
      ngaySinh: item.ngaySinh ? item.ngaySinh.slice(0, 10) : '',
      diaChi: item.diaChi || '',
      sDT: item.sDT || '',
      email: item.email || '',
      maPhong: item.maPhong ?? null,
      trangThai: item.trangThai ?? true,
    });
    open(true);
  };

  const handleSave = async () => {
    if (!formData.hoTen.trim() || !formData.mssv.trim() || !formData.lop.trim() || !formData.khoa.trim()) {
      setAlertMsg('Họ tên, MSSV, lớp, khoa là bắt buộc');
      setAlertType('warning');
      return;
    }

    const payload = {
      hoTen: formData.hoTen.trim(),
      mssv: formData.mssv.trim(),
      lop: formData.lop.trim(),
      khoa: formData.khoa.trim(),
      ngaySinh: formData.ngaySinh || null,
      gioiTinh: formData.gioiTinh || null,
      sDT: formData.sDT || null,
      email: formData.email || null,
      diaChi: formData.diaChi || null,
      maPhong: formData.maPhong,
    };

    try {
      if (editingId) {
        await apiClient.put(ENDPOINTS.STUDENT_BY_ID(editingId), payload);
        setAlertMsg('Cập nhật sinh viên thành công!');
      } else {
        await apiClient.post(ENDPOINTS.STUDENTS, payload);
        setAlertMsg('Thêm sinh viên thành công!');
      }
      setAlertType('success');
      close();
      loadData();
    } catch (err) {
      setAlertMsg(err instanceof Error ? err.message : 'Lưu sinh viên thất bại');
      setAlertType('danger');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa sinh viên này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.STUDENT_BY_ID(id));
      setAlertMsg('Xóa sinh viên thành công!');
      setAlertType('success');
      loadData();
    } catch (err) {
      setAlertMsg(err instanceof Error ? err.message : 'Xóa sinh viên thất bại');
      setAlertType('danger');
    }
  };

  const getRoomText = (student: Student) => {
    if (!student.maPhong) return 'Chưa phân phòng';
    const room = rooms.find((r) => r.maPhong === student.maPhong);
    return room ? `${room.soPhong} - ${room.tenToaNha || ''}` : `Phòng #${student.maPhong}`;
  };

  const columns = [
    { key: 'maSinhVien', label: 'Mã SV' },
    { key: 'mssv', label: 'MSSV' },
    { key: 'hoTen', label: 'Họ tên' },
    { key: 'lop', label: 'Lớp' },
    { key: 'khoa', label: 'Khoa' },
    { key: 'gioiTinh', label: 'Giới tính' },
    { key: 'ngaySinh', label: 'Ngày sinh', render: (_: unknown, item: Student) => formatDate(item.ngaySinh) },
    { key: 'room', label: 'Phòng', render: (_: unknown, item: Student) => getRoomText(item) },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      render: (item: Student) => (
        <span className={`badge ${item.trangThai ? 'badge-success' : 'badge-secondary'}`}>
          {item.trangThai ? 'Hoạt động' : 'Ngừng'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (item: Student) => (
        <div className="d-flex gap-1">
          <button className="btn btn-sm btn-primary" onClick={() => handleOpenEdit(item)} title="Sửa">
            <i className="fas fa-edit"></i>
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maSinhVien)} title="Xóa">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1><i className="fas fa-user-graduate"></i> Quản lý Sinh viên</h1>
        <p>Thêm, sửa, xóa thông tin sinh viên nội trú</p>
      </div>

      {alertMsg && <Alert message={alertMsg} type={alertType} onClose={() => setAlertMsg('')} />}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><i className="fas fa-list"></i> Danh sách sinh viên</h3>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <i className="fas fa-plus"></i> Thêm sinh viên
          </button>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={data} loading={loading} />
        </div>
      </div>

      <Modal id="student-modal" open={isOpen} title={editingId ? 'Sửa sinh viên' : 'Thêm sinh viên mới'} onClose={close} footer={
        <>
          <button className="btn btn-secondary" onClick={close}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="fas fa-save"></i> Lưu
          </button>
        </>
      }>
        <div className="form-group">
          <label>Họ tên <span className="text-danger">*</span></label>
          <input type="text" className="form-control" value={formData.hoTen}
            onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })} />
        </div>
        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label>MSSV <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={formData.mssv}
                onChange={(e) => setFormData({ ...formData, mssv: e.target.value })} />
            </div>
          </div>
          <div className="col-6">
            <div className="form-group">
              <label>Lớp <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={formData.lop}
                onChange={(e) => setFormData({ ...formData, lop: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Khoa <span className="text-danger">*</span></label>
          <input type="text" className="form-control" value={formData.khoa}
            onChange={(e) => setFormData({ ...formData, khoa: e.target.value })} />
        </div>
        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label>Giới tính</label>
              <select className="form-control" value={formData.gioiTinh}
                onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}>
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
          <div className="col-6">
            <div className="form-group">
              <label>Ngày sinh</label>
              <input type="date" className="form-control" value={formData.ngaySinh}
                onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label>SĐT</label>
              <input type="text" className="form-control" value={formData.sDT}
                onChange={(e) => setFormData({ ...formData, sDT: e.target.value })} />
            </div>
          </div>
          <div className="col-6">
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Địa chỉ</label>
          <input type="text" className="form-control" value={formData.diaChi}
            onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Phòng</label>
          <select className="form-control" value={formData.maPhong ?? ''}
            onChange={(e) => setFormData({ ...formData, maPhong: e.target.value ? Number(e.target.value) : null })}>
            <option value="">-- Chưa phân phòng --</option>
            {rooms.map((r) => (
              <option key={r.maPhong} value={r.maPhong}>
                {r.soPhong} {r.tenToaNha ? `- ${r.tenToaNha}` : ''}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}
