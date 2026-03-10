-- =============================================
-- Script Name: 16_SeedData_Student.sql
-- Description: Seed data cho tài khoản Student và SinhVien mẫu
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
GO

-- Seed data cho SinhVien
-- Đảm bảo SinhVien với MaSinhVien = 1 luôn tồn tại, không bị xóa
-- LƯU Ý: MaPhong chỉ được set khi có hợp đồng có hiệu lực (thông qua sp_HopDong_Confirm)
IF NOT EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 1)
BEGIN
    SET IDENTITY_INSERT SinhVien ON;
    INSERT INTO SinhVien (MaSinhVien, HoTen, MSSV, Lop, Khoa, NgaySinh, GioiTinh, SDT, Email, DiaChi, TrangThai, MaPhong, IsDeleted, NguoiTao) VALUES
    (1, N'Nguyễn Văn A', 'SV001', 'CNTT01', N'Công nghệ thông tin', '2000-01-01', N'Nam', '0123456789', 'nguyenvana@email.com', N'123 Đường ABC', 1, NULL, 0, 'System');
    SET IDENTITY_INSERT SinhVien OFF;
END
ELSE
BEGIN
    -- Khôi phục nếu đã bị xóa
    -- KHÔNG set MaPhong ở đây - chỉ set khi hợp đồng có hiệu lực
    UPDATE SinhVien 
    SET IsDeleted = 0, 
        TrangThai = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaSinhVien = 1;
    
    -- Chỉ set MaPhong nếu có hợp đồng có hiệu lực
    DECLARE @MaPhongHopDong INT = NULL;
    SELECT TOP 1 @MaPhongHopDong = p.MaPhong
    FROM HopDong hd
    INNER JOIN Giuong g ON hd.MaGiuong = g.MaGiuong AND g.IsDeleted = 0
    INNER JOIN Phong p ON g.MaPhong = p.MaPhong AND p.IsDeleted = 0
    WHERE hd.MaSinhVien = 1 
        AND hd.TrangThai = N'Có hiệu lực'
        AND hd.IsDeleted = 0
        AND GETDATE() BETWEEN hd.NgayBatDau AND hd.NgayKetThuc
    ORDER BY hd.NgayBatDau DESC;
    
    IF @MaPhongHopDong IS NOT NULL
    BEGIN
        UPDATE SinhVien
        SET MaPhong = @MaPhongHopDong,
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE MaSinhVien = 1;
    END
    ELSE
    BEGIN
        -- Nếu không có hợp đồng có hiệu lực, đảm bảo MaPhong = NULL
        UPDATE SinhVien
        SET MaPhong = NULL,
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE MaSinhVien = 1;
    END
END
GO

-- Seed data cho TaiKhoan (với BCrypt hash)
-- Mật khẩu: 123456 (đã hash bằng BCrypt)
-- Hash của "123456": $2a$12$.9dt9qsWexnUz1tl/ucxEeQ1AaF8WTnaRXLl1KNbWA4yE1lLwyhLe
-- Đảm bảo tài khoản 'student' luôn tồn tại, không bị xóa, và liên kết với MaSinhVien = 1
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'student')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('student', '$2a$12$.9dt9qsWexnUz1tl/ucxEeQ1AaF8WTnaRXLl1KNbWA4yE1lLwyhLe', 'Student', 'student@ktx.edu.vn', 'Student', 1, 1, 0, 'System');
END
ELSE
BEGIN
    -- Khôi phục nếu đã bị xóa hoặc thiếu MaSinhVien
    UPDATE TaiKhoan 
    SET MatKhau = '$2a$12$.9dt9qsWexnUz1tl/ucxEeQ1AaF8WTnaRXLl1KNbWA4yE1lLwyhLe',
        IsDeleted = 0, 
        MaSinhVien = 1,
        VaiTro = 'Student',
        TrangThai = 1,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE TenDangNhap = 'student';
END
GO

