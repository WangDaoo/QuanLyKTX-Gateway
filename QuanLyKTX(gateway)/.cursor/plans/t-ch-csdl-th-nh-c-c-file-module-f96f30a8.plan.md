<!-- f96f30a8-4359-4f57-a7e1-6503c3759efd 2cc3f8f2-89b0-4841-ae66-94e29ee394f0 -->
# Kế hoạch tách CSDL.sql thành các file module

## Cấu trúc thư mục đề xuất

```
Database/
├── CSDL.sql (giữ nguyên file gốc)
├── 00_Master.sql (file master gọi tất cả)
├── 01_Tables.sql (tất cả các bảng)
├── 02_Constraints.sql (tất cả constraints)
├── 03_Indexes.sql (tất cả indexes)
├── StoredProcedures/
│   ├── 04_SP_ToaNha_Phong_Giuong.sql
│   ├── 05_SP_SinhVien_TaiKhoan.sql
│   ├── 06_SP_HopDong.sql
│   ├── 07_SP_HoaDon_BienLaiThu_ChiTiet.sql
│   ├── 08_SP_MucPhi_CauHinhPhi_BacGia.sql
│   ├── 09_SP_ChiSoDienNuoc.sql
│   ├── 10_SP_DonDangKy_YeuCauChuyenPhong.sql
│   ├── 11_SP_KyLuat_DiemRenLuyen.sql
│   ├── 12_SP_ThongBaoQuaHan.sql
│   └── 13_SP_BusinessLogic.sql (Reports, Tính toán)
└── SeedData/
    ├── 14_Seed_Admin.sql
    ├── 15_Seed_Officer.sql
    ├── 16_Seed_Student.sql
    └── 17_Seed_SampleData.sql (dữ liệu mẫu khác)
```

## Chi tiết từng file

### 01_Tables.sql

- Tất cả CREATE TABLE statements
- Bao gồm: ToaNha, Phong, Giuong, SinhVien, TaiKhoan, MucPhi, CauHinhPhi, BacGia, HopDong, HoaDon, BienLaiThu, KyLuat, DiemRenLuyen, DonDangKy, YeuCauChuyenPhong, ChiSoDienNuoc, ChiTietHoaDon, ThongBaoQuaHan, AdminDefault, OfficerDefault
- Giữ nguyên logic IF NOT EXISTS

### 02_Constraints.sql

- Tất cả ALTER TABLE ADD CONSTRAINT
- Check constraints (CK_*)
- Unique indexes với filtered conditions
- Foreign key constraints (nếu chưa có trong CREATE TABLE)

### 03_Indexes.sql

- Tất cả CREATE INDEX statements
- Performance indexes (IX_*)
- Unique indexes (nếu không phải constraint)

### StoredProcedures/04_SP_ToaNha_Phong_Giuong.sql

- sp_ToaNha_* (GetAll, GetById, Create, Update, Delete, Insert)
- sp_Phong_* (GetAll, GetById, Create, Update, Delete, GetAvailable, GetCurrentBySinhVien, GetEmpty, Insert)
- sp_Giuong_* (GetAll, GetById, Create, Update, Delete, Insert)

### StoredProcedures/05_SP_SinhVien_TaiKhoan.sql

- sp_SinhVien_* (GetAll, GetById, Create, Update, Delete, GetByTaiKhoan, GetByPhong, UpdateProfile, Insert)
- sp_TaiKhoan_* (GetAll, GetById, Create, Update, Delete, ChangePassword, GetByTenDangNhap, Insert)

### StoredProcedures/06_SP_HopDong.sql

- sp_HopDong_* (GetAll, GetById, Create, Update, Delete, GetBySinhVien, Insert)

### StoredProcedures/07_SP_HoaDon_BienLaiThu_ChiTiet.sql

- sp_HoaDon_* (GetAll, GetById, Create, Update, Delete, GetBySinhVien, GenerateMonthly, Insert)
- sp_BienLaiThu_* (GetAll, GetById, Create, Update, Delete, GetBySinhVien, Insert)
- sp_ChiTietHoaDon_* (GetAll, GetById, Create, Update, Delete, GetByHoaDon)

### StoredProcedures/08_SP_MucPhi_CauHinhPhi_BacGia.sql

- sp_MucPhi_* (GetAll, GetById, Create, Update, Delete, GetByLoaiPhi, GetByType, Insert)
- sp_CauHinhPhi_* (GetAll, GetById, GetByLoai, Create, Update, Delete, Insert)
- sp_BacGia_* (GetAll, GetById, Create, Update, Delete, GetByLoaiPhi, Insert)

### StoredProcedures/09_SP_ChiSoDienNuoc.sql

- sp_ChiSoDienNuoc_* (GetAll, GetById, Create, Update, Delete, GetByPhong, GetByThangNam, Insert)

### StoredProcedures/10_SP_DonDangKy_YeuCauChuyenPhong.sql

- sp_DonDangKy_* (GetAll, GetById, Create, Update, Delete, GetBySinhVien, Insert)
- sp_YeuCauChuyenPhong_* (GetAll, GetById, Create, Update, Delete, GetBySinhVien, Insert)

### StoredProcedures/11_SP_KyLuat_DiemRenLuyen.sql

- sp_KyLuat_* (GetAll, GetById, Create, Update, Delete, GetBySinhVien, Insert)
- sp_DiemRenLuyen_* (GetAll, GetById, Create, Update, Delete, GetBySinhVien, GetBySinhVienAndMonth, Insert)

### StoredProcedures/12_SP_ThongBaoQuaHan.sql

- sp_ThongBaoQuaHan_* (GetAll, GetById, Insert, Update, Delete, GetBySinhVien)

### StoredProcedures/13_SP_BusinessLogic.sql

- sp_TinhTienDien
- sp_TinhTienNuoc
- sp_TaoHoaDonHangThang
- sp_BaoCaoTyLeLapDay
- sp_BaoCaoDoanhThu
- sp_BaoCaoCongNo
- sp_BaoCaoDienNuoc
- sp_BaoCaoKyLuat

### SeedData/14_Seed_Admin.sql

- Tạo/đồng bộ AdminDefault
- Tạo/đồng bộ tài khoản admin trong TaiKhoan

### SeedData/15_Seed_Officer.sql

- Tạo/đồng bộ OfficerDefault
- Tạo/đồng bộ tài khoản officer trong TaiKhoan

### SeedData/16_Seed_Student.sql

- Tạo/đồng bộ tài khoản student trong TaiKhoan
- Đảm bảo SinhVien với MaSinhVien = 1 tồn tại

### SeedData/17_Seed_SampleData.sql

- Seed data cho ToaNha, Phong, Giuong
- Seed data cho SinhVien (trừ student mặc định)
- Seed data cho MucPhi, CauHinhPhi, BacGia
- Seed data cho DonDangKy, KyLuat, HoaDon, ThongBaoQuaHan

### 00_Master.sql

- USE master và tạo database
- Gọi lần lượt: 01_Tables.sql, 02_Constraints.sql, 03_Indexes.sql
- Gọi tất cả files trong StoredProcedures/ theo thứ tự
- Gọi tất cả files trong SeedData/ theo thứ tự
- In thông báo hoàn thành

## Lưu ý

- Giữ nguyên file CSDL.sql gốc để đối chiếu
- Mỗi file phải có header comment mô tả
- Sử dụng số thứ tự prefix để đảm bảo thứ tự thực thi
- File master sử dụng :r hoặc EXEC để gọi các file con (tùy SQL Server version)