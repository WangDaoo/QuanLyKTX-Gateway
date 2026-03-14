-- =============================================
-- Script Name: 10_SP_DonDangKy_YeuCauChuyenPhong.sql
-- Description: Stored Procedures cho DonDangKy và YeuCauChuyenPhong
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
GO

-- =============================================
-- STORED PROCEDURES - DON DANG KY CRUD
-- =============================================

-- sp_DonDangKy_GetAll
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DonDangKy_GetAll]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DonDangKy_GetAll]
GO
CREATE PROCEDURE sp_DonDangKy_GetAll
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
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DonDangKy_GetById]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DonDangKy_GetById]
GO
CREATE PROCEDURE sp_DonDangKy_GetById
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
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DonDangKy_Create]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DonDangKy_Create]
GO
CREATE PROCEDURE sp_DonDangKy_Create
    @MaSinhVien INT,
    @MaPhongDeXuat INT = NULL,
    @LyDo NVARCHAR(1000) = NULL,
    @NgayDangKy DATE,
    @TrangThai NVARCHAR(50) = N'Chờ duyệt',
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
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DonDangKy_Update]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DonDangKy_Update]
GO
CREATE PROCEDURE sp_DonDangKy_Update
    @MaDon INT,
    @MaSinhVien INT,
    @MaPhongDeXuat INT = NULL,
    @LyDo NVARCHAR(1000) = NULL,
    @NgayDangKy DATE,
    @TrangThai NVARCHAR(50) = N'Chờ duyệt',
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
        -- Validate: Kiểm tra sinh viên chưa có hợp đồng hiệu lực
        IF EXISTS (
            SELECT 1 FROM HopDong 
            WHERE MaSinhVien = @MaSinhVien 
                AND TrangThai = N'Có hiệu lực' 
                AND IsDeleted = 0
        )
        BEGIN
            -- Sinh viên đã có HĐ hiệu lực, cập nhật lại trạng thái đơn về "Từ chối"
            UPDATE DonDangKy 
            SET TrangThai = N'Từ chối',
                GhiChu = ISNULL(@GhiChu + N' | ', N'') + N'Tự động từ chối: Sinh viên đã có hợp đồng đang có hiệu lực',
                NgayCapNhat = GETDATE(),
                NguoiCapNhat = @NguoiCapNhat
            WHERE MaDon = @MaDon AND IsDeleted = 0;
            
            RAISERROR(N'Sinh viên đã có hợp đồng đang có hiệu lực, không thể duyệt đơn đăng ký', 16, 1);
            RETURN;
        END
        
        BEGIN TRAN;
        
        BEGIN TRY
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
                SET @GhiChuHopDong = CAST(N'Tự động tạo từ đơn đăng ký số ' AS NVARCHAR(1000)) + CAST(@MaDon AS NVARCHAR(10));
                
                -- Tạo hợp đồng ở trạng thái "Chờ duyệt"
                -- Giường và phòng sẽ chỉ được cập nhật khi HĐ được xác nhận (sp_HopDong_Confirm)
                INSERT INTO HopDong (MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, NguoiTao)
                VALUES (@MaSinhVien, @MaGiuong, @NgayBatDau, @NgayKetThuc, @GiaPhong, N'Chờ duyệt', @GhiChuHopDong, @NguoiCapNhat);
            END
            
            COMMIT TRAN;
        END TRY
        BEGIN CATCH
            ROLLBACK TRAN;
            THROW;
        END CATCH
    END
END;
GO

-- sp_DonDangKy_Delete
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DonDangKy_Delete]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DonDangKy_Delete]
GO
CREATE PROCEDURE sp_DonDangKy_Delete
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
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DonDangKy_GetBySinhVien]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DonDangKy_GetBySinhVien]
GO
CREATE PROCEDURE sp_DonDangKy_GetBySinhVien
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
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_YeuCauChuyenPhong_GetAll]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_YeuCauChuyenPhong_GetAll]
GO
CREATE PROCEDURE sp_YeuCauChuyenPhong_GetAll
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
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_YeuCauChuyenPhong_GetById]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_YeuCauChuyenPhong_GetById]
GO
CREATE PROCEDURE sp_YeuCauChuyenPhong_GetById
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
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_YeuCauChuyenPhong_Create]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_YeuCauChuyenPhong_Create]
GO
CREATE PROCEDURE sp_YeuCauChuyenPhong_Create
    @MaSinhVien INT,
    @PhongHienTai INT,
    @PhongMongMuon INT = NULL,
    @LyDo NVARCHAR(1000),
    @NgayYeuCau DATE,
    @TrangThai NVARCHAR(50) = N'Chờ duyệt',
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
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_YeuCauChuyenPhong_Update]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_YeuCauChuyenPhong_Update]
GO
CREATE PROCEDURE sp_YeuCauChuyenPhong_Update
    @MaYeuCau INT,
    @MaSinhVien INT,
    @PhongHienTai INT,
    @PhongMongMuon INT = NULL,
    @LyDo NVARCHAR(1000),
    @NgayYeuCau DATE,
    @TrangThai NVARCHAR(50) = N'Chờ duyệt',
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
            
            -- Cập nhật hợp đồng nếu có: Giường mới
            IF @MaHopDong IS NOT NULL
            BEGIN
                UPDATE HopDong
                SET MaGiuong = @GiuongMoi,
                    GhiChu = ISNULL(GhiChu + N' | ', N'') + N'Đã chuyển phòng từ yêu cầu số ' + CAST(@MaYeuCau AS NVARCHAR(10)),
                    NgayCapNhat = GETDATE(),
                    NguoiCapNhat = @NguoiCapNhat
                WHERE MaHopDong = @MaHopDong AND IsDeleted = 0;
                
                -- Cập nhật MaPhong của sinh viên vì hợp đồng đã có hiệu lực
                -- (MaPhong phải luôn đồng bộ với giường trong hợp đồng có hiệu lực)
                UPDATE SinhVien
                SET MaPhong = @PhongMongMuon,
                    NgayCapNhat = GETDATE(),
                    NguoiCapNhat = @NguoiCapNhat
                WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
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
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_YeuCauChuyenPhong_Delete]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_YeuCauChuyenPhong_Delete]
GO
CREATE PROCEDURE sp_YeuCauChuyenPhong_Delete
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
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_YeuCauChuyenPhong_GetBySinhVien]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_YeuCauChuyenPhong_GetBySinhVien]
GO
CREATE PROCEDURE sp_YeuCauChuyenPhong_GetBySinhVien
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
-- ALIASES
-- =============================================

-- sp_DonDangKy_Insert (Alias for Create)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DonDangKy_Insert]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DonDangKy_Insert]
GO
CREATE PROCEDURE sp_DonDangKy_Insert
    @MaSinhVien INT,
    @MaPhongDeXuat INT = NULL,
    @LyDo NVARCHAR(1000) = NULL,
    @NgayDangKy DATE = NULL,
    @TrangThai NVARCHAR(50) = N'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Nếu không có @NgayDangKy, dùng ngày hiện tại
    IF @NgayDangKy IS NULL
        SET @NgayDangKy = CAST(GETDATE() AS DATE);
    
    -- Thực hiện logic trực tiếp thay vì gọi stored procedure khác
    INSERT INTO DonDangKy (MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @MaPhongDeXuat, @LyDo, @NgayDangKy, @TrangThai, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaDon;
END;
GO

-- sp_YeuCauChuyenPhong_Insert (Alias for Create)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_YeuCauChuyenPhong_Insert]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_YeuCauChuyenPhong_Insert]
GO
CREATE PROCEDURE sp_YeuCauChuyenPhong_Insert
    @MaSinhVien INT,
    @PhongHienTai INT,
    @PhongMongMuon INT = NULL,
    @LyDo NVARCHAR(1000),
    @NgayYeuCau DATE = NULL,
    @TrangThai NVARCHAR(50) = N'Chờ duyệt',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Nếu không có @NgayYeuCau, dùng ngày hiện tại
    IF @NgayYeuCau IS NULL
        SET @NgayYeuCau = CAST(GETDATE() AS DATE);
    
    -- Thực hiện logic trực tiếp thay vì gọi stored procedure khác
    INSERT INTO YeuCauChuyenPhong (MaSinhVien, PhongHienTai, PhongMongMuon, LyDo, NgayYeuCau, TrangThai, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @PhongHienTai, @PhongMongMuon, @LyDo, @NgayYeuCau, @TrangThai, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaYeuCau;
END;
GO

