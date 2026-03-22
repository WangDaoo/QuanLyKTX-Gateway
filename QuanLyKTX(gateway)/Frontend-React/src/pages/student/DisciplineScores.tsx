import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import type { DisciplineScore } from '../../types/api';

export default function DisciplineScores() {
  const [scores, setScores] = useState<DisciplineScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadScores(); }, []);

  const loadScores = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<DisciplineScore[]>(ENDPOINTS.USER_DISCIPLINE_SCORES);
      setScores(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const getScoreClass = (diem: number) => {
    if (diem >= 8) return 'text-success fw-bold';
    if (diem >= 6) return 'text-warning fw-bold';
    return 'text-danger fw-bold';
  };

  const avgScore = scores.length > 0
    ? (scores.reduce((sum, s) => sum + s.diem, 0) / scores.length).toFixed(2)
    : 'N/A';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-star"></i> Điểm rèn luyện</h1>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Điểm TB</h5>
            <h3 className={getScoreClass(Number(avgScore))}>{avgScore}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card-sm">
            <h5>Tổng lần đánh giá</h5>
            <h3>{scores.length}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {scores.length === 0 ? (
            <p className="text-muted">Không có dữ liệu điểm rèn luyện</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Năm</th>
                  <th>Điểm</th>
                  <th>Xếp loại</th>
                  <th>Nhận xét</th>
                </tr>
              </thead>
              <tbody>
                {scores.map(s => (
                  <tr key={s.maDiem}>
                    <td>{s.thang}</td>
                    <td>{s.nam}</td>
                    <td className={getScoreClass(s.diem)}>{s.diem}</td>
                    <td>
                      <span className={`badge bg-${
                        s.xepLoai === 'Tốt' ? 'success' :
                        s.xepLoai === 'Khá' ? 'info' :
                        s.xepLoai === 'Trung bình' ? 'warning' :
                        s.xepLoai === 'Yếu' ? 'danger' : 'secondary'
                      }`}>
                        {s.xepLoai || 'Chưa xếp loại'}
                      </span>
                    </td>
                    <td>{s.nhanXet || '-'}</td>
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
