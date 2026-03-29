<!-- b98bcc67-6d8c-445b-bbde-17b53995b0c7 d9f685ac-6a5c-4c0e-9b86-698829a1eaf7 -->
# Kế hoạch kiểm tra độ bao phủ API trong Postman

## Mục tiêu

Kiểm tra xem Postman collection đã bao phủ toàn bộ API endpoints chưa và tạo báo cáo chi tiết về:

- Số lượng endpoints trong controllers vs Postman requests
- Missing endpoints
- Missing test scripts
- Test coverage percentage

## Các bước thực hiện

### 1. Liệt kê tất cả endpoints trong Controllers

- Đọc tất cả controllers trong KTX-Admin (17 controllers)
- Đọc tất cả controllers trong KTX-NguoiDung (12 controllers)
- Ghi nhận: Route, HTTP method, Controller method name

### 2. Phân tích Postman Collection

- Đếm tổng số requests trong Postman
- Phân loại theo HTTP methods (GET, POST, PUT, DELETE)
- Phân loại theo resource (Buildings, Rooms, Beds, etc.)

### 3. So sánh và xác định missing endpoints

- So sánh từng endpoint trong controllers với Postman requests
- Liệt kê endpoints có trong controllers nhưng không có trong Postman
- Phân loại missing endpoints theo mức độ quan trọng

### 4. Phân tích test scripts

- Đếm số requests có test scripts
- Phân tích chất lượng test scripts
- Xác định requests thiếu test scripts

### 5. Tạo báo cáo tổng hợp

- Tạo file `BAO_CAO_DO_BAO_PHU_API_POSTMAN.md`
- Bao gồm:
- Tổng số endpoints trong controllers
- Tổng số requests trong Postman
- Missing endpoints chi tiết
- Test scripts coverage
- Đề xuất cải thiện

## Files sẽ tạo/đọc

- Đọc: Tất cả controllers trong KTX-Admin và KTX-NguoiDung
- Đọc: `Postman/QuanLyKTX.postman_collection.json`
- Tạo: `BAO_CAO_DO_BAO_PHU_API_POSTMAN.md`

## Kết quả mong đợi

- Báo cáo chi tiết về độ bao phủ API
- Danh sách missing endpoints cần bổ sung
- Đề xuất test scripts cho các requests quan trọng

### To-dos

- [ ] Đối chiếu CSDL.sql với Models trong KTX-Admin và KTX-NguoiDung - kiểm tra mapping columns, data types, nullable constraints
- [ ] Kiểm tra stored procedures trong CSDL.sql có được controllers gọi đúng không, đối chiếu parameter names
- [ ] Đối chiếu API routes trong controllers với Postman collection - kiểm tra paths, HTTP methods, request/response structure
- [ ] Kiểm tra ocelot.json routing configuration - đảm bảo Gateway route đúng đến Admin và User services
- [ ] Kiểm tra response structure trong controllers có nhất quán không - đối chiếu với Postman expected responses
- [ ] Tạo file http-client.env.json với các biến environment (gateway_url, admin_url, user_url, token)
- [ ] Tạo file Gateway.http với các authentication endpoints (login, register, change-password)
- [ ] Tạo file Admin.http với tất cả Admin API endpoints, nhóm theo controllers
- [ ] Tạo file User.http với tất cả User API endpoints, nhóm theo chức năng
- [ ] Tạo báo cáo BAO_CAO_KIEM_TRA_TOAN_DIEN.md liệt kê tất cả vấn đề tìm thấy và đề xuất sửa lỗi