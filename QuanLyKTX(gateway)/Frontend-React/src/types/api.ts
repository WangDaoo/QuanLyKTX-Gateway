// API Type Definitions

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  maTaiKhoan: number;
  tenDangNhap: string;
  hoTen?: string;
  vaiTro: 'Admin' | 'Officer' | 'Student';
  email?: string;
  soDienThoai?: string;
  trangThai?: boolean;
  ngayTao?: string;
  maSinhVien?: number | null;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
  expiresIn?: string;
}

// === BUILDING ===
export interface Building {
  maToaNha: number;
  tenToaNha: string;
  diaChi?: string;
  soTang?: number;
  moTa?: string;
  trangThai?: boolean;
  ngayTao?: string;
}

// === ROOM ===
export interface Room {
  maPhong: number;
  soPhong: string;
  maToaNha: number;
  tenToaNha?: string;
  soGiuong: number;
  loaiPhong?: string;
  giaPhong?: number;
  trangThai: string;
  ngayTao?: string;
}

// === BED ===
export interface Bed {
  maGiuong: number;
  maPhong: number;
  soGiuong: string;
  trangThai: string;
}

// === STUDENT ===
export interface Student {
  maSinhVien: number;
  hoTen: string;
  mssv?: string;
  lop?: string;
  khoa?: string;
  gioiTinh?: string;
  ngaySinh?: string;
  diaChi?: string;
  sDT?: string;
  email?: string;
  maPhong?: number;
  soPhong?: string;
  tenToaNha?: string;
  trangThai?: boolean;
  ngayTao?: string;
}

// === CONTRACT ===
export interface Contract {
  maHopDong: number;
  maSinhVien: number;
  hoTen?: string;
  maGiuong: number;       // ⚠️ Backend: MaGiuong (FK tới Giuong), không phải MaPhong
  maPhong?: number;        // Có thể join từ Giuong → Phong → tenPhong
  giaPhong: number;        // ⚠️ Backend: GiaPhong
  tenPhong?: string;        // Join field
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: string;
  ghiChu?: string;
  ngayTao?: string;
  nguoiTao?: string;
}

// === BILL ===
export interface Bill {
  maHoaDon: number;
  maSinhVien: number;
  hoTen?: string;
  maPhong?: number;
  thang: number;
  nam: number;
  tongTien: number;
  trangThai: string;
  ngayTao?: string;
  chiTiet?: BillDetail[];
}

export interface BillDetail {
  maChiTiet: number;
  maHoaDon: number;
  loaiPhi: string;
  tenPhi: string;
  soLuong?: number;
  donGia?: number;
  thanhTien: number;
}

// === RECEIPT ===
export interface Receipt {
  maBienLai: number;
  maHoaDon: number;
  maSinhVien: number;
  hoTen?: string;
  soTien: number;
  ngayThanhToan: string;
  phuongThuc: string;
  ghiChu?: string;
}

// === FEE ===
// ⚠️ Backend dùng: maMucPhi, tenMucPhi, giaTien, donVi, ghiChu
export interface Fee {
  maMucPhi: number;
  tenMucPhi: string;
  loaiPhi: string;
  giaTien: number;       // decimal → number
  donVi?: string;
  ghiChu?: string;
  trangThai?: boolean;
}

// === FEE CONFIG ===
export interface FeeConfig {
  maCauHinh: number;
  maPhi: number;
  tenPhi?: string;
  loai: string;
  giaTri: number;
  moTa?: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  trangThai?: boolean;
}

// === PRICE TIER ===
// Backend BacGia uses: MaBacGia, Loai, TuKwh, DenKwh, DonGia
export interface PriceTier {
  maBacGia: number;
  loai: string;
  tuKwh?: number;
  denKwh?: number;
  giaDonVi: number;    // Backend: DonGia → camelCase donGia → alias → giaDonVi
  moTa?: string;
  trangThai?: boolean;
}

// === METER READING ===
// Backend model ChiSoDienNuoc uses: MaChiSo, MaPhong, Thang, Nam, ChiSoDien, ChiSoNuoc, NgayTao
export interface MeterReading {
  maChiSo: number;
  maPhong: number;
  tenPhong?: string;
  loai?: string;
  chiSoDien: number;    // Backend field: ChiSoDien
  chiSoNuoc: number;    // Backend field: ChiSoNuoc
  soTieuThu?: number;
  thang: number;
  nam: number;
  ngayTao: string;      // Backend field: NgayTao
}

// === REGISTRATION ===
// Backend DonDangKyResponse uses: MaDon, MaSinhVien, TrangThai, NgayDangKy, GhiChu,
// TenSinhVien, MSSV, Lop, Khoa, PhongDeXuat, ToaNhaDeXuat
export interface Registration {
  maDon: number;              // Backend: MaDon
  maSinhVien: number;         // Backend: MaSinhVien
  hoTen?: string;              // Backend: TenSinhVien → camelCase tenSinhVien → displayed as hoTen
  maToaNha?: number;
  tenToaNha?: string;         // Backend: ToaNhaDeXuat → camelCase toaNhaDeXuat → displayed as tenToaNha
  maPhongDeXuat?: number;      // Backend: MaPhongDeXuat
  tenPhongYeuCau?: string;     // Backend: PhongDeXuat → camelCase phongDeXuat → displayed as tenPhongYeuCau
  ngayDangKy: string;          // Backend: NgayDangKy
  trangThai: string;           // Backend: TrangThai
  ghiChu?: string;             // Backend: GhiChu
}

// === CHANGE REQUEST ===
export interface ChangeRequest {
  maYeuCau: number;
  maSinhVien: number;
  hoTen?: string;
  maPhongHienTai: number;
  tenPhongHienTai?: string;
  maPhongYeuCau: number;
  tenPhongYeuCau?: string;
  lyDo?: string;
  ngayYeuCau: string;
  trangThai: string;
  ngayXuLy?: string;
  ghiChu?: string;
}

// === VIOLATION ===
// Backend KyLuatResponse uses: MaKyLuat, MaSinhVien, LoaiViPham, MoTa, MucPhat,
// NgayViPham, TrangThai, TenSinhVien, SoPhong, TenToaNha, etc.
export interface Violation {
  maKyLuat: number;        // Backend: MaKyLuat → camelCase maKyLuat (norm alias → maViPham)
  maSinhVien: number;      // Backend: MaSinhVien → maSinhVien
  hoTen?: string;           // Backend: TenSinhVien → tenSinhVien → displayed as hoTen
  maPhong?: number;
  loaiViPham: string;     // Backend: LoaiViPham → loaiViPham
  moTa: string;           // Backend: MoTa → moTa
  mucPhat: number;         // Backend: MucPhat → mucPhat
  ngayViPham: string;     // Backend: NgayViPham → ngayViPham
  trangThai: string;       // Backend: TrangThai → trangThai
}

// === DISCIPLINE SCORE ===
// Backend DiemRenLuyen model uses: MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu
export interface DisciplineScore {
  maDiem: number;
  maSinhVien: number;
  hoTen?: string;
  thang: number;
  nam: number;
  diem: number;          // Backend: DiemSo → camelCase diemSo → norm() drops Pascal prefix → diemSo → displayed as diem
  xepLoai?: string;       // Backend: XepLoai
  nhanXet?: string;        // Backend: GhiChu → camelCase ghiChu → displayed as nhanXet
}

// === OVERDUE NOTICE ===
export interface OverdueNotice {
  maThongBao: number;
  maHoaDon: number;
  maSinhVien: number;
  hoTen?: string;
  soTien: number;
  ngayQuaHan: string;
  soNgayQuaHan: number;
  trangThai: string;
}

// === PAGINATION ===
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// === REPORT ===
// Backend trả về array: [{TenToaNha, TongSoPhong, SoPhongCoSinhVien, TyLeLapDay}]
export interface ReportOccupancy {
  tenToaNha: string;
  tongSoPhong: number;
  soPhongCoSinhVien: number;
  tyLeLapDay: number;
}

// Backend trả về array: [{Thang, Nam, TongSoHoaDon, TongDoanhThu, DoanhThuDaThu, DoanhThuChuaThu}]
export interface ReportRevenue {
  thang: number;
  nam: number;
  tongSoHoaDon: number;
  tongDoanhThu: number;
  doanhThuDaThu: number;
  doanhThuChuaThu: number;
}

// Backend trả về array: [{MaSinhVien, HoTen, MSSV, Lop, Khoa, SoPhong, TenToaNha, SoHoaDonChuaThanhToan, TongCongNo}]
export interface ReportDebt {
  maSinhVien: number;
  hoTen: string;
  mssv?: string;
  lop?: string;
  khoa?: string;
  soPhong?: string;
  tenToaNha?: string;
  soHoaDonChuaThanhToan: number;
  tongCongNo: number;
}

// Backend trả về array: [{TenToaNha, TongSoPhong, TongSoDien, TongSoNuoc, TrungBinhDien, TrungBinhNuoc}]
export interface ReportElectricityWater {
  tenToaNha: string;
  tongSoPhong: number;
  tongSoDien?: number;
  tongSoNuoc?: number;
  trungBinhDien?: number;
  trungBinhNuoc?: number;
}

// Backend trả về array: [{MSSV, HoTen, SoPhong, TenToaNha, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai}]
export interface ReportViolation {
  mssv?: string;
  hoTen: string;
  soPhong?: string;
  tenToaNha?: string;
  loaiViPham: string;
  moTa?: string;
  ngayViPham: string;
  mucPhat: number;
  trangThai: string;
}
