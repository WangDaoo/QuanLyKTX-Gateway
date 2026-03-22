import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import type { Fee } from '../../types/api';

export default function Services() {
  const [serviceFees, setServiceFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get<Fee[]>(ENDPOINTS.USER_FEES_BY_TYPE('Dịch vụ'));
      setServiceFees(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  const services = [
    {
      icon: 'fa-wifi',
      title: 'Internet WiFi',
      description: 'Kết nối WiFi tốc độ cao miễn phí trong khuôn viên KTX',
      available: true,
    },
    {
      icon: 'fa-shower',
      title: 'Nước sinh hoạt',
      description: 'Nước máy sạch, được kiểm tra chất lượng định kỳ',
      available: true,
    },
    {
      icon: 'fa-bolt',
      title: 'Điện',
      description: 'Điện sinh hoạt, tính theo số điện tiêu thụ hàng tháng',
      available: true,
    },
    {
      icon: 'fa-parking',
      title: 'Gửi xe',
      description: 'Bãi đỗ xe có camera giám sát 24/7',
      available: true,
    },
    {
      icon: 'fa-fire-extinguisher',
      title: 'PCCC',
      description: 'Hệ thống phòng cháy chữa cháy theo tiêu chuẩn',
      available: true,
    },
    {
      icon: 'fa-clock',
      title: 'Giờ giấc',
      description: 'Giờ giấc sinh hoạt: 05:00 - 22:30 hàng ngày',
      available: true,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-concierge-bell"></i> Dịch vụ KTX</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {services.map((svc, idx) => (
          <div className="col-md-4 mb-3" key={idx}>
            <div className="card service-card h-100">
              <div className="card-body text-center">
                <div className="service-icon mb-3">
                  <i className={`fas ${svc.icon}`}></i>
                </div>
                <h5 className="card-title">{svc.title}</h5>
                <p className="card-text text-muted">{svc.description}</p>
                {svc.available && (
                  <span className="badge bg-success">
                    <i className="fas fa-check me-1"></i>Đang hoạt động
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {serviceFees.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h3><i className="fas fa-coins"></i> Bảng giá dịch vụ</h3>
          </div>
          <div className="card-body">
            <table className="table">
              <thead>
                <tr><th>Tên dịch vụ</th><th>Số tiền</th><th>Đơn vị</th><th>Mô tả</th></tr>
              </thead>
              <tbody>
                {serviceFees.map(f => (
                  <tr key={f.maPhi}>
                    <td>{f.tenPhi}</td>
                    <td className="fw-bold text-primary">{formatCurrency(f.soTien)}</td>
                    <td>{f.donVi || '-'}</td>
                    <td>{f.moTa || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header">
          <h3><i className="fas fa-info-circle"></i> Liên hệ hỗ trợ</h3>
        </div>
        <div className="card-body">
          <p>Nếu bạn gặp sự cố về dịch vụ, vui lòng liên hệ:</p>
          <ul>
            <li><strong>Ban quản lý KTX:</strong> Tầng 1, Tòa nhà A</li>
            <li><strong>Điện thoại:</strong> (028) 1234-5678</li>
            <li><strong>Email:</strong> ktv@uni.edu.vn</li>
            <li><strong>Giờ làm việc:</strong> 07:00 - 17:00 (Thứ 2 - Thứ 6)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
