-- =============================================
-- Script Name: 15_SeedData_Officer.sql
-- Description: Seed data cho OfficerDefault và tài khoản Officer
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
GO

-- Seed data cho OfficerDefault (Lưu thông tin officer mặc định)
-- Mật khẩu: officer@123 (đã hash bằng BCrypt)
IF NOT EXISTS (SELECT 1 FROM OfficerDefault WHERE TenDangNhap = 'officer')
BEGIN
    INSERT INTO OfficerDefault (TenDangNhap, MatKhau, HoTen, Email, GhiChu, IsActive) VALUES
    ('officer', '$2a$10$KO6gOiKQzpEJbXKkliTmuezoUR4S0dPPqWlZEBhPbels3XiNuGiES', 'Officer', 'officer@ktx.edu.vn', 'Tài khoản officer mặc định - Mật khẩu: officer@123', 1);
END
ELSE
BEGIN
    UPDATE OfficerDefault 
    SET IsActive = 1,
        NgayCapNhat = GETDATE()
    WHERE TenDangNhap = 'officer';
END
GO

-- Tài khoản officer (Đảm bảo luôn tồn tại và không thể bị xóa)
-- Lấy thông tin từ OfficerDefault để đồng bộ
DECLARE @OfficerMatKhau NVARCHAR(255);
DECLARE @OfficerHoTen NVARCHAR(200);
DECLARE @OfficerEmail NVARCHAR(100);

SELECT @OfficerMatKhau = MatKhau, @OfficerHoTen = HoTen, @OfficerEmail = Email
FROM OfficerDefault 
WHERE TenDangNhap = 'officer' AND IsActive = 1;

-- Nếu không có trong OfficerDefault, dùng giá trị mặc định
IF @OfficerMatKhau IS NULL
BEGIN
    SET @OfficerMatKhau = '$2a$10$KO6gOiKQzpEJbXKkliTmuezoUR4S0dPPqWlZEBhPbels3XiNuGiES'; -- officer@123
    SET @OfficerHoTen = 'Officer';
    SET @OfficerEmail = 'officer@ktx.edu.vn';
END

IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer', @OfficerMatKhau, @OfficerHoTen, @OfficerEmail, 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    -- Đồng bộ thông tin từ OfficerDefault nếu có
    IF @OfficerMatKhau IS NOT NULL
    BEGIN
        UPDATE TaiKhoan 
        SET MatKhau = @OfficerMatKhau,
            HoTen = @OfficerHoTen,
            Email = @OfficerEmail,
            IsDeleted = 0, 
            TrangThai = 1,
            VaiTro = 'Officer',
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE TenDangNhap = 'officer';
    END
    ELSE
    BEGIN
        -- Chỉ cập nhật trạng thái nếu không có trong OfficerDefault
        UPDATE TaiKhoan 
        SET IsDeleted = 0, 
            TrangThai = 1,
            VaiTro = 'Officer',
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE TenDangNhap = 'officer';
    END
END
GO

-- =============================================
-- Tạo thêm nhiều Officer (2-10)
-- =============================================
-- Mật khẩu mặc định: officer@123 (đã hash bằng BCrypt)
DECLARE @OfficerPasswordHash NVARCHAR(255) = '$2a$10$KO6gOiKQzpEJbXKkliTmuezoUR4S0dPPqWlZEBhPbels3XiNuGiES';

-- Officer 2
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer2')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer2', @OfficerPasswordHash, N'Nguyễn Văn Officer 2', 'officer2@ktx.edu.vn', 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    UPDATE TaiKhoan SET IsDeleted = 0, TrangThai = 1, VaiTro = 'Officer', NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE TenDangNhap = 'officer2';
END

-- Officer 3
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer3')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer3', @OfficerPasswordHash, N'Trần Thị Officer 3', 'officer3@ktx.edu.vn', 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    UPDATE TaiKhoan SET IsDeleted = 0, TrangThai = 1, VaiTro = 'Officer', NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE TenDangNhap = 'officer3';
END

-- Officer 4
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer4')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer4', @OfficerPasswordHash, N'Lê Văn Officer 4', 'officer4@ktx.edu.vn', 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    UPDATE TaiKhoan SET IsDeleted = 0, TrangThai = 1, VaiTro = 'Officer', NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE TenDangNhap = 'officer4';
END

-- Officer 5
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer5')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer5', @OfficerPasswordHash, N'Phạm Thị Officer 5', 'officer5@ktx.edu.vn', 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    UPDATE TaiKhoan SET IsDeleted = 0, TrangThai = 1, VaiTro = 'Officer', NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE TenDangNhap = 'officer5';
END

-- Officer 6
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer6')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer6', @OfficerPasswordHash, N'Hoàng Văn Officer 6', 'officer6@ktx.edu.vn', 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    UPDATE TaiKhoan SET IsDeleted = 0, TrangThai = 1, VaiTro = 'Officer', NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE TenDangNhap = 'officer6';
END

-- Officer 7
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer7')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer7', @OfficerPasswordHash, N'Võ Thị Officer 7', 'officer7@ktx.edu.vn', 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    UPDATE TaiKhoan SET IsDeleted = 0, TrangThai = 1, VaiTro = 'Officer', NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE TenDangNhap = 'officer7';
END

-- Officer 8
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer8')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer8', @OfficerPasswordHash, N'Đặng Văn Officer 8', 'officer8@ktx.edu.vn', 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    UPDATE TaiKhoan SET IsDeleted = 0, TrangThai = 1, VaiTro = 'Officer', NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE TenDangNhap = 'officer8';
END

-- Officer 9
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer9')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer9', @OfficerPasswordHash, N'Bùi Thị Officer 9', 'officer9@ktx.edu.vn', 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    UPDATE TaiKhoan SET IsDeleted = 0, TrangThai = 1, VaiTro = 'Officer', NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE TenDangNhap = 'officer9';
END

-- Officer 10
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'officer10')
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    ('officer10', @OfficerPasswordHash, N'Lý Văn Officer 10', 'officer10@ktx.edu.vn', 'Officer', 1, NULL, 0, 'System');
END
ELSE
BEGIN
    UPDATE TaiKhoan SET IsDeleted = 0, TrangThai = 1, VaiTro = 'Officer', NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE TenDangNhap = 'officer10';
END
GO

PRINT 'Đã tạo 10 tài khoản Officer (officer đến officer10) - Mật khẩu: officer@123';
GO

