-- =============================================
-- Script Name: 12_SP_ThongBaoQuaHan.sql
-- Description: Stored Procedures cho ThongBaoQuaHan
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
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
    @TrangThai NVARCHAR(50) = N'Đã gửi',
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
    @TrangThai NVARCHAR(50) = N'Đã gửi',
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

