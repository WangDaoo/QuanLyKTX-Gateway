// API Client - Wrapper around fetch, preserving original logic
import { API_BASE_URL, LOCAL_STORAGE_KEYS } from '../utils/constants';

// === PascalCase → camelCase transformer (applied to all API responses) ===
// Backend returns PascalCase keys; transformKeys converts them to camelCase for type safety.
// Example: MaToaNha → maToaNha, TenToaNha → tenToaNha
function toCamelCase(str: string): string {
  if (!str) return str;
  // Handle snake_case: THUONG_CHU → thuongChu
  const afterSnake = str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  // Handle PascalCase: MaToaNha → maToaNha
  return afterSnake[0].toLowerCase() + afterSnake.slice(1);
}

function transformKeys<T>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T;
  if (Array.isArray(obj)) return obj.map(transformKeys) as T;
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      result[toCamelCase(key)] = transformKeys((obj as Record<string, unknown>)[key]);
    }
    return result as T;
  }
  return obj as T;
}

// === Normalize API response: handle BOTH PascalCase and camelCase ===
// This function recursively normalizes an object/array so callers can safely
// access properties using camelCase keys (e.g. item.maToaNha) regardless of
// whether the API returned MaToaNha or maToaNha.
//
// Field aliases: maps camelCase field names that the backend uses to the
// camelCase names that frontend component code expects.
// e.g. DiemSo → diemSo, but component expects diem → also add diem alias.
const FIELD_ALIASES: Record<string, string> = {
  // DisciplineScores: backend returns DiemSo, component expects diem
  diemSo: 'diem',
  // DisciplineScores: backend returns GhiChu, component expects nhanXet
  ghiChu: 'nhanXet',
  // Violations & Registrations: backend returns TenSinhVien, component expects hoTen
  tenSinhVien: 'hoTen',
  // Violations: backend returns MaKyLuat, component expects maViPham
  maKyLuat: 'maViPham',
  // Violations: backend returns MucPhat, component expects mucPhat ✓ (both match)
  // Violations: backend returns LoaiViPham, component expects loaiViPham ✓ (both match)
  // Violations: backend returns MoTa, component expects moTa ✓ (both match)
  // Violations: backend returns NgayViPham, component expects ngayViPham ✓ (both match)
  // Registrations: backend returns MaDon, component expects maDon ✓ (both same after camelCase)
  // Registrations: backend returns MaSinhVien, component expects maSinhVien ✓ (both same)
  // Registrations: backend returns TrangThai, component expects trangThai ✓ (both same)
  // Registrations: backend returns NgayDangKy, component expects ngayDangKy ✓ (both same)
  // Registrations: backend returns MaPhongDeXuat, component expects maPhongDeXuat ✓ (both same)
  // Registrations: backend returns GhiChu, component expects ghiChu ✓ (both match)
  // Registrations: backend returns PhongDeXuat, component expects tenPhongYeuCau
  phongDeXuat: 'tenPhongYeuCau',
  // Registrations: backend returns ToaNhaDeXuat, component expects tenToaNha
  toaNhaDeXuat: 'tenToaNha',
  // ChangeRequests: backend returns MaPhongHienTai, component expects maPhongHienTai ✓
  // ChangeRequests: backend returns MaPhongYeuCau, component expects maPhongYeuCau ✓
  // ChangeRequests: backend returns TenPhongHienTai, component expects tenPhongHienTai ✓
  // ChangeRequests: backend returns TenPhongYeuCau, component expects tenPhongYeuCau ✓
  // ChangeRequests: backend returns NgayYeuCau, component expects ngayYeuCau ✓
  // Bills: backend returns MaHoaDon, component expects maHoaDon ✓
  // Bills: backend returns MaSinhVien, component expects maSinhVien ✓
  // Bills: backend returns TongTien, component expects tongTien ✓
  // Bills: backend returns TrangThai, component expects trangThai ✓
  // BillDetails: backend returns MaChiTiet, component expects maChiTiet ✓
  // BillDetails: backend returns LoaiChiPhi, component expects loaiPhi (MISMATCH!)
  loaiChiPhi: 'loaiPhi',
  // BillDetails: backend returns DonGia, component expects donGia ✓ (both match)
  // BillDetails: backend returns SoLuong, component expects soLuong ✓ (both match)
  // BillDetails: backend returns ThanhTien, component expects thanhTien ✓
  // Receipts: backend returns MaBienLai, component expects maBienLai ✓
  // Receipts: backend returns SoTien, component expects soTien ✓ (both match)
  // Receipts: backend returns NgayThu, component expects ngayThanhToan (field mismatch!)
  ngayThu: 'ngayThanhToan',
  // Receipts: backend returns PhuongThuc, component expects phuongThuc ✓ (both match)
  // OverdueNotices: backend returns MaThongBao, component expects maThongBao ✓
  // OverdueNotices: backend returns SoTien, component expects soTien ✓
  // OverdueNotices: backend returns NgayQuaHan, component expects ngayQuaHan ✓
  // OverdueNotices: backend returns SoNgayQuaHan, component expects soNgayQuaHan ✓
  // OverdueNotices: backend returns TrangThai, component expects trangThai ✓
  // Fee: backend returns GiaTien, component expects giaTien ✓ (both match)
  // Fee: backend returns TenMucPhi, component expects tenMucPhi ✓
  // FeeConfigs: backend returns GiaTri, component expects giaTri ✓ (both match)
  // PriceTiers: backend returns DonGia, component expects giaDonVi (alias)
  donGia: 'giaDonVi',
  // Rooms: backend returns MaPhong, component expects maPhong ✓
  // Rooms: backend returns SoPhong, component expects soPhong ✓
  // Rooms: backend returns MaToaNha, component expects maToaNha ✓
  // Rooms: backend returns TenToaNha, component expects tenToaNha ✓
  // Rooms: backend returns GiaPhong, component expects giaPhong ✓
  // Rooms: backend returns LoaiPhong, component expects loaiPhong ✓
  // Rooms: backend returns TrangThai, component expects trangThai ✓
  // Students: backend returns MaSinhVien, component expects maSinhVien ✓
  // Students: backend returns MSSV, component expects mssv ✓
  // Students: backend returns HoTen, component expects hoTen ✓
  // Students: backend returns NgaySinh, component expects ngaySinh ✓
  // Students: backend returns GioiTinh, component expects gioiTinh ✓
  // Students: backend returns SoDienThoai → camelCase soDienThoai → alias sDT
  soDienThoai: 'sDT',
  // Students: backend returns DiaChi, component expects diaChi ✓
  // Students: backend returns MaPhong, component expects maPhong ✓
  // Students: backend returns TrangThai, component expects trangThai ✓
  // Buildings: backend returns MaToaNha, component expects maToaNha ✓
  // Buildings: backend returns TenToaNha, component expects tenToaNha ✓
  // Buildings: backend returns DiaChi, component expects diaChi ✓
  // Buildings: backend returns SoTang, component expects soTang ✓
  // Buildings: backend returns MoTa, component expects moTa ✓
  // Buildings: backend returns TrangThai, component expects trangThai ✓
  // Buildings: backend returns NgayTao, component expects ngayTao ✓
  // Beds: backend returns MaGiuong, component expects maGiuong ✓
  // Beds: backend returns MaPhong, component expects maPhong ✓
  // Beds: backend returns SoGiuong, component expects soGiuong ✓
  // Beds: backend returns TrangThai, component expects trangThai ✓
  // Contracts: backend returns MaHopDong, component expects maHopDong ✓
  // Contracts: backend returns MaGiuong, component expects maGiuong ✓
  // Contracts: backend returns GiaPhong, component expects giaPhong ✓
  // Contracts: backend returns TrangThai, component expects trangThai ✓
  // Contracts: backend returns NgayBatDau, component expects ngayBatDau ✓
  // Contracts: backend returns NgayKetThuc, component expects ngayKetThuc ✓
};

function norm<T>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T;
  if (Array.isArray(obj)) return obj.map(norm) as T;
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    const input = obj as Record<string, unknown>;
    for (const key of Object.keys(input)) {
      const camelKey = toCamelCase(key);
      // Prefer camelCase key if it already exists, else add with camelCase
      if (result[camelKey] === undefined) {
        const value = norm(input[key]);
        result[camelKey] = value;
        // Also add alias if defined (e.g. diemSo → diem for DisciplineScore)
        const alias = FIELD_ALIASES[camelKey];
        if (alias && result[alias] === undefined) {
          result[alias] = value;
        }
      }
    }
    return result as T;
  }
  return obj as T;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  }

  private buildUrl(endpoint: string, params: Record<string, unknown> = {}): string {
    const separator = endpoint.includes('?') ? '&' : '?';
    const queryString = Object.keys(params)
      .filter((key) => params[key] !== null && params[key] !== undefined && params[key] !== '')
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key] as string | number)}`)
      .join('&');
    return queryString ? `${endpoint}${separator}${queryString}` : endpoint;
  }

  private getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...additionalHeaders,
    };
  }

  private handleUnauthorized(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    // React Router handles navigation via AuthContext
    window.dispatchEvent(new CustomEvent('unauthorized'));
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Unauthorized - Token không hợp lệ hoặc đã hết hạn');
    }

    if (!response.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : {};
      } catch {
        // ignore parse error
      }
      throw new Error((errorData.message as string) || `HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const raw = text ? JSON.parse(text) : null;

    if (!raw || typeof raw !== 'object') return raw as unknown as T;

    // Extract wrapper fields (keep PascalCase)
    const wrapper = raw as Record<string, unknown>;
    const { success: _s, message: _m, data: rawData } = wrapper;

    // Normalize: handle BOTH PascalCase and camelCase fields
    // Returns unwrapped normalized data so callers get camelCase keys
    if (rawData !== undefined) {
      return norm(rawData) as unknown as T;
    }

    // No wrapper — normalize object directly
    return norm(raw) as unknown as T;
  }

  async get<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const response = await fetch(
      url.startsWith('http') ? url : `${this.baseUrl}${endpoint}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data: unknown = {}): Promise<T> {
    const response = await fetch(
      endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: unknown = {}): Promise<T> {
    const response = await fetch(
      endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(
      endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<T>(response);
  }

  // Excel import (multipart/form-data)
  async uploadExcel<T>(endpoint: string, file: File): Promise<T> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
