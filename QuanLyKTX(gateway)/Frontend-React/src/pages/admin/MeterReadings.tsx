import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import type { MeterReading, Room } from '../../types/api';

export default function MeterReadings() {
  const [items, setItems] = useState<MeterReading[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MeterReading | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    maPhong: '',
    loai: 'Điện',
    chiSoCu: '',
    chiSoMoi: '',
    thang: '',
    nam: '',
  });

  const columns = [
    { key: 'maChiSo', label: 'Mã chỉ số' },
    { key: 'tenPhong', label: 'Phòng' },
    { key: 'loai', label: 'Loại' },
    { key: 'chiSoCu', label: 'Chỉ số cũ' },
    { key: 'chiSoMoi', label: 'Chỉ số mới' },
    { key: 'soTieuThu', label: 'Tiêu thụ' },
    { key: 'thang', label: 'Tháng' },
    { key: 'nam', label: 'Năm' },
    { key: 'ngayGhi', label: 'Ngày ghi', render: (v: string) => formatDate(v) },
  ];

  const actions = (item: MeterReading) => (
    <div className="action-buttons">
      <button className="btn btn-sm btn-warning" onClick={() => openEditModal(item)} title="Sửa">
        <i className="fas fa-edit"></i>
      </button>
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.maChiSo)} title="Xóa">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [meterData, roomData] = await Promise.all([
        apiClient.get<MeterReading[]>(ENDPOINTS.METER_READINGS),
        apiClient.get<Room[]>(ENDPOINTS.ROOMS),
      ]);
      setItems(Array.isArray(meterData) ? meterData : []);
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
    setFormData({ maPhong: '', loai: 'Điện', chiSoCu: '', chiSoMoi: '', thang: '', nam: '' });
    setModalOpen(true);
  };

  const openEditModal = (item: MeterReading) => {
    setEditingItem(item);
    setFormData({
      maPhong: String(item.maPhong),
      loai: item.loai,
      chiSoCu: String(item.chiSoCu),
      chiSoMoi: String(item.chiSoMoi),
      thang: String(item.thang),
      nam: String(item.nam),
    });
    setModalOpen(true);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await apiClient.uploadExcel(ENDPOINTS.METER_READINGS_IMPORT, file);
      setAlert({ msg: 'Nhập Excel thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi nhập Excel', type: 'danger' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!formData.maPhong) {
      setAlert({ msg: 'Vui lòng chọn phòng', type: 'warning' });
      return;
    }
    try {
      const payload = {
        maPhong: Number(formData.maPhong),
        loai: formData.loai,
        chiSoCu: Number(formData.chiSoCu),
        chiSoMoi: Number(formData.chiSoMoi),
        thang: Number(formData.thang),
        nam: Number(formData.nam),
      };
      if (editingItem) {
        await apiClient.put(ENDPOINTS.METER_READING_BY_ID(editingItem.maChiSo), payload);
        setAlert({ msg: 'Cập nhật chỉ số thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.METER_READINGS, payload);
        setAlert({ msg: 'Thêm chỉ số thành công!', type: 'success' });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi lưu chỉ số', type: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chỉ số này?')) return;
    try {
      await apiClient.delete(ENDPOINTS.METER_READING_BY_ID(id));
      setAlert({ msg: 'Xóa chỉ số thành công!', type: 'success' });
      loadData();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Lỗi khi xóa chỉ số', type: 'danger' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-tachometer-alt"></i> Quản lý Chỉ số Điện/Nước</h1>
        <div className="d-flex gap-2">
          <label className="btn btn-success mb-0" style={{ cursor: 'pointer' }}>
            <i className={`fas fa-file-excel ${importing ? 'fa-spin' : ''}`}></i> {importing ? 'Đang nhập...' : 'Nhập Excel'}
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleImportExcel} disabled={importing} />
          </label>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i> Thêm chỉ số
          </button>
        </div>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <DataTable columns={columns} data={items} loading={loading} actions={actions} emptyMessage="Không có chỉ số nào" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Sửa chỉ số' : 'Thêm chỉ số mới'} onSave={handleSave}>
        <div className="form-group">
          <label>Phòng <span className="text-danger">*</span></label>
          <select
            className="form-control"
            value={formData.maPhong}
            onChange={e => setFormData({ ...formData, maPhong: e.target.value })}
            required
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
          <label>Loại</label>
          <select className="form-control" value={formData.loai}
            onChange={e => setFormData({ ...formData, loai: e.target.value })}>
            <option value="Điện">Điện</option>
            <option value="Nước">Nước</option>
          </select>
        </div>
        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label>Chỉ số cũ</label>
              <input type="number" className="form-control" value={formData.chiSoCu}
                onChange={e => setFormData({ ...formData, chiSoCu: e.target.value })} required />
            </div>
          </div>
          <div className="col-6">
            <div className="form-group">
              <label>Chỉ số mới</label>
              <input type="number" className="form-control" value={formData.chiSoMoi}
                onChange={e => setFormData({ ...formData, chiSoMoi: e.target.value })} required />
            </div>
          </div>
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
      </Modal>
    </div>
  );
}
