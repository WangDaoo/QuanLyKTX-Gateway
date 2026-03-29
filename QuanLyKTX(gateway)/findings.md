# Findings — Migrate HTML/JS/CSS → React

## Kiến trúc hiện tại

### Frontend (HTML/JS/CSS)
- **Base path:** `d:\Project\QuanLyKTX-main\QuanLyKTX(gateway)\Frontend`
- **3 nhóm user:** Admin, Officer, Student
- **File cấu trúc:**
  - `index.html` → Login page
  - `admin/` → 21 HTML pages + 21 JS files (dashboard, buildings, rooms, beds, students, contracts, bills, receipts, fees, fee-configs, price-tiers, meter-readings, registrations, change-requests, violations, discipline-scores, overdue-notices, reports, users, change-password)
  - `student/` → 12 HTML pages + 12 JS files (dashboard, profile, room, contract, bills, payments, fees, services, requests, discipline-scores, violations)
  - `officer/` → 6 HTML pages + 6 JS files (dashboard, registrations, change-requests, meter-readings, violations, reports)
  - `css/` → style.css, admin.css, auth.css
  - `js/` → config.js, api-client.js, api-helper.js, auth.js, + 41 module JS files

### API Layer
- **Base URL:** `http://localhost:8000` (Ocelot Gateway)
- **Auth:** JWT Bearer token, lưu trong localStorage key `token`
- **User data:** localStorage key `user` (JSON, có field `vaiTro` / `VaiTro`)
- **Response format:** `{ success: bool, data: any }` hoặc trực tiếp array
- **Response unwrapping:** nếu `data.data` tồn tại và là array → trả về `data.data`
- **401 handling:** xóa token → redirect về `index.html`

### Backend (đã có sẵn)
- **KTX-Admin** (ASP.NET Core 8) → `/admin/api/*`
- **KTX-Gateway** (Ocelot) → Gateway router
- **KTX-NguoiDung** (ASP.NET Core 8) → `/user/api/*`

## Phát hiện quan trọng

### 1. Response unwrapping phức tạp
```js
// api-client.js request() method:
// Backend trả về { success: true, data: [...] }
// apiClient trả về: nếu data.data là array → return data.data
// Nếu data.data.data tồn tại → return data.data.data
// Ngược lại → return data.data hoặc data
```
**Hành vi:** Đôi khi trả về array, đôi khi trả về object → cần type guard trong React.

### 2. 3 role người dùng
| Role | Redirect URL | Sidebar pages |
|------|-------------|---------------|
| admin | admin/dashboard.html | 21 modules |
| student | student/dashboard.html | 12 modules |
| officer | officer/dashboard.html | 6 modules |

### 3. API routes theo service
- Admin endpoints: `/admin/api/*` (KTX-Admin service)
- User endpoints: `/user/api/*` (KTX-NguoiDung service)
- Auth endpoints: `/auth/*` (chung)

### 4. File CSS đã tách biệt
- `auth.css` → Login page
- `style.css` → Student pages + shared
- `admin.css` → Admin pages (override style.css)

### 5. Utils functions cần migrate
```js
formatDate(dateString)      // vi-VN locale
formatCurrency(amount)       // VND currency
showLoading() / hideLoading() // Loading overlay
showAlert(message, type)    // toast notification
getToken() / setToken()     // localStorage
getUser() / setUser()       // localStorage
isAuthenticated()           // boolean
requireAuth()               // redirect if not auth
```

### 6. Frontend-React đã có sẵn
- Vite + TypeScript project
- Chỉ có `src/main.tsx` rỗng
- Cần cài thêm: react-router-dom, axios, tailwindcss (hoặc giữ CSS hiện tại)

## Findings bổ sung — 2026-03-25 (implementation start)

1. **Entrypoint mismatch là blocker chính**
   - `Frontend-React/index.html` đang trỏ `src/main.jsx` cũ, khiến app chạy skeleton thay vì hệ TSX mới.
   - Đã fix sang `src/main.tsx`.

2. **Legacy JSX bootstrap còn sót**
   - `src/main.jsx`, `src/App.jsx` tồn tại từ giai đoạn scaffold cũ, gây nhiễu lint/build và runtime selection.
   - Đã loại bỏ.

3. **Route map thiếu page implementation**
   - `App.tsx` import `./pages/admin/Students` nhưng file chưa tồn tại -> build fail.
   - Đã tạo `src/pages/admin/Students.tsx` theo pattern CRUD hiện hữu.

4. **Import path drift sau migration số lượng lớn file**
   - Nhiều page dùng path `../../../...` thay vì `../../...` trong `src/pages/**`.
   - Đã normalize path để app compile.

5. **Chất lượng code hiện tại: build pass, lint fail nhiều**
   - Build pass nhưng lint còn nhiều lỗi kiểu chất lượng (any/unused/react-refresh/hooks).
   - Cần một pass kỹ thuật để làm sạch trước khi chạy full smoke test.

## Findings bổ sung — 2026-03-25 (implementation start)

1. **Entrypoint mismatch là blocker chính**
   - `Frontend-React/index.html` đang trỏ `src/main.jsx` cũ, khiến app chạy skeleton thay vì hệ TSX mới.
   - Đã fix sang `src/main.tsx`.

2. **Legacy JSX bootstrap còn sót**
   - `src/main.jsx`, `src/App.jsx` tồn tại từ giai đoạn scaffold cũ, gây nhiễu lint/build và runtime selection.
   - Đã loại bỏ.

3. **Route map thiếu page implementation**
   - `App.tsx` import `./pages/admin/Students` nhưng file chưa tồn tại -> build fail.
   - Đã tạo `src/pages/admin/Students.tsx` theo pattern CRUD hiện hữu.

4. **Import path drift sau migration số lượng lớn file**
   - Nhiều page dùng path `../../../...` thay vì `../../...` trong `src/pages/**`.
   - Đã normalize path để app compile.

5. **Chất lượng code hiện tại: build pass, lint fail nhiều**
   - Build pass nhưng lint còn nhiều lỗi kiểu chất lượng (any/unused/react-refresh/hooks).
   - Cần một pass kỹ thuật để làm sạch trước khi chạy full smoke test.

## Findings bổ sung — 2026-03-25 (smoke verification)

1. **Runtime stack readiness**
   - Frontend Vite chạy ổn tại `http://localhost:3000`.
   - Gateway/Admin/NguoiDung đều listen đúng cổng 8000/8001/8002.

2. **Auth + role boundary behavior đúng kỳ vọng**
   - Admin/Officer login thành công qua `/auth/login`.
   - Unauthorized gọi admin endpoint trả 401.
   - Officer gọi user endpoint bị 403 (đúng phân quyền).

3. **Nhóm endpoint report/billing từng lỗi đã ổn định**
   - `electricity-water`, `revenue`, `debt`, `violations`, `generate-monthly-bills`, `calculate-monthly` đều trả 200 trong smoke test.

4. **Blocker còn lại cho full UAT Student**
   - `student` login vẫn 401 -> cần tạo/cập nhật account Student trong DB để hoàn tất test end-to-end role Student.

## Findings bổ sung — 2026-03-25 (smoke verification)

1. **Runtime stack readiness**
   - Frontend Vite chạy ổn tại `http://localhost:3000`.
   - Gateway/Admin/NguoiDung đều listen đúng cổng 8000/8001/8002.

2. **Auth + role boundary behavior đúng kỳ vọng**
   - Admin/Officer login thành công qua `/auth/login`.
   - Unauthorized gọi admin endpoint trả 401.
   - Officer gọi user endpoint bị 403 (đúng phân quyền).

3. **Nhóm endpoint report/billing từng lỗi đã ổn định**
   - `electricity-water`, `revenue`, `debt`, `violations`, `generate-monthly-bills`, `calculate-monthly` đều trả 200 trong smoke test.

4. **Blocker còn lại cho full UAT Student**
   - `student` login vẫn 401 -> cần tạo/cập nhật account Student trong DB để hoàn tất test end-to-end role Student.

## Findings bổ sung — 2026-03-25 (student role verification)

1. **Student account thực tế trong DB khác demo account**
   - Không có username `student`; có Student user `SVTEST01` (id=6).
   - Sau reset password/unlock: login `SVTEST01/123456` thành công.

2. **Student endpoints status**
   - Pass: `/user/api/home`, `/user/api/students/profile`, `/user/api/bills/my`, `/user/api/fees`, `/user/api/change-requests/my-requests`, `/user/api/violations/my-violations`, `/user/api/discipline-scores/my-scores`.
   - 404: `/user/api/rooms/current`, `/user/api/contracts/my/current` (khả năng thiếu dữ liệu phòng/hợp đồng hiện hành cho SVTEST01).

## Findings bổ sung — 2026-03-25 (student role verification)

1. **Student account thực tế trong DB khác demo account**
   - Không có username `student`; có Student user `SVTEST01` (id=6).
   - Sau reset password/unlock: login `SVTEST01/123456` thành công.

2. **Student endpoints status**
   - Pass: `/user/api/home`, `/user/api/students/profile`, `/user/api/bills/my`, `/user/api/fees`, `/user/api/change-requests/my-requests`, `/user/api/violations/my-violations`, `/user/api/discipline-scores/my-scores`.
   - 404: `/user/api/rooms/current`, `/user/api/contracts/my/current` (khả năng thiếu dữ liệu phòng/hợp đồng hiện hành cho SVTEST01).

## Findings bổ sung — 2026-03-26 (student parity deep check)

1. **Đã xử lý được `rooms/current`**
   - Gán room/bed và tạo contract active cho student `SVTEST01` (student id=5) qua admin APIs.
   - `/user/api/rooms/current` đã trả 200 đúng.

2. **`contracts/my/current` bị chặn ở backend layer**
   - Dù `/admin/api/contracts` đã có contract active cho student 5, endpoint current-contract vẫn fail.
   - Kiểm tra trực tiếp `/admin/api/contracts/student/5/current` trả 500 với lỗi:
     `Could not find stored procedure 'sp_HopDong_GetCurrentBySinhVien'`.
   - Kết luận: blocker nằm ở DB/SP backend, không phải dữ liệu frontend hay token/role.

3. **Tác động đến E2E**
   - Student role gần hoàn tất parity.
   - Điểm còn lại duy nhất cho contract-current cần backend bổ sung SP tương ứng.

## Findings bổ sung — 2026-03-26 (student parity deep check)

1. **Đã xử lý được `rooms/current`**
   - Gán room/bed và tạo contract active cho student `SVTEST01` (student id=5) qua admin APIs.
   - `/user/api/rooms/current` đã trả 200 đúng.

2. **`contracts/my/current` bị chặn ở backend layer**
   - Dù `/admin/api/contracts` đã có contract active cho student 5, endpoint current-contract vẫn fail.
   - Kiểm tra trực tiếp `/admin/api/contracts/student/5/current` trả 500 với lỗi:
     `Could not find stored procedure 'sp_HopDong_GetCurrentBySinhVien'`.
   - Kết luận: blocker nằm ở DB/SP backend, không phải dữ liệu frontend hay token/role.

3. **Tác động đến E2E**
   - Student role gần hoàn tất parity.
   - Điểm còn lại duy nhất cho contract-current cần backend bổ sung SP tương ứng.

## Rủi ro & Thách thức
1. **CRUD phức tạp:** Bills có nested details, Contracts có extend flow, MeterReadings có import Excel
2. **Role-based routing:** Cần ProtectedRoute theo role cụ thể
3. **CSS migration:** style.css + admin.css rất lớn, cần quyết định giữ CSS thuần hay chuyển sang Tailwind/CSS modules
4. **Large-scale:** 39 HTML pages + 39 JS files → cần nhiều session
5. **File path đặc biệt:** `QuanLyKTX(gateway)` có dấu ngoặc → cần escape khi dùng bash

---

## API Test Results — 2026-03-22

### Tổng quan: 51 passed | 11 failed trên ~62 test cases

### ✅ PASSED (51 tests)

| Nhóm | Endpoint | Status |
|------|----------|--------|
| Auth | POST /auth/login | ✅ 200 - token + user object đúng |
| Auth | GET /auth/users | ✅ 200 - array users |
| Buildings | GET/POST/PUT/DELETE | ✅ CRUD đầy đủ |
| Rooms | GET /admin/api/rooms | ✅ 200 |
| Rooms | GET /admin/api/rooms/empty | ✅ 200 |
| Beds | GET /admin/api/beds | ✅ 200 |
| Students | GET + by-room | ✅ 200 |
| Contracts | GET /admin/api/contracts | ✅ 200 (array rỗng - OK) |
| Bills | GET /admin/api/bills | ✅ 200 + details endpoint |
| Bills | POST calculate-monthly | ⚠️ 500 - bug SP varchar/nvarchar |
| Receipts | GET /admin/api/receipts | ✅ 200 |
| FeeConfigs | GET /admin/api/fee-configs | ✅ 200 |
| PriceTiers | GET + by-type | ✅ 200 |
| MeterReadings | GET /admin/api/meter-readings | ✅ 200 |
| MeterReadings | by-room + by-month | ✅ 200 |
| Registrations | GET /admin/api/registrations | ✅ 200 |
| ChangeRequests | GET /admin/api/change-requests | ✅ 200 |
| Violations | GET + POST | ✅ 200 |
| DisciplineScores | GET + POST | ✅ 200 |
| OverdueNotices | GET /admin/api/overdue-notices | ✅ 200 |
| Reports | occupancy-rate | ✅ 200 |
| Reports | revenue?thang&nam | ✅ 200 |
| Reports | debt?thang&nam | ✅ 200 |
| Reports | calculate-electricity | ⚠️ 405 Method Not Allowed |
| Reports | calculate-water | ⚠️ 405 Method Not Allowed |
| Unauthorized | GET /admin/api/buildings (no token) | ✅ 401 |
| Student APIs | 13 endpoints | ⚠️ Login thất bại (chưa test được) |

---

### ❌ FAILED (11 tests)

| # | Test | Nguyên nhân | Nghiệp vụ? |
|---|------|-----------|-------------|
| 1 | GET /auth/users/1 → 404 | Tài khoản MaTaiKhoan=1 đã bị xóa mềm (IsDeleted=1) | ✅ Đúng nghiệp vụ |
| 2 | Contract có maHopDong | Contract array rỗng (chưa có dữ liệu test) | ✅ Không phải bug |
| 3 | POST /admin/api/contracts FK error | Test dùng `maPhong` thay vì `maGiuong` | ⚠️ **Frontend gửi sai field** |
| 4 | POST /admin/api/bills/calculate-monthly → 500 | SP `sp_HoaDon_GenerateMonthly` bug varchar/nvarchar | ⚠️ **Bug backend cần fix** |
| 5 | Fee có maPhi | Fee array rỗng hoặc field khác | ✅ Cần check SP |
| 6 | POST meter-readings → lỗi | Test dùng field sai | ⚠️ Cần kiểm tra |
| 7 | GET electricity-water → 500 | SP `sp_BaoCaoDienNuoc` bug Int32/Decimal | ⚠️ **Bug backend cần fix** |
| 8 | GET calculate-electricity → 405 | POST nhưng gọi GET | ⚠️ **Frontend gọi sai method** |
| 9 | GET calculate-water → 405 | POST nhưng gọi GET | ⚠️ **Frontend gọi sai method** |
| 10 | Unauthorized → lỗi JSON parse | Response 401 không có body | ⚠️ **Backend không trả JSON ở 401** |
| 11 | Student login → thất bại | Tài khoản student chưa tạo/bị xóa | ⚠️ Cần tạo test data |

---

### 🔴 BUG BACKEND ĐÃ FIX (2026-03-23) — ✅ ALL FIXED

#### Bug 1: `sp_TaoHoaDonHangThang` — Unable to cast String to Int32
- **File:** `ReportsController.cs` + `13_SP_BusinessLogic.sql`
- **Root cause:** SP trả `SoLuongHoaDon INT` nhưng `ReportsController.GenerateMonthlyBills` dùng `reader.GetString("KetQua")`; cursor nullable (HoTen/MSSV) gây crash
- **Fix:** `reader.GetInt32("SoLuongHoaDon")` + SQL cursor `ISNULL(s.HoTen,...)` + `ISNULL(s.MSSV,...)`; SQL đã apply vào DB

#### Bug 2: `sp_BaoCaoDienNuoc` — Int32/Decimal cast error
- **File:** `ReportsController.cs` line 163-164 + `13_SP_BusinessLogic.sql`
- **Root cause:** SUM/AVG trả INT NULL, C# dùng `Convert.ToDecimal()` nhưng thiếu ISNULL trong SQL
- **Fix:** SQL `ISNULL(SUM(...),0)` + `ISNULL(AVG(...),0)` + C# `Convert.ToDecimal()`

#### Bug 3: 401/403 response không có JSON body
- **File:** `KTX-Admin/Program.cs` + `KTX-Gateway/Program.cs`
- **Root cause:** JwtBearerEvents.OnChallenge không ghi được body trên Kestrel; Ocelot bypass middleware
- **Fix:** KTX-Admin `Program.cs` thêm `OnChallenge` event với `HandleResponse()` + direct `Body.WriteAsync()`; Custom `UnauthorizedMiddleware` cho Gateway Ocelot

#### Fix phụ: `ReportsController.cs:243` — `GetString("KetQua")` → `GetInt32("SoLuongHoaDon")`
- **Test Results: 28/29 PASSED** (1 fail = đúng nghiệp vụ: Officer 403 trên `/user/api/buildings`)

### Credentials (từ config.js)
- `admin` / `admin@123` ✅
- `officer` / `officer@123` ✅
- `student` / `123456` ❌ (chưa có account trong DB)

---

### ⚠️ LỖI FRONTEND ĐÃ FIX

| Lỗi | Fix đã áp dụng |
|------|-----------------|
| `REPORT_GENERATE_MONTHLY_BILLSS` typo | → `REPORT_GENERATE_MONTHLY_BILLS` |
| Report types sai (single object vs array) | → Đổi sang array, fix columns |
| Contract type dùng `maPhong` | → Đổi sang `maGiuong` + `giaPhong` |
| Fee type dùng `maPhi`/`tenPhi`/`soTien` | → Đổi sang `maMucPhi`/`tenMucPhi`/`giaTien` |

---

### 📋 RECOMMENDATIONS

1. **✅ Đã fix toàn bộ 3 bug backend** — API 28/29 passed
2. **Tạo test data** cho Student account (chưa có trong DB)
3. **Thêm endpoint** `GET /admin/api/contracts/student/{id}/current` để hiển thị thông tin hợp đồng với `hoTen`, `tenPhong`
4. **Frontend React** — đã tạo đầy đủ components cho 39 pages, cần deploy và test
5. **JWT token structure** — Backend trả `data.token` không chuẩn (nên là `data.accessToken`)
