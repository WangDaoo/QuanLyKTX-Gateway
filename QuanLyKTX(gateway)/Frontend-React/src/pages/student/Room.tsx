import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import type { Room } from '../../types/api';

interface CurrentRoomData {
  maPhong: number;
  tenPhong: string;
  soGiuong: number;
  giaThue: number;
  trangThai: string;
  toaNha?: { maToaNha: number; tenToaNha: string; diaChi: string; soTang: number };
  giuong?: { maGiuong: number; soGiuong: string; trangThai: string };
  danhSachSinhVien?: Array<{ maSinhVien: number; hoTen: string; email: string }>;
}

export default function RoomPage() {
  const [currentRoom, setCurrentRoom] = useState<CurrentRoomData | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'available'>('current');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [current, available] = await Promise.all([
        apiClient.get<CurrentRoomData>(ENDPOINTS.USER_ROOMS_CURRENT),
        apiClient.get<Room[]>(ENDPOINTS.USER_ROOMS_AVAILABLE),
      ]);
      setCurrentRoom(current);
      setAvailableRooms(available || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-bed"></i> Thông tin phòng</h1>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}>
            <i className="fas fa-home"></i> Phòng hiện tại
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}>
            <i className="fas fa-door-open"></i> Phòng trống ({availableRooms.length})
          </button>
        </li>
      </ul>

      {activeTab === 'current' && (
        <>
          {!currentRoom ? (
            <div className="alert alert-info">Bạn chưa được xếp vào phòng nào.</div>
          ) : (
            <>
              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-3">
                    <div className="card-header"><h3><i className="fas fa-door-open"></i> Thông tin phòng</h3></div>
                    <div className="card-body">
                      <table className="table table-sm">
                        <tbody>
                          <tr><th>Phòng</th><td>{currentRoom.tenPhong}</td></tr>
                          <tr><th>Tòa nhà</th><td>{currentRoom.toaNha?.tenToaNha || 'N/A'}</td></tr>
                          <tr><th>Địa chỉ</th><td>{currentRoom.toaNha?.diaChi || 'N/A'}</td></tr>
                          <tr><th>Số tầng</th><td>{currentRoom.toaNha?.soTang || 'N/A'}</td></tr>
                          <tr><th>Số giường</th><td>{currentRoom.soGiuong}</td></tr>
                          <tr><th>Giá thuê</th><td>{formatCurrency(currentRoom.giaThue)}</td></tr>
                          <tr><th>Trạng thái</th>
                            <td><span className="badge bg-success">{currentRoom.trangThai}</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  {currentRoom.giuong && (
                    <div className="card mb-3">
                      <div className="card-header"><h3><i className="fas fa-bed"></i> Giường của bạn</h3></div>
                      <div className="card-body">
                        <table className="table table-sm">
                          <tbody>
                            <tr><th>Mã giường</th><td>{currentRoom.giuong.maGiuong}</td></tr>
                            <tr><th>Số giường</th><td>{currentRoom.giuong.soGiuong}</td></tr>
                            <tr><th>Trạng thái</th><td>{currentRoom.giuong.trangThai}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {currentRoom.danhSachSinhVien && currentRoom.danhSachSinhVien.length > 0 && (
                <div className="card">
                  <div className="card-header"><h3><i className="fas fa-users"></i> Cùng phòng</h3></div>
                  <div className="card-body">
                    <table className="table">
                      <thead>
                        <tr><th>Mã SV</th><th>Họ tên</th><th>Email</th></tr>
                      </thead>
                      <tbody>
                        {currentRoom.danhSachSinhVien.map(sv => (
                          <tr key={sv.maSinhVien}>
                            <td>{sv.maSinhVien}</td>
                            <td>{sv.hoTen}</td>
                            <td>{sv.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'available' && (
        <div className="card">
          <div className="card-body">
            {availableRooms.length === 0 ? (
              <p className="text-muted">Không có phòng trống</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã phòng</th>
                    <th>Tên phòng</th>
                    <th>Tòa nhà</th>
                    <th>Số giường</th>
                    <th>Giá thuê</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {availableRooms.map(room => (
                    <tr key={room.maPhong}>
                      <td>{room.maPhong}</td>
                      <td>{room.tenPhong}</td>
                      <td>{room.tenToaNha || 'N/A'}</td>
                      <td>{room.soGiuong}</td>
                      <td>{formatCurrency(room.giaThue)}</td>
                      <td><span className="badge bg-success">{room.trangThai}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
