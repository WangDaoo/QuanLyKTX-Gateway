-- =============================================
-- Script Name: 06_SP_HopDong.sql
-- Description: Stored Procedures cho HopDong
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
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
    @TrangThai NVARCHAR(50) = N'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate: Kiểm tra giường có tồn tại và đang trống
    DECLARE @TrangThaiGiuong NVARCHAR(50);
    SELECT @TrangThaiGiuong = TrangThai
    FROM Giuong
    WHERE MaGiuong = @MaGiuong AND IsDeleted = 0;
    
    IF @TrangThaiGiuong IS NULL
    BEGIN
        RAISERROR(N'Giường không tồn tại hoặc đã bị xóa', 16, 1);
        RETURN;
    END
    
    IF @TrangThaiGiuong != N'Trống'
    BEGIN
        RAISERROR(N'Giường đã có người ở hoặc đang được giữ chỗ, không thể tạo hợp đồng', 16, 1);
        RETURN;
    END
    
    -- Validate: Kiểm tra sinh viên chưa có hợp đồng hiệu lực
    IF EXISTS (
        SELECT 1 FROM HopDong 
        WHERE MaSinhVien = @MaSinhVien 
            AND TrangThai = N'Có hiệu lực' 
            AND IsDeleted = 0
    )
    BEGIN
        RAISERROR(N'Sinh viên đã có hợp đồng đang có hiệu lực, không thể tạo hợp đồng mới', 16, 1);
        RETURN;
    END
    
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
    @TrangThai NVARCHAR(50) = N'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TrangThaiCu NVARCHAR(50);
    DECLARE @MaGiuongCu INT;
    DECLARE @MaPhongCu INT;
    
    -- Lấy trạng thái cũ và thông tin giường
    SELECT @TrangThaiCu = TrangThai, @MaGiuongCu = MaGiuong
    FROM HopDong
    WHERE MaHopDong = @MaHopDong AND IsDeleted = 0;
    
    -- Nếu hợp đồng đang có hiệu lực và bị chuyển sang trạng thái khác (hủy, hết hạn)
    -- thì xóa MaPhong của sinh viên
    IF @TrangThaiCu = N'Có hiệu lực' AND @TrangThai != N'Có hiệu lực'
    BEGIN
        -- Lấy thông tin phòng từ giường cũ
        SELECT @MaPhongCu = MaPhong
        FROM Giuong
        WHERE MaGiuong = @MaGiuongCu AND IsDeleted = 0;
        
        -- Xóa MaPhong của sinh viên
        UPDATE SinhVien
        SET MaPhong = NULL,
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = @NguoiCapNhat
        WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
        
        -- Cập nhật trạng thái giường về "Trống"
        IF @MaGiuongCu IS NOT NULL
        BEGIN
            UPDATE Giuong
            SET TrangThai = N'Trống',
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaGiuong = @MaGiuongCu AND IsDeleted = 0;
        END
        
        -- Cập nhật trạng thái phòng về "Trống" nếu không còn giường nào có người
        IF @MaPhongCu IS NOT NULL
        BEGIN
            UPDATE Phong
            SET TrangThai = CASE 
                                WHEN (SELECT COUNT(*) FROM Giuong WHERE MaPhong = @MaPhongCu AND TrangThai != N'Trống' AND IsDeleted = 0) = 0 
                                THEN N'Trống' 
                                ELSE TrangThai 
                            END,
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaPhong = @MaPhongCu AND IsDeleted = 0;
        END
    END
    
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
    DECLARE @TrangThaiCu NVARCHAR(50);
    DECLARE @MaSinhVien INT;
    DECLARE @MaGiuongCu INT;
    DECLARE @MaPhongCu INT;
    
    -- Lấy thông tin hợp đồng trước khi xóa
    SELECT @TrangThaiCu = TrangThai, @MaSinhVien = MaSinhVien, @MaGiuongCu = MaGiuong
    FROM HopDong
    WHERE MaHopDong = @MaHopDong AND IsDeleted = 0;
    
    -- Nếu hợp đồng đang có hiệu lực, xóa MaPhong của sinh viên
    IF @TrangThaiCu = N'Có hiệu lực'
    BEGIN
        -- Lấy thông tin phòng từ giường
        SELECT @MaPhongCu = MaPhong
        FROM Giuong
        WHERE MaGiuong = @MaGiuongCu AND IsDeleted = 0;
        
        -- Xóa MaPhong của sinh viên
        UPDATE SinhVien
        SET MaPhong = NULL,
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = @NguoiCapNhat
        WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
        
        -- Cập nhật trạng thái giường về "Trống"
        IF @MaGiuongCu IS NOT NULL
        BEGIN
            UPDATE Giuong
            SET TrangThai = N'Trống',
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaGiuong = @MaGiuongCu AND IsDeleted = 0;
        END
        
        -- Cập nhật trạng thái phòng về "Trống" nếu không còn giường nào có người
        IF @MaPhongCu IS NOT NULL
        BEGIN
            UPDATE Phong
            SET TrangThai = CASE 
                                WHEN (SELECT COUNT(*) FROM Giuong WHERE MaPhong = @MaPhongCu AND TrangThai != N'Trống' AND IsDeleted = 0) = 0 
                                THEN N'Trống' 
                                ELSE TrangThai 
                            END,
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaPhong = @MaPhongCu AND IsDeleted = 0;
        END
    END
    
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

-- sp_HopDong_GetCurrentBySinhVien
-- Lấy hợp đồng hiện tại có hiệu lực của sinh viên
CREATE OR ALTER PROCEDURE sp_HopDong_GetCurrentBySinhVien
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
    WHERE hd.MaSinhVien = @MaSinhVien 
        AND hd.IsDeleted = 0
        AND hd.TrangThai = N'Có hiệu lực'
        AND GETDATE() BETWEEN hd.NgayBatDau AND hd.NgayKetThuc
    ORDER BY hd.NgayBatDau DESC;
END;
GO

-- sp_HopDong_Extend
-- Gia hạn hợp đồng (tăng thêm số tháng)
CREATE OR ALTER PROCEDURE sp_HopDong_Extend
    @MaHopDong INT,
    @SoThangGiaHan INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NgayKetThucCu DATE;
    DECLARE @NgayKetThucMoi DATE;
    
    -- Lấy ngày kết thúc hiện tại
    SELECT @NgayKetThucCu = NgayKetThuc
    FROM HopDong
    WHERE MaHopDong = @MaHopDong AND IsDeleted = 0;
    
    IF @NgayKetThucCu IS NULL
    BEGIN
        RAISERROR(N'Không tìm thấy hợp đồng', 16, 1);
        RETURN;
    END
    
    -- Tính ngày kết thúc mới
    SET @NgayKetThucMoi = DATEADD(MONTH, @SoThangGiaHan, @NgayKetThucCu);
    
    -- Cập nhật hợp đồng
    UPDATE HopDong 
    SET NgayKetThuc = @NgayKetThucMoi,
        GhiChu = ISNULL(GhiChu + N' | ', N'') + N'Gia hạn thêm ' + CAST(@SoThangGiaHan AS NVARCHAR(10)) + N' tháng',
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaHopDong = @MaHopDong AND IsDeleted = 0;
    
    SELECT @NgayKetThucMoi AS NgayKetThucMoi;
END;
GO

-- sp_HopDong_Confirm
-- Xác nhận hợp đồng (chuyển từ "Chờ duyệt" sang "Có hiệu lực")
CREATE OR ALTER PROCEDURE sp_HopDong_Confirm
    @MaHopDong INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TrangThaiCu NVARCHAR(50);
    DECLARE @MaGiuong INT;
    DECLARE @MaPhong INT;
    DECLARE @MaSinhVien INT;
    DECLARE @TrangThaiGiuong NVARCHAR(50);
    
    -- Lấy trạng thái hiện tại và thông tin giường
    SELECT @TrangThaiCu = TrangThai, @MaGiuong = MaGiuong, @MaSinhVien = MaSinhVien
    FROM HopDong
    WHERE MaHopDong = @MaHopDong AND IsDeleted = 0;
    
    IF @TrangThaiCu IS NULL
    BEGIN
        RAISERROR(N'Không tìm thấy hợp đồng', 16, 1);
        RETURN;
    END
    
    -- Kiểm tra trạng thái hợp đồng phải là "Chờ duyệt"
    IF @TrangThaiCu != N'Chờ duyệt'
    BEGIN
        RAISERROR(N'Hợp đồng đã ở trạng thái ''%s'', không thể xác nhận', 16, 1, @TrangThaiCu);
        RETURN;
    END
    
    -- Validate: Kiểm tra giường vẫn còn trống (tránh race condition)
    SELECT @TrangThaiGiuong = TrangThai, @MaPhong = MaPhong
    FROM Giuong
    WHERE MaGiuong = @MaGiuong AND IsDeleted = 0;
    
    IF @TrangThaiGiuong IS NULL
    BEGIN
        RAISERROR(N'Giường không tồn tại hoặc đã bị xóa', 16, 1);
        RETURN;
    END
    
    IF @TrangThaiGiuong != N'Trống'
    BEGIN
        RAISERROR(N'Giường đã được nhận bởi hợp đồng khác, không thể xác nhận', 16, 1);
        RETURN;
    END
    
    -- Validate: Kiểm tra sinh viên chưa có HĐ hiệu lực khác
    IF EXISTS (
        SELECT 1 FROM HopDong 
        WHERE MaSinhVien = @MaSinhVien 
            AND MaHopDong != @MaHopDong
            AND TrangThai = N'Có hiệu lực' 
            AND IsDeleted = 0
    )
    BEGIN
        RAISERROR(N'Sinh viên đã có hợp đồng khác đang có hiệu lực', 16, 1);
        RETURN;
    END
    
    -- Bắt đầu transaction để đảm bảo atomic
    BEGIN TRAN;
    
    BEGIN TRY
        -- Cập nhật trạng thái hợp đồng
        UPDATE HopDong 
        SET TrangThai = N'Có hiệu lực',
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = @NguoiCapNhat
        WHERE MaHopDong = @MaHopDong AND IsDeleted = 0;
        
        -- Cập nhật trạng thái giường
        IF @MaGiuong IS NOT NULL
        BEGIN
            UPDATE Giuong
            SET TrangThai = N'Đã có người',
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaGiuong = @MaGiuong AND IsDeleted = 0;
        END
        
        -- Cập nhật trạng thái phòng (nếu không còn giường trống)
        IF @MaPhong IS NOT NULL
        BEGIN
            UPDATE Phong
            SET TrangThai = CASE 
                                WHEN (SELECT COUNT(*) FROM Giuong WHERE MaPhong = @MaPhong AND TrangThai = N'Trống' AND IsDeleted = 0) = 0 
                                THEN N'Đã đầy' 
                                ELSE TrangThai 
                            END,
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaPhong = @MaPhong AND IsDeleted = 0;
            
            -- Cập nhật MaPhong cho sinh viên khi hợp đồng được xác nhận
            IF @MaSinhVien IS NOT NULL
            BEGIN
                UPDATE SinhVien
                SET MaPhong = @MaPhong,
                    NgayCapNhat = GETDATE(),
                    NguoiCapNhat = @NguoiCapNhat
                WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
            END
        END
        
        COMMIT TRAN;
        SELECT N'Hợp đồng đã được xác nhận thành công' AS KetQua;
    END TRY
    BEGIN CATCH
        ROLLBACK TRAN;
        THROW;
    END CATCH
END;
GO

-- =============================================
-- ALIASES
-- =============================================

-- sp_HopDong_Insert (Alias for Create)
CREATE OR ALTER PROCEDURE sp_HopDong_Insert
    @MaSinhVien INT,
    @MaGiuong INT,
    @NgayBatDau DATE,
    @NgayKetThuc DATE,
    @GiaPhong DECIMAL(18,2),
    @TrangThai NVARCHAR(50) = N'Chờ duyệt',
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_HopDong_Create @MaSinhVien, @MaGiuong, @NgayBatDau, @NgayKetThuc, @GiaPhong, @TrangThai, @GhiChu, @NguoiTao;
END;
GO

