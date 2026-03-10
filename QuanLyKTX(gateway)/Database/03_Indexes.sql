-- =============================================
-- Script Name: 03_Indexes.sql
-- Description: Tất cả indexes cho performance
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
GO

-- =============================================
-- INDEXES
-- =============================================

-- Indexes cho performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SinhVien_MSSV' AND object_id = OBJECT_ID('SinhVien'))
    CREATE INDEX IX_SinhVien_MSSV ON SinhVien(MSSV);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TaiKhoan_TenDangNhap' AND object_id = OBJECT_ID('TaiKhoan'))
    CREATE INDEX IX_TaiKhoan_TenDangNhap ON TaiKhoan(TenDangNhap);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Phong_ToaNha' AND object_id = OBJECT_ID('Phong'))
    CREATE INDEX IX_Phong_ToaNha ON Phong(MaToaNha);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Giuong_Phong' AND object_id = OBJECT_ID('Giuong'))
    CREATE INDEX IX_Giuong_Phong ON Giuong(MaPhong);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HopDong_SinhVien' AND object_id = OBJECT_ID('HopDong'))
    CREATE INDEX IX_HopDong_SinhVien ON HopDong(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HopDong_Giuong' AND object_id = OBJECT_ID('HopDong'))
    CREATE INDEX IX_HopDong_Giuong ON HopDong(MaGiuong);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HoaDon_SinhVien' AND object_id = OBJECT_ID('HoaDon'))
    CREATE INDEX IX_HoaDon_SinhVien ON HoaDon(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HoaDon_ThangNam' AND object_id = OBJECT_ID('HoaDon'))
    CREATE INDEX IX_HoaDon_ThangNam ON HoaDon(Thang, Nam);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BienLaiThu_HoaDon' AND object_id = OBJECT_ID('BienLaiThu'))
    CREATE INDEX IX_BienLaiThu_HoaDon ON BienLaiThu(MaHoaDon);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_KyLuat_SinhVien' AND object_id = OBJECT_ID('KyLuat'))
    CREATE INDEX IX_KyLuat_SinhVien ON KyLuat(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DonDangKy_SinhVien' AND object_id = OBJECT_ID('DonDangKy'))
    CREATE INDEX IX_DonDangKy_SinhVien ON DonDangKy(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_YeuCauChuyenPhong_SinhVien' AND object_id = OBJECT_ID('YeuCauChuyenPhong'))
    CREATE INDEX IX_YeuCauChuyenPhong_SinhVien ON YeuCauChuyenPhong(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ChiSoDienNuoc_Phong' AND object_id = OBJECT_ID('ChiSoDienNuoc'))
    CREATE INDEX IX_ChiSoDienNuoc_Phong ON ChiSoDienNuoc(MaPhong);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ChiSoDienNuoc_ThangNam' AND object_id = OBJECT_ID('ChiSoDienNuoc'))
    CREATE INDEX IX_ChiSoDienNuoc_ThangNam ON ChiSoDienNuoc(Thang, Nam);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DiemRenLuyen_SinhVien' AND object_id = OBJECT_ID('DiemRenLuyen'))
    CREATE INDEX IX_DiemRenLuyen_SinhVien ON DiemRenLuyen(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_DiemRenLuyen_ThangNam' AND object_id = OBJECT_ID('DiemRenLuyen'))
    CREATE INDEX IX_DiemRenLuyen_ThangNam ON DiemRenLuyen(Thang, Nam);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ChiTietHoaDon_HoaDon' AND object_id = OBJECT_ID('ChiTietHoaDon'))
    CREATE INDEX IX_ChiTietHoaDon_HoaDon ON ChiTietHoaDon(MaHoaDon);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ThongBaoQuaHan_SinhVien' AND object_id = OBJECT_ID('ThongBaoQuaHan'))
    CREATE INDEX IX_ThongBaoQuaHan_SinhVien ON ThongBaoQuaHan(MaSinhVien);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ThongBaoQuaHan_HoaDon' AND object_id = OBJECT_ID('ThongBaoQuaHan'))
    CREATE INDEX IX_ThongBaoQuaHan_HoaDon ON ThongBaoQuaHan(MaHoaDon);
GO

