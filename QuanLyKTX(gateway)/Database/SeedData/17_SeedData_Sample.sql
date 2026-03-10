-- =============================================
-- Script Name: 17_SeedData_Sample.sql
-- Description: Seed data mẫu đầy đủ cho tất cả các bảng (trừ Admin, Officer, Student)
-- Author: KTX System
-- Created: 2024
-- =============================================

USE QuanLyKyTucXa;
GO

-- =============================================
-- 1. TOA NHA (Tòa nhà)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM ToaNha WHERE MaToaNha = 1)
BEGIN
    SET IDENTITY_INSERT ToaNha ON;
    INSERT INTO ToaNha (MaToaNha, TenToaNha, DiaChi, SoTang, MoTa, TrangThai, IsDeleted, NguoiTao) VALUES
    (1, N'Tòa A', N'123 Đường ABC, Quận 1, TP.HCM', 5, N'Tòa nam - Khu A', 1, 0, 'System'),
    (2, N'Tòa B', N'456 Đường XYZ, Quận 2, TP.HCM', 4, N'Tòa nữ - Khu B', 1, 0, 'System'),
    (3, N'Tòa C', N'789 Đường DEF, Quận 3, TP.HCM', 6, N'Tòa nam - Khu C', 1, 0, 'System'),
    (4, N'Tòa D', N'321 Đường GHI, Quận 4, TP.HCM', 5, N'Tòa nữ - Khu D', 1, 0, 'System'),
    (5, N'Tòa E', N'654 Đường JKL, Quận 5, TP.HCM', 4, N'Tòa nam - Khu E', 1, 0, 'System');
    SET IDENTITY_INSERT ToaNha OFF;
END
ELSE
BEGIN
    UPDATE ToaNha SET IsDeleted = 0, TrangThai = 1, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaToaNha IN (1,2,3,4,5);
END
GO

-- =============================================
-- 2. PHONG (Phòng)
-- =============================================
-- Đảm bảo ToaNha tồn tại trước khi tạo Phong
IF NOT EXISTS (SELECT 1 FROM ToaNha WHERE MaToaNha = 1)
BEGIN
    SET IDENTITY_INSERT ToaNha ON;
    INSERT INTO ToaNha (MaToaNha, TenToaNha, DiaChi, SoTang, MoTa, TrangThai, IsDeleted, NguoiTao) VALUES
    (1, N'Tòa A', N'123 Đường ABC, Quận 1, TP.HCM', 5, N'Tòa nam', 1, 0, 'System');
    SET IDENTITY_INSERT ToaNha OFF;
END
IF NOT EXISTS (SELECT 1 FROM ToaNha WHERE MaToaNha = 2)
BEGIN
    SET IDENTITY_INSERT ToaNha ON;
    INSERT INTO ToaNha (MaToaNha, TenToaNha, DiaChi, SoTang, MoTa, TrangThai, IsDeleted, NguoiTao) VALUES
    (2, N'Tòa B', N'456 Đường XYZ, Quận 2, TP.HCM', 4, N'Tòa nữ', 1, 0, 'System');
    SET IDENTITY_INSERT ToaNha OFF;
END
IF NOT EXISTS (SELECT 1 FROM ToaNha WHERE MaToaNha = 3)
BEGIN
    SET IDENTITY_INSERT ToaNha ON;
    INSERT INTO ToaNha (MaToaNha, TenToaNha, DiaChi, SoTang, MoTa, TrangThai, IsDeleted, NguoiTao) VALUES
    (3, N'Tòa C', N'789 Đường DEF, Quận 3, TP.HCM', 6, N'Tòa nam - Khu C', 1, 0, 'System');
    SET IDENTITY_INSERT ToaNha OFF;
END
IF NOT EXISTS (SELECT 1 FROM ToaNha WHERE MaToaNha = 4)
BEGIN
    SET IDENTITY_INSERT ToaNha ON;
        INSERT INTO ToaNha (MaToaNha, TenToaNha, DiaChi, SoTang, MoTa, TrangThai, IsDeleted, NguoiTao) VALUES
    (4, N'Tòa D', N'321 Đường GHI, Quận 4, TP.HCM', 5, N'Tòa nữ - Khu D', 1, 0, 'System');
    SET IDENTITY_INSERT ToaNha OFF;
END
IF NOT EXISTS (SELECT 1 FROM ToaNha WHERE MaToaNha = 5)
BEGIN
    SET IDENTITY_INSERT ToaNha ON;
        INSERT INTO ToaNha (MaToaNha, TenToaNha, DiaChi, SoTang, MoTa, TrangThai, IsDeleted, NguoiTao) VALUES
    (5, N'Tòa E', N'654 Đường JKL, Quận 5, TP.HCM', 4, N'Tòa nam - Khu E', 1, 0, 'System');
    SET IDENTITY_INSERT ToaNha OFF;
END

IF NOT EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 1)
BEGIN
    SET IDENTITY_INSERT Phong ON;
    INSERT INTO Phong (MaPhong, MaToaNha, SoPhong, SoGiuong, LoaiPhong, GiaPhong, TrangThai, IsDeleted, NguoiTao) VALUES
    -- Tòa A
    -- Tòa A (Tầng 1)
    (1, 1, 'A101', 4, N'Phòng 4 người', 500000, N'Đã có người', 0, 'System'),
    (2, 1, 'A102', 4, N'Phòng 4 người', 500000, N'Đã có người', 0, 'System'),
    (3, 1, 'A103', 2, N'Phòng 2 người', 300000, N'Trống', 0, 'System'),
    (4, 1, 'A104', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (5, 1, 'A105', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    -- Tòa A (Tầng 2)
    (6, 1, 'A201', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (7, 1, 'A202', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (8, 1, 'A203', 2, N'Phòng 2 người', 300000, N'Trống', 0, 'System'),
    (9, 1, 'A204', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (10, 1, 'A205', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    -- Tòa B (Tầng 1)
    (11, 2, 'B101', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (12, 2, 'B102', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (13, 2, 'B103', 2, N'Phòng 2 người', 300000, N'Trống', 0, 'System'),
    (14, 2, 'B104', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    -- Tòa B (Tầng 2)
    (15, 2, 'B201', 2, N'Phòng 2 người', 300000, N'Trống', 0, 'System'),
    (16, 2, 'B202', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (17, 2, 'B203', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    -- Tòa C (Tầng 1)
    (18, 3, 'C101', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (19, 3, 'C102', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (20, 3, 'C103', 2, N'Phòng 2 người', 300000, N'Trống', 0, 'System'),
    (21, 3, 'C104', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (22, 3, 'C105', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    -- Tòa C (Tầng 2)
    (23, 3, 'C201', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (24, 3, 'C202', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (25, 3, 'C203', 2, N'Phòng 2 người', 300000, N'Trống', 0, 'System'),
    -- Tòa D (Tầng 1)
    (26, 4, 'D101', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (27, 4, 'D102', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (28, 4, 'D103', 2, N'Phòng 2 người', 300000, N'Trống', 0, 'System'),
    (29, 4, 'D104', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    -- Tòa D (Tầng 2)
    (30, 4, 'D201', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (31, 4, 'D202', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    -- Tòa E (Tầng 1)
    (32, 5, 'E101', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (33, 5, 'E102', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System'),
    (34, 5, 'E103', 2, N'Phòng 2 người', 300000, N'Trống', 0, 'System'),
    (35, 5, 'E104', 4, N'Phòng 4 người', 500000, N'Trống', 0, 'System');
    SET IDENTITY_INSERT Phong OFF;
END
ELSE
BEGIN
    UPDATE Phong SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaPhong BETWEEN 1 AND 35;
END
GO

-- =============================================
-- 3. GIUONG (Giường)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 1)
BEGIN
    SET IDENTITY_INSERT Giuong ON;
    -- Phòng A101 (4 giường)
    INSERT INTO Giuong (MaGiuong, MaPhong, SoGiuong, TrangThai, NguoiTao) VALUES
    (1, 1, '1', N'Đã có người', 'System'),
    (2, 1, '2', N'Trống', 'System'),
    (3, 1, '3', N'Trống', 'System'),
    (4, 1, '4', N'Trống', 'System'),
    -- Phòng A102 (4 giường)
    (5, 2, '1', N'Đã có người', 'System'),
    (6, 2, '2', N'Trống', 'System'),
    (7, 2, '3', N'Trống', 'System'),
    (8, 2, '4', N'Trống', 'System'),
    -- Phòng A103 (2 giường)
    (9, 3, '1', N'Trống', 'System'),
    (10, 3, '2', N'Trống', 'System'),
    -- Phòng A201 (4 giường)
    (11, 4, '1', N'Trống', 'System'),
    (12, 4, '2', N'Trống', 'System'),
    (13, 4, '3', N'Trống', 'System'),
    (14, 4, '4', N'Trống', 'System'),
    -- Phòng A202 (4 giường)
    (15, 5, '1', N'Trống', 'System'),
    (16, 5, '2', N'Trống', 'System'),
    (17, 5, '3', N'Trống', 'System'),
    (18, 5, '4', N'Trống', 'System'),
    -- Phòng B101 (4 giường)
    (19, 6, '1', N'Trống', 'System'),
    (20, 6, '2', N'Trống', 'System'),
    (21, 6, '3', N'Trống', 'System'),
    (22, 6, '4', N'Trống', 'System'),
    -- Phòng B102 (4 giường)
    (23, 7, '1', N'Trống', 'System'),
    (24, 7, '2', N'Trống', 'System'),
    (25, 7, '3', N'Trống', 'System'),
    (26, 7, '4', N'Trống', 'System'),
    -- Phòng B201 (2 giường)
    (27, 8, '1', N'Trống', 'System'),
    (28, 8, '2', N'Trống', 'System'),
    -- Phòng C101 (4 giường)
    (29, 9, '1', N'Trống', 'System'),
    (30, 9, '2', N'Trống', 'System'),
    (31, 9, '3', N'Trống', 'System'),
    (32, 9, '4', N'Trống', 'System'),
    -- Phòng C102 (4 giường)
    (33, 10, '1', N'Trống', 'System'),
    (34, 10, '2', N'Trống', 'System'),
    (35, 10, '3', N'Trống', 'System'),
    (36, 10, '4', N'Trống', 'System'),
    -- Phòng A104 (4 giường)
    (37, 4, '1', N'Trống', 'System'),
    (38, 4, '2', N'Trống', 'System'),
    (39, 4, '3', N'Trống', 'System'),
    (40, 4, '4', N'Trống', 'System'),
    -- Phòng A105 (4 giường)
    (41, 5, '1', N'Trống', 'System'),
    (42, 5, '2', N'Trống', 'System'),
    (43, 5, '3', N'Trống', 'System'),
    (44, 5, '4', N'Trống', 'System'),
    -- Phòng A201 (4 giường)
    (45, 6, '1', N'Trống', 'System'),
    (46, 6, '2', N'Trống', 'System'),
    (47, 6, '3', N'Trống', 'System'),
    (48, 6, '4', N'Trống', 'System'),
    -- Phòng A202 (4 giường)
    (49, 7, '1', N'Trống', 'System'),
    (50, 7, '2', N'Trống', 'System'),
    (51, 7, '3', N'Trống', 'System'),
    (52, 7, '4', N'Trống', 'System'),
    -- Phòng A203 (2 giường)
    (53, 8, '1', N'Trống', 'System'),
    (54, 8, '2', N'Trống', 'System'),
    -- Phòng A204 (4 giường)
    (55, 9, '1', N'Trống', 'System'),
    (56, 9, '2', N'Trống', 'System'),
    (57, 9, '3', N'Trống', 'System'),
    (58, 9, '4', N'Trống', 'System'),
    -- Phòng A205 (4 giường)
    (59, 10, '1', N'Trống', 'System'),
    (60, 10, '2', N'Trống', 'System'),
    (61, 10, '3', N'Trống', 'System'),
    (62, 10, '4', N'Trống', 'System'),
    -- Phòng B101 (4 giường)
    (63, 11, '1', N'Trống', 'System'),
    (64, 11, '2', N'Trống', 'System'),
    (65, 11, '3', N'Trống', 'System'),
    (66, 11, '4', N'Trống', 'System'),
    -- Phòng B102 (4 giường)
    (67, 12, '1', N'Trống', 'System'),
    (68, 12, '2', N'Trống', 'System'),
    (69, 12, '3', N'Trống', 'System'),
    (70, 12, '4', N'Trống', 'System'),
    -- Phòng B103 (2 giường)
    (71, 13, '1', N'Trống', 'System'),
    (72, 13, '2', N'Trống', 'System'),
    -- Phòng B104 (4 giường)
    (73, 14, '1', N'Trống', 'System'),
    (74, 14, '2', N'Trống', 'System'),
    (75, 14, '3', N'Trống', 'System'),
    (76, 14, '4', N'Trống', 'System'),
    -- Phòng B201 (2 giường)
    (77, 15, '1', N'Trống', 'System'),
    (78, 15, '2', N'Trống', 'System'),
    -- Phòng B202 (4 giường)
    (79, 16, '1', N'Trống', 'System'),
    (80, 16, '2', N'Trống', 'System'),
    (81, 16, '3', N'Trống', 'System'),
    (82, 16, '4', N'Trống', 'System'),
    -- Phòng B203 (4 giường)
    (83, 17, '1', N'Trống', 'System'),
    (84, 17, '2', N'Trống', 'System'),
    (85, 17, '3', N'Trống', 'System'),
    (86, 17, '4', N'Trống', 'System'),
    -- Phòng C101 (4 giường)
    (87, 18, '1', N'Trống', 'System'),
    (88, 18, '2', N'Trống', 'System'),
    (89, 18, '3', N'Trống', 'System'),
    (90, 18, '4', N'Trống', 'System'),
    -- Phòng C102 (4 giường)
    (91, 19, '1', N'Trống', 'System'),
    (92, 19, '2', N'Trống', 'System'),
    (93, 19, '3', N'Trống', 'System'),
    (94, 19, '4', N'Trống', 'System'),
    -- Phòng C103 (2 giường)
    (95, 20, '1', N'Trống', 'System'),
    (96, 20, '2', N'Trống', 'System'),
    -- Phòng C104 (4 giường)
    (97, 21, '1', N'Trống', 'System'),
    (98, 21, '2', N'Trống', 'System'),
    (99, 21, '3', N'Trống', 'System'),
    (100, 21, '4', N'Trống', 'System'),
    -- Phòng C105 (4 giường)
    (101, 22, '1', N'Trống', 'System'),
    (102, 22, '2', N'Trống', 'System'),
    (103, 22, '3', N'Trống', 'System'),
    (104, 22, '4', N'Trống', 'System'),
    -- Phòng C201 (4 giường)
    (105, 23, '1', N'Trống', 'System'),
    (106, 23, '2', N'Trống', 'System'),
    (107, 23, '3', N'Trống', 'System'),
    (108, 23, '4', N'Trống', 'System'),
    -- Phòng C202 (4 giường)
    (109, 24, '1', N'Trống', 'System'),
    (110, 24, '2', N'Trống', 'System'),
    (111, 24, '3', N'Trống', 'System'),
    (112, 24, '4', N'Trống', 'System'),
    -- Phòng C203 (2 giường)
    (113, 25, '1', N'Trống', 'System'),
    (114, 25, '2', N'Trống', 'System'),
    -- Phòng D101 (4 giường)
    (115, 26, '1', N'Trống', 'System'),
    (116, 26, '2', N'Trống', 'System'),
    (117, 26, '3', N'Trống', 'System'),
    (118, 26, '4', N'Trống', 'System'),
    -- Phòng D102 (4 giường)
    (119, 27, '1', N'Trống', 'System'),
    (120, 27, '2', N'Trống', 'System'),
    (121, 27, '3', N'Trống', 'System'),
    (122, 27, '4', N'Trống', 'System'),
    -- Phòng D103 (2 giường)
    (123, 28, '1', N'Trống', 'System'),
    (124, 28, '2', N'Trống', 'System'),
    -- Phòng D104 (4 giường)
    (125, 29, '1', N'Trống', 'System'),
    (126, 29, '2', N'Trống', 'System'),
    (127, 29, '3', N'Trống', 'System'),
    (128, 29, '4', N'Trống', 'System'),
    -- Phòng D201 (4 giường)
    (129, 30, '1', N'Trống', 'System'),
    (130, 30, '2', N'Trống', 'System'),
    (131, 30, '3', N'Trống', 'System'),
    (132, 30, '4', N'Trống', 'System'),
    -- Phòng D202 (4 giường)
    (133, 31, '1', N'Trống', 'System'),
    (134, 31, '2', N'Trống', 'System'),
    (135, 31, '3', N'Trống', 'System'),
    (136, 31, '4', N'Trống', 'System'),
    -- Phòng E101 (4 giường)
    (137, 32, '1', N'Trống', 'System'),
    (138, 32, '2', N'Trống', 'System'),
    (139, 32, '3', N'Trống', 'System'),
    (140, 32, '4', N'Trống', 'System'),
    -- Phòng E102 (4 giường)
    (141, 33, '1', N'Trống', 'System'),
    (142, 33, '2', N'Trống', 'System'),
    (143, 33, '3', N'Trống', 'System'),
    (144, 33, '4', N'Trống', 'System'),
    -- Phòng E103 (2 giường)
    (145, 34, '1', N'Trống', 'System'),
    (146, 34, '2', N'Trống', 'System'),
    -- Phòng E104 (4 giường)
    (147, 35, '1', N'Trống', 'System'),
    (148, 35, '2', N'Trống', 'System'),
    (149, 35, '3', N'Trống', 'System'),
    (150, 35, '4', N'Trống', 'System');
    SET IDENTITY_INSERT Giuong OFF;
END
ELSE
BEGIN
    UPDATE Giuong SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaGiuong BETWEEN 1 AND 150;
END
GO

-- =============================================
-- 4. SINH VIEN (Sinh viên) - Thêm nhiều sinh viên mẫu
-- =============================================
-- Đảm bảo Phong tồn tại trước khi INSERT SinhVien với MaPhong
IF NOT EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 2 AND IsDeleted = 0)
BEGIN
    PRINT 'WARNING: Phong with MaPhong = 2 does not exist. Creating it...';
    -- Tạo Phong nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 2)
    BEGIN
        SET IDENTITY_INSERT Phong ON;
        INSERT INTO Phong (MaPhong, MaToaNha, SoPhong, SoGiuong, LoaiPhong, GiaPhong, TrangThai, IsDeleted, NguoiTao) 
        VALUES (2, 1, 'A102', 4, N'Phòng 4 người', 500000, N'Đã có người', 0, 'System');
        SET IDENTITY_INSERT Phong OFF;
    END
    ELSE
    BEGIN
        UPDATE Phong SET IsDeleted = 0, TrangThai = N'Đã có người', NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaPhong = 2;
    END
END

IF NOT EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 2)
BEGIN
    SET IDENTITY_INSERT SinhVien ON;
    -- Chỉ INSERT với MaPhong = 2 nếu Phong tồn tại,否则 dùng NULL
    DECLARE @MaPhong2 INT = NULL;
    IF EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 2 AND IsDeleted = 0)
        SET @MaPhong2 = 2;
    
    INSERT INTO SinhVien (MaSinhVien, HoTen, MSSV, Lop, Khoa, NgaySinh, GioiTinh, SDT, Email, DiaChi, TrangThai, MaPhong, IsDeleted, NguoiTao) VALUES
    (2, N'Trần Thị B', 'SV002', 'CNTT02', N'Công nghệ thông tin', '2000-02-02', N'Nữ', '0987654321', 'tranthib@email.com', N'456 Đường XYZ', 1, @MaPhong2, 0, 'System'),
    (3, N'Lê Văn C', 'SV003', 'KT01', N'Kế toán', '2000-03-03', N'Nam', '0369258147', 'levanc@email.com', N'789 Đường DEF', 1, NULL, 0, 'System'),
    (4, N'Phạm Thị D', 'SV004', 'CNTT01', N'Công nghệ thông tin', '2001-04-15', N'Nữ', '0912345678', 'phamthid@email.com', N'123 Đường GHI', 1, NULL, 0, 'System'),
    (5, N'Hoàng Văn E', 'SV005', 'QTKD01', N'Quản trị kinh doanh', '2000-05-20', N'Nam', '0923456789', 'hoangvane@email.com', N'456 Đường JKL', 1, NULL, 0, 'System'),
    (6, N'Nguyễn Thị F', 'SV006', 'CNTT02', N'Công nghệ thông tin', '2001-06-10', N'Nữ', '0934567890', 'nguyenthif@email.com', N'789 Đường MNO', 1, NULL, 0, 'System'),
    (7, N'Võ Văn G', 'SV007', 'KT02', N'Kế toán', '2000-07-25', N'Nam', '0945678901', 'vovang@email.com', N'123 Đường PQR', 1, NULL, 0, 'System'),
    (8, N'Đặng Thị H', 'SV008', 'QTKD02', N'Quản trị kinh doanh', '2001-08-30', N'Nữ', '0956789012', 'dangthih@email.com', N'456 Đường STU', 1, NULL, 0, 'System'),
    (9, N'Bùi Văn I', 'SV009', 'CNTT03', N'Công nghệ thông tin', '2000-09-05', N'Nam', '0967890123', 'buivani@email.com', N'789 Đường VWX', 1, NULL, 0, 'System'),
    (10, N'Lý Thị K', 'SV010', 'KT03', N'Kế toán', '2001-10-12', N'Nữ', '0978901234', 'lythik@email.com', N'123 Đường YZA', 1, NULL, 0, 'System'),
    (11, N'Trương Văn L', 'SV011', 'QTKD03', N'Quản trị kinh doanh', '2000-11-18', N'Nam', '0989012345', 'truongvanl@email.com', N'456 Đường BCD', 1, NULL, 0, 'System'),
    (12, N'Đỗ Thị M', 'SV012', 'CNTT04', N'Công nghệ thông tin', '2001-12-25', N'Nữ', '0990123456', 'dothim@email.com', N'789 Đường EFG', 1, NULL, 0, 'System'),
    (13, N'Vũ Văn N', 'SV013', 'KT04', N'Kế toán', '2000-01-08', N'Nam', '0901234567', 'vuvann@email.com', N'123 Đường HIJ', 1, NULL, 0, 'System'),
    (14, N'Lưu Thị O', 'SV014', 'QTKD04', N'Quản trị kinh doanh', '2001-02-14', N'Nữ', '0912345678', 'luuthio@email.com', N'456 Đường KLM', 1, NULL, 0, 'System'),
    (15, N'Ngô Văn P', 'SV015', 'CNTT05', N'Công nghệ thông tin', '2000-03-21', N'Nam', '0923456789', 'ngovanp@email.com', N'789 Đường NOP', 1, NULL, 0, 'System'),
    (16, N'Phan Thị Q', 'SV016', 'KT05', N'Kế toán', '2001-04-28', N'Nữ', '0934567890', 'phanthiq@email.com', N'123 Đường QRS', 1, NULL, 0, 'System'),
    (17, N'Dương Văn R', 'SV017', 'QTKD05', N'Quản trị kinh doanh', '2000-05-05', N'Nam', '0945678901', 'duongvanr@email.com', N'456 Đường TUV', 1, NULL, 0, 'System'),
    (18, N'Bạch Thị S', 'SV018', 'CNTT06', N'Công nghệ thông tin', '2001-06-11', N'Nữ', '0956789012', 'bachthis@email.com', N'789 Đường WXY', 1, NULL, 0, 'System'),
    (19, N'Đinh Văn T', 'SV019', 'KT06', N'Kế toán', '2000-07-18', N'Nam', '0967890123', 'dinhvant@email.com', N'123 Đường ZAB', 1, NULL, 0, 'System'),
    (20, N'Cao Thị U', 'SV020', 'QTKD06', N'Quản trị kinh doanh', '2001-08-24', N'Nữ', '0978901234', 'caothiu@email.com', N'456 Đường CDE', 1, NULL, 0, 'System'),
    (21, N'Lương Văn V', 'SV021', 'CNTT07', N'Công nghệ thông tin', '2000-09-30', N'Nam', '0989012345', 'luongvanv@email.com', N'789 Đường FGH', 1, NULL, 0, 'System'),
    (22, N'Trịnh Thị X', 'SV022', 'KT07', N'Kế toán', '2001-10-07', N'Nữ', '0990123456', 'trinhthix@email.com', N'123 Đường IJK', 1, NULL, 0, 'System'),
    (23, N'Đoàn Văn Y', 'SV023', 'QTKD07', N'Quản trị kinh doanh', '2000-11-13', N'Nam', '0901234567', 'doanvany@email.com', N'456 Đường LMN', 1, NULL, 0, 'System'),
    (24, N'Lâm Thị Z', 'SV024', 'CNTT08', N'Công nghệ thông tin', '2001-12-20', N'Nữ', '0912345678', 'lamthiz@email.com', N'789 Đường OPQ', 1, NULL, 0, 'System'),
    (25, N'Vương Văn AA', 'SV025', 'KT08', N'Kế toán', '2000-01-27', N'Nam', '0923456789', 'vuongvanaa@email.com', N'123 Đường RST', 1, NULL, 0, 'System'),
    -- Thêm nhiều sinh viên mới (26-60)
    (26, N'Nguyễn Thị BB', 'SV026', 'CNTT09', N'Công nghệ thông tin', '2001-01-15', N'Nữ', '0934567890', 'nguyenthibb@email.com', N'456 Đường UVW', 1, NULL, 0, 'System'),
    (27, N'Trần Văn CC', 'SV027', 'KT09', N'Kế toán', '2000-02-20', N'Nam', '0945678901', 'tranvancc@email.com', N'789 Đường XYZ', 1, NULL, 0, 'System'),
    (28, N'Lê Thị DD', 'SV028', 'QTKD08', N'Quản trị kinh doanh', '2001-03-10', N'Nữ', '0956789012', 'lethidd@email.com', N'123 Đường ABC', 1, NULL, 0, 'System'),
    (29, N'Phạm Văn EE', 'SV029', 'CNTT10', N'Công nghệ thông tin', '2000-04-25', N'Nam', '0967890123', 'phamvanee@email.com', N'456 Đường DEF', 1, NULL, 0, 'System'),
    (30, N'Hoàng Thị FF', 'SV030', 'KT10', N'Kế toán', '2001-05-05', N'Nữ', '0978901234', 'hoangthiff@email.com', N'789 Đường GHI', 1, NULL, 0, 'System'),
    (31, N'Võ Văn GG', 'SV031', 'QTKD09', N'Quản trị kinh doanh', '2000-06-12', N'Nam', '0989012345', 'vovangg@email.com', N'123 Đường JKL', 1, NULL, 0, 'System'),
    (32, N'Đặng Thị HH', 'SV032', 'CNTT11', N'Công nghệ thông tin', '2001-07-18', N'Nữ', '0990123456', 'dangthihh@email.com', N'456 Đường MNO', 1, NULL, 0, 'System'),
    (33, N'Bùi Văn II', 'SV033', 'KT11', N'Kế toán', '2000-08-22', N'Nam', '0901234567', 'buivanii@email.com', N'789 Đường PQR', 1, NULL, 0, 'System'),
    (34, N'Lý Thị JJ', 'SV034', 'QTKD10', N'Quản trị kinh doanh', '2001-09-28', N'Nữ', '0912345678', 'lythijj@email.com', N'123 Đường STU', 1, NULL, 0, 'System'),
    (35, N'Trương Văn KK', 'SV035', 'CNTT12', N'Công nghệ thông tin', '2000-10-05', N'Nam', '0923456789', 'truongvankk@email.com', N'456 Đường VWX', 1, NULL, 0, 'System'),
    (36, N'Đỗ Thị LL', 'SV036', 'KT12', N'Kế toán', '2001-11-11', N'Nữ', '0934567890', 'dothill@email.com', N'789 Đường YZA', 1, NULL, 0, 'System'),
    (37, N'Vũ Văn MM', 'SV037', 'QTKD11', N'Quản trị kinh doanh', '2000-12-17', N'Nam', '0945678901', 'vuvanmm@email.com', N'123 Đường BCD', 1, NULL, 0, 'System'),
    (38, N'Lưu Thị NN', 'SV038', 'CNTT13', N'Công nghệ thông tin', '2001-01-23', N'Nữ', '0956789012', 'luuthinn@email.com', N'456 Đường EFG', 1, NULL, 0, 'System'),
    (39, N'Ngô Văn OO', 'SV039', 'KT13', N'Kế toán', '2000-02-28', N'Nam', '0967890123', 'ngovanoo@email.com', N'789 Đường HIJ', 1, NULL, 0, 'System'),
    (40, N'Phan Thị PP', 'SV040', 'QTKD12', N'Quản trị kinh doanh', '2001-03-06', N'Nữ', '0978901234', 'phanthipp@email.com', N'123 Đường KLM', 1, NULL, 0, 'System'),
    (41, N'Dương Văn QQ', 'SV041', 'CNTT14', N'Công nghệ thông tin', '2000-04-12', N'Nam', '0989012345', 'duongvanqq@email.com', N'456 Đường NOP', 1, NULL, 0, 'System'),
    (42, N'Bạch Thị RR', 'SV042', 'KT14', N'Kế toán', '2001-05-18', N'Nữ', '0990123456', 'bachthirr@email.com', N'789 Đường QRS', 1, NULL, 0, 'System'),
    (43, N'Đinh Văn SS', 'SV043', 'QTKD13', N'Quản trị kinh doanh', '2000-06-24', N'Nam', '0901234567', 'dinhvanss@email.com', N'123 Đường TUV', 1, NULL, 0, 'System'),
    (44, N'Cao Thị TT', 'SV044', 'CNTT15', N'Công nghệ thông tin', '2001-07-30', N'Nữ', '0912345678', 'caothitt@email.com', N'456 Đường WXY', 1, NULL, 0, 'System'),
    (45, N'Lương Văn UU', 'SV045', 'KT15', N'Kế toán', '2000-08-05', N'Nam', '0923456789', 'luongvanuu@email.com', N'789 Đường ZAB', 1, NULL, 0, 'System'),
    (46, N'Trịnh Thị VV', 'SV046', 'QTKD14', N'Quản trị kinh doanh', '2001-09-11', N'Nữ', '0934567890', 'trinhthivv@email.com', N'123 Đường CDE', 1, NULL, 0, 'System'),
    (47, N'Đoàn Văn WW', 'SV047', 'CNTT16', N'Công nghệ thông tin', '2000-10-17', N'Nam', '0945678901', 'doanvanww@email.com', N'456 Đường FGH', 1, NULL, 0, 'System'),
    (48, N'Lâm Thị XX', 'SV048', 'KT16', N'Kế toán', '2001-11-23', N'Nữ', '0956789012', 'lamthixx@email.com', N'789 Đường IJK', 1, NULL, 0, 'System'),
    (49, N'Vương Văn YY', 'SV049', 'QTKD15', N'Quản trị kinh doanh', '2000-12-29', N'Nam', '0967890123', 'vuongvanyy@email.com', N'123 Đường LMN', 1, NULL, 0, 'System'),
    (50, N'Nguyễn Thị ZZ', 'SV050', 'CNTT17', N'Công nghệ thông tin', '2001-01-04', N'Nữ', '0978901234', 'nguyenthizz@email.com', N'456 Đường OPQ', 1, NULL, 0, 'System'),
    (51, N'Trần Văn AAA', 'SV051', 'KT17', N'Kế toán', '2000-02-10', N'Nam', '0989012345', 'tranvanaaa@email.com', N'789 Đường RST', 1, NULL, 0, 'System'),
    (52, N'Lê Thị BBB', 'SV052', 'QTKD16', N'Quản trị kinh doanh', '2001-03-16', N'Nữ', '0990123456', 'lethibbb@email.com', N'123 Đường UVW', 1, NULL, 0, 'System'),
    (53, N'Phạm Văn CCC', 'SV053', 'CNTT18', N'Công nghệ thông tin', '2000-04-22', N'Nam', '0901234567', 'phamvanccc@email.com', N'456 Đường XYZ', 1, NULL, 0, 'System'),
    (54, N'Hoàng Thị DDD', 'SV054', 'KT18', N'Kế toán', '2001-05-28', N'Nữ', '0912345678', 'hoangthiddd@email.com', N'789 Đường ABC', 1, NULL, 0, 'System'),
    (55, N'Võ Văn EEE', 'SV055', 'QTKD17', N'Quản trị kinh doanh', '2000-06-03', N'Nam', '0923456789', 'vovaneee@email.com', N'123 Đường DEF', 1, NULL, 0, 'System'),
    (56, N'Đặng Thị FFF', 'SV056', 'CNTT19', N'Công nghệ thông tin', '2001-07-09', N'Nữ', '0934567890', 'dangthifff@email.com', N'456 Đường GHI', 1, NULL, 0, 'System'),
    (57, N'Bùi Văn GGG', 'SV057', 'KT19', N'Kế toán', '2000-08-15', N'Nam', '0945678901', 'buivanggg@email.com', N'789 Đường JKL', 1, NULL, 0, 'System'),
    (58, N'Lý Thị HHH', 'SV058', 'QTKD18', N'Quản trị kinh doanh', '2001-09-21', N'Nữ', '0956789012', 'lythihhh@email.com', N'123 Đường MNO', 1, NULL, 0, 'System'),
    (59, N'Trương Văn III', 'SV059', 'CNTT20', N'Công nghệ thông tin', '2000-10-27', N'Nam', '0967890123', 'truongvaniii@email.com', N'456 Đường PQR', 1, NULL, 0, 'System'),
    (60, N'Đỗ Thị JJJ', 'SV060', 'KT20', N'Kế toán', '2001-11-02', N'Nữ', '0978901234', 'dothijjj@email.com', N'789 Đường STU', 1, NULL, 0, 'System');
    SET IDENTITY_INSERT SinhVien OFF;
END
ELSE
BEGIN
    UPDATE SinhVien SET IsDeleted = 0, TrangThai = 1, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaSinhVien BETWEEN 2 AND 60;
    
    -- Xóa MaPhong của các sinh viên không có hợp đồng có hiệu lực
    UPDATE SinhVien
    SET MaPhong = NULL,
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaSinhVien BETWEEN 2 AND 60
        AND NOT EXISTS (
            SELECT 1 
            FROM HopDong hd
            INNER JOIN Giuong g ON hd.MaGiuong = g.MaGiuong AND g.IsDeleted = 0
            WHERE hd.MaSinhVien = SinhVien.MaSinhVien
                AND hd.TrangThai = N'Có hiệu lực'
                AND hd.IsDeleted = 0
                AND GETDATE() BETWEEN hd.NgayBatDau AND hd.NgayKetThuc
        );
    
    -- Cập nhật MaPhong cho các sinh viên có hợp đồng có hiệu lực
    UPDATE SinhVien
    SET MaPhong = (
            SELECT TOP 1 p.MaPhong
            FROM HopDong hd
            INNER JOIN Giuong g ON hd.MaGiuong = g.MaGiuong AND g.IsDeleted = 0
            INNER JOIN Phong p ON g.MaPhong = p.MaPhong AND p.IsDeleted = 0
            WHERE hd.MaSinhVien = SinhVien.MaSinhVien
                AND hd.TrangThai = N'Có hiệu lực'
                AND hd.IsDeleted = 0
                AND GETDATE() BETWEEN hd.NgayBatDau AND hd.NgayKetThuc
            ORDER BY hd.NgayBatDau DESC
        ),
        NgayCapNhat = GETDATE(),
        NguoiCapNhat = 'System'
    WHERE MaSinhVien BETWEEN 2 AND 60
        AND EXISTS (
            SELECT 1 
            FROM HopDong hd
            WHERE hd.MaSinhVien = SinhVien.MaSinhVien
                AND hd.TrangThai = N'Có hiệu lực'
                AND hd.IsDeleted = 0
                AND GETDATE() BETWEEN hd.NgayBatDau AND hd.NgayKetThuc
        );
END

-- Đảm bảo SinhVien 1 có MaPhong chỉ khi có hợp đồng có hiệu lực
IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 1)
BEGIN
    DECLARE @MaPhongHopDong1 INT = NULL;
    SELECT TOP 1 @MaPhongHopDong1 = p.MaPhong
    FROM HopDong hd
    INNER JOIN Giuong g ON hd.MaGiuong = g.MaGiuong AND g.IsDeleted = 0
    INNER JOIN Phong p ON g.MaPhong = p.MaPhong AND p.IsDeleted = 0
    WHERE hd.MaSinhVien = 1 
        AND hd.TrangThai = N'Có hiệu lực'
        AND hd.IsDeleted = 0
        AND GETDATE() BETWEEN hd.NgayBatDau AND hd.NgayKetThuc
    ORDER BY hd.NgayBatDau DESC;
    
    IF @MaPhongHopDong1 IS NOT NULL
    BEGIN
        UPDATE SinhVien 
        SET MaPhong = @MaPhongHopDong1,
            IsDeleted = 0,
            TrangThai = 1,
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE MaSinhVien = 1;
    END
    ELSE
    BEGIN
        -- Nếu không có hợp đồng có hiệu lực, đảm bảo MaPhong = NULL
        UPDATE SinhVien 
        SET MaPhong = NULL,
            IsDeleted = 0,
            TrangThai = 1,
            NgayCapNhat = GETDATE(),
            NguoiCapNhat = 'System'
        WHERE MaSinhVien = 1;
    END
END
GO

-- =============================================
-- 5. MUC PHI (Mức phí)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM MucPhi)
BEGIN
    INSERT INTO MucPhi (TenMucPhi, LoaiPhi, GiaTien, DonVi, TrangThai, GhiChu, NguoiTao) VALUES
    (N'Phí phòng 4 người', N'Phí phòng', 500000, N'VND/tháng', 1, N'Phí cơ bản cho phòng 4 người', 'System'),
    (N'Phí phòng 2 người', N'Phí phòng', 300000, N'VND/tháng', 1, N'Phí cơ bản cho phòng 2 người', 'System'),
    (N'Phí điện', N'Phí điện', 3500, N'VND/kWh', 1, N'Theo bậc thang', 'System'),
    (N'Phí nước', N'Phí nước', 15000, N'VND/m3', 1, N'Theo bậc thang', 'System'),
    (N'Phí dịch vụ', N'Dịch vụ', 50000, N'VND/tháng', 1, N'Phí dịch vụ chung', 'System'),
    (N'Phí bảo trì', N'Dịch vụ', 20000, N'VND/tháng', 1, N'Phí bảo trì cơ sở vật chất', 'System');
END
GO

-- =============================================
-- 6. CAU HINH PHI (Cấu hình phí)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM CauHinhPhi)
BEGIN
    INSERT INTO CauHinhPhi (Loai, MucToiThieu, TrangThai, NguoiTao) VALUES
    (N'Điện', 0, 1, 'System'),
    (N'Nước', 0, 1, 'System');
END
GO

-- =============================================
-- 7. BAC GIA (Bậc giá)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM BacGia)
BEGIN
    INSERT INTO BacGia (Loai, ThuTu, TuSo, DenSo, DonGia, TrangThai, NguoiTao) VALUES
    -- Bậc giá điện
    (N'Điện', 1, 0, 50, 1800, 1, 'System'),
    (N'Điện', 2, 51, 100, 2000, 1, 'System'),
    (N'Điện', 3, 101, 200, 2500, 1, 'System'),
    (N'Điện', 4, 201, 300, 3000, 1, 'System'),
    (N'Điện', 5, 301, 999999, 3500, 1, 'System'),
    -- Bậc giá nước
    (N'Nước', 1, 0, 10, 10000, 1, 'System'),
    (N'Nước', 2, 11, 20, 12000, 1, 'System'),
    (N'Nước', 3, 21, 30, 15000, 1, 'System'),
    (N'Nước', 4, 31, 999999, 20000, 1, 'System');
END
GO

-- =============================================
-- 8. HOP DONG (Hợp đồng)
-- =============================================
-- Đảm bảo SinhVien và Giuong tồn tại trước khi INSERT HopDong
-- Kiểm tra từng hợp đồng riêng lẻ để tránh lỗi duplicate key
    SET IDENTITY_INSERT HopDong ON;

-- Hợp đồng 1
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 1)
    AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 1 AND IsDeleted = 0) 
       AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 1 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (1, 1, 1, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    
-- Hợp đồng 2
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 2)
    AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 2 AND IsDeleted = 0) 
       AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 5 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (2, 2, 5, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    
-- Hợp đồng 3
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 3)
    AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 3 AND IsDeleted = 0) 
       AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 9 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (3, 3, 9, '2025-02-01', '2025-08-31', 300000, N'Chờ duyệt', N'Đăng ký học kỳ 2', 0, GETDATE(), 'System');
    END
    
-- Hợp đồng 4
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 4)
    AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 4 AND IsDeleted = 0) 
       AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 11 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (4, 4, 11, '2023-09-01', '2024-06-30', 500000, N'Đã hết hạn', N'Hợp đồng cũ', 0, GETDATE(), 'System');
END

-- Hợp đồng 5
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 5)
    AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 5 AND IsDeleted = 0) 
    AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 37 AND IsDeleted = 0)
BEGIN
    INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (5, 5, 37, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
END

-- Hợp đồng 6
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 6)
    AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 6 AND IsDeleted = 0) 
    AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 38 AND IsDeleted = 0)
BEGIN
    INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (6, 6, 38, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
END

-- Hợp đồng 7
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 7)
    AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 7 AND IsDeleted = 0) 
    AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 39 AND IsDeleted = 0)
BEGIN
    INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (7, 7, 39, '2025-02-01', '2025-08-31', 300000, N'Chờ duyệt', N'Đăng ký học kỳ 2', 0, GETDATE(), 'System');
END

-- Hợp đồng 8
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 8)
    AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 8 AND IsDeleted = 0) 
    AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 40 AND IsDeleted = 0)
BEGIN
    INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (8, 8, 40, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
END

-- Hợp đồng 9
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 9)
    AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 9 AND IsDeleted = 0) 
    AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 45 AND IsDeleted = 0)
BEGIN
    INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (9, 9, 45, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
END

-- Hợp đồng 10
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 10)
    AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 10 AND IsDeleted = 0) 
    AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 46 AND IsDeleted = 0)
BEGIN
    INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (10, 10, 46, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
END
    
    -- Thêm hợp đồng có hiệu lực cho các sinh viên mới (11-60) để họ có phòng
    -- Sinh viên 11-25 (tiếp tục từ hợp đồng 11)
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 11)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 11 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 47 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (11, 11, 47, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 12)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 12 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 48 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (12, 12, 48, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 13)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 13 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 49 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (13, 13, 49, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 14)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 14 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 50 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (14, 14, 50, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 15)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 15 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 51 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (15, 15, 51, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 16)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 16 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 52 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (16, 16, 52, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 17)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 17 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 53 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (17, 17, 53, '2024-09-01', '2025-06-30', 300000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 18)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 18 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 54 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (18, 18, 54, '2024-09-01', '2025-06-30', 300000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 19)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 19 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 55 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (19, 19, 55, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 20)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 20 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 56 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (20, 20, 56, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 21)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 21 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 57 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (21, 21, 57, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 22)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 22 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 58 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (22, 22, 58, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 23)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 23 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 59 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (23, 23, 59, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 24)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 24 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 60 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (24, 24, 60, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 25)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 25 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 61 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (25, 25, 61, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    
    -- Sinh viên 26-40
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 26)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 26 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 62 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (26, 26, 62, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 27)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 27 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 63 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (27, 27, 63, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 28)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 28 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 64 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (28, 28, 64, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 29)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 29 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 65 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (29, 29, 65, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 30)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 30 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 66 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (30, 30, 66, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 31)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 31 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 67 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (31, 31, 67, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 32)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 32 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 68 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (32, 32, 68, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 33)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 33 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 69 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (33, 33, 69, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 34)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 34 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 70 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (34, 34, 70, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 35)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 35 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 71 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (35, 35, 71, '2024-09-01', '2025-06-30', 300000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 36)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 36 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 72 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (36, 36, 72, '2024-09-01', '2025-06-30', 300000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 37)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 37 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 73 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (37, 37, 73, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 38)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 38 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 74 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (38, 38, 74, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 39)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 39 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 75 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (39, 39, 75, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 40)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 40 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 76 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (40, 40, 76, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    
    -- Sinh viên 41-60
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 41)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 41 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 77 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (41, 41, 77, '2024-09-01', '2025-06-30', 300000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 42)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 42 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 78 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (42, 42, 78, '2024-09-01', '2025-06-30', 300000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 43)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 43 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 79 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (43, 43, 79, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 44)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 44 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 80 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (44, 44, 80, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 45)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 45 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 81 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (45, 45, 81, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 46)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 46 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 82 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (46, 46, 82, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 47)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 47 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 83 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (47, 47, 83, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 48)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 48 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 84 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (48, 48, 84, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 49)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 49 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 85 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (49, 49, 85, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 50)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 50 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 86 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (50, 50, 86, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 51)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 51 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 87 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (51, 51, 87, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 52)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 52 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 88 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (52, 52, 88, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 53)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 53 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 89 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (53, 53, 89, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 54)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 54 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 90 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (54, 54, 90, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 55)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 55 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 91 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (55, 55, 91, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 56)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 56 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 92 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (56, 56, 92, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 57)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 57 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 93 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (57, 57, 93, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 58)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 58 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 94 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (58, 58, 94, '2024-09-01', '2025-06-30', 500000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 59)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 59 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 95 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (59, 59, 95, '2024-09-01', '2025-06-30', 300000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 60)
        AND EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 60 AND IsDeleted = 0) 
        AND EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 96 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HopDong (MaHopDong, MaSinhVien, MaGiuong, NgayBatDau, NgayKetThuc, GiaPhong, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (60, 60, 96, '2024-09-01', '2025-06-30', 300000, N'Có hiệu lực', N'Hợp đồng học kỳ 2024-2025', 0, GETDATE(), 'System');
    END
    
SET IDENTITY_INSERT HopDong OFF;

-- Cập nhật các hợp đồng đã tồn tại (nếu có)
UPDATE HopDong 
SET IsDeleted = 0, 
    NgayCapNhat = GETDATE(), 
    NguoiCapNhat = 'System' 
WHERE MaHopDong BETWEEN 1 AND 60;
GO

-- Cập nhật MaPhong cho tất cả sinh viên có hợp đồng có hiệu lực
-- Sử dụng sp_HopDong_Confirm logic để đảm bảo MaPhong được set đúng
UPDATE SinhVien
SET MaPhong = (
        SELECT TOP 1 p.MaPhong
        FROM HopDong hd
        INNER JOIN Giuong g ON hd.MaGiuong = g.MaGiuong AND g.IsDeleted = 0
        INNER JOIN Phong p ON g.MaPhong = p.MaPhong AND p.IsDeleted = 0
        WHERE hd.MaSinhVien = SinhVien.MaSinhVien
            AND hd.TrangThai = N'Có hiệu lực'
            AND hd.IsDeleted = 0
            AND GETDATE() BETWEEN hd.NgayBatDau AND hd.NgayKetThuc
        ORDER BY hd.NgayBatDau DESC
    ),
    NgayCapNhat = GETDATE(),
    NguoiCapNhat = 'System'
WHERE EXISTS (
        SELECT 1 
        FROM HopDong hd
        WHERE hd.MaSinhVien = SinhVien.MaSinhVien
            AND hd.TrangThai = N'Có hiệu lực'
            AND hd.IsDeleted = 0
            AND GETDATE() BETWEEN hd.NgayBatDau AND hd.NgayKetThuc
    )
    AND MaSinhVien BETWEEN 1 AND 60;

-- Cập nhật trạng thái giường cho các hợp đồng có hiệu lực
UPDATE Giuong
SET TrangThai = N'Đã có người',
    NgayCapNhat = GETDATE(),
    NguoiCapNhat = 'System'
WHERE MaGiuong IN (
    SELECT DISTINCT hd.MaGiuong
    FROM HopDong hd
    WHERE hd.TrangThai = N'Có hiệu lực'
        AND hd.IsDeleted = 0
        AND GETDATE() BETWEEN hd.NgayBatDau AND hd.NgayKetThuc
)
AND IsDeleted = 0;

-- Cập nhật trạng thái phòng
UPDATE Phong
SET TrangThai = CASE 
                    WHEN (SELECT COUNT(*) FROM Giuong WHERE MaPhong = Phong.MaPhong AND TrangThai = N'Trống' AND IsDeleted = 0) = 0 
                    THEN N'Đã đầy'
                    WHEN (SELECT COUNT(*) FROM Giuong WHERE MaPhong = Phong.MaPhong AND TrangThai = N'Đã có người' AND IsDeleted = 0) > 0
                    THEN N'Đã có người'
                    ELSE N'Trống'
                END,
    NgayCapNhat = GETDATE(),
    NguoiCapNhat = 'System'
WHERE IsDeleted = 0;
GO

-- =============================================
-- 9. CHI SO DIEN NUOC (Chỉ số điện nước)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM ChiSoDienNuoc WHERE MaChiSo = 1)
BEGIN
    SET IDENTITY_INSERT ChiSoDienNuoc ON;
    -- Chỉ số tháng 12/2024
    INSERT INTO ChiSoDienNuoc (MaChiSo, MaPhong, Thang, Nam, ChiSoDien, ChiSoNuoc, NguoiGhi, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
    (1, 1, 12, 2024, 150, 25, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 12/2024', 0, GETDATE(), 'System'),
    (2, 2, 12, 2024, 120, 20, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 12/2024', 0, GETDATE(), 'System'),
    (3, 4, 12, 2024, 0, 0, N'Nhân viên', N'Đã ghi', N'Phòng trống', 0, GETDATE(), 'System'),
    (4, 5, 12, 2024, 0, 0, N'Nhân viên', N'Đã ghi', N'Phòng trống', 0, GETDATE(), 'System'),
    -- Chỉ số tháng 1/2025
    (5, 1, 1, 2025, 180, 30, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 1/2025', 0, GETDATE(), 'System'),
    (6, 2, 1, 2025, 145, 25, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 1/2025', 0, GETDATE(), 'System'),
    (7, 4, 1, 2025, 0, 0, N'Nhân viên', N'Đã ghi', N'Phòng trống', 0, GETDATE(), 'System'),
    (8, 5, 1, 2025, 0, 0, N'Nhân viên', N'Đã ghi', N'Phòng trống', 0, GETDATE(), 'System'),
    -- Chỉ số tháng 10/2024
    (9, 1, 10, 2024, 120, 20, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 10/2024', 0, GETDATE(), 'System'),
    (10, 2, 10, 2024, 100, 18, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 10/2024', 0, GETDATE(), 'System'),
    -- Chỉ số tháng 11/2024
    (11, 1, 11, 2024, 135, 22, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 11/2024', 0, GETDATE(), 'System'),
    (12, 2, 11, 2024, 110, 19, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 11/2024', 0, GETDATE(), 'System'),
    -- Chỉ số tháng 2/2025
    (13, 1, 2, 2025, 200, 35, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 2/2025', 0, GETDATE(), 'System'),
    (14, 2, 2, 2025, 165, 30, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 2/2025', 0, GETDATE(), 'System'),
    (15, 6, 2, 2025, 50, 10, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 2/2025', 0, GETDATE(), 'System'),
    (16, 7, 2, 2025, 45, 8, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 2/2025', 0, GETDATE(), 'System'),
    -- Chỉ số tháng 3/2025
    (17, 1, 3, 2025, 220, 40, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 3/2025', 0, GETDATE(), 'System'),
    (18, 2, 3, 2025, 180, 35, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 3/2025', 0, GETDATE(), 'System'),
    (19, 6, 3, 2025, 60, 12, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 3/2025', 0, GETDATE(), 'System'),
    (20, 7, 3, 2025, 55, 10, N'Nhân viên', N'Đã ghi', N'Chỉ số tháng 3/2025', 0, GETDATE(), 'System');
    SET IDENTITY_INSERT ChiSoDienNuoc OFF;
END
ELSE
BEGIN
    UPDATE ChiSoDienNuoc SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaChiSo BETWEEN 1 AND 20;
END
GO

-- =============================================
-- 10. HOA DON (Hóa đơn)
-- =============================================
-- Đảm bảo SinhVien, Phong, và HopDong tồn tại trước khi INSERT HoaDon
IF NOT EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 1)
BEGIN
    SET IDENTITY_INSERT HoaDon ON;
    -- Chỉ INSERT nếu SinhVien, Phong, và HopDong tồn tại
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 1 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 1 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 1 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HoaDon (MaHoaDon, MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (1, 1, 1, 1, 1, 2025, 550000, N'Chưa thanh toán', DATEADD(DAY, 10, GETDATE()), NULL, N'Hóa đơn tiền phòng tháng 01/2025', 0, GETDATE(), 'System'),
        (3, 1, 1, 1, 12, 2024, 550000, N'Đã thanh toán', DATEADD(DAY, -15, GETDATE()), DATEADD(DAY, -5, GETDATE()), N'Đã thu tiền mặt', 0, GETDATE(), 'System'),
        (5, 1, 1, 1, 11, 2024, 550000, N'Chưa thanh toán', DATEADD(DAY, -20, GETDATE()), NULL, N'Hóa đơn quá hạn', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 2 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 2 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 2 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HoaDon (MaHoaDon, MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (2, 2, 2, 2, 1, 2025, 550000, N'Chưa thanh toán', DATEADD(DAY, 10, GETDATE()), NULL, N'Hóa đơn tiền phòng tháng 01/2025', 0, GETDATE(), 'System'),
        (4, 2, 2, 2, 12, 2024, 550000, N'Đã thanh toán', DATEADD(DAY, -15, GETDATE()), DATEADD(DAY, -5, GETDATE()), N'Đã thu tiền mặt', 0, GETDATE(), 'System');
    END
    
    -- Thêm hóa đơn cho các sinh viên mới
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 5 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 4 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 5 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HoaDon (MaHoaDon, MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (6, 5, 4, 5, 1, 2025, 550000, N'Chưa thanh toán', DATEADD(DAY, 10, GETDATE()), NULL, N'Hóa đơn tiền phòng tháng 01/2025', 0, GETDATE(), 'System'),
        (7, 5, 4, 5, 2, 2025, 600000, N'Chưa thanh toán', DATEADD(DAY, 5, GETDATE()), NULL, N'Hóa đơn tiền phòng tháng 02/2025', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 6 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 4 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 6 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HoaDon (MaHoaDon, MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (8, 6, 4, 6, 1, 2025, 550000, N'Đã thanh toán', DATEADD(DAY, -10, GETDATE()), DATEADD(DAY, -8, GETDATE()), N'Đã thanh toán đầy đủ', 0, GETDATE(), 'System'),
        (9, 6, 4, 6, 2, 2025, 600000, N'Chưa thanh toán', DATEADD(DAY, 5, GETDATE()), NULL, N'Hóa đơn tiền phòng tháng 02/2025', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 8 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 4 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 8 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HoaDon (MaHoaDon, MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (10, 8, 4, 8, 1, 2025, 550000, N'Chưa thanh toán', DATEADD(DAY, -5, GETDATE()), NULL, N'Hóa đơn quá hạn', 0, GETDATE(), 'System'),
        (11, 8, 4, 8, 2, 2025, 600000, N'Chưa thanh toán', DATEADD(DAY, 5, GETDATE()), NULL, N'Hóa đơn tiền phòng tháng 02/2025', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 9 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 6 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 9 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HoaDon (MaHoaDon, MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (12, 9, 6, 9, 1, 2025, 550000, N'Đã thanh toán', DATEADD(DAY, -12, GETDATE()), DATEADD(DAY, -10, GETDATE()), N'Thanh toán qua chuyển khoản', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 10 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 6 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HopDong WHERE MaHopDong = 10 AND IsDeleted = 0)
    BEGIN
        INSERT INTO HoaDon (MaHoaDon, MaSinhVien, MaPhong, MaHopDong, Thang, Nam, TongTien, TrangThai, HanThanhToan, NgayThanhToan, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (13, 10, 6, 10, 1, 2025, 550000, N'Chưa thanh toán', DATEADD(DAY, 10, GETDATE()), NULL, N'Hóa đơn tiền phòng tháng 01/2025', 0, GETDATE(), 'System');
    END
    
    SET IDENTITY_INSERT HoaDon OFF;
END
ELSE
BEGIN
    UPDATE HoaDon SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaHoaDon BETWEEN 1 AND 13;
END
GO

-- =============================================
-- 11. CHI TIET HOA DON (Chi tiết hóa đơn)
-- =============================================
-- Đảm bảo HoaDon tồn tại trước khi INSERT ChiTietHoaDon
IF NOT EXISTS (SELECT 1 FROM ChiTietHoaDon WHERE MaChiTiet = 1)
BEGIN
    SET IDENTITY_INSERT ChiTietHoaDon ON;
    -- Chỉ INSERT nếu HoaDon tồn tại
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 1 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (1, 1, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (2, 1, N'Điện', 30, 0, 54000, N'Tiêu thụ 30 kWh (chênh lệch từ tháng 12)', 0, GETDATE(), 'System'),
        (3, 1, N'Nước', 5, 0, 50000, N'Tiêu thụ 5 m3 (chênh lệch từ tháng 12)', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 2 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (4, 2, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (5, 2, N'Điện', 25, 0, 45000, N'Tiêu thụ 25 kWh', 0, GETDATE(), 'System'),
        (6, 2, N'Nước', 5, 0, 50000, N'Tiêu thụ 5 m3', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 3 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (7, 3, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (8, 3, N'Điện', 30, 0, 54000, N'Tiêu thụ 30 kWh', 0, GETDATE(), 'System'),
        (9, 3, N'Nước', 5, 0, 50000, N'Tiêu thụ 5 m3', 0, GETDATE(), 'System');
    END
    
    -- Thêm chi tiết hóa đơn cho các hóa đơn mới
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 4 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (10, 4, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (11, 4, N'Điện', 25, 0, 45000, N'Tiêu thụ 25 kWh', 0, GETDATE(), 'System'),
        (12, 4, N'Nước', 5, 0, 50000, N'Tiêu thụ 5 m3', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 6 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (13, 6, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (14, 6, N'Điện', 20, 0, 36000, N'Tiêu thụ 20 kWh', 0, GETDATE(), 'System'),
        (15, 6, N'Nước', 4, 0, 40000, N'Tiêu thụ 4 m3', 0, GETDATE(), 'System'),
        (16, 6, N'Dịch vụ', 1, 50000, 50000, N'Phí dịch vụ chung', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 7 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (17, 7, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (18, 7, N'Điện', 20, 0, 36000, N'Tiêu thụ 20 kWh', 0, GETDATE(), 'System'),
        (19, 7, N'Nước', 5, 0, 50000, N'Tiêu thụ 5 m3', 0, GETDATE(), 'System'),
        (20, 7, N'Dịch vụ', 1, 50000, 50000, N'Phí dịch vụ chung', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 8 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (21, 8, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (22, 8, N'Điện', 20, 0, 36000, N'Tiêu thụ 20 kWh', 0, GETDATE(), 'System'),
        (23, 8, N'Nước', 4, 0, 40000, N'Tiêu thụ 4 m3', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 9 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (24, 9, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (25, 9, N'Điện', 20, 0, 36000, N'Tiêu thụ 20 kWh', 0, GETDATE(), 'System'),
        (26, 9, N'Nước', 5, 0, 50000, N'Tiêu thụ 5 m3', 0, GETDATE(), 'System'),
        (27, 9, N'Dịch vụ', 1, 50000, 50000, N'Phí dịch vụ chung', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 10 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (28, 10, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (29, 10, N'Điện', 20, 0, 36000, N'Tiêu thụ 20 kWh', 0, GETDATE(), 'System'),
        (30, 10, N'Nước', 4, 0, 40000, N'Tiêu thụ 4 m3', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 11 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (31, 11, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (32, 11, N'Điện', 20, 0, 36000, N'Tiêu thụ 20 kWh', 0, GETDATE(), 'System'),
        (33, 11, N'Nước', 5, 0, 50000, N'Tiêu thụ 5 m3', 0, GETDATE(), 'System'),
        (34, 11, N'Dịch vụ', 1, 50000, 50000, N'Phí dịch vụ chung', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 12 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (35, 12, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (36, 12, N'Điện', 20, 0, 36000, N'Tiêu thụ 20 kWh', 0, GETDATE(), 'System'),
        (37, 12, N'Nước', 4, 0, 40000, N'Tiêu thụ 4 m3', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 13 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ChiTietHoaDon (MaChiTiet, MaHoaDon, LoaiChiPhi, SoLuong, DonGia, ThanhTien, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (38, 13, N'Phí phòng', 1, 500000, 500000, N'Phí phòng 4 người', 0, GETDATE(), 'System'),
        (39, 13, N'Điện', 20, 0, 36000, N'Tiêu thụ 20 kWh', 0, GETDATE(), 'System'),
        (40, 13, N'Nước', 5, 0, 50000, N'Tiêu thụ 5 m3', 0, GETDATE(), 'System');
    END
    
    SET IDENTITY_INSERT ChiTietHoaDon OFF;
END
ELSE
BEGIN
    UPDATE ChiTietHoaDon SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaChiTiet BETWEEN 1 AND 40;
END
GO

-- =============================================
-- 12. BIEN LAI THU (Biên lai thu)
-- =============================================
-- Đảm bảo HoaDon tồn tại trước khi INSERT BienLaiThu
IF NOT EXISTS (SELECT 1 FROM BienLaiThu WHERE MaBienLai = 1)
BEGIN
    SET IDENTITY_INSERT BienLaiThu ON;
    -- Chỉ INSERT nếu HoaDon tồn tại
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 3 AND IsDeleted = 0)
    BEGIN
        INSERT INTO BienLaiThu (MaBienLai, MaHoaDon, SoTienThu, NgayThu, PhuongThucThanhToan, NguoiThu, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (1, 3, 550000, DATEADD(DAY, -5, GETDATE()), N'Tiền mặt', N'Nguyễn Văn A', N'Thanh toán đầy đủ', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 4 AND IsDeleted = 0)
    BEGIN
        INSERT INTO BienLaiThu (MaBienLai, MaHoaDon, SoTienThu, NgayThu, PhuongThucThanhToan, NguoiThu, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (2, 4, 550000, DATEADD(DAY, -5, GETDATE()), N'Chuyển khoản', N'Trần Thị B', N'Thanh toán qua ngân hàng', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 5 AND IsDeleted = 0)
    BEGIN
        INSERT INTO BienLaiThu (MaBienLai, MaHoaDon, SoTienThu, NgayThu, PhuongThucThanhToan, NguoiThu, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (3, 5, 300000, DATEADD(DAY, -10, GETDATE()), N'Tiền mặt', N'Nguyễn Văn A', N'Thanh toán một phần', 0, GETDATE(), 'System');
    END
    
    -- Thêm biên lai thu cho các hóa đơn đã thanh toán
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 8 AND IsDeleted = 0)
    BEGIN
        INSERT INTO BienLaiThu (MaBienLai, MaHoaDon, SoTienThu, NgayThu, PhuongThucThanhToan, NguoiThu, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (4, 8, 550000, DATEADD(DAY, -8, GETDATE()), N'Chuyển khoản', N'Nguyễn Thị F', N'Thanh toán đầy đủ qua ngân hàng', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 12 AND IsDeleted = 0)
    BEGIN
        INSERT INTO BienLaiThu (MaBienLai, MaHoaDon, SoTienThu, NgayThu, PhuongThucThanhToan, NguoiThu, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (5, 12, 550000, DATEADD(DAY, -10, GETDATE()), N'Chuyển khoản', N'Bùi Văn I', N'Thanh toán qua ngân hàng', 0, GETDATE(), 'System');
    END
    
    SET IDENTITY_INSERT BienLaiThu OFF;
END
ELSE
BEGIN
    UPDATE BienLaiThu SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaBienLai BETWEEN 1 AND 5;
END
GO

-- =============================================
-- 13. KY LUAT (Kỷ luật)
-- =============================================
-- Đảm bảo SinhVien tồn tại trước khi INSERT KyLuat
IF NOT EXISTS (SELECT 1 FROM KyLuat WHERE MaKyLuat = 1)
BEGIN
    SET IDENTITY_INSERT KyLuat ON;
    -- Chỉ INSERT nếu SinhVien tồn tại
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 1 AND IsDeleted = 0)
    BEGIN
        INSERT INTO KyLuat (MaKyLuat, MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (1, 1, N'Vi phạm nội quy', N'Vượt giờ giới nghiêm 30 phút', '2025-02-12', 50000, N'Chưa xử lý', N'Đã nhắc nhở', 0, GETDATE(), 'Seeder'),
        (4, 1, N'Vi phạm nội quy', N'Không dọn dẹp phòng đúng quy định', '2025-01-10', 30000, N'Đã xử lý', N'Đã nhắc nhở và xử phạt', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 2 AND IsDeleted = 0)
    BEGIN
        INSERT INTO KyLuat (MaKyLuat, MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (2, 2, N'Làm hư hỏng tài sản', N'Làm hỏng bàn học tại phòng', '2025-02-20', 150000, N'Đã xử lý', N'Đã bồi thường', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 3 AND IsDeleted = 0)
    BEGIN
        INSERT INTO KyLuat (MaKyLuat, MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (3, 3, N'Gây mất trật tự', N'Làm ồn sau 22h', '2025-01-15', 100000, N'Đã xử lý', N'Đã cảnh cáo', 0, GETDATE(), 'Seeder');
    END
    
    -- Thêm kỷ luật cho các sinh viên mới
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 5 AND IsDeleted = 0)
    BEGIN
        INSERT INTO KyLuat (MaKyLuat, MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (5, 5, N'Vi phạm nội quy', N'Không tắt đèn khi ra khỏi phòng', '2025-02-05', 20000, N'Đã xử lý', N'Đã nhắc nhở', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 6 AND IsDeleted = 0)
    BEGIN
        INSERT INTO KyLuat (MaKyLuat, MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (6, 6, N'Vi phạm nội quy', N'Để khách ở lại qua đêm không báo cáo', '2025-01-20', 100000, N'Chưa xử lý', N'Đang xem xét', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 7 AND IsDeleted = 0)
    BEGIN
        INSERT INTO KyLuat (MaKyLuat, MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (7, 7, N'Làm hư hỏng tài sản', N'Làm hỏng cửa sổ phòng', '2025-02-10', 200000, N'Đã xử lý', N'Đã bồi thường', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 8 AND IsDeleted = 0)
    BEGIN
        INSERT INTO KyLuat (MaKyLuat, MaSinhVien, LoaiViPham, MoTa, NgayViPham, MucPhat, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (8, 8, N'Gây mất trật tự', N'Làm ồn vào giờ nghỉ trưa', '2025-01-25', 50000, N'Đã xử lý', N'Đã cảnh cáo', 0, GETDATE(), 'Seeder');
    END
    
    SET IDENTITY_INSERT KyLuat OFF;
END
ELSE
BEGIN
    UPDATE KyLuat SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaKyLuat BETWEEN 1 AND 8;
END
GO

-- =============================================
-- 14. DIEM REN LUYEN (Điểm rèn luyện)
-- =============================================
-- Đảm bảo SinhVien tồn tại trước khi INSERT DiemRenLuyen
IF NOT EXISTS (SELECT 1 FROM DiemRenLuyen WHERE MaDiem = 1)
BEGIN
    SET IDENTITY_INSERT DiemRenLuyen ON;
    -- Chỉ INSERT nếu SinhVien tồn tại
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 1 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DiemRenLuyen (MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (1, 1, 12, 2024, 85.5, N'Tốt', N'Điểm rèn luyện tháng 12', 0, GETDATE(), 'System'),
        (4, 1, 1, 2025, 80.0, N'Tốt', N'Điểm rèn luyện tháng 1 (bị trừ điểm do vi phạm)', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 2 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DiemRenLuyen (MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (2, 2, 12, 2024, 90.0, N'Xuất sắc', N'Điểm rèn luyện tháng 12', 0, GETDATE(), 'System'),
        (5, 2, 1, 2025, 92.0, N'Xuất sắc', N'Điểm rèn luyện tháng 1', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 3 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DiemRenLuyen (MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (3, 3, 12, 2024, 75.0, N'Khá', N'Điểm rèn luyện tháng 12', 0, GETDATE(), 'System'),
        (6, 3, 1, 2025, 70.0, N'Khá', N'Điểm rèn luyện tháng 1', 0, GETDATE(), 'System');
    END
    
    -- Thêm điểm rèn luyện cho các sinh viên mới
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 4 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DiemRenLuyen (MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (7, 4, 12, 2024, 88.0, N'Tốt', N'Điểm rèn luyện tháng 12', 0, GETDATE(), 'System'),
        (8, 4, 1, 2025, 85.0, N'Tốt', N'Điểm rèn luyện tháng 1', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 5 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DiemRenLuyen (MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (9, 5, 12, 2024, 82.0, N'Tốt', N'Điểm rèn luyện tháng 12', 0, GETDATE(), 'System'),
        (10, 5, 1, 2025, 78.0, N'Khá', N'Điểm rèn luyện tháng 1 (bị trừ điểm)', 0, GETDATE(), 'System'),
        (11, 5, 2, 2025, 80.0, N'Tốt', N'Điểm rèn luyện tháng 2', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 6 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DiemRenLuyen (MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (12, 6, 12, 2024, 91.0, N'Xuất sắc', N'Điểm rèn luyện tháng 12', 0, GETDATE(), 'System'),
        (13, 6, 1, 2025, 93.0, N'Xuất sắc', N'Điểm rèn luyện tháng 1', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 7 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DiemRenLuyen (MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (14, 7, 12, 2024, 72.0, N'Khá', N'Điểm rèn luyện tháng 12', 0, GETDATE(), 'System'),
        (15, 7, 1, 2025, 68.0, N'Trung bình', N'Điểm rèn luyện tháng 1 (bị trừ điểm)', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 8 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DiemRenLuyen (MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (16, 8, 12, 2024, 79.0, N'Khá', N'Điểm rèn luyện tháng 12', 0, GETDATE(), 'System'),
        (17, 8, 1, 2025, 76.0, N'Khá', N'Điểm rèn luyện tháng 1', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 9 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DiemRenLuyen (MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (18, 9, 12, 2024, 86.0, N'Tốt', N'Điểm rèn luyện tháng 12', 0, GETDATE(), 'System'),
        (19, 9, 1, 2025, 88.0, N'Tốt', N'Điểm rèn luyện tháng 1', 0, GETDATE(), 'System');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 10 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DiemRenLuyen (MaDiem, MaSinhVien, Thang, Nam, DiemSo, XepLoai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (20, 10, 12, 2024, 90.0, N'Xuất sắc', N'Điểm rèn luyện tháng 12', 0, GETDATE(), 'System'),
        (21, 10, 1, 2025, 91.0, N'Xuất sắc', N'Điểm rèn luyện tháng 1', 0, GETDATE(), 'System');
    END
    
    SET IDENTITY_INSERT DiemRenLuyen OFF;
END
ELSE
BEGIN
    UPDATE DiemRenLuyen SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaDiem BETWEEN 1 AND 21;
END
GO

-- =============================================
-- 15. DON DANG KY (Đơn đăng ký)
-- =============================================
-- Đảm bảo SinhVien tồn tại trước khi INSERT DonDangKy
IF NOT EXISTS (SELECT 1 FROM DonDangKy WHERE MaDon = 1)
BEGIN
    SET IDENTITY_INSERT DonDangKy ON;
    -- Chỉ INSERT nếu SinhVien tồn tại
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 1 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DonDangKy (MaDon, MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (1, 1, 2, N'Đăng ký phòng A101 cho học kỳ mới', '2025-01-05', N'Đã duyệt', N'Được ưu tiên do thành tích tốt', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 2 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DonDangKy (MaDon, MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (2, 2, 3, N'Đăng ký phòng A103', '2025-01-10', N'Chờ duyệt', N'Đang chờ phê duyệt của quản trị', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 4 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DonDangKy (MaDon, MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (3, 4, 4, N'Đăng ký phòng A201', '2025-01-15', N'Chờ duyệt', N'Đơn mới gửi', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 5 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DonDangKy (MaDon, MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (4, 5, 6, N'Đăng ký phòng B101', '2025-01-20', N'Từ chối', N'Không đủ điều kiện', 0, GETDATE(), 'Seeder');
    END
    
    -- Thêm đơn đăng ký cho các sinh viên mới
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 6 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DonDangKy (MaDon, MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (5, 6, 11, N'Đăng ký phòng B101', '2025-02-01', N'Chờ duyệt', N'Đơn mới gửi', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 7 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DonDangKy (MaDon, MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (6, 7, 13, N'Đăng ký phòng B103', '2025-02-05', N'Đã duyệt', N'Được chấp nhận', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 8 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DonDangKy (MaDon, MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (7, 8, 18, N'Đăng ký phòng C101', '2025-02-10', N'Chờ duyệt', N'Đang xem xét', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 9 AND IsDeleted = 0)
    BEGIN
        INSERT INTO DonDangKy (MaDon, MaSinhVien, MaPhongDeXuat, LyDo, NgayDangKy, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (8, 9, 19, N'Đăng ký phòng C102', '2025-02-15', N'Từ chối', N'Phòng đã đầy', 0, GETDATE(), 'Seeder');
    END
    
    SET IDENTITY_INSERT DonDangKy OFF;
END
ELSE
BEGIN
    UPDATE DonDangKy SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaDon BETWEEN 1 AND 8;
END
GO

-- =============================================
-- 16. YEU CAU CHUYEN PHONG (Yêu cầu chuyển phòng)
-- =============================================
-- Đảm bảo SinhVien tồn tại trước khi INSERT YeuCauChuyenPhong
IF NOT EXISTS (SELECT 1 FROM YeuCauChuyenPhong WHERE MaYeuCau = 1)
BEGIN
    SET IDENTITY_INSERT YeuCauChuyenPhong ON;
    -- Chỉ INSERT nếu SinhVien tồn tại
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 3 AND IsDeleted = 0)
    BEGIN
        INSERT INTO YeuCauChuyenPhong (MaYeuCau, MaSinhVien, PhongHienTai, PhongMongMuon, LyDo, NgayYeuCau, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (1, 3, 3, 4, N'Muốn chuyển sang phòng có nhiều ánh sáng hơn', '2025-01-18', N'Chờ duyệt', N'Đang xem xét', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 4 AND IsDeleted = 0)
    BEGIN
        INSERT INTO YeuCauChuyenPhong (MaYeuCau, MaSinhVien, PhongHienTai, PhongMongMuon, LyDo, NgayYeuCau, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (2, 4, 4, 5, N'Chuyển phòng để ở cùng bạn', '2025-01-22', N'Đã duyệt', N'Đã chuyển phòng thành công', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 5 AND IsDeleted = 0)
    BEGIN
        INSERT INTO YeuCauChuyenPhong (MaYeuCau, MaSinhVien, PhongHienTai, PhongMongMuon, LyDo, NgayYeuCau, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (3, 5, 5, 6, N'Phòng hiện tại quá ồn', '2025-01-25', N'Từ chối', N'Không có phòng trống phù hợp', 0, GETDATE(), 'Seeder');
    END
    
    -- Thêm yêu cầu chuyển phòng cho các sinh viên mới
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 6 AND IsDeleted = 0)
    BEGIN
        INSERT INTO YeuCauChuyenPhong (MaYeuCau, MaSinhVien, PhongHienTai, PhongMongMuon, LyDo, NgayYeuCau, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (4, 6, 4, 11, N'Muốn chuyển sang phòng tầng 1', '2025-02-08', N'Chờ duyệt', N'Đang xem xét', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 7 AND IsDeleted = 0)
    BEGIN
        INSERT INTO YeuCauChuyenPhong (MaYeuCau, MaSinhVien, PhongHienTai, PhongMongMuon, LyDo, NgayYeuCau, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (5, 7, 4, 12, N'Chuyển phòng để ở gần bạn', '2025-02-12', N'Đã duyệt', N'Đã chuyển phòng thành công', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 8 AND IsDeleted = 0)
    BEGIN
        INSERT INTO YeuCauChuyenPhong (MaYeuCau, MaSinhVien, PhongHienTai, PhongMongMuon, LyDo, NgayYeuCau, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (6, 8, 4, 18, N'Phòng hiện tại không phù hợp', '2025-02-18', N'Từ chối', N'Không có phòng trống', 0, GETDATE(), 'Seeder');
    END
    
    SET IDENTITY_INSERT YeuCauChuyenPhong OFF;
END
ELSE
BEGIN
    UPDATE YeuCauChuyenPhong SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaYeuCau BETWEEN 1 AND 6;
END
GO

-- =============================================
-- 17. THONG BAO QUA HAN (Thông báo quá hạn)
-- =============================================
-- Đảm bảo SinhVien và HoaDon (nếu có) tồn tại trước khi INSERT ThongBaoQuaHan
IF NOT EXISTS (SELECT 1 FROM ThongBaoQuaHan WHERE MaThongBao = 1)
BEGIN
    SET IDENTITY_INSERT ThongBaoQuaHan ON;
    -- Chỉ INSERT nếu SinhVien tồn tại (và HoaDon nếu có MaHoaDon)
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 1 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 1 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ThongBaoQuaHan (MaThongBao, MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (1, 1, 1, GETDATE(), N'Hóa đơn tháng 01/2025 đã quá hạn 5 ngày. Vui lòng thanh toán sớm.', N'Đã gửi', N'Tự động sinh khi quá hạn', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 1 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 5 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ThongBaoQuaHan (MaThongBao, MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (2, 1, 5, DATEADD(DAY, -5, GETDATE()), N'Hóa đơn tháng 11/2024 đã quá hạn 20 ngày. Vui lòng thanh toán ngay.', N'Đã gửi', N'Thông báo quá hạn thanh toán', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 2 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 2 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ThongBaoQuaHan (MaThongBao, MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (3, 2, 2, DATEADD(DAY, -2, GETDATE()), N'Hóa đơn tháng 01/2025 sắp đến hạn thanh toán. Vui lòng chuẩn bị thanh toán.', N'Đã gửi', N'Thông báo nhắc nhở', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 3 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ThongBaoQuaHan (MaThongBao, MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (4, 3, NULL, GETDATE(), N'Bạn có yêu cầu chuyển phòng đang chờ duyệt. Vui lòng kiểm tra.', N'Đã gửi', N'Thông báo về yêu cầu chuyển phòng', 0, GETDATE(), 'Seeder');
    END
    
    -- Thêm thông báo quá hạn cho các sinh viên mới
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 5 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 6 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ThongBaoQuaHan (MaThongBao, MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (5, 5, 6, DATEADD(DAY, -3, GETDATE()), N'Hóa đơn tháng 01/2025 sắp đến hạn thanh toán. Vui lòng chuẩn bị thanh toán.', N'Đã gửi', N'Thông báo nhắc nhở', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 8 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 10 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ThongBaoQuaHan (MaThongBao, MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (6, 8, 10, GETDATE(), N'Hóa đơn tháng 01/2025 đã quá hạn 5 ngày. Vui lòng thanh toán sớm.', N'Đã gửi', N'Tự động sinh khi quá hạn', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 10 AND IsDeleted = 0)
       AND EXISTS (SELECT 1 FROM HoaDon WHERE MaHoaDon = 13 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ThongBaoQuaHan (MaThongBao, MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (7, 10, 13, DATEADD(DAY, -2, GETDATE()), N'Hóa đơn tháng 01/2025 sắp đến hạn thanh toán. Vui lòng chuẩn bị thanh toán.', N'Đã gửi', N'Thông báo nhắc nhở', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 6 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ThongBaoQuaHan (MaThongBao, MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (8, 6, NULL, GETDATE(), N'Bạn có đơn đăng ký phòng đang chờ duyệt. Vui lòng kiểm tra.', N'Đã gửi', N'Thông báo về đơn đăng ký', 0, GETDATE(), 'Seeder');
    END
    
    IF EXISTS (SELECT 1 FROM SinhVien WHERE MaSinhVien = 7 AND IsDeleted = 0)
    BEGIN
        INSERT INTO ThongBaoQuaHan (MaThongBao, MaSinhVien, MaHoaDon, NgayThongBao, NoiDung, TrangThai, GhiChu, IsDeleted, NgayTao, NguoiTao) VALUES
        (9, 7, NULL, GETDATE(), N'Bạn có vi phạm kỷ luật đang chờ xử lý. Vui lòng liên hệ quản lý.', N'Đã gửi', N'Thông báo về kỷ luật', 0, GETDATE(), 'Seeder');
    END
    
    SET IDENTITY_INSERT ThongBaoQuaHan OFF;
END
ELSE
BEGIN
    UPDATE ThongBaoQuaHan SET IsDeleted = 0, NgayCapNhat = GETDATE(), NguoiCapNhat = 'System' WHERE MaThongBao BETWEEN 1 AND 9;
END
GO

-- =============================================
-- 18. TAI KHOAN (Tài khoản) - Tạo tài khoản cho các sinh viên mới
-- =============================================
-- Lưu ý: Mật khẩu mặc định là "123456" (đã hash bằng BCrypt)
-- Hash của "123456" bằng BCrypt: $2a$12$.9dt9qsWexnUz1tl/ucxEeQ1AaF8WTnaRXLl1KNbWA4yE1lLwyhLe
-- Trong thực tế, cần hash mật khẩu bằng BCrypt trước khi insert
-- Sinh viên 1 đã có tài khoản trong file 16_SeedData_Student.sql

-- Tạo tài khoản cho các sinh viên từ 2 đến 60 (nếu chưa có)
-- Sử dụng cursor để tạo tài khoản cho từng sinh viên
DECLARE @DefaultPasswordHash NVARCHAR(255) = '$2a$12$.9dt9qsWexnUz1tl/ucxEeQ1AaF8WTnaRXLl1KNbWA4yE1lLwyhLe'; -- Mật khẩu mặc định: 123456

DECLARE @MaSV INT;
DECLARE @MSSV NVARCHAR(20);
DECLARE @HoTen NVARCHAR(200);
DECLARE @Email NVARCHAR(100);

DECLARE sinhvien_cursor CURSOR FOR
SELECT MaSinhVien, MSSV, HoTen, Email
FROM SinhVien
WHERE MaSinhVien BETWEEN 2 AND 60
  AND IsDeleted = 0
  AND NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TaiKhoan.MaSinhVien = SinhVien.MaSinhVien AND TaiKhoan.IsDeleted = 0);

OPEN sinhvien_cursor;
FETCH NEXT FROM sinhvien_cursor INTO @MaSV, @MSSV, @HoTen, @Email;

WHILE @@FETCH_STATUS = 0
BEGIN
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, VaiTro, TrangThai, MaSinhVien, IsDeleted, NguoiTao) VALUES
    (@MSSV, @DefaultPasswordHash, @HoTen, @Email, 'Student', 1, @MaSV, 0, 'System');
    
    FETCH NEXT FROM sinhvien_cursor INTO @MaSV, @MSSV, @HoTen, @Email;
END;

CLOSE sinhvien_cursor;
DEALLOCATE sinhvien_cursor;
GO

PRINT 'Seed data mẫu đã được tạo thành công!';
PRINT 'Đã tạo dữ liệu cho: ToaNha (5 tòa), Phong (35 phòng), Giuong (150 giường), SinhVien (60 sinh viên), TaiKhoan (59 tài khoản sinh viên), MucPhi, CauHinhPhi, BacGia, HopDong (60 hợp đồng - nhiều hợp đồng có hiệu lực), ChiSoDienNuoc (20 chỉ số), HoaDon (13 hóa đơn), ChiTietHoaDon (40 chi tiết), BienLaiThu (5 biên lai), KyLuat (8 kỷ luật), DiemRenLuyen (21 điểm), DonDangKy (8 đơn), YeuCauChuyenPhong (6 yêu cầu), ThongBaoQuaHan (9 thông báo)';
