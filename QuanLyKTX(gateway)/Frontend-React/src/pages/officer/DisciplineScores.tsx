import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import type { DisciplineScore, Student } from '../../types/api';

export default function OfficerDisciplineScores() {
  const [scores, setScores] = useState<DisciplineScore[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState({ msg: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    maSinhVien: 0,
    thang: new Date().getMonth() + 1,
    nam: new Date().getFullYear(),
    diem: 0,
    xepLoai: '',
    nhanXet: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, stData] = await Promise.all([
        apiClient.get<DisciplineScore[]>(ENDPOINTS.DISCIPLINE_SCORES),
        apiClient.get<Student[]>(ENDPOINTS.STUDENTS),
      ]);
      setScores(sData || []);
      setStudents(stData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const calculateRank = (score: number): string => {
    if (score >= 9) return 'Xuất sắc';
    if (score >= 8) return 'Tốt';
    if (score >= 7) return 'Khá';
    if (score >= 5) return 'Trung bình';
    return 'Yếu';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, diemSo: form.diem, ghiChu: form.nhanXet, xepLoai: calculateRank(form.diem) };
      if (editingId) {
        await apiClient.put(ENDPOINTS.DISCIPLINE_SCORE_BY_ID(editingId), payload);
        setShowAlert({ msg: 'Cập nhật thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.DISCIPLINE_SCORES, payload);
        setShowAlert({ msg: 'Thêm điểm rèn luyện thành công!', type: 'success' });
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadData();
    } catch (err) {
      setShowAlert({ msg: err instanceof Error ? err.message : 'Lỗi lưu', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s: DisciplineScore) => {
    setEditingId(s.maDiem);
    setForm({
      maSinhVien: s.maSinhVien,
      thang: s.thang,
      nam: s.nam,
      diem: s.diem,
      xepLoai: s.xepLoai || '',
      nhanXet: s.nhanXet || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await apiClient.delete(ENDPOINTS.DISCIPLINE_SCORE_BY_ID(id));
      setShowAlert({ msg: 'Xóa thành công!', type: 'success' });
      loadData();
    } catch (err) {
      setShowAlert({ msg: err instanceof Error ? err.message : 'Lỗi xóa', type: 'danger' });
    }
  };

  const resetForm = () => {
    setForm({ maSinhVien: 0, thang: new Date().getMonth() + 1, nam: new Date().getFullYear(), diem: 0, xepLoai: '', nhanXet: '' });
  };

  const getScoreColor = (diem: number) => {
    if (diem >= 8) return 'text-success';
    if (diem >= 6) return 'text-warning';
    return 'text-danger';
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-star"></i> Quản lý điểm rèn luyện</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}>
          <i className="fas fa-plus"></i> Thêm điểm
        </button>
      </div>

      {showAlert.msg && (
        <div className={`alert alert-${showAlert.type}`}>{showAlert.msg}</div>
      )}

      {showForm && (
        <div className="card mb-3">
          <div className="card-header">
            <h3>{editingId ? 'Sửa điểm rèn luyện' : 'Thêm điểm rèn luyện'}</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Sinh viên</label>
                  <select className="form-control" required value={form.maSinhVien}
                    onChange={e => setForm(prev => ({ ...prev, maSinhVien: Number(e.target.value) }))}>
                    <option value={0}>-- Chọn sinh viên --</option>
                    {students.map(s => (
                      <option key={s.maSinhVien} value={s.maSinhVien}>{s.hoTen} (#{s.maSinhVien})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Tháng</label>
                  <input type="number" className="form-control" min={1} max={12} required value={form.thang}
                    onChange={e => setForm(prev => ({ ...prev, thang: Number(e.target.value) }))} />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Năm</label>
                  <input type="number" className="form-control" min={2020} required value={form.nam}
                    onChange={e => setForm(prev => ({ ...prev, nam: Number(e.target.value) }))} />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Điểm (0-10)</label>
                  <input type="number" className="form-control" min={0} max={10} step={0.5} required value={form.diem}
                    onChange={e => setForm(prev => ({ ...prev, diem: Number(e.target.value) }))} />
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Nhận xét</label>
                  <textarea className="form-control" rows={2} value={form.nhanXet}
                    onChange={e => setForm(prev => ({ ...prev, nhanXet: e.target.value }))} />
                </div>
              </div>
              <div className="mb-2">
                <strong>Xếp loại tự động: </strong>
                <span className={`badge bg-${form.diem >= 8 ? 'success' : form.diem >= 6 ? 'warning' : 'danger'}`}>
                  {calculateRank(form.diem)}
                </span>
              </div>
              <button type="submit" className="btn btn-success me-2" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Hủy
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {scores.length === 0 ? (
            <p className="text-muted">Không có dữ liệu điểm rèn luyện</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Sinh viên</th>
                  <th>Tháng</th>
                  <th>Năm</th>
                  <th>Điểm</th>
                  <th>Xếp loại</th>
                  <th>Nhận xét</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {scores.map(s => (
                  <tr key={s.maDiem}>
                    <td>{s.maDiem}</td>
                    <td>{s.hoTen || s.maSinhVien}</td>
                    <td>{s.thang}</td>
                    <td>{s.nam}</td>
                    <td className={`fw-bold ${getScoreColor(s.diem)}`}>{s.diem}</td>
                    <td>
                      <span className={`badge bg-${
                        s.xepLoai === 'Xuất sắc' || s.xepLoai === 'Tốt' ? 'success' :
                        s.xepLoai === 'Khá' ? 'info' :
                        s.xepLoai === 'Trung bình' ? 'warning' : 'danger'
                      }`}>
                        {s.xepLoai || 'Chưa xếp'}
                      </span>
                    </td>
                    <td>{s.nhanXet || '-'}</td>
                    <td>
                      <button className="btn btn-sm btn-primary me-1" onClick={() => handleEdit(s)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.maDiem)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
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
