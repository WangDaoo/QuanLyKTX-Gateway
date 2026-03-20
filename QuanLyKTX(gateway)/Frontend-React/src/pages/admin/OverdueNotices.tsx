import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Alert from '../../components/common/Alert';
import type { OverdueNotice } from '../../types/api';

export default function OverdueNotices() {
  const [items, setItems] = useState<OverdueNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ msg: '', type: '' as 'success' | 'danger' | 'warning' | 'info' });

  const columns = [
    { key: 'maThongBao', label: 'Mã TB' },
    { key: 'hoTen', label: 'Sinh viên' },
    { key: 'soTien', label: 'Số tiền', render: (v: number) => formatCurrency(v) },
    { key: 'ngayQuaHan', label: 'Ngày quá hạn', render: (v: string) => formatDate(v) },
    { key: 'soNgayQuaHan', label: 'Số ngày quá hạn' },
    { key: 'trangThai', label: 'Trạng thái', render: (v: string) => {
      const cls = v === 'Đã thanh toán' ? 'badge-success' : v === 'Đã gửi thông báo' ? 'badge-info' : 'badge-danger';
      return <span className={`badge ${cls}`}>{v}</span>;
    }},
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<OverdueNotice[]>(ENDPOINTS.OVERDUE_NOTICES);
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><i className="fas fa-bell"></i> Quản lý Thông báo Quá Hạn</h1>
        <button className="btn btn-primary" onClick={loadData}>
          <i className="fas fa-sync"></i> Làm mới
        </button>
      </div>
      {alert.msg && <Alert message={alert.msg} type={alert.type} onClose={() => setAlert({ ...alert, msg: '' })} />}
      {error && <Alert message={error} type="danger" onClose={() => setError('')} />}

      <DataTable columns={columns} data={items} loading={loading} emptyMessage="Không có thông báo quá hạn nào" />
    </div>
  );
}
