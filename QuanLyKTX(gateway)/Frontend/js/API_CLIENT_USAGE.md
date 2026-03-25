# Hướng Dẫn Sử Dụng API Client An Toàn

## Vấn đề
Lỗi "apiClient is not defined" xuất hiện khi module JS chạy trước khi `apiClient` khởi tạo xong. Kết quả là toàn bộ lời gọi API bị dừng đột ngột và người dùng không nhận được thông báo rõ ràng.

## Giải pháp duy nhất: dùng `$api`
`$api` (được tạo trong `api-client.js`) là một Proxy đảm bảo:
- Tự động đợi `apiClient` khởi tạo
- Forward đúng method (`get`, `post`, `put`, `delete`, …) cùng context
- Thống nhất error handling

> ✅ **Quy tắc vàng:** Từ nay chỉ gọi API thông qua `await $api.<method>(...)`. Không sử dụng `apiClient`, `window.apiClient`, hay tự viết `waitForApiClient`.

```javascript
// ❌ Cũ (dễ lỗi)
const data = await apiClient.get(CONFIG.ENDPOINTS.BUILDINGS);

// ✅ Mới
const data = await $api.get(CONFIG.ENDPOINTS.BUILDINGS);
```

### Khi nào dùng `getApi()`
`getApi()` trong `api-helper.js` vẫn có thể dùng khi buộc phải truyền instance thực vào thư viện khác. Tuy nhiên mặc định hãy dùng `$api`.

```javascript
const client = await getApi(); // Chỉ dùng nếu thật sự cần instance thật
await client.post(...);
```

## Pattern chuẩn cho module

```javascript
class AdminExample {
    constructor() {
        this.items = [];
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            Utils.showLoading();
            await Promise.all([this.loadItems(), this.loadRelatedData()]);
        } catch (error) {
            console.error('Bootstrap error:', error);
            Utils.showAlert('Lỗi tải dữ liệu: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async loadItems() {
        const data = await $api.get(CONFIG.ENDPOINTS.BUILDINGS);
        this.items = Array.isArray(data) ? data : [];
        this.renderTable();
    }

    async saveItem(payload) {
        Utils.showLoading();
        try {
            if (this.editingItem) {
                await $api.put(CONFIG.ENDPOINTS.BUILDING_BY_ID(this.editingItem.id), payload);
            } else {
                await $api.post(CONFIG.ENDPOINTS.BUILDINGS, payload);
            }
            Utils.showAlert('Lưu thành công!', 'success');
            await this.loadItems();
        } catch (error) {
            console.error('Save error:', error);
            Utils.showAlert('Lỗi lưu dữ liệu: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}
```

## Checklist bắt buộc
- [ ] Không còn `apiClient` / `window.apiClient` trong file
- [ ] Tất cả lời gọi dùng `await $api.<method>(...)`
- [ ] Không tự tạo `waitForApiClient`, `getApiClient`, hay `apiClient || window.apiClient`
- [ ] Các hàm async đều có try/catch + loading state phù hợp
- [ ] HTML load script đúng thứ tự: `config.js` → `api-client.js` → module

## Ví dụ hoàn chỉnh

```javascript
class AdminBuildings {
    constructor() {
        this.buildings = [];
        this.editingBuilding = null;
        this.init();
    }

    init() {
        Utils.requireAuth();
        this.loadUserInfo();
        this.bootstrap();
    }

    async bootstrap() {
        try {
            Utils.showLoading();
            await this.loadBuildings();
            this.setupForm();
        } catch (error) {
            console.error('Init buildings error:', error);
            Utils.showAlert('Lỗi tải tòa nhà: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }

    async loadBuildings() {
        const data = await $api.get(CONFIG.ENDPOINTS.BUILDINGS);
        this.buildings = Array.isArray(data) ? data : [];
        this.renderBuildingsTable();
    }

    async saveBuilding() {
        const formData = {
            tenToaNha: document.getElementById('tenToaNha').value,
            diaChi: document.getElementById('diaChi').value || null
        };

        Utils.showLoading();
        try {
            if (this.editingBuilding) {
                await $api.put(CONFIG.ENDPOINTS.BUILDING_BY_ID(this.editingBuilding.maToaNha), formData);
            } else {
                await $api.post(CONFIG.ENDPOINTS.BUILDINGS, formData);
            }
            Utils.showAlert('Lưu tòa nhà thành công!', 'success');
            this.closeModal();
            await this.loadBuildings();
        } catch (error) {
            console.error('Save building error:', error);
            Utils.showAlert('Lỗi lưu tòa nhà: ' + error.message, 'danger');
        } finally {
            Utils.hideLoading();
        }
    }
}
```

## Quick fix
- `await apiClient.` → `await $api.`
- `apiClient.` (không có `await`) → thêm `await $api.` và đánh dấu function là `async`
- Xóa mọi helper `waitForApiClient`, `getApiClient`, `apiClient || window.apiClient`

Sau khi refactor, chạy lại checklist trong `KIEM_TRA_TEMPLATE.md` cho từng chức năng để đảm bảo đồng bộ.
