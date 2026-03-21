import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Violation, Student } from '../../types/api';

export default function OfficerViolations() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState({ msg: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    maSinhVien: 0,
    loaiViPham: '',
    moTa: '',
    mucPhat: 0,
    ngayViPham: '',
    trangThai: 'Chưa nộp phạt',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, sData] = await Promise.all([
        apiClient.get<Violation[]>(ENDPOINTS.VIOLATIONS),
        apiClient.get<Student[]>(ENDPOINTS.STUDENTS),
      ]);
      setViolations(vData || []);
      setStudents(sData || []);
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
      if (editingId) {
        await apiClient.put(ENDPOINTS.VIOLATION_BY_ID(editingId), form);
        setShowAlert({ msg: 'Cập nhật vi phạm thành công!', type: 'success' });
      } else {
        await apiClient.post(ENDPOINTS.VIOLATIONS, form);
        setShowAlert({ msg: 'Thêm vi phạm thành công!', type: 'success' });
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

  const handleEdit = (v: Violation) => {
    setEditingId(v.maKyLuat);
    setForm({
      maSinhVien: v.maSinhVien,
      loaiViPham: v.loaiViPham,
      moTa: v.moTa,
      mucPhat: v.mucPhat,
      ngayViPham: v.ngayViPham,
      trangThai: v.trangThai,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await apiClient.delete(ENDPOINTS.VIOLATION_BY_ID(id));
      setShowAlert({ msg: 'Xóa thành công!', type: 'success' });
      loadData();
    } catch (err) {
      setShowAlert({ msg: err instanceof Error ? err.message : 'Lỗi xóa', type: 'danger' });
    }
  };

  const resetForm = () => {
    setForm({ maSinhVien: 0, loaiViPham: '', moTa: '', mucPhat: 0, ngayViPham: '', trangThai: 'Chưa nộp phạt' });
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-exclamation-circle"></i> Quản lý vi phạm</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}>
          <i className="fas fa-plus"></i> Thêm vi phạm
        </button>
      </div>

      {showAlert.msg && (
        <div className={`alert alert-${showAlert.type}`}>{showAlert.msg}</div>
      )}

      {showForm && (
        <div className="card mb-3">
          <div className="card-header">
            <h3>{editingId ? 'Sửa vi phạm' : 'Thêm vi phạm mới'}</h3>
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
                <div className="col-md-6 mb-3">
                  <label className="form-label">Loại vi phạm</label>
                  <select className="form-control" required value={form.loaiViPham}
                    onChange={e => setForm(prev => ({ ...prev, loaiViPham: e.target.value }))}>
                    <option value="">-- Chọn loại --</option>
                    <option value="Vi phạm nội quy">Vi phạm nội quy</option>
                    <option value="Vi phạm giờ giấc">Vi phạm giờ giấc</option>
                    <option value="Vi phạm vệ sinh">Vi phạm vệ sinh</option>
                    <option value="Vi phạm tài sản">Vi phạm tài sản</option>
                    <option value="Vi phạm an ninh">Vi phạm an ninh</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="col-md-12 mb-3">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows={2} value={form.moTa}
                    onChange={e => setForm(prev => ({ ...prev, moTa: e.target.value }))} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Mức phạt (VNĐ)</label>
                  <input type="number" className="form-control" min={0} value={form.mucPhat}
                    onChange={e => setForm(prev => ({ ...prev, mucPhat: Number(e.target.value) }))} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Ngày vi phạm</label>
                  <input type="date" className="form-control" value={form.ngayViPham}
                    onChange={e => setForm(prev => ({ ...prev, ngayViPham: e.target.value }))} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-control" value={form.trangThai}
                    onChange={e => setForm(prev => ({ ...prev, trangThai: e.target.value }))}>
                    <option value="Chưa nộp phạt">Chưa nộp phạt</option>
                    <option value="Đã nộp phạt">Đã nộp phạt</option>
                  </select>
                </div>
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
          {violations.length === 0 ? (
            <p className="text-muted">Không có dữ liệu vi phạm</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Mã VP</th>
                  <th>Sinh viên</th>
                  <th>Loại vi phạm</th>
                  <th>Mô tả</th>
                  <th>Mức phạt</th>
                  <th>Ngày vi phạm</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {violations.map(v => (
                  <tr key={v.maKyLuat}>
                    <td>{v.maKyLuat}</td>
                    <td>{v.hoTen || v.maSinhVien}</td>
                    <td><span className="badge bg-danger">{v.loaiViPham}</span></td>
                    <td>{v.moTa}</td>
                    <td className="text-danger fw-bold">{formatCurrency(v.mucPhat)}</td>
                    <td>{formatDate(v.ngayViPham)}</td>
                    <td>
                      <span className={`badge bg-${v.trangThai === 'Đã nộp phạt' ? 'success' : 'warning'}`}>
                        {v.trangThai}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary me-1" onClick={() => handleEdit(v)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(v.maKyLuat)}>
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
