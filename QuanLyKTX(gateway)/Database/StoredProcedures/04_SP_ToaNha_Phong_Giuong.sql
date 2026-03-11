-- =============================================
-- Script Name: 04_SP_ToaNha_Phong_Giuong.sql
-- Description: Stored Procedures cho ToaNha, Phong, Giuong
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
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
    @TrangThai NVARCHAR(50) = N'Trống',
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
    @TrangThai NVARCHAR(50) = N'Trống',
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
    WHERE p.IsDeleted = 0 AND p.TrangThai = N'Trống'
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
    @TrangThai NVARCHAR(50) = N'Trống',
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
    @TrangThai NVARCHAR(50) = N'Trống',
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
-- ALIASES
-- =============================================

-- sp_ToaNha_Insert (Alias for Create)
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

-- sp_Phong_Insert (Alias for Create)
CREATE OR ALTER PROCEDURE sp_Phong_Insert
    @MaToaNha INT,
    @SoPhong NVARCHAR(20),
    @SoGiuong INT,
    @LoaiPhong NVARCHAR(50),
    @GiaPhong DECIMAL(18,2),
    @MoTa NVARCHAR(500) = NULL,
    @TrangThai NVARCHAR(50) = N'Trống',
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_Phong_Create @MaToaNha, @SoPhong, @SoGiuong, @LoaiPhong, @GiaPhong, @MoTa, @TrangThai, @NguoiTao;
END;
GO

-- sp_Giuong_Insert (Alias for Create)
CREATE OR ALTER PROCEDURE sp_Giuong_Insert
    @MaPhong INT,
    @SoGiuong NVARCHAR(10),
    @TrangThai NVARCHAR(50) = N'Trống',
    @MoTa NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_Giuong_Create @MaPhong, @SoGiuong, @TrangThai, @MoTa, @NguoiTao;
END;
GO

