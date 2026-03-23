// API Configuration & Constants

export const API_BASE_URL = 'http://localhost:8080';

export const ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CHANGE_PASSWORD: '/auth/change-password',
  USERS: '/auth/users',
  USER_BY_ID: (id: number) => `/auth/users/${id}`,
  USER_RESET_PASSWORD: (id: number) => `/auth/users/${id}/reset-password`,
  USER_LOCK: (id: number) => `/auth/users/${id}/lock`,

  // Admin - Buildings
  BUILDINGS: '/admin/api/buildings',
  BUILDING_BY_ID: (id: number) => `/admin/api/buildings/${id}`,

  // Admin - Rooms
  ROOMS: '/admin/api/rooms',
  ROOM_BY_ID: (id: number) => `/admin/api/rooms/${id}`,
  ROOMS_EMPTY: '/admin/api/rooms/empty',

  // Admin - Beds
  BEDS: '/admin/api/beds',
  BED_BY_ID: (id: number) => `/admin/api/beds/${id}`,

  // Admin - Students
  STUDENTS: '/admin/api/students',
  STUDENT_BY_ID: (id: number) => `/admin/api/students/${id}`,
  STUDENTS_BY_ROOM: (maPhong: number) => `/admin/api/students/by-room/${maPhong}`,

  // Admin - Contracts
  CONTRACTS: '/admin/api/contracts',
  CONTRACT_BY_ID: (id: number) => `/admin/api/contracts/${id}`,
  CONTRACT_EXTEND: (id: number) => `/admin/api/contracts/${id}/extend`,
  CONTRACT_CURRENT_BY_STUDENT: (studentId: number) => `/admin/api/contracts/student/${studentId}/current`,

  // Admin - Bills
  BILLS: '/admin/api/bills',
  BILL_BY_ID: (id: number) => `/admin/api/bills/${id}`,
  BILL_CALCULATE_MONTHLY: '/admin/api/bills/calculate-monthly', // POST - gọi sp_HoaDon_GenerateMonthly (bug varchar/nvarchar)
  BILL_DETAILS: (id: number) => `/admin/api/bills/${id}/details`,

  // Admin - Receipts
  RECEIPTS: '/admin/api/receipts',
  RECEIPT_BY_ID: (id: number) => `/admin/api/receipts/${id}`,

  // Admin - Fees
  FEES: '/admin/api/fees',
  FEE_BY_ID: (id: number) => `/admin/api/fees/${id}`,
  FEES_BY_TYPE: (loaiPhi: string) => `/admin/api/fees/by-type/${loaiPhi}`,

  // Admin - Fee Configs
  FEE_CONFIGS: '/admin/api/fee-configs',
  FEE_CONFIG_BY_ID: (id: number) => `/admin/api/fee-configs/${id}`,
  FEE_CONFIGS_BY_TYPE: (loai: string) => `/admin/api/fee-configs/by-type/${loai}`,

  // Admin - Price Tiers
  PRICE_TIERS: '/admin/api/price-tiers',
  PRICE_TIER_BY_ID: (id: number) => `/admin/api/price-tiers/${id}`,
  PRICE_TIERS_BY_TYPE: (loai: string) => `/admin/api/price-tiers/by-type/${loai}`,

  // Admin - Meter Readings
  METER_READINGS: '/admin/api/meter-readings',
  METER_READING_BY_ID: (id: number) => `/admin/api/meter-readings/${id}`,
  METER_READINGS_IMPORT: '/admin/api/meter-readings/import-excel',
  METER_READINGS_BY_ROOM: (maPhong: number) => `/admin/api/meter-readings/by-room/${maPhong}`,
  METER_READINGS_BY_MONTH: (thang: number, nam: number) => `/admin/api/meter-readings/by-month/${thang}/${nam}`,

  // Admin - Registrations
  REGISTRATIONS: '/admin/api/registrations',
  REGISTRATION_BY_ID: (id: number) => `/admin/api/registrations/${id}`,

  // Admin - Change Requests
  CHANGE_REQUESTS: '/admin/api/change-requests',
  CHANGE_REQUEST_BY_ID: (id: number) => `/admin/api/change-requests/${id}`,

  // Admin - Violations
  VIOLATIONS: '/admin/api/violations',
  VIOLATION_BY_ID: (id: number) => `/admin/api/violations/${id}`,

  // Admin - Discipline Scores
  DISCIPLINE_SCORES: '/admin/api/discipline-scores',
  DISCIPLINE_SCORE_BY_ID: (id: number) => `/admin/api/discipline-scores/${id}`,
  DISCIPLINE_SCORES_BY_STUDENT: (studentId: number) => `/admin/api/discipline-scores/by-student/${studentId}`,

  // Admin - Overdue Notices
  OVERDUE_NOTICES: '/admin/api/overdue-notices',
  OVERDUE_NOTICE_BY_ID: (id: number) => `/admin/api/overdue-notices/${id}`,

  // Admin - Reports
  REPORTS: '/admin/api/reports',
  REPORT_OCCUPANCY_RATE: '/admin/api/reports/occupancy-rate',
  REPORT_REVENUE: '/admin/api/reports/revenue',
  REPORT_DEBT: '/admin/api/reports/debt',
  REPORT_ELECTRICITY_WATER: '/admin/api/reports/electricity-water',
  REPORT_VIOLATIONS: '/admin/api/reports/violations',
  REPORT_GENERATE_MONTHLY_BILLS: '/admin/api/reports/generate-monthly-bills', // POST /admin/api/reports/generate-monthly-bills?thang=X&nam=Y
  REPORT_CALCULATE_ELECTRICITY: '/admin/api/reports/calculate-electricity',
  REPORT_CALCULATE_WATER: '/admin/api/reports/calculate-water',

  // User - Home
  USER_HOME: '/user/api/home',

  // User - Students
  USER_PROFILE: '/user/api/students/profile',
  USER_CHANGE_PASSWORD: '/user/api/students/change-password',

  // User - Rooms
  USER_ROOMS: '/user/api/rooms',
  USER_ROOM_BY_ID: (id: number) => `/user/api/rooms/${id}`,
  USER_ROOMS_CURRENT: '/user/api/rooms/current',
  USER_ROOMS_AVAILABLE: '/user/api/rooms/available',

  // User - Buildings
  USER_BUILDINGS: '/user/api/buildings',
  USER_BUILDING_BY_ID: (id: number) => `/user/api/buildings/${id}`,

  // User - Contracts
  USER_CONTRACTS: '/user/api/contracts/my',
  USER_CONTRACTS_CURRENT: '/user/api/contracts/my/current',
  USER_CONTRACT_CONFIRM: (id: number) => `/user/api/contracts/my/${id}/confirm`,

  // User - Bills
  USER_BILLS: '/user/api/bills/my',
  USER_BILL_BY_ID: (id: number) => `/user/api/bills/my/${id}`,
  USER_BILL_DETAILS: (id: number) => `/user/api/bills/my/${id}/details`,

  // User - Receipts
  USER_RECEIPTS: '/user/api/receipts/my',

  // User - Fees
  USER_FEES: '/user/api/fees',
  USER_FEE_BY_ID: (id: number) => `/user/api/fees/${id}`,
  USER_FEES_BY_TYPE: (loaiPhi: string) => `/user/api/fees/by-type/${loaiPhi}`,

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
  USER_DISCIPLINE_SCORE_BY_MONTH: (thang: number, nam: number) => `/user/api/discipline-scores/my/${thang}/${nam}`,

  // User - Notifications
  USER_NOTIFICATIONS: '/user/api/notifications/my',
  USER_NOTIFICATION_BY_ID: (id: number) => `/user/api/notifications/my/${id}`,
};

export const DEMO_ACCOUNTS = {
  admin: { username: 'admin', password: 'admin@123' },
  officer: { username: 'officer', password: 'officer@123' },
  student: { username: 'student', password: 'student@123' },
};

export const ROLE_LABELS: Record<string, string> = {
  Admin: 'Quản trị viên',
  Officer: 'Nhân viên',
  Student: 'Sinh viên',
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};
