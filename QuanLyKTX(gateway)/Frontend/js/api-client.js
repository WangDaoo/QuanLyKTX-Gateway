(() => {
if (window.ApiClient) {
    console.warn('ApiClient is already defined, skipping duplicate api-client.js execution.');
    return;
}

/**
 * REST API Client - Quản Lý Ký Túc Xá
 * 
 * Helper class để gọi REST API một cách chuẩn và dễ dàng
 */

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl || CONFIG.API_BASE_URL;
    }

    /**
     * GET Request - Lấy dữ liệu
     * @param {string} endpoint - API endpoint
     * @param {object} params - Query parameters
     * @returns {Promise} Response data
     */
    async get(endpoint, params = {}) {
        const url = this.buildUrl(endpoint, params);
        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * POST Request - Tạo mới
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body data
     * @returns {Promise} Response data
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT Request - Cập nhật
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body data
     * @returns {Promise} Response data
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE Request - Xóa
     * @param {string} endpoint - API endpoint
     * @returns {Promise} Response data
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Build URL with query parameters
     * @param {string} endpoint - API endpoint
     * @param {object} params - Query parameters
     * @returns {string} Full URL
     */
    buildUrl(endpoint, params) {
        // Nếu endpoint đã có query string, append thêm
        const separator = endpoint.includes('?') ? '&' : '?';
        const queryString = Object.keys(params)
            .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        return queryString ? `${endpoint}${separator}${queryString}` : endpoint;
    }

    /**
     * Make HTTP request
     * @param {string} endpoint - API endpoint
     * @param {object} options - Fetch options
     * @returns {Promise} Response data
     */
    async request(endpoint, options = {}) {
        const token = Utils.getToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
            console.log('API Request:', { method: mergedOptions.method, url, headers: mergedOptions.headers });
            
            const response = await fetch(url, mergedOptions);
            console.log('API Response:', { status: response.status, statusText: response.statusText, url });
            
            // Handle 401 Unauthorized
            if (response.status === 401) {
                const currentPath = window.location.pathname;
                // Nếu đang ở student dashboard và gọi user endpoints, không redirect ngay
                // (có thể endpoint chưa có hoặc cần handle khác)
                const isStudentDashboard = currentPath.includes('student/dashboard');
                const isUserEndpoint = endpoint.includes('/user/api/');
                
                // Chỉ redirect nếu:
                // 1. Không phải student dashboard, HOẶC
                // 2. Là student dashboard nhưng không phải user endpoint (có thể là admin endpoint)
                if (!isStudentDashboard || (isStudentDashboard && !isUserEndpoint)) {
                    Utils.removeToken();
                    const isInSubFolder = currentPath.includes('/admin/') || currentPath.includes('/student/');
                    const basePath = isInSubFolder ? '../' : '';
                    window.location.href = basePath + 'index.html';
                }
                // Nếu là student dashboard + user endpoint, chỉ throw error, không redirect
                throw new Error('Unauthorized - Token không hợp lệ hoặc đã hết hạn');
            }

            // Handle errors
            if (!response.ok) {
                let errorData = {};
                try {
                    const text = await response.text();
                    console.error('Error response text:', text);
                    errorData = text ? JSON.parse(text) : {};
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Parse JSON response
            let data;
            try {
                const text = await response.text();
                console.log('Response text:', text);
                data = text ? JSON.parse(text) : null;
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                throw new Error('Invalid JSON response from server');
            }
            
            // Backend trả về format { success: true, data: [...] } hoặc trực tiếp array
            // Nếu có data field, trả về data, ngược lại trả về toàn bộ response
            if (data && typeof data === 'object') {
                if ('data' in data) {
                    // Nếu data field là array, trả về array
                    // Nếu data field là object, kiểm tra xem có phải là nested data không
                    if (Array.isArray(data.data)) {
                        return data.data;
                    } else if (data.data && typeof data.data === 'object' && 'data' in data.data) {
                        // Nested data structure
                        return data.data.data;
                    } else {
                        return data.data;
                    }
                }
                // Nếu không có data field, trả về toàn bộ object
                return data;
            }
            // Nếu không phải object, trả về nguyên giá trị
            return data;

        } catch (error) {
            console.error('API Request Error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                endpoint: endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`
            });
            throw error;
        }
    }
}

// Create global instance - ensure CONFIG is available
let apiClient;
let apiClientInitialized = false;
let apiClientInitPromise = null;

// Initialize apiClient when CONFIG is ready
function initApiClient() {
    if (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) {
        if (!apiClient) {
            apiClient = new ApiClient();
            window.apiClient = apiClient;
            window.ApiClient = ApiClient;
            apiClientInitialized = true;
            console.log('ApiClient initialized with base URL:', CONFIG.API_BASE_URL);
        }
        return true;
    } else {
        console.warn('CONFIG not available yet, will retry...');
        return false;
    }
}

// Initialize immediately if possible
initApiClient();

// Retry mechanism
if (!apiClientInitialized) {
    let retries = 0;
    const maxRetries = 100; // 10 seconds max wait
    
    const retryInit = setInterval(() => {
        retries++;
        if (initApiClient() || retries >= maxRetries) {
            clearInterval(retryInit);
            if (retries >= maxRetries && !apiClient) {
                console.error('Failed to initialize ApiClient after', maxRetries, 'retries');
            }
        }
    }, 100);
}

// Also try on DOMContentLoaded as backup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!apiClient) {
            initApiClient();
        }
    });
}

// Also try on window load as final backup
window.addEventListener('load', () => {
    if (!apiClient) {
        initApiClient();
    }
});

/**
 * Helper function to ensure apiClient is ready before use
 * Use this in all modules that need to use apiClient
 * @returns {Promise<ApiClient>} The initialized apiClient instance
 */
async function ensureApiClient() {
    // If already initialized, return immediately
    if (apiClient && window.apiClient) {
        return apiClient || window.apiClient;
    }
    
    // Wait for initialization
    let retries = 0;
    const maxRetries = 100; // 10 seconds max wait
    
    while ((typeof apiClient === 'undefined' || !apiClient) && retries < maxRetries) {
        // Try to get from window
        if (window.apiClient) {
            apiClient = window.apiClient;
            return apiClient;
        }
        
        // Try to initialize
        if (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) {
            initApiClient();
            if (apiClient) {
                return apiClient;
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    // Final check
    if (apiClient || window.apiClient) {
        apiClient = apiClient || window.apiClient;
        return apiClient;
    }
    
    throw new Error('ApiClient không thể khởi tạo. Vui lòng kiểm tra CONFIG và refresh trang!');
}

/**
 * Get apiClient instance synchronously (if available) or asynchronously
 * This is a safer alternative to using apiClient directly
 * @returns {ApiClient|Promise<ApiClient>} The apiClient instance
 */
function getApiClient() {
    // If already initialized, return immediately
    if (apiClient && window.apiClient) {
        return apiClient || window.apiClient;
    }
    
    // If CONFIG is available, try to initialize
    if (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) {
        initApiClient();
        if (apiClient) {
            return apiClient;
        }
    }
    
    // Otherwise, return a promise that will wait for initialization
    return ensureApiClient();
}

// Export helper functions globally
window.ensureApiClient = ensureApiClient;
window.getApiClient = getApiClient;

// Create a proxy to apiClient that handles initialization automatically
// Sử dụng window.$api thay vì apiClient để tránh lỗi "apiClient is not defined"
window.$api = new Proxy({}, {
    get: function(target, prop) {
        // Return a function that waits for apiClient and then calls the method
        return async function(...args) {
            const client = await ensureApiClient();
            if (typeof client[prop] === 'function') {
                return client[prop].apply(client, args);
            }
            return client[prop];
        };
    }
});

// Tạo alias an toàn cho apiClient
// Sử dụng: await $api.get(...) thay vì await apiClient.get(...)
Object.defineProperty(window, 'safeApiClient', {
    get: function() {
        // Trả về proxy object
        return window.$api;
    },
    configurable: true
});
})();
/**
 * REST API Examples:
 * 
 * // GET - Lấy danh sách
 * const buildings = await apiClient.get('/admin/api/buildings');
 * 
 * // GET với query params
 * const bills = await apiClient.get('/admin/api/bills', {
 *   thang: 10,
 *   nam: 2024,
 *   trangThai: 'Chưa thanh toán'
 * });
 * 
 * // POST - Tạo mới
 * const newBuilding = await apiClient.post('/admin/api/buildings', {
 *   tenToaNha: 'Tòa nhà A',
 *   diaChi: '123 Đường ABC'
 * });
 * 
 * // PUT - Cập nhật
 * const updated = await apiClient.put('/admin/api/buildings/1', {
 *   tenToaNha: 'Tòa nhà A (Đã cập nhật)'
 * });
 * 
 * // DELETE - Xóa
 * await apiClient.delete('/admin/api/buildings/1');
 */

