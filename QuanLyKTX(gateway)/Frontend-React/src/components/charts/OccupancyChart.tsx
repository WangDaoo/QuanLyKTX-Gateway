// Recharts-based visualizations for the KTX dashboard
import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart,
} from 'recharts';
import type { ReportOccupancy, ReportRevenue, ReportElectricityWater } from '../../types/api';

// === COLORS ===
const COLORS = {
  primary: '#4f46e5',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#94a3b8',
  chart: ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'],
};

// === PIE CHART: Room Occupancy ===
interface OccupancyPieProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
}

export function OccupancyPieChart({ data, title }: OccupancyPieProps) {
  if (!data || data.length === 0) return <div className="text-muted text-center p-4">Không có dữ liệu</div>;

  return (
    <div>
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS.chart[index % COLORS.chart.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
            formatter={(value: number, name: string) => [`${value} phòng`, name]}
          />
          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// === BAR CHART: Revenue by Month ===
interface RevenueBarProps {
  data: { thang: number; nam: number; doanhThuDaThu: number; doanhThuChuaThu: number }[];
}

export function RevenueBarChart({ data }: RevenueBarProps) {
  const safeData = Array.isArray(data) ? data.filter((d) => d && typeof d.thang === 'number') : [];
  if (safeData.length === 0) return <div className="text-muted text-center p-4">Không có dữ liệu</div>;

  const chartData = safeData.map((d) => ({
    thang: `T${d.thang}`,
    'Đã thu': d.doanhThuDaThu ?? d.tongDoanhThu ?? 0,
    'Chưa thu': d.doanhThuChuaThu ?? d.tongCongNo ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="thang" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
          formatter={(value: number) => [`${value.toLocaleString('vi-VN')} VNĐ`, '']}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="Đã thu" fill={COLORS.success} radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="Chưa thu" fill={COLORS.danger} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// === AREA CHART: Occupancy Rate by Building ===
interface OccupancyAreaProps {
  data: ReportOccupancy[];
}

export function OccupancyAreaChart({ data }: OccupancyAreaProps) {
  const safeData = Array.isArray(data) ? data.filter((d) => d && d.tenToaNha) : [];
  if (safeData.length === 0) return <div className="text-muted text-center p-4">Không có dữ liệu</div>;

  const chartData = safeData.map((d) => ({
    name: String(d.tenToaNha || '').length > 12 ? String(d.tenToaNha).slice(0, 12) + '…' : String(d.tenToaNha),
    'Tỷ lệ (%)': Math.round((d.tyLeLapDay ?? 0) * 100),
    'Đã thuê': d.soPhongCoSinhVien ?? 0,
    'Tổng phòng': d.tongSoPhong ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.15} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Area type="monotone" dataKey="Tỷ lệ (%)" stroke={COLORS.primary} fill="url(#colorOccupancy)" strokeWidth={2} />
        <Bar dataKey="Đã thuê" fill={COLORS.success} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// === LINE CHART: Electricity & Water ===
interface EwLineProps {
  data: ReportElectricityWater[];
}

export function ElectricityWaterLineChart({ data }: EwLineProps) {
  if (!data || data.length === 0) return <div className="text-muted text-center p-4">Không có dữ liệu</div>;

  const chartData = data.map((d) => ({
    name: d.tenToaNha.length > 10 ? d.tenToaNha.slice(0, 10) + '…' : d.tenToaNha,
    'Điện (kWh)': d.tongSoDien ?? 0,
    'Nước (m³)': d.tongSoNuoc ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line type="monotone" dataKey="Điện (kWh)" stroke={COLORS.warning} strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="Nước (m³)" stroke={COLORS.info} strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// === Donut Chart: Student Status ===
interface StudentStatusDonutProps {
  occupied: number;
  empty: number;
}

export function StudentStatusDonut({ occupied, empty }: StudentStatusDonutProps) {
  const data = [
    { name: 'Đã thuê', value: occupied, color: COLORS.success },
    { name: 'Trống', value: empty, color: COLORS.muted },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
          formatter={(value: number) => [`${value} phòng`, '']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
