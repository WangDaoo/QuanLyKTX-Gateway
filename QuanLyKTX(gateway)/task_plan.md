# Task Plan: Migrate HTML/JS/CSS → React

## Tổng quan
Chuyển đổi frontend từ HTML/JS/CSS thuần sang React (Vite + TypeScript), giữ nguyên API và CSDL.

**Base path:** `d:\Project\QuanLyKTX-main\QuanLyKTX(gateway)\Frontend-React`
**API Base:** `http://localhost:8000`

---

## Phases

### Phase 1: Khám phá & Kiến trúc (P1 Foundation) ✅
- [x] Đọc chi tiết tất cả CSS (style.css, admin.css, auth.css)
- [x] Đọc tất cả JS files để mapping API endpoints & logic
- [x] Thiết kế cấu trúc thư mục React
- [x] Cấu hình routing (React Router v6)
- [x] Cấu hình API service layer (fetch wrapper)
- [x] Tạo Auth context & ProtectedRoute
- [x] Tạo Layout shell (AdminLayout, StudentLayout, OfficerLayout)
- [x] Tạo shared components (DataTable, Modal, Alert)

### Phase 2: Auth (P2 Auth) ✅
- [x] Login page
- [x] AuthContext (token, user, role management)
- [x] ProtectedRoute component
- [x] Redirect theo role (admin → /admin, student → /student, officer → /officer)
- [x] ChangePassword page

### Phase 3: Admin Pages (P3 Admin) ✅
- [x] AdminLayout + Sidebar + Header
- [x] Dashboard
- [x] Buildings (CRUD)
- [x] Rooms (CRUD)
- [x] Beds (CRUD)
- [x] Students (CRUD)
- [x] Contracts (CRUD + extend)
- [x] Bills (CRUD + calculate monthly + details)
- [x] Receipts (CRUD)
- [x] Fees (CRUD)
- [x] FeeConfigs (CRUD)
- [x] PriceTiers (CRUD)
- [x] MeterReadings (CRUD + import Excel)
- [x] Registrations (CRUD)
- [x] ChangeRequests (CRUD)
- [x] Violations (CRUD)
- [x] DisciplineScores (CRUD)
- [x] OverdueNotices (CRUD)
- [x] Reports (occupancy, revenue, debt, electricity-water, violations)
- [x] Users (CRUD + lock/reset-password)

### Phase 4: Student Pages (P4 Student) ✅
- [x] StudentLayout + Sidebar + Header
- [x] Dashboard
- [x] Profile
- [x] Room (xem phòng hiện tại)
- [x] Contract (xem + confirm)
- [x] Bills (xem + chi tiết)
- [x] Payments
- [x] Fees (xem bảng giá)
- [x] Services
- [x] Requests (tạo + xem yêu cầu)
- [x] DisciplineScores (xem)
- [x] Violations (xem)

### Phase 5: Officer Pages (P5 Officer) ✅
- [x] OfficerLayout + Sidebar + Header
- [x] Dashboard
- [x] Registrations (duyệt đăng ký)
- [x] ChangeRequests (duyệt yêu cầu chuyển phòng)
- [x] MeterReadings (ghi chỉ số)
- [x] Violations (thêm/xem vi phạm)
- [x] DisciplineScores (cập nhật điểm)
- [x] Reports

### Phase 6: Kiểm tra & Tối ưu (P6 Final) ✅ COMPLETED
- [x] Smoke API checks qua gateway (admin/officer/unauthorized + report/billing endpoints)
- [x] Backend bug fixes ✅ (3/3 bugs fixed: calculate-monthly, electricity-water, 401 JSON)
- [x] Cleanup build/lint pipeline (entrypoint + import normalization + lint pass)
- [x] Student role E2E cơ bản (đã xác thực với account thực tế `SVTEST01`)
- [x] Student data parity: gán room/contract hiện hành → `rooms/current` và `contracts/my/current` đều pass ✅
- [x] SP `sp_HopDong_GetCurrentBySinhVien` được apply vào DB (thiếu trong DB dù có trong file .sql)
- [x] Final smoke test: 9/9 PASSED (admin/unauthorized/reports/contracts/student full flow)

---

## Cấu trúc thư mục React dự kiến

```
Frontend-React/src/
├── api/
│   └── apiClient.ts          # Wrapper axios/fetch giữ nguyên logic cũ
├── components/
│   ├── common/               # Shared: Button, Table, Modal, Pagination, Alert
│   ├── layout/               # AdminLayout, StudentLayout, OfficerLayout, Sidebar, Header
│   └── forms/                # Form inputs, Select, DatePicker
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useApi.ts
│   └── useAuth.ts
├── pages/
│   ├── auth/                 # Login, ChangePassword
│   ├── admin/                # Dashboard, Buildings, Rooms, Students, ...
│   ├── student/              # Dashboard, Profile, Bills, ...
│   └── officer/              # Dashboard, Registrations, ...
├── types/
│   └── api.ts                # Type definitions cho API responses
├── utils/
│   ├── formatters.ts         # formatCurrency, formatDate (giữ nguyên từ Utils)
│   └── constants.ts          # CONFIG endpoints, DEMO_ACCOUNTS
├── App.tsx
└── main.tsx
```

## API Endpoints Mapping (từ config.js)

### Auth
- POST `/auth/login`
- POST `/auth/change-password`
- GET `/auth/users`
- GET `/auth/users/{id}`
- POST `/auth/users`
- PUT `/auth/users/{id}`
- DELETE `/auth/users/{id}`
- POST `/auth/users/{id}/reset-password`
- POST `/auth/users/{id}/lock`

### Admin
- GET/POST `/admin/api/buildings`, GET/PUT/DELETE `/admin/api/buildings/{id}`
- GET/POST `/admin/api/rooms`, GET/PUT/DELETE `/admin/api/rooms/{id}`
- GET `/admin/api/rooms/empty`
- GET/POST `/admin/api/beds`, GET/PUT/DELETE `/admin/api/beds/{id}`
- GET/POST `/admin/api/students`, GET/PUT/DELETE `/admin/api/students/{id}`
- GET `/admin/api/students/by-room/{maPhong}`
- GET/POST `/admin/api/contracts`, GET/PUT/DELETE `/admin/api/contracts/{id}`
- POST `/admin/api/contracts/{id}/extend`
- GET `/admin/api/contracts/student/{studentId}/current`
- GET/POST `/admin/api/bills`, GET/PUT/DELETE `/admin/api/bills/{id}`
- POST `/admin/api/bills/calculate-monthly`
- GET `/admin/api/bills/{id}/details`
- GET/POST `/admin/api/receipts`, GET/PUT/DELETE `/admin/api/receipts/{id}`
- GET/POST `/admin/api/fees`, GET/PUT/DELETE `/admin/api/fees/{id}`
- GET `/admin/api/fees/by-type/{loaiPhi}`
- GET/POST `/admin/api/fee-configs`, GET/PUT/DELETE `/admin/api/fee-configs/{id}`
- GET `/admin/api/fee-configs/by-type/{loai}`
- GET/POST `/admin/api/price-tiers`, GET/PUT/DELETE `/admin/api/price-tiers/{id}`
- GET/POST `/admin/api/meter-readings`, GET/PUT/DELETE `/admin/api/meter-readings/{id}`
- POST `/admin/api/meter-readings/import-excel`
- GET `/admin/api/meter-readings/by-room/{maPhong}`
- GET `/admin/api/meter-readings/by-month/{thang}/{nam}`
- GET/POST `/admin/api/registrations`, GET/PUT/DELETE `/admin/api/registrations/{id}`
- GET/POST `/admin/api/change-requests`, GET/PUT/DELETE `/admin/api/change-requests/{id}`
- GET/POST `/admin/api/violations`, GET/PUT/DELETE `/admin/api/violations/{id}`
- GET/POST `/admin/api/discipline-scores`, GET/PUT/DELETE `/admin/api/discipline-scores/{id}`
- GET `/admin/api/discipline-scores/by-student/{studentId}`
- GET/POST `/admin/api/overdue-notices`, GET/PUT/DELETE `/admin/api/overdue-notices/{id}`
- GET `/admin/api/reports/*` (occupancy-rate, revenue, debt, electricity-water, violations, generate-monthly-bills, calculate-electricity, calculate-water)

### User (Student)
- GET `/user/api/home`
- GET `/user/api/students/profile`, PUT `/user/api/students/profile`
- POST `/user/api/students/change-password`
- GET `/user/api/rooms`, GET `/user/api/rooms/{id}`, GET `/user/api/rooms/current`, GET `/user/api/rooms/available`
- GET `/user/api/buildings`, GET `/user/api/buildings/{id}`
- GET `/user/api/contracts/my`, GET `/user/api/contracts/my/current`
- POST `/user/api/contracts/my/{id}/confirm`
- GET `/user/api/bills/my`, GET `/user/api/bills/my/{id}`
- GET `/user/api/bills/my/{id}/details`
- GET `/user/api/receipts/my`
- GET `/user/api/fees`, GET `/user/api/fees/{id}`, GET `/user/api/fees/by-type/{loaiPhi}`
- GET `/user/api/registrations/my-registrations`, POST `/user/api/registrations`
- GET `/user/api/change-requests`, GET `/user/api/change-requests/my-requests`
- GET `/user/api/violations/my-violations`
- GET `/user/api/discipline-scores/my-scores`
- GET `/user/api/discipline-scores/my/{thang}/{nam}`
- GET `/user/api/notifications/my`, GET `/user/api/notifications/my/{id}`

---

## Backend Bug Fixes (đã hoàn thành 2026-03-23)

### ✅ Bug 1: `calculate-monthly` POST → 500
- **File:** `ReportsController.cs` + `13_SP_BusinessLogic.sql`
- **Root cause:** SP trả `SoLuongHoaDon INT` nhưng C# đọc `KetQua` (STRING); cursor nullable gây crash
- **Fix:** `reader.GetInt32("SoLuongHoaDon")` + SQL cursor `ISNULL()`

### ✅ Bug 2: `electricity-water` GET → 500
- **File:** `ReportsController.cs` + `13_SP_BusinessLogic.sql`
- **Root cause:** SUM/AVG trả INT NULL, C# đọc Decimal
- **Fix:** SQL `ISNULL(SUM/AVG, 0)` + `Convert.ToDecimal()`

### ✅ Bug 3: 401 response empty body
- **File:** `KTX-Admin/Program.cs`
- **Root cause:** JwtBearer không ghi được body trên Kestrel
- **Fix:** `OnChallenge` event với `HandleResponse()` + direct `Body.WriteAsync()`

### ✅ Fix phụ: `generate-monthly-bills` → 500
- **File:** `ReportsController.cs:243`
- **Root cause:** `GetString("KetQua")` nhưng SP trả `SoLuongHoaDon`
- **Fix:** `GetInt32("SoLuongHoaDon")`

### Test Results: 28/29 PASSED (1 fail = nghiệp vụ đúng - Officer 403 trên User API)

### Credentials đúng (từ config.js)
- `admin` / `admin@123`
- `officer` / `officer@123`
- `student` / `123456` (chưa có trong DB)

---

## Bugs Found & Fixed During Full Testing (2026-03-26)

### ✅ Bug 1: JSON case-sensitive (Admin + NguoiDung)
- **File:** `KTX-Admin/Program.cs` + `KTX-NguoiDung/Program.cs`
- **Root cause:** `AddControllers()` không có `JsonOptions`, mặc định .NET 8 case-sensitive
- **Fix:** Thêm `AddJsonOptions` với `PropertyNameCaseInsensitive = true`
- **Impact:** Tất cả POST requests từ React (camelCase) bị 400

### ✅ Bug 2: Officer login qua Gateway → 404
- **Root cause:** Gateway process cũ chưa nạp lại code mới sau rebuild
- **Fix:** Restart Gateway process
- **Impact:** Officer không thể đăng nhập qua gateway URL

### ✅ Bug 3: Student account SVTEST01 password mismatch
- **Root cause:** Password đã bị đổi (reset) trong session trước đó, không còn là `123456`
- **Fix:** Reset password qua `PUT /admin/api/auth/users/6/reset-password`
- **Impact:** Student không thể login để test

### ✅ Bug 5: Frontend OccupancyChart crash (undefined.tenToaNha)
- **File:** `Frontend-React/src/api/apiClient.ts`
- **Root cause:** Backend trả PascalCase (`TenToaNha`, `TyLeLapDay`), TypeScript types dùng camelCase
- **Fix:** Thêm `transformKeys()` — PascalCase/Snake_case → camelCase vào `handleResponse()`
- **Impact:** Admin Dashboard crash khi render OccupancyAreaChart

### ✅ Bug 4: Missing SP `sp_HopDong_GetCurrentBySinhVien`
- **Root cause:** SP có trong file `.sql` nhưng chưa apply vào DB
- **Fix:** `CREATE OR ALTER PROCEDURE` qua `sqlcmd`
- **Impact:** `contracts/my/current` → 500

---

## Lưu ý quan trọng
- Giữ nguyên API endpoints và response format `{ success, data }`
- Giữ nguyên response unwrapping logic (lấy `data.data` nếu cần)
- Giữ nguyên 401 redirect behavior
- Giữ nguyên formatter functions (formatCurrency VND, formatDate vi-VN)
- Role-based routing: admin, student, officer
