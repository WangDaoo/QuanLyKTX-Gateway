# Design Document: Frontend React Migration

## 1. Executive Summary

This document outlines the technical design for migrating the Quản Lý Ký Túc Xá (Dormitory Management System) frontend from vanilla HTML/CSS/JavaScript to a modern React-based architecture. The migration preserves 100% of the existing UI/UX while modernizing the codebase for better maintainability and scalability.

**Key Design Principles:**
- Preserve existing UI/UX (pixel-perfect migration where possible)
- Component-based architecture for reusability
- Maintain backward compatibility with existing APIs
- Progressive enhancement approach
- Mobile-first responsive design

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Presentation Layer                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │  Admin   │  │ Student  │  │ Officer  │            │  │
│  │  │  Pages   │  │  Pages   │  │  Pages   │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Component Library Layer                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │  Layout  │  │  Common  │  │  Forms   │            │  │
│  │  │Components│  │Components│  │Components│            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  State Management                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │   Auth   │  │   User   │  │   App    │            │  │
│  │  │ Context  │  │ Context  │  │ Context  │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   API Client Layer                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │   HTTP   │  │   Auth   │  │  Error   │            │  │
│  │  │  Client  │  │Interceptor│  │ Handler  │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ASP.NET Core API Gateway (Existing)             │
│                    http://localhost:8000                     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

**Core:**
- React 18.3+
- Vite 5+ (build tool)
- React Router v6 (routing)
- JavaScript (ES6+)

**State Management:**
- React Context API
- useReducer hook
- Custom hooks for business logic

**Styling:**
- CSS Modules (recommended approach)
- Existing CSS files as base
- No UI library (custom components)

**HTTP & Data:**
- Fetch API (native)
- Custom API client (migrated from existing)

**Development:**
- ESLint
- Prettier

**Testing:**
- Vitest (unit tests)
- React Testing Library (component tests)

## 3. Project Structure

### 3.1 Directory Layout

```
Frontend-React/
├── public/
│   ├── favicon.ico
│   └── assets/
│       └── images/
├── src/
│   ├── api/                      # API client layer
│   │   ├── client.js             # Base HTTP client
│   │   ├── interceptors.js       # Request/response interceptors
│   │   ├── endpoints.js          # API endpoint constants
│   │   └── services/             # API service modules
│   │       ├── auth.service.js
│   │       ├── admin.service.js
│   │       ├── student.service.js
│   │       └── officer.service.js
│   ├── assets/                   # Static assets
│   │   ├── images/
│   │   └── icons/
│   ├── components/               # Reusable components
│   │   ├── common/               # Common UI components
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Input/
│   │   │   ├── Table/
│   │   │   ├── Modal/
│   │   │   ├── Alert/
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   ├── Spinner/
│   │   │   └── Pagination/
│   │   └── layout/               # Layout components
│   │       ├── Sidebar/
│   │       │   ├── Sidebar.jsx
│   │       │   └── Sidebar.module.css
│   │       ├── Header/
│   │       ├── Breadcrumb/
│   │       └── MainLayout/
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.jsx       # Authentication state
│   │   ├── UserContext.jsx       # User profile state
│   │   └── AppContext.jsx        # Global app state
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.js            # Authentication hook
│   │   ├── useApi.js             # API call hook
│   │   ├── useForm.js            # Form handling hook
│   │   ├── useTable.js           # Table state hook
│   │   └── useModal.js           # Modal state hook
│   ├── pages/                    # Page components
│   │   ├── admin/                # Admin pages (20 pages)
│   │   │   ├── Dashboard/
│   │   │   ├── Buildings/
│   │   │   ├── Rooms/
│   │   │   ├── Beds/
│   │   │   ├── Students/
│   │   │   ├── Users/
│   │   │   ├── Contracts/
│   │   │   ├── Bills/
│   │   │   ├── Receipts/
│   │   │   ├── Fees/
│   │   │   ├── FeeConfigs/
│   │   │   ├── PriceTiers/
│   │   │   ├── MeterReadings/
│   │   │   ├── Registrations/
│   │   │   ├── ChangeRequests/
│   │   │   ├── Violations/
│   │   │   ├── DisciplineScores/
│   │   │   ├── OverdueNotices/
│   │   │   ├── Reports/
│   │   │   └── ChangePassword/
│   │   ├── student/              # Student pages (11 pages)
│   │   │   ├── Dashboard/
│   │   │   ├── Profile/
│   │   │   ├── Room/
│   │   │   ├── Contract/
│   │   │   ├── Bills/
│   │   │   ├── Payments/
│   │   │   ├── Fees/
│   │   │   ├── Requests/
│   │   │   ├── Violations/
│   │   │   ├── DisciplineScores/
│   │   │   └── Services/
│   │   ├── officer/              # Officer pages (6 pages)
│   │   │   ├── Dashboard/
│   │   │   ├── Registrations/
│   │   │   ├── ChangeRequests/
│   │   │   ├── MeterReadings/
│   │   │   ├── Violations/
│   │   │   └── Reports/
│   │   └── auth/                 # Auth pages
│   │       ├── Login/
│   │       └── ForgotPassword/
│   ├── routes/                   # Routing configuration
│   │   ├── index.jsx             # Main router
│   │   ├── AdminRoutes.jsx       # Admin routes
│   │   ├── StudentRoutes.jsx     # Student routes
│   │   ├── OfficerRoutes.jsx     # Officer routes
│   │   └── ProtectedRoute.jsx    # Auth guard
│   ├── styles/                   # Global styles
│   │   ├── global.css            # Global CSS (from style.css)
│   │   ├── admin.module.css      # Admin styles (from admin.css)
│   │   ├── auth.module.css       # Auth styles (from auth.css)
│   │   └── variables.css         # CSS variables
│   ├── utils/                    # Utility functions
│   │   ├── helpers.js            # General helpers
│   │   ├── formatters.js         # Data formatters
│   │   ├── validators.js         # Form validators
│   │   └── storage.js            # LocalStorage helpers
│   ├── constants/                # Constants
│   │   ├── config.js             # App configuration
│   │   ├── routes.js             # Route paths
│   │   └── messages.js           # UI messages
│   ├── App.jsx                   # Root component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Base styles
├── .env                          # Environment variables
├── .env.example                  # Example env file
├── .eslintrc.cjs                 # ESLint config
├── .prettierrc                   # Prettier config
├── .gitignore
├── index.html                    # HTML template
├── package.json
├── vite.config.js                # Vite configuration
└── README.md
```

## 4. Core Components Design

### 4.1 API Client Layer

#### 4.1.1 Base HTTP Client

**File:** `src/api/client.js`

**Purpose:** Centralized HTTP client with authentication, error handling, and request/response transformation.

**Key Features:**
- Automatic JWT token injection
- Request/response interceptors
- Error handling and retry logic
- Response data normalization
- 401 handling (auto-logout)

**Implementation Strategy:**
```javascript
// Migrate from Frontend/js/api-client.js
// Key changes:
// 1. Export as ES6 module instead of global
// 2. Use React-friendly patterns
// 3. Add TypeScript-style JSDoc comments
// 4. Improve error handling
```

**API:**
```javascript
class ApiClient {
  constructor(baseUrl)
  async get(endpoint, params)
  async post(endpoint, data)
  async put(endpoint, data)
  async delete(endpoint)
  async upload(endpoint, formData)
}
```

#### 4.1.2 API Services

**Pattern:** One service file per domain (auth, admin, student, officer)

**Example:** `src/api/services/admin.service.js`
```javascript
export const adminService = {
  // Buildings
  getBuildings: (params) => apiClient.get('/admin/api/buildings', params),
  getBuildingById: (id) => apiClient.get(`/admin/api/buildings/${id}`),
  createBuilding: (data) => apiClient.post('/admin/api/buildings', data),
  updateBuilding: (id, data) => apiClient.put(`/admin/api/buildings/${id}`, data),
  deleteBuilding: (id) => apiClient.delete(`/admin/api/buildings/${id}`),
  
  // Rooms
  getRooms: (params) => apiClient.get('/admin/api/rooms', params),
  // ... more methods
}
```

### 4.2 State Management

#### 4.2.1 AuthContext

**File:** `src/contexts/AuthContext.jsx`

**Purpose:** Manage authentication state globally

**State:**
```javascript
{
  user: null | { id, username, role, ... },
  token: null | string,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**Actions:**
- `login(credentials)`
- `logout()`
- `refreshToken()`
- `updateUser(userData)`

**Usage:**
```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

#### 4.2.2 AppContext

**File:** `src/contexts/AppContext.jsx`

**Purpose:** Global app state (sidebar, notifications, loading)

**State:**
```javascript
{
  sidebarOpen: boolean,
  notifications: [],
  loading: boolean,
  error: null
}
```

### 4.3 Layout Components

#### 4.3.1 Sidebar Component

**File:** `src/components/layout/Sidebar/Sidebar.jsx`

**Purpose:** Navigation sidebar (migrated from HTML sidebar)

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  userRole: 'admin' | 'student' | 'officer'
}
```

**Features:**
- Role-based menu items
- Active link highlighting
- Collapsible sub-menus
- Responsive (mobile drawer)
- Preserve exact HTML structure and CSS

**CSS Strategy:**
- Extract sidebar CSS from `Frontend/css/style.css`
- Convert to CSS Module: `Sidebar.module.css`
- Maintain all class names and styles

#### 4.3.2 Header Component

**File:** `src/components/layout/Header/Header.jsx`

**Purpose:** Top navigation bar

**Props:**
```javascript
{
  title: string,
  onMenuToggle: () => void,
  notifications: []
}
```

**Features:**
- Menu toggle button (mobile)
- Notifications dropdown
- User menu dropdown
- Breadcrumb integration

#### 4.3.3 MainLayout Component

**File:** `src/components/layout/MainLayout/MainLayout.jsx`

**Purpose:** Wrapper layout for all authenticated pages

**Structure:**
```jsx
<div className="layout-container">
  <Sidebar />
  <div className="main-content">
    <Header />
    <Breadcrumb />
    <div className="content-area">
      {children}
    </div>
  </div>
</div>
```

### 4.4 Common Components

#### 4.4.1 Table Component

**File:** `src/components/common/Table/Table.jsx`

**Purpose:** Reusable data table with sorting, filtering, pagination

**Props:**
```javascript
{
  columns: [
    { key: string, label: string, sortable: boolean, render: (row) => JSX }
  ],
  data: [],
  loading: boolean,
  pagination: { page, pageSize, total },
  onPageChange: (page) => void,
  onSort: (column, direction) => void,
  actions: (row) => JSX
}
```

**Features:**
- Responsive (mobile card view)
- Sortable columns
- Custom cell rendering
- Row actions
- Loading state
- Empty state
- Preserve table styling from `admin.css`

#### 4.4.2 Modal Component

**File:** `src/components/common/Modal/Modal.jsx`

**Purpose:** Reusable modal dialog

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  title: string,
  size: 'sm' | 'md' | 'lg',
  children: JSX,
  footer: JSX
}
```

**Features:**
- Backdrop click to close
- ESC key to close
- Focus trap
- Scroll lock
- Animation (fade in/out)

#### 4.4.3 Form Components

**Files:**
- `src/components/common/Input/Input.jsx`
- `src/components/common/Select/Select.jsx`
- `src/components/common/Textarea/Textarea.jsx`
- `src/components/common/Checkbox/Checkbox.jsx`

**Common Props:**
```javascript
{
  name: string,
  label: string,
  value: any,
  onChange: (value) => void,
  error: string,
  required: boolean,
  disabled: boolean
}
```

**Features:**
- Controlled components
- Validation state display
- Accessible (labels, aria-*)
- Consistent styling

#### 4.4.4 Button Component

**File:** `src/components/common/Button/Button.jsx`

**Props:**
```javascript
{
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info',
  size: 'sm' | 'md' | 'lg',
  disabled: boolean,
  loading: boolean,
  icon: JSX,
  onClick: () => void,
  children: JSX
}
```

**Features:**
- Loading state (spinner)
- Icon support
- Disabled state
- Preserve button styles from CSS

### 4.5 Custom Hooks

#### 4.5.1 useApi Hook

**File:** `src/hooks/useApi.js`

**Purpose:** Simplify API calls with loading/error states

**Usage:**
```javascript
const { data, loading, error, execute } = useApi(apiService.getBuildings);

useEffect(() => {
  execute({ page: 1, pageSize: 10 });
}, []);
```

**Returns:**
```javascript
{
  data: any,
  loading: boolean,
  error: Error | null,
  execute: (params) => Promise
}
```

#### 4.5.2 useForm Hook

**File:** `src/hooks/useForm.js`

**Purpose:** Form state management and validation

**Usage:**
```javascript
const { values, errors, handleChange, handleSubmit, reset } = useForm({
  initialValues: { tenToaNha: '', diaChi: '' },
  validate: (values) => { /* validation logic */ },
  onSubmit: async (values) => { /* submit logic */ }
});
```

#### 4.5.3 useTable Hook

**File:** `src/hooks/useTable.js`

**Purpose:** Table state (pagination, sorting, filtering)

**Usage:**
```javascript
const {
  page,
  pageSize,
  sortColumn,
  sortDirection,
  filters,
  setPage,
  setPageSize,
  setSort,
  setFilters
} = useTable({ initialPageSize: 10 });
```

#### 4.5.4 useModal Hook

**File:** `src/hooks/useModal.js`

**Purpose:** Modal state management

**Usage:**
```javascript
const { isOpen, open, close, toggle } = useModal();
```

## 5. Routing Design

### 5.1 Route Structure

**File:** `src/routes/index.jsx`

```javascript
<BrowserRouter>
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    
    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      {/* Admin routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      
      {/* Student routes */}
      <Route path="/student/*" element={<StudentRoutes />} />
      
      {/* Officer routes */}
      <Route path="/officer/*" element={<OfficerRoutes />} />
    </Route>
    
    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### 5.2 Role-Based Routing

**Admin Routes:** `/admin/*`
- `/admin/dashboard`
- `/admin/buildings`
- `/admin/rooms`
- `/admin/beds`
- `/admin/students`
- `/admin/users`
- `/admin/contracts`
- `/admin/bills`
- `/admin/receipts`
- `/admin/fees`
- `/admin/fee-configs`
- `/admin/price-tiers`
- `/admin/meter-readings`
- `/admin/registrations`
- `/admin/change-requests`
- `/admin/violations`
- `/admin/discipline-scores`
- `/admin/overdue-notices`
- `/admin/reports`
- `/admin/change-password`

**Student Routes:** `/student/*`
- `/student/dashboard`
- `/student/profile`
- `/student/room`
- `/student/contract`
- `/student/bills`
- `/student/payments`
- `/student/fees`
- `/student/requests`
- `/student/violations`
- `/student/discipline-scores`
- `/student/services`

**Officer Routes:** `/officer/*`
- `/officer/dashboard`
- `/officer/registrations`
- `/officer/change-requests`
- `/officer/meter-readings`
- `/officer/violations`
- `/officer/reports`

### 5.3 Protected Route Component

**File:** `src/routes/ProtectedRoute.jsx`

**Purpose:** Guard routes that require authentication

**Logic:**
```javascript
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" />;
  
  return <Outlet />;
}
```

### 5.4 Role-Based Access Control

**Implementation:**
```javascript
function AdminRoutes() {
  const { user } = useAuth();
  
  if (user.role !== 'admin') {
    return <Navigate to={`/${user.role}/dashboard`} />;
  }
  
  return (
    <MainLayout>
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        {/* ... more routes */}
      </Routes>
    </MainLayout>
  );
}
```

## 6. Page Component Design

### 6.1 Page Component Pattern

**Standard Structure:**
```jsx
// Example: src/pages/admin/Buildings/Buildings.jsx

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { adminService } from '@/api/services/admin.service';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import styles from './Buildings.module.css';

function Buildings() {
  // State
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // API
  const { data, loading, error, execute } = useApi(adminService.getBuildings);
  
  // Effects
  useEffect(() => {
    loadBuildings();
  }, []);
  
  // Handlers
  const loadBuildings = async () => {
    const result = await execute();
    setBuildings(result);
  };
  
  const handleCreate = () => {
    setSelectedBuilding(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (building) => {
    setSelectedBuilding(building);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa?')) {
      await adminService.deleteBuilding(id);
      loadBuildings();
    }
  };
  
  const handleSubmit = async (formData) => {
    if (selectedBuilding) {
      await adminService.updateBuilding(selectedBuilding.id, formData);
    } else {
      await adminService.createBuilding(formData);
    }
    setIsModalOpen(false);
    loadBuildings();
  };
  
  // Render
  return (
    <div className={styles.buildingsPage}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quản Lý Tòa Nhà</h2>
          <Button variant="primary" onClick={handleCreate}>
            <i className="fas fa-plus"></i> Thêm Tòa Nhà
          </Button>
        </div>
        <div className="card-body">
          <Table
            columns={columns}
            data={buildings}
            loading={loading}
            actions={(row) => (
              <>
                <Button size="sm" onClick={() => handleEdit(row)}>Sửa</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Xóa</Button>
              </>
            )}
          />
        </div>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBuilding ? 'Sửa Tòa Nhà' : 'Thêm Tòa Nhà'}
      >
        <BuildingForm
          initialData={selectedBuilding}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default Buildings;
```

### 6.2 Dashboard Pages

**Admin Dashboard:** `src/pages/admin/Dashboard/Dashboard.jsx`

**Features:**
- Statistics cards (occupancy, revenue, pending tasks)
- Charts (occupancy trends, revenue by month)
- Recent activities feed
- Quick actions

**Data Sources:**
- `/admin/api/reports/occupancy-rate`
- `/admin/api/reports/revenue`
- `/admin/api/reports/debt`

**Student Dashboard:** `src/pages/student/Dashboard/Dashboard.jsx`

**Features:**
- Welcome card with user info
- Room information card
- Contract status card
- Unpaid bills alert
- Recent notifications

**Data Sources:**
- `/user/api/students/profile`
- `/user/api/rooms/current`
- `/user/api/contracts/my/current`
- `/user/api/bills/my`

### 6.3 CRUD Pages Pattern

**List View:**
- Search/filter bar
- Data table with pagination
- Action buttons (create, edit, delete)
- Bulk actions (optional)

**Form View (Modal or Page):**
- Form fields with validation
- Submit/cancel buttons
- Loading state
- Error handling

**Detail View (Optional):**
- Read-only information display
- Edit/delete actions
- Related data sections

## 7. Styling Strategy

### 7.1 CSS Modules Approach

**Why CSS Modules:**
- Scoped styles (no global conflicts)
- Maintain existing CSS structure
- Easy migration path
- Type-safe (with TypeScript)

**Migration Process:**
1. Extract component-specific CSS from global files
2. Create `.module.css` file for each component
3. Import and use in component
4. Keep global styles in `global.css`

**Example:**
```css
/* Sidebar.module.css */
.sidebar {
  width: 250px;
  background: #2c3e50;
  /* ... existing styles ... */
}

.sidebarHeader {
  padding: 1.5rem;
  /* ... existing styles ... */
}
```

```jsx
// Sidebar.jsx
import styles from './Sidebar.module.css';

function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        {/* ... */}
      </div>
    </div>
  );
}
```

### 7.2 Global Styles

**File:** `src/styles/global.css`

**Contents:**
- CSS reset
- Typography
- Utility classes
- Layout base styles
- Migrated from `Frontend/css/style.css`

### 7.3 CSS Variables

**File:** `src/styles/variables.css`

**Purpose:** Centralize colors, spacing, fonts

```css
:root {
  /* Colors */
  --color-primary: #34495e;
  --color-secondary: #6c757d;
  --color-success: #27ae60;
  --color-danger: #e74c3c;
  --color-warning: #f39c12;
  --color-info: #3498db;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Layout */
  --sidebar-width: 250px;
  --header-height: 60px;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 16px rgba(0,0,0,0.1);
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

### 7.4 Responsive Design

**Breakpoints:**
```css
/* Mobile first approach */
@media (min-width: 576px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 992px) { /* lg */ }
@media (min-width: 1200px) { /* xl */ }
```

**Mobile Adaptations:**
- Sidebar becomes drawer (slide from left)
- Tables become card view
- Stack form fields vertically
- Adjust font sizes
- Touch-friendly button sizes

## 8. Data Flow & State Management

### 8.1 Data Flow Diagram

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
API Service Call
    │
    ▼
HTTP Client (with interceptors)
    │
    ▼
Backend API
    │
    ▼
Response (success/error)
    │
    ▼
State Update (useState/Context)
    │
    ▼
Component Re-render
    │
    ▼
UI Update
```

### 8.2 State Management Strategy

**Local State (useState):**
- Component-specific UI state
- Form inputs
- Modal open/close
- Loading states

**Context State:**
- Authentication (user, token)
- Global app state (sidebar, notifications)
- Theme preferences (future)

**Server State:**
- API data (buildings, rooms, students, etc.)
- Managed by custom hooks (useApi)
- No global cache (fetch on demand)

### 8.3 Error Handling

**Levels:**
1. **API Client Level:** Catch network errors, 401, 500
2. **Service Level:** Transform errors to user-friendly messages
3. **Component Level:** Display errors in UI
4. **Global Level:** Toast notifications for critical errors

**Error Display:**
- Inline errors (form validation)
- Alert boxes (page-level errors)
- Toast notifications (global errors)
- Error boundaries (React crashes)

## 9. Performance Optimization

### 9.1 Code Splitting

**Strategy:**
- Route-based code splitting
- Lazy load pages
- Lazy load heavy components (charts, editors)

**Implementation:**
```javascript
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Buildings = lazy(() => import('@/pages/admin/Buildings'));
```

### 9.2 Memoization

**Use Cases:**
- Expensive calculations
- Complex component trees
- Callback functions passed to children

**Tools:**
- `React.memo()` for components
- `useMemo()` for values
- `useCallback()` for functions

### 9.3 Asset Optimization

**Images:**
- Compress images
- Use appropriate formats (WebP, SVG)
- Lazy load images below fold

**CSS:**
- Minimize CSS files
- Remove unused CSS
- Use CSS Modules for tree-shaking

**JavaScript:**
- Minimize bundle size
- Tree-shaking
- Code splitting

### 9.4 API Optimization

**Strategies:**
- Debounce search inputs
- Pagination for large lists
- Cache API responses (optional)
- Parallel requests where possible

## 10. Testing Strategy

### 10.1 Unit Tests

**Tools:** Vitest

**Coverage:**
- Utility functions (formatters, validators, helpers)
- API client methods
- Custom hooks logic

**Example:**
```javascript
// formatters.test.js
import { formatCurrency, formatDate } from './formatters';

describe('formatCurrency', () => {
  it('formats number to VND currency', () => {
    expect(formatCurrency(1000000)).toBe('1.000.000 ₫');
  });
});
```

### 10.2 Component Tests

**Tools:** React Testing Library

**Coverage:**
- Common components (Button, Input, Table, Modal)
- Form validation
- User interactions

**Example:**
```javascript
// Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 10.3 Integration Tests

**Coverage:**
- Authentication flow
- CRUD operations
- Form submissions

### 10.4 E2E Tests (Optional)

**Tools:** Playwright or Cypress

**Coverage:**
- Critical user journeys
- Login → Dashboard → CRUD operation
- Student registration flow
- Bill payment flow

## 11. Migration Execution Plan

### 11.1 Phase 1: Foundation (Week 1-2)

**Tasks:**
1. Setup React project with Vite
2. Configure ESLint, Prettier
3. Setup folder structure
4. Migrate CSS files to CSS Modules
5. Create CSS variables
6. Migrate API client (`api-client.js` → `client.js`)
7. Migrate config (`config.js` → `config.js`)
8. Create AuthContext
9. Create AppContext
10. Setup routing structure
11. Create ProtectedRoute component
12. Create Login page
13. Test authentication flow

**Deliverables:**
- Working React app skeleton
- Authentication working
- Routing configured
- CSS foundation ready

### 11.2 Phase 2: Layout & Common Components (Week 2-3)

**Tasks:**
1. Create Sidebar component
2. Create Header component
3. Create Breadcrumb component
4. Create MainLayout component
5. Create Button component
6. Create Input component
7. Create Select component
8. Create Table component
9. Create Modal component
10. Create Card component
11. Create Alert component
12. Create Spinner component
13. Create Pagination component
14. Test all components

**Deliverables:**
- Complete component library
- Storybook documentation (optional)
- Component tests

### 11.3 Phase 3: Admin Module (Week 3-6)

**Priority 1 (Week 3-4):**
1. Admin Dashboard
2. Buildings management
3. Rooms management
4. Students management

**Priority 2 (Week 4-5):**
5. Contracts management
6. Bills management
7. Fees management
8. Meter Readings management

**Priority 3 (Week 5-6):**
9. Registrations management
10. Change Requests management
11. Violations management
12. Discipline Scores management
13. Overdue Notices
14. Reports
15. Users management
16. Change Password

**Deliverables:**
- 20 admin pages fully functional
- All CRUD operations working
- Excel import/export working

### 11.4 Phase 4: Student Module (Week 6-8)

**Tasks:**
1. Student Dashboard
2. Profile page
3. Room information
4. Contract view
5. Bills list and details
6. Payments history
7. Fees information
8. Registration form
9. Change request form
10. Violations view
11. Discipline scores view
12. Services page

**Deliverables:**
- 11 student pages fully functional
- All student features working

### 11.5 Phase 5: Officer Module (Week 8-9)

**Tasks:**
1. Officer Dashboard
2. Registrations approval
3. Change Requests approval
4. Meter Readings input
5. Violations management
6. Reports view

**Deliverables:**
- 6 officer pages fully functional
- All officer workflows working

### 11.6 Phase 6: Testing & Polish (Week 9-10)

**Tasks:**
1. Visual regression testing (screenshot comparison)
2. Cross-browser testing
3. Mobile responsive testing
4. Performance optimization
5. Accessibility improvements
6. Bug fixes
7. Code cleanup
8. Documentation
9. User acceptance testing

**Deliverables:**
- Bug-free application
- Performance metrics met
- Documentation complete

### 11.7 Phase 7: Deployment (Week 11)

**Tasks:**
1. Build production bundle
2. Setup deployment pipeline
3. Deploy to staging
4. User training
5. Deploy to production
6. Monitor and fix issues
7. Gradual user migration

**Deliverables:**
- Production deployment
- User training materials
- Monitoring dashboard

## 12. Risk Mitigation

### 12.1 Technical Risks

**Risk:** CSS styling differences between HTML and React
**Mitigation:** 
- Use CSS Modules to preserve exact styles
- Visual regression testing
- Side-by-side comparison during development

**Risk:** API compatibility issues
**Mitigation:**
- Maintain API client abstraction
- Thorough API testing
- Mock API for development

**Risk:** Performance degradation
**Mitigation:**
- Code splitting
- Lazy loading
- Performance monitoring
- Lighthouse audits

### 12.2 Project Risks

**Risk:** Timeline overrun
**Mitigation:**
- Phased approach with clear milestones
- MVP first, enhancements later
- Regular progress reviews

**Risk:** User resistance
**Mitigation:**
- Preserve UI/UX
- User training
- Gradual rollout
- Feedback loop

## 13. Success Criteria

### 13.1 Functional Criteria
- ✅ 100% feature parity with HTML version
- ✅ All 37 pages migrated and working
- ✅ All CRUD operations functional
- ✅ Authentication and authorization working
- ✅ Excel import/export working
- ✅ Reports generation working

### 13.2 Non-Functional Criteria
- ✅ Page load time < 3 seconds
- ✅ Time to interactive < 2 seconds
- ✅ Lighthouse score > 90
- ✅ Mobile responsive (all pages)
- ✅ Cross-browser compatible
- ✅ Zero critical bugs

### 13.3 Code Quality Criteria
- ✅ ESLint errors = 0
- ✅ Test coverage > 70%
- ✅ Code review approved
- ✅ Documentation complete

## 14. Appendix

### 14.1 Technology Decisions

**Why React?**
- Component-based architecture
- Large ecosystem
- Team familiarity
- Good performance
- Strong community support

**Why Vite?**
- Fast development server
- Fast builds
- Modern tooling
- Better DX than CRA

**Why CSS Modules?**
- Scoped styles
- Easy migration
- No runtime overhead
- Type-safe with TypeScript

**Why Context API (not Redux)?**
- Simpler for this use case
- Less boilerplate
- Built-in to React
- Sufficient for app complexity

### 14.2 Alternative Approaches Considered

**UI Libraries (Ant Design, Material-UI):**
- ❌ Would change UI/UX
- ❌ Harder to match existing design
- ✅ Custom components give full control

**TypeScript:**
- ✅ Better type safety
- ❌ Steeper learning curve
- ❌ More setup time
- 📝 Can be added later

**State Management (Redux, Zustand):**
- ❌ Overkill for this app
- ❌ More boilerplate
- ✅ Context API is sufficient

### 14.3 Future Enhancements

**Phase 2 (Post-Migration):**
- Dark mode
- Multi-language support (i18n)
- Real-time notifications (WebSocket)
- Offline support (PWA)
- Advanced analytics
- Mobile app (React Native)

### 14.4 References

- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev
- React Router: https://reactrouter.com
- CSS Modules: https://github.com/css-modules/css-modules
- React Testing Library: https://testing-library.com/react

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-07  
**Author:** Development Team  
**Status:** Draft → Review → Approved
