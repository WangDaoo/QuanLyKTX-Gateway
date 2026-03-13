-- =============================================
-- Script Name: 09_SP_ChiSoDienNuoc.sql
-- Description: Stored Procedures cho ChiSoDienNuoc
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
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
    @TrangThai NVARCHAR(50) = N'Đã ghi',
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
    @TrangThai NVARCHAR(50) = N'Đã ghi',
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
-- ALIASES
-- =============================================

-- sp_ChiSoDienNuoc_Insert (Alias for Create)
-- Xóa procedure cũ nếu tồn tại để tránh xung đột
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
    @TrangThai NVARCHAR(50) = N'Đã ghi',
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

