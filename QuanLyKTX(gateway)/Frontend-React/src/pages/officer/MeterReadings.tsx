import { useEffect, useState, useRef } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import type { MeterReading, Room } from '../../types/api';

export default function MeterReadings() {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState({ msg: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [form, setForm] = useState({
    maPhong: 0,
    loai: 'Điện',
    chiSoCu: 0,
    chiSoMoi: 0,
    thang: new Date().getMonth() + 1,
    nam: new Date().getFullYear(),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rdData, rmData] = await Promise.all([
        apiClient.get<MeterReading[]>(ENDPOINTS.METER_READINGS),
        apiClient.get<Room[]>(ENDPOINTS.ROOMS),
      ]);
      setReadings(rdData || []);
      setRooms(rmData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Backend ChiSoDienNuoc uses ChiSoDien/ChiSoNuoc, NOT chiSoMoi/chiSoCu
      await apiClient.post(ENDPOINTS.METER_READINGS, {
        maPhong: form.maPhong,
        thang: form.thang,
        nam: form.nam,
        chiSoDien: form.chiSoMoi,   // new reading → backend chiSoDien
        chiSoNuoc: form.chiSoCu,   // old reading → backend chiSoNuoc
        trangThai: 'Đã ghi',
      });
      setShowAlert({ msg: 'Ghi chỉ số thành công!', type: 'success' });
      setForm({ maPhong: 0, loai: 'Điện', chiSoCu: 0, chiSoMoi: 0, thang: new Date().getMonth() + 1, nam: new Date().getFullYear() });
      loadData();
    } catch (err) {
      setShowAlert({ msg: err instanceof Error ? err.message : 'Lỗi ghi chỉ số', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await apiClient.uploadExcel(ENDPOINTS.METER_READINGS_IMPORT, file);
      setShowAlert({ msg: 'Nhập Excel thành công!', type: 'success' });
      loadData();
    } catch (err) {
      setShowAlert({ msg: err instanceof Error ? err.message : 'Lỗi nhập Excel', type: 'danger' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-tachometer-alt"></i> Ghi chỉ số điện nước</h1>
      </div>

      {showAlert.msg && (
        <div className={`alert alert-${showAlert.type}`}>{showAlert.msg}</div>
      )}

      {/* Add Form */}
      <div className="card mb-3">
        <div className="card-header">
          <h3><i className="fas fa-plus"></i> Thêm chỉ số mới</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label">Phòng</label>
                <select className="form-control" required value={form.maPhong}
                  onChange={e => setForm(prev => ({ ...prev, maPhong: Number(e.target.value) }))}>
                  <option value={0}>-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.maPhong} value={r.maPhong}>{r.tenPhong}</option>)}
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Loại</label>
                <select className="form-control" value={form.loai}
                  onChange={e => setForm(prev => ({ ...prev, loai: e.target.value }))}>
                  <option value="Điện">Điện</option>
                  <option value="Nước">Nước</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Chỉ số cũ</label>
                <input type="number" className="form-control" required min={0} value={form.chiSoCu}
                  onChange={e => setForm(prev => ({ ...prev, chiSoCu: Number(e.target.value) }))} />
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Chỉ số mới</label>
                <input type="number" className="form-control" required min={0} value={form.chiSoMoi}
                  onChange={e => setForm(prev => ({ ...prev, chiSoMoi: Number(e.target.value) }))} />
              </div>
              <div className="col-md-1 mb-3">
                <label className="form-label">Tháng</label>
                <input type="number" className="form-control" required min={1} max={12} value={form.thang}
                  onChange={e => setForm(prev => ({ ...prev, thang: Number(e.target.value) }))} />
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Năm</label>
                <input type="number" className="form-control" required min={2020} value={form.nam}
                  onChange={e => setForm(prev => ({ ...prev, nam: Number(e.target.value) }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Ghi chỉ số'}
            </button>
          </form>
        </div>
      </div>

      {/* Import Excel */}
      <div className="card mb-3">
        <div className="card-body">
          <label className="form-label"><i className="fas fa-file-excel"></i> Nhập từ Excel</label>
          <input type="file" className="form-control w-auto" ref={fileInputRef}
            accept=".xlsx,.xls,.csv" onChange={handleImportExcel} />
          <small className="text-muted">Định dạng: .xlsx, .xls, .csv</small>
          {importing && <span className="ms-2 text-primary">Đang nhập...</span>}
        </div>
      </div>

      {/* Readings Table */}
      <div className="card">
        <div className="card-body">
          {readings.length === 0 ? (
            <p className="text-muted">Không có dữ liệu chỉ số</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Phòng</th>
                  <th>Loại</th>
                  <th>Chỉ số điện</th>
                  <th>Chỉ số nước</th>
                  <th>Tháng/Năm</th>
                  <th>Ngày ghi</th>
                </tr>
              </thead>
              <tbody>
                {readings.map(rd => (
                  <tr key={rd.maChiSo}>
                    <td>{rd.maChiSo}</td>
                    <td>{rd.tenPhong || rd.maPhong}</td>
                    <td>{rd.loai || '—'}</td>
                    <td>{rd.chiSoDien}</td>
                    <td>{rd.chiSoNuoc}</td>
                    <td>{rd.thang}/{rd.nam}</td>
                    <td>{formatDate(rd.ngayTao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
