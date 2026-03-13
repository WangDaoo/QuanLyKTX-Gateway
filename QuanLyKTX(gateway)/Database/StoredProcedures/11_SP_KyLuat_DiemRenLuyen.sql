-- =============================================
-- Script Name: 11_SP_KyLuat_DiemRenLuyen.sql
-- Description: Stored Procedures cho KyLuat và DiemRenLuyen
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
GO

-- =============================================
-- STORED PROCEDURES - KY LUAT CRUD
-- =============================================

-- sp_KyLuat_GetAll
CREATE OR ALTER PROCEDURE sp_KyLuat_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        kl.MaKyLuat,
        kl.MaSinhVien,
        kl.LoaiViPham,
        kl.MoTa,
        kl.NgayViPham,
        kl.MucPhat,
        kl.TrangThai,
        kl.GhiChu,
        kl.IsDeleted,
        kl.NgayTao,
        kl.NguoiTao,
        kl.NgayCapNhat,
        kl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM KyLuat kl
    INNER JOIN SinhVien s ON kl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE kl.IsDeleted = 0
    ORDER BY kl.NgayViPham DESC;
END;
GO

-- sp_KyLuat_GetById
CREATE OR ALTER PROCEDURE sp_KyLuat_GetById
    @MaKyLuat INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        kl.MaKyLuat,
        kl.MaSinhVien,
        kl.LoaiViPham,
        kl.MoTa,
        kl.NgayViPham,
        kl.MucPhat,
        kl.TrangThai,
        kl.GhiChu,
        kl.IsDeleted,
        kl.NgayTao,
        kl.NguoiTao,
        kl.NgayCapNhat,
        kl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM KyLuat kl
    INNER JOIN SinhVien s ON kl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE kl.MaKyLuat = @MaKyLuat AND kl.IsDeleted = 0;
END;
GO

-- sp_KyLuat_Create
CREATE OR ALTER PROCEDURE sp_KyLuat_Create
    @MaSinhVien INT,
    @LoaiViPham NVARCHAR(100),
    @MoTa NVARCHAR(1000),
    @NgayViPham DATE,
    @MucPhat DECIMAL(18,2) = 0,
    @TrangThai NVARCHAR(50) = N'Chưa xử lý',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaKyLuat INT;
    DECLARE @SoDiemTru DECIMAL(5,2) = 0;
    DECLARE @MaPhong INT;
    DECLARE @Thang INT = MONTH(@NgayViPham);
    DECLARE @Nam INT = YEAR(@NgayViPham);
    
    -- Tạo bản ghi kỷ luật
    INSERT INTO KyLuat (MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @LoaiViPham, @MoTa, @NgayViPham, @MucPhat, @TrangThai, @GhiChu, @NguoiTao);
    
    SET @MaKyLuat = SCOPE_IDENTITY();
    
    -- Xác định số điểm trừ dựa trên loại vi phạm (có thể mở rộng với bảng mapping)
    -- Mặc định: Vi phạm nội quy = 5 điểm, Gây mất trật tự = 10 điểm, Làm hư hỏng tài sản = 15 điểm
    IF @LoaiViPham LIKE N'%nội quy%' OR @LoaiViPham LIKE N'%nội quỹ%'
        SET @SoDiemTru = 5;
    ELSE IF @LoaiViPham LIKE N'%mất trật tự%' OR @LoaiViPham LIKE N'%gây rối%'
        SET @SoDiemTru = 10;
    ELSE IF @LoaiViPham LIKE N'%hư hỏng%' OR @LoaiViPham LIKE N'%phá hoại%'
        SET @SoDiemTru = 15;
    ELSE
        SET @SoDiemTru = 5; -- Mặc định
    
    -- Trừ điểm rèn luyện (nếu có điểm rèn luyện trong tháng)
    UPDATE DiemRenLuyen
    SET DiemSo = CASE 
                    WHEN DiemSo - @SoDiemTru < 0 THEN 0 
                    ELSE DiemSo - @SoDiemTru 
                 END,
        XepLoai = CASE 
                    WHEN DiemSo - @SoDiemTru >= 90 THEN N'Xuất sắc'
                    WHEN DiemSo - @SoDiemTru >= 80 THEN N'Tốt'
                    WHEN DiemSo - @SoDiemTru >= 70 THEN N'Khá'
                    WHEN DiemSo - @SoDiemTru >= 60 THEN N'Trung bình'
                    ELSE N'Yếu'
                  END,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiTao
    WHERE MaSinhVien = @MaSinhVien 
        AND Thang = @Thang 
        AND Nam = @Nam 
        AND IsDeleted = 0;
    
    -- Tạo hóa đơn phí phạt nếu có mức phạt > 0
    DECLARE @MaHoaDonPhat INT = NULL;
    IF @MucPhat > 0
    BEGIN
        -- Lấy thông tin phòng của sinh viên
        SELECT @MaPhong = MaPhong 
        FROM SinhVien 
        WHERE MaSinhVien = @MaSinhVien AND IsDeleted = 0;
        
        -- Tính toán các giá trị trước khi gọi EXEC
        DECLARE @HanThanhToanPhat DATE;
        DECLARE @GhiChuPhat NVARCHAR(1000);
        SET @HanThanhToanPhat = DATEADD(dd, 7, @NgayViPham);
        SET @GhiChuPhat = CAST(N'Hóa đơn phí phạt kỷ luật: ' AS NVARCHAR(1000)) + CAST(@LoaiViPham AS NVARCHAR(1000));
        
        -- Tạo hóa đơn phí phạt
        EXEC sp_HoaDon_Create 
            @MaSinhVien = @MaSinhVien,
            @MaPhong = @MaPhong,
            @MaHopDong = NULL,
            @Thang = @Thang,
            @Nam = @Nam,
            @TongTien = @MucPhat,
            @TrangThai = N'Chưa thanh toán',
            @HanThanhToan = @HanThanhToanPhat,
            @GhiChu = @GhiChuPhat,
            @NguoiTao = @NguoiTao;
        
        -- Lấy mã hóa đơn vừa tạo
        SELECT TOP 1 @MaHoaDonPhat = MaHoaDon
        FROM HoaDon
        WHERE MaSinhVien = @MaSinhVien 
            AND Thang = @Thang 
            AND Nam = @Nam 
            AND GhiChu LIKE N'%phí phạt kỷ luật%'
            AND IsDeleted = 0
        ORDER BY NgayTao DESC;
    END;
    
    -- Tự động tạo thông báo kỷ luật cho sinh viên
    DECLARE @NoiDungThongBaoKyLuat NVARCHAR(1000);
    DECLARE @ThongBaoKyLuat NVARCHAR(1000);
    SET @ThongBaoKyLuat = N'Bạn đã bị kỷ luật: ' + @LoaiViPham + N'. ';
    
    IF @SoDiemTru > 0
        SET @ThongBaoKyLuat = @ThongBaoKyLuat + N'Số điểm bị trừ: ' + CAST(@SoDiemTru AS NVARCHAR(10)) + N' điểm. ';
    
    IF @MucPhat > 0
        SET @ThongBaoKyLuat = @ThongBaoKyLuat + N'Mức phạt: ' + CAST(@MucPhat AS NVARCHAR(20)) + N' VND. ';
    
    SET @ThongBaoKyLuat = @ThongBaoKyLuat + N'Ngày vi phạm: ' + FORMAT(@NgayViPham, 'dd/MM/yyyy');
    
    INSERT INTO ThongBaoQuaHan (MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, NguoiTao)
    VALUES (@MaSinhVien, @MaHoaDonPhat, GETDATE(), @ThongBaoKyLuat, N'Đã gửi', @NguoiTao);
    
    SELECT @MaKyLuat AS MaKyLuat;
END;
GO

-- sp_KyLuat_Update
CREATE OR ALTER PROCEDURE sp_KyLuat_Update
    @MaKyLuat INT,
    @MaSinhVien INT,
    @LoaiViPham NVARCHAR(100),
    @MoTa NVARCHAR(1000),
    @NgayViPham DATE,
    @MucPhat DECIMAL(18,2) = 0,
    @TrangThai NVARCHAR(50) = N'Chưa xử lý',
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE KyLuat 
    SET MaSinhVien = @MaSinhVien,
        LoaiViPham = @LoaiViPham,
        MoTa = @MoTa,
        NgayViPham = @NgayViPham,
        MucPhat = @MucPhat,
        TrangThai = @TrangThai,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaKyLuat = @MaKyLuat AND IsDeleted = 0;
END;
GO

-- sp_KyLuat_Delete
CREATE OR ALTER PROCEDURE sp_KyLuat_Delete
    @MaKyLuat INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE KyLuat 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaKyLuat = @MaKyLuat AND IsDeleted = 0;
END;
GO

-- sp_KyLuat_GetBySinhVien
CREATE OR ALTER PROCEDURE sp_KyLuat_GetBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        kl.MaKyLuat,
        kl.MaSinhVien,
        kl.LoaiViPham,
        kl.MoTa,
        kl.NgayViPham,
        kl.MucPhat,
        kl.TrangThai,
        kl.GhiChu,
        kl.IsDeleted,
        kl.NgayTao,
        kl.NguoiTao,
        kl.NgayCapNhat,
        kl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM KyLuat kl
    INNER JOIN SinhVien s ON kl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE kl.MaSinhVien = @MaSinhVien AND kl.IsDeleted = 0
    ORDER BY kl.NgayViPham DESC;
END;
GO

-- =============================================
-- STORED PROCEDURES - DIEM REN LUYEN CRUD
-- =============================================

-- sp_DiemRenLuyen_GetAll
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        drl.MaDiem,
        drl.MaSinhVien,
        drl.Thang,
        drl.Nam,
        drl.DiemSo,
        drl.XepLoai,
        drl.GhiChu,
        drl.IsDeleted,
        drl.NgayTao,
        drl.NguoiTao,
        drl.NgayCapNhat,
        drl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM DiemRenLuyen drl
    INNER JOIN SinhVien s ON drl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE drl.IsDeleted = 0
    ORDER BY drl.Nam DESC, drl.Thang DESC;
END;
GO

-- sp_DiemRenLuyen_GetById
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_GetById
    @MaDiem INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        drl.MaDiem,
        drl.MaSinhVien,
        drl.Thang,
        drl.Nam,
        drl.DiemSo,
        drl.XepLoai,
        drl.GhiChu,
        drl.IsDeleted,
        drl.NgayTao,
        drl.NguoiTao,
        drl.NgayCapNhat,
        drl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM DiemRenLuyen drl
    INNER JOIN SinhVien s ON drl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE drl.MaDiem = @MaDiem AND drl.IsDeleted = 0;
END;
GO

-- sp_DiemRenLuyen_Create
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_Create
    @MaSinhVien INT,
    @Thang INT,
    @Nam INT,
    @DiemSo DECIMAL(5,2),
    @XepLoai NVARCHAR(50),
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO DiemRenLuyen (MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, NguoiTao)
    VALUES (@MaSinhVien, @Thang, @Nam, @DiemSo, @XepLoai, @GhiChu, @NguoiTao);
    
    SELECT SCOPE_IDENTITY() AS MaDiem;
END;
GO

-- sp_DiemRenLuyen_Update
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_Update
    @MaDiem INT,
    @MaSinhVien INT,
    @Thang INT,
    @Nam INT,
    @DiemSo DECIMAL(5,2),
    @XepLoai NVARCHAR(50),
    @GhiChu NVARCHAR(1000) = NULL,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE DiemRenLuyen 
    SET MaSinhVien = @MaSinhVien,
        Thang = @Thang,
        Nam = @Nam,
        DiemSo = @DiemSo,
        XepLoai = @XepLoai,
        GhiChu = @GhiChu,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaDiem = @MaDiem AND IsDeleted = 0;
END;
GO

-- sp_DiemRenLuyen_Delete
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_Delete
    @MaDiem INT,
    @NguoiCapNhat NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE DiemRenLuyen 
    SET IsDeleted = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = @NguoiCapNhat
    WHERE MaDiem = @MaDiem AND IsDeleted = 0;
END;
GO

-- sp_DiemRenLuyen_GetBySinhVien
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_GetBySinhVien
    @MaSinhVien INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        drl.MaDiem,
        drl.MaSinhVien,
        drl.Thang,
        drl.Nam,
        drl.DiemSo,
        drl.XepLoai,
        drl.GhiChu,
        drl.IsDeleted,
        drl.NgayTao,
        drl.NguoiTao,
        drl.NgayCapNhat,
        drl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM DiemRenLuyen drl
    INNER JOIN SinhVien s ON drl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE drl.MaSinhVien = @MaSinhVien AND drl.IsDeleted = 0
    ORDER BY drl.Nam DESC, drl.Thang DESC;
END;
GO

-- sp_DiemRenLuyen_GetBySinhVienAndMonth
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_GetBySinhVienAndMonth
    @MaSinhVien INT,
    @Thang INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        drl.MaDiem,
        drl.MaSinhVien,
        drl.Thang,
        drl.Nam,
        drl.DiemSo,
        drl.XepLoai,
        drl.GhiChu,
        drl.IsDeleted,
        drl.NgayTao,
        drl.NguoiTao,
        drl.NgayCapNhat,
        drl.NguoiCapNhat,
        s.HoTen AS TenSinhVien,
        s.MSSV,
        s.Lop,
        s.Khoa,
        p.SoPhong,
        t.TenToaNha
    FROM DiemRenLuyen drl
    INNER JOIN SinhVien s ON drl.MaSinhVien = s.MaSinhVien AND s.IsDeleted = 0
    LEFT JOIN Phong p ON s.MaPhong = p.MaPhong AND p.IsDeleted = 0
    LEFT JOIN ToaNha t ON p.MaToaNha = t.MaToaNha AND t.IsDeleted = 0
    WHERE drl.MaSinhVien = @MaSinhVien AND drl.Thang = @Thang AND drl.Nam = @Nam AND drl.IsDeleted = 0;
END;
GO

-- =============================================
-- ALIASES
-- =============================================

-- sp_KyLuat_Insert (Alias for Create)
CREATE OR ALTER PROCEDURE sp_KyLuat_Insert
    @MaSinhVien INT,
    @LoaiViPham NVARCHAR(100),
    @MoTa NVARCHAR(1000),
    @NgayViPham DATE,
    @MucPhat DECIMAL(18,2),
    @TrangThai NVARCHAR(50) = N'Chưa xử lý',
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_KyLuat_Create @MaSinhVien, @LoaiViPham, @MoTa, @NgayViPham, @MucPhat, @TrangThai, @GhiChu, @NguoiTao;
END;
GO

-- sp_DiemRenLuyen_Insert (Alias for Create)
CREATE OR ALTER PROCEDURE sp_DiemRenLuyen_Insert
    @MaSinhVien INT,
    @Thang INT,
    @Nam INT,
    @DiemSo DECIMAL(5,2),
    @XepLoai NVARCHAR(50) = N'Không xếp loại',
    @GhiChu NVARCHAR(500) = NULL,
    @NguoiTao NVARCHAR(100) = NULL
AS
BEGIN
    EXEC sp_DiemRenLuyen_Create @MaSinhVien, @Thang, @Nam, @DiemSo, @XepLoai, @GhiChu, @NguoiTao;
END;
GO

