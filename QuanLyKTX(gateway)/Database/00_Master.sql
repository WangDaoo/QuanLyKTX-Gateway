-- =============================================
-- Script Name: 00_Master.sql
-- Description: Master script để gọi tất cả các file module theo thứ tự
-- Author: KTX System
-- Created: 2024
-- =============================================
-- 
-- HƯỚNG DẪN SỬ DỤNG:
-- 1. Chạy file này để tạo toàn bộ database từ các file module
-- 2. File này sẽ gọi các file con theo thứ tự:
--    - Tables (01)
--    - Constraints (02)
--    - Indexes (03)
--    - Stored Procedures (04-13)
--    - Seed Data (14-17)
-- 
-- LƯU Ý: 
-- - File CSDL.sql gốc được giữ lại để đối chiếu
-- - Các file module có thể chạy độc lập nếu cần
-- =============================================

PRINT '========================================';
PRINT 'Bắt đầu tạo database QuanLyKyTucXa';
PRINT '========================================';
PRINT '';

-- =============================================
-- 1. TABLES
-- =============================================
PRINT '1. Đang tạo các bảng...';
:r "01_Tables.sql"
GO

-- =============================================
-- 2. CONSTRAINTS
-- =============================================
PRINT '2. Đang tạo các constraints...';
:r "02_Constraints.sql"
GO

-- =============================================
-- 3. INDEXES
-- =============================================
PRINT '3. Đang tạo các indexes...';
:r "03_Indexes.sql"
GO

-- =============================================
-- 4. STORED PROCEDURES
-- =============================================
PRINT '4. Đang tạo các stored procedures...';
PRINT '   4.1. ToaNha, Phong, Giuong...';
:r "StoredProcedures\04_SP_ToaNha_Phong_Giuong.sql"
GO

PRINT '   4.2. SinhVien, TaiKhoan...';
:r "StoredProcedures\05_SP_SinhVien_TaiKhoan.sql"
GO

PRINT '   4.3. HopDong...';
:r "StoredProcedures\06_SP_HopDong.sql"
GO

PRINT '   4.4. HoaDon, BienLaiThu, ChiTietHoaDon...';
:r "StoredProcedures\07_SP_HoaDon_BienLaiThu_ChiTiet.sql"
GO

PRINT '   4.5. MucPhi, CauHinhPhi, BacGia...';
:r "StoredProcedures\08_SP_MucPhi_CauHinhPhi_BacGia.sql"
GO

PRINT '   4.6. ChiSoDienNuoc...';
:r "StoredProcedures\09_SP_ChiSoDienNuoc.sql"
GO

PRINT '   4.7. DonDangKy, YeuCauChuyenPhong...';
:r "StoredProcedures\10_SP_DonDangKy_YeuCauChuyenPhong.sql"
GO

PRINT '   4.8. KyLuat, DiemRenLuyen...';
:r "StoredProcedures\11_SP_KyLuat_DiemRenLuyen.sql"
GO

PRINT '   4.9. ThongBaoQuaHan...';
:r "StoredProcedures\12_SP_ThongBaoQuaHan.sql"
GO

PRINT '   4.10. Business Logic (Tính toán, Báo cáo)...';
:r "StoredProcedures\13_SP_BusinessLogic.sql"
GO

-- =============================================
-- 5. SEED DATA
-- =============================================
PRINT '5. Đang chèn seed data...';
PRINT '   5.1. Admin...';
:r "SeedData\14_SeedData_Admin.sql"
GO

PRINT '   5.2. Officer...';
:r "SeedData\15_SeedData_Officer.sql"
GO

PRINT '   5.3. Student...';
:r "SeedData\16_SeedData_Student.sql"
GO

PRINT '   5.4. Sample Data...';
:r "SeedData\17_SeedData_Sample.sql"
GO

-- =============================================
-- HOÀN TẤT
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'Hoàn tất tạo database QuanLyKyTucXa';
PRINT '========================================';
PRINT '';
PRINT 'Các file module đã được tạo thành công:';
PRINT '  - Tables: 01_Tables.sql';
PRINT '  - Constraints: 02_Constraints.sql';
PRINT '  - Indexes: 03_Indexes.sql';
PRINT '  - Stored Procedures: 04-13_SP_*.sql';
PRINT '  - Seed Data: 14-17_SeedData_*.sql';
PRINT '';
PRINT 'File gốc CSDL.sql được giữ lại để đối chiếu.';
PRINT '';

