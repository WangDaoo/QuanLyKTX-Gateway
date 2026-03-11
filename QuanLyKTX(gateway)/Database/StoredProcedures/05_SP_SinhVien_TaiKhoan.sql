-- =============================================
-- Script Name: 05_SP_SinhVien_TaiKhoan.sql
-- Description: Stored Procedures cho SinhVien và TaiKhoan
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
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
-- ALIASES
-- =============================================

-- sp_SinhVien_Insert (Alias for Create)
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

-- sp_TaiKhoan_Insert (Alias for Create)
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

