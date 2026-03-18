import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { User } from '../../types/api';

export default function Users() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    tenDangNhap: '',
    hoTen: '',
    email: '',
    vaiTro: 'Student' as 'Admin' | 'Officer' | 'Student',
    soDienThoai: '',
    trangThai: true,
  });

  const getUserId = (item: User) => (item.maTaiKhoan ?? (item as unknown as { taiKhoanId?: number }).taiKhoanId ?? 0);

  const columns = [
    { key: 'maTaiKhoan', label: 'ID' },
    { key: 'tenDangNhap', label: 'Tên đăng nhập' },
    { key: 'hoTen', label: 'Họ tên' },
    { key: 'vaiTro', label: 'Vai trò', render: (v: string) => {
      const cls = v === 'Admin' ? 'badge-danger' : v === 'Officer' ? 'badge-info' : 'badge-secondary';
      return <span className={`badge ${cls}`}>{v}</span>;
    }},
    { key: 'email', label: 'Email' },
    { key: 'soDienThoai', label: 'SĐT' },
    { key: 'trangThai', label: 'Trạng thái', render: (v: boolean) => (
      <span className={`badge ${v ? 'badge-success' : 'badge-secondary'}`}>{v ? 'Hoạt động' : 'Khóa'}</span>
    )},
  ];

  const actions = (item: User) => (
    <div className="action-buttons">
      <button className="btn btn-sm btn-warning" onClick={() => openEditModal(item)} title="Sửa">
        <i className="fas fa-edit"></i>
      </button>
      <button
        className={`btn btn-sm ${item.trangThai ? 'btn-danger' : 'btn-success'}`}
        onClick={() => handleLockToggle(item)}
        title={item.trangThai ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
      >
        <i className={`fas ${item.trangThai ? 'fa-lock' : 'fa-unlock'}`}></i>
      </button>
      <button className="btn btn-sm btn-info" onClick={() => handleResetPassword(item)} title="Reset mật khẩu">
        <i className="fas fa-key"></i>
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(getUserId(item))} title="Xóa">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<User[]>(ENDPOINTS.USERS);
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
    setFormData({ tenDangNhap: '', hoTen: '', email: '', vaiTro: 'Student', soDienThoai: '', trangThai: true });
    setModalOpen(true);
  };

  const openEditModal = (item: User) => {
    setEditingItem(item);
    setFormData({
      tenDangNhap: item.tenDangNhap,
      hoTen: item.hoTen || '',
      email: item.email || '',
      vaiTro: item.vaiTro,
      soDienThoai: item.soDienThoai || '',
      trangThai: item.trangThai ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        tenDangNhap: formData.tenDangNhap,
        hoTen: formData.hoTen,
        email: formData.email,
        vaiTro: formData.vaiTro,
        soDienThoai: formData.soDienThoai,
        trangThai: formData.trangThai,
      };
      if (editingItem) {
        await apiClient.put(ENDPOINTS.USER_BY_ID(getUserId(editingItem)), payload);
        setAlert({ msg: 'Cập nhật người dùng thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.USERS, payload);
        setAlert({ msg: 'Thêm người dùng thành công!', type: 'success' });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi lưu người dùng', type: 'danger' });
    }
  };

  const handleLockToggle = async (item: User) => {
    const action = item.trangThai ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${item.tenDangNhap}"?`)) return;
    try {
      await apiClient.put(ENDPOINTS.USER_LOCK(getUserId(item)), { isLocked: !!item.trangThai });
      setAlert({ msg: `${action === 'khóa' ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`, type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi thao tác', type: 'danger' });
    }
  };

  const handleResetPassword = async (item: User) => {
    if (!confirm(`Reset mật khẩu cho "${item.tenDangNhap}"?\nMật khẩu mới sẽ được gửi về email của người dùng.`)) return;
    try {
      await apiClient.put(ENDPOINTS.USER_RESET_PASSWORD(getUserId(item)), { newPassword: '123456' });
      setAlert({ msg: 'Reset mật khẩu thành công (mật khẩu mới: 123456)!', type: 'success' });
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi reset mật khẩu', type: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.USER_BY_ID(id));
      setAlert({ msg: 'Xóa người dùng thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi xóa người dùng', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-users"></i> Quản lý Người dùng</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm người dùng
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có người dùng nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Sửa người dùng' : 'Thêm người dùng mới'} onSave={handleSave}>
        {!editingItem && (
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input type="text" className="form-control" value={formData.tenDangNhap}
              onChange={e => setFormData({ ...formData, tenDangNhap: e.target.value })} required />
          </div>
        )}
        <div className="form-group">
          <label>Họ tên</label>
          <input type="text" className="form-control" value={formData.hoTen}
            onChange={e => setFormData({ ...formData, hoTen: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-control" value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Vai trò</label>
          <select className="form-control" value={formData.vaiTro}
            onChange={e => setFormData({ ...formData, vaiTro: e.target.value as 'Admin' | 'Officer' | 'Student' })}>
            <option value="Admin">Admin - Quản trị viên</option>
            <option value="Officer">Officer - Nhân viên</option>
            <option value="Student">Student - Sinh viên</option>
          </select>
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input type="text" className="form-control" value={formData.soDienThoai}
            onChange={e => setFormData({ ...formData, soDienThoai: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Trạng thái</label>
          <select className="form-control" value={String(formData.trangThai)}
            onChange={e => setFormData({ ...formData, trangThai: e.target.value === 'true' })}>
            <option value="true">Hoạt động</option>
            <option value="false">Khóa</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
