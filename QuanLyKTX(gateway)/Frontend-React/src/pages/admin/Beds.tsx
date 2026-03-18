// Beds - CRUD for Beds
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import type { Bed, Room } from '../../types/api';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal, { useModal } from '../../components/common/Modal';

interface BedFormData {
  maPhong: number;
  soGiuong: string;
  trangThai: string;
}

const emptyForm: BedFormData = {
  maPhong: 0,
  soGiuong: '',
  trangThai: 'Trống',
};

const BED_STATUSES = ['Trống', 'Đã đặt', 'Đang sử dụng', 'Bảo trì'];

export default function Beds() {
  const [data, setData] = useState<Bed[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'danger' | 'warning' | 'info'>('info');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BedFormData>(emptyForm);
  const { isOpen, open, close } = useModal();

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [beds, rms] = await Promise.all([
        apiClient.get<Bed[]>(ENDPOINTS.BEDS),
        apiClient.get<Room[]>(ENDPOINTS.ROOMS),
      ]);
      setData(Array.isArray(beds) ? beds : []);
      setRooms(Array.isArray(rms) ? rms : []);
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
    setFormData({ ...emptyForm, maPhong: rooms[0]?.maPhong || 0 });
    open(true);
  };

  const handleOpenEdit = (item: Bed) => {
    setEditingId(item.maGiuong);
    setFormData({
      maPhong: item.maPhong,
      soGiuong: String(item.soGiuong),
      trangThai: item.trangThai,
    });
    open(true);
  };

  const handleSave = async () => {
    if (!formData.soGiuong.trim()) {
      setAlertMsg('Số giường không được để trống');
      setAlertType('warning');
      return;
    }
    try {
      if (editingId) {
        await apiClient.put(`${ENDPOINTS.BED_BY_ID(editingId)}`, formData);
        setAlertMsg('Cập nhật giường thành công!');
        setAlertType('success');
      } else {
        await apiClient.post(ENDPOINTS.BEDS, formData);
        setAlertMsg('Thêm giường mới thành công!');
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
    if (!window.confirm('Bạn có chắc muốn xóa giường này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.BED_BY_ID(id));
      setAlertMsg('Xóa giường thành công!');
      setAlertType('success');
      loadData();
    } catch (err) {
      setAlertMsg(err instanceof Error ? err.message : 'Xóa thất bại');
      setAlertType('danger');
    }
  };

  const getStatusBadge = (status: string) => {
    const cls = status === 'Trống' ? 'badge-success'
      : status === 'Đang sử dụng' || status === 'Đã đặt' ? 'badge-info'
      : status === 'Bảo trì' ? 'badge-warning' : 'badge-secondary';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  const getRoomName = (maPhong: number) => {
    const room = rooms.find((r) => r.maPhong === maPhong);
    return room ? room.soPhong : `#${maPhong}`;
  };

  const columns = [
    { key: 'maGiuong', label: 'Mã giường' },
    {
      key: 'maPhong',
      label: 'Phòng',
      render: (v: number) => getRoomName(v),
    },
    { key: 'soGiuong', label: 'Số giường' },
    { key: 'trangThai', label: 'Trạng thái', render: (v: string) => getStatusBadge(v) },
    {
      key: 'actions',
      label: 'Hành động',
      render: (item: Bed) => (
        <div className="d-flex gap-1">
          <button className="btn btn-sm btn-primary" onClick={() => handleOpenEdit(item)} title="Sửa">
            <i className="fas fa-edit"></i>
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maGiuong)} title="Xóa">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1><i className="fas fa-bed"></i> Quản lý Giường</h1>
        <p>Thêm, sửa, xóa thông tin giường trong ký túc xá</p>
      </div>

      {alertMsg && <Alert message={alertMsg} type={alertType} onClose={() => setAlertMsg('')} />}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><i className="fas fa-list"></i> Danh sách giường</h3>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <i className="fas fa-plus"></i> Thêm giường
          </button>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={data} loading={loading} />
        </div>
      </div>

      <Modal id="bed-modal" open={isOpen} title={editingId ? 'Sửa giường' : 'Thêm giường mới'} onClose={close} footer={
        <>
          <button className="btn btn-secondary" onClick={close}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="fas fa-save"></i> Lưu
          </button>
        </>
      }>
        <div className="form-group">
          <label>Phòng <span className="text-danger">*</span></label>
          <select className="form-control" value={formData.maPhong}
            onChange={(e) => setFormData({ ...formData, maPhong: Number(e.target.value) })}>
            <option value={0}>-- Chọn phòng --</option>
            {rooms.map((r) => (
              <option key={r.maPhong} value={r.maPhong}>{r.soPhong} - {r.tenToaNha}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Số giường <span className="text-danger">*</span></label>
          <input type="text" className="form-control" value={formData.soGiuong}
            onChange={(e) => setFormData({ ...formData, soGiuong: e.target.value })} placeholder="VD: Giường 1" />
        </div>
        <div className="form-group">
          <label>Trạng thái</label>
          <select className="form-control" value={formData.trangThai}
            onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}>
            {BED_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
}
