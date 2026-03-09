# Hệ Thống Quản Lý Ký Túc Xá Sinh Viên

## Tổng Quan

Hệ thống được xây dựng theo kiến trúc 3 dịch vụ độc lập, giao tiếp qua Ocelot API Gateway và sử dụng SQL Server với Stored Procedures cho toàn bộ CRUD/Business.

- KTX-Gateway (Port 8000): API Gateway (Ocelot)
- KTX-Admin (Port 8001): API quản trị (Admin/Officer)
- KTX-NguoiDung (Port 8002): API dành cho sinh viên

## Kiến Trúc Hệ Thống

```
QuanLyKTX(Cấu trúc gateway)/
├── KTX-Gateway/                    # API Gateway (Ocelot)
│   └── KTX-Gateway/
├── KTX-Admin/                      # Admin API (.NET 8)
│   └── KTX-Admin/
├── KTX-NguoiDung/                  # User API (.NET 8)
│   └── KTX-NguoiDung/
├── Database/                       # SQL Scripts
│   └── CSDL.sql (file chuẩn duy nhất ~5.3k dòng: schema + seed + stored procedures)
├── admin/                          # Demo frontend
│   └── login.html
├── Postman/                        # API Testing
│   ├── QuanLyKTX.postman_collection.json
│   └── QuanLyKTX.postman_environment.json
└── README.md                       # Tài liệu này
```

## Chức Năng Chính

### 👨‍💼 Admin/Cán bộ KTX

- **Quản lý cơ sở vật chất**: Tòa nhà, phòng, giường, mức phí
- **Quản lý sinh viên**: Thông tin sinh viên, hợp đồng ở
- **Quản lý tài chính**: Hóa đơn, biên lai, công nợ
- **Quản lý tiện ích**: Chỉ số điện nước, tính phí theo bậc
- **Quản lý kỷ luật**: Vi phạm, điểm rèn luyện
- **Báo cáo**: Tỷ lệ lấp đầy, doanh thu, nợ đọng, điện nước
- **Import Excel**: Nhập chỉ số điện nước hàng loạt

### 👨‍🎓 Sinh viên

- **Thông tin cá nhân**: Xem profile, phòng hiện tại
- **Tài chính**: Xem hóa đơn, biên lai cá nhân
- **Đăng ký**: Đăng ký phòng, yêu cầu chuyển phòng
- **Kỷ luật**: Xem điểm rèn luyện, vi phạm cá nhân

## Công Nghệ Sử Dụng

### Backend

- .NET 8 (ASP.NET Core)
- SQL Server với Stored Procedures
- JWT Authentication & Authorization (JWT Bearer)
- BCrypt.Net-Next (hash mật khẩu)
- ADO.NET (SqlConnection, SqlCommand)

### Database

- SQL Server + Stored Procedures (CRUD + nghiệp vụ)
- CHECK Constraints, Indexes
- Audit Fields: NgayTao, NguoiTao, NgayCapNhat, NguoiCapNhat, IsDeleted

### Frontend

- **HTML/CSS/JavaScript** (AngularJS)
- **Swagger UI** cho API documentation

### Deployment

- Docker-ready
- Có thể chạy trực tiếp bằng dotnet CLI

## Cơ Sở Dữ Liệu

### Bảng Chính

- **ToaNha**: Quản lý tòa nhà
- **Phong**: Quản lý phòng
- **Giuong**: Quản lý giường
- **SinhVien**: Thông tin sinh viên
- **TaiKhoan**: Tài khoản đăng nhập
- **HopDong**: Hợp đồng ở
- **HoaDon**: Hóa đơn hàng tháng
- **ChiSoDienNuoc**: Chỉ số điện nước
- **MucPhi**: Mức phí các loại
- **CauHinhPhi**: Cấu hình ngưỡng tối thiểu điện/nước
- **BacGia**: Bậc giá điện theo kWh
- **BienLaiThu**: Biên lai thanh toán
- **KyLuat**: Kỷ luật vi phạm
- **DiemRenLuyen**: Điểm rèn luyện
- **DonDangKy**: Đơn đăng ký phòng
- **YeuCauChuyenPhong**: Yêu cầu chuyển phòng
- **ThongBaoQuaHan**: Thông báo quá hạn

### Bảng Mở Rộng

- **ChiTietHoaDon**: Chi tiết hóa đơn

### Bảng Hệ Thống

- **AdminDefault**: Lưu thông tin tài khoản admin mặc định (đảm bảo luôn tồn tại)
- **OfficerDefault**: Lưu thông tin tài khoản officer mặc định (đảm bảo luôn tồn tại)

### Stored Procedures Nghiệp Vụ

- sp_TinhTienDien: Tính tiền điện theo bậc giá (BacGia)
- sp_TinhTienNuoc: Tính tiền nước
- sp_TaoHoaDonHangThang: Tạo hóa đơn hàng tháng tự động
- sp_BaoCaoTyLeLapDay: Báo cáo tỷ lệ lấp đầy
- sp_BaoCaoDoanhThu: Báo cáo doanh thu
- sp_BaoCaoCongNo: Báo cáo công nợ
- sp_BaoCaoDienNuoc: Báo cáo điện nước
- sp_BaoCaoKyLuat: Báo cáo kỷ luật

## Cài Đặt & Chạy

### Yêu Cầu Hệ Thống

- .NET 8 SDK
- SQL Server (SQLEXPRESS)
- PowerShell/Command Prompt

### 1) Cài Đặt Database

```powershell
# Chạy script SQL chính (khuyến nghị)
sqlcmd -S WINDOWS-PC\SQLEXPRESS -E -i "Database\CSDL.sql"
```

**Lưu ý:** File `CSDL.sql` là file hoàn chỉnh nhất:

- ✅ **Database schema đầy đủ** – Tất cả bảng, constraints, indexes trong một script duy nhất
- ✅ **200+ stored procedures** – CRUD, báo cáo, nghiệp vụ tự động (ví dụ: `sp_DonDangKy_Update` tạo hợp đồng, `sp_KyLuat_Create` tự sinh hóa đơn phạt)
- ✅ **Seed data chuẩn** – Tài khoản BCrypt + mẫu `DonDangKy`, `KyLuat`, `HoaDon`, `ThongBaoQuaHan` phục vụ báo cáo
- ✅ **Indexes & constraints** – Tối ưu hiệu năng, đảm bảo toàn vẹn dữ liệu
- ✅ **Aliases** – Tên thủ tục linh hoạt cho cả controller Admin & User

### 2) Cấu Hình Connection String

**KTX-Admin/appsettings.json:**

```json
{
  "ConnectionStrings": {
    "KTX": "Server=WINDOWS-PC\\SQLEXPRESS;Database=QuanLyKyTucXa;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "SecretKey": "super_secret_ktx_admin_key_32_chars_minimum",
    "Issuer": "KTX",
    "Audience": "KTXClients",
    "ExpiryInHours": 12
  }
}
```

**KTX-NguoiDung/appsettings.json:** (tương tự)

### 3) Khởi Động Services

```powershell
# Terminal 1 - Admin API
cd "KTX-Admin\KTX-Admin"
dotnet run -c Release

# Terminal 2 - User API  
cd "KTX-NguoiDung\KTX-NguoiDung"
dotnet run -c Release

# Terminal 3 - Gateway
cd "KTX-Gateway\KTX-Gateway"
dotnet run -c Release
```

### 4) Truy Cập

- **Gateway Swagger**: http://localhost:8000/swagger
- **Admin API**: http://localhost:8001/swagger
- **User API**: http://localhost:8002/swagger
- **Demo Login**: http://localhost:8000/admin/login.html

## Authentication & Authorization

### Đăng Nhập

Endpoints:

- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/auth/users` (yêu cầu role Admin)
- GET `/api/auth/users/{id}` (yêu cầu role Admin)
- PUT `/api/auth/users/{id}` (yêu cầu role Admin)
- DELETE `/api/auth/users/{id}` (yêu cầu role Admin)
- PUT `/api/auth/users/{id}/reset-password` (yêu cầu role Admin)
- PUT `/api/auth/users/{id}/lock` (yêu cầu role Admin)
- POST `/api/auth/change-password` (yêu cầu đăng nhập)

**Request Body:**

```json
{
  "TenDangNhap": "admin",
  "MatKhau": "admin@123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "user": {
    "MaTaiKhoan": 1,
    "TenDangNhap": "admin",
    "HoTen": "Administrator",
    "Email": "admin@ktx.edu.vn",
    "VaiTro": "Admin",
    "TrangThai": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Mọi API khác (trừ login/register) yêu cầu header:
Authorization: Bearer `<token>`

#### Quản Lý Tài Khoản (Admin Only)

**Lấy Tài Khoản Theo ID**

**GET** `/api/auth/users/{id}`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

**Response:**

```json
{
  "success": true,
  "data": {
    "maTaiKhoan": 1,
    "tenDangNhap": "student",
    "hoTen": "Nguyễn Văn A",
    "email": "student@email.com",
    "vaiTro": "Student",
    "trangThai": true,
    "maSinhVien": 1,
    "ngayTao": "2024-01-01T00:00:00",
    "ngayCapNhat": null
  }
}
```

**Cập Nhật Tài Khoản**

**PUT** `/api/auth/users/{id}`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

**Request Body:**

```json
{
  "hoTen": "Nguyễn Văn A - Cập nhật",
  "email": "newemail@email.com",
  "vaiTro": "Student",
  "trangThai": true,
  "maSinhVien": 1
}
```

**Xóa Tài Khoản (Soft Delete)**

**DELETE** `/api/auth/users/{id}`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

**Lưu ý:** Không thể xóa tài khoản admin và officer mặc định.

**Reset Mật Khẩu**

**PUT** `/api/auth/users/{id}/reset-password`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

**Request Body:**

```json
{
  "newPassword": "NewPassword123"
}
```

**Khóa/Mở Khóa Tài Khoản**

**PUT** `/api/auth/users/{id}/lock`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

**Request Body:**

```json
{
  "isLocked": true
}
```

**Lưu ý:** Không thể khóa tài khoản admin và officer mặc định.

### Vai Trò Hệ Thống

- **Admin**: Toàn quyền quản lý
- **Officer**: Quản lý sinh viên, phòng, hóa đơn
- **Student**: Xem thông tin cá nhân, đăng ký phòng

### Tài Khoản Mặc Định (BCrypt Hash)

- admin/admin@123 (Admin) - Password đã hash BCrypt
- officer/officer@123 (Officer) - Password đã hash BCrypt
- student/student@123 (Student) - Password đã hash BCrypt

**Lưu ý:** Hệ thống có fallback mechanism để tự động convert plaintext passwords sang BCrypt khi đăng nhập.

---

## ADMIN API (Port 8001)

### 1. Quản Lý Tòa Nhà

#### Lấy Danh Sách Tòa Nhà

**GET** `/api/buildings`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maToaNha": 1,
    "tenToaNha": "Tòa A",
    "diaChi": "123 Đường ABC",
    "soTang": 5,
    "trangThai": true,
    "moTa": "Tòa nam",
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
]
```

#### Lấy Tòa Nhà Theo ID

**GET** `/api/buildings/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Tòa Nhà Mới

**POST** `/api/buildings`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "tenToaNha": "Tòa B",
  "diaChi": "456 Đường XYZ",
  "soTang": 4,
  "trangThai": true,
  "moTa": "Tòa nữ"
}
```

#### Cập Nhật Tòa Nhà

**PUT** `/api/buildings/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "tenToaNha": "Tòa A - Cập nhật",
  "diaChi": "123 Đường ABC - Mới",
  "soTang": 6,
  "trangThai": true,
  "moTa": "Đã nâng cấp"
}
```

#### Xóa Tòa Nhà

**DELETE** `/api/buildings/{id}`

**Headers:** `Authorization: Bearer <token>`

### 2. Quản Lý Phòng

#### Lấy Danh Sách Phòng

**GET** `/api/rooms`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maPhong": 1,
    "soPhong": "A101",
    "maToaNha": 1,
    "tenToaNha": "Tòa A",
    "soGiuong": 4,
    "loaiPhong": "Phòng 4 người",
    "giaPhong": 500000,
    "trangThai": "Trống",
    "moTa": "Phòng tầng 1",
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin"
  }
]
```

#### Lấy Phòng Theo ID

**GET** `/api/rooms/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Phòng Mới

**POST** `/api/rooms`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "soPhong": "A102",
  "maToaNha": 1,
  "soGiuong": 4,
  "loaiPhong": "Phòng 4 người",
  "giaPhong": 500000,
  "trangThai": "Trống",
  "moTa": "Phòng tầng 1"
}
```

#### Cập Nhật Phòng

**PUT** `/api/rooms/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "soPhong": "A102",
  "maToaNha": 1,
  "soGiuong": 4,
  "loaiPhong": "Phòng 4 người",
  "giaPhong": 500000,
  "trangThai": "Trống",
  "moTa": "Phòng tầng 1"
}
```

#### Xóa Phòng

**DELETE** `/api/rooms/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Lấy Danh Sách Phòng Trống

**GET** `/api/rooms/empty`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maPhong": 1,
      "maToaNha": 1,
      "soPhong": "A101",
      "soGiuong": 4,
      "loaiPhong": "Phòng 4 người",
      "giaPhong": 500000,
      "moTa": "Phòng tầng 1",
      "trangThai": "Trống",
      "tenToaNha": "Tòa A",
      "soGiuongTrong": 2
    }
  ]
}
```

### 3. Quản Lý Giường

#### Lấy Danh Sách Giường

**GET** `/api/beds`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maGiuong": 1,
    "soGiuong": "Giường 1",
    "maPhong": 1,
    "trangThai": "Trống",
    "moTa": "Giường trên",
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin"
  }
]
```

#### Lấy Giường Theo ID

**GET** `/api/beds/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Giường Mới

**POST** `/api/beds`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "soGiuong": "Giường 2",
  "maPhong": 1,
  "trangThai": "Trống",
  "moTa": "Giường dưới"
}
```

#### Cập Nhật Giường

**PUT** `/api/beds/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "soGiuong": "Giường 1",
  "maPhong": 1,
  "trangThai": "Đã cho thuê",
  "moTa": "Giường trên"
}
```

#### Xóa Giường

**DELETE** `/api/beds/{id}`

**Headers:** `Authorization: Bearer <token>`

### 4. Quản Lý Mức Phí

#### Lấy Danh Sách Mức Phí

**GET** `/api/fees`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maMucPhi": 1,
    "tenMucPhi": "Phí phòng 4 người",
    "loaiPhi": "Phí phòng",
    "giaTien": 500000,
    "donVi": "VND/tháng",
    "trangThai": true,
    "ghiChu": "Phí cơ bản",
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin"
  }
]
```

#### Lấy Mức Phí Theo ID

**GET** `/api/fees/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Mức Phí Mới

**POST** `/api/fees`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "tenMucPhi": "Phí điện",
  "loaiPhi": "Phí điện",
  "giaTien": 3500,
  "donVi": "VND/kWh",
  "trangThai": true,
  "ghiChu": "Theo bậc thang"
}
```

#### Cập Nhật Mức Phí

**PUT** `/api/fees/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "tenMucPhi": "Phí điện",
  "loaiPhi": "Phí điện",
  "giaTien": 3500,
  "donVi": "VND/kWh",
  "trangThai": true,
  "ghiChu": "Theo bậc thang"
}
```

#### Xóa Mức Phí

**DELETE** `/api/fees/{id}`

**Headers:** `Authorization: Bearer <token>`

### 5. Quản Lý Bậc Giá

#### Lấy Danh Sách Bậc Giá

**GET** `/api/price-tiers`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maBac": 1,
    "loai": "Dien",
    "thuTu": 1,
    "tuSo": 0,
    "denSo": 50,
    "donGia": 1800,
    "trangThai": true,
    "isDeleted": false,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin"
  }
]
```

#### Lấy Bậc Giá Theo ID

**GET** `/api/price-tiers/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Bậc Giá Mới

**POST** `/api/price-tiers`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "loai": "Dien",
  "thuTu": 1,
  "tuSo": 0,
  "denSo": 50,
  "donGia": 1800,
  "trangThai": true
}
```

#### Cập Nhật Bậc Giá

**PUT** `/api/price-tiers/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "loai": "Dien",
  "thuTu": 1,
  "tuSo": 0,
  "denSo": 50,
  "donGia": 1800,
  "trangThai": true
}
```

#### Xóa Bậc Giá

**DELETE** `/api/price-tiers/{id}`

**Headers:** `Authorization: Bearer <token>`

### 6. Quản Lý Chỉ Số Điện Nước

#### Lấy Danh Sách Chỉ Số

**GET** `/api/meter-readings`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maChiSo": 1,
    "maPhong": 1,
    "thang": 1,
    "nam": 2024,
    "chiSoDien": 100,
    "chiSoNuoc": 50,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiGhi": "admin",
    "trangThai": "Đã ghi",
    "ghiChu": null,
    "isDeleted": false,
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
]
```

#### Lấy Chỉ Số Theo ID

**GET** `/api/meter-readings/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Ghi Chỉ Số Mới

**POST** `/api/meter-readings`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maPhong": 1,
  "thang": 1,
  "nam": 2024,
  "chiSoDien": 100,
  "chiSoNuoc": 50,
  "nguoiGhi": "admin",
  "trangThai": "Đã ghi",
  "ghiChu": "Ghi chỉ số đầu tháng"
}
```

#### Cập Nhật Chỉ Số

**PUT** `/api/meter-readings/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maPhong": 1,
  "thang": 1,
  "nam": 2024,
  "chiSoDien": 100,
  "chiSoNuoc": 50,
  "nguoiGhi": "admin",
  "trangThai": "Đã ghi",
  "ghiChu": "Ghi chỉ số đầu tháng"
}
```

#### Xóa Chỉ Số

**DELETE** `/api/meter-readings/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Import Excel Chỉ Số

**POST** `/api/meter-readings/import-excel`

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Body:** File Excel với cột: MaPhong, Thang, Nam, ChiSoDien, ChiSoNuoc, NguoiGhi

**Response:**

```json
{
  "message": "Import hoàn thành",
  "importedCount": 50,
  "errorCount": 2,
  "errors": ["Dòng 5: Phòng 999 không tồn tại"],
  "totalErrors": 2
}
```

#### Tải Template Excel

**GET** `/api/meter-readings/template`

**Headers:** `Authorization: Bearer <token>`

**Response:** File Excel template

### 7. Quản Lý Hợp Đồng

#### Lấy Danh Sách Hợp Đồng

**GET** `/api/contracts`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maHopDong": 1,
    "maSinhVien": 1,
    "maGiuong": 1,
    "ngayBatDau": "2024-01-01T00:00:00",
    "ngayKetThuc": "2024-12-31T00:00:00",
    "trangThai": "Có hiệu lực",
    "ghiChu": "Hợp đồng năm học 2024",
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin"
  }
]
```

#### Lấy Hợp Đồng Theo ID

**GET** `/api/contracts/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Hợp Đồng Mới

**POST** `/api/contracts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "maGiuong": 1,
  "ngayBatDau": "2024-01-01T00:00:00",
  "ngayKetThuc": "2024-12-31T00:00:00",
  "giaPhong": 500000,
  "trangThai": "Có hiệu lực",
  "ghiChu": "Hợp đồng năm học 2024"
}
```

#### Cập Nhật Hợp Đồng

**PUT** `/api/contracts/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "maGiuong": 1,
  "ngayBatDau": "2024-01-01T00:00:00",
  "ngayKetThuc": "2024-12-31T00:00:00",
  "giaPhong": 500000,
  "trangThai": "Có hiệu lực",
  "ghiChu": "Hợp đồng năm học 2024"
}
```

#### Xóa Hợp Đồng

**DELETE** `/api/contracts/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Gia Hạn Hợp Đồng

**POST** `/api/contracts/{id}/extend`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "soThangGiaHan": 6
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "maHopDong": 1,
    "maSinhVien": 1,
    "maGiuong": 1,
    "ngayBatDau": "2024-01-01T00:00:00",
    "ngayKetThuc": "2025-06-30T00:00:00",
    "giaPhong": 500000,
    "trangThai": "Có hiệu lực",
    "ghiChu": "Hợp đồng năm học 2024 | Gia hạn thêm 6 tháng"
  },
  "message": "Gia hạn hợp đồng thành công thêm 6 tháng"
}
```

### 8. Quản Lý Hóa Đơn

#### Lấy Danh Sách Hóa Đơn

**GET** `/api/bills`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maHoaDon": 1,
    "maSinhVien": 1,
    "thang": 1,
    "nam": 2024,
    "tongTien": 550000,
    "trangThai": "Chưa thanh toán",
    "hanThanhToan": "2024-01-15T00:00:00",
    "ngayThanhToan": null,
    "ghiChu": null,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin"
  }
]
```

#### Tạo Hóa Đơn Mới

**POST** `/api/bills`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "thang": 1,
  "nam": 2024,
  "tongTien": 550000,
  "trangThai": "Chưa thanh toán",
  "hanThanhToan": "2024-01-15T00:00:00"
}
```

#### Cập Nhật Hóa Đơn

**PUT** `/api/bills/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "maPhong": 1,
  "maHopDong": 1,
  "thang": 1,
  "nam": 2024,
  "tongTien": 550000,
  "trangThai": "Đã thanh toán",
  "hanThanhToan": "2024-01-15T00:00:00",
  "ngayThanhToan": "2024-01-10T00:00:00",
  "ghiChu": "Đã thanh toán đầy đủ"
}
```

#### Xóa Hóa Đơn

**DELETE** `/api/bills/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tính Phí Tự Động

**POST** `/api/bills/calculate-monthly?thang={thang}&nam={nam}`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `thang` (int): Tháng cần tạo hóa đơn (1-12)
- `nam` (int): Năm cần tạo hóa đơn

**Ví dụ:** `/api/bills/calculate-monthly?thang=1&nam=2024`

**Response:**

```json
{
  "generated": 50
}
```

### 9. Quản Lý Biên Lai

#### Lấy Danh Sách Biên Lai

**GET** `/api/receipts`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maBienLai": 1,
    "maHoaDon": 1,
    "soTienThu": 550000,
    "ngayThu": "2024-01-10T00:00:00",
    "phuongThucThanhToan": "Tiền mặt",
    "nguoiThu": "admin",
    "ghiChu": "Thanh toán đầy đủ",
    "isDeleted": false,
    "ngayTao": "2024-01-10T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
]
```

#### Lấy Biên Lai Theo ID

**GET** `/api/receipts/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Biên Lai

**POST** `/api/receipts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maHoaDon": 1,
  "soTienThu": 550000,
  "ngayThu": "2024-01-10T00:00:00",
  "phuongThucThanhToan": "Tiền mặt",
  "nguoiThu": "admin",
  "ghiChu": "Thanh toán đầy đủ"
}
```

#### Cập Nhật Biên Lai

**PUT** `/api/receipts/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maHoaDon": 1,
  "soTienThu": 550000,
  "ngayThu": "2024-01-10T00:00:00",
  "phuongThucThanhToan": "Tiền mặt",
  "nguoiThu": "admin",
  "ghiChu": "Thanh toán đầy đủ"
}
```

#### Xóa Biên Lai

**DELETE** `/api/receipts/{id}`

**Headers:** `Authorization: Bearer <token>`

### 10. Quản Lý Thông Báo Quá Hạn

#### Lấy Danh Sách Thông Báo

**GET** `/api/overdue-notices`

**Headers:** `Authorization: Bearer <token>`

* **Response:**

```json
[
  {
    "maThongBao": 1,
    "maSinhVien": 1,
    "maHoaDon": 1,
    "ngayThongBao": "2024-01-20T00:00:00",
    "noiDung": "Bạn đã quá hạn thanh toán 5 ngày",
    "trangThai": "Đã gửi",
    "ghiChu": null,
    "isDeleted": false,
    "ngayTao": "2024-01-20T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
]
```

#### Lấy Thông Báo Theo ID

**GET** `/api/overdue-notices/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Thông Báo Mới

**POST** `/api/overdue-notices`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "maHoaDon": 1,
  "ngayThongBao": "2024-01-20T00:00:00",
  "noiDung": "Bạn đã quá hạn thanh toán 5 ngày",
  "trangThai": "Đã gửi",
  "ghiChu": "Nhắc nhở lần 1"
}
```

#### Cập Nhật Thông Báo

**PUT** `/api/overdue-notices/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "maHoaDon": 1,
  "ngayThongBao": "2024-01-20T00:00:00",
  "noiDung": "Bạn đã quá hạn thanh toán 5 ngày",
  "trangThai": "Đã gửi",
  "ghiChu": "Nhắc nhở lần 1"
}
```

#### Xóa Thông Báo

**DELETE** `/api/overdue-notices/{id}`

**Headers:** `Authorization: Bearer <token>`

### 11. Quản Lý Kỷ Luật

#### Lấy Danh Sách Kỷ Luật

**GET** `/api/violations`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maKyLuat": 1,
    "maSinhVien": 1,
    "loaiViPham": "Vi phạm nội quy",
    "moTa": "Đi muộn sau 22h",
    "ngayViPham": "2024-01-15T00:00:00",
    "mucPhat": 50000,
    "trangThai": "Chưa xử lý",
    "ghiChu": null,
    "tenSinhVien": "Nguyễn Văn A",
    "mssv": "SV001",
    "lop": "CNTT01",
    "khoa": "Công nghệ thông tin",
    "soPhong": "A101",
    "tenToaNha": "Tòa A",
    "isDeleted": false,
    "ngayTao": "2024-01-15T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
]
```

#### Lấy Kỷ Luật Theo ID

**GET** `/api/violations/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Kỷ Luật Mới

**POST** `/api/violations`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "loaiViPham": "Vi phạm nội quy",
  "moTa": "Đi muộn sau 22h",
  "ngayViPham": "2024-01-15T00:00:00",
  "mucPhat": 50000,
  "trangThai": "Chưa xử lý",
  "ghiChu": "Vi phạm lần đầu"
}
```

#### Cập Nhật Kỷ Luật

**PUT** `/api/violations/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "loaiViPham": "Vi phạm nội quy",
  "moTa": "Đi muộn sau 22h",
  "ngayViPham": "2024-01-15T00:00:00",
  "mucPhat": 50000,
  "trangThai": "Đã xử lý",
  "ghiChu": "Đã phạt"
}
```

#### Xóa Kỷ Luật

**DELETE** `/api/violations/{id}`

**Headers:** `Authorization: Bearer <token>`

### 12. Quản Lý Điểm Rèn Luyện

#### Lấy Danh Sách Điểm Rèn Luyện

**GET** `/api/discipline-scores`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maDiem": 1,
    "maSinhVien": 1,
    "thang": 1,
    "nam": 2024,
    "diemSo": 85,
    "xepLoai": "Khá",
    "ghiChu": "Có tiến bộ",
    "isDeleted": false,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
]
```

#### Lấy Điểm Theo ID

**GET** `/api/discipline-scores/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Lấy Điểm Theo Sinh Viên

**GET** `/api/discipline-scores/by-student/{studentId}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Điểm Mới

**POST** `/api/discipline-scores`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "thang": 1,
  "nam": 2024,
  "diemSo": 85,
  "xepLoai": "Khá",
  "ghiChu": "Có tiến bộ"
}
```

#### Cập Nhật Điểm

**PUT** `/api/discipline-scores/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "thang": 1,
  "nam": 2024,
  "diemSo": 85,
  "xepLoai": "Khá",
  "ghiChu": "Có tiến bộ"
}
```

#### Xóa Điểm

**DELETE** `/api/discipline-scores/{id}`

**Headers:** `Authorization: Bearer <token>`

### 13. Quản Lý Sinh Viên

#### Lấy Danh Sách Sinh Viên

**GET** `/api/students`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maSinhVien": 1,
    "hoTen": "Nguyễn Văn A",
    "mssv": "SV001",
    "lop": "CNTT01",
    "khoa": "Công nghệ thông tin",
    "ngaySinh": "2000-01-01T00:00:00",
    "gioiTinh": "Nam",
    "sdt": "0123456789",
    "email": "nguyenvana@email.com",
    "diaChi": "123 Đường ABC",
    "anhDaiDien": null,
    "trangThai": true,
    "maPhong": 1,
    "soPhong": "A101",
    "tenToaNha": "Tòa A",
    "isDeleted": false,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
]
```

#### Tạo Sinh Viên Mới

**POST** `/api/students`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "hoTen": "Nguyễn Văn B",
  "mssv": "SV002",
  "lop": "CNTT02",
  "khoa": "Công nghệ thông tin",
  "ngaySinh": "2001-01-01T00:00:00",
  "gioiTinh": "Nữ",
  "sdt": "0987654321",
  "email": "nguyenvanb@email.com",
  "diaChi": "456 Đường XYZ",
  "maPhong": null
}
```

#### Lấy Sinh Viên Theo ID

**GET** `/api/students/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Cập Nhật Sinh Viên

**PUT** `/api/students/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "hoTen": "Nguyễn Văn B",
  "mssv": "SV002",
  "lop": "CNTT02",
  "khoa": "Công nghệ thông tin",
  "ngaySinh": "2001-01-01T00:00:00",
  "gioiTinh": "Nữ",
  "sdt": "0987654321",
  "email": "nguyenvanb@email.com",
  "diaChi": "456 Đường XYZ",
  "maPhong": 1
}
```

#### Xóa Sinh Viên

**DELETE** `/api/students/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Lấy Sinh Viên Theo Phòng

**GET** `/api/students/by-room/{maPhong}`

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**

- `maPhong` (int): Mã phòng

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maSinhVien": 1,
      "hoTen": "Nguyễn Văn A",
      "mssv": "SV001",
      "lop": "CNTT01",
      "khoa": "Công nghệ thông tin",
      "ngaySinh": "2000-01-01T00:00:00",
      "gioiTinh": "Nam",
      "sdt": "0123456789",
      "email": "nguyenvana@email.com",
      "diaChi": "123 Đường ABC",
      "trangThai": true,
      "maPhong": 1,
      "soPhong": "A101",
      "tenToaNha": "Tòa A"
    }
  ]
}
```

### 14. Quản Lý Đăng Ký

#### Lấy Danh Sách Đăng Ký

**GET** `/api/registrations`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maDon": 1,
    "maSinhVien": 1,
    "maPhongDeXuat": 2,
    "ngayDangKy": "2024-01-01T00:00:00",
    "trangThai": "Chờ duyệt",
    "lyDo": "Cần phòng gần thư viện",
    "ghiChu": "Đăng ký phòng mới",
    "isDeleted": false,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null,
    "tenSinhVien": "Nguyễn Văn A",
    "mssv": "SV001",
    "lop": "CNTT01",
    "khoa": "Công nghệ thông tin",
    "phongDeXuat": "A101",
    "toaNhaDeXuat": "Tòa A"
  }
]
```

#### Lấy Đăng Ký Theo ID

**GET** `/api/registrations/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Đăng Ký Mới

**POST** `/api/registrations`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "maPhongDeXuat": 2,
  "trangThai": "Chờ duyệt",
  "lyDo": "Cần phòng gần thư viện",
  "ngayDangKy": "2024-01-01T00:00:00",
  "ghiChu": "Đăng ký phòng mới"
}
```

#### Cập Nhật Đăng Ký

**PUT** `/api/registrations/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "maPhongDeXuat": 2,
  "trangThai": "Đã duyệt",
  "lyDo": "Đã duyệt đăng ký",
  "ngayDangKy": "2024-01-01T00:00:00",
  "ghiChu": "Đã duyệt đăng ký"
}
```

#### Xóa Đăng Ký

**DELETE** `/api/registrations/{id}`

**Headers:** `Authorization: Bearer <token>`

### 15. Quản Lý Yêu Cầu Chuyển Phòng

#### Lấy Danh Sách Yêu Cầu

**GET** `/api/change-requests`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "maYeuCau": 1,
    "maSinhVien": 1,
    "phongHienTai": 1,
    "phongMongMuon": 2,
    "lyDo": "Gần thư viện hơn",
    "ngayYeuCau": "2024-01-01T00:00:00",
    "trangThai": "Chờ duyệt",
    "ghiChu": null,
    "isDeleted": false,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
]
```

#### Lấy Yêu Cầu Theo ID

**GET** `/api/change-requests/{id}`

**Headers:** `Authorization: Bearer <token>`

#### Tạo Yêu Cầu Mới

**POST** `/api/change-requests`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "phongHienTai": 1,
  "phongMongMuon": 2,
  "lyDo": "Gần thư viện hơn",
  "ngayYeuCau": "2024-01-01T00:00:00",
  "trangThai": "Chờ duyệt",
  "ghiChu": null
}
```

#### Cập Nhật Yêu Cầu

**PUT** `/api/change-requests/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maSinhVien": 1,
  "phongHienTai": 1,
  "phongMongMuon": 2,
  "lyDo": "Gần thư viện hơn",
  "ngayYeuCau": "2024-01-01T00:00:00",
  "trangThai": "Đã duyệt",
  "ghiChu": "Đã duyệt yêu cầu"
}
```

#### Xóa Yêu Cầu

**DELETE** `/api/change-requests/{id}`

**Headers:** `Authorization: Bearer <token>`

### 16. Quản Lý Cấu Hình Phí

#### Lấy Danh Sách Cấu Hình Phí

**GET** `/api/fee-configs`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maCauHinh": 1,
      "loai": "Dien",
      "mucToiThieu": 50000,
      "trangThai": true,
      "isDeleted": false,
      "ngayTao": "2024-01-01T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null
    }
  ]
}
```

#### Lấy Cấu Hình Phí Theo ID

**GET** `/api/fee-configs/{id}`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

#### Lấy Cấu Hình Phí Theo Loại

**GET** `/api/fee-configs/by-type/{type}`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

**Path Parameters:**

- `type` (string): Loại phí (ví dụ: "Dien", "Nuoc")

#### Tạo Cấu Hình Phí Mới

**POST** `/api/fee-configs`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

**Request Body:**

```json
{
  "loai": "Dien",
  "mucToiThieu": 50000,
  "trangThai": true
}
```

#### Cập Nhật Cấu Hình Phí

**PUT** `/api/fee-configs/{id}`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

**Request Body:**

```json
{
  "loai": "Dien",
  "mucToiThieu": 60000,
  "trangThai": true
}
```

#### Xóa Cấu Hình Phí

**DELETE** `/api/fee-configs/{id}`

**Headers:** `Authorization: Bearer <token>` (yêu cầu role Admin)

### 17. Báo Cáo

#### Báo Cáo Tỷ Lệ Lấp Đầy

**GET** `/api/reports/occupancy-rate?thang=1&nam=2024`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "tenToaNha": "Tòa A",
    "tongSoPhong": 50,
    "soPhongCoNguoi": 40,
    "tyLeLapDay": 80.0
  }
]
```

#### Báo Cáo Doanh Thu

**GET** `/api/reports/revenue?thang=1&nam=2024`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "thang": 1,
    "nam": 2024,
    "tongSoHoaDon": 150,
    "tongDoanhThu": 50000000,
    "daThanhToan": 45000000,
    "chuaThanhToan": 5000000,
    "quaHan": 3000000
  }
]
```

#### Báo Cáo Công Nợ

**GET** `/api/reports/debt`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "mssv": "SV001",
    "hoTen": "Nguyễn Văn A",
    "sdt": "0123456789",
    "email": "nguyenvana@email.com",
    "soPhong": "A101",
    "tenToaNha": "Tòa A",
    "soHoaDonChuaTra": 2,
    "tongCongNo": 500000,
    "hanThanhToanGanNhat": "2024-01-15T00:00:00",
    "soNgayQuaHan": 5
  }
]
```

#### Báo Cáo Điện Nước

**GET** `/api/reports/electricity-water?thang=1&nam=2024`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "tenToaNha": "Tòa A",
    "soPhong": "A101",
    "thang": 1,
    "nam": 2024,
    "chiSoDien": 150,
    "chiSoNuoc": 20,
    "chiSoDienTruoc": 100,
    "chiSoNuocTruoc": 15,
    "soKwhTieuThu": 50,
    "soKhoiNuocTieuThu": 5
  }
]
```

#### Báo Cáo Kỷ Luật

**GET** `/api/reports/violations?thang=1&nam=2024`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
[
  {
    "mssv": "SV001",
    "hoTen": "Nguyễn Văn A",
    "soPhong": "A101",
    "tenToaNha": "Tòa A",
    "loaiViPham": "Vi phạm nội quy",
    "moTa": "Đi muộn sau 22h",
    "ngayViPham": "2024-01-15T00:00:00",
    "mucPhat": 50000,
    "trangThai": "Chưa xử lý"
  }
]
```

#### Tạo Hóa Đơn Hàng Tháng (Báo Cáo)

**POST** `/api/reports/generate-monthly-bills?thang=1&nam=2024`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `thang` (int): Tháng cần tạo hóa đơn (1-12)
- `nam` (int): Năm cần tạo hóa đơn

#### Tính Tiền Điện

**POST** `/api/reports/calculate-electricity?soKwh={soKwh}&thang={thang}&nam={nam}`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `soKwh` (int): Số kWh tiêu thụ
- `thang` (int): Tháng (1-12)
- `nam` (int): Năm

**Ví dụ:** `/api/reports/calculate-electricity?soKwh=150&thang=1&nam=2024`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "TongTienDien": 270000
    }
  ]
}
```

#### Tính Tiền Nước

**POST** `/api/reports/calculate-water?soKhoi={soKhoi}&thang={thang}&nam={nam}`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `soKhoi` (int): Số khối nước tiêu thụ
- `thang` (int): Tháng (1-12)
- `nam` (int): Năm

**Ví dụ:** `/api/reports/calculate-water?soKhoi=20&thang=1&nam=2024`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "TongTienNuoc": 100000
    }
  ]
}
```

---

## USER API (Port 8002)

### 1. Trang Chủ

#### Health Check

**GET** `/api/home`

**Headers:** `Authorization: Bearer <token>` (optional)

**Response:**

```json
{
  "status": "ok"
}
```

### 2. Xem Tòa Nhà

#### Lấy Danh Sách Tòa Nhà

**GET** `/api/buildings`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maToaNha": 1,
      "tenToaNha": "Tòa A",
      "diaChi": "123 Đường ABC",
      "soTang": 5,
      "moTa": "Tòa nhà chính",
      "trangThai": true,
      "isDeleted": false,
      "ngayTao": "2024-01-01T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null
    }
  ]
}
```

#### Lấy Tòa Nhà Theo ID

**GET** `/api/buildings/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "maToaNha": 1,
    "tenToaNha": "Tòa A",
    "diaChi": "123 Đường ABC",
    "soTang": 5,
    "moTa": "Tòa nhà chính",
    "trangThai": true,
    "isDeleted": false,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
}
```

### 3. Thông Tin Cá Nhân

#### Lấy Thông Tin Sinh Viên

**GET** `/api/students/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "maSinhVien": 1,
    "hoTen": "Nguyễn Văn A",
    "mssv": "SV001",
    "ngaySinh": "2000-01-01T00:00:00",
    "gioiTinh": "Nam",
    "sdt": "0123456789",
    "email": "nguyenvana@email.com",
    "diaChi": "123 Đường ABC",
    "anhDaiDien": "avatar.jpg",
    "lop": "CNTT01",
    "khoa": "Công nghệ thông tin",
    "trangThai": true,
    "maPhong": 1,
    "soPhong": "A101",
    "tenToaNha": "Tòa A"
  }
}
```

#### Cập Nhật Thông Tin Sinh Viên

**PUT** `/api/students/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "hoTen": "Nguyễn Văn B",
  "ngaySinh": "2000-01-01T00:00:00",
  "gioiTinh": "Nam",
  "sdt": "0987654321",
  "email": "nguyenvanb@email.com",
  "diaChi": "456 Đường XYZ"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Cập nhật thông tin cá nhân thành công"
}
```

#### Đổi Mật Khẩu

**POST** `/api/students/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

### 4. Thông Tin Phòng

#### Lấy Danh Sách Phòng

**GET** `/api/rooms`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maPhong": 1,
      "maToaNha": 1,
      "soPhong": "A101",
      "tenToaNha": "Tòa A",
      "soGiuong": 4,
      "loaiPhong": "Phòng 4 người",
      "giaPhong": 500000,
      "moTa": "Phòng tầng 1",
      "trangThai": "Trống",
      "isDeleted": false,
      "ngayTao": "2024-01-01T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null
    }
  ]
}
```

#### Lấy Phòng Theo ID

**GET** `/api/rooms/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "maPhong": 1,
    "maToaNha": 1,
    "soPhong": "A101",
    "tenToaNha": "Tòa A",
    "soGiuong": 4,
    "loaiPhong": "Phòng 4 người",
    "giaPhong": 500000,
    "moTa": "Phòng tầng 1",
    "trangThai": "Trống",
    "isDeleted": false,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
}
```

#### Lấy Thông Tin Phòng Hiện Tại

**GET** `/api/rooms/current`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "maPhong": 1,
    "soPhong": "A101",
    "maToaNha": 1,
    "tenToaNha": "Tòa A",
    "soGiuong": 4,
    "loaiPhong": "Phòng 4 người",
    "giaPhong": 500000,
    "moTa": "Phòng tầng 1",
    "trangThai": "Đang ở"
  }
}
```

#### Lấy Danh Sách Phòng Trống

**GET** `/api/rooms/available`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maPhong": 1,
      "soPhong": "A101",
      "maToaNha": 1,
      "tenToaNha": "Tòa A",
      "soGiuong": 4,
      "loaiPhong": "Phòng 4 người",
      "giaPhong": 500000,
      "trangThai": "Trống"
    }
  ]
}
```

**Note:** Endpoint này trả về phòng trống nên không cần audit fields.

### 5. Hóa Đơn Cá Nhân

#### Lấy Danh Sách Hóa Đơn

**GET** `/api/bills/my`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maHoaDon": 1,
      "maSinhVien": 1,
      "maPhong": 1,
      "maHopDong": 1,
      "thang": 1,
      "nam": 2024,
      "tongTien": 550000,
      "trangThai": "Chưa thanh toán",
      "hanThanhToan": "2024-01-15T00:00:00",
      "ngayThanhToan": null,
      "ghiChu": null,
      "ngayTao": "2024-01-01T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null
    }
  ]
}
```

#### Lấy Hóa Đơn Theo ID

**GET** `/api/bills/my/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "maHoaDon": 1,
    "maSinhVien": 1,
    "maPhong": 1,
    "maHopDong": 1,
    "thang": 1,
    "nam": 2024,
    "tongTien": 550000,
    "trangThai": "Chưa thanh toán",
    "hanThanhToan": "2024-01-15T00:00:00",
    "ngayThanhToan": null,
    "ghiChu": null,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
}
```

### 6. Biên Lai Cá Nhân

#### Lấy Danh Sách Biên Lai

**GET** `/api/receipts/my`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maBienLai": 1,
      "maHoaDon": 1,
      "soTienThu": 550000,
      "ngayThu": "2024-01-10T00:00:00",
      "phuongThucThanhToan": "Tiền mặt",
      "nguoiThu": "admin",
      "ghiChu": "Thanh toán đầy đủ",
      "isDeleted": false,
      "ngayTao": "2024-01-10T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null
    }
  ]
}
```

### 7. Hợp Đồng Cá Nhân

#### Lấy Danh Sách Hợp Đồng

**GET** `/api/contracts/my`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maHopDong": 1,
      "maSinhVien": 1,
      "maGiuong": 1,
      "ngayBatDau": "2024-01-01T00:00:00",
      "ngayKetThuc": "2024-12-31T00:00:00",
      "giaPhong": 500000,
      "trangThai": "Có hiệu lực",
      "ghiChu": "Hợp đồng năm học 2024",
      "isDeleted": false,
      "ngayTao": "2024-01-01T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null
    }
  ]
}
```

#### Lấy Hợp Đồng Hiện Tại

**GET** `/api/contracts/my/current`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "maHopDong": 1,
    "maSinhVien": 1,
    "maGiuong": 1,
    "ngayBatDau": "2024-01-01T00:00:00",
    "ngayKetThuc": "2024-12-31T00:00:00",
    "giaPhong": 500000,
    "trangThai": "Có hiệu lực",
    "ghiChu": "Hợp đồng năm học 2024",
    "isDeleted": false,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
}
```

#### Xác Nhận Hợp Đồng

**PUT** `/api/contracts/my/{id}/confirm`

**Headers:** `Authorization: Bearer <token>`

**Mô tả:** Sinh viên xác nhận hợp đồng (ký hợp đồng). Sau khi xác nhận, hợp đồng sẽ chuyển sang trạng thái "Đã xác nhận" và chờ nhân viên duyệt để chuyển sang "Có hiệu lực".

**Response:**

```json
{
  "success": true,
  "data": {
    "maHopDong": 1,
    "maSinhVien": 1,
    "maGiuong": 1,
    "ngayBatDau": "2024-01-01T00:00:00",
    "ngayKetThuc": "2024-12-31T00:00:00",
    "giaPhong": 500000,
    "trangThai": "Đã xác nhận",
    "ghiChu": "Hợp đồng năm học 2024",
    "isDeleted": false,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": "2024-01-15T00:00:00",
    "nguoiCapNhat": "Student"
  },
  "message": "Xác nhận hợp đồng thành công. Hợp đồng đang chờ nhân viên duyệt."
}
```

### 8. Đăng Ký Phòng

#### Lấy Danh Sách Đăng Ký

**GET** `/api/registrations/my-registrations`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maDon": 1,
      "maSinhVien": 1,
      "maPhongDeXuat": 1,
      "trangThai": "Chờ duyệt",
      "lyDo": "Muốn ở gần thư viện",
      "ngayDangKy": "2024-01-01T00:00:00",
      "ghiChu": "Đăng ký phòng mới",
      "isDeleted": false,
      "ngayTao": "2024-01-01T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null,
      "tenSinhVien": "Nguyễn Văn A",
      "mssv": "SV001",
      "phongDeXuat": "A101",
      "toaNhaDeXuat": "Tòa A"
    }
  ]
}
```

#### Tạo Đăng Ký Mới

**POST** `/api/registrations`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "maPhongDeXuat": 1,
  "lyDo": "Muốn ở gần thư viện",
  "ghiChu": "Đăng ký phòng mới"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo đơn đăng ký thành công"
}
```

### 9. Yêu Cầu Chuyển Phòng

#### Lấy Danh Sách Yêu Cầu

**GET** `/api/change-requests/my`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maYeuCau": 1,
      "maSinhVien": 1,
      "phongHienTai": 1,
      "phongMongMuon": 2,
      "lyDo": "Gần thư viện hơn",
      "ngayYeuCau": "2024-01-01T00:00:00",
      "trangThai": "Chờ duyệt",
      "ghiChu": null,
      "isDeleted": false,
      "ngayTao": "2024-01-01T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null
    }
  ]
}
```

#### Tạo Yêu Cầu Chuyển Phòng

**POST** `/api/change-requests`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "phongHienTai": 1,
  "phongMongMuon": 2,
  "lyDo": "Gần thư viện hơn",
  "ghiChu": "Yêu cầu chuyển phòng"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tạo yêu cầu chuyển phòng thành công"
}
```

### 10. Xem Mức Phí

#### Lấy Danh Sách Mức Phí

**GET** `/api/fees`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maMucPhi": 1,
      "tenMucPhi": "Phí phòng",
      "loaiPhi": "Phí phòng",
      "giaTien": 500000,
      "donVi": "Tháng",
      "trangThai": true,
      "ghiChu": null,
      "isDeleted": false,
      "ngayTao": "2024-01-01T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null
    }
  ]
}
```

#### Lấy Mức Phí Theo ID

**GET** `/api/fees/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "maMucPhi": 1,
    "tenMucPhi": "Phí phòng",
    "loaiPhi": "Phí phòng",
    "giaTien": 500000,
    "donVi": "Tháng",
    "trangThai": true,
    "ghiChu": null,
    "isDeleted": false,
    "ngayTao": "2024-01-01T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
}
```

### 11. Điểm Rèn Luyện

#### Lấy Danh Sách Điểm Rèn Luyện

**GET** `/api/discipline-scores/my-scores`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maDiem": 1,
      "maSinhVien": 1,
      "thang": 1,
      "nam": 2024,
      "diemSo": 85,
      "xepLoai": "Khá",
      "ghiChu": "Có tiến bộ",
      "isDeleted": false,
      "ngayTao": "2024-01-31T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null
    }
  ]
}
```

#### Lấy Điểm Rèn Luyện Theo Tháng/Năm

**GET** `/api/discipline-scores/my/{thang}/{nam}`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "maDiem": 1,
    "maSinhVien": 1,
    "thang": 1,
    "nam": 2024,
    "diemSo": 85,
    "xepLoai": "Khá",
    "ghiChu": "Có tiến bộ",
    "isDeleted": false,
    "ngayTao": "2024-01-31T00:00:00",
    "nguoiTao": "admin",
    "ngayCapNhat": null,
    "nguoiCapNhat": null
  }
}
```

### 12. Kỷ Luật

#### Lấy Danh Sách Kỷ Luật

**GET** `/api/violations/my-violations`

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "maKyLuat": 1,
      "maSinhVien": 1,
      "loaiViPham": "Vi phạm nội quy",
      "moTa": "Đi muộn sau 22h",
      "ngayViPham": "2024-01-15T00:00:00",
      "mucPhat": 50000,
      "trangThai": "Chưa xử lý",
      "ghiChu": null,
      "tenSinhVien": "Nguyễn Văn A",
      "mssv": "SV001",
      "soPhong": "A101",
      "tenToaNha": "Tòa A",
      "isDeleted": false,
      "ngayTao": "2024-01-15T00:00:00",
      "nguoiTao": "admin",
      "ngayCapNhat": null,
      "nguoiCapNhat": null
    }
  ]
}
```

---

## GATEWAY API (Port 8000)

### Swagger UI Tổng Hợp

- **URL:** `http://localhost:8000/swagger`
- **Mô tả:** Hiển thị tất cả API của Admin và User

### Redirects

- **URL:** `http://localhost:8000/` → `http://localhost:8000/admin/swagger`
- **URL:** `http://localhost:8000/admin` → `http://localhost:8000/admin/swagger`
- **URL:** `http://localhost:8000/user` → `http://localhost:8000/user/swagger`

### Routing (Ocelot)

- Admin APIs: `http://localhost:8000/admin/*` → `http://localhost:8001/*`
- User APIs: `http://localhost:8000/user/*` → `http://localhost:8002/*`
- Auth: `http://localhost:8000/auth/*` → `http://localhost:8001/api/auth/*`

---

## 📈 Tính Năng Nâng Cao

### 1. Tính Tiền Điện Theo Bậc Giá

- Tự động tính tiền điện theo bậc thang kWh
- Hỗ trợ nhiều bậc giá khác nhau
- Tính toán chính xác theo chỉ số đồng hồ

### 2. Import Excel Chỉ Số

- Upload file Excel với chỉ số điện nước
- Validation dữ liệu tự động
- Template Excel có sẵn để download

### 3. Tạo Hóa Đơn Tự Động

- Tạo hóa đơn hàng tháng cho tất cả sinh viên
- Tính toán phí phòng + điện + nước + dịch vụ
- Cập nhật trạng thái thanh toán

### 4. Báo Cáo Toàn Diện

- Báo cáo tỷ lệ lấp đầy theo tòa nhà
- Báo cáo doanh thu theo tháng/năm
- Báo cáo công nợ chi tiết
- Báo cáo tiêu thụ điện nước

### 5. Data Integrity

- CHECK constraints cho validation
- Foreign keys đầy đủ
- Soft delete với IsDeleted
- Audit trail cho tất cả bảng

## Testing với Postman

### Collection & Environment

1. Import `Postman/QuanLyKTX.postman_collection.json`
2. Import `Postman/QuanLyKTX.postman_environment.json`
3. Biến môi trường: `gateway`, `admin`, `user`, `token`, `user_role`, `user_id`

> 🔄 **Quy tắc đồng bộ:** Mỗi khi DTO hoặc stored procedure thay đổi, hãy cập nhật ngay Postman collection và mô tả Swagger tương ứng (ví dụ: thêm các field TenSinhVien/MSSV cho kỷ luật và đăng ký) để giữ trạng thái “CSDL ↔ Backend ↔ Docs” nhất quán.

**Environment Variables:**

- `gateway`: http://localhost:8000
- `admin`: http://localhost:8001
- `user`: http://localhost:8002
- `token`: JWT token (tự động lưu sau login)
- `user_role`: Admin/Officer/Student
- `user_id`: ID của user hiện tại

### Test Flow

1) Login: POST `/api/auth/login` (qua Gateway)
2) Token tự động lưu vào env (script trong collection)
3) Gọi thử: Admin GET `/api/buildings`, User GET `/api/bills/my`

### Ví Dụ API Call

```bash
# Lấy token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"TenDangNhap":"admin","MatKhau":"admin@123"}'

# Danh sách phòng (Admin)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/admin/api/rooms

# Tính hóa đơn tháng
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/admin/api/bills/calculate-monthly?thang=1&nam=2024"
```

## Troubleshooting

### Port Conflicts

```powershell
# Kiểm tra port đang sử dụng
netstat -ano | findstr :8000

# Dừng process chiếm port
taskkill /F /PID <pid>
```

### SQL Connection Issues

1. Đảm bảo SQL Server (SQLEXPRESS) đang chạy
2. Bật TCP/IP trong SQL Server Configuration Manager
3. Mở port 1433 trong firewall
4. Kiểm tra connection string: `WINDOWS-PC\SQLEXPRESS`

### Build Errors

```powershell
# Clean và rebuild
dotnet clean
dotnet restore
dotnet build
```

## Trạng Thái Dự Án

### ✅ Đã Hoàn Thành

- **Backend & SQL đồng bộ**: Models, Controllers, Stored Procedures khớp nhau
- **Authentication**: JWT + BCrypt với fallback mechanism
- **Gateway**: Ocelot routing đúng (`/admin/*`, `/user/*`, `/auth/*`)
- **Database**: File SQL đã sửa (`Fixed_Database_With_StoredProcedures.sql`)
- **API Documentation**: Swagger UI hoạt động đầy đủ
- **Smoke Testing**: Tất cả API endpoints đã test qua Gateway
- **Configuration**: JWT settings nhất quán giữa tất cả services
- **User API**: Tất cả controllers đã được tạo đầy đủ
- **Postman Collection**: URLs đã được sửa đúng theo Gateway routing

### 🔧 Cải Tiến Đã Thực Hiện

- **Loại bỏ duplicate code**: Controllers và stored procedures
- **Sửa alias BacGia**: TuKwh→TuSo, DenKwh→DenSo, GiaTien→DonGia
- **BCrypt passwords**: Seed data với hash mật khẩu
- **Performance**: Indexes và JOINs tối ưu
- **Error handling**: Nullable warnings đã fix

### 📁 Files Quan Trọng

- `Database/CSDL.sql` - **File SQL chính (hoàn chỉnh)**
- `Database/Fixed_Database_With_StoredProcedures.sql` - File đã sửa
- `Database/Missing_CRUD_Procedures.sql` - Bổ sung CRUD procedures
- `KTX-Gateway/ocelot.json` - Gateway routing config
- `KTX-Admin/appsettings.json` - Admin API config
- `KTX-NguoiDung/appsettings.json` - User API config
- `Postman/QuanLyKTX.postman_collection.json` - API testing collection
- `Postman/QuanLyKTX.postman_environment.json` - Environment variables

### 🚀 Sẵn Sàng Production

Dự án đã sẵn sàng để:

- Chạy và test toàn bộ hệ thống
- Deploy lên server
- Phát triển frontend tích hợp
- Mở rộng tính năng mới

## Ghi Chú Quan Trọng

1. **Authentication**: Tất cả API (trừ login) đều yêu cầu Bearer token
2. **Authorization**: Kiểm tra role trong JWT token (Admin/Officer/Student)
3. **BCrypt**: Mật khẩu được hash với BCrypt, có fallback cho legacy passwords
4. **Database**: Sử dụng file `CSDL.sql` - file hoàn chỉnh nhất với tất cả stored procedures
5. **Gateway**: Routing đã được cấu hình đúng (`/admin/*`, `/user/*`, `/auth/*`)
6. **CORS**: Đã cấu hình AllowAll cho development
7. **Validation**: Tất cả input đều được validate
8. **Error Handling**: Trả về HTTP status codes chuẩn
9. **Logging**: Theo cấu hình mặc định ASP.NET Core

## License

MIT License - Dự án học tập môn Phát triển phần mềm hướng dịch vụ

---

*Tài liệu này được cập nhật theo dự án thực tế. Dự án đã hoàn thành và sẵn sàng sử dụng. Để có thông tin mới nhất, vui lòng kiểm tra Swagger UI tại các URL tương ứng.*

## Mục lục

- Kiến trúc & cổng dịch vụ
- Yêu cầu hệ thống
- Cài đặt CSDL và kết nối SQL Server
- Cấu hình ứng dụng (JWT, CORS, Ocelot)
- Khởi động dịch vụ
- Xác thực & Phân quyền (JWT/RBAC)
- Nhóm API & JSON mẫu trả về
- Swagger & Gateway
- Ví dụ gọi API (curl/Postman)
- Xử lý sự cố thường gặp

## Kiến trúc & cổng dịch vụ

```
QuanLyKTX(Cấu trúc gateway)/
  KTX-Gateway/        # API Gateway (Ocelot + Swagger For Ocelot)
  KTX-Admin/          # Dịch vụ quản trị (Admin/Officer)
  KTX-NguoiDung/      # Dịch vụ sinh viên (Student)
  Database/           # Script SQL (Simple_Database_With_StoredProcedures.sql)
  admin/              # Trang login demo (tùy chọn)
```

- Cổng chạy (đã chuẩn hóa để tránh xung đột):
  - Gateway: http://localhost:8000
  - Admin API: http://localhost:8001
  - User API: http://localhost:8002

## Yêu cầu hệ thống

- .NET 8 SDK
- SQL Server (khuyến nghị SQLEXPRESS) và SSMS
- PowerShell/Command Prompt

## Cài đặt CSDL và kết nối SQL Server

1) Kết nối đến instance: `WINDOWS-PC\SQLEXPRESS`
2) Tạo CSDL và bảng:

   - **Khuyến nghị:** Mở SSMS → New Query → chạy file: `QuanLyKTX(Cấu trúc gateway)/Database/CSDL.sql`
   - Hoặc PowerShell:
     ```powershell
     sqlcmd -S WINDOWS-PC\SQLEXPRESS -E -i "QuanLyKTX(Cấu trúc gateway)\Database\CSDL.sql"
     ```
   - **File chính:** `CSDL.sql` (4,603 dòng - hoàn chỉnh nhất)
3) Connection string (đã cấu hình sẵn):

   - `KTX-Admin/appsettings.json`
   - `KTX-NguoiDung/appsettings.json`

   ```json
   {
     "ConnectionStrings": {
       "KTX": "Server=WINDOWS-PC\\SQLEXPRESS;Database=QuanLyKyTucXa;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True"
     }
   }
   ```
4) Tài khoản seed trong bảng `TaiKhoan` (BCrypt Hash):

   - admin/admin@123 (Admin) - Password đã hash BCrypt
   - officer/officer@123 (Officer) - Password đã hash BCrypt
   - student/student@123 (Student) - Password đã hash BCrypt

   **Lưu ý:** Hệ thống có fallback mechanism để tự động convert plaintext passwords sang BCrypt khi đăng nhập.

## Cấu hình ứng dụng

- JWT secret: `AppSettings:Secret` đồng bộ ở Gateway/Admin/User (đủ 32 ký tự+). Token ký bằng HMAC SHA256.
- CORS: mở theo `AllowAll` cho phát triển.
- Ocelot (Gateway): định tuyến `/admin/*`, `/user/*`, `/auth/*` đến Admin/User; tích hợp Swagger For Ocelot để hợp nhất tài liệu.

## Khởi động dịch vụ

Khuyến nghị chạy mỗi service ở 1 cửa sổ PowerShell riêng:

```powershell
# Admin API
cd "QuanLyKTX(Cấu trúc gateway)\KTX-Admin\KTX-Admin"; dotnet run -c Release

# User API
cd "QuanLyKTX(Cấu trúc gateway)\KTX-NguoiDung\KTX-NguoiDung"; dotnet run -c Release

# Gateway
cd "QuanLyKTX(Cấu trúc gateway)\KTX-Gateway\KTX-Gateway"; dotnet run -c Release
```

Mặc định đã tắt auto-launch browser; có thể mở Swagger thủ công như dưới.

## Xác thực & Phân quyền

- Đăng nhập lấy JWT (qua Gateway):
  - POST `http://localhost:8000/auth/login`
  - Body:
    ```json
    { "TenDangNhap": "admin", "MatKhau": "admin@123" }
    ```
- Dùng token:
  - Header: `Authorization: Bearer <jwt>`
- Vai trò:
  - Admin: toàn quyền cấu hình/phiếu thu/báo cáo
  - Officer: vận hành: phòng/giường, hợp đồng, chỉ số, thu phí, báo cáo
  - Student: tra cứu thông tin cá nhân, hóa đơn, đăng ký/chuyển phòng

## Nhóm API & JSON mẫu

Chi tiết đầy đủ xem file `API_DOCUMENTATION.md`. Tóm tắt chính:

- Danh mục (Admin): Tòa nhà (`/api/buildings`), Phòng (`/api/rooms`), Giường (`/api/beds`), Mức phí (`/api/fees`), Bậc giá (`/api/price-tiers`)
- Chỉ số điện nước (Admin): `/api/meter-readings`, import Excel `/api/meter-readings/import-excel`
- Hợp đồng (Admin/User): `/api/contracts`
- Hóa đơn – Thu phí – Quá hạn (Admin/Officer): `/api/bills`, `/api/receipts`, `/api/overdue-notices`, tính tháng `/api/bills/calculate-monthly`
- Kỷ luật – Điểm rèn luyện (Admin/Officer): `/api/violations`, `/api/discipline-scores`
- Đăng ký – Chuyển phòng (Admin/User): `/api/registrations`, `/api/change-requests`

Ví dụ JSON trả về (rút gọn):

```json
{
  "maHoaDon": 1,
  "thang": 9,
  "nam": 2025,
  "tongTien": 650000,
  "trangThai": "Chưa thanh toán"
}
```

## Swagger & Gateway

- Admin Swagger: http://localhost:8001/swagger
- User Swagger: http://localhost:8002/swagger
- Gateway Swagger tổng hợp: http://localhost:8000/swagger
- Redirect tiện dụng:
  - `/` → `/admin/swagger`
  - `/admin` → `/admin/swagger`; `/user` → `/user/swagger`

## Ví dụ gọi API (qua Gateway)

```bash
# Lấy token
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"TenDangNhap":"admin","MatKhau":"admin@123"}' | jq

# Danh sách phòng (Admin)
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/admin/api/rooms | jq

# Tính hóa đơn tháng
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/admin/api/bills/calculate-monthly?thang=9&nam=2025" | jq
```

## Xử lý sự cố

- Port đang bận: đổi port trong `launchSettings.json` (đang dùng 8000/8001/8002) hoặc dừng process chiếm port (`netstat -ano`, `taskkill /F /PID <pid>`)
- Lỗi SQL Error 40 (không kết nối được SQL):
  - Đảm bảo dịch vụ `SQL Server (SQLEXPRESS)` và `SQL Server Browser` đang chạy
  - Bật TCP/IP trong SQL Server Configuration Manager, IPAll: TCP Port=1433
  - Tường lửa mở TCP 1433
  - Connection string khớp instance `WINDOWS-PC\SQLEXPRESS`
- JWT key không đủ 256-bit: dùng secret ≥ 32 ký tự và đã băm SHA256 trong AuthController

## Giấy phép

MIT (cập nhật theo yêu cầu dự án)
