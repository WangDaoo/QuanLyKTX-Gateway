-- =============================================
-- Script Name: CSDL.sql
-- Description: Database hoàn chỉnh cho hệ thống Quản Lý Ký Túc Xá
-- Author: KTX System
-- Created: 2024
-- =============================================

USE master;
GO

-- Tạo database nếu chưa tồn tại
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'QuanLyKyTucXa')
BEGIN
    CREATE DATABASE QuanLyKyTucXa;
END
GO

USE QuanLyKyTucXa;
GO

-- =============================================
-- TẠO BẢNG
-- =============================================

-- Bảng ToaNha
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ToaNha' AND xtype='U')
BEGIN
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
END
GO

-- Bảng Phong
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Phong' AND xtype='U')
BEGIN
    CREATE TABLE Phong (
        MaPhong INT IDENTITY(1,1) PRIMARY KEY,
        MaToaNha INT NOT NULL,
        SoPhong NVARCHAR(20) NOT NULL,
        SoGiuong INT NOT NULL,
        LoaiPhong NVARCHAR(50) NOT NULL,
        GiaPhong DECIMAL(18,2) NOT NULL,
        MoTa NVARCHAR(500),
        TrangThai NVARCHAR(50) DEFAULT 'Trống',
        IsDeleted BIT DEFAULT 0,
        NgayTao DATETIME DEFAULT GETDATE(),
        NguoiTao NVARCHAR(100),
        NgayCapNhat DATETIME,
        NguoiCapNhat NVARCHAR(100),
        FOREIGN KEY (MaToaNha) REFERENCES ToaNha(MaToaNha)
    );
END
GO

-- Bảng Giuong
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Giuong' AND xtype='U')
BEGIN
    CREATE TABLE Giuong (
        MaGiuong INT IDENTITY(1,1) PRIMARY KEY,
        MaPhong INT NOT NULL,
        SoGiuong NVARCHAR(10) NOT NULL,
        TrangThai NVARCHAR(50) DEFAULT 'Trống',
        MoTa NVARCHAR(500),
        IsDeleted BIT DEFAULT 0,
        NgayTao DATETIME DEFAULT GETDATE(),
        NguoiTao NVARCHAR(100),
        NgayCapNhat DATETIME,
        NguoiCapNhat NVARCHAR(100),
        FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
    );
END
GO

-- Bảng SinhVien
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SinhVien' AND xtype='U')
BEGIN
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
END
GO

-- Bảng TaiKhoan
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TaiKhoan' AND xtype='U')
BEGIN
    CREATE TABLE TaiKhoan (
        MaTaiKhoan INT IDENTITY(1,1) PRIMARY KEY,
        TenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
        MatKhau NVARCHAR(255) NOT NULL,
        HoTen NVARCHAR(200) NOT NULL,
        Email NVARCHAR(100),
        VaiTro NVARCHAR(20) DEFAULT 'User',
        TrangThai BIT DEFAULT 1,
        MaSinhVien INT, -- Nghiệp vụ: 1 SinhVien chỉ có 1 TàiKhoan duy nhất (UNIQUE constraint được tạo bằng filtered index)
        IsDeleted BIT DEFAULT 0,
        NgayTao DATETIME DEFAULT GETDATE(),
        NguoiTao NVARCHAR(100),
        NgayCapNhat DATETIME,
        NguoiCapNhat NVARCHAR(100),
        SoLanDangNhapSai INT DEFAULT 0,
        NgayKhoa DATETIME,
        FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien)
    );
END
GO

-- Bảng MucPhi
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MucPhi' AND xtype='U')
BEGIN
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
END
GO

-- Bảng CauHinhPhi
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CauHinhPhi' AND xtype='U')
BEGIN
    CREATE TABLE CauHinhPhi (
        MaCauHinh INT IDENTITY(1,1) PRIMARY KEY,
        Loai NVARCHAR(50) NOT NULL, -- Dien/Nuoc
        MucToiThieu DECIMAL(18,2) NOT NULL,
        TrangThai BIT DEFAULT 1,
        IsDeleted BIT DEFAULT 0,
        NgayTao DATETIME DEFAULT GETDATE(),
        NguoiTao NVARCHAR(100),
        NgayCapNhat DATETIME,
        NguoiCapNhat NVARCHAR(100)
    );
END
GO

-- Bảng BacGia
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BacGia' AND xtype='U')
BEGIN
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
END
GO

-- Bảng HopDong
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HopDong' AND xtype='U')
BEGIN
    CREATE TABLE HopDong (
        MaHopDong INT IDENTITY(1,1) PRIMARY KEY,
        MaSinhVien INT NOT NULL,
        MaGiuong INT NOT NULL,
        NgayBatDau DATE NOT NULL,
        NgayKetThuc DATE NOT NULL,
        GiaPhong DECIMAL(18,2) NOT NULL,
        TrangThai NVARCHAR(50) DEFAULT 'Chờ duyệt',
        GhiChu NVARCHAR(1000),
        IsDeleted BIT DEFAULT 0,
        NgayTao DATETIME DEFAULT GETDATE(),
        NguoiTao NVARCHAR(100),
        NgayCapNhat DATETIME,
        NguoiCapNhat NVARCHAR(100),
        FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
        FOREIGN KEY (MaGiuong) REFERENCES Giuong(MaGiuong)
    );
END
GO

-- Bảng HoaDon
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HoaDon' AND xtype='U')
BEGIN
    CREATE TABLE HoaDon (
        MaHoaDon INT IDENTITY(1,1) PRIMARY KEY,
        MaSinhVien INT,
        MaPhong INT,
        MaHopDong INT,
        Thang INT NOT NULL,
        Nam INT NOT NULL,
        TongTien DECIMAL(18,2) NOT NULL,
        TrangThai NVARCHAR(50) DEFAULT 'Chưa thanh toán',
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
END
GO

-- Bảng BienLaiThu
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BienLaiThu' AND xtype='U')
BEGIN
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
END
GO

-- Bảng KyLuat
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='KyLuat' AND xtype='U')
BEGIN
    CREATE TABLE KyLuat (
        MaKyLuat INT IDENTITY(1,1) PRIMARY KEY,
        MaSinhVien INT NOT NULL,
        LoaiViPham NVARCHAR(100) NOT NULL,
        MoTa NVARCHAR(1000) NOT NULL,
        NgayViPham DATE NOT NULL,
        MucPhat DECIMAL(18,2) DEFAULT 0,
        TrangThai NVARCHAR(50) DEFAULT 'Chưa xử lý',
        GhiChu NVARCHAR(1000),
        IsDeleted BIT DEFAULT 0,
        NgayTao DATETIME DEFAULT GETDATE(),
        NguoiTao NVARCHAR(100),
        NgayCapNhat DATETIME,
        NguoiCapNhat NVARCHAR(100),
        FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien)
    );
END
GO

-- Bảng DiemRenLuyen
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DiemRenLuyen' AND xtype='U')
BEGIN
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
END
GO

-- Bảng DonDangKy
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DonDangKy' AND xtype='U')
BEGIN
    CREATE TABLE DonDangKy (
        MaDon INT IDENTITY(1,1) PRIMARY KEY,
        MaSinhVien INT NOT NULL,
        MaPhongDeXuat INT,
        LyDo NVARCHAR(1000),
        NgayDangKy DATE NOT NULL,
        TrangThai NVARCHAR(50) DEFAULT 'Chờ duyệt',
        GhiChu NVARCHAR(1000),
        IsDeleted BIT DEFAULT 0,
        NgayTao DATETIME DEFAULT GETDATE(),
        NguoiTao NVARCHAR(100),
        NgayCapNhat DATETIME,
        NguoiCapNhat NVARCHAR(100),
        FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
        FOREIGN KEY (MaPhongDeXuat) REFERENCES Phong(MaPhong)
    );
END
GO

-- Bảng YeuCauChuyenPhong
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='YeuCauChuyenPhong' AND xtype='U')
BEGIN
    CREATE TABLE YeuCauChuyenPhong (
        MaYeuCau INT IDENTITY(1,1) PRIMARY KEY,
        MaSinhVien INT NOT NULL,
        PhongHienTai INT NOT NULL,
        PhongMongMuon INT,
        LyDo NVARCHAR(1000) NOT NULL,
        NgayYeuCau DATE NOT NULL,
        TrangThai NVARCHAR(50) DEFAULT 'Chờ duyệt',
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
END
GO

-- Bảng ChiSoDienNuoc
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChiSoDienNuoc' AND xtype='U')
BEGIN
    CREATE TABLE ChiSoDienNuoc (
        MaChiSo INT IDENTITY(1,1) PRIMARY KEY,
        MaPhong INT NOT NULL,
        Thang INT NOT NULL,
        Nam INT NOT NULL,
        ChiSoDien INT NOT NULL,
        ChiSoNuoc INT NOT NULL,
        NguoiGhi NVARCHAR(100),
        TrangThai NVARCHAR(50) DEFAULT 'Đã ghi',
        GhiChu NVARCHAR(1000),
        IsDeleted BIT DEFAULT 0,
        NgayTao DATETIME DEFAULT GETDATE(),
        NguoiTao NVARCHAR(100),
        NgayCapNhat DATETIME,
        NguoiCapNhat NVARCHAR(100),
        FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong)
    );
END
GO

-- Bảng ChiTietHoaDon
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChiTietHoaDon' AND xtype='U')
BEGIN
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
END
GO

-- Bảng ThongBaoQuaHan
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ThongBaoQuaHan' AND xtype='U')
BEGIN
    CREATE TABLE ThongBaoQuaHan (
        MaThongBao INT IDENTITY(1,1) PRIMARY KEY,
        MaSinhVien INT NOT NULL,
        MaHoaDon INT NULL, -- Cho phép NULL vì một số thông báo không liên quan đến hóa đơn (ví dụ: chuyển phòng, kỷ luật)
        NgayThongBao DATE NOT NULL,
        NoiDung NVARCHAR(1000) NOT NULL,
        TrangThai NVARCHAR(50) DEFAULT 'Đã gửi',
        GhiChu NVARCHAR(1000),
        IsDeleted BIT DEFAULT 0,
        NgayTao DATETIME DEFAULT GETDATE(),
        NguoiTao NVARCHAR(100),
        NgayCapNhat DATETIME,
        NguoiCapNhat NVARCHAR(100),
        FOREIGN KEY (MaSinhVien) REFERENCES SinhVien(MaSinhVien),
        FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon)
    );
END
GO

-- Bảng AdminDefault (Lưu thông tin tài khoản admin mặc định)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AdminDefault' AND xtype='U')
BEGIN
    CREATE TABLE AdminDefault (
        MaAdmin INT IDENTITY(1,1) PRIMARY KEY,
        TenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
        MatKhau NVARCHAR(255) NOT NULL, -- Mật khẩu đã hash bằng BCrypt
        HoTen NVARCHAR(200) NOT NULL,
        Email NVARCHAR(100),
        GhiChu NVARCHAR(500),
        IsActive BIT DEFAULT 1,
        NgayTao DATETIME DEFAULT GETDATE(),
        NgayCapNhat DATETIME
    );
END
GO

-- Bảng OfficerDefault (Lưu thông tin tài khoản officer mặc định)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OfficerDefault' AND xtype='U')
BEGIN
    CREATE TABLE OfficerDefault (
        MaOfficer INT IDENTITY(1,1) PRIMARY KEY,
        TenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
        MatKhau NVARCHAR(255) NOT NULL, -- Mật khẩu đã hash bằng BCrypt
        HoTen NVARCHAR(200) NOT NULL,
        Email NVARCHAR(100),
        GhiChu NVARCHAR(500),
        IsActive BIT DEFAULT 1,
        NgayTao DATETIME DEFAULT GETDATE(),
        NgayCapNhat DATETIME
    );
END
GO

-- Cập nhật cột MaHoaDon để cho phép NULL nếu bảng đã tồn tại
IF EXISTS (SELECT * FROM sysobjects WHERE name='ThongBaoQuaHan' AND xtype='U')
BEGIN
    -- Kiểm tra xem cột MaHoaDon có cho phép NULL chưa
    IF EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'ThongBaoQuaHan' 
            AND COLUMN_NAME = 'MaHoaDon' 
            AND IS_NULLABLE = 'NO'
    )
    BEGIN
        ALTER TABLE ThongBaoQuaHan ALTER COLUMN MaHoaDon INT NULL;
    END
END
GO

-- =============================================
-- CONSTRAINTS
-- =============================================

-- Constraints cho ChiSoDienNuoc
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_ChiSoDienNuoc_Positive')
BEGIN
    ALTER TABLE ChiSoDienNuoc ADD CONSTRAINT CK_ChiSoDienNuoc_Positive 
        CHECK (ChiSoDien >= 0 AND ChiSoNuoc >= 0);
END
GO

-- Constraints cho HopDong
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_HopDong_DateRange')
BEGIN
    ALTER TABLE HopDong ADD CONSTRAINT CK_HopDong_DateRange 
        CHECK (NgayKetThuc > NgayBatDau);
END
GO

-- Constraints cho HoaDon
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_HoaDon_MonthYear')
BEGIN
    ALTER TABLE HoaDon ADD CONSTRAINT CK_HoaDon_MonthYear 
        CHECK (Thang >= 1 AND Thang <= 12 AND Nam >= 2000);
END
GO

-- Constraints cho SinhVien
-- Email format validation
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SinhVien_EmailFormat')
BEGIN
    ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_EmailFormat 
        CHECK (Email IS NULL OR Email LIKE '%_@_%._%');
END
GO

-- Phone format validation (Vietnam: bắt đầu bằng 0 hoặc +84, 10-11 số)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SinhVien_PhoneFormat')
BEGIN
    ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_PhoneFormat 
        CHECK (SDT IS NULL OR (
            (SDT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' AND LEN(SDT) = 10) OR
            (SDT LIKE '+84[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' AND LEN(SDT) = 12)
        ));
END
GO

-- HoTen length validation (2-200 characters)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SinhVien_HoTenLength')
BEGIN
    ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_HoTenLength 
        CHECK (LEN(HoTen) >= 2 AND LEN(HoTen) <= 200);
END
GO

-- MSSV format validation (chỉ chữ in hoa và số, 5-20 ký tự)
-- Lưu ý: SQL Server không hỗ trợ regex đầy đủ, chỉ kiểm tra độ dài và ký tự hợp lệ cơ bản
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SinhVien_MSSVFormat')
BEGIN
    ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_MSSVFormat 
        CHECK (LEN(MSSV) >= 5 AND LEN(MSSV) <= 20 
               AND MSSV NOT LIKE '%[^A-Z0-9]%');
END
GO

-- Constraints cho TaiKhoan
-- Email format validation
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_EmailFormat')
BEGIN
    ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_EmailFormat 
        CHECK (Email IS NULL OR Email LIKE '%_@_%._%');
END
GO

-- TenDangNhap format validation (chỉ chữ cái, số và dấu gạch dưới, 3-50 ký tự)
-- Lưu ý: SQL Server dùng collation case-sensitive để kiểm tra, nhưng có thể dùng pattern matching
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_TenDangNhapFormat')
BEGIN
    ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_TenDangNhapFormat 
        CHECK (LEN(TenDangNhap) >= 3 AND LEN(TenDangNhap) <= 50 
               AND TenDangNhap NOT LIKE '%[^a-zA-Z0-9_]%' COLLATE SQL_Latin1_General_CP1_CS_AS);
END
GO

-- MatKhau length validation (tối thiểu 6 ký tự)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_MatKhauLength')
BEGIN
    ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_MatKhauLength 
        CHECK (LEN(MatKhau) >= 6);
END
GO

-- HoTen length validation (2-200 characters)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_HoTenLength')
BEGIN
    ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_HoTenLength 
        CHECK (LEN(HoTen) >= 2 AND LEN(HoTen) <= 200);
END
GO

-- VaiTro validation (chỉ Admin, Officer, Student)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_VaiTro')
BEGIN
    ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_VaiTro 
        CHECK (VaiTro IN ('Admin', 'Officer', 'Student', 'User'));
END
GO

-- Constraints cho HopDong
-- GiaPhong validation (phải >= 0)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_HopDong_GiaPhong')
BEGIN
    ALTER TABLE HopDong ADD CONSTRAINT CK_HopDong_GiaPhong 
        CHECK (GiaPhong >= 0);
END
GO

-- Constraints cho ChiSoDienNuoc
-- Thang validation (1-12)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_ChiSoDienNuoc_Thang')
BEGIN
    ALTER TABLE ChiSoDienNuoc ADD CONSTRAINT CK_ChiSoDienNuoc_Thang 
        CHECK (Thang >= 1 AND Thang <= 12);
END
GO

-- Nam validation (>= 2000)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_ChiSoDienNuoc_Nam')
BEGIN
    ALTER TABLE ChiSoDienNuoc ADD CONSTRAINT CK_ChiSoDienNuoc_Nam 
        CHECK (Nam >= 2000);
END
GO

-- Constraints cho DiemRenLuyen
-- Thang validation (1-12)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_DiemRenLuyen_Thang')
BEGIN
    ALTER TABLE DiemRenLuyen ADD CONSTRAINT CK_DiemRenLuyen_Thang 
        CHECK (Thang >= 1 AND Thang <= 12);
END
GO

-- Nam validation (>= 2000)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_DiemRenLuyen_Nam')
BEGIN
    ALTER TABLE DiemRenLuyen ADD CONSTRAINT CK_DiemRenLuyen_Nam 
        CHECK (Nam >= 2000);
END
GO

-- DiemSo validation (0-100)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_DiemRenLuyen_DiemSo')
BEGIN
    ALTER TABLE DiemRenLuyen ADD CONSTRAINT CK_DiemRenLuyen_DiemSo 
        CHECK (DiemSo >= 0 AND DiemSo <= 100);
END
GO

-- Unique constraint cho Email trong SinhVien (nếu cần, chỉ áp dụng khi Email không NULL)
-- Lưu ý: SQL Server không hỗ trợ UNIQUE constraint với NULL trực tiếp, cần dùng filtered index
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SinhVien_Email_Unique' AND object_id = OBJECT_ID('SinhVien'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_SinhVien_Email_Unique 
    ON SinhVien(Email) 
    WHERE Email IS NOT NULL AND IsDeleted = 0;
END
GO

-- Unique constraint cho Email trong TaiKhoan (nếu cần)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TaiKhoan_Email_Unique' AND object_id = OBJECT_ID('TaiKhoan'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_TaiKhoan_Email_Unique 
    ON TaiKhoan(Email) 
    WHERE Email IS NOT NULL AND IsDeleted = 0;
END
GO

-- Unique constraint cho MaSinhVien trong TaiKhoan (chỉ áp dụng khi MaSinhVien không NULL)
-- Nghiệp vụ: 1 SinhVien chỉ có 1 TàiKhoan duy nhất
-- Xóa UNIQUE constraint cũ trên cột MaSinhVien nếu tồn tại (nếu database đã được tạo trước đó)
IF EXISTS (
    SELECT 1 
    FROM sys.key_constraints kc
    INNER JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE kc.parent_object_id = OBJECT_ID('TaiKhoan')
        AND kc.type = 'UQ'
        AND c.name = 'MaSinhVien'
)
BEGIN
    DECLARE @DropConstraintSQL NVARCHAR(MAX) = '';
    SELECT @DropConstraintSQL = @DropConstraintSQL + 'ALTER TABLE TaiKhoan DROP CONSTRAINT ' + QUOTENAME(kc.name) + ';'
    FROM sys.key_constraints kc
    INNER JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE kc.parent_object_id = OBJECT_ID('TaiKhoan')
        AND kc.type = 'UQ'
        AND c.name = 'MaSinhVien';
    
    IF @DropConstraintSQL <> ''
    BEGIN
        EXEC sp_executesql @DropConstraintSQL;
    END
END
GO

-- Tạo filtered unique index thay thế
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TaiKhoan_MaSinhVien_Unique' AND object_id = OBJECT_ID('TaiKhoan'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_TaiKhoan_MaSinhVien_Unique 
    ON TaiKhoan(MaSinhVien) 
    WHERE MaSinhVien IS NOT NULL AND IsDeleted = 0;
END
GO

-- =============================================
-- INDEXES
-- =============================================

-- Indexes cho performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SinhVien_MSSV' AND object_id = OBJECT_ID('SinhVien'))
    CREATE INDEX IX_SinhVien_MSSV ON SinhVien(MSSV);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TaiKhoan_TenDangNhap' AND object_id = OBJECT_ID('TaiKhoan'))
    CREATE INDEX IX_TaiKhoan_TenDangNhap ON TaiKhoan(TenDangNhap);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Phong_ToaNha' AND object_id = OBJECT_ID('Phong'))
    CREATE INDEX IX_Phong_ToaNha ON Phong(MaToaNha);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Giuong_Phong' AND object_id = OBJECT_ID('Giuong'))
    CREATE INDEX IX_Giuong_Phong ON Giuong(MaPhong);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HopDong_SinhVien' AND object_id = OBJECT_ID('HopDong'))
    CREATE INDEX IX_HopDong_SinhVien ON HopDong(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HopDong_Giuong' AND object_id = OBJECT_ID('HopDong'))
    CREATE INDEX IX_HopDong_Giuong ON HopDong(MaGiuong);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HoaDon_SinhVien' AND object_id = OBJECT_ID('HoaDon'))
    CREATE INDEX IX_HoaDon_SinhVien ON HoaDon(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HoaDon_ThangNam' AND object_id = OBJECT_ID('HoaDon'))
    CREATE INDEX IX_HoaDon_ThangNam ON HoaDon(Thang, Nam);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BienLaiThu_HoaDon' AND object_id = OBJECT_ID('BienLaiThu'))
    CREATE INDEX IX_BienLaiThu_HoaDon ON BienLaiThu(MaHoaDon);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_KyLuat_SinhVien' AND object_id = OBJECT_ID('KyLuat'))
    CREATE INDEX IX_KyLuat_SinhVien ON KyLuat(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DonDangKy_SinhVien' AND object_id = OBJECT_ID('DonDangKy'))
    CREATE INDEX IX_DonDangKy_SinhVien ON DonDangKy(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_YeuCauChuyenPhong_SinhVien' AND object_id = OBJECT_ID('YeuCauChuyenPhong'))
    CREATE INDEX IX_YeuCauChuyenPhong_SinhVien ON YeuCauChuyenPhong(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ChiSoDienNuoc_Phong' AND object_id = OBJECT_ID('ChiSoDienNuoc'))
    CREATE INDEX IX_ChiSoDienNuoc_Phong ON ChiSoDienNuoc(MaPhong);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ChiSoDienNuoc_ThangNam' AND object_id = OBJECT_ID('ChiSoDienNuoc'))
    CREATE INDEX IX_ChiSoDienNuoc_ThangNam ON ChiSoDienNuoc(Thang, Nam);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DiemRenLuyen_SinhVien' AND object_id = OBJECT_ID('DiemRenLuyen'))
    CREATE INDEX IX_DiemRenLuyen_SinhVien ON DiemRenLuyen(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DiemRenLuyen_ThangNam' AND object_id = OBJECT_ID('DiemRenLuyen'))
    CREATE INDEX IX_DiemRenLuyen_ThangNam ON DiemRenLuyen(Thang, Nam);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ChiTietHoaDon_HoaDon' AND object_id = OBJECT_ID('ChiTietHoaDon'))
    CREATE INDEX IX_ChiTietHoaDon_HoaDon ON ChiTietHoaDon(MaHoaDon);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ThongBaoQuaHan_SinhVien' AND object_id = OBJECT_ID('ThongBaoQuaHan'))
    CREATE INDEX IX_ThongBaoQuaHan_SinhVien ON ThongBaoQuaHan(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ThongBaoQuaHan_HoaDon' AND object_id = OBJECT_ID('ThongBaoQuaHan'))
    CREATE INDEX IX_ThongBaoQuaHan_HoaDon ON ThongBaoQuaHan(MaHoaDon);
GO

-- =============================================
-- SEED DATA
-- =============================================

-- Seed data cho ToaNha
-- Đảm bảo ToaNha với MaToaNha = 1 luôn tồn tại và không bị xóa
IF NOT EXISTS (SELECT 1 FROM ToaNha WHERE MaToaNha = 1)
BEGIN
    -- Tạo mới nếu chưa tồn tại
    SET IDENTITY_INSERT ToaNha ON;
    INSERT INTO ToaNha (MaToaNha, TenToaNha, DiaChi, SoTang, MoTa, TrangThai, IsDeleted, NguoiTao) VALUES
    (1, 'Tòa A', '123 Đường ABC, Quận 1, TP.HCM', 5, 'Tòa nam', 1, 0, 'System');
    SET IDENTITY_INSERT ToaNha OFF;
END
ELSE
BEGIN
    -- Khôi phục nếu đã bị xóa
    UPDATE ToaNha 
    SET IsDeleted = 0, 
        TrangThai = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaToaNha = 1;
END

-- Tạo các ToaNha khác nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM ToaNha WHERE MaToaNha = 2)
BEGIN
    SET IDENTITY_INSERT ToaNha ON;
    INSERT INTO ToaNha (MaToaNha, TenToaNha, DiaChi, SoTang, MoTa, TrangThai, IsDeleted, NguoiTao) VALUES
    (2, 'Tòa B', '456 Đường XYZ, Quận 2, TP.HCM', 4, 'Tòa nữ', 1, 0, 'System');
    SET IDENTITY_INSERT ToaNha OFF;
END
ELSE
BEGIN
    UPDATE ToaNha 
    SET IsDeleted = 0, 
        TrangThai = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaToaNha = 2;
END
GO

-- Seed data cho Phong
-- Đảm bảo Phong với MaPhong = 1 luôn tồn tại và không bị xóa (phòng của sinh viên mẫu)
IF NOT EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 1)
BEGIN
    SET IDENTITY_INSERT Phong ON;
    INSERT INTO Phong (MaPhong, MaToaNha, SoPhong, SoGiuong, LoaiPhong, GiaPhong, TrangThai, IsDeleted, NguoiTao) VALUES
    (1, 1, 'A102', 4, 'Phòng 4 người', 500000, 'Đã có người', 0, 'System');
    SET IDENTITY_INSERT Phong OFF;
END
ELSE
BEGIN
    -- Khôi phục nếu đã bị xóa
    UPDATE Phong 
    SET IsDeleted = 0, 
        MaToaNha = 1,
        TrangThai = 'Đã có người',
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaPhong = 1;
END

-- Tạo các Phong khác nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 2)
BEGIN
    SET IDENTITY_INSERT Phong ON;
    INSERT INTO Phong (MaPhong, MaToaNha, SoPhong, SoGiuong, LoaiPhong, GiaPhong, TrangThai, IsDeleted, NguoiTao) VALUES
    (2, 1, 'A101', 4, 'Phòng 4 người', 500000, 'Trống', 0, 'System');
    SET IDENTITY_INSERT Phong OFF;
END
ELSE
BEGIN
    UPDATE Phong 
    SET IsDeleted = 0, 
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaPhong = 2;
END

IF NOT EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 3)
BEGIN
    SET IDENTITY_INSERT Phong ON;
    INSERT INTO Phong (MaPhong, MaToaNha, SoPhong, SoGiuong, LoaiPhong, GiaPhong, TrangThai, IsDeleted, NguoiTao) VALUES
    (3, 1, 'A103', 2, 'Phòng 2 người', 300000, 'Trống', 0, 'System');
    SET IDENTITY_INSERT Phong OFF;
END
ELSE
BEGIN
    UPDATE Phong 
    SET IsDeleted = 0, 
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaPhong = 3;
END

IF NOT EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 4)
BEGIN
    SET IDENTITY_INSERT Phong ON;
    INSERT INTO Phong (MaPhong, MaToaNha, SoPhong, SoGiuong, LoaiPhong, GiaPhong, TrangThai, IsDeleted, NguoiTao) VALUES
    (4, 2, 'B101', 4, 'Phòng 4 người', 500000, 'Trống', 0, 'System');
    SET IDENTITY_INSERT Phong OFF;
END
ELSE
BEGIN
    UPDATE Phong 
    SET IsDeleted = 0, 
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaPhong = 4;
END

IF NOT EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 5)
BEGIN
    SET IDENTITY_INSERT Phong ON;
    INSERT INTO Phong (MaPhong, MaToaNha, SoPhong, SoGiuong, LoaiPhong, GiaPhong, TrangThai, IsDeleted, NguoiTao) VALUES
    (5, 2, 'B102', 4, 'Phòng 4 người', 500000, 'Trống', 0, 'System');
    SET IDENTITY_INSERT Phong OFF;
END
ELSE
BEGIN
    UPDATE Phong 
    SET IsDeleted = 0, 
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaPhong = 5;
END
GO

-- Seed data cho Giuong
IF NOT EXISTS (SELECT 1 FROM Giuong)
BEGIN
    INSERT INTO Giuong (MaPhong, SoGiuong, TrangThai, NguoiTao) VALUES
    (1, '1', 'Trống', 'System'),
    (1, '2', 'Trống', 'System'),
    (1, '3', 'Trống', 'System'),
    (1, '4', 'Trống', 'System'),
    (2, '1', 'Trống', 'System'),
    (2, '2', 'Trống', 'System'),
    (2, '3', 'Trống', 'System'),
    (2, '4', 'Trống', 'System'),
    (3, '1', 'Trống', 'System'),
    (3, '2', 'Trống', 'System'),
    (4, '1', 'Trống', 'System'),
    (4, '2', 'Trống', 'System'),
    (4, '3', 'Trống', 'System'),
    (4, '4', 'Trống', 'System'),
    (5, '1', 'Trống', 'System'),
    (5, '2', 'Trống', 'System'),
    (5, '3', 'Trống', 'System'),
    (5, '4', 'Trống', 'System');
END
GO

-- Seed data cho SinhVien
-- Đảm bảo SinhVien với MaSinhVien = 1 luôn tồn tại, không bị xóa, và có MaPhong = 1 (liên kết với tài khoản student)
IF NOT EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 1)
BEGIN
    SET IDENTITY_INSERT SinhVien ON;
    INSERT INTO SinhVien (MaSinhVien, HoTen, MSSV, Lop, Khoa, NgaySinh, GioiTinh, SDT, Email, DiaChi, TrangThai, MaPhong, IsDeleted, NguoiTao) VALUES
    (1, 'Nguyễn Văn A', 'SV001', 'CNTT01', 'Công nghệ thông tin', '2000-01-01', 'Nam', '0123456789', 'nguyenvana@email.com', '123 Đường ABC', 1, 1, 0, 'System');
    SET IDENTITY_INSERT SinhVien OFF;
END
ELSE
BEGIN
    -- Khôi phục nếu đã bị xóa hoặc thiếu MaPhong
    UPDATE SinhVien 
    SET IsDeleted = 0, 
        MaPhong = 1,
        TrangThai = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaSinhVien = 1;
END

-- Tạo các SinhVien khác nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 2)
BEGIN
    SET IDENTITY_INSERT SinhVien ON;
    INSERT INTO SinhVien (MaSinhVien, HoTen, MSSV, Lop, Khoa, NgaySinh, GioiTinh, SDT, Email, DiaChi, TrangThai, IsDeleted, NguoiTao) VALUES
    (2, 'Trần Thị B', 'SV002', 'CNTT02', 'Công nghệ thông tin', '2000-02-02', 'Nữ', '0987654321', 'tranthib@email.com', '456 Đường XYZ', 1, 0, 'System');
    SET IDENTITY_INSERT SinhVien OFF;
END
ELSE
BEGIN
    UPDATE SinhVien 
    SET IsDeleted = 0, 
        TrangThai = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaSinhVien = 2;
END

IF NOT EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 3)
BEGIN
    SET IDENTITY_INSERT SinhVien ON;
    INSERT INTO SinhVien (MaSinhVien, HoTen, MSSV, Lop, Khoa, NgaySinh, GioiTinh, SDT, Email, DiaChi, TrangThai, IsDeleted, NguoiTao) VALUES
    (3, 'Lê Văn C', 'SV003', 'KT01', 'Kế toán', '2000-03-03', 'Nam', '0369258147', 'levanc@email.com', '789 Đường DEF', 1, 0, 'System');
    SET IDENTITY_INSERT SinhVien OFF;
END
ELSE
BEGIN
    UPDATE SinhVien 
    SET IsDeleted = 0, 
        TrangThai = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaSinhVien = 3;
END
GO

-- Seed data cho TaiKhoan (với BCrypt hash)
-- Đảm bảo tài khoản 'student' luôn tồn tại, không bị xóa, và liên kết với MaSinhVien = 1
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'student')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('student', '$2a$12$8zxGAuUDjBUSwDioiWfNUunzXEnFIuAuCPIeLKQabdWzg/MReohzu', 'Student', 'student@ktx.edu.vn', 'Student', 1, 1, 0, 'System');
END
ELSE
BEGIN
    -- Khôi phục nếu đã bị xóa hoặc thiếu MaSinhVien
    UPDATE TaiKhoan 
    SET IsDeleted = 0, 
        MaSinhVien = 1,
        VaiTro = 'Student',
        TrangThai = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE TenDangNhap = 'student';
END

-- Seed data cho AdminDefault (Lưu thông tin admin mặc định)
-- Mật khẩu: admin@123 (đã hash bằng BCrypt)
IF NOT EXISTS (SELECT 1 FROM AdminDefault WHERE TenDangNhap = 'admin')
BEGIN
    INSERT INTO AdminDefault (TenDangNhap, MatKhau, HoTen, Email, GhiChu, IsActive) VALUES
    ('admin', '$2a$12$maT1YkwtB7QlJrT770kjk.SLd9.MXw3vw1GPypJO7WrNdn2eD0Cj2', 'Administrator', 'admin@ktx.edu.vn', 'Tài khoản admin mặc định - Mật khẩu: admin@123', 1);
END
ELSE
BEGIN
    UPDATE AdminDefault 
    SET IsActive = 1,
        NgayCapNhat = GETDATE()
    WHERE TenDangNhap = 'admin';
END
GO

-- Tài khoản admin (Đảm bảo luôn tồn tại và không thể bị xóa)
-- Lấy thông tin từ AdminDefault để đồng bộ
DECLARE @AdminMatKhau NVARCHAR(255);
DECLARE @AdminHoTen NVARCHAR(200);
DECLARE @AdminEmail NVARCHAR(100);

SELECT @AdminMatKhau = MatKhau, @AdminHoTen = HoTen, @AdminEmail = Email
FROM AdminDefault 
WHERE TenDangNhap = 'admin' AND IsActive = 1;

-- Nếu không có trong AdminDefault, dùng giá trị mặc định
IF @AdminMatKhau IS NULL
BEGIN
    SET @AdminMatKhau = '$2a$12$maT1YkwtB7QlJrT770kjk.SLd9.MXw3vw1GPypJO7WrNdn2eD0Cj2'; -- admin@123
    SET @AdminHoTen = 'Administrator';
    SET @AdminEmail = 'admin@ktx.edu.vn';
END

IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'admin')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('admin', @AdminMatKhau, @AdminHoTen, @AdminEmail, 'Admin', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    -- Đồng bộ thông tin từ AdminDefault nếu có
    IF @AdminMatKhau IS NOT NULL
    BEGIN
        UPDATE TaiKhoan 
        SET MatKhau = @AdminMatKhau,
            HoTen = @AdminHoTen,
            Email = @AdminEmail,
            IsDeleted = 0, 
            TrangThai = 1,
            VaiTro = 'Admin',
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE TenDangNhap = 'admin';
    END
    ELSE
    BEGIN
        -- Chỉ cập nhật trạng thái nếu không có trong AdminDefault
        UPDATE TaiKhoan 
        SET IsDeleted = 0, 
            TrangThai = 1,
            VaiTro = 'Admin',
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE TenDangNhap = 'admin';
    END
END

-- Seed data cho OfficerDefault (Lưu thông tin officer mặc định)
-- Mật khẩu: officer@123 (đã hash bằng BCrypt)
IF NOT EXISTS (SELECT 1 FROM OfficerDefault WHERE TenDangNhap = 'officer')
BEGIN
    INSERT INTO OfficerDefault (TenDangNhap, MatKhau, HoTen, Email, GhiChu, IsActive) VALUES
    ('officer', '$2a$10$KO6gOiKQzpEJbXKkliTmuezoUR4S0dPPqWlZEBhPbels3XiNuGiES', 'Officer', 'officer@ktx.edu.vn', 'Tài khoản officer mặc định - Mật khẩu: officer@123', 1);
END
ELSE
BEGIN
    UPDATE OfficerDefault 
    SET IsActive = 1,
        NgayCapNhat = GETDATE()
    WHERE TenDangNhap = 'officer';
END
GO

-- Tài khoản officer (Đảm bảo luôn tồn tại và không thể bị xóa)
-- Lấy thông tin từ OfficerDefault để đồng bộ
DECLARE @OfficerMatKhau NVARCHAR(255);
DECLARE @OfficerHoTen NVARCHAR(200);
DECLARE @OfficerEmail NVARCHAR(100);

SELECT @OfficerMatKhau = MatKhau, @OfficerHoTen = HoTen, @OfficerEmail = Email
FROM OfficerDefault 
WHERE TenDangNhap = 'officer' AND IsActive = 1;

-- Nếu không có trong OfficerDefault, dùng giá trị mặc định
IF @OfficerMatKhau IS NULL
BEGIN
    SET @OfficerMatKhau = '$2a$10$KO6gOiKQzpEJbXKkliTmuezoUR4S0dPPqWlZEBhPbels3XiNuGiES'; -- officer@123
    SET @OfficerHoTen = 'Officer';
    SET @OfficerEmail = 'officer@ktx.edu.vn';
END

IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer', @OfficerMatKhau, @OfficerHoTen, @OfficerEmail, 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    -- Đồng bộ thông tin từ OfficerDefault nếu có
    IF @OfficerMatKhau IS NOT NULL
    BEGIN
        UPDATE TaiKhoan 
        SET MatKhau = @OfficerMatKhau,
            HoTen = @OfficerHoTen,
            Email = @OfficerEmail,
            IsDeleted = 0, 
            TrangThai = 1,
            VaiTro = 'Officer',
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE TenDangNhap = 'officer';
    END
    ELSE
    BEGIN
        -- Chỉ cập nhật trạng thái nếu không có trong OfficerDefault
        UPDATE TaiKhoan 
        SET IsDeleted = 0, 
            TrangThai = 1,
            VaiTro = 'Officer',
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE TenDangNhap = 'officer';
    END
END
GO

-- Seed data cho MucPhi
IF NOT EXISTS (SELECT 1 FROM MucPhi)
BEGIN
    INSERT INTO MucPhi (TenMucPhi, LoaiPhi, GiaTien, DonVi, TrangThai, GhiChu, NguoiTao) VALUES
    ('Phí phòng 4 người', 'Phí phòng', 500000, 'VND/tháng', 1, 'Phí cơ bản', 'System'),
    ('Phí phòng 2 người', 'Phí phòng', 300000, 'VND/tháng', 1, 'Phí cơ bản', 'System'),
    ('Phí điện', 'Phí điện', 3500, 'VND/kWh', 1, 'Theo bậc thang', 'System'),
    ('Phí nước', 'Phí nước', 15000, 'VND/m3', 1, 'Theo bậc thang', 'System'),
    ('Phí dịch vụ', 'Dịch vụ', 50000, 'VND/tháng', 1, 'Phí dịch vụ chung', 'System');
END
GO

-- Seed data cho CauHinhPhi
IF NOT EXISTS (SELECT 1 FROM CauHinhPhi)
BEGIN
    INSERT INTO CauHinhPhi (Loai, MucToiThieu, TrangThai, NguoiTao) VALUES
    ('Điện', 0, 1, 'System'),
    ('Nước', 0, 1, 'System');
END
GO

-- Seed data cho BacGia
IF NOT EXISTS (SELECT 1 FROM BacGia)
BEGIN
    INSERT INTO BacGia (Loai, ThuTu, TuSo, DenSo, DonGia, TrangThai, NguoiTao) VALUES
    ('Điện', 1, 0, 50, 1800, 1, 'System'),
    ('Điện', 2, 51, 100, 2000, 1, 'System'),
    ('Điện', 3, 101, 200, 2500, 1, 'System'),
    ('Điện', 4, 201, 300, 3000, 1, 'System'),
    ('Điện', 5, 301, 999999, 3500, 1, 'System'),
    ('Nước', 1, 0, 10, 10000, 1, 'System'),
    ('Nước', 2, 11, 20, 12000, 1, 'System'),
    ('Nước', 3, 21, 30, 15000, 1, 'System'),
    ('Nước', 4, 31, 999999, 20000, 1, 'System');
END
GO

-- Seed data cho DonDangKy (phục vụ báo cáo đăng ký)
IF NOT EXISTS (SELECT 1 FROM DonDangKy WHERE MaDon = 1)
BEGIN
    SET IDENTITY_INSERT DonDangKy ON;
    INSERT INTO DonDangKy (MaDon, MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (1, 1, 2, N'Đăng ký phòng A101 cho học kỳ mới', '2025-01-05', N'Đã duyệt', N'Được ưu tiên do thành tích tốt', 0, GETDATE(), 'Seeder'),
    (2, 2, 3, N'Đăng ký phòng A103', '2025-01-10', N'Chờ duyệt', N'Đang chờ phê duyệt của quản trị', 0, GETDATE(), 'Seeder');
    SET IDENTITY_INSERT DonDangKy OFF;
END
ELSE
BEGIN
    UPDATE DonDangKy 
    SET IsDeleted = 0
    WHERE MaDon IN (1,2);
END
GO

-- Seed data cho KyLuat (phục vụ báo cáo kỷ luật)
IF NOT EXISTS (SELECT 1 FROM KyLuat WHERE MaKyLuat = 1)
BEGIN
    SET IDENTITY_INSERT KyLuat ON;
    INSERT INTO KyLuat (MaKyLuat, MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (1, 1, N'Vi phạm nội quy', N'Vượt giờ giới nghiêm 30 phút', '2025-02-12', 50000, N'Chưa xử lý', N'Đã nhắc nhở', 0, GETDATE(), 'Seeder'),
    (2, 2, N'Làm hư hỏng tài sản', N'Làm hỏng bàn học tại phòng', '2025-02-20', 150000, N'Đã xử lý', N'Đã bồi thường', 0, GETDATE(), 'Seeder');
    SET IDENTITY_INSERT KyLuat OFF;
END
ELSE
BEGIN
    UPDATE KyLuat 
    SET IsDeleted = 0
    WHERE MaKyLuat IN (1,2);
END
GO

-- Seed data cho HoaDon
IF NOT EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 1)
BEGIN
    SET IDENTITY_INSERT HoaDon ON;
    INSERT INTO HoaDon (MaHoaDon, MaSinhVien, MaPhong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (1, 1, 1, 1, 2025, 550000, N'Chưa thanh toán', DATEADD(DAY, 10, GETDATE()), NULL, N'Hóa đơn tiền phòng tháng 01/2025', 0, GETDATE(), 'Seeder'),
    (2, 1, 1, 12, 2024, 550000, N'Đã thanh toán', DATEADD(DAY, -15, GETDATE()), DATEADD(DAY, -5, GETDATE()), N'Đã thu tiền mặt', 0, GETDATE(), 'Seeder');
    SET IDENTITY_INSERT HoaDon OFF;
END
ELSE
BEGIN
    UPDATE HoaDon 
    SET IsDeleted = 0
    WHERE MaHoaDon IN (1,2);
END
GO

-- Seed data cho ThongBaoQuaHan
IF NOT EXISTS (SELECT 1 FROM ThongBaoQuaHan WHERE MaThongBao = 1)
BEGIN
    SET IDENTITY_INSERT ThongBaoQuaHan ON;
    INSERT INTO ThongBaoQuaHan (MaThongBao, MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (1, 1, 1, GETDATE(), N'Hóa đơn tháng 01/2025 đã quá hạn 5 ngày. Vui lòng thanh toán sớm.', N'Đã gửi', N'Tự động sinh khi quá hạn', 0, GETDATE(), 'Seeder');
    SET IDENTITY_INSERT ThongBaoQuaHan OFF;
END
ELSE
BEGIN
    UPDATE ThongBaoQuaHan 
    SET IsDeleted = 0
    WHERE MaThongBao = 1;
END
GO

-- =============================================
-- STORED PROCEDURES - TOA NHA CRUD
-- =============================================

-- sp_ToaNha_GetAll
CREATE OR ALTER PROCEDURE sp_ToaNha_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaToaNha,
        TenToaNha,
        DiaChi,
        SoTang,
        MoTa,
        TrangThai,
        IsDeleted,
        NgayTao,
        NguoiTao,
        NgayCapNhat,
        NguoiCapNhat
    FROM ToaNha
    WHERE IsDeleted = 0
    ORDER BY TenToaNha;
END;
GO

-- sp_ToaNha_GetById
CREATE OR ALTER PROCEDURE sp_ToaNha_GetById
    @MaToaNha INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaToaNha,
        TenToaNha,
        DiaChi,
        SoTang,
        MoTa,
        TrangThai,
        IsDeleted,
        NgayTao,
        NguoiTao,
        NgayCapNhat,
        NguoiCapNhat
    FROM ToaNha
    WHERE MaToaNha = @MaToaNha AND IsDeleted = 0;
END;
GO

-- sp_ToaNha_Create
CREATE OR ALTER PROCEDURE sp_ToaNha_Create
    @TenToaNha NVARCHAR(200),
    @DiaChi NVARCHAR(500) = NULL,
    @SoTang INT = NULL,
    @MoTa NVARCHAR(1000) = NULL,
    @TrangThai BIT = 1,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ToaNha (TenToaNha, DiaChi, SoTang, MoTa, TrangThai, NguoiTao)
    VALUES (@TenToaNha, @DiaChi, @SoTang, @MoTa, @TrangThai, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaToaNha;
END;
GO

-- sp_ToaNha_Update
CREATE OR ALTER PROCEDURE sp_ToaNha_Update
    @MaToaNha INT,
    @TenToaNha NVARCHAR(200),
    @DiaChi NVARCHAR(500) = NULL,
    @SoTang INT = NULL,
    @MoTa NVARCHAR(1000) = NULL,
    @TrangThai BIT = 1,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ToaNha 
    SET TenToaNha = @TenToaNha,
        DiaChi = @DiaChi,
        SoTang = @SoTang,
        MoTa = @MoTa,
        TrangThai = @TrangThai,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaToaNha = @MaToaNha AND IsDeleted = 0;
END;
GO

-- sp_ToaNha_Delete
CREATE OR ALTER PROCEDURE sp_ToaNha_Delete
    @MaToaNha INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ToaNha 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaToaNha = @MaToaNha AND IsDeleted = 0;
END;
GO

-- =============================================
-- STORED PROCEDURES - PHONG CRUD
-- =============================================

-- sp_Phong_GetAll
CREATE OR ALTER PROCEDURE sp_Phong_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.MaPhong,
        p.MaToaNha,
        p.SoPhong,
        p.SoGiuong,
        p.LoaiPhong,
        p.GiaPhong,
        p.MoTa,
        p.TrangThai,
        p.IsDeleted,
        p.NgayTao,
        p.NguoiTao,
        p.NgayCapNhat,
        p.NguoiCapNhat,
        t.TenToaNha
    FROM Phong p
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE p.IsDeleted = 0
    ORDER BY t.TenToaNha, p.SoPhong;
END;
GO

-- sp_Phong_GetById
CREATE OR ALTER PROCEDURE sp_Phong_GetById
    @MaPhong INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.MaPhong,
        p.MaToaNha,
        p.SoPhong,
        p.SoGiuong,
        p.LoaiPhong,
        p.GiaPhong,
        p.MoTa,
        p.TrangThai,
        p.IsDeleted,
        p.NgayTao,
        p.NguoiTao,
        p.NgayCapNhat,
        p.NguoiCapNhat,
        t.TenToaNha
    FROM Phong p
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE p.MaPhong = @MaPhong AND p.IsDeleted = 0;
END;
GO

-- sp_Phong_Create
CREATE OR ALTER PROCEDURE sp_Phong_Create
    @MaToaNha INT,
    @SoPhong NVARCHAR(20),
    @SoGiuong INT,
    @LoaiPhong NVARCHAR(50),
    @GiaPhong DECIMAL(18,2),
    @MoTa NVARCHAR(500) = NULL,
    @TrangThai NVARCHAR(50) = 'Trống',
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Phong (MaToaNha, SoPhong, SoGiuong, LoaiPhong, GiaPhong, MoTa, TrangThai, NguoiTao)
    VALUES (@MaToaNha, @SoPhong, @SoGiuong, @LoaiPhong, @GiaPhong, @MoTa, @TrangThai, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaPhong;
END;
GO

-- sp_Phong_Update
CREATE OR ALTER PROCEDURE sp_Phong_Update
    @MaPhong INT,
    @MaToaNha INT,
    @SoPhong NVARCHAR(20),
    @SoGiuong INT,
    @LoaiPhong NVARCHAR(50),
    @GiaPhong DECIMAL(18,2),
    @MoTa NVARCHAR(500) = NULL,
    @TrangThai NVARCHAR(50) = 'Trống',
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Phong 
    SET MaToaNha = @MaToaNha,
        SoPhong = @SoPhong,
        SoGiuong = @SoGiuong,
        LoaiPhong = @LoaiPhong,
        GiaPhong = @GiaPhong,
        MoTa = @MoTa,
        TrangThai = @TrangThai,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaPhong = @MaPhong AND IsDeleted = 0;
END;
GO

-- sp_Phong_Delete
CREATE OR ALTER PROCEDURE sp_Phong_Delete
    @MaPhong INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Phong 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaPhong = @MaPhong AND IsDeleted = 0;
END;
GO

-- sp_Phong_GetAvailable
CREATE OR ALTER PROCEDURE sp_Phong_GetAvailable
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.MaPhong,
        p.MaToaNha,
        p.SoPhong,
        p.SoGiuong,
        p.LoaiPhong,
        p.GiaPhong,
        p.MoTa,
        p.TrangThai,
        t.TenToaNha
    FROM Phong p
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE p.IsDeleted = 0 AND p.TrangThai = 'Trống'
    ORDER BY t.TenToaNha, p.SoPhong;
END;
GO

-- sp_Phong_GetCurrentBySinhVien
CREATE OR ALTER PROCEDURE sp_Phong_GetCurrentBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.MaPhong,
        p.MaToaNha,
        p.SoPhong,
        p.SoGiuong,
        p.LoaiPhong,
        p.GiaPhong,
        p.MoTa,
        p.TrangThai,
        t.TenToaNha
    FROM Phong p
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    INNER JOIN SinhVien s ON p.MaPhong = s.MaPhong AND s.IsDeleted = 0
    WHERE s.MaSinhVien = @MaSinhVien AND p.IsDeleted = 0;
END;
GO

-- sp_Phong_GetEmpty
CREATE OR ALTER PROCEDURE sp_Phong_GetEmpty
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.MaPhong,
        p.MaToaNha,
        p.SoPhong,
        p.SoGiuong,
        p.LoaiPhong,
        p.GiaPhong,
        p.MoTa,
        p.TrangThai,
        p.IsDeleted,
        p.NgayTao,
        p.NguoiTao,
        p.NgayCapNhat,
        p.NguoiCapNhat,
        t.TenToaNha,
        (SELECT COUNT(*) FROM Giuong g WHERE g.MaPhong = p.MaPhong AND g.TrangThai = N'Trống' AND g.IsDeleted = 0) AS SoGiuongTrong
    FROM Phong p
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha
    WHERE p.TrangThai = N'Trống' 
        AND p.IsDeleted = 0 
        AND t.IsDeleted = 0
    ORDER BY t.TenToaNha, p.SoPhong;
END;
GO

-- =============================================
-- STORED PROCEDURES - GIUONG CRUD
-- =============================================

-- sp_Giuong_GetAll
CREATE OR ALTER PROCEDURE sp_Giuong_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        g.MaGiuong,
        g.MaPhong,
        g.SoGiuong,
        g.TrangThai,
        g.MoTa,
        g.IsDeleted,
        g.NgayTao,
        g.NguoiTao,
        g.NgayCapNhat,
        g.NguoiCapNhat,
        p.SoPhong,
        t.TenToaNha
    FROM Giuong g
    INNER JOIN Phong p ON g.MaPhong = p.MaPhong AND p.IsDeleted = 0
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE g.IsDeleted = 0
    ORDER BY t.TenToaNha, p.SoPhong, g.SoGiuong;
END;
GO

-- sp_Giuong_GetById
CREATE OR ALTER PROCEDURE sp_Giuong_GetById
    @MaGiuong INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        g.MaGiuong,
        g.MaPhong,
        g.SoGiuong,
        g.TrangThai,
        g.MoTa,
        g.IsDeleted,
        g.NgayTao,
        g.NguoiTao,
        g.NgayCapNhat,
        g.NguoiCapNhat,
        p.SoPhong,
        t.TenToaNha
    FROM Giuong g
    INNER JOIN Phong p ON g.MaPhong = p.MaPhong AND p.IsDeleted = 0
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE g.MaGiuong = @MaGiuong AND g.IsDeleted = 0;
END;
GO

-- sp_Giuong_Create
CREATE OR ALTER PROCEDURE sp_Giuong_Create
    @MaPhong INT,
    @SoGiuong NVARCHAR(10),
    @TrangThai NVARCHAR(50) = 'Trống',
    @MoTa NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Giuong (MaPhong, SoGiuong, TrangThai, MoTa, NguoiTao)
    VALUES (@MaPhong, @SoGiuong, @TrangThai, @MoTa, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaGiuong;
END;
GO

-- sp_Giuong_Update
CREATE OR ALTER PROCEDURE sp_Giuong_Update
    @MaGiuong INT,
    @MaPhong INT,
    @SoGiuong NVARCHAR(10),
    @TrangThai NVARCHAR(50) = 'Trống',
    @MoTa NVARCHAR(500) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Giuong 
    SET MaPhong = @MaPhong,
        SoGiuong = @SoGiuong,
        TrangThai = @TrangThai,
        MoTa = @MoTa,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaGiuong = @MaGiuong AND IsDeleted = 0;
END;
GO

-- sp_Giuong_Delete
CREATE OR ALTER PROCEDURE sp_Giuong_Delete
    @MaGiuong INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Giuong 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaGiuong = @MaGiuong AND IsDeleted = 0;
END;
GO

-- =============================================
-- STORED PROCEDURES - SINH VIEN CRUD
-- =============================================

-- sp_SinhVien_GetAll
CREATE OR ALTER PROCEDURE sp_SinhVien_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        s.MaSinhVien,
        s.HoTen,
        s.MSSV,
        s.Lop,
        s.Khoa,
        s.NgaySinh,
        s.GioiTinh,
        s.SDT,
        s.Email,
        s.DiaChi,
        s.AnhDaiDien,
        s.TrangThai,
        s.MaPhong,
        s.IsDeleted,
        s.NgayTao,
        s.NguoiTao,
        s.NgayCapNhat,
        s.NguoiCapNhat,
        p.SoPhong,
        t.TenToaNha
    FROM SinhVien s
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE s.IsDeleted = 0
    ORDER BY s.HoTen;
END;
GO

-- sp_SinhVien_GetById
CREATE OR ALTER PROCEDURE sp_SinhVien_GetById
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        s.MaSinhVien,
        s.HoTen,
        s.MSSV,
        s.Lop,
        s.Khoa,
        s.NgaySinh,
        s.GioiTinh,
        s.SDT,
        s.Email,
        s.DiaChi,
        s.AnhDaiDien,
        s.TrangThai,
        s.MaPhong,
        s.IsDeleted,
        s.NgayTao,
        s.NguoiTao,
        s.NgayCapNhat,
        s.NguoiCapNhat,
        p.SoPhong,
        t.TenToaNha
    FROM SinhVien s
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE s.MaSinhVien = @MaSinhVien AND s.IsDeleted = 0;
END;
GO

-- sp_SinhVien_Create
-- Tự động tạo tài khoản cho sinh viên với TenDangNhap = MSSV và MatKhau = MSSV (plaintext, sẽ được hash khi đăng nhập lần đầu)
CREATE OR ALTER PROCEDURE sp_SinhVien_Create
    @HoTen NVARCHAR(200),
    @MSSV NVARCHAR(20),
    @Lop NVARCHAR(50),
    @Khoa NVARCHAR(100),
    @NgaySinh DATETIME = NULL,
    @GioiTinh NVARCHAR(10) = NULL,
    @SDT NVARCHAR(15) = NULL,
    @Email NVARCHAR(100) = NULL,
    @DiaChi NVARCHAR(500) = NULL,
    @AnhDaiDien NVARCHAR(500) = NULL,
    @TrangThai BIT = 1,
    @MaPhong INT = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaSinhVien INT;
    DECLARE @MaTaiKhoan INT;
    
    -- Tạo sinh viên
    INSERT INTO SinhVien (HoTen, MSSV, Lop, Khoa, NgaySinh, GioiTinh, SDT, Email, DiaChi, AnhDaiDien, TrangThai, MaPhong, NguoiTao)
    VALUES (@HoTen, @MSSV, @Lop, @Khoa, @NgaySinh, @GioiTinh, @SDT, @Email, @DiaChi, @AnhDaiDien, @TrangThai, @MaPhong, @NguoiTao);
    
    SET @MaSinhVien = SCOPE_IDENTITY();
    
    -- Tự động tạo tài khoản cho sinh viên
    -- TenDangNhap = MSSV, MatKhau = MSSV (plaintext, sẽ được hash khi đăng nhập lần đầu)
    -- Chỉ tạo nếu chưa có tài khoản nào với MSSV này
    IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = @MSSV AND IsDeleted = 0)
    BEGIN
        INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, NguoiTao)
        VALUES (@MSSV, @MSSV, @HoTen, @Email, 'Student', 1, @MaSinhVien, @NguoiTao);
        
        SET @MaTaiKhoan = SCOPE_IDENTITY();
    END
    
    SELECT @MaSinhVien AS MaSinhVien;
END;
GO

-- sp_SinhVien_Update
CREATE OR ALTER PROCEDURE sp_SinhVien_Update
    @MaSinhVien INT,
    @HoTen NVARCHAR(200),
    @MSSV NVARCHAR(20),
    @Lop NVARCHAR(50),
    @Khoa NVARCHAR(100),
    @NgaySinh DATETIME = NULL,
    @GioiTinh NVARCHAR(10) = NULL,
    @SDT NVARCHAR(15) = NULL,
    @Email NVARCHAR(100) = NULL,
    @DiaChi NVARCHAR(500) = NULL,
    @AnhDaiDien NVARCHAR(500) = NULL,
    @TrangThai BIT = 1,
    @MaPhong INT = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE SinhVien 
    SET HoTen = @HoTen,
        MSSV = @MSSV,
        Lop = @Lop,
        Khoa = @Khoa,
        NgaySinh = @NgaySinh,
        GioiTinh = @GioiTinh,
        SDT = @SDT,
        Email = @Email,
        DiaChi = @DiaChi,
        AnhDaiDien = @AnhDaiDien,
        TrangThai = @TrangThai,
        MaPhong = @MaPhong,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
END;
GO

-- sp_SinhVien_Delete
CREATE OR ALTER PROCEDURE sp_SinhVien_Delete
    @MaSinhVien INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE SinhVien 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
END;
GO

-- sp_SinhVien_GetByTaiKhoan
CREATE OR ALTER PROCEDURE sp_SinhVien_GetByTaiKhoan
    @MaTaiKhoan INT = NULL,
    @TenDangNhap NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        s.MaSinhVien,
        s.HoTen,
        s.MSSV,
        s.Lop,
        s.Khoa,
        s.NgaySinh,
        s.GioiTinh,
        s.SDT,
        s.Email,
        s.DiaChi,
        s.AnhDaiDien,
        s.TrangThai,
        s.MaPhong,
        p.SoPhong,
        t.TenToaNha
    FROM SinhVien s
    INNER JOIN TaiKhoan tk ON s.MaSinhVien = tk.MaSinhVien AND tk.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE ((@MaTaiKhoan IS NOT NULL AND tk.MaTaiKhoan = @MaTaiKhoan)
       OR (@TenDangNhap IS NOT NULL AND tk.TenDangNhap = @TenDangNhap))
       AND s.IsDeleted = 0;
END;
GO

-- sp_SinhVien_GetByPhong
CREATE OR ALTER PROCEDURE sp_SinhVien_GetByPhong
    @MaPhong INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        s.MaSinhVien,
        s.HoTen,
        s.MSSV,
        s.Lop,
        s.Khoa,
        s.NgaySinh,
        s.GioiTinh,
        s.SDT,
        s.Email,
        s.DiaChi,
        s.AnhDaiDien,
        s.TrangThai,
        s.MaPhong,
        s.IsDeleted,
        s.NgayTao,
        s.NguoiTao,
        s.NgayCapNhat,
        s.NguoiCapNhat,
        p.SoPhong,
        t.TenToaNha
    FROM SinhVien s
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE s.MaPhong = @MaPhong AND s.IsDeleted = 0
    ORDER BY s.HoTen;
END;
GO

-- sp_SinhVien_UpdateProfile
CREATE OR ALTER PROCEDURE sp_SinhVien_UpdateProfile
    @MaSinhVien INT,
    @HoTen NVARCHAR(200),
    @NgaySinh DATETIME = NULL,
    @GioiTinh NVARCHAR(10) = NULL,
    @SDT NVARCHAR(15) = NULL,
    @Email NVARCHAR(100) = NULL,
    @DiaChi NVARCHAR(500) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE SinhVien 
    SET HoTen = @HoTen,
        NgaySinh = @NgaySinh,
        GioiTinh = @GioiTinh,
        SDT = @SDT,
        Email = @Email,
        DiaChi = @DiaChi,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
END;
GO

-- =============================================
-- STORED PROCEDURES - TAI KHOAN CRUD
-- =============================================

-- sp_TaiKhoan_GetAll
CREATE OR ALTER PROCEDURE sp_TaiKhoan_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        tk.MaTaiKhoan,
        tk.TenDangNhap,
        tk.HoTen,
        tk.Email,
        tk.VaiTro,
        tk.TrangThai,
        tk.MaSinhVien,
        tk.IsDeleted,
        tk.NgayTao,
        tk.NguoiTao,
        tk.NgayCapNhat,
        tk.NguoiCapNhat,
        tk.SoLanDangNhapSai,
        tk.NgayKhoa,
        s.HoTen AS TenSinhVien,
        s.MSSV
    FROM TaiKhoan tk
    LEFT JOIN SinhVien s ON tk.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    WHERE tk.IsDeleted = 0
    ORDER BY tk.TenDangNhap;
END;
GO

-- sp_TaiKhoan_GetById
CREATE OR ALTER PROCEDURE sp_TaiKhoan_GetById
    @MaTaiKhoan INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        tk.MaTaiKhoan,
        tk.TenDangNhap,
        tk.HoTen,
        tk.Email,
        tk.VaiTro,
        tk.TrangThai,
        tk.MaSinhVien,
        tk.IsDeleted,
        tk.NgayTao,
        tk.NguoiTao,
        tk.NgayCapNhat,
        tk.NguoiCapNhat,
        tk.SoLanDangNhapSai,
        tk.NgayKhoa,
        s.HoTen AS TenSinhVien,
        s.MSSV
    FROM TaiKhoan tk
    LEFT JOIN SinhVien s ON tk.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    WHERE tk.MaTaiKhoan = @MaTaiKhoan AND tk.IsDeleted = 0;
END;
GO

-- sp_TaiKhoan_Create
CREATE OR ALTER PROCEDURE sp_TaiKhoan_Create
    @TenDangNhap NVARCHAR(50),
    @MatKhau NVARCHAR(255),
    @HoTen NVARCHAR(200),
    @Email NVARCHAR(100) = NULL,
    @VaiTro NVARCHAR(20) = 'User',
    @TrangThai BIT = 1,
    @MaSinhVien INT = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, NguoiTao)
    VALUES (@TenDangNhap, @MatKhau, @HoTen, @Email, @VaiTro, @TrangThai, @MaSinhVien, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaTaiKhoan;
END;
GO

-- sp_TaiKhoan_Update
CREATE OR ALTER PROCEDURE sp_TaiKhoan_Update
    @MaTaiKhoan INT,
    @TenDangNhap NVARCHAR(50),
    @HoTen NVARCHAR(200),
    @Email NVARCHAR(100) = NULL,
    @VaiTro NVARCHAR(20) = 'User',
    @TrangThai BIT = 1,
    @MaSinhVien INT = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE TaiKhoan 
    SET TenDangNhap = @TenDangNhap,
        HoTen = @HoTen,
        Email = @Email,
        VaiTro = @VaiTro,
        TrangThai = @TrangThai,
        MaSinhVien = @MaSinhVien,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaTaiKhoan = @MaTaiKhoan AND IsDeleted = 0;
END;
GO

-- sp_TaiKhoan_Delete
CREATE OR ALTER PROCEDURE sp_TaiKhoan_Delete
    @MaTaiKhoan INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE TaiKhoan 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaTaiKhoan = @MaTaiKhoan AND IsDeleted = 0;
END;
GO

-- sp_TaiKhoan_ChangePassword
CREATE OR ALTER PROCEDURE sp_TaiKhoan_ChangePassword
    @MaTaiKhoan INT,
    @MatKhauMoi NVARCHAR(255),
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE TaiKhoan 
    SET MatKhau = @MatKhauMoi,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaTaiKhoan = @MaTaiKhoan AND IsDeleted = 0;
END;
GO

-- sp_TaiKhoan_GetByTenDangNhap
CREATE OR ALTER PROCEDURE sp_TaiKhoan_GetByTenDangNhap
    @TenDangNhap NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        tk.MaTaiKhoan,
        tk.TenDangNhap,
        tk.MatKhau,
        tk.HoTen,
        tk.Email,
        tk.VaiTro,
        tk.TrangThai,
        tk.MaSinhVien,
        tk.IsDeleted,
        tk.NgayTao,
        tk.NguoiTao,
        tk.NgayCapNhat,
        tk.NguoiCapNhat,
        tk.SoLanDangNhapSai,
        tk.NgayKhoa,
        s.HoTen AS TenSinhVien,
        s.MSSV
    FROM TaiKhoan tk
    LEFT JOIN SinhVien s ON tk.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    WHERE tk.TenDangNhap = @TenDangNhap AND tk.IsDeleted = 0;
END;
GO

-- =============================================
-- STORED PROCEDURES - CAU HINH PHI CRUD
-- =============================================

-- sp_CauHinhPhi_GetAll
CREATE OR ALTER PROCEDURE sp_CauHinhPhi_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaCauHinh,
        Loai,
        MucToiThieu,
        TrangThai,
        IsDeleted,
        NgayTao,
        NguoiTao,
        NgayCapNhat,
        NguoiCapNhat
    FROM CauHinhPhi
    WHERE IsDeleted = 0
    ORDER BY Loai;
END;
GO

-- sp_CauHinhPhi_GetById
CREATE OR ALTER PROCEDURE sp_CauHinhPhi_GetById
    @MaCauHinh INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaCauHinh,
        Loai,
        MucToiThieu,
        TrangThai,
        IsDeleted,
        NgayTao,
        NguoiTao,
        NgayCapNhat,
        NguoiCapNhat
    FROM CauHinhPhi
    WHERE MaCauHinh = @MaCauHinh AND IsDeleted = 0;
END;
GO

-- sp_CauHinhPhi_GetByLoai
CREATE OR ALTER PROCEDURE sp_CauHinhPhi_GetByLoai
    @Loai NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaCauHinh,
        Loai,
        MucToiThieu,
        TrangThai,
        IsDeleted,
        NgayTao,
        NguoiTao,
        NgayCapNhat,
        NguoiCapNhat
    FROM CauHinhPhi
    WHERE Loai = @Loai AND IsDeleted = 0;
END;
GO

-- sp_CauHinhPhi_Create
CREATE OR ALTER PROCEDURE sp_CauHinhPhi_Create
    @Loai NVARCHAR(50),
    @MucToiThieu DECIMAL(18,2),
    @TrangThai BIT = 1,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO CauHinhPhi (Loai, MucToiThieu, TrangThai, NguoiTao)
    VALUES (@Loai, @MucToiThieu, @TrangThai, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaCauHinh;
END;
GO

-- sp_CauHinhPhi_Update
CREATE OR ALTER PROCEDURE sp_CauHinhPhi_Update
    @MaCauHinh INT,
    @Loai NVARCHAR(50),
    @MucToiThieu DECIMAL(18,2),
    @TrangThai BIT = 1,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE CauHinhPhi 
    SET Loai = @Loai,
        MucToiThieu = @MucToiThieu,
        TrangThai = @TrangThai,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaCauHinh = @MaCauHinh AND IsDeleted = 0;
END;
GO

-- sp_CauHinhPhi_Delete
CREATE OR ALTER PROCEDURE sp_CauHinhPhi_Delete
    @MaCauHinh INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE CauHinhPhi 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaCauHinh = @MaCauHinh AND IsDeleted = 0;
END;
GO

-- sp_CauHinhPhi_Insert (Alias for Create)
CREATE OR ALTER PROCEDURE sp_CauHinhPhi_Insert
    @Loai NVARCHAR(50),
    @MucToiThieu DECIMAL(18,2),
    @TrangThai BIT = 1,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_CauHinhPhi_Create @Loai, @MucToiThieu, @TrangThai, @NguoiTao;
END;
GO

-- =============================================
-- STORED PROCEDURES - MUC PHI CRUD
-- =============================================

-- sp_MucPhi_GetAll
CREATE OR ALTER PROCEDURE sp_MucPhi_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaMucPhi,
        TenMucPhi,
        LoaiPhi,
        GiaTien,
        DonVi,
        TrangThai,
        GhiChu,
        IsDeleted,
        NgayTao,
        NguoiTao,
        NgayCapNhat,
        NguoiCapNhat
    FROM MucPhi
    WHERE IsDeleted = 0
    ORDER BY LoaiPhi, TenMucPhi;
END;
GO

-- sp_MucPhi_GetById
CREATE OR ALTER PROCEDURE sp_MucPhi_GetById
    @MaMucPhi INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaMucPhi,
        TenMucPhi,
        LoaiPhi,
        GiaTien,
        DonVi,
        TrangThai,
        GhiChu,
        IsDeleted,
        NgayTao,
        NguoiTao,
        NgayCapNhat,
        NguoiCapNhat
    FROM MucPhi
    WHERE MaMucPhi = @MaMucPhi AND IsDeleted = 0;
END;
GO

-- sp_MucPhi_Create
CREATE OR ALTER PROCEDURE sp_MucPhi_Create
    @TenMucPhi NVARCHAR(200),
    @LoaiPhi NVARCHAR(100),
    @GiaTien DECIMAL(18,2),
    @DonVi NVARCHAR(50) = NULL,
    @TrangThai BIT = 1,
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO MucPhi (TenMucPhi, LoaiPhi, GiaTien, DonVi, TrangThai, GhiChu, NguoiTao)
    VALUES (@TenMucPhi, @LoaiPhi, @GiaTien, @DonVi, @TrangThai, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaMucPhi;
END;
GO

-- sp_MucPhi_Update
CREATE OR ALTER PROCEDURE sp_MucPhi_Update
    @MaMucPhi INT,
    @TenMucPhi NVARCHAR(200),
    @LoaiPhi NVARCHAR(100),
    @GiaTien DECIMAL(18,2),
    @DonVi NVARCHAR(50) = NULL,
    @TrangThai BIT = 1,
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE MucPhi 
    SET TenMucPhi = @TenMucPhi,
        LoaiPhi = @LoaiPhi,
        GiaTien = @GiaTien,
        DonVi = @DonVi,
        TrangThai = @TrangThai,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaMucPhi = @MaMucPhi AND IsDeleted = 0;
END;
GO

-- sp_MucPhi_Delete
CREATE OR ALTER PROCEDURE sp_MucPhi_Delete
    @MaMucPhi INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE MucPhi 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaMucPhi = @MaMucPhi AND IsDeleted = 0;
END;
GO

-- sp_MucPhi_GetByLoaiPhi
CREATE OR ALTER PROCEDURE sp_MucPhi_GetByLoaiPhi
    @LoaiPhi NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaMucPhi,
        TenMucPhi,
        LoaiPhi,
        GiaTien,
        DonVi,
        TrangThai,
        GhiChu,
        IsDeleted,
        NgayTao,
        NguoiTao,
        NgayCapNhat,
        NguoiCapNhat
    FROM MucPhi
    WHERE LoaiPhi = @LoaiPhi AND IsDeleted = 0
    ORDER BY TenMucPhi;
END;
GO

-- sp_MucPhi_GetByType (Alias for GetByLoaiPhi)
CREATE OR ALTER PROCEDURE sp_MucPhi_GetByType
    @LoaiPhi NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MaMucPhi,
        TenMucPhi,
        LoaiPhi,
        GiaTien,
        DonVi,
        TrangThai,
        GhiChu,
        IsDeleted,
        NgayTao,
        NguoiTao,
        NgayCapNhat,
        NguoiCapNhat
    FROM MucPhi
    WHERE LoaiPhi = @LoaiPhi AND IsDeleted = 0
    ORDER BY TenMucPhi;
END;
GO

-- =============================================
-- STORED PROCEDURES - HOP DONG CRUD
-- =============================================

-- sp_HopDong_GetAll
CREATE OR ALTER PROCEDURE sp_HopDong_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        hd.MaHopDong,
        hd.MaSinhVien,
        hd.MaGiuong,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.GiaPhong,
        hd.TrangThai,
        hd.GhiChu,
        hd.IsDeleted,
        hd.NgayTao,
        hd.NguoiTao,
        hd.NgayCapNhat,
        hd.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        g.SoGiuong,
        p.SoPhong,
        t.TenToaNha
    FROM HopDong hd
    INNER JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    INNER JOIN Giuong g ON hd.MaGiuong = g.MaGiuong AND g.IsDeleted = 0
    INNER JOIN Phong p ON g.MaPhong = p.MaPhong AND p.IsDeleted = 0
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE hd.IsDeleted = 0
    ORDER BY hd.NgayTao DESC;
END;
GO

-- sp_HopDong_GetById
CREATE OR ALTER PROCEDURE sp_HopDong_GetById
    @MaHopDong INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        hd.MaHopDong,
        hd.MaSinhVien,
        hd.MaGiuong,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.GiaPhong,
        hd.TrangThai,
        hd.GhiChu,
        hd.IsDeleted,
        hd.NgayTao,
        hd.NguoiTao,
        hd.NgayCapNhat,
        hd.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        g.SoGiuong,
        p.SoPhong,
        t.TenToaNha
    FROM HopDong hd
    INNER JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    INNER JOIN Giuong g ON hd.MaGiuong = g.MaGiuong AND g.IsDeleted = 0
    INNER JOIN Phong p ON g.MaPhong = p.MaPhong AND p.IsDeleted = 0
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE hd.MaHopDong = @MaHopDong AND hd.IsDeleted = 0;
END;
GO

-- sp_HopDong_Create
CREATE OR ALTER PROCEDURE sp_HopDong_Create
    @MaSinhVien INT,
    @MaGiuong INT,
    @NgayBatDau DATE,
    @NgayKetThuc DATE,
    @GiaPhong DECIMAL(18,2),
    @TrangThai NVARCHAR(50) = 'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO HopDong (MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @MaGiuong, @NgayBatDau, @NgayKetThuc, @GiaPhong, @TrangThai, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaHopDong;
END;
GO

-- sp_HopDong_Update
CREATE OR ALTER PROCEDURE sp_HopDong_Update
    @MaHopDong INT,
    @MaSinhVien INT,
    @MaGiuong INT,
    @NgayBatDau DATE,
    @NgayKetThuc DATE,
    @GiaPhong DECIMAL(18,2),
    @TrangThai NVARCHAR(50) = 'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE HopDong 
    SET MaSinhVien = @MaSinhVien,
        MaGiuong = @MaGiuong,
        NgayBatDau = @NgayBatDau,
        NgayKetThuc = @NgayKetThuc,
        GiaPhong = @GiaPhong,
        TrangThai = @TrangThai,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaHopDong = @MaHopDong AND IsDeleted = 0;
END;
GO

-- sp_HopDong_Delete
CREATE OR ALTER PROCEDURE sp_HopDong_Delete
    @MaHopDong INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE HopDong 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaHopDong = @MaHopDong AND IsDeleted = 0;
END;
GO

-- sp_HopDong_GetBySinhVien
CREATE OR ALTER PROCEDURE sp_HopDong_GetBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        hd.MaHopDong,
        hd.MaSinhVien,
        hd.MaGiuong,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.GiaPhong,
        hd.TrangThai,
        hd.GhiChu,
        hd.IsDeleted,
        hd.NgayTao,
        hd.NguoiTao,
        hd.NgayCapNhat,
        hd.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        g.SoGiuong,
        p.SoPhong,
        t.TenToaNha
    FROM HopDong hd
    INNER JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    INNER JOIN Giuong g ON hd.MaGiuong = g.MaGiuong AND g.IsDeleted = 0
    INNER JOIN Phong p ON g.MaPhong = p.MaPhong AND p.IsDeleted = 0
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE hd.MaSinhVien = @MaSinhVien AND hd.IsDeleted = 0
    ORDER BY hd.NgayTao DESC;
END;
GO

-- =============================================
-- STORED PROCEDURES - HOA DON CRUD
-- =============================================

-- sp_HoaDon_GetAll
CREATE OR ALTER PROCEDURE sp_HoaDon_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        hd.MaHoaDon,
        hd.MaSinhVien,
        hd.MaPhong,
        hd.MaHopDong,
        hd.Thang,
        hd.Nam,
        hd.TongTien,
        hd.TrangThai,
        hd.HanThanhToan,
        hd.NgayThanhToan,
        hd.GhiChu,
        hd.IsDeleted,
        hd.NgayTao,
        hd.NguoiTao,
        hd.NgayCapNhat,
        hd.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        p.SoPhong,
        t.TenToaNha
    FROM HoaDon hd
    LEFT JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON hd.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE hd.IsDeleted = 0
    ORDER BY hd.NgayTao DESC;
END;
GO

-- sp_HoaDon_GetById
CREATE OR ALTER PROCEDURE sp_HoaDon_GetById
    @MaHoaDon INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        hd.MaHoaDon,
        hd.MaSinhVien,
        hd.MaPhong,
        hd.MaHopDong,
        hd.Thang,
        hd.Nam,
        hd.TongTien,
        hd.TrangThai,
        hd.HanThanhToan,
        hd.NgayThanhToan,
        hd.GhiChu,
        hd.IsDeleted,
        hd.NgayTao,
        hd.NguoiTao,
        hd.NgayCapNhat,
        hd.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        p.SoPhong,
        t.TenToaNha
    FROM HoaDon hd
    LEFT JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON hd.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE hd.MaHoaDon = @MaHoaDon AND hd.IsDeleted = 0;
END;
GO

-- sp_HoaDon_Create
CREATE OR ALTER PROCEDURE sp_HoaDon_Create
    @MaSinhVien INT,
    @MaPhong INT = NULL,
    @MaHopDong INT = NULL,
    @Thang INT,
    @Nam INT,
    @TongTien DECIMAL(18,2),
    @TrangThai NVARCHAR(50) = 'Chưa thanh toán',
    @HanThanhToan DATE = NULL,
    @NgayThanhToan DATE = NULL,
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO HoaDon (MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @MaPhong, @MaHopDong, @Thang, @Nam, @TongTien, @TrangThai, @HanThanhToan, @NgayThanhToan, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaHoaDon;
END;
GO

-- sp_HoaDon_Update
CREATE OR ALTER PROCEDURE sp_HoaDon_Update
    @MaHoaDon INT,
    @MaSinhVien INT,
    @MaPhong INT = NULL,
    @MaHopDong INT = NULL,
    @Thang INT,
    @Nam INT,
    @TongTien DECIMAL(18,2),
    @TrangThai NVARCHAR(50) = 'Chưa thanh toán',
    @HanThanhToan DATE = NULL,
    @NgayThanhToan DATE = NULL,
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE HoaDon 
    SET MaSinhVien = @MaSinhVien,
        MaPhong = @MaPhong,
        MaHopDong = @MaHopDong,
        Thang = @Thang,
        Nam = @Nam,
        TongTien = @TongTien,
        TrangThai = @TrangThai,
        HanThanhToan = @HanThanhToan,
        NgayThanhToan = @NgayThanhToan,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaHoaDon = @MaHoaDon AND IsDeleted = 0;
END;
GO

-- sp_HoaDon_Delete
CREATE OR ALTER PROCEDURE sp_HoaDon_Delete
    @MaHoaDon INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE HoaDon 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaHoaDon = @MaHoaDon AND IsDeleted = 0;
END;
GO

-- sp_HoaDon_GetBySinhVien
CREATE OR ALTER PROCEDURE sp_HoaDon_GetBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        hd.MaHoaDon,
        hd.MaSinhVien,
        hd.MaPhong,
        hd.MaHopDong,
        hd.Thang,
        hd.Nam,
        hd.TongTien,
        hd.TrangThai,
        hd.HanThanhToan,
        hd.NgayThanhToan,
        hd.GhiChu,
        hd.IsDeleted,
        hd.NgayTao,
        hd.NguoiTao,
        hd.NgayCapNhat,
        hd.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        p.SoPhong,
        t.TenToaNha
    FROM HoaDon hd
    LEFT JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON hd.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE hd.MaSinhVien = @MaSinhVien AND hd.IsDeleted = 0
    ORDER BY hd.NgayTao DESC;
END;
GO

-- sp_HoaDon_GenerateMonthly đã được chuyển thành alias gọi sp_TaoHoaDonHangThang (xem phần Aliases)

-- =============================================
-- STORED PROCEDURES - BIEN LAI THU CRUD
-- =============================================

-- sp_BienLaiThu_GetAll
CREATE OR ALTER PROCEDURE sp_BienLaiThu_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        blt.MaBienLai,
        blt.MaHoaDon,
        blt.SoTienThu,
        blt.NgayThu,
        blt.PhuongThucThanhToan,
        blt.NguoiThu,
        blt.GhiChu,
        blt.IsDeleted,
        blt.NgayTao,
        blt.NguoiTao,
        blt.NgayCapNhat,
        blt.NguoiCapNhat,
        hd.MaSinhVien,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        p.SoPhong,
        t.TenToaNha
    FROM BienLaiThu blt
    INNER JOIN HoaDon hd ON blt.MaHoaDon = hd.MaHoaDon AND hd.IsDeleted = 0
    LEFT JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON hd.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE blt.IsDeleted = 0
    ORDER BY blt.NgayThu DESC;
END;
GO

-- sp_BienLaiThu_GetById
CREATE OR ALTER PROCEDURE sp_BienLaiThu_GetById
    @MaBienLai INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        blt.MaBienLai,
        blt.MaHoaDon,
        blt.SoTienThu,
        blt.NgayThu,
        blt.PhuongThucThanhToan,
        blt.NguoiThu,
        blt.GhiChu,
        blt.IsDeleted,
        blt.NgayTao,
        blt.NguoiTao,
        blt.NgayCapNhat,
        blt.NguoiCapNhat,
        hd.MaSinhVien,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        p.SoPhong,
        t.TenToaNha
    FROM BienLaiThu blt
    INNER JOIN HoaDon hd ON blt.MaHoaDon = hd.MaHoaDon AND hd.IsDeleted = 0
    LEFT JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON hd.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE blt.MaBienLai = @MaBienLai AND blt.IsDeleted = 0;
END;
GO

-- sp_BienLaiThu_Create
CREATE OR ALTER PROCEDURE sp_BienLaiThu_Create
    @MaHoaDon INT,
    @SoTienThu DECIMAL(18,2),
    @NgayThu DATE,
    @PhuongThucThanhToan NVARCHAR(100),
    @NguoiThu NVARCHAR(100) = NULL,
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Tạo biên lai
    INSERT INTO BienLaiThu (MaHoaDon, SoTienThu, NgayThu, PhuongThucThanhToan, NguoiThu, GhiChu, NguoiTao)
    VALUES (@MaHoaDon, @SoTienThu, @NgayThu, @PhuongThucThanhToan, @NguoiThu, @GhiChu, @NguoiTao);
    
    -- Tự động cập nhật hóa đơn: Trạng thái = "Đã thanh toán", Ngày thanh toán = @NgayThu
    UPDATE HoaDon 
    SET TrangThai = 'Đã thanh toán',
        NgayThanhToan = @NgayThu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiTao
    WHERE MaHoaDon = @MaHoaDon AND IsDeleted = 0;
    
    SELECT SCOPE_IDENTITY() AS MaBienLai;
END;
GO

-- sp_BienLaiThu_Update
CREATE OR ALTER PROCEDURE sp_BienLaiThu_Update
    @MaBienLai INT,
    @MaHoaDon INT,
    @SoTienThu DECIMAL(18,2),
    @NgayThu DATE,
    @PhuongThucThanhToan NVARCHAR(100),
    @NguoiThu NVARCHAR(100) = NULL,
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE BienLaiThu 
    SET MaHoaDon = @MaHoaDon,
        SoTienThu = @SoTienThu,
        NgayThu = @NgayThu,
        PhuongThucThanhToan = @PhuongThucThanhToan,
        NguoiThu = @NguoiThu,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaBienLai = @MaBienLai AND IsDeleted = 0;
END;
GO

-- sp_BienLaiThu_Delete
CREATE OR ALTER PROCEDURE sp_BienLaiThu_Delete
    @MaBienLai INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE BienLaiThu 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaBienLai = @MaBienLai AND IsDeleted = 0;
END;
GO

-- sp_BienLaiThu_GetBySinhVien
CREATE OR ALTER PROCEDURE sp_BienLaiThu_GetBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        blt.MaBienLai,
        blt.MaHoaDon,
        blt.SoTienThu,
        blt.NgayThu,
        blt.PhuongThucThanhToan,
        blt.NguoiThu,
        blt.GhiChu,
        blt.IsDeleted,
        blt.NgayTao,
        blt.NguoiTao,
        blt.NgayCapNhat,
        blt.NguoiCapNhat,
        hd.MaSinhVien,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        p.SoPhong,
        t.TenToaNha
    FROM BienLaiThu blt
    INNER JOIN HoaDon hd ON blt.MaHoaDon = hd.MaHoaDon AND hd.IsDeleted = 0
    LEFT JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON hd.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE hd.MaSinhVien = @MaSinhVien AND blt.IsDeleted = 0
    ORDER BY blt.NgayThu DESC;
END;
GO

-- =============================================
-- STORED PROCEDURES - KY LUAT CRUD
-- =============================================

-- sp_KyLuat_GetAll
CREATE OR ALTER PROCEDURE sp_KyLuat_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        kl.MaKyLuat,
        kl.MaSinhVien,
        kl.LoaiViPham,
        kl.MoTa,
        kl.NgayViPham,
        kl.MucPhat,
        kl.TrangThai,
        kl.GhiChu,
        kl.IsDeleted,
        kl.NgayTao,
        kl.NguoiTao,
        kl.NgayCapNhat,
        kl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM KyLuat kl
    INNER JOIN SinhVien s ON kl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE kl.IsDeleted = 0
    ORDER BY kl.NgayViPham DESC;
END;
GO

-- sp_KyLuat_GetById
CREATE OR ALTER PROCEDURE sp_KyLuat_GetById
    @MaKyLuat INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        kl.MaKyLuat,
        kl.MaSinhVien,
        kl.LoaiViPham,
        kl.MoTa,
        kl.NgayViPham,
        kl.MucPhat,
        kl.TrangThai,
        kl.GhiChu,
        kl.IsDeleted,
        kl.NgayTao,
        kl.NguoiTao,
        kl.NgayCapNhat,
        kl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM KyLuat kl
    INNER JOIN SinhVien s ON kl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE kl.MaKyLuat = @MaKyLuat AND kl.IsDeleted = 0;
END;
GO

-- sp_KyLuat_Create
CREATE OR ALTER PROCEDURE sp_KyLuat_Create
    @MaSinhVien INT,
    @LoaiViPham NVARCHAR(100),
    @MoTa NVARCHAR(1000),
    @NgayViPham DATE,
    @MucPhat DECIMAL(18,2) = 0,
    @TrangThai NVARCHAR(50) = 'Chưa xử lý',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaKyLuat INT;
    DECLARE @SoDiemTru DECIMAL(5,2) = 0;
    DECLARE @MaPhong INT;
    DECLARE @Thang INT = MONTH(@NgayViPham);
    DECLARE @Nam INT = YEAR(@NgayViPham);
    
    -- Tạo bản ghi kỷ luật
    INSERT INTO KyLuat (MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @LoaiViPham, @MoTa, @NgayViPham, @MucPhat, @TrangThai, @GhiChu, @NguoiTao);
    
    SET @MaKyLuat = SCOPE_IDENTITY();
    
    -- Xác định số điểm trừ dựa trên loại vi phạm (có thể mở rộng với bảng mapping)
    -- Mặc định: Vi phạm nội quy = 5 điểm, Gây mất trật tự = 10 điểm, Làm hư hỏng tài sản = 15 điểm
    IF @LoaiViPham LIKE N'%nội quy%' OR @LoaiViPham LIKE N'%nội quỹ%'
        SET @SoDiemTru = 5;
    ELSE IF @LoaiViPham LIKE N'%mất trật tự%' OR @LoaiViPham LIKE N'%gây rối%'
        SET @SoDiemTru = 10;
    ELSE IF @LoaiViPham LIKE N'%hư hỏng%' OR @LoaiViPham LIKE N'%phá hoại%'
        SET @SoDiemTru = 15;
    ELSE
        SET @SoDiemTru = 5; -- Mặc định
    
    -- Trừ điểm rèn luyện (nếu có điểm rèn luyện trong tháng)
    UPDATE DiemRenLuyen
    SET DiemSo = CASE 
                    WHEN DiemSo - @SoDiemTru < 0 THEN 0 
                    ELSE DiemSo - @SoDiemTru 
                 END,
        XepLoai = CASE 
                    WHEN DiemSo - @SoDiemTru >= 90 THEN N'Xuất sắc'
                    WHEN DiemSo - @SoDiemTru >= 80 THEN N'Tốt'
                    WHEN DiemSo - @SoDiemTru >= 70 THEN N'Khá'
                    WHEN DiemSo - @SoDiemTru >= 60 THEN N'Trung bình'
                    ELSE N'Yếu'
                  END,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiTao
    WHERE MaSinhVien = @MaSinhVien 
        AND Thang = @Thang 
        AND Nam = @Nam 
        AND IsDeleted = 0;
    
    -- Tạo hóa đơn phí phạt nếu có mức phạt > 0
    DECLARE @MaHoaDonPhat INT = NULL;
    IF @MucPhat > 0
    BEGIN
        -- Lấy thông tin phòng của sinh viên
        SELECT @MaPhong = MaPhong 
        FROM SinhVien 
        WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
        
        -- Tính toán các giá trị trước khi gọi EXEC
        DECLARE @HanThanhToanPhat DATE;
        DECLARE @GhiChuPhat NVARCHAR(1000);
        SET @HanThanhToanPhat = DATEADD(dd, 7, @NgayViPham);
        SET @GhiChuPhat = CAST(N'Hóa đơn phí phạt kỷ luật: ' AS NVARCHAR(1000)) + CAST(@LoaiViPham AS NVARCHAR(1000));
        
        -- Tạo hóa đơn phí phạt
        EXEC sp_HoaDon_Create 
            @MaSinhVien = @MaSinhVien,
            @MaPhong = @MaPhong,
            @MaHopDong = NULL,
            @Thang = @Thang,
            @Nam = @Nam,
            @TongTien = @MucPhat,
            @TrangThai = N'Chưa thanh toán',
            @HanThanhToan = @HanThanhToanPhat,
            @GhiChu = @GhiChuPhat,
            @NguoiTao = @NguoiTao;
        
        -- Lấy mã hóa đơn vừa tạo
        SELECT TOP 1 @MaHoaDonPhat = MaHoaDon
        FROM HoaDon
        WHERE MaSinhVien = @MaSinhVien 
            AND Thang = @Thang 
            AND Nam = @Nam 
            AND GhiChu LIKE N'%phí phạt kỷ luật%'
            AND IsDeleted = 0
        ORDER BY NgayTao DESC;
    END;
    
    -- Tự động tạo thông báo kỷ luật cho sinh viên
    DECLARE @NoiDungThongBaoKyLuat NVARCHAR(1000);
    DECLARE @ThongBaoKyLuat NVARCHAR(1000);
    SET @ThongBaoKyLuat = N'Bạn đã bị kỷ luật: ' + @LoaiViPham + N'. ';
    
    IF @SoDiemTru > 0
        SET @ThongBaoKyLuat = @ThongBaoKyLuat + N'Số điểm bị trừ: ' + CAST(@SoDiemTru AS NVARCHAR(10)) + N' điểm. ';
    
    IF @MucPhat > 0
        SET @ThongBaoKyLuat = @ThongBaoKyLuat + N'Mức phạt: ' + CAST(@MucPhat AS NVARCHAR(20)) + N' VND. ';
    
    SET @ThongBaoKyLuat = @ThongBaoKyLuat + N'Ngày vi phạm: ' + FORMAT(@NgayViPham, 'dd/MM/yyyy');
    
    INSERT INTO ThongBaoQuaHan (MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, NguoiTao)
    VALUES (@MaSinhVien, @MaHoaDonPhat, GETDATE(), @ThongBaoKyLuat, N'Đã gửi', @NguoiTao);
    
    SELECT @MaKyLuat AS MaKyLuat;
END;
GO

-- sp_KyLuat_Update
CREATE OR ALTER PROCEDURE sp_KyLuat_Update
    @MaKyLuat INT,
    @MaSinhVien INT,
    @LoaiViPham NVARCHAR(100),
    @MoTa NVARCHAR(1000),
    @NgayViPham DATE,
    @MucPhat DECIMAL(18,2) = 0,
    @TrangThai NVARCHAR(50) = 'Chưa xử lý',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE KyLuat 
    SET MaSinhVien = @MaSinhVien,
        LoaiViPham = @LoaiViPham,
        MoTa = @MoTa,
        NgayViPham = @NgayViPham,
        MucPhat = @MucPhat,
        TrangThai = @TrangThai,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaKyLuat = @MaKyLuat AND IsDeleted = 0;
END;
GO

-- sp_KyLuat_Delete
CREATE OR ALTER PROCEDURE sp_KyLuat_Delete
    @MaKyLuat INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE KyLuat 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaKyLuat = @MaKyLuat AND IsDeleted = 0;
END;
GO

-- sp_KyLuat_GetBySinhVien
CREATE OR ALTER PROCEDURE sp_KyLuat_GetBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        kl.MaKyLuat,
        kl.MaSinhVien,
        kl.LoaiViPham,
        kl.MoTa,
        kl.NgayViPham,
        kl.MucPhat,
        kl.TrangThai,
        kl.GhiChu,
        kl.IsDeleted,
        kl.NgayTao,
        kl.NguoiTao,
        kl.NgayCapNhat,
        kl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM KyLuat kl
    INNER JOIN SinhVien s ON kl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE kl.MaSinhVien = @MaSinhVien AND kl.IsDeleted = 0
    ORDER BY kl.NgayViPham DESC;
END;
GO

-- =============================================
-- STORED PROCEDURES - DIEM REN LUYEN CRUD
-- =============================================

-- sp_DiemRenLuyen_GetAll
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        drl.MaDiem,
        drl.MaSinhVien,
        drl.Thang,
        drl.Nam,
        drl.DiemSo,
        drl.XepLoai,
        drl.GhiChu,
        drl.IsDeleted,
        drl.NgayTao,
        drl.NguoiTao,
        drl.NgayCapNhat,
        drl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM DiemRenLuyen drl
    INNER JOIN SinhVien s ON drl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE drl.IsDeleted = 0
    ORDER BY drl.Nam DESC, drl.Thang DESC;
END;
GO

-- sp_DiemRenLuyen_GetById
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_GetById
    @MaDiem INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        drl.MaDiem,
        drl.MaSinhVien,
        drl.Thang,
        drl.Nam,
        drl.DiemSo,
        drl.XepLoai,
        drl.GhiChu,
        drl.IsDeleted,
        drl.NgayTao,
        drl.NguoiTao,
        drl.NgayCapNhat,
        drl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM DiemRenLuyen drl
    INNER JOIN SinhVien s ON drl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE drl.MaDiem = @MaDiem AND drl.IsDeleted = 0;
END;
GO

-- sp_DiemRenLuyen_Create
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_Create
    @MaSinhVien INT,
    @Thang INT,
    @Nam INT,
    @DiemSo DECIMAL(5,2),
    @XepLoai NVARCHAR(50),
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO DiemRenLuyen (MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @Thang, @Nam, @DiemSo, @XepLoai, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaDiem;
END;
GO

-- sp_DiemRenLuyen_Update
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_Update
    @MaDiem INT,
    @MaSinhVien INT,
    @Thang INT,
    @Nam INT,
    @DiemSo DECIMAL(5,2),
    @XepLoai NVARCHAR(50),
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE DiemRenLuyen 
    SET MaSinhVien = @MaSinhVien,
        Thang = @Thang,
        Nam = @Nam,
        DiemSo = @DiemSo,
        XepLoai = @XepLoai,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaDiem = @MaDiem AND IsDeleted = 0;
END;
GO

-- sp_DiemRenLuyen_Delete
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_Delete
    @MaDiem INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE DiemRenLuyen 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaDiem = @MaDiem AND IsDeleted = 0;
END;
GO

-- sp_DiemRenLuyen_GetBySinhVien
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_GetBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        drl.MaDiem,
        drl.MaSinhVien,
        drl.Thang,
        drl.Nam,
        drl.DiemSo,
        drl.XepLoai,
        drl.GhiChu,
        drl.IsDeleted,
        drl.NgayTao,
        drl.NguoiTao,
        drl.NgayCapNhat,
        drl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM DiemRenLuyen drl
    INNER JOIN SinhVien s ON drl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE drl.MaSinhVien = @MaSinhVien AND drl.IsDeleted = 0
    ORDER BY drl.Nam DESC, drl.Thang DESC;
END;
GO

-- sp_DiemRenLuyen_GetBySinhVienAndMonth
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_GetBySinhVienAndMonth
    @MaSinhVien INT,
    @Thang INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        drl.MaDiem,
        drl.MaSinhVien,
        drl.Thang,
        drl.Nam,
        drl.DiemSo,
        drl.XepLoai,
        drl.GhiChu,
        drl.IsDeleted,
        drl.NgayTao,
        drl.NguoiTao,
        drl.NgayCapNhat,
        drl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM DiemRenLuyen drl
    INNER JOIN SinhVien s ON drl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE drl.MaSinhVien = @MaSinhVien AND drl.Thang = @Thang AND drl.Nam = @Nam AND drl.IsDeleted = 0;
END;
GO

-- =============================================
-- STORED PROCEDURES - DON DANG KY CRUD
-- =============================================

-- sp_DonDangKy_GetAll
CREATE OR ALTER PROCEDURE sp_DonDangKy_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        ddk.MaDon,
        ddk.MaSinhVien,
        ddk.MaPhongDeXuat,
        ddk.LyDo,
        ddk.NgayDangKy,
        ddk.TrangThai,
        ddk.GhiChu,
        ddk.IsDeleted,
        ddk.NgayTao,
        ddk.NguoiTao,
        ddk.NgayCapNhat,
        ddk.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong AS PhongDeXuat,
        t.TenToaNha AS ToaNhaDeXuat
    FROM DonDangKy ddk
    INNER JOIN SinhVien s ON ddk.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON ddk.MaPhongDeXuat = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE ddk.IsDeleted = 0
    ORDER BY ddk.NgayDangKy DESC;
END;
GO

-- sp_DonDangKy_GetById
CREATE OR ALTER PROCEDURE sp_DonDangKy_GetById
    @MaDon INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        ddk.MaDon,
        ddk.MaSinhVien,
        ddk.MaPhongDeXuat,
        ddk.LyDo,
        ddk.NgayDangKy,
        ddk.TrangThai,
        ddk.GhiChu,
        ddk.IsDeleted,
        ddk.NgayTao,
        ddk.NguoiTao,
        ddk.NgayCapNhat,
        ddk.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong AS PhongDeXuat,
        t.TenToaNha AS ToaNhaDeXuat
    FROM DonDangKy ddk
    INNER JOIN SinhVien s ON ddk.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON ddk.MaPhongDeXuat = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE ddk.MaDon = @MaDon AND ddk.IsDeleted = 0;
END;
GO

-- sp_DonDangKy_Create
CREATE OR ALTER PROCEDURE sp_DonDangKy_Create
    @MaSinhVien INT,
    @MaPhongDeXuat INT = NULL,
    @LyDo NVARCHAR(1000) = NULL,
    @NgayDangKy DATE,
    @TrangThai NVARCHAR(50) = 'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO DonDangKy (MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @MaPhongDeXuat, @LyDo, @NgayDangKy, @TrangThai, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaDon;
END;
GO

-- sp_DonDangKy_Update
CREATE OR ALTER PROCEDURE sp_DonDangKy_Update
    @MaDon INT,
    @MaSinhVien INT,
    @MaPhongDeXuat INT = NULL,
    @LyDo NVARCHAR(1000) = NULL,
    @NgayDangKy DATE,
    @TrangThai NVARCHAR(50) = 'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TrangThaiCu NVARCHAR(50);
    DECLARE @MaGiuong INT;
    DECLARE @MaPhong INT;
    DECLARE @GiaPhong DECIMAL(18,2);
    DECLARE @NgayBatDau DATE;
    DECLARE @NgayKetThuc DATE;
    SET @NgayBatDau = GETDATE();
    SET @NgayKetThuc = DATEADD(MONTH, 6, @NgayBatDau); -- Hợp đồng 6 tháng mặc định
    
    -- Lấy trạng thái cũ
    SELECT @TrangThaiCu = TrangThai, @MaPhongDeXuat = ISNULL(@MaPhongDeXuat, MaPhongDeXuat)
    FROM DonDangKy
    WHERE MaDon = @MaDon AND IsDeleted = 0;
    
    -- Cập nhật đơn đăng ký
    UPDATE DonDangKy 
    SET MaSinhVien = @MaSinhVien,
        MaPhongDeXuat = @MaPhongDeXuat,
        LyDo = @LyDo,
        NgayDangKy = @NgayDangKy,
        TrangThai = @TrangThai,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaDon = @MaDon AND IsDeleted = 0;
    
    -- Tự động tạo hợp đồng khi duyệt đơn (trạng thái: "Chờ duyệt" -> "Đã duyệt")
    IF @TrangThai = N'Đã duyệt' AND @TrangThaiCu != N'Đã duyệt'
    BEGIN
        -- Tìm phòng và giường trống
        IF @MaPhongDeXuat IS NOT NULL
        BEGIN
            -- Tìm giường trống trong phòng đề xuất
            SELECT TOP 1 @MaGiuong = g.MaGiuong, @MaPhong = g.MaPhong, @GiaPhong = p.GiaPhong
            FROM Giuong g
            INNER JOIN Phong p ON g.MaPhong = p.MaPhong
            WHERE g.MaPhong = @MaPhongDeXuat 
                AND g.TrangThai = N'Trống' 
                AND g.IsDeleted = 0
                AND p.IsDeleted = 0;
        END
        
        -- Nếu không tìm thấy giường trong phòng đề xuất, tìm phòng và giường trống bất kỳ
        IF @MaGiuong IS NULL
        BEGIN
            SELECT TOP 1 @MaGiuong = g.MaGiuong, @MaPhong = g.MaPhong, @GiaPhong = p.GiaPhong
            FROM Giuong g
            INNER JOIN Phong p ON g.MaPhong = p.MaPhong
            WHERE g.TrangThai = N'Trống' 
                AND g.IsDeleted = 0
                AND p.IsDeleted = 0
                AND p.TrangThai != N'Đã đầy'
            ORDER BY p.GiaPhong, g.MaGiuong;
        END
        
        -- Nếu tìm thấy giường trống, tạo hợp đồng
        IF @MaGiuong IS NOT NULL
        BEGIN
            -- Tạo hợp đồng
            DECLARE @MaHopDong INT;
            DECLARE @GhiChuHopDong NVARCHAR(1000);
            DECLARE @HopDongResult TABLE (MaHopDong INT);
            SET @GhiChuHopDong = CAST(N'Tự động tạo từ đơn đăng ký số ' AS NVARCHAR(1000)) + CAST(@MaDon AS NVARCHAR(10));
            
            INSERT INTO @HopDongResult
            EXEC sp_HopDong_Create
                @MaSinhVien = @MaSinhVien,
                @MaGiuong = @MaGiuong,
                @NgayBatDau = @NgayBatDau,
                @NgayKetThuc = @NgayKetThuc,
                @GiaPhong = @GiaPhong,
                @TrangThai = N'Chờ duyệt',
                @GhiChu = @GhiChuHopDong,
                @NguoiTao = @NguoiCapNhat;

            SELECT TOP 1 @MaHopDong = MaHopDong FROM @HopDongResult;
            
            -- Cập nhật trạng thái giường
            UPDATE Giuong
            SET TrangThai = N'Đã có người',
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaGiuong = @MaGiuong AND IsDeleted = 0;
            
            -- Cập nhật thông tin sinh viên (phòng)
            UPDATE SinhVien
            SET MaPhong = @MaPhong,
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
            
            -- Cập nhật trạng thái phòng
            UPDATE Phong
            SET TrangThai = CASE 
                                WHEN (SELECT COUNT(*) FROM Giuong WHERE MaPhong = @MaPhong AND TrangThai = N'Trống' AND IsDeleted = 0) = 0 
                                THEN N'Đã đầy' 
                                ELSE TrangThai 
                            END,
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaPhong = @MaPhong AND IsDeleted = 0;
        END
    END
END;
GO

-- sp_DonDangKy_Delete
CREATE OR ALTER PROCEDURE sp_DonDangKy_Delete
    @MaDon INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE DonDangKy 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaDon = @MaDon AND IsDeleted = 0;
END;
GO

-- sp_DonDangKy_GetBySinhVien
CREATE OR ALTER PROCEDURE sp_DonDangKy_GetBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        ddk.MaDon,
        ddk.MaSinhVien,
        ddk.MaPhongDeXuat,
        ddk.LyDo,
        ddk.NgayDangKy,
        ddk.TrangThai,
        ddk.GhiChu,
        ddk.IsDeleted,
        ddk.NgayTao,
        ddk.NguoiTao,
        ddk.NgayCapNhat,
        ddk.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong AS PhongDeXuat,
        t.TenToaNha AS ToaNhaDeXuat
    FROM DonDangKy ddk
    INNER JOIN SinhVien s ON ddk.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON ddk.MaPhongDeXuat = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE ddk.MaSinhVien = @MaSinhVien AND ddk.IsDeleted = 0
    ORDER BY ddk.NgayDangKy DESC;
END;
GO

-- =============================================
-- STORED PROCEDURES - YEU CAU CHUYEN PHONG CRUD
-- =============================================

-- sp_YeuCauChuyenPhong_GetAll
CREATE OR ALTER PROCEDURE sp_YeuCauChuyenPhong_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        yccp.MaYeuCau,
        yccp.MaSinhVien,
        yccp.PhongHienTai,
        yccp.PhongMongMuon,
        yccp.LyDo,
        yccp.NgayYeuCau,
        yccp.TrangThai,
        yccp.GhiChu,
        yccp.IsDeleted,
        yccp.NgayTao,
        yccp.NguoiTao,
        yccp.NgayCapNhat,
        yccp.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p1.SoPhong AS PhongHienTaiSo,
        t1.TenToaNha AS ToaNhaHienTai,
        p2.SoPhong AS PhongMongMuonSo,
        t2.TenToaNha AS ToaNhaMongMuon
    FROM YeuCauChuyenPhong yccp
    INNER JOIN SinhVien s ON yccp.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p1 ON yccp.PhongHienTai = p1.MaPhong AND p1.IsDeleted = 0
    LEFT JOIN ToaNha t1 ON p1.MaToaNha = t1.MaToaNha AND t1.IsDeleted = 0
    LEFT JOIN Phong p2 ON yccp.PhongMongMuon = p2.MaPhong AND p2.IsDeleted = 0
    LEFT JOIN ToaNha t2 ON p2.MaToaNha = t2.MaToaNha AND t2.IsDeleted = 0
    WHERE yccp.IsDeleted = 0
    ORDER BY yccp.NgayYeuCau DESC;
END;
GO

-- sp_YeuCauChuyenPhong_GetById
CREATE OR ALTER PROCEDURE sp_YeuCauChuyenPhong_GetById
    @MaYeuCau INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        yccp.MaYeuCau,
        yccp.MaSinhVien,
        yccp.PhongHienTai,
        yccp.PhongMongMuon,
        yccp.LyDo,
        yccp.NgayYeuCau,
        yccp.TrangThai,
        yccp.GhiChu,
        yccp.IsDeleted,
        yccp.NgayTao,
        yccp.NguoiTao,
        yccp.NgayCapNhat,
        yccp.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p1.SoPhong AS PhongHienTaiSo,
        t1.TenToaNha AS ToaNhaHienTai,
        p2.SoPhong AS PhongMongMuonSo,
        t2.TenToaNha AS ToaNhaMongMuon
    FROM YeuCauChuyenPhong yccp
    INNER JOIN SinhVien s ON yccp.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p1 ON yccp.PhongHienTai = p1.MaPhong AND p1.IsDeleted = 0
    LEFT JOIN ToaNha t1 ON p1.MaToaNha = t1.MaToaNha AND t1.IsDeleted = 0
    LEFT JOIN Phong p2 ON yccp.PhongMongMuon = p2.MaPhong AND p2.IsDeleted = 0
    LEFT JOIN ToaNha t2 ON p2.MaToaNha = t2.MaToaNha AND t2.IsDeleted = 0
    WHERE yccp.MaYeuCau = @MaYeuCau AND yccp.IsDeleted = 0;
END;
GO

-- sp_YeuCauChuyenPhong_Create
CREATE OR ALTER PROCEDURE sp_YeuCauChuyenPhong_Create
    @MaSinhVien INT,
    @PhongHienTai INT,
    @PhongMongMuon INT = NULL,
    @LyDo NVARCHAR(1000),
    @NgayYeuCau DATE,
    @TrangThai NVARCHAR(50) = 'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO YeuCauChuyenPhong (MaSinhVien, PhongHienTai, PhongMongMuon, LyDo, NgayYeuCau, TrangThai, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @PhongHienTai, @PhongMongMuon, @LyDo, @NgayYeuCau, @TrangThai, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaYeuCau;
END;
GO

-- sp_YeuCauChuyenPhong_Update
CREATE OR ALTER PROCEDURE sp_YeuCauChuyenPhong_Update
    @MaYeuCau INT,
    @MaSinhVien INT,
    @PhongHienTai INT,
    @PhongMongMuon INT = NULL,
    @LyDo NVARCHAR(1000),
    @NgayYeuCau DATE,
    @TrangThai NVARCHAR(50) = 'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TrangThaiCu NVARCHAR(50);
    DECLARE @PhongMongMuonCu INT;
    DECLARE @GiuongCu INT;
    DECLARE @GiuongMoi INT;
    DECLARE @MaHopDong INT;
    
    -- Lấy trạng thái cũ và phòng mong muốn
    SELECT @TrangThaiCu = TrangThai, @PhongMongMuon = ISNULL(@PhongMongMuon, PhongMongMuon)
    FROM YeuCauChuyenPhong
    WHERE MaYeuCau = @MaYeuCau AND IsDeleted = 0;
    
    -- Cập nhật yêu cầu
    UPDATE YeuCauChuyenPhong 
    SET MaSinhVien = @MaSinhVien,
        PhongHienTai = @PhongHienTai,
        PhongMongMuon = @PhongMongMuon,
        LyDo = @LyDo,
        NgayYeuCau = @NgayYeuCau,
        TrangThai = @TrangThai,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaYeuCau = @MaYeuCau AND IsDeleted = 0;
    
    -- Tự động xử lý chuyển phòng khi duyệt yêu cầu (trạng thái: "Chờ duyệt" -> "Đã duyệt")
    IF @TrangThai = N'Đã duyệt' AND @TrangThaiCu != N'Đã duyệt' AND @PhongMongMuon IS NOT NULL
    BEGIN
        -- Kiểm tra phòng mới có trống không (có giường trống)
        SELECT TOP 1 @GiuongMoi = MaGiuong
        FROM Giuong
        WHERE MaPhong = @PhongMongMuon 
            AND TrangThai = N'Trống' 
            AND IsDeleted = 0;
        
        IF @GiuongMoi IS NOT NULL
        BEGIN
            -- Lấy giường cũ của sinh viên từ hợp đồng
            SELECT TOP 1 @GiuongCu = hd.MaGiuong, @MaHopDong = hd.MaHopDong
            FROM HopDong hd
            WHERE hd.MaSinhVien = @MaSinhVien 
                AND hd.TrangThai = N'Có hiệu lực'
                AND hd.IsDeleted = 0
                AND GETDATE() BETWEEN hd.NgayBatDau AND hd.NgayKetThuc
            ORDER BY hd.NgayBatDau DESC;
            
            -- Cập nhật phòng cũ: Giường trống
            IF @GiuongCu IS NOT NULL
            BEGIN
                UPDATE Giuong
                SET TrangThai = N'Trống',
                    NgayCapNhat = GETDATE(),
                    NguoiCapNhat = @NguoiCapNhat
                WHERE MaGiuong = @GiuongCu AND IsDeleted = 0;
            END
            
            -- Cập nhật phòng mới: Giường đã có người
            UPDATE Giuong
            SET TrangThai = N'Đã có người',
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaGiuong = @GiuongMoi AND IsDeleted = 0;
            
            -- Cập nhật thông tin sinh viên: Phòng mới
            UPDATE SinhVien
            SET MaPhong = @PhongMongMuon,
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
            
            -- Cập nhật hợp đồng nếu có: Giường mới
            IF @MaHopDong IS NOT NULL
            BEGIN
                UPDATE HopDong
                SET MaGiuong = @GiuongMoi,
                    GhiChu = ISNULL(GhiChu + N' | ', N'') + N'Đã chuyển phòng từ yêu cầu số ' + CAST(@MaYeuCau AS NVARCHAR(10)),
                    NgayCapNhat = GETDATE(),
                    NguoiCapNhat = @NguoiCapNhat
                WHERE MaHopDong = @MaHopDong AND IsDeleted = 0;
            END
            
            -- Cập nhật trạng thái phòng cũ: Trống (nếu không còn giường nào có người)
            UPDATE Phong
            SET TrangThai = CASE 
                                WHEN (SELECT COUNT(*) FROM Giuong WHERE MaPhong = @PhongHienTai AND TrangThai != N'Trống' AND IsDeleted = 0) = 0 
                                THEN N'Trống' 
                                ELSE TrangThai 
                            END,
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaPhong = @PhongHienTai AND IsDeleted = 0;
            
            -- Cập nhật trạng thái phòng mới: Đã đầy (nếu không còn giường trống)
            UPDATE Phong
            SET TrangThai = CASE 
                                WHEN (SELECT COUNT(*) FROM Giuong WHERE MaPhong = @PhongMongMuon AND TrangThai = N'Trống' AND IsDeleted = 0) = 0 
                                THEN N'Đã đầy' 
                                ELSE TrangThai 
                            END,
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaPhong = @PhongMongMuon AND IsDeleted = 0;
            
            -- Tự động tạo thông báo chuyển phòng cho sinh viên
            DECLARE @SoPhongCu NVARCHAR(100);
            DECLARE @SoPhongMoi NVARCHAR(100);
            DECLARE @NoiDungThongBaoChuyenPhong NVARCHAR(1000);
            
            SELECT @SoPhongCu = SoPhong FROM Phong WHERE MaPhong = @PhongHienTai AND IsDeleted = 0;
            SELECT @SoPhongMoi = SoPhong FROM Phong WHERE MaPhong = @PhongMongMuon AND IsDeleted = 0;
            
            SET @NoiDungThongBaoChuyenPhong = N'Yêu cầu chuyển phòng của bạn đã được duyệt. ' +
                                             N'Bạn đã được chuyển từ phòng ' + ISNULL(@SoPhongCu, CAST(@PhongHienTai AS NVARCHAR(10))) +
                                             N' sang phòng ' + ISNULL(@SoPhongMoi, CAST(@PhongMongMuon AS NVARCHAR(10))) +
                                             N'. Vui lòng đến phòng quản lý để hoàn tất thủ tục.';
            
            INSERT INTO ThongBaoQuaHan (MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, NguoiTao)
            VALUES (@MaSinhVien, NULL, GETDATE(), @NoiDungThongBaoChuyenPhong, N'Đã gửi', @NguoiCapNhat);
        END
    END
END;
GO

-- sp_YeuCauChuyenPhong_Delete
CREATE OR ALTER PROCEDURE sp_YeuCauChuyenPhong_Delete
    @MaYeuCau INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE YeuCauChuyenPhong 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaYeuCau = @MaYeuCau AND IsDeleted = 0;
END;
GO

-- sp_YeuCauChuyenPhong_GetBySinhVien
CREATE OR ALTER PROCEDURE sp_YeuCauChuyenPhong_GetBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        yccp.MaYeuCau,
        yccp.MaSinhVien,
        yccp.PhongHienTai,
        yccp.PhongMongMuon,
        yccp.LyDo,
        yccp.NgayYeuCau,
        yccp.TrangThai,
        yccp.GhiChu,
        yccp.IsDeleted,
        yccp.NgayTao,
        yccp.NguoiTao,
        yccp.NgayCapNhat,
        yccp.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p1.SoPhong AS PhongHienTaiSo,
        t1.TenToaNha AS ToaNhaHienTai,
        p2.SoPhong AS PhongMongMuonSo,
        t2.TenToaNha AS ToaNhaMongMuon
    FROM YeuCauChuyenPhong yccp
    INNER JOIN SinhVien s ON yccp.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p1 ON yccp.PhongHienTai = p1.MaPhong AND p1.IsDeleted = 0
    LEFT JOIN ToaNha t1 ON p1.MaToaNha = t1.MaToaNha AND t1.IsDeleted = 0
    LEFT JOIN Phong p2 ON yccp.PhongMongMuon = p2.MaPhong AND p2.IsDeleted = 0
    LEFT JOIN ToaNha t2 ON p2.MaToaNha = t2.MaToaNha AND t2.IsDeleted = 0
    WHERE yccp.MaSinhVien = @MaSinhVien AND yccp.IsDeleted = 0
    ORDER BY yccp.NgayYeuCau DESC;
END;
GO

-- =============================================
-- STORED PROCEDURES - CHI SO DIEN NUOC CRUD
-- =============================================

-- sp_ChiSoDienNuoc_GetAll
CREATE OR ALTER PROCEDURE sp_ChiSoDienNuoc_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        csdn.MaChiSo,
        csdn.MaPhong,
        csdn.Thang,
        csdn.Nam,
        csdn.ChiSoDien,
        csdn.ChiSoNuoc,
        csdn.NguoiGhi,
        csdn.TrangThai,
        csdn.GhiChu,
        csdn.IsDeleted,
        csdn.NgayTao,
        csdn.NguoiTao,
        csdn.NgayCapNhat,
        csdn.NguoiCapNhat,
        p.SoPhong,
        t.TenToaNha
    FROM ChiSoDienNuoc csdn
    INNER JOIN Phong p ON csdn.MaPhong = p.MaPhong AND p.IsDeleted = 0
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE csdn.IsDeleted = 0
    ORDER BY csdn.Nam DESC, csdn.Thang DESC;
END;
GO

-- sp_ChiSoDienNuoc_GetById
CREATE OR ALTER PROCEDURE sp_ChiSoDienNuoc_GetById
    @MaChiSo INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        csdn.MaChiSo,
        csdn.MaPhong,
        csdn.Thang,
        csdn.Nam,
        csdn.ChiSoDien,
        csdn.ChiSoNuoc,
        csdn.NguoiGhi,
        csdn.TrangThai,
        csdn.GhiChu,
        csdn.IsDeleted,
        csdn.NgayTao,
        csdn.NguoiTao,
        csdn.NgayCapNhat,
        csdn.NguoiCapNhat,
        p.SoPhong,
        t.TenToaNha
    FROM ChiSoDienNuoc csdn
    INNER JOIN Phong p ON csdn.MaPhong = p.MaPhong AND p.IsDeleted = 0
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE csdn.MaChiSo = @MaChiSo AND csdn.IsDeleted = 0;
END;
GO

-- sp_ChiSoDienNuoc_Create
CREATE OR ALTER PROCEDURE sp_ChiSoDienNuoc_Create
    @MaPhong INT,
    @Thang INT,
    @Nam INT,
    @ChiSoDien INT,
    @ChiSoNuoc INT,
    @NguoiGhi NVARCHAR(100) = NULL,
    @TrangThai NVARCHAR(50) = 'Đã ghi',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ChiSoDienNuoc (MaPhong, Thang, Nam, ChiSoDien, ChiSoNuoc, NguoiGhi, TrangThai, GhiChu, NguoiTao)
    VALUES (@MaPhong, @Thang, @Nam, @ChiSoDien, @ChiSoNuoc, @NguoiGhi, @TrangThai, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaChiSo;
END;
GO

-- sp_ChiSoDienNuoc_Update
CREATE OR ALTER PROCEDURE sp_ChiSoDienNuoc_Update
    @MaChiSo INT,
    @MaPhong INT,
    @Thang INT,
    @Nam INT,
    @ChiSoDien INT,
    @ChiSoNuoc INT,
    @NguoiGhi NVARCHAR(100) = NULL,
    @TrangThai NVARCHAR(50) = 'Đã ghi',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ChiSoDienNuoc 
    SET MaPhong = @MaPhong,
        Thang = @Thang,
        Nam = @Nam,
        ChiSoDien = @ChiSoDien,
        ChiSoNuoc = @ChiSoNuoc,
        NguoiGhi = @NguoiGhi,
        TrangThai = @TrangThai,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaChiSo = @MaChiSo AND IsDeleted = 0;
END;
GO

-- sp_ChiSoDienNuoc_Delete
CREATE OR ALTER PROCEDURE sp_ChiSoDienNuoc_Delete
    @MaChiSo INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ChiSoDienNuoc 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaChiSo = @MaChiSo AND IsDeleted = 0;
END;
GO

-- sp_ChiSoDienNuoc_GetByPhong
CREATE OR ALTER PROCEDURE sp_ChiSoDienNuoc_GetByPhong
    @MaPhong INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        csdn.MaChiSo,
        csdn.MaPhong,
        csdn.Thang,
        csdn.Nam,
        csdn.ChiSoDien,
        csdn.ChiSoNuoc,
        csdn.NguoiGhi,
        csdn.TrangThai,
        csdn.GhiChu,
        csdn.IsDeleted,
        csdn.NgayTao,
        csdn.NguoiTao,
        csdn.NgayCapNhat,
        csdn.NguoiCapNhat,
        p.SoPhong,
        t.TenToaNha
    FROM ChiSoDienNuoc csdn
    INNER JOIN Phong p ON csdn.MaPhong = p.MaPhong AND p.IsDeleted = 0
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE csdn.MaPhong = @MaPhong AND csdn.IsDeleted = 0
    ORDER BY csdn.Nam DESC, csdn.Thang DESC;
END;
GO

-- sp_ChiSoDienNuoc_GetByThangNam
CREATE OR ALTER PROCEDURE sp_ChiSoDienNuoc_GetByThangNam
    @Thang INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        csdn.MaChiSo,
        csdn.MaPhong,
        csdn.Thang,
        csdn.Nam,
        csdn.ChiSoDien,
        csdn.ChiSoNuoc,
        csdn.NguoiGhi,
        csdn.TrangThai,
        csdn.GhiChu,
        csdn.IsDeleted,
        csdn.NgayTao,
        csdn.NguoiTao,
        csdn.NgayCapNhat,
        csdn.NguoiCapNhat,
        p.SoPhong,
        t.TenToaNha
    FROM ChiSoDienNuoc csdn
    INNER JOIN Phong p ON csdn.MaPhong = p.MaPhong AND p.IsDeleted = 0
    INNER JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE csdn.Thang = @Thang AND csdn.Nam = @Nam AND csdn.IsDeleted = 0
    ORDER BY t.TenToaNha, p.SoPhong;
END;
GO

-- =============================================
-- STORED PROCEDURES - CHI TIET HOA DON CRUD
-- =============================================

-- sp_ChiTietHoaDon_GetAll
CREATE OR ALTER PROCEDURE sp_ChiTietHoaDon_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        cthd.MaChiTiet,
        cthd.MaHoaDon,
        cthd.LoaiChiPhi,
        cthd.SoLuong,
        cthd.DonGia,
        cthd.ThanhTien,
        cthd.GhiChu,
        cthd.IsDeleted,
        cthd.NgayTao,
        cthd.NguoiTao,
        cthd.NgayCapNhat,
        cthd.NguoiCapNhat,
        hd.MaSinhVien,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        p.SoPhong,
        t.TenToaNha
    FROM ChiTietHoaDon cthd
    INNER JOIN HoaDon hd ON cthd.MaHoaDon = hd.MaHoaDon AND hd.IsDeleted = 0
    LEFT JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON hd.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE cthd.IsDeleted = 0
    ORDER BY cthd.NgayTao DESC;
END;
GO

-- sp_ChiTietHoaDon_GetById
CREATE OR ALTER PROCEDURE sp_ChiTietHoaDon_GetById
    @MaChiTiet INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        cthd.MaChiTiet,
        cthd.MaHoaDon,
        cthd.LoaiChiPhi,
        cthd.SoLuong,
        cthd.DonGia,
        cthd.ThanhTien,
        cthd.GhiChu,
        cthd.IsDeleted,
        cthd.NgayTao,
        cthd.NguoiTao,
        cthd.NgayCapNhat,
        cthd.NguoiCapNhat,
        hd.MaSinhVien,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        p.SoPhong,
        t.TenToaNha
    FROM ChiTietHoaDon cthd
    INNER JOIN HoaDon hd ON cthd.MaHoaDon = hd.MaHoaDon AND hd.IsDeleted = 0
    LEFT JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON hd.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE cthd.MaChiTiet = @MaChiTiet AND cthd.IsDeleted = 0;
END;
GO

-- sp_ChiTietHoaDon_Create
CREATE OR ALTER PROCEDURE sp_ChiTietHoaDon_Create
    @MaHoaDon INT,
    @LoaiChiPhi NVARCHAR(100),
    @SoLuong INT,
    @DonGia DECIMAL(18,2),
    @ThanhTien DECIMAL(18,2),
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ChiTietHoaDon (MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, NguoiTao)
    VALUES (@MaHoaDon, @LoaiChiPhi, @SoLuong, @DonGia, @ThanhTien, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaChiTiet;
END;
GO

-- sp_ChiTietHoaDon_Update
CREATE OR ALTER PROCEDURE sp_ChiTietHoaDon_Update
    @MaChiTiet INT,
    @MaHoaDon INT,
    @LoaiChiPhi NVARCHAR(100),
    @SoLuong INT,
    @DonGia DECIMAL(18,2),
    @ThanhTien DECIMAL(18,2),
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ChiTietHoaDon 
    SET MaHoaDon = @MaHoaDon,
        LoaiChiPhi = @LoaiChiPhi,
        SoLuong = @SoLuong,
        DonGia = @DonGia,
        ThanhTien = @ThanhTien,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaChiTiet = @MaChiTiet AND IsDeleted = 0;
END;
GO

-- sp_ChiTietHoaDon_Delete
CREATE OR ALTER PROCEDURE sp_ChiTietHoaDon_Delete
    @MaChiTiet INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ChiTietHoaDon 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaChiTiet = @MaChiTiet AND IsDeleted = 0;
END;
GO

-- sp_ChiTietHoaDon_GetByHoaDon
CREATE OR ALTER PROCEDURE sp_ChiTietHoaDon_GetByHoaDon
    @MaHoaDon INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        cthd.MaChiTiet,
        cthd.MaHoaDon,
        cthd.LoaiChiPhi,
        cthd.SoLuong,
        cthd.DonGia,
        cthd.ThanhTien,
        cthd.GhiChu,
        cthd.IsDeleted,
        cthd.NgayTao,
        cthd.NguoiTao,
        cthd.NgayCapNhat,
        cthd.NguoiCapNhat,
        hd.MaSinhVien,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        p.SoPhong,
        t.TenToaNha
    FROM ChiTietHoaDon cthd
    INNER JOIN HoaDon hd ON cthd.MaHoaDon = hd.MaHoaDon AND hd.IsDeleted = 0
    LEFT JOIN SinhVien s ON hd.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON hd.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE cthd.MaHoaDon = @MaHoaDon AND cthd.IsDeleted = 0
    ORDER BY cthd.NgayTao;
END;
GO

-- =============================================
-- STORED PROCEDURES - THONG BAO QUA HAN CRUD
-- =============================================

-- sp_ThongBaoQuaHan_GetAll
CREATE OR ALTER PROCEDURE sp_ThongBaoQuaHan_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        tbh.MaThongBao,
        tbh.MaSinhVien,
        tbh.MaHoaDon,
        tbh.NgayThongBao,
        tbh.NoiDung,
        tbh.TrangThai,
        tbh.GhiChu,
        tbh.IsDeleted,
        tbh.NgayTao,
        tbh.NguoiTao,
        tbh.NgayCapNhat,
        tbh.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM ThongBaoQuaHan tbh
    INNER JOIN SinhVien s ON tbh.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN HoaDon hd ON tbh.MaHoaDon = hd.MaHoaDon AND hd.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE tbh.IsDeleted = 0
    ORDER BY tbh.NgayThongBao DESC;
END;
GO

-- sp_ThongBaoQuaHan_GetById
CREATE OR ALTER PROCEDURE sp_ThongBaoQuaHan_GetById
    @MaThongBao INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        tbh.MaThongBao,
        tbh.MaSinhVien,
        tbh.MaHoaDon,
        tbh.NgayThongBao,
        tbh.NoiDung,
        tbh.TrangThai,
        tbh.GhiChu,
        tbh.IsDeleted,
        tbh.NgayTao,
        tbh.NguoiTao,
        tbh.NgayCapNhat,
        tbh.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM ThongBaoQuaHan tbh
    INNER JOIN SinhVien s ON tbh.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN HoaDon hd ON tbh.MaHoaDon = hd.MaHoaDon AND hd.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE tbh.MaThongBao = @MaThongBao AND tbh.IsDeleted = 0;
END;
GO

-- sp_ThongBaoQuaHan_Insert
CREATE OR ALTER PROCEDURE sp_ThongBaoQuaHan_Insert
    @MaSinhVien INT,
    @MaHoaDon INT = NULL, -- Cho phép NULL
    @NgayThongBao DATE,
    @NoiDung NVARCHAR(1000),
    @TrangThai NVARCHAR(50) = 'Đã gửi',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ThongBaoQuaHan (MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @MaHoaDon, @NgayThongBao, @NoiDung, @TrangThai, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaThongBao;
END;
GO

-- sp_ThongBaoQuaHan_Update
CREATE OR ALTER PROCEDURE sp_ThongBaoQuaHan_Update
    @MaThongBao INT,
    @MaSinhVien INT,
    @MaHoaDon INT = NULL, -- Cho phép NULL
    @NgayThongBao DATE,
    @NoiDung NVARCHAR(1000),
    @TrangThai NVARCHAR(50) = 'Đã gửi',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ThongBaoQuaHan 
    SET MaSinhVien = @MaSinhVien,
        MaHoaDon = @MaHoaDon,
        NgayThongBao = @NgayThongBao,
        NoiDung = @NoiDung,
        TrangThai = @TrangThai,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaThongBao = @MaThongBao AND IsDeleted = 0;
END;
GO

-- sp_ThongBaoQuaHan_Delete
CREATE OR ALTER PROCEDURE sp_ThongBaoQuaHan_Delete
    @MaThongBao INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ThongBaoQuaHan 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaThongBao = @MaThongBao AND IsDeleted = 0;
END;
GO

-- sp_ThongBaoQuaHan_GetBySinhVien
CREATE OR ALTER PROCEDURE sp_ThongBaoQuaHan_GetBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        tbh.MaThongBao,
        tbh.MaSinhVien,
        tbh.MaHoaDon,
        tbh.NgayThongBao,
        tbh.NoiDung,
        tbh.TrangThai,
        tbh.GhiChu,
        tbh.IsDeleted,
        tbh.NgayTao,
        tbh.NguoiTao,
        tbh.NgayCapNhat,
        tbh.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM ThongBaoQuaHan tbh
    INNER JOIN SinhVien s ON tbh.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN HoaDon hd ON tbh.MaHoaDon = hd.MaHoaDon AND hd.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE tbh.MaSinhVien = @MaSinhVien AND tbh.IsDeleted = 0
    ORDER BY tbh.NgayThongBao DESC;
END;
GO

-- =============================================
-- STORED PROCEDURES - THONG BAO QUA HAN CRUD
-- (Đã xóa phần trùng lặp - chỉ giữ lại phần đầu tiên)
-- =============================================

-- =============================================
-- BUSINESS LOGIC STORED PROCEDURES
-- =============================================

-- sp_TinhTienDien - Tính tiền điện theo bậc giá
CREATE OR ALTER PROCEDURE sp_TinhTienDien
    @SoKwh INT,
    @Thang INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TongTien DECIMAL(18,2) = 0;
    DECLARE @SoKwhConLai INT = @SoKwh;
    
    -- Lấy các bậc giá điện theo thứ tự từ thấp đến cao
    DECLARE bac_cursor CURSOR FOR
    SELECT TuSo, DenSo, DonGia
    FROM BacGia
    WHERE Loai = 'Điện' AND TrangThai = 1 AND IsDeleted = 0
    ORDER BY ThuTu;
    
    DECLARE @TuSo INT, @DenSo INT, @DonGia DECIMAL(18,2);
    
    OPEN bac_cursor;
    FETCH NEXT FROM bac_cursor INTO @TuSo, @DenSo, @DonGia;
    
    WHILE @@FETCH_STATUS = 0 AND @SoKwhConLai > 0
    BEGIN
        DECLARE @SoKwhTrongBac INT;
        
        -- Tính số kWh trong bậc này
        IF @SoKwhConLai >= (@DenSo - @TuSo + 1)
            SET @SoKwhTrongBac = @DenSo - @TuSo + 1;
        ELSE
            SET @SoKwhTrongBac = @SoKwhConLai;
        
        -- Tính tiền cho bậc này
        SET @TongTien = @TongTien + (@SoKwhTrongBac * @DonGia);
        SET @SoKwhConLai = @SoKwhConLai - @SoKwhTrongBac;
        
        FETCH NEXT FROM bac_cursor INTO @TuSo, @DenSo, @DonGia;
    END;
    
    CLOSE bac_cursor;
    DEALLOCATE bac_cursor;
    
    SELECT @TongTien AS TongTienDien;
END;
GO

-- sp_TinhTienNuoc - Tính tiền nước theo bậc giá
CREATE OR ALTER PROCEDURE sp_TinhTienNuoc
    @SoKhoi INT,
    @Thang INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TongTien DECIMAL(18,2) = 0;
    DECLARE @SoKhoiConLai INT = @SoKhoi;
    
    -- Lấy các bậc giá nước theo thứ tự từ thấp đến cao
    DECLARE bac_cursor CURSOR FOR
    SELECT TuSo, DenSo, DonGia
    FROM BacGia
    WHERE Loai = 'Nước' AND TrangThai = 1 AND IsDeleted = 0
    ORDER BY ThuTu;
    
    DECLARE @TuSo INT, @DenSo INT, @DonGia DECIMAL(18,2);
    
    OPEN bac_cursor;
    FETCH NEXT FROM bac_cursor INTO @TuSo, @DenSo, @DonGia;
    
    WHILE @@FETCH_STATUS = 0 AND @SoKhoiConLai > 0
    BEGIN
        DECLARE @SoKhoiTrongBac INT;
        
        -- Tính số khối trong bậc này
        IF @SoKhoiConLai >= (@DenSo - @TuSo + 1)
            SET @SoKhoiTrongBac = @DenSo - @TuSo + 1;
        ELSE
            SET @SoKhoiTrongBac = @SoKhoiConLai;
        
        -- Tính tiền cho bậc này
        SET @TongTien = @TongTien + (@SoKhoiTrongBac * @DonGia);
        SET @SoKhoiConLai = @SoKhoiConLai - @SoKhoiTrongBac;
        
        FETCH NEXT FROM bac_cursor INTO @TuSo, @DenSo, @DonGia;
    END;
    
    CLOSE bac_cursor;
    DEALLOCATE bac_cursor;
    
    SELECT @TongTien AS TongTienNuoc;
END;
GO

-- sp_TaoHoaDonHangThang - Tạo hóa đơn hàng tháng cho tất cả sinh viên
CREATE OR ALTER PROCEDURE sp_TaoHoaDonHangThang
    @Thang INT,
    @Nam INT,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaHoaDon INT;
    DECLARE @TongTien DECIMAL(18,2);
    DECLARE @TongTienDien DECIMAL(18,2);
    DECLARE @TongTienNuoc DECIMAL(18,2);
    DECLARE @TongTienPhong DECIMAL(18,2);
    
    -- Lấy danh sách sinh viên đang ở
    DECLARE sinhvien_cursor CURSOR FOR
    SELECT s.MaSinhVien, s.MaPhong, s.HoTen, s.MSSV
    FROM SinhVien s
    WHERE s.IsDeleted = 0 AND s.MaPhong IS NOT NULL;
    
    DECLARE @MaSinhVien INT, @MaPhong INT, @HoTen NVARCHAR(200), @MSSV NVARCHAR(20);
    
    OPEN sinhvien_cursor;
    FETCH NEXT FROM sinhvien_cursor INTO @MaSinhVien, @MaPhong, @HoTen, @MSSV;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @TongTien = 0;
        SET @TongTienDien = 0;
        SET @TongTienNuoc = 0;
        SET @TongTienPhong = 0;
        
        -- Tính tiền phòng
        SELECT @TongTienPhong = ISNULL(GiaTien, 0)
        FROM MucPhi
        WHERE LoaiPhi = 'Phòng' AND TrangThai = 1 AND IsDeleted = 0;
        
        -- Tính tiền điện: Tính chênh lệch chỉ số điện (chỉ số hiện tại - chỉ số tháng trước)
        DECLARE @ChiSoDienHienTai INT = 0;
        DECLARE @ChiSoDienThangTruoc INT = 0;
        DECLARE @ThangTruoc INT, @NamTruoc INT;
        
        -- Tính tháng trước
        IF @Thang = 1
        BEGIN
            SET @ThangTruoc = 12;
            SET @NamTruoc = @Nam - 1;
        END
        ELSE
        BEGIN
            SET @ThangTruoc = @Thang - 1;
            SET @NamTruoc = @Nam;
        END
        
        -- Lấy chỉ số điện tháng hiện tại
        SELECT @ChiSoDienHienTai = ISNULL(ChiSoDien, 0)
        FROM ChiSoDienNuoc
        WHERE MaPhong = @MaPhong AND Thang = @Thang AND Nam = @Nam AND IsDeleted = 0;
        
        -- Lấy chỉ số điện tháng trước
        SELECT @ChiSoDienThangTruoc = ISNULL(ChiSoDien, 0)
        FROM ChiSoDienNuoc
        WHERE MaPhong = @MaPhong AND Thang = @ThangTruoc AND Nam = @NamTruoc AND IsDeleted = 0;
        
        -- Tính số kWh tiêu thụ (chênh lệch)
        DECLARE @SoKwhTieuThu INT = @ChiSoDienHienTai - @ChiSoDienThangTruoc;
        
        -- Áp dụng mức phí tối thiểu nếu có
        DECLARE @MucToiThieuDien INT = 0;
        SELECT @MucToiThieuDien = ISNULL(MucToiThieu, 0)
        FROM CauHinhPhi
        WHERE Loai = 'Điện' AND TrangThai = 1 AND IsDeleted = 0;
        
        IF @MucToiThieuDien > 0 AND @SoKwhTieuThu < @MucToiThieuDien
            SET @SoKwhTieuThu = @MucToiThieuDien;
        
        -- Chỉ tính tiền nếu có tiêu thụ
        IF @SoKwhTieuThu > 0
        BEGIN
            -- Tính tiền điện theo bậc giá
            DECLARE @TienDien DECIMAL(18,2) = 0;
            DECLARE @SoKwhConLai INT = @SoKwhTieuThu;
            
            DECLARE bac_dien_cursor CURSOR FOR
            SELECT TuSo, DenSo, DonGia
            FROM BacGia
            WHERE Loai = 'Điện' AND TrangThai = 1 AND IsDeleted = 0
            ORDER BY ThuTu;
            
            DECLARE @TuSoDien INT, @DenSoDien INT, @DonGiaDien DECIMAL(18,2);
            
            OPEN bac_dien_cursor;
            FETCH NEXT FROM bac_dien_cursor INTO @TuSoDien, @DenSoDien, @DonGiaDien;
            
            WHILE @@FETCH_STATUS = 0 AND @SoKwhConLai > 0
            BEGIN
                DECLARE @SoKwhTrongBac INT;
                
                IF @SoKwhConLai >= (@DenSoDien - @TuSoDien + 1)
                    SET @SoKwhTrongBac = @DenSoDien - @TuSoDien + 1;
                ELSE
                    SET @SoKwhTrongBac = @SoKwhConLai;
                
                SET @TienDien = @TienDien + (@SoKwhTrongBac * @DonGiaDien);
                SET @SoKwhConLai = @SoKwhConLai - @SoKwhTrongBac;
                
                FETCH NEXT FROM bac_dien_cursor INTO @TuSoDien, @DenSoDien, @DonGiaDien;
            END;
            
            CLOSE bac_dien_cursor;
            DEALLOCATE bac_dien_cursor;
            
            SET @TongTienDien = @TienDien;
        END
        ELSE
        BEGIN
            SET @TongTienDien = 0;
        END;
        
        -- Tính tiền nước: Tính chênh lệch chỉ số nước (chỉ số hiện tại - chỉ số tháng trước)
        DECLARE @ChiSoNuocHienTai INT = 0;
        DECLARE @ChiSoNuocThangTruoc INT = 0;
        
        -- Lấy chỉ số nước tháng hiện tại
        SELECT @ChiSoNuocHienTai = ISNULL(ChiSoNuoc, 0)
        FROM ChiSoDienNuoc
        WHERE MaPhong = @MaPhong AND Thang = @Thang AND Nam = @Nam AND IsDeleted = 0;
        
        -- Lấy chỉ số nước tháng trước
        SELECT @ChiSoNuocThangTruoc = ISNULL(ChiSoNuoc, 0)
        FROM ChiSoDienNuoc
        WHERE MaPhong = @MaPhong AND Thang = @ThangTruoc AND Nam = @NamTruoc AND IsDeleted = 0;
        
        -- Tính số m3 tiêu thụ (chênh lệch)
        DECLARE @SoKhoiTieuThu INT = @ChiSoNuocHienTai - @ChiSoNuocThangTruoc;
        
        -- Áp dụng mức phí tối thiểu nếu có
        DECLARE @MucToiThieuNuoc INT = 0;
        SELECT @MucToiThieuNuoc = ISNULL(MucToiThieu, 0)
        FROM CauHinhPhi
        WHERE Loai = 'Nước' AND TrangThai = 1 AND IsDeleted = 0;
        
        IF @MucToiThieuNuoc > 0 AND @SoKhoiTieuThu < @MucToiThieuNuoc
            SET @SoKhoiTieuThu = @MucToiThieuNuoc;
        
        -- Chỉ tính tiền nếu có tiêu thụ
        IF @SoKhoiTieuThu > 0
        BEGIN
            -- Tính tiền nước theo bậc giá
            DECLARE @TienNuoc DECIMAL(18,2) = 0;
            DECLARE @SoKhoiConLai INT = @SoKhoiTieuThu;
            
            DECLARE bac_nuoc_cursor CURSOR FOR
            SELECT TuSo, DenSo, DonGia
            FROM BacGia
            WHERE Loai = 'Nước' AND TrangThai = 1 AND IsDeleted = 0
            ORDER BY ThuTu;
            
            DECLARE @TuSoNuoc INT, @DenSoNuoc INT, @DonGiaNuoc DECIMAL(18,2);
            
            OPEN bac_nuoc_cursor;
            FETCH NEXT FROM bac_nuoc_cursor INTO @TuSoNuoc, @DenSoNuoc, @DonGiaNuoc;
            
            WHILE @@FETCH_STATUS = 0 AND @SoKhoiConLai > 0
            BEGIN
                DECLARE @SoKhoiTrongBac INT;
                
                IF @SoKhoiConLai >= (@DenSoNuoc - @TuSoNuoc + 1)
                    SET @SoKhoiTrongBac = @DenSoNuoc - @TuSoNuoc + 1;
                ELSE
                    SET @SoKhoiTrongBac = @SoKhoiConLai;
                
                SET @TienNuoc = @TienNuoc + (@SoKhoiTrongBac * @DonGiaNuoc);
                SET @SoKhoiConLai = @SoKhoiConLai - @SoKhoiTrongBac;
                
                FETCH NEXT FROM bac_nuoc_cursor INTO @TuSoNuoc, @DenSoNuoc, @DonGiaNuoc;
            END;
            
            CLOSE bac_nuoc_cursor;
            DEALLOCATE bac_nuoc_cursor;
            
            SET @TongTienNuoc = @TienNuoc;
        END
        ELSE
        BEGIN
            SET @TongTienNuoc = 0;
        END;
        
        SET @TongTien = @TongTienPhong + @TongTienDien + @TongTienNuoc;
        
        -- Tạo hóa đơn
        DECLARE @HanThanhToan DATE = DATEADD(DAY, 7, DATEFROMPARTS(@Nam, @Thang, DAY(EOMONTH(DATEFROMPARTS(@Nam, @Thang, 1)))));
        
        INSERT INTO HoaDon (MaSinhVien, MaPhong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayTao, NguoiTao)
        VALUES (@MaSinhVien, @MaPhong, @Thang, @Nam, @TongTien, 'Chưa thanh toán', @HanThanhToan, GETDATE(), @NguoiTao);
        
        SET @MaHoaDon = SCOPE_IDENTITY();
        
        -- Tự động tạo thông báo hóa đơn cho sinh viên
        DECLARE @NoiDungThongBao NVARCHAR(1000);
        SET @NoiDungThongBao = N'Hóa đơn tháng ' + CAST(@Thang AS NVARCHAR(2)) + '/' + CAST(@Nam AS NVARCHAR(4)) + 
                               N' đã được tạo. Tổng tiền: ' + CAST(@TongTien AS NVARCHAR(20)) + 
                               N' VND. Hạn thanh toán: ' + FORMAT(@HanThanhToan, 'dd/MM/yyyy');
        
        INSERT INTO ThongBaoQuaHan (MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, NguoiTao)
        VALUES (@MaSinhVien, @MaHoaDon, GETDATE(), @NoiDungThongBao, 'Đã gửi', @NguoiTao);
        
        -- Tạo chi tiết hóa đơn
        IF @TongTienPhong > 0
        BEGIN
            INSERT INTO ChiTietHoaDon (MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien)
            SELECT @MaHoaDon, LoaiPhi, 1, GiaTien, GiaTien
            FROM MucPhi
            WHERE LoaiPhi = 'Phòng' AND TrangThai = 1 AND IsDeleted = 0;
        END;
        
        IF @TongTienDien > 0
        BEGIN
            INSERT INTO ChiTietHoaDon (MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien)
            VALUES (@MaHoaDon, N'Điện', @SoKwhTieuThu, 0, @TongTienDien);
        END;
        
        IF @TongTienNuoc > 0
        BEGIN
            INSERT INTO ChiTietHoaDon (MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien)
            VALUES (@MaHoaDon, N'Nước', @SoKhoiTieuThu, 0, @TongTienNuoc);
        END;
        
        FETCH NEXT FROM sinhvien_cursor INTO @MaSinhVien, @MaPhong, @HoTen, @MSSV;
    END;
    
    CLOSE sinhvien_cursor;
    DEALLOCATE sinhvien_cursor;
    
    SELECT 'Hóa đơn hàng tháng đã được tạo thành công' AS KetQua;
END;
GO

-- sp_BaoCaoTyLeLapDay - Báo cáo tỷ lệ lấp đầy phòng
CREATE OR ALTER PROCEDURE sp_BaoCaoTyLeLapDay
    @Thang INT = NULL,
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Thang IS NULL SET @Thang = MONTH(GETDATE());
    IF @Nam IS NULL SET @Nam = YEAR(GETDATE());
    
    SELECT 
        t.MaToaNha,
        t.TenToaNha,
        COUNT(p.MaPhong) AS TongSoPhong,
        COUNT(CASE WHEN s.MaSinhVien IS NOT NULL THEN 1 END) AS SoPhongCoSinhVien,
        CASE 
            WHEN COUNT(p.MaPhong) > 0 
            THEN CAST(COUNT(CASE WHEN s.MaSinhVien IS NOT NULL THEN 1 END) * 100.0 / COUNT(p.MaPhong) AS DECIMAL(5,2))
            ELSE 0 
        END AS TyLeLapDay
    FROM ToaNha t
    LEFT JOIN Phong p ON t.MaToaNha = p.MaToaNha AND p.IsDeleted = 0
    LEFT JOIN SinhVien s ON p.MaPhong = s.MaPhong AND s.IsDeleted = 0
    WHERE t.IsDeleted = 0
    GROUP BY t.MaToaNha, t.TenToaNha
    ORDER BY TyLeLapDay DESC;
END;
GO

-- sp_BaoCaoDoanhThu - Báo cáo doanh thu theo tháng
CREATE OR ALTER PROCEDURE sp_BaoCaoDoanhThu
    @Thang INT = NULL,
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Thang IS NULL SET @Thang = MONTH(GETDATE());
    IF @Nam IS NULL SET @Nam = YEAR(GETDATE());
    
    SELECT 
        hd.Thang,
        hd.Nam,
        COUNT(hd.MaHoaDon) AS TongSoHoaDon,
        SUM(hd.TongTien) AS TongDoanhThu,
        SUM(CASE WHEN hd.TrangThai = 'Đã thanh toán' THEN hd.TongTien ELSE 0 END) AS DoanhThuDaThu,
        SUM(CASE WHEN hd.TrangThai = 'Chưa thanh toán' THEN hd.TongTien ELSE 0 END) AS DoanhThuChuaThu,
        AVG(hd.TongTien) AS TrungBinhHoaDon
    FROM HoaDon hd
    WHERE hd.Thang = @Thang AND hd.Nam = @Nam AND hd.IsDeleted = 0
    GROUP BY hd.Thang, hd.Nam;
END;
GO

-- sp_BaoCaoCongNo - Báo cáo công nợ sinh viên
CREATE OR ALTER PROCEDURE sp_BaoCaoCongNo
    @Thang INT = NULL,
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Thang IS NULL SET @Thang = MONTH(GETDATE());
    IF @Nam IS NULL SET @Nam = YEAR(GETDATE());
    
    SELECT 
        s.MaSinhVien,
        s.HoTen,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha,
        COUNT(hd.MaHoaDon) AS SoHoaDonChuaThanhToan,
        SUM(hd.TongTien) AS TongCongNo
    FROM SinhVien s
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    INNER JOIN HoaDon hd ON s.MaSinhVien = hd.MaSinhVien AND hd.TrangThai = 'Chưa thanh toán' AND hd.IsDeleted = 0
    WHERE s.IsDeleted = 0 AND hd.Thang <= @Thang AND hd.Nam <= @Nam
    GROUP BY s.MaSinhVien, s.HoTen, s.MSSV, s.Lop, s.Khoa, p.SoPhong, t.TenToaNha
    HAVING SUM(hd.TongTien) > 0
    ORDER BY TongCongNo DESC;
END;
GO

-- sp_BaoCaoDienNuoc - Báo cáo tiêu thụ điện nước
CREATE OR ALTER PROCEDURE sp_BaoCaoDienNuoc
    @Thang INT = NULL,
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Thang IS NULL SET @Thang = MONTH(GETDATE());
    IF @Nam IS NULL SET @Nam = YEAR(GETDATE());
    
    SELECT 
        t.MaToaNha,
        t.TenToaNha,
        COUNT(DISTINCT p.MaPhong) AS TongSoPhong,
        SUM(csdn.ChiSoDien) AS TongSoDien,
        SUM(csdn.ChiSoNuoc) AS TongSoNuoc,
        AVG(csdn.ChiSoDien) AS TrungBinhDien,
        AVG(csdn.ChiSoNuoc) AS TrungBinhNuoc
    FROM ToaNha t
    LEFT JOIN Phong p ON t.MaToaNha = p.MaToaNha AND p.IsDeleted = 0
    LEFT JOIN ChiSoDienNuoc csdn ON p.MaPhong = csdn.MaPhong AND csdn.Thang = @Thang AND csdn.Nam = @Nam AND csdn.IsDeleted = 0
    WHERE t.IsDeleted = 0
    GROUP BY t.MaToaNha, t.TenToaNha
    ORDER BY t.TenToaNha;
END;
GO

-- sp_BaoCaoKyLuat - Báo cáo kỷ luật sinh viên (chi tiết từng kỷ luật)
CREATE OR ALTER PROCEDURE sp_BaoCaoKyLuat
    @Thang INT = NULL,
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Thang IS NULL SET @Thang = MONTH(GETDATE());
    IF @Nam IS NULL SET @Nam = YEAR(GETDATE());
    
    SELECT 
        s.MaSinhVien,
        s.HoTen,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha,
        kl.MaKyLuat,
        kl.LoaiViPham,
        kl.MoTa,
        kl.NgayViPham,
        kl.MucPhat,
        kl.TrangThai
    FROM SinhVien s
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    INNER JOIN KyLuat kl ON s.MaSinhVien = kl.MaSinhVien AND kl.IsDeleted = 0
        AND MONTH(kl.NgayViPham) = @Thang AND YEAR(kl.NgayViPham) = @Nam
    WHERE s.IsDeleted = 0
    ORDER BY kl.NgayViPham DESC, s.HoTen;
END;
GO

-- =============================================
-- ALIASES FOR COMPATIBILITY
-- =============================================

-- Aliases for existing procedures to match controller calls
CREATE OR ALTER PROCEDURE sp_SinhVien_Insert
    @HoTen NVARCHAR(200),
    @MSSV NVARCHAR(20),
    @Lop NVARCHAR(50),
    @Khoa NVARCHAR(100),
    @NgaySinh DATETIME = NULL,
    @GioiTinh NVARCHAR(10) = NULL,
    @SDT NVARCHAR(15) = NULL,
    @Email NVARCHAR(100) = NULL,
    @DiaChi NVARCHAR(500) = NULL,
    @AnhDaiDien NVARCHAR(500) = NULL,
    @TrangThai BIT = 1,
    @MaPhong INT = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_SinhVien_Create @HoTen, @MSSV, @Lop, @Khoa, @NgaySinh, @GioiTinh, @SDT, @Email, @DiaChi, @AnhDaiDien, @TrangThai, @MaPhong, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_HoaDon_GenerateMonthly
    @Thang INT,
    @Nam INT,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_TaoHoaDonHangThang @Thang, @Nam, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_MucPhi_GetByType
    @LoaiPhi NVARCHAR(50),
    @Thang INT = NULL,
    @Nam INT = NULL
AS
BEGIN
    -- Chỉ truyền @LoaiPhi vì sp_MucPhi_GetByLoaiPhi chỉ nhận 1 parameter
    EXEC sp_MucPhi_GetByLoaiPhi @LoaiPhi;
END;
GO

-- sp_ChiSoDienNuoc_Insert - Alias for sp_ChiSoDienNuoc_Create
IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_ChiSoDienNuoc_Insert' AND schema_id = SCHEMA_ID('dbo'))
    DROP PROCEDURE sp_ChiSoDienNuoc_Insert;
GO

CREATE PROCEDURE sp_ChiSoDienNuoc_Insert
    @MaPhong INT,
    @Thang INT,
    @Nam INT,
    @ChiSoDien INT,
    @ChiSoNuoc INT,
    @NgayGhi DATETIME = NULL,
    @NguoiGhi NVARCHAR(100) = NULL,
    @TrangThai NVARCHAR(50) = 'Đã ghi',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    EXEC sp_ChiSoDienNuoc_Create 
        @MaPhong = @MaPhong,
        @Thang = @Thang,
        @Nam = @Nam,
        @ChiSoDien = @ChiSoDien,
        @ChiSoNuoc = @ChiSoNuoc,
        @NguoiGhi = @NguoiGhi,
        @TrangThai = @TrangThai,
        @GhiChu = @GhiChu,
        @NguoiTao = @NguoiTao;
END;
GO

-- Stored Procedures cho BacGia
CREATE OR ALTER PROCEDURE sp_BacGia_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaBac, Loai, ThuTu, TuSo, DenSo, DonGia, TrangThai, NguoiTao, NgayTao, NguoiCapNhat, NgayCapNhat
    FROM BacGia
    WHERE IsDeleted = 0
    ORDER BY Loai, ThuTu;
END;
GO

CREATE OR ALTER PROCEDURE sp_BacGia_GetById
    @MaBac INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaBac, Loai, ThuTu, TuSo, DenSo, DonGia, TrangThai, NguoiTao, NgayTao, NguoiCapNhat, NgayCapNhat
    FROM BacGia
    WHERE MaBac = @MaBac AND IsDeleted = 0;
END;
GO

CREATE OR ALTER PROCEDURE sp_BacGia_Create
    @Loai NVARCHAR(50),
    @ThuTu INT,
    @TuSo INT,
    @DenSo INT,
    @DonGia DECIMAL(18,2),
    @TrangThai BIT = 1,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO BacGia (Loai, ThuTu, TuSo, DenSo, DonGia, TrangThai, NguoiTao, NgayTao)
    VALUES (@Loai, @ThuTu, @TuSo, @DenSo, @DonGia, @TrangThai, @NguoiTao, GETDATE());
    
    SELECT SCOPE_IDENTITY() AS MaBac;
END;
GO

CREATE OR ALTER PROCEDURE sp_BacGia_Update
    @MaBac INT,
    @Loai NVARCHAR(50),
    @ThuTu INT,
    @TuSo INT,
    @DenSo INT,
    @DonGia DECIMAL(18,2),
    @TrangThai BIT = 1,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE BacGia
    SET Loai = @Loai,
        ThuTu = @ThuTu,
        TuSo = @TuSo,
        DenSo = @DenSo,
        DonGia = @DonGia,
        TrangThai = @TrangThai,
        NguoiCapNhat = @NguoiCapNhat,
        NgayCapNhat = GETDATE()
    WHERE MaBac = @MaBac AND IsDeleted = 0;
END;
GO

CREATE OR ALTER PROCEDURE sp_BacGia_Delete
    @MaBac INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE BacGia
    SET IsDeleted = 1,
        NguoiCapNhat = @NguoiCapNhat,
        NgayCapNhat = GETDATE()
    WHERE MaBac = @MaBac;
END;
GO

CREATE OR ALTER PROCEDURE sp_BacGia_GetByLoaiPhi
    @Loai NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaBac, Loai, ThuTu, TuSo, DenSo, DonGia, TrangThai, NguoiTao, NgayTao, NguoiCapNhat, NgayCapNhat
    FROM BacGia
    WHERE Loai = @Loai AND IsDeleted = 0
    ORDER BY ThuTu;
END;
GO

-- Alias cho BacGia
CREATE OR ALTER PROCEDURE sp_BacGia_Insert
    @Loai NVARCHAR(50),
    @ThuTu INT,
    @TuSo INT,
    @DenSo INT,
    @DonGia DECIMAL(18,2),
    @TrangThai BIT = 1,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_BacGia_Create @Loai, @ThuTu, @TuSo, @DenSo, @DonGia, @TrangThai, @NguoiTao;
END;
GO

-- Thêm các aliases còn thiếu
CREATE OR ALTER PROCEDURE sp_ToaNha_Insert
    @TenToaNha NVARCHAR(200),
    @DiaChi NVARCHAR(500) = NULL,
    @SoTang INT = NULL,
    @MoTa NVARCHAR(1000) = NULL,
    @TrangThai BIT = 1,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_ToaNha_Create @TenToaNha, @DiaChi, @SoTang, @MoTa, @TrangThai, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_Phong_Insert
    @MaToaNha INT,
    @SoPhong NVARCHAR(20),
    @SoGiuong INT,
    @LoaiPhong NVARCHAR(50),
    @GiaPhong DECIMAL(18,2),
    @MoTa NVARCHAR(500) = NULL,
    @TrangThai NVARCHAR(50) = 'Trống',
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_Phong_Create @MaToaNha, @SoPhong, @SoGiuong, @LoaiPhong, @GiaPhong, @MoTa, @TrangThai, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_Giuong_Insert
    @MaPhong INT,
    @SoGiuong NVARCHAR(10),
    @TrangThai NVARCHAR(50) = 'Trống',
    @MoTa NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_Giuong_Create @MaPhong, @SoGiuong, @TrangThai, @MoTa, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_TaiKhoan_Insert
    @TenDangNhap NVARCHAR(100),
    @MatKhau NVARCHAR(500),
    @HoTen NVARCHAR(200),
    @Email NVARCHAR(100) = NULL,
    @VaiTro NVARCHAR(50) = 'Student',
    @TrangThai BIT = 1,
    @MaSinhVien INT = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_TaiKhoan_Create @TenDangNhap, @MatKhau, @HoTen, @Email, @VaiTro, @TrangThai, @MaSinhVien, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_MucPhi_Insert
    @TenMucPhi NVARCHAR(200),
    @LoaiPhi NVARCHAR(50),
    @GiaTien DECIMAL(18,2),
    @DonVi NVARCHAR(50),
    @TrangThai BIT = 1,
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_MucPhi_Create @TenMucPhi, @LoaiPhi, @GiaTien, @DonVi, @TrangThai, @GhiChu, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_HopDong_Insert
    @MaSinhVien INT,
    @MaGiuong INT,
    @NgayBatDau DATE,
    @NgayKetThuc DATE,
    @GiaPhong DECIMAL(18,2),
    @TrangThai NVARCHAR(50) = 'Chờ duyệt',
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_HopDong_Create @MaSinhVien, @MaGiuong, @NgayBatDau, @NgayKetThuc, @GiaPhong, @TrangThai, @GhiChu, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_HoaDon_Insert
    @MaSinhVien INT,
    @MaPhong INT = NULL,
    @MaHopDong INT = NULL,
    @Thang INT,
    @Nam INT,
    @TongTien DECIMAL(18,2),
    @TrangThai NVARCHAR(50) = 'Chưa thanh toán',
    @HanThanhToan DATE = NULL,
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    EXEC sp_HoaDon_Create 
        @MaSinhVien = @MaSinhVien,
        @MaPhong = @MaPhong,
        @MaHopDong = @MaHopDong,
        @Thang = @Thang,
        @Nam = @Nam,
        @TongTien = @TongTien,
        @TrangThai = @TrangThai,
        @HanThanhToan = @HanThanhToan,
        @NgayThanhToan = NULL,
        @GhiChu = @GhiChu,
        @NguoiTao = @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_BienLaiThu_Insert
    @MaHoaDon INT,
    @SoTienThu DECIMAL(18,2),
    @NgayThu DATE,
    @PhuongThucThanhToan NVARCHAR(50) = 'Tiền mặt',
    @NguoiThu NVARCHAR(100),
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_BienLaiThu_Create @MaHoaDon, @SoTienThu, @NgayThu, @PhuongThucThanhToan, @NguoiThu, @GhiChu, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_KyLuat_Insert
    @MaSinhVien INT,
    @LoaiViPham NVARCHAR(100),
    @MoTa NVARCHAR(1000),
    @NgayViPham DATE,
    @MucPhat DECIMAL(18,2),
    @TrangThai NVARCHAR(50) = 'Chưa xử lý',
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    EXEC sp_KyLuat_Create @MaSinhVien, @LoaiViPham, @MoTa, @NgayViPham, @MucPhat, @TrangThai, @GhiChu, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_Insert
    @MaSinhVien INT,
    @Thang INT,
    @Nam INT,
    @DiemSo DECIMAL(5,2),
    @XepLoai NVARCHAR(50) = 'Không xếp loại',
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_DiemRenLuyen_Create @MaSinhVien, @Thang, @Nam, @DiemSo, @XepLoai, @GhiChu, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_DonDangKy_Insert
    @MaSinhVien INT,
    @MaPhongDeXuat INT = NULL,
    @LyDo NVARCHAR(1000) = NULL,
    @NgayDangKy DATE = NULL,
    @TrangThai NVARCHAR(50) = 'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    -- Nếu không có @NgayDangKy, dùng ngày hiện tại
    IF @NgayDangKy IS NULL
        SET @NgayDangKy = CAST(GETDATE() AS DATE);
    
    EXEC sp_DonDangKy_Create @MaSinhVien, @MaPhongDeXuat, @LyDo, @NgayDangKy, @TrangThai, @GhiChu, @NguoiTao;
END;
GO

CREATE OR ALTER PROCEDURE sp_YeuCauChuyenPhong_Insert
    @MaSinhVien INT,
    @PhongHienTai INT,
    @PhongMongMuon INT = NULL,
    @LyDo NVARCHAR(1000),
    @NgayYeuCau DATE = NULL,
    @TrangThai NVARCHAR(50) = 'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    -- Nếu không có @NgayYeuCau, dùng ngày hiện tại
    IF @NgayYeuCau IS NULL
        SET @NgayYeuCau = CAST(GETDATE() AS DATE);
    
    EXEC sp_YeuCauChuyenPhong_Create @MaSinhVien, @PhongHienTai, @PhongMongMuon, @LyDo, @NgayYeuCau, @TrangThai, @GhiChu, @NguoiTao;
END;
GO


PRINT 'Database setup completed successfully!';
PRINT 'Tables created successfully!';
PRINT 'Constraints created successfully!';
PRINT 'Indexes created successfully!';
PRINT 'Seed data inserted successfully!';
PRINT 'Stored Procedures created successfully!';
PRINT 'Business Logic Procedures created successfully!';
PRINT 'Aliases created successfully!';
PRINT 'BacGia Procedures created successfully!';
PRINT 'CauHinhPhi Procedures created successfully!';
PRINT 'Additional Aliases created successfully!';
