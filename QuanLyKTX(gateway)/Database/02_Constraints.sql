-- =============================================
-- Script Name: 02_Constraints.sql
-- Description: Tất cả constraints và unique indexes
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
GO

-- =============================================
-- CONSTRAINTS
-- =============================================

-- Constraints cho ChiSoDienNuoc
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_ChiSoDienNuoc_Positive')
BEGIN
    ALTER TABLE ChiSoDienNuoc ADD CONSTRAINT CK_ChiSoDienNuoc_Positive 
        CHECK (ChiSoDien >= 0 AND ChiSoNuoc >= 0);
END
GO

-- Constraints cho HopDong
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_HopDong_DateRange')
BEGIN
    ALTER TABLE HopDong ADD CONSTRAINT CK_HopDong_DateRange 
        CHECK (NgayKetThuc > NgayBatDau);
END
GO

-- Constraints cho HoaDon
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_HoaDon_MonthYear')
BEGIN
    ALTER TABLE HoaDon ADD CONSTRAINT CK_HoaDon_MonthYear 
        CHECK (Thang >= 1 AND Thang <= 12 AND Nam >= 2000);
END
GO

-- Constraints cho SinhVien
-- Email format validation
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SinhVien_EmailFormat')
BEGIN
    ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_EmailFormat 
        CHECK (Email IS NULL OR Email LIKE '%_@_%._%');
END
GO

-- Phone format validation (Vietnam: bắt đầu bằng 0 hoặc +84, 10-11 số)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SinhVien_PhoneFormat')
BEGIN
    ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_PhoneFormat 
        CHECK (SDT IS NULL OR (
            (SDT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' AND LEN(SDT) = 10) OR
            (SDT LIKE '+84[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' AND LEN(SDT) = 12)
        ));
END
GO

-- HoTen length validation (2-200 characters)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SinhVien_HoTenLength')
BEGIN
    ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_HoTenLength 
        CHECK (LEN(HoTen) >= 2 AND LEN(HoTen) <= 200);
END
GO

-- MSSV format validation (chỉ chữ in hoa và số, 5-20 ký tự)
-- Lưu ý: SQL Server không hỗ trợ regex đầy đủ, chỉ kiểm tra độ dài và ký tự hợp lệ cơ bản
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SinhVien_MSSVFormat')
BEGIN
    ALTER TABLE SinhVien ADD CONSTRAINT CK_SinhVien_MSSVFormat 
        CHECK (LEN(MSSV) >= 5 AND LEN(MSSV) <= 20 
               AND MSSV NOT LIKE '%[^A-Z0-9]%');
END
GO

-- Constraints cho TaiKhoan
-- Email format validation
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_EmailFormat')
BEGIN
    ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_EmailFormat 
        CHECK (Email IS NULL OR Email LIKE '%_@_%._%');
END
GO

-- TenDangNhap format validation (chỉ chữ cái, số và dấu gạch dưới, 3-50 ký tự)
-- Lưu ý: SQL Server dùng collation case-sensitive để kiểm tra, nhưng có thể dùng pattern matching
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_TenDangNhapFormat')
BEGIN
    ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_TenDangNhapFormat 
        CHECK (LEN(TenDangNhap) >= 3 AND LEN(TenDangNhap) <= 50 
               AND TenDangNhap NOT LIKE '%[^a-zA-Z0-9_]%' COLLATE SQL_Latin1_General_CP1_CS_AS);
END
GO

-- MatKhau length validation (tối thiểu 6 ký tự)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_MatKhauLength')
BEGIN
    ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_MatKhauLength 
        CHECK (LEN(MatKhau) >= 6);
END
GO

-- HoTen length validation (2-200 characters)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_HoTenLength')
BEGIN
    ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_HoTenLength 
        CHECK (LEN(HoTen) >= 2 AND LEN(HoTen) <= 200);
END
GO

-- VaiTro validation (chỉ Admin, Officer, Student)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TaiKhoan_VaiTro')
BEGIN
    ALTER TABLE TaiKhoan ADD CONSTRAINT CK_TaiKhoan_VaiTro 
        CHECK (VaiTro IN ('Admin', 'Officer', 'Student', 'User'));
END
GO

-- Constraints cho HopDong
-- GiaPhong validation (phải >= 0)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_HopDong_GiaPhong')
BEGIN
    ALTER TABLE HopDong ADD CONSTRAINT CK_HopDong_GiaPhong 
        CHECK (GiaPhong >= 0);
END
GO

-- Constraints cho ChiSoDienNuoc
-- Thang validation (1-12)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_ChiSoDienNuoc_Thang')
BEGIN
    ALTER TABLE ChiSoDienNuoc ADD CONSTRAINT CK_ChiSoDienNuoc_Thang 
        CHECK (Thang >= 1 AND Thang <= 12);
END
GO

-- Nam validation (>= 2000)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_ChiSoDienNuoc_Nam')
BEGIN
    ALTER TABLE ChiSoDienNuoc ADD CONSTRAINT CK_ChiSoDienNuoc_Nam 
        CHECK (Nam >= 2000);
END
GO

-- Constraints cho DiemRenLuyen
-- Thang validation (1-12)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_DiemRenLuyen_Thang')
BEGIN
    ALTER TABLE DiemRenLuyen ADD CONSTRAINT CK_DiemRenLuyen_Thang 
        CHECK (Thang >= 1 AND Thang <= 12);
END
GO

-- Nam validation (>= 2000)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_DiemRenLuyen_Nam')
BEGIN
    ALTER TABLE DiemRenLuyen ADD CONSTRAINT CK_DiemRenLuyen_Nam 
        CHECK (Nam >= 2000);
END
GO

-- DiemSo validation (0-100)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_DiemRenLuyen_DiemSo')
BEGIN
    ALTER TABLE DiemRenLuyen ADD CONSTRAINT CK_DiemRenLuyen_DiemSo 
        CHECK (DiemSo >= 0 AND DiemSo <= 100);
END
GO

-- Unique constraint cho Email trong SinhVien (nếu cần, chỉ áp dụng khi Email không NULL)
-- Lưu ý: SQL Server không hỗ trợ UNIQUE constraint với NULL trực tiếp, cần dùng filtered index
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SinhVien_Email_Unique' AND object_id = OBJECT_ID('SinhVien'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_SinhVien_Email_Unique 
    ON SinhVien(Email) 
    WHERE Email IS NOT NULL AND IsDeleted = 0;
END
GO

-- Unique constraint cho Email trong TaiKhoan (nếu cần)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TaiKhoan_Email_Unique' AND object_id = OBJECT_ID('TaiKhoan'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_TaiKhoan_Email_Unique 
    ON TaiKhoan(Email) 
    WHERE Email IS NOT NULL AND IsDeleted = 0;
END
GO

-- Unique constraint cho MaSinhVien trong TaiKhoan (chỉ áp dụng khi MaSinhVien không NULL)
-- Nghiệp vụ: 1 SinhVien chỉ có 1 TàiKhoan duy nhất
-- Xóa UNIQUE constraint cũ trên cột MaSinhVien nếu tồn tại (nếu database đã được tạo trước đó)
IF EXISTS (
    SELECT 1 
    FROM sys.key_constraints kc
    INNER JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE kc.parent_object_id = OBJECT_ID('TaiKhoan')
        AND kc.type = 'UQ'
        AND c.name = 'MaSinhVien'
)
BEGIN
    DECLARE @DropConstraintSQL NVARCHAR(MAX) = '';
    SELECT @DropConstraintSQL = @DropConstraintSQL + 'ALTER TABLE TaiKhoan DROP CONSTRAINT ' + QUOTENAME(kc.name) + ';'
    FROM sys.key_constraints kc
    INNER JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
    INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE kc.parent_object_id = OBJECT_ID('TaiKhoan')
        AND kc.type = 'UQ'
        AND c.name = 'MaSinhVien';
    
    IF @DropConstraintSQL <> ''
    BEGIN
        EXEC sp_executesql @DropConstraintSQL;
    END
END
GO

-- Tạo filtered unique index thay thế
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TaiKhoan_MaSinhVien_Unique' AND object_id = OBJECT_ID('TaiKhoan'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_TaiKhoan_MaSinhVien_Unique 
    ON TaiKhoan(MaSinhVien) 
    WHERE MaSinhVien IS NOT NULL AND IsDeleted = 0;
END
GO

