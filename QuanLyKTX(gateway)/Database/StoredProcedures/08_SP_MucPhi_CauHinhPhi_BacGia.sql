-- =============================================
-- Script Name: 08_SP_MucPhi_CauHinhPhi_BacGia.sql
-- Description: Stored Procedures cho MucPhi, CauHinhPhi, BacGia
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
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
-- STORED PROCEDURES - BAC GIA CRUD
-- =============================================

-- sp_BacGia_GetAll
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

-- sp_BacGia_GetById
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

-- sp_BacGia_Create
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

-- sp_BacGia_Update
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

-- sp_BacGia_Delete
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

-- sp_BacGia_GetByLoaiPhi
CREATE OR ALTER PROCEDURE sp_BacGia_GetByLoaiPhi
    @Loai NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaBac, Loai, ThuTu, TuSo, DenSo, DonGia, TrangThai, IsDeleted, NguoiTao, NgayTao, NguoiCapNhat, NgayCapNhat
    FROM BacGia
    WHERE Loai = @Loai AND IsDeleted = 0
    ORDER BY ThuTu;
END;
GO

-- =============================================
-- ALIASES
-- =============================================

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

-- sp_MucPhi_Insert (Alias for Create)
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

-- sp_BacGia_Insert (Alias for Create)
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

