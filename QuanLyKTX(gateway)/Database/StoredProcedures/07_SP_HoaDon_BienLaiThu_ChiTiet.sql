-- =============================================
-- Script Name: 07_SP_HoaDon_BienLaiThu_ChiTiet.sql
-- Description: Stored Procedures cho HoaDon, BienLaiThu, ChiTietHoaDon
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
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
    @TrangThai NVARCHAR(50) = N'Chưa thanh toán',
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
    @TrangThai NVARCHAR(50) = N'Chưa thanh toán',
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
    
    DECLARE @TongTienHoaDon DECIMAL(18,2);
    DECLARE @TongDaThu DECIMAL(18,2);
    DECLARE @MaBienLai INT;
    
    -- Lấy tổng tiền hóa đơn
    SELECT @TongTienHoaDon = TongTien
    FROM HoaDon
    WHERE MaHoaDon = @MaHoaDon AND IsDeleted = 0;
    
    IF @TongTienHoaDon IS NULL
    BEGIN
        RAISERROR(N'Không tìm thấy hóa đơn', 16, 1);
        RETURN;
    END
    
    -- Tạo biên lai
    INSERT INTO BienLaiThu (MaHoaDon, SoTienThu, NgayThu, PhuongThucThanhToan, NguoiThu, GhiChu, NguoiTao)
    VALUES (@MaHoaDon, @SoTienThu, @NgayThu, @PhuongThucThanhToan, @NguoiThu, @GhiChu, @NguoiTao);
    
    SET @MaBienLai = SCOPE_IDENTITY();
    
    -- Tính tổng số tiền đã thu (bao gồm biên lai vừa tạo)
    SELECT @TongDaThu = ISNULL(SUM(SoTienThu), 0)
    FROM BienLaiThu
    WHERE MaHoaDon = @MaHoaDon AND IsDeleted = 0;
    
    -- Cập nhật trạng thái hóa đơn dựa trên tổng số tiền đã thu
    IF @TongDaThu >= @TongTienHoaDon
    BEGIN
        -- Đã thanh toán đủ
        UPDATE HoaDon 
        SET TrangThai = N'Đã thanh toán',
            NgayThanhToan = @NgayThu,
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = @NguoiTao
        WHERE MaHoaDon = @MaHoaDon AND IsDeleted = 0;
    END
    ELSE
    BEGIN
        -- Chưa thanh toán đủ — giữ trạng thái hiện tại (Chưa thanh toán / Quá hạn)
        UPDATE HoaDon 
        SET NgayCapNhat = GETDATE(),
            NguoiCapNhat = @NguoiTao
        WHERE MaHoaDon = @MaHoaDon AND IsDeleted = 0;
    END
    
    SELECT @MaBienLai AS MaBienLai;
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
-- ALIASES
-- =============================================

-- sp_HoaDon_Insert (Alias for Create)
CREATE OR ALTER PROCEDURE sp_HoaDon_Insert
    @MaSinhVien INT,
    @MaPhong INT = NULL,
    @MaHopDong INT = NULL,
    @Thang INT,
    @Nam INT,
    @TongTien DECIMAL(18,2),
    @TrangThai NVARCHAR(50) = N'Chưa thanh toán',
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

-- sp_BienLaiThu_Insert (Alias for Create)
CREATE OR ALTER PROCEDURE sp_BienLaiThu_Insert
    @MaHoaDon INT,
    @SoTienThu DECIMAL(18,2),
    @NgayThu DATE,
    @PhuongThucThanhToan NVARCHAR(50) = N'Tiền mặt',
    @NguoiThu NVARCHAR(100),
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_BienLaiThu_Create @MaHoaDon, @SoTienThu, @NgayThu, @PhuongThucThanhToan, @NguoiThu, @GhiChu, @NguoiTao;
END;
GO

