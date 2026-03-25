/**
 * API Helper - Safe wrapper for apiClient
 * File này đảm bảo apiClient luôn sẵn sàng trước khi sử dụng
 * 
 * Sử dụng:
 * - Thay vì: await apiClient.get(...)
 * - Dùng: await getApi().get(...)
 * 
 * Hoặc:
 * - const client = await getApi();
 * - await client.get(...)
 */

/**
 * Get apiClient instance safely
 * Tự động đợi apiClient được khởi tạo nếu chưa sẵn sàng
 * @returns {Promise<ApiClient>} The apiClient instance
 */
async function getApi() {
    // Priority 1: apiClient đã sẵn sàng
    if (typeof apiClient !== 'undefined' && apiClient) {
        return apiClient;
    }
    
    // Priority 2: window.apiClient
    if (window.apiClient) {
        return window.apiClient;
    }
    
    // Priority 3: getSafeApiClient từ config.js
    if (typeof getSafeApiClient !== 'undefined') {
        return await getSafeApiClient();
    }
    
    // Priority 4: ensureApiClient từ api-client.js
    if (typeof ensureApiClient !== 'undefined') {
        return await ensureApiClient();
    }
    
    // Priority 5: getApiClient từ api-client.js
    if (typeof getApiClient !== 'undefined') {
        const client = getApiClient();
        if (client instanceof Promise) {
            return await client;
        }
        return client;
    }
    
    // Fallback: đợi và thử lại
    let retries = 0;
    const maxRetries = 100; // 10 seconds
    
    while (retries < maxRetries) {
        // Kiểm tra lại
        if (typeof apiClient !== 'undefined' && apiClient) {
            return apiClient;
        }
        if (window.apiClient) {
            return window.apiClient;
        }
        
        // Thử khởi tạo nếu CONFIG đã sẵn sàng
        if (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) {
            if (typeof initApiClient === 'function') {
                initApiClient();
                if (apiClient || window.apiClient) {
                    return apiClient || window.apiClient;
                }
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    // Nếu vẫn không có, throw error
    throw new Error('ApiClient không thể khởi tạo sau ' + maxRetries + ' lần thử. Vui lòng kiểm tra CONFIG và refresh trang!');
}

/**
 * Synchronous version - chỉ dùng khi chắc chắn apiClient đã sẵn sàng
 * @returns {ApiClient|null} The apiClient instance or null
 */
function getApiSync() {
    if (typeof apiClient !== 'undefined' && apiClient) {
        return apiClient;
    }
    if (window.apiClient) {
        return window.apiClient;
    }
    return null;
}

// Export globally
window.getApi = getApi;
window.getApiSync = getApiSync;

/**
 * Usage Examples:
 * 
 * // Async (recommended)
 * const client = await getApi();
 * const data = await client.get('/admin/api/buildings');
 * 
 * // Trong async function
 * async function loadData() {
 *     const client = await getApi();
 *     return await client.get('/admin/api/buildings');
 * }
 * 
 * // Synchronous (chỉ dùng khi chắc chắn đã sẵn sàng)
 * const client = getApiSync();
 * if (client) {
 *     client.get('/admin/api/buildings').then(data => {
 *         console.log(data);
 *     });
 * }
 */

