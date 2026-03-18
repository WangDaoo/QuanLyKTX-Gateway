// Rooms - CRUD for Rooms
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import type { Room, Building } from '../../types/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal, { useModal } from '../../components/common/Modal';

interface RoomFormData {
  soPhong: string;
  maToaNha: number;
  soGiuong: number;
  giaPhong: number;
  trangThai: string;
}

const emptyForm: RoomFormData = {
  soPhong: '',
  maToaNha: 0,
  soGiuong: 4,
  giaPhong: 0,
  trangThai: 'Trống',
};

const ROOM_STATUSES = ['Trống', 'Còn trống', 'Đầy', 'Đã đầy', 'Bảo trì'];

export default function Rooms() {
  const [data, setData] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'danger' | 'warning' | 'info'>('info');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RoomFormData>(emptyForm);
  const { isOpen, open, close } = useModal();

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rooms, bldgs] = await Promise.all([
        apiClient.get<Room[]>(ENDPOINTS.ROOMS),
        apiClient.get<Building[]>(ENDPOINTS.BUILDINGS),
      ]);
      setData(Array.isArray(rooms) ? rooms : []);
      setBuildings(Array.isArray(bldgs) ? bldgs.filter((b) => b.trangThai) : []);
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
    setFormData({ ...emptyForm, maToaNha: buildings[0]?.maToaNha || 0 });
    open(true);
  };

  const handleOpenEdit = (item: Room) => {
    setEditingId(item.maPhong);
    setFormData({
      soPhong: item.soPhong,
      maToaNha: item.maToaNha,
      soGiuong: item.soGiuong,
      giaPhong: item.giaPhong || 0,
      trangThai: item.trangThai,
    });
    open(true);
  };

  const handleSave = async () => {
    if (!formData.soPhong.trim()) {
      setAlertMsg('Số phòng không được để trống');
      setAlertType('warning');
      return;
    }
    if (!formData.maToaNha) {
      setAlertMsg('Vui lòng chọn tòa nhà');
      setAlertType('warning');
      return;
    }
    try {
      if (editingId) {
        await apiClient.put(`${ENDPOINTS.ROOM_BY_ID(editingId)}`, { ...formData, loaiPhong: '', moTa: null, nguoiCapNhat: null });
        setAlertMsg('Cập nhật phòng thành công!');
        setAlertType('success');
      } else {
        await apiClient.post(ENDPOINTS.ROOMS, { ...formData, loaiPhong: '', moTa: null, nguoiTao: null });
        setAlertMsg('Thêm phòng mới thành công!');
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
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.ROOM_BY_ID(id));
      setAlertMsg('Xóa phòng thành công!');
      setAlertType('success');
      loadData();
    } catch (err) {
      setAlertMsg(err instanceof Error ? err.message : 'Xóa thất bại');
      setAlertType('danger');
    }
  };

  const getStatusBadge = (status: string) => {
    const cls = status === 'Trống' || status === 'Còn trống' ? 'badge-success'
      : status === 'Đầy' || status === 'Đã đầy' ? 'badge-danger'
      : status === 'Bảo trì' ? 'badge-warning' : 'badge-secondary';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  const columns = [
    { key: 'maPhong', label: 'Mã phòng' },
    { key: 'soPhong', label: 'Số phòng' },
    { key: 'tenToaNha', label: 'Tòa nhà' },
    { key: 'soGiuong', label: 'Số giường' },
    { key: 'giaPhong', label: 'Giá thuê', render: (v: number) => formatCurrency(v ?? '') },
    { key: 'trangThai', label: 'Trạng thái', render: (v: string) => getStatusBadge(v) },
    {
      key: 'actions',
      label: 'Hành động',
      render: (item: Room) => (
        <div className="d-flex gap-1">
          <button className="btn btn-sm btn-primary" onClick={() => handleOpenEdit(item)} title="Sửa">
            <i className="fas fa-edit"></i>
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maPhong)} title="Xóa">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1><i className="fas fa-door-open"></i> Quản lý Phòng</h1>
        <p>Thêm, sửa, xóa thông tin phòng trong ký túc xá</p>
      </div>

      {alertMsg && <Alert message={alertMsg} type={alertType} onClose={() => setAlertMsg('')} />}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><i className="fas fa-list"></i> Danh sách phòng</h3>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <i className="fas fa-plus"></i> Thêm phòng
          </button>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={data} loading={loading} />
        </div>
      </div>

      <Modal id="room-modal" open={isOpen} title={editingId ? 'Sửa phòng' : 'Thêm phòng mới'} onClose={close} footer={
        <>
          <button className="btn btn-secondary" onClick={close}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="fas fa-save"></i> Lưu
          </button>
        </>
      }>
        <div className="form-group">
          <label>Số phòng <span className="text-danger">*</span></label>
          <input type="text" className="form-control" value={formData.soPhong}
            onChange={(e) => setFormData({ ...formData, soPhong: e.target.value })} placeholder="VD: A101" />
        </div>
        <div className="form-group">
          <label>Tòa nhà <span className="text-danger">*</span></label>
          <select className="form-control" value={formData.maToaNha}
            onChange={(e) => setFormData({ ...formData, maToaNha: Number(e.target.value) })}>
            <option value={0}>-- Chọn tòa nhà --</option>
            {buildings.map((b) => (
              <option key={b.maToaNha} value={b.maToaNha}>{b.tenToaNha}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Số giường</label>
          <input type="number" className="form-control" min={1} max={10} value={formData.soGiuong}
            onChange={(e) => setFormData({ ...formData, soGiuong: Number(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Giá thuê (VNĐ)</label>
          <input type="number" className="form-control" min={0} value={formData.giaPhong}
            onChange={(e) => setFormData({ ...formData, giaPhong: Number(e.target.value) })} placeholder="0" />
        </div>
        <div className="form-group">
          <label>Trạng thái</label>
          <select className="form-control" value={formData.trangThai}
            onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}>
            {ROOM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
}
