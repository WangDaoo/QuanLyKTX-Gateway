-- =============================================
-- Script Name: 13_SP_BusinessLogic.sql
-- Description: Stored Procedures cho Business Logic (Tính toán, Báo cáo)
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
GO

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
    WHERE Loai = N'Điện' AND TrangThai = 1 AND IsDeleted = 0
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
    WHERE Loai = N'Nước' AND TrangThai = 1 AND IsDeleted = 0
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
    SELECT s.MaSinhVien, s.MaPhong,
           ISNULL(s.HoTen, N'SinhVien_' + CAST(s.MaSinhVien AS NVARCHAR(10))) AS HoTen,
           ISNULL(s.MSSV, CAST(s.MaSinhVien AS NVARCHAR(20))) AS MSSV
    FROM SinhVien s
    WHERE s.IsDeleted = 0 AND s.MaPhong IS NOT NULL;

    DECLARE @MaSinhVien INT, @MaPhong INT, @HoTen NVARCHAR(200), @MSSV NVARCHAR(20);
    DECLARE @SoLuongHoaDon INT = 0;
    
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
        WHERE LoaiPhi = N'Phí phòng' AND TrangThai = 1 AND IsDeleted = 0;
        
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
        WHERE Loai = N'Điện' AND TrangThai = 1 AND IsDeleted = 0;
        
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
            WHERE Loai = N'Điện' AND TrangThai = 1 AND IsDeleted = 0
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
        WHERE Loai = N'Nước' AND TrangThai = 1 AND IsDeleted = 0;
        
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
            WHERE Loai = N'Nước' AND TrangThai = 1 AND IsDeleted = 0
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
        
        -- Kiểm tra xem hóa đơn cho sinh viên này trong tháng/năm này đã tồn tại chưa
        DECLARE @HoaDonDaTonTai INT = 0;
        SELECT @HoaDonDaTonTai = COUNT(*)
        FROM HoaDon
        WHERE MaSinhVien = @MaSinhVien AND Thang = @Thang AND Nam = @Nam AND IsDeleted = 0;
        
        -- Chỉ tạo hóa đơn nếu chưa tồn tại
        IF @HoaDonDaTonTai = 0
        BEGIN
        -- Tạo hóa đơn
        DECLARE @HanThanhToan DATE = DATEADD(DAY, 7, DATEFROMPARTS(@Nam, @Thang, DAY(EOMONTH(DATEFROMPARTS(@Nam, @Thang, 1)))));
        
        INSERT INTO HoaDon (MaSinhVien, MaPhong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayTao, NguoiTao)
            VALUES (@MaSinhVien, @MaPhong, @Thang, @Nam, @TongTien, N'Chưa thanh toán', @HanThanhToan, GETDATE(), @NguoiTao);
        
        SET @MaHoaDon = SCOPE_IDENTITY();
            SET @SoLuongHoaDon = @SoLuongHoaDon + 1;
        
        -- Tự động tạo thông báo hóa đơn cho sinh viên
        DECLARE @NoiDungThongBao NVARCHAR(1000);
        SET @NoiDungThongBao = N'Hóa đơn tháng ' + CAST(@Thang AS NVARCHAR(2)) + '/' + CAST(@Nam AS NVARCHAR(4)) + 
                               N' đã được tạo. Tổng tiền: ' + CAST(@TongTien AS NVARCHAR(20)) + 
                               N' VND. Hạn thanh toán: ' + FORMAT(@HanThanhToan, 'dd/MM/yyyy');
        
        INSERT INTO ThongBaoQuaHan (MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, NguoiTao)
            VALUES (@MaSinhVien, @MaHoaDon, GETDATE(), @NoiDungThongBao, N'Đã gửi', @NguoiTao);
        
        -- Tạo chi tiết hóa đơn
        IF @TongTienPhong > 0
        BEGIN
            INSERT INTO ChiTietHoaDon (MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien)
            SELECT @MaHoaDon, LoaiPhi, 1, GiaTien, GiaTien
            FROM MucPhi
                WHERE LoaiPhi = N'Phí phòng' AND TrangThai = 1 AND IsDeleted = 0;
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
        END;
        
        FETCH NEXT FROM sinhvien_cursor INTO @MaSinhVien, @MaPhong, @HoTen, @MSSV;
    END;
    
    CLOSE sinhvien_cursor;
    DEALLOCATE sinhvien_cursor;
    
    -- Trả về số lượng hóa đơn đã tạo
    SELECT @SoLuongHoaDon AS SoLuongHoaDon;
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
        SUM(CASE WHEN hd.TrangThai = N'Đã thanh toán' THEN hd.TongTien ELSE 0 END) AS DoanhThuDaThu,
        SUM(CASE WHEN hd.TrangThai = N'Chưa thanh toán' THEN hd.TongTien ELSE 0 END) AS DoanhThuChuaThu,
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
    INNER JOIN HoaDon hd ON s.MaSinhVien = hd.MaSinhVien AND hd.TrangThai = N'Chưa thanh toán' AND hd.IsDeleted = 0
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
        ISNULL(SUM(csdn.ChiSoDien), 0) AS TongSoDien,
        ISNULL(SUM(csdn.ChiSoNuoc), 0) AS TongSoNuoc,
        ISNULL(AVG(csdn.ChiSoDien), 0) AS TrungBinhDien,
        ISNULL(AVG(csdn.ChiSoNuoc), 0) AS TrungBinhNuoc
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

-- sp_HoaDon_GenerateMonthly (Alias for sp_TaoHoaDonHangThang)
CREATE OR ALTER PROCEDURE sp_HoaDon_GenerateMonthly
    @Thang INT,
    @Nam INT,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Chỉ trả về SELECT, không EXEC (tránh message text ảnh hưởng C# reader)
    EXEC sp_TaoHoaDonHangThang @Thang, @Nam, @NguoiTao;
    -- Không có gì khác
END;
GO

