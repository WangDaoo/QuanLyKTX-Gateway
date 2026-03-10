-- =============================================
-- Script Name: 14_SeedData_Admin.sql
-- Description: Seed data cho AdminDefault và tài khoản Admin
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
GO

-- Seed data cho AdminDefault (Lưu thông tin admin mặc định)
-- Mật khẩu: admin@123 (đã hash bằng BCrypt)
IF NOT EXISTS (SELECT 1 FROM AdminDefault WHERE TenDangNhap = 'admin')
BEGIN
    INSERT INTO AdminDefault (TenDangNhap, MatKhau, HoTen, Email, GhiChu, IsActive) VALUES
    ('admin', '$2a$12$maT1YkwtB7QlJrT770kjk.SLd9.MXw3vw1GPypJO7WrNdn2eD0Cj2', 'Administrator', 'admin@ktx.edu.vn', 'Tài khoản admin mặc định - Mật khẩu: admin@123', 1);
END
ELSE
BEGIN
    UPDATE AdminDefault 
    SET IsActive = 1,
        NgayCapNhat = GETDATE()
    WHERE TenDangNhap = 'admin';
END
GO

-- Tài khoản admin (Đảm bảo luôn tồn tại và không thể bị xóa)
-- Lấy thông tin từ AdminDefault để đồng bộ
DECLARE @AdminMatKhau NVARCHAR(255);
DECLARE @AdminHoTen NVARCHAR(200);
DECLARE @AdminEmail NVARCHAR(100);

SELECT @AdminMatKhau = MatKhau, @AdminHoTen = HoTen, @AdminEmail = Email
FROM AdminDefault 
WHERE TenDangNhap = 'admin' AND IsActive = 1;

-- Nếu không có trong AdminDefault, dùng giá trị mặc định
IF @AdminMatKhau IS NULL
BEGIN
    SET @AdminMatKhau = '$2a$12$maT1YkwtB7QlJrT770kjk.SLd9.MXw3vw1GPypJO7WrNdn2eD0Cj2'; -- admin@123
    SET @AdminHoTen = 'Administrator';
    SET @AdminEmail = 'admin@ktx.edu.vn';
END

IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'admin')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('admin', @AdminMatKhau, @AdminHoTen, @AdminEmail, 'Admin', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    -- Đồng bộ thông tin từ AdminDefault nếu có
    IF @AdminMatKhau IS NOT NULL
    BEGIN
        UPDATE TaiKhoan 
        SET MatKhau = @AdminMatKhau,
            HoTen = @AdminHoTen,
            Email = @AdminEmail,
            IsDeleted = 0, 
            TrangThai = 1,
            VaiTro = 'Admin',
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE TenDangNhap = 'admin';
    END
    ELSE
    BEGIN
        -- Chỉ cập nhật trạng thái nếu không có trong AdminDefault
        UPDATE TaiKhoan 
        SET IsDeleted = 0, 
            TrangThai = 1,
            VaiTro = 'Admin',
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE TenDangNhap = 'admin';
    END
END
GO

