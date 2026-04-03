-- =============================================
-- Master Seed Script - QuanLyKyTucXa
-- Chạy lần lượt từ trên xuống dưới
-- Tất cả text tiếng Việt có prefix N''
-- Tác giả: KTX System | 2026-04-03
-- =============================================
USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'QuanLyKyTucXa')
BEGIN
    ALTER DATABASE QuanLyKyTucXa SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE QuanLyKyTucXa;
END
CREATE DATABASE QuanLyKyTucXa;
GO

USE QuanLyKyTucXa;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- PHASE 1: TẠO BẢNG (20 bảng)
-- =============================================

-- Bảng ToaNha
CREATE TABLE ToaNha (
    MaToaNha INT IDENTITY(1,1) PRIMARY KEY,
    TenToaNha NVARCHAR(200) NOT NULL,
    DiaChi NVARCHAR(500),
    SoTang INT,
    MoTa NVARCHAR(1000),
    TrangThai BIT DEFAULT 1,
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100)
);
GO

-- Bảng Phong
CREATE TABLE Phong (
    MaPhong INT IDENTITY(1,1) PRIMARY KEY,
    MaToaNha INT NOT NULL,
    SoPhong NVARCHAR(20) NOT NULL,
    SoGiuong INT NOT NULL,
    LoaiPhong NVARCHAR(50) NOT NULL,
    GiaPhong DECIMAL(18,2) NOT NULL,
    MoTa NVARCHAR(500),
    TrangThai NVARCHAR(50) DEFAULT N'Trống',
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaToaNha) REFERENCES ToaNha(MaToaNha)
);
GO

-- Bảng Giuong
CREATE TABLE Giuong (
    MaGiuong INT IDENTITY(1,1) PRIMARY KEY,
    MaPhong INT NOT NULL,
    SoGiuong NVARCHAR(10) NOT NULL,
    TrangThai NVARCHAR(50) DEFAULT N'Trống',
    MoTa NVARCHAR(500),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
);
GO

-- Bảng SinhVien
CREATE TABLE SinhVien (
    MaSinhVien INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(200) NOT NULL,
    MSSV NVARCHAR(20) NOT NULL UNIQUE,
    Lop NVARCHAR(50) NOT NULL,
    Khoa NVARCHAR(100) NOT NULL,
    NgaySinh DATETIME,
    GioiTinh NVARCHAR(10),
    SDT NVARCHAR(15),
    Email NVARCHAR(100),
    DiaChi NVARCHAR(500),
    AnhDaiDien NVARCHAR(500),
    TrangThai BIT DEFAULT 1,
    MaPhong INT,
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
);
GO

-- Bảng TaiKhoan
CREATE TABLE TaiKhoan (
    MaTaiKhoan INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
    MatKhau NVARCHAR(255) NOT NULL,
    HoTen NVARCHAR(200) NOT NULL,
    Email NVARCHAR(100),
    VaiTro NVARCHAR(20) DEFAULT N'User',
    TrangThai BIT DEFAULT 1,
    MaSinhVien INT,
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    SoLanDangNhapSai INT DEFAULT 0,
    NgayKhoa DATETIME,
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien)
);
GO

-- Bảng MucPhi
CREATE TABLE MucPhi (
    MaMucPhi INT IDENTITY(1,1) PRIMARY KEY,
    TenMucPhi NVARCHAR(200) NOT NULL,
    LoaiPhi NVARCHAR(100) NOT NULL,
    GiaTien DECIMAL(18,2) NOT NULL,
    DonVi NVARCHAR(50),
    TrangThai BIT DEFAULT 1,
    GhiChu NVARCHAR(500),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100)
);
GO

-- Bảng CauHinhPhi
CREATE TABLE CauHinhPhi (
    MaCauHinh INT IDENTITY(1,1) PRIMARY KEY,
    Loai NVARCHAR(50) NOT NULL,
    MucToiThieu DECIMAL(18,2) NOT NULL,
    TrangThai BIT DEFAULT 1,
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100)
);
GO

-- Bảng BacGia
CREATE TABLE BacGia (
    MaBac INT IDENTITY(1,1) PRIMARY KEY,
    Loai NVARCHAR(50) NOT NULL,
    ThuTu INT NOT NULL,
    TuSo INT,
    DenSo INT,
    DonGia DECIMAL(18,2) NOT NULL,
    TrangThai BIT DEFAULT 1,
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100)
);
GO

-- Bảng HopDong
CREATE TABLE HopDong (
    MaHopDong INT IDENTITY(1,1) PRIMARY KEY,
    MaSinhVien INT NOT NULL,
    MaGiuong INT NOT NULL,
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE NOT NULL,
    GiaPhong DECIMAL(18,2) NOT NULL,
    TrangThai NVARCHAR(50) DEFAULT N'Chờ duyệt',
    GhiChu NVARCHAR(1000),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
    FOREIGN KEY (MaGiuong) REFERENCES Giuong(MaGiuong)
);
GO

-- Bảng HoaDon
CREATE TABLE HoaDon (
    MaHoaDon INT IDENTITY(1,1) PRIMARY KEY,
    MaSinhVien INT,
    MaPhong INT,
    MaHopDong INT,
    Thang INT NOT NULL,
    Nam INT NOT NULL,
    TongTien DECIMAL(18,2) NOT NULL,
    TrangThai NVARCHAR(50) DEFAULT N'Chưa thanh toán',
    HanThanhToan DATE,
    NgayThanhToan DATE,
    GhiChu NVARCHAR(1000),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong),
    FOREIGN KEY (MaHopDong) REFERENCES HopDong(MaHopDong)
);
GO

-- Bảng BienLaiThu
CREATE TABLE BienLaiThu (
    MaBienLai INT IDENTITY(1,1) PRIMARY KEY,
    MaHoaDon INT NOT NULL,
    SoTienThu DECIMAL(18,2) NOT NULL,
    NgayThu DATE NOT NULL,
    PhuongThucThanhToan NVARCHAR(100) NOT NULL,
    NguoiThu NVARCHAR(100),
    GhiChu NVARCHAR(1000),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon)
);
GO

-- Bảng ChiTietHoaDon
CREATE TABLE ChiTietHoaDon (
    MaChiTiet INT IDENTITY(1,1) PRIMARY KEY,
    MaHoaDon INT NOT NULL,
    LoaiChiPhi NVARCHAR(100) NOT NULL,
    SoLuong INT NOT NULL,
    DonGia DECIMAL(18,2) NOT NULL,
    ThanhTien DECIMAL(18,2) NOT NULL,
    GhiChu NVARCHAR(500),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon)
);
GO

-- Bảng KyLuat
CREATE TABLE KyLuat (
    MaKyLuat INT IDENTITY(1,1) PRIMARY KEY,
    MaSinhVien INT NOT NULL,
    LoaiViPham NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(1000) NOT NULL,
    NgayViPham DATE NOT NULL,
    MucPhat DECIMAL(18,2) DEFAULT 0,
    TrangThai NVARCHAR(50) DEFAULT N'Chưa xử lý',
    GhiChu NVARCHAR(1000),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien)
);
GO

-- Bảng DiemRenLuyen
CREATE TABLE DiemRenLuyen (
    MaDiem INT IDENTITY(1,1) PRIMARY KEY,
    MaSinhVien INT NOT NULL,
    Thang INT NOT NULL,
    Nam INT NOT NULL,
    DiemSo DECIMAL(5,2) NOT NULL,
    XepLoai NVARCHAR(50) NOT NULL,
    GhiChu NVARCHAR(1000),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien)
);
GO

-- Bảng DonDangKy
CREATE TABLE DonDangKy (
    MaDon INT IDENTITY(1,1) PRIMARY KEY,
    MaSinhVien INT NOT NULL,
    MaPhongDeXuat INT,
    LyDo NVARCHAR(1000),
    NgayDangKy DATE NOT NULL,
    TrangThai NVARCHAR(50) DEFAULT N'Chờ duyệt',
    GhiChu NVARCHAR(1000),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
    FOREIGN KEY (MaPhongDeXuat) REFERENCES Phong(MaPhong)
);
GO

-- Bảng YeuCauChuyenPhong
CREATE TABLE YeuCauChuyenPhong (
    MaYeuCau INT IDENTITY(1,1) PRIMARY KEY,
    MaSinhVien INT NOT NULL,
    PhongHienTai INT NOT NULL,
    PhongMongMuon INT,
    LyDo NVARCHAR(1000) NOT NULL,
    NgayYeuCau DATE NOT NULL,
    TrangThai NVARCHAR(50) DEFAULT N'Chờ duyệt',
    GhiChu NVARCHAR(1000),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
    FOREIGN KEY (PhongHienTai) REFERENCES Phong(MaPhong),
    FOREIGN KEY (PhongMongMuon) REFERENCES Phong(MaPhong)
);
GO

-- Bảng ChiSoDienNuoc
CREATE TABLE ChiSoDienNuoc (
    MaChiSo INT IDENTITY(1,1) PRIMARY KEY,
    MaPhong INT NOT NULL,
    Thang INT NOT NULL,
    Nam INT NOT NULL,
    ChiSoDien INT NOT NULL,
    ChiSoNuoc INT NOT NULL,
    NguoiGhi NVARCHAR(100),
    TrangThai NVARCHAR(50) DEFAULT N'Đã ghi',
    GhiChu NVARCHAR(1000),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
);
GO

-- Bảng ThongBaoQuaHan
CREATE TABLE ThongBaoQuaHan (
    MaThongBao INT IDENTITY(1,1) PRIMARY KEY,
    MaSinhVien INT NOT NULL,
    MaHoaDon INT NULL,
    NgayThongBao DATE NOT NULL,
    NoiDung NVARCHAR(1000) NOT NULL,
    TrangThai NVARCHAR(50) DEFAULT N'Đã gửi',
    GhiChu NVARCHAR(1000),
    IsDeleted BIT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiTao NVARCHAR(100),
    NgayCapNhat DATETIME,
    NguoiCapNhat NVARCHAR(100),
    FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
    FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon)
);
GO

-- Bảng AdminDefault
CREATE TABLE AdminDefault (
    MaAdmin INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
    MatKhau NVARCHAR(255) NOT NULL,
    HoTen NVARCHAR(200) NOT NULL,
    Email NVARCHAR(100),
    GhiChu NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME
);
GO

-- Bảng OfficerDefault
CREATE TABLE OfficerDefault (
    MaOfficer INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
    MatKhau NVARCHAR(255) NOT NULL,
    HoTen NVARCHAR(200) NOT NULL,
    Email NVARCHAR(100),
    GhiChu NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME
);
GO

-- =============================================
-- PHASE 2: TẠO CONSTRAINTS
-- =============================================

-- ChiSoDienNuoc: ChiSoDien >= 0 AND ChiSoNuoc >= 0
ALTER TABLE ChiSoDienNuoc ADD CONSTRAINT CK_ChiSoDienNuoc_Positive
    CHECK (ChiSoDien >= 0 AND ChiSoNuoc >= 0);
GO

-- HopDong: NgayKetThuc > NgayBatDau
ALTER TABLE HopDong ADD CONSTRAINT CK_HopDong_DateRange
    CHECK (NgayKetThuc > NgayBatDau);
GO

-- HopDong: GiaPhong >= 0
ALTER TABLE HopDong ADD CONSTRAINT CK_HopDong_GiaPhong
    CHECK (GiaPhong >= 0);
GO

-- HoaDon: Thang 1-12, Nam >= 2000
ALTER TABLE HoaDon ADD CONSTRAINT CK_HoaDon_MonthYear
    CHECK (Thang >= 1 AND Thang <= 12 AND Nam >= 2000);
GO

-- SinhVien: Email format
ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_EmailFormat
    CHECK (Email IS NULL OR Email LIKE N'%_@_%._%');
GO

-- SinhVien: SDT format (0xxxxxxxxx, 10 số)
ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_PhoneFormat
    CHECK (SDT IS NULL OR (
        (SDT LIKE N'0%' AND LEN(SDT) = 10 AND SDT NOT LIKE N'%[^0-9]%')
    ));
GO

-- SinhVien: HoTen length 2-200
ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_HoTenLength
    CHECK (LEN(HoTen) >= 2 AND LEN(HoTen) <= 200);
GO

-- SinhVien: MSSV format (A-Z + 0-9, 5-20 ký tự)
ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_MSSVFormat
    CHECK (LEN(MSSV) >= 5 AND LEN(MSSV) <= 20 AND MSSV NOT LIKE N'%[^A-Z0-9]%');
GO

-- TaiKhoan: Email format
ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_EmailFormat
    CHECK (Email IS NULL OR Email LIKE N'%_@_%._%');
GO

-- TaiKhoan: TenDangNhap 3-50, chỉ a-zA-Z0-9_
ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_TenDangNhapFormat
    CHECK (LEN(TenDangNhap) >= 3 AND LEN(TenDangNhap) <= 50
           AND TenDangNhap NOT LIKE N'%[^a-zA-Z0-9_]%');
GO

-- TaiKhoan: MatKhau >= 6
ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_MatKhauLength
    CHECK (LEN(MatKhau) >= 6);
GO

-- TaiKhoan: HoTen length 2-200
ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_HoTenLength
    CHECK (LEN(HoTen) >= 2 AND LEN(HoTen) <= 200);
GO

-- TaiKhoan: VaiTro IN (Admin, Officer, Student, User)
ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_VaiTro
    CHECK (VaiTro IN (N'Admin', N'Officer', N'Student', N'User'));
GO

-- ChiSoDienNuoc: Thang 1-12
ALTER TABLE ChiSoDienNuoc ADD CONSTRAINT CK_ChiSoDienNuoc_Thang
    CHECK (Thang >= 1 AND Thang <= 12);
GO

-- ChiSoDienNuoc: Nam >= 2000
ALTER TABLE ChiSoDienNuoc ADD CONSTRAINT CK_ChiSoDienNuoc_Nam
    CHECK (Nam >= 2000);
GO

-- DiemRenLuyen: Thang 1-12
ALTER TABLE DiemRenLuyen ADD CONSTRAINT CK_DiemRenLuyen_Thang
    CHECK (Thang >= 1 AND Thang <= 12);
GO

-- DiemRenLuyen: Nam >= 2000
ALTER TABLE DiemRenLuyen ADD CONSTRAINT CK_DiemRenLuyen_Nam
    CHECK (Nam >= 2000);
GO

-- DiemRenLuyen: DiemSo 0-100
ALTER TABLE DiemRenLuyen ADD CONSTRAINT CK_DiemRenLuyen_DiemSo
    CHECK (DiemSo >= 0 AND DiemSo <= 100);
GO

-- =============================================
-- PHASE 3: TẠO INDEXES
-- =============================================

-- SinhVien: Unique Email (nullable)
CREATE UNIQUE NONCLUSTERED INDEX IX_SinhVien_Email_Unique
ON SinhVien(Email)
WHERE Email IS NOT NULL AND IsDeleted = 0;
GO

-- TaiKhoan: Unique Email (nullable)
CREATE UNIQUE NONCLUSTERED INDEX IX_TaiKhoan_Email_Unique
ON TaiKhoan(Email)
WHERE Email IS NOT NULL AND IsDeleted = 0;
GO

-- TaiKhoan: Unique MaSinhVien (nullable)
CREATE UNIQUE NONCLUSTERED INDEX IX_TaiKhoan_MaSinhVien_Unique
ON TaiKhoan(MaSinhVien)
WHERE MaSinhVien IS NOT NULL AND IsDeleted = 0;
GO

-- =============================================
-- PHASE 4: SEED DATA - TÀI KHOẢN HỆ THỐNG (trước SinhVien)
-- =============================================

-- AdminDefault (trước TaiKhoan vì FK không có, nhưng dùng hash cố định)
INSERT INTO AdminDefault (TenDangNhap, MatKhau, HoTen, Email, GhiChu, IsActive)
VALUES (N'admin', N'$2a$12$maT1YkwtB7QlJrT770kjk.SLd9.MXw3vw1GPypJO7WrNdn2eD0Cj2',
        N'Quản trị viên KTX', N'admin@ktx.edu.vn',
        N'Tài khoản admin mặc định - Mật khẩu: admin@123', 1);
GO

-- OfficerDefault
INSERT INTO OfficerDefault (TenDangNhap, MatKhau, HoTen, Email, GhiChu, IsActive)
VALUES (N'officer', N'$2a$10$KO6gOiKQzpEJbXKkliTmuezoUR4S0dPPqWlZEBhPbels3XiNuGiES',
        N'Nhân viên KTX', N'officer@ktx.edu.vn',
        N'Tài khoản officer mặc định - Mật khẩu: officer@123', 1);
GO

-- =============================================
-- PHASE 5: SEED DATA - TÒA NHÀ + PHÒNG + GIƯỜNG
-- =============================================

-- ToaNha: 3 tòa
INSERT INTO ToaNha (TenToaNha, DiaChi, SoTang, MoTa, TrangThai, NguoiTao)
VALUES
(N'Tòa A - Nam Kỳ Khởi Nghĩa', N'123 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM', 5,
 N'Tòa ký túc xá nam nữ tầng 1-2 nữ, 3-5 nam', 1, N'System'),
(N'Tòa B - Lê Văn Sỹ', N'45 Lê Văn Sỹ, Quận 3, TP.HCM', 4,
 N'Tòa ký túc xá nam nữ, tầng 1 nữ, 2-4 nam', 1, N'System'),
(N'Tòa C - Điện Biên Phủ', N'78 Điện Biên Phủ, Quận 3, TP.HCM', 3,
 N'Tòa ký túc xá nam nữ, tầng 1-2 nữ, 3 nam', 1, N'System');
GO

-- Phong: 10 phòng (3 phòng đầu có người, 7 phòng trống)
INSERT INTO Phong (MaToaNha, SoPhong, SoGiuong, LoaiPhong, GiaPhong, MoTa, TrangThai, NguoiTao)
VALUES
-- Tòa A (MaToaNha=1)
(1, N'101', 4, N'4 người', 500000.00, N'Phòng 4 người tầng 1 - Nam', N'Đã có người', N'System'),
(1, N'102', 4, N'4 người', 500000.00, N'Phòng 4 người tầng 1 - Nam', N'Đã có người', N'System'),
(1, N'103', 4, N'4 người', 500000.00, N'Phòng 4 người tầng 1 - Nam', N'Đã có người', N'System'),
(1, N'104', 4, N'4 người', 550000.00, N'Phòng 4 người tầng 1 - Nam', N'Trống', N'System'),
(1, N'105', 6, N'6 người', 400000.00, N'Phòng 6 người tầng 1 - Nam', N'Trống', N'System'),
-- Tòa A tầng 2
(1, N'201', 4, N'4 người', 500000.00, N'Phòng 4 người tầng 2 - Nữ', N'Trống', N'System'),
(1, N'202', 4, N'4 người', 500000.00, N'Phòng 4 người tầng 2 - Nữ', N'Trống', N'System'),
-- Tòa B (MaToaNha=2)
(2, N'301', 4, N'4 người', 600000.00, N'Phòng 4 người VIP tầng 3', N'Trống', N'System'),
(2, N'302', 4, N'4 người', 600000.00, N'Phòng 4 người VIP tầng 3', N'Trống', N'System'),
-- Tòa C (MaToaNha=3)
(3, N'401', 2, N'2 người', 800000.00, N'Phòng 2 người cao cấp tầng 4', N'Trống', N'System');
GO

-- Giuong: 10 phòng (3 phòng đầu có người, 7 phòng trống)
INSERT INTO Giuong (MaPhong, SoGiuong, TrangThai, MoTa, NguoiTao) VALUES
(1, N'1', N'Đã có người', N'Giường 1 - Phòng 101', N'System'),
(1, N'2', N'Đã có người', N'Giường 2 - Phòng 101', N'System'),
(1, N'3', N'Đã có người', N'Giường 3 - Phòng 101', N'System'),
(1, N'4', N'Đã có người', N'Giường 4 - Phòng 101', N'System'),
(2, N'1', N'Đã có người', N'Giường 1 - Phòng 102', N'System'),
(2, N'2', N'Đã có người', N'Giường 2 - Phòng 102', N'System'),
(2, N'3', N'Đã có người', N'Giường 3 - Phòng 102', N'System'),
(2, N'4', N'Đã có người', N'Giường 4 - Phòng 102', N'System'),
(3, N'1', N'Đã có người', N'Giường 1 - Phòng 103', N'System'),
(3, N'2', N'Đã có người', N'Giường 2 - Phòng 103', N'System'),
(3, N'3', N'Đã có người', N'Giường 3 - Phòng 103', N'System'),
(3, N'4', N'Đã có người', N'Giường 4 - Phòng 103', N'System'),
(4, N'1', N'Trống', N'Giường 1 - Phòng 104', N'System'),
(4, N'2', N'Trống', N'Giường 2 - Phòng 104', N'System'),
(4, N'3', N'Trống', N'Giường 3 - Phòng 104', N'System'),
(4, N'4', N'Trống', N'Giường 4 - Phòng 104', N'System'),
(5, N'1', N'Trống', N'Giường 1 - Phòng 105', N'System'),
(5, N'2', N'Trống', N'Giường 2 - Phòng 105', N'System'),
(5, N'3', N'Trống', N'Giường 3 - Phòng 105', N'System'),
(5, N'4', N'Trống', N'Giường 4 - Phòng 105', N'System'),
(5, N'5', N'Trống', N'Giường 5 - Phòng 105', N'System'),
(5, N'6', N'Trống', N'Giường 6 - Phòng 105', N'System'),
(6, N'1', N'Trống', N'Giường 1 - Phòng 201', N'System'),
(6, N'2', N'Trống', N'Giường 2 - Phòng 201', N'System'),
(6, N'3', N'Trống', N'Giường 3 - Phòng 201', N'System'),
(6, N'4', N'Trống', N'Giường 4 - Phòng 201', N'System'),
(7, N'1', N'Trống', N'Giường 1 - Phòng 202', N'System'),
(7, N'2', N'Trống', N'Giường 2 - Phòng 202', N'System'),
(7, N'3', N'Trống', N'Giường 3 - Phòng 202', N'System'),
(7, N'4', N'Trống', N'Giường 4 - Phòng 202', N'System'),
(8, N'1', N'Trống', N'Giường 1 - Phòng 301', N'System'),
(8, N'2', N'Trống', N'Giường 2 - Phòng 301', N'System'),
(8, N'3', N'Trống', N'Giường 3 - Phòng 301', N'System'),
(8, N'4', N'Trống', N'Giường 4 - Phòng 301', N'System'),
(9, N'1', N'Trống', N'Giường 1 - Phòng 302', N'System'),
(9, N'2', N'Trống', N'Giường 2 - Phòng 302', N'System'),
(9, N'3', N'Trống', N'Giường 3 - Phòng 302', N'System'),
(9, N'4', N'Trống', N'Giường 4 - Phòng 302', N'System'),
(10, N'1', N'Trống', N'Giường 1 - Phòng 401', N'System'),
(10, N'2', N'Trống', N'Giường 2 - Phòng 401', N'System');
GO

-- =============================================
-- PHASE 6: SEED DATA - SINH VIÊN + TÀI KHOẢN
-- =============================================

-- SinhVien: 6 sinh viên
-- SV1 (MaSinhVien=1) → có tài khoản student (MaTaiKhoan sẽ = 13 sau account inserts)
INSERT INTO SinhVien (HoTen, MSSV, Lop, Khoa, NgaySinh, GioiTinh, SDT, Email, DiaChi, TrangThai, NguoiTao)
VALUES
(N'Nguyễn Văn An', N'SV001', N'CNTT01', N'Công nghệ thông tin', N'2000-01-15', N'Nam',
 N'0901234567', N'sv001@student.edu.vn', N'123 Đường Lê Lợi, Quận 1, TP.HCM', 1, N'System'),
(N'Trần Thị Bình', N'SV002', N'CNTT02', N'Công nghệ thông tin', N'2000-02-20', N'Nữ',
 N'0902345678', N'sv002@student.edu.vn', N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM', 1, N'System'),
(N'Lê Văn Cường', N'SV003', N'KT01', N'Kế toán', N'2000-03-10', N'Nam',
 N'0903456789', N'sv003@student.edu.vn', N'789 Đường Pasteur, Quận 3, TP.HCM', 1, N'System'),
(N'Phạm Thị Dung', N'SV004', N'CNTT01', N'Công nghệ thông tin', N'2001-04-05', N'Nữ',
 N'0904567890', N'sv004@student.edu.vn', N'321 Đường Đề Thám, Quận 1, TP.HCM', 1, N'System'),
(N'Hoàng Văn Em', N'SV005', N'QTKD01', N'Quản trị kinh doanh', N'2000-05-25', N'Nam',
 N'0905678901', N'sv005@student.edu.vn', N'654 Đường Trần Hưng Đạo, Quận 5, TP.HCM', 1, N'System'),
(N'Nguyễn Thị Phượng', N'SV006', N'CNTT02', N'Công nghệ thông tin', N'2001-06-30', N'Nữ',
 N'0906789012', N'sv006@student.edu.vn', N'987 Đường Võ Văn Tần, Quận 3, TP.HCM', 1, N'System');
GO

-- TaiKhoan: 13 tài khoản
-- Admin
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, NguoiTao)
VALUES (N'admin', N'$2a$12$maT1YkwtB7QlJrT770kjk.SLd9.MXw3vw1GPypJO7WrNdn2eD0Cj2',
        N'Quản trị viên KTX', N'admin@ktx.edu.vn', N'Admin', 1, NULL, N'System');
-- NOTE: VaiTro N'Admin' so sánh đúng với constraint CK_TaiKhoan_VaiTro
GO

-- Officer × 3 (đủ test, không cần 10)
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, NguoiTao)
VALUES
(N'officer', N'$2a$10$KO6gOiKQzpEJbXKkliTmuezoUR4S0dPPqWlZEBhPbels3XiNuGiES',
 N'Nhân viên KTX', N'officer@ktx.edu.vn', N'Officer', 1, NULL, N'System'),
(N'officer2', N'$2a$10$KO6gOiKQzpEJbXKkliTmuezoUR4S0dPPqWlZEBhPbels3XiNuGiES',
 N'Nguyễn Thị Thanh', N'officer2@ktx.edu.vn', N'Officer', 1, NULL, N'System'),
(N'officer3', N'$2a$10$KO6gOiKQzpEJbXKkliTmuezoUR4S0dPPqWlZEBhPbels3XiNuGiES',
 N'Trần Văn Minh', N'officer3@ktx.edu.vn', N'Officer', 1, NULL, N'System');
GO

-- Student: MaTaiKhoan sẽ = 4, MaSinhVien = 1 (SV001 = Nguyễn Văn An)
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, NguoiTao)
VALUES (N'student', N'$2a$12$.9dt9qsWexnUz1tl/ucxEeQ1AaF8WTnaRXLl1KNbWA4yE1lLwyhLe',
        N'Nguyễn Văn An', N'sv001@student.edu.vn', N'Student', 1, 1, N'System');
GO

-- Cập nhật SinhVien=1 có MaPhong=1 sau khi HopDong confirm (sẽ update ở phase sau)
-- Hiện tại để NULL, sp_HopDong_Confirm sẽ cập nhật

-- =============================================
-- PHASE 7: SEED DATA - HỢP ĐỒNG (3 SV có HĐ, 3 SV chưa có)
-- =============================================

DECLARE @HD1 INT, @HD2 INT, @HD3 INT;

-- SV2 (MaSinhVien=2) đăng ký Giuong=1 (Phong 101), HĐ có hiệu lực
INSERT INTO HopDong (MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, NguoiTao)
VALUES (2, 1, N'2024-01-01', N'2024-12-31', 500000.00, N'Có hiệu lực', N'Hợp đồng năm học 2024', N'System');
SET @HD1 = SCOPE_IDENTITY();

-- SV3 (MaSinhVien=3) đăng ký Giuong=5 (Phong 102), HĐ có hiệu lực
INSERT INTO HopDong (MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, NguoiTao)
VALUES (3, 5, N'2024-01-01', N'2024-12-31', 500000.00, N'Có hiệu lực', N'Hợp đồng năm học 2024', N'System');
SET @HD2 = SCOPE_IDENTITY();

-- SV4 (MaSinhVien=4) đăng ký Giuong=9 (Phong 103), HĐ có hiệu lực
INSERT INTO HopDong (MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, NguoiTao)
VALUES (4, 9, N'2024-03-01', N'2025-02-28', 500000.00, N'Có hiệu lực', N'Hợp đồng năm học 2024', N'System');
SET @HD3 = SCOPE_IDENTITY();

-- Cập nhật SinhVien MaPhong khi HĐ có hiệu lực (mô phỏng sp_HopDong_Confirm)
UPDATE SinhVien SET MaPhong = 1 WHERE MaSinhVien = 2;
UPDATE SinhVien SET MaPhong = 2 WHERE MaSinhVien = 3;
UPDATE SinhVien SET MaPhong = 3 WHERE MaSinhVien = 4;
GO

-- =============================================
-- PHASE 8: SEED DATA - HÓA ĐƠN + CHI TIẾT + BIÊN LAI
-- =============================================

DECLARE @HD1 INT, @HD2 INT, @HD3 INT;
SELECT @HD1 = MIN(MaHopDong) FROM HopDong WHERE MaSinhVien = 2;
SELECT @HD2 = MIN(MaHopDong) FROM HopDong WHERE MaSinhVien = 3;
SELECT @HD3 = MIN(MaHopDong) FROM HopDong WHERE MaSinhVien = 4;

-- SV2: 2 hóa đơn (1 chưa thanh toán, 1 đã thanh toán)
INSERT INTO HoaDon (MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, NguoiTao)
VALUES (2, 1, @HD1, 1, 2024, 500000.00, N'Chưa thanh toán', N'2024-01-15', NULL, N'Hóa đơn tiền phòng tháng 1 năm 2024', N'System');
DECLARE @HoaDon1 INT = SCOPE_IDENTITY();

INSERT INTO HoaDon (MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, NguoiTao)
VALUES (2, 1, @HD1, 2, 2024, 500000.00, N'Đã thanh toán', N'2024-02-15', N'2024-02-10', N'Hóa đơn tiền phòng tháng 2 năm 2024', N'System');
DECLARE @HoaDon2 INT = SCOPE_IDENTITY();

-- SV3: 1 hóa đơn chưa thanh toán
INSERT INTO HoaDon (MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, NguoiTao)
VALUES (3, 2, @HD2, 1, 2024, 500000.00, N'Chưa thanh toán', N'2024-01-15', NULL, N'Hóa đơn tiền phòng tháng 1 năm 2024', N'System');
DECLARE @HoaDon3 INT = SCOPE_IDENTITY();

-- SV4: 1 hóa đơn đã thanh toán
INSERT INTO HoaDon (MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, NguoiTao)
VALUES (4, 3, @HD3, 3, 2024, 500000.00, N'Đã thanh toán', N'2024-03-15', N'2024-03-10', N'Hóa đơn tiền phòng tháng 3 năm 2024', N'System');
DECLARE @HoaDon4 INT = SCOPE_IDENTITY();

-- ChiTietHoaDon
INSERT INTO ChiTietHoaDon (MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, NguoiTao)
VALUES
(@HoaDon1, N'Tiền phòng', 1, 500000.00, 500000.00, N'Phòng 4 người - Tòa A', N'System'),
(@HoaDon2, N'Tiền phòng', 1, 500000.00, 500000.00, N'Phòng 4 người - Tòa A', N'System'),
(@HoaDon3, N'Tiền phòng', 1, 500000.00, 500000.00, N'Phòng 4 người - Tòa A', N'System'),
(@HoaDon4, N'Tiền phòng', 1, 500000.00, 500000.00, N'Phòng 4 người - Tòa A', N'System');

-- BienLaiThu (cho hóa đơn đã thanh toán)
INSERT INTO BienLaiThu (MaHoaDon, SoTienThu, NgayThu, PhuongThucThanhToan, NguoiThu, GhiChu, NguoiTao)
VALUES
(@HoaDon2, 500000.00, N'2024-02-10', N'Tiền mặt', N'Admin', N'Thanh toán hóa đơn tháng 2 năm 2024', N'System'),
(@HoaDon4, 500000.00, N'2024-03-10', N'Tiền mặt', N'Admin', N'Thanh toán hóa đơn tháng 3 năm 2024', N'System');
GO

-- =============================================
-- PHASE 9: SEED DATA - MỨC PHÍ + CẤU HÌNH + BẬC GIÁ
-- =============================================

INSERT INTO MucPhi (TenMucPhi, LoaiPhi, GiaTien, DonVi, TrangThai, GhiChu, NguoiTao)
VALUES
(N'Tiền phòng 4 người', N'Phòng', 500000.00, N'VNĐ/tháng', 1, N'Mặc định cho phòng 4 người', N'System'),
(N'Tiền phòng 6 người', N'Phòng', 400000.00, N'VNĐ/tháng', 1, N'Mặc định cho phòng 6 người', N'System'),
(N'Tiền phòng 2 người VIP', N'Phòng', 800000.00, N'VNĐ/tháng', 1, N'Phòng cao cấp 2 người', N'System'),
(N'Tiền điện sinh hoạt', N'Điện', 3500.00, N'VNĐ/kWh', 1, N'Giá điện sinh hoạt bậc thang', N'System'),
(N'Tiền nước sinh hoạt', N'Nước', 10000.00, N'VNĐ/m³', 1, N'Giá nước sinh hoạt', N'System');
GO

INSERT INTO CauHinhPhi (Loai, MucToiThieu, TrangThai, NguoiTao)
VALUES
(N'Điện', 50.00, 1, N'System'),
(N'Nước', 10.00, 1, N'System');
GO

INSERT INTO BacGia (Loai, ThuTu, TuSo, DenSo, DonGia, TrangThai, NguoiTao)
VALUES
(N'Điện', 1, 0, 50, 1678.00, 1, N'System'),
(N'Điện', 2, 51, 100, 1734.00, 1, N'System'),
(N'Điện', 3, 101, 200, 2014.00, 1, N'System'),
(N'Điện', 4, 201, 9999, 3600.00, 1, N'System'),
(N'Nước', 1, 0, 10, 5973.00, 1, N'System'),
(N'Nước', 2, 11, 20, 7052.00, 1, N'System'),
(N'Nước', 3, 21, 9999, 8669.00, 1, N'System');
GO

-- =============================================
-- PHASE 10: SEED DATA - CHỈ SỐ ĐIỆN NƯỚC
-- =============================================

-- Đọc chỉ số cho 3 phòng đầu tiên (tháng 1-3/2024)
INSERT INTO ChiSoDienNuoc (MaPhong, Thang, Nam, ChiSoDien, ChiSoNuoc, NguoiGhi, TrangThai, GhiChu, NguoiTao)
VALUES
(1, 1, 2024, 120, 15, N'Officer', N'Đã ghi', N'Chỉ số điện nước phòng 101 tháng 1', N'System'),
(1, 2, 2024, 115, 14, N'Officer', N'Đã ghi', N'Chỉ số điện nước phòng 101 tháng 2', N'System'),
(1, 3, 2024, 130, 16, N'Officer', N'Đã ghi', N'Chỉ số điện nước phòng 101 tháng 3', N'System'),
(2, 1, 2024, 100, 12, N'Officer', N'Đã ghi', N'Chỉ số điện nước phòng 102 tháng 1', N'System'),
(2, 2, 2024, 110, 13, N'Officer', N'Đã ghi', N'Chỉ số điện nước phòng 102 tháng 2', N'System'),
(2, 3, 2024, 95, 11, N'Officer', N'Đã ghi', N'Chỉ số điện nước phòng 102 tháng 3', N'System'),
(3, 3, 2024, 140, 18, N'Officer', N'Đã ghi', N'Chỉ số điện nước phòng 103 tháng 3', N'System');
GO

-- =============================================
-- PHASE 11: SEED DATA - ĐƠN ĐĂNG KÝ + YÊU CẦU CHUYỂN PHÒNG
-- =============================================

-- Đơn đăng ký (SV5 + SV6 chưa có HĐ)
INSERT INTO DonDangKy (MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, NguoiTao)
VALUES
(5, 6, N'Mong muốn ở phòng yên tĩnh, gần thư viện', N'2024-01-10', N'Chờ duyệt', N'Đơn đăng ký KTX năm học 2024', N'System'),
(6, 7, N'Phòng gần lớp học, tiện đi lại', N'2024-01-12', N'Đã duyệt', N'Đơn đăng ký KTX năm học 2024', N'System');
GO

-- Yêu cầu chuyển phòng (SV4 muốn chuyển)
INSERT INTO YeuCauChuyenPhong (MaSinhVien, PhongHienTai, PhongMongMuon, LyDo, NgayYeuCau, TrangThai, GhiChu, NguoiTao)
VALUES
(4, 3, 4, N'Phòng hiện tại ồn ào, tầng 1 đông người qua lại', N'2024-02-20', N'Chờ duyệt', N'Yêu cầu chuyển phòng', N'System');
GO

-- =============================================
-- PHASE 12: SEED DATA - KỶ LUẬT + ĐIỂM RÈN LUYỆN
-- =============================================

INSERT INTO KyLuat (MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, NguoiTao)
VALUES
(2, N'Vi phạm nội quy', N'Tắt đèn phòng sau 23h00 nhiều lần', N'2024-02-05', 100000.00, N'Chưa xử lý', N'Lần đầu vi phạm nội quy KTX', N'System'),
(3, N'Vi phạm vệ sinh', N'Không dọn phòng vệ sinh chung theo lịch trực', N'2024-02-15', 50000.00, N'Đã xử lý', N'Nhắc nhở lần 2, đã nộp phạt', N'System');
GO

INSERT INTO DiemRenLuyen (MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, NguoiTao)
VALUES
(2, 1, 2024, 80.00, N'Trung bình khá', N'Điểm rèn luyện tháng 1 năm 2024', N'System'),
(2, 2, 2024, 85.00, N'Khá', N'Điểm rèn luyện tháng 2 năm 2024', N'System'),
(3, 1, 2024, 90.00, N'Tốt', N'Điểm rèn luyện tháng 1 năm 2024', N'System');
GO

-- =============================================
-- PHASE 13: SEED DATA - THÔNG BÁO QUÁ HẠN
-- =============================================

INSERT INTO ThongBaoQuaHan (MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, NguoiTao)
VALUES
(2, NULL, N'2024-01-20', N'Thông báo: Đơn đăng ký KTX của bạn đang được xử lý. Vui lòng chờ phản hồi từ phòng quản lý KTX.',
 N'Đã gửi', N'Thông báo tự động', N'System'),
(2, NULL, N'2024-02-25', N'Thông báo: Bạn đã vi phạm nội quy KTX ngày 05/02/2024. Vui lòng liên hệ phòng quản lý để biết thêm chi tiết.',
 N'Đã gửi', N'Thông báo kỷ luật', N'System');
GO

-- =============================================
-- VERIFICATION
-- =============================================
DECLARE @_t INT, @_p INT, @_g INT, @_sv INT, @_tk INT, @_hd INT, @_hdon INT, @_bl INT, @_mp INT, @_cs INT, @_ddk INT, @_yccp INT, @_kl INT, @_drl INT, @_tb INT;
SELECT @_t = COUNT(*) FROM ToaNha; SELECT @_p = COUNT(*) FROM Phong; SELECT @_g = COUNT(*) FROM Giuong;
SELECT @_sv = COUNT(*) FROM SinhVien; SELECT @_tk = COUNT(*) FROM TaiKhoan; SELECT @_hd = COUNT(*) FROM HopDong;
SELECT @_hdon = COUNT(*) FROM HoaDon; SELECT @_bl = COUNT(*) FROM BienLaiThu; SELECT @_mp = COUNT(*) FROM MucPhi;
SELECT @_cs = COUNT(*) FROM ChiSoDienNuoc; SELECT @_ddk = COUNT(*) FROM DonDangKy; SELECT @_yccp = COUNT(*) FROM YeuCauChuyenPhong;
SELECT @_kl = COUNT(*) FROM KyLuat; SELECT @_drl = COUNT(*) FROM DiemRenLuyen; SELECT @_tb = COUNT(*) FROM ThongBaoQuaHan;
PRINT 'MASTER SEED COMPLETE - TN:' + CAST(@_t AS NVARCHAR(10)) + ' P:' + CAST(@_p AS NVARCHAR(10)) + ' G:' + CAST(@_g AS NVARCHAR(10));
PRINT 'SV:' + CAST(@_sv AS NVARCHAR(10)) + ' TK:' + CAST(@_tk AS NVARCHAR(10)) + ' HD:' + CAST(@_hd AS NVARCHAR(10));
PRINT 'Bill:' + CAST(@_hdon AS NVARCHAR(10)) + ' KyLuat:' + CAST(@_kl AS NVARCHAR(10)) + ' DiemRL:' + CAST(@_drl AS NVARCHAR(10));
GO
