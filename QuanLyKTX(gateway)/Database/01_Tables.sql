-- =============================================
-- Script Name: 01_Tables.sql
-- Description: Tất cả các bảng trong hệ thống
-- Author: KTX System
-- Created: 2024
-- =============================================

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
        TrangThai NVARCHAR(50) DEFAULT N'Trống',
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
        TrangThai NVARCHAR(50) DEFAULT N'Trống',
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
        TrangThai NVARCHAR(50) DEFAULT N'Chưa xử lý',
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
        TrangThai NVARCHAR(50) DEFAULT N'Đã ghi',
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

