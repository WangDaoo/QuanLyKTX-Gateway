(() => {
// Prevent double-loading
if (window.CONFIG) {
    console.warn('CONFIG is already defined, skipping duplicate config.js execution.');
    return;
}

// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000',
    ENDPOINTS: {
        // Authentication
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        CHANGE_PASSWORD: '/auth/change-password',
        USERS: '/auth/users',
        USER_BY_ID: (id) => `/auth/users/${id}`,
        USER_RESET_PASSWORD: (id) => `/auth/users/${id}/reset-password`,
        USER_LOCK: (id) => `/auth/users/${id}/lock`,
        
        // Admin - Buildings
        BUILDINGS: '/admin/api/buildings',
        BUILDING_BY_ID: (id) => `/admin/api/buildings/${id}`,
        
        // Admin - Rooms
        ROOMS: '/admin/api/rooms',
        ROOM_BY_ID: (id) => `/admin/api/rooms/${id}`,
        ROOMS_EMPTY: '/admin/api/rooms/empty',
        
        // Admin - Beds
        BEDS: '/admin/api/beds',
        BED_BY_ID: (id) => `/admin/api/beds/${id}`,
        
        // Admin - Students
        STUDENTS: '/admin/api/students',
        STUDENT_BY_ID: (id) => `/admin/api/students/${id}`,
        STUDENTS_BY_ROOM: (maPhong) => `/admin/api/students/by-room/${maPhong}`,
        
        // Admin - Contracts
        CONTRACTS: '/admin/api/contracts',
        CONTRACT_BY_ID: (id) => `/admin/api/contracts/${id}`,
        CONTRACT_EXTEND: (id) => `/admin/api/contracts/${id}/extend`,
        CONTRACT_CURRENT_BY_STUDENT: (studentId) => `/admin/api/contracts/student/${studentId}/current`,
        
        // Admin - Bills
        BILLS: '/admin/api/bills',
        BILL_BY_ID: (id) => `/admin/api/bills/${id}`,
        BILL_CALCULATE_MONTHLY: '/admin/api/bills/calculate-monthly',
        BILL_DETAILS: (id) => `/admin/api/bills/${id}/details`,
        BILL_DETAIL_BY_ID: (id, detailId) => `/admin/api/bills/${id}/details/${detailId}`,
        
        // Admin - Receipts
        RECEIPTS: '/admin/api/receipts',
        RECEIPT_BY_ID: (id) => `/admin/api/receipts/${id}`,
        
        // Admin - Fees
        FEES: '/admin/api/fees',
        FEE_BY_ID: (id) => `/admin/api/fees/${id}`,
        FEES_BY_TYPE: (loaiPhi) => `/admin/api/fees/by-type/${loaiPhi}`,
        
        // Admin - Fee Configs
        FEE_CONFIGS: '/admin/api/fee-configs',
        FEE_CONFIG_BY_ID: (id) => `/admin/api/fee-configs/${id}`,
        FEE_CONFIGS_BY_TYPE: (loai) => `/admin/api/fee-configs/by-type/${loai}`,
        
        // Admin - Price Tiers
        PRICE_TIERS: '/admin/api/price-tiers',
        PRICE_TIER_BY_ID: (id) => `/admin/api/price-tiers/${id}`,
        PRICE_TIERS_BY_TYPE: (loai) => `/admin/api/price-tiers/by-type/${loai}`,
        
        // Admin - Meter Readings
        METER_READINGS: '/admin/api/meter-readings',
        METER_READING_BY_ID: (id) => `/admin/api/meter-readings/${id}`,
        METER_READINGS_IMPORT: '/admin/api/meter-readings/import-excel',
        METER_READINGS_TEMPLATE: '/admin/api/meter-readings/template',
        METER_READINGS_BY_ROOM: (maPhong) => `/admin/api/meter-readings/by-room/${maPhong}`,
        METER_READINGS_BY_MONTH: (thang, nam) => `/admin/api/meter-readings/by-month/${thang}/${nam}`,
        
        // Admin - Registrations
        REGISTRATIONS: '/admin/api/registrations',
        REGISTRATION_BY_ID: (id) => `/admin/api/registrations/${id}`,
        
        // Admin - Change Requests
        CHANGE_REQUESTS: '/admin/api/change-requests',
        CHANGE_REQUEST_BY_ID: (id) => `/admin/api/change-requests/${id}`,
        
        // Admin - Violations
        VIOLATIONS: '/admin/api/violations',
        VIOLATION_BY_ID: (id) => `/admin/api/violations/${id}`,
        
        // Admin - Discipline Scores
        DISCIPLINE_SCORES: '/admin/api/discipline-scores',
        DISCIPLINE_SCORE_BY_ID: (id) => `/admin/api/discipline-scores/${id}`,
        DISCIPLINE_SCORES_BY_STUDENT: (studentId) => `/admin/api/discipline-scores/by-student/${studentId}`,
        
        // Admin - Overdue Notices
        OVERDUE_NOTICES: '/admin/api/overdue-notices',
        OVERDUE_NOTICE_BY_ID: (id) => `/admin/api/overdue-notices/${id}`,
        
        // Admin - Reports
        REPORTS: '/admin/api/reports',
        REPORT_OCCUPANCY_RATE: '/admin/api/reports/occupancy-rate',
        REPORT_REVENUE: '/admin/api/reports/revenue',
        REPORT_DEBT: '/admin/api/reports/debt',
        REPORT_ELECTRICITY_WATER: '/admin/api/reports/electricity-water',
        REPORT_VIOLATIONS: '/admin/api/reports/violations',
        REPORT_GENERATE_MONTHLY_BILLS: '/admin/api/reports/generate-monthly-bills',
        REPORT_CALCULATE_ELECTRICITY: '/admin/api/reports/calculate-electricity',
        REPORT_CALCULATE_WATER: '/admin/api/reports/calculate-water',
        
        // User - Home
        USER_HOME: '/user/api/home',
        
        // User - Students
        USER_PROFILE: '/user/api/students/profile',
        USER_PROFILE_UPDATE: '/user/api/students/profile',
        USER_CHANGE_PASSWORD: '/user/api/students/change-password',
        
        // User - Rooms
        USER_ROOMS: '/user/api/rooms',
        USER_ROOM_BY_ID: (id) => `/user/api/rooms/${id}`,
        USER_ROOMS_CURRENT: '/user/api/rooms/current',
        USER_ROOMS_AVAILABLE: '/user/api/rooms/available',
        
        // User - Buildings
        USER_BUILDINGS: '/user/api/buildings',
        USER_BUILDING_BY_ID: (id) => `/user/api/buildings/${id}`,
        
        // User - Contracts
        USER_CONTRACTS: '/user/api/contracts/my',
        USER_CONTRACTS_CURRENT: '/user/api/contracts/my/current',
        USER_CONTRACT_CONFIRM: (id) => `/user/api/contracts/my/${id}/confirm`,
        
        // User - Bills
        USER_BILLS: '/user/api/bills/my',
        USER_BILL_BY_ID: (id) => `/user/api/bills/my/${id}`,
        USER_BILL_DETAILS: (id) => `/user/api/bills/my/${id}/details`,
        
        // User - Receipts
        USER_RECEIPTS: '/user/api/receipts/my',
        
        // User - Fees
        USER_FEES: '/user/api/fees',
        USER_FEE_BY_ID: (id) => `/user/api/fees/${id}`,
        USER_FEES_BY_TYPE: (loaiPhi) => `/user/api/fees/by-type/${loaiPhi}`,
        
        // User - Registrations
        USER_REGISTRATIONS: '/user/api/registrations/my-registrations',
        USER_REGISTRATIONS_CREATE: '/user/api/registrations',
        
        // User - Change Requests
        USER_CHANGE_REQUESTS: '/user/api/change-requests',
        USER_CHANGE_REQUESTS_MY: '/user/api/change-requests/my-requests',
        
        // User - Violations
        USER_VIOLATIONS: '/user/api/violations/my-violations',
        
        // User - Discipline Scores
        USER_DISCIPLINE_SCORES: '/user/api/discipline-scores/my-scores',
        USER_DISCIPLINE_SCORE_BY_MONTH: (thang, nam) => `/user/api/discipline-scores/my/${thang}/${nam}`,
        
        // User - Notifications
        USER_NOTIFICATIONS: '/user/api/notifications/my',
        USER_NOTIFICATION_BY_ID: (id) => `/user/api/notifications/my/${id}`
    },
    DEMO_ACCOUNTS: {
        admin: {
            username: 'admin',
            password: 'admin@123'
        },
        officer: {
            username: 'officer',
            password: 'officer@123'
        },
        student: {
            username: 'student',
            password: '123456'
        }
    }
};

// Utility Functions
const Utils = {
    // Show loading overlay
    showLoading: () => {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.classList.add('show');
        }
    },

    // Hide loading overlay
    hideLoading: () => {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            overlay.style.display = 'none';
            // Force remove inline style nếu có
            overlay.style.removeProperty('display');
        }
        console.log('Loading hidden');
    },

    // Show alert message
    showAlert: (message, type = 'info') => {
        // Remove existing alerts first
        const existingAlerts = document.querySelectorAll('.alert-message');
        existingAlerts.forEach(alert => alert.remove());
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-message alert-${type}`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'danger' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        alertDiv.textContent = message;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        if (!document.querySelector('style[data-alert-animation]')) {
            style.setAttribute('data-alert-animation', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alertDiv.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                alertDiv.remove();
            }, 300);
        }, 5000);
    },

    // Format date
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    },

    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    },

    // Get token from localStorage
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Set token to localStorage
    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    // Remove token from localStorage
    removeToken: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get user from localStorage
    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Set user to localStorage
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Make API request
    apiRequest: async (url, options = {}) => {
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
            const response = await fetch(`${CONFIG.API_BASE_URL}${url}`, mergedOptions);
            
            if (!response.ok) {
                if (response.status === 401) {
                    Utils.removeToken();
                    window.location.href = '/';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!Utils.getToken();
    },

    // Redirect to login if not authenticated
    requireAuth: () => {
        if (!Utils.isAuthenticated()) {
            const currentPath = window.location.pathname;
            // Don't redirect if already on login page
            if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
                return;
            }
            
            const isInSubFolder = currentPath.includes('/admin/') || currentPath.includes('/student/');
            const basePath = isInSubFolder ? '../' : '';
            window.location.href = basePath + 'index.html';
        }
    }
};

/**
 * Safe API Client Helper
 * Sử dụng function này thay vì apiClient trực tiếp để tránh lỗi "apiClient is not defined"
 * @returns {Promise<ApiClient>} The apiClient instance
 */
async function getSafeApiClient() {
    // Nếu apiClient đã sẵn sàng, trả về ngay
    if (typeof apiClient !== 'undefined' && apiClient) {
        return apiClient;
    }
    
    // Nếu window.apiClient có, dùng nó
    if (window.apiClient) {
        return window.apiClient;
    }
    
    // Nếu có ensureApiClient, dùng nó
    if (typeof ensureApiClient !== 'undefined') {
        return await ensureApiClient();
    }
    
    // Nếu có getApiClient, dùng nó
    if (typeof getApiClient !== 'undefined') {
        const client = getApiClient();
        if (client instanceof Promise) {
            return await client;
        }
        return client;
    }
    
    // Fallback: đợi apiClient được khởi tạo
    let retries = 0;
    const maxRetries = 100;
    
    while ((typeof apiClient === 'undefined' || !apiClient) && retries < maxRetries) {
        if (window.apiClient) {
            return window.apiClient;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    if (apiClient || window.apiClient) {
        return apiClient || window.apiClient;
    }
    
    throw new Error('ApiClient không thể khởi tạo. Vui lòng kiểm tra CONFIG và refresh trang!');
}

/**
 * Synchronous version - chỉ dùng khi chắc chắn apiClient đã sẵn sàng
 * @returns {ApiClient|null} The apiClient instance or null if not ready
 */
function getApiClientSync() {
    if (typeof apiClient !== 'undefined' && apiClient) {
        return apiClient;
    }
    if (window.apiClient) {
        return window.apiClient;
    }
    return null;
}

// Export for use in other files
window.CONFIG = CONFIG;
window.Utils = Utils;
window.getSafeApiClient = getSafeApiClient;
window.getApiClientSync = getApiClientSync;
})();
