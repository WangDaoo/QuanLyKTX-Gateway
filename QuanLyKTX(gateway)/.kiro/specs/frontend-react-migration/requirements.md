# Requirements: Frontend React Migration

## 1. Overview

Chuyển đổi toàn bộ Frontend của hệ thống Quản Lý Ký Túc Xá từ HTML/CSS/JavaScript thuần sang React application hiện đại, với mục tiêu cải thiện khả năng bảo trì, mở rộng và trải nghiệm người dùng.

## 2. Current State

### 2.1 Existing Architecture
- **Frontend Stack**: HTML, CSS, Vanilla JavaScript
- **Backend**: ASP.NET Core Web API (Gateway + 2 microservices)
- **API Gateway**: http://localhost:8000
- **Authentication**: JWT Bearer Token
- **User Roles**: Admin, Officer, Student

### 2.2 Current Pages
**Admin (20 pages)**:
- Dashboard, Buildings, Rooms, Beds
- Students, Users, Contracts
- Bills, Receipts, Fees, Fee Configs, Price Tiers
- Meter Readings, Registrations, Change Requests
- Violations, Discipline Scores, Overdue Notices
- Reports, Change Password

**Student (11 pages)**:
- Dashboard, Profile, Room, Contract
- Bills, Payments, Fees
- Requests, Violations, Discipline Scores, Services

**Officer (6 pages)**:
- Dashboard, Registrations, Change Requests
- Meter Readings, Violations, Reports

### 2.3 Existing Features
- REST API client với authentication
- CRUD operations cho tất cả entities
- Form validation
- Data tables với pagination, search, filter
- File upload (Excel import)
- Reports generation
- Real-time notifications

## 3. Goals & Objectives

### 3.1 Primary Goals
1. **Modernize Frontend Architecture**: Chuyển từ HTML/CSS/Vanilla JS sang React + Node.js ecosystem
2. **Preserve UI/UX Design**: Giữ nguyên 100% giao diện hiện tại (màu sắc, layout, styling, interactions)
3. **Improve Maintainability**: Code dễ đọc, dễ test, dễ mở rộng với component-based architecture
4. **Preserve Functionality**: Giữ nguyên 100% tính năng hiện có
5. **Enable Modern Tooling**: Sử dụng npm, Vite/Webpack, hot reload, modern dev experience

### 3.2 Non-Goals
- Không thay đổi backend APIs
- Không thay đổi database schema
- Không thay đổi business logic
- Không redesign UI/UX (giữ nguyên giao diện hiện tại)
- Không thay đổi user workflows

## 4. User Stories

### 4.1 As a Developer
- **US-1.1**: Tôi muốn có một React app với cấu trúc rõ ràng để dễ dàng phát triển và bảo trì
- **US-1.2**: Tôi muốn tái sử dụng API client logic hiện có để không phải viết lại
- **US-1.3**: Tôi muốn có routing system để navigate giữa các pages
- **US-1.4**: Tôi muốn có state management để quản lý user session và global state
- **US-1.5**: Tôi muốn có reusable components để giảm code duplication

### 4.2 As an Admin User
- **US-2.1**: Tôi muốn đăng nhập và được redirect đến admin dashboard
- **US-2.2**: Tôi muốn quản lý buildings, rooms, beds với CRUD operations
- **US-2.3**: Tôi muốn quản lý students, contracts, bills
- **US-2.4**: Tôi muốn xem reports và thống kê
- **US-2.5**: Tôi muốn import meter readings từ Excel file

### 4.3 As a Student User
- **US-3.1**: Tôi muốn đăng nhập và xem dashboard của mình
- **US-3.2**: Tôi muốn xem thông tin phòng và hợp đồng
- **US-3.3**: Tôi muốn xem và thanh toán hóa đơn
- **US-3.4**: Tôi muốn tạo đơn đăng ký và yêu cầu chuyển phòng
- **US-3.5**: Tôi muốn xem điểm rèn luyện và kỷ luật

### 4.4 As an Officer User
- **US-4.1**: Tôi muốn đăng nhập và xem dashboard
- **US-4.2**: Tôi muốn duyệt đơn đăng ký và yêu cầu chuyển phòng
- **US-4.3**: Tôi muốn nhập chỉ số điện nước
- **US-4.4**: Tôi muốn quản lý vi phạm
- **US-4.5**: Tôi muốn xem báo cáo

## 5. Acceptance Criteria

### 5.1 Project Setup
- **AC-1.1**: React app được tạo với Vite hoặc Create React App
- **AC-1.2**: TypeScript được cấu hình (optional nhưng recommended)
- **AC-1.3**: ESLint và Prettier được cấu hình
- **AC-1.4**: Folder structure rõ ràng theo best practices
- **AC-1.5**: Environment variables được cấu hình cho API URLs

### 5.2 Core Infrastructure
- **AC-2.1**: React Router được cấu hình với routes cho tất cả pages
- **AC-2.2**: Authentication flow hoạt động (login, logout, protected routes)
- **AC-2.3**: API client được migrate và hoạt động với React hooks
- **AC-2.4**: State management được implement (Context API hoặc Redux/Zustand)
- **AC-2.5**: Loading states và error handling được implement globally

### 5.3 UI Components
- **AC-3.1**: Layout components (Header, Sidebar, Footer) được tạo với styling giống hệt HTML cũ
- **AC-3.2**: Common components (Table, Form, Modal, Alert) được tạo với styling giống hệt HTML cũ
- **AC-3.3**: CSS từ `Frontend/css/` được migrate sang React (CSS Modules hoặc giữ nguyên)
- **AC-3.4**: Responsive design hoạt động giống hệt version HTML cũ
- **AC-3.5**: Tất cả màu sắc, fonts, spacing, animations giữ nguyên 100%
- **AC-3.6**: Visual regression testing để đảm bảo UI không thay đổi

### 5.4 Authentication Module
- **AC-4.1**: Login page hoạt động với JWT authentication
- **AC-4.2**: Token được lưu và gửi kèm mọi API requests
- **AC-4.3**: Protected routes redirect về login nếu chưa authenticate
- **AC-4.4**: Role-based routing (admin, student, officer) hoạt động
- **AC-4.5**: Logout functionality hoạt động và clear session

### 5.5 Admin Module
- **AC-5.1**: Admin dashboard hiển thị statistics và charts
- **AC-5.2**: Buildings management (list, create, edit, delete) hoạt động
- **AC-5.3**: Rooms management với filter và search hoạt động
- **AC-5.4**: Students management với pagination hoạt động
- **AC-5.5**: Bills management với calculation và payment tracking hoạt động
- **AC-5.6**: Excel import cho meter readings hoạt động
- **AC-5.7**: Reports generation hoạt động

### 5.6 Student Module
- **AC-6.1**: Student dashboard hiển thị thông tin cá nhân và room
- **AC-6.2**: Profile page cho phép xem và edit thông tin
- **AC-6.3**: Bills page hiển thị danh sách hóa đơn và chi tiết
- **AC-6.4**: Registration form cho phép tạo đơn đăng ký
- **AC-6.5**: Change request form hoạt động

### 5.7 Officer Module
- **AC-7.1**: Officer dashboard hiển thị pending tasks
- **AC-7.2**: Registration approval workflow hoạt động
- **AC-7.3**: Meter readings input form hoạt động
- **AC-7.4**: Violations management hoạt động

### 5.8 Data Management
- **AC-8.1**: All CRUD operations hoạt động đúng
- **AC-8.2**: Form validation hoạt động client-side
- **AC-8.3**: Error messages hiển thị rõ ràng
- **AC-8.4**: Success notifications hiển thị sau actions
- **AC-8.5**: Data refresh sau create/update/delete

### 5.9 Performance
- **AC-9.1**: Initial page load < 3 seconds
- **AC-9.2**: Navigation giữa pages < 500ms
- **AC-9.3**: API calls có loading indicators
- **AC-9.4**: Large lists được paginate
- **AC-9.5**: Images và assets được optimize

### 5.10 Testing
- **AC-10.1**: Unit tests cho utility functions
- **AC-10.2**: Component tests cho common components
- **AC-10.3**: Integration tests cho authentication flow
- **AC-10.4**: E2E tests cho critical user journeys (optional)

## 6. Technical Requirements

### 6.1 Technology Stack
- **Framework**: React 18+
- **Build Tool**: Vite (recommended) - cho hot reload và fast builds
- **Language**: JavaScript (hoặc TypeScript nếu team comfortable)
- **Routing**: React Router v6
- **State Management**: Context API + useReducer (lightweight, no external deps)
- **HTTP Client**: Migrate existing `api-client.js` logic
- **UI Library**: KHÔNG dùng UI library (Ant Design, Material-UI) - tự build components để giữ nguyên styling
- **Styling**: CSS Modules (recommended) hoặc giữ nguyên CSS files hiện tại và import vào components
- **Form Handling**: React Hook Form (lightweight)
- **Date Handling**: date-fns hoặc dayjs
- **Charts**: Recharts hoặc Chart.js (nếu cần charts trong dashboard)

### 6.1.1 Styling Strategy
**Option A (Recommended)**: CSS Modules
- Migrate CSS từ `Frontend/css/` sang CSS Modules
- Giữ nguyên tất cả CSS rules
- Scope CSS per component để tránh conflicts

**Option B**: Global CSS
- Import trực tiếp `admin.css`, `auth.css`, `style.css` vào React app
- Ít công sức migrate nhưng khó maintain sau này

**Option C**: Styled Components
- Convert CSS sang styled-components
- Nhiều công sức nhất nhưng type-safe và maintainable

### 6.2 Project Structure
```
Frontend-React/                    # New React app (parallel to existing Frontend/)
├── public/
│   └── assets/                    # Static assets from old Frontend
├── src/
│   ├── api/                       # Migrated from Frontend/js/api-client.js
│   │   ├── client.js              # Base API client
│   │   ├── auth.js                # Auth API calls
│   │   ├── admin.js               # Admin API calls
│   │   ├── student.js             # Student API calls
│   │   └── officer.js             # Officer API calls
│   ├── assets/                    # Images, fonts, icons
│   ├── components/
│   │   ├── common/                # Reusable components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Table/
│   │   │   ├── Modal/
│   │   │   └── ...
│   │   └── layout/                # Layout components
│   │       ├── Header/
│   │       ├── Sidebar/
│   │       └── Footer/
│   ├── contexts/                  # React contexts (AuthContext, etc.)
│   ├── hooks/                     # Custom hooks (useAuth, useApi, etc.)
│   ├── pages/                     # Page components (1-1 mapping với HTML pages)
│   │   ├── admin/                 # 20 admin pages
│   │   │   ├── Dashboard/
│   │   │   ├── Buildings/
│   │   │   ├── Rooms/
│   │   │   └── ...
│   │   ├── student/               # 11 student pages
│   │   │   ├── Dashboard/
│   │   │   ├── Profile/
│   │   │   └── ...
│   │   ├── officer/               # 6 officer pages
│   │   │   ├── Dashboard/
│   │   │   └── ...
│   │   └── auth/                  # Login, Register, etc.
│   ├── routes/                    # Route configurations
│   │   ├── index.jsx              # Main router
│   │   ├── AdminRoutes.jsx
│   │   ├── StudentRoutes.jsx
│   │   └── OfficerRoutes.jsx
│   ├── styles/                    # Migrated CSS
│   │   ├── admin.module.css       # From Frontend/css/admin.css
│   │   ├── auth.module.css        # From Frontend/css/auth.css
│   │   └── global.css             # From Frontend/css/style.css
│   ├── utils/                     # Utility functions
│   │   ├── helpers.js             # Migrated from api-helper.js
│   │   ├── validation.js
│   │   └── formatters.js
│   ├── constants/                 # Constants (migrated from config.js)
│   │   └── config.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── .env                           # API_BASE_URL, etc.
```

### 6.3 API Integration
- Migrate existing `api-client.js` logic sang React-friendly format
- Sử dụng custom hooks cho API calls (useApi, useAuth, etc.)
- Implement request/response interceptors
- Handle authentication token automatically
- Implement retry logic cho failed requests

### 6.4 Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## 7. Constraints & Assumptions

### 7.1 Constraints
- Backend APIs không thay đổi
- Phải maintain backward compatibility với existing data
- Development time: phụ thuộc vào resources
- Budget: phụ thuộc vào project scope

### 7.2 Assumptions
- Backend APIs đang hoạt động stable
- API documentation đầy đủ
- Test data có sẵn
- Development environment đã setup

## 8. Migration Strategy

### 8.1 Phased Approach
**Phase 1: Foundation & Setup (Week 1-2)**
- Setup React project với Vite
- Configure tooling (ESLint, Prettier)
- Migrate CSS files sang CSS Modules (hoặc setup global CSS)
- Create project structure
- Migrate `api-client.js`, `api-helper.js`, `config.js`
- Implement authentication flow
- Create base layout components (Header, Sidebar, Footer) - giữ nguyên HTML structure và CSS

**Phase 2: Common Components (Week 2-3)**
- Analyze existing HTML components (tables, forms, modals, buttons)
- Create React equivalents với styling giống hệt
- Test components với existing CSS
- Document component APIs

**Phase 3: Admin Module (Week 3-6)**
- Migrate admin pages theo priority (1 page = 1 React component)
- High priority: Dashboard, Buildings, Rooms, Students
- Medium priority: Contracts, Bills, Fees, Meter Readings
- Low priority: Reports, Settings, Overdue Notices
- **Key**: Copy HTML structure, migrate JS logic sang React hooks

**Phase 4: Student Module (Week 6-8)**
- Migrate 11 student pages
- Focus on core features: Dashboard, Profile, Bills, Requests
- Reuse components từ Admin module

**Phase 5: Officer Module (Week 8-9)**
- Migrate 6 officer pages
- Test integration với admin và student modules

**Phase 6: Testing & Polish (Week 9-10)**
- Visual regression testing (compare screenshots)
- Functional testing
- Performance optimization
- Bug fixes
- Documentation

**Phase 7: Deployment (Week 11)**
- Build production bundle
- Deploy alongside existing Frontend (parallel run)
- Gradual user migration
- Monitor và fix issues

### 8.2 Rollout Strategy
- Option A: Big bang deployment (replace old frontend completely)
- Option B: Gradual rollout (run both versions, redirect users gradually)
- Option C: Feature flag based (toggle between old and new per user)

## 9. Success Metrics

### 9.1 Functional Metrics
- 100% feature parity với old frontend
- 0 critical bugs in production
- All acceptance criteria met

### 9.2 Performance Metrics
- Page load time < 3s
- Time to interactive < 2s
- API response handling < 100ms

### 9.3 Code Quality Metrics
- Test coverage > 70%
- ESLint errors = 0
- TypeScript errors = 0 (if using TS)

### 9.4 User Satisfaction
- User feedback positive
- No increase in support tickets
- Training time minimal

## 10. Risks & Mitigations

### 10.1 Risks
1. **Risk**: API incompatibility issues
   - **Mitigation**: Thorough API testing, maintain API client abstraction

2. **Risk**: Data loss during migration
   - **Mitigation**: No data migration needed (backend unchanged)

3. **Risk**: Performance degradation
   - **Mitigation**: Performance testing, code splitting, lazy loading

4. **Risk**: User resistance to new UI
   - **Mitigation**: Similar UI/UX, user training, feedback loop

5. **Risk**: Timeline overrun
   - **Mitigation**: Phased approach, MVP first, iterative development

## 11. Dependencies

### 11.1 External Dependencies
- Backend APIs must be stable và documented
- Test environment must be available
- Design assets (if any) must be provided

### 11.2 Internal Dependencies
- Development team availability
- QA team for testing
- Stakeholder availability for reviews

## 12. Out of Scope

- Backend modifications
- Database changes
- Mobile app development (nhưng responsive design phải giữ nguyên)
- Real-time features (WebSocket) - unless đã có trong HTML version
- Offline functionality
- Multi-language support (i18n) - có thể add later
- Dark mode - có thể add later
- Accessibility (WCAG) compliance - should be considered but not blocking
- UI/UX redesign - KHÔNG redesign, giữ nguyên 100% giao diện hiện tại

## 13. Migration Checklist

### 13.1 Pre-Migration
- [ ] Audit existing Frontend code (HTML, CSS, JS)
- [ ] Document all pages và features
- [ ] Take screenshots của tất cả pages (for visual comparison)
- [ ] Extract CSS variables (colors, fonts, spacing)
- [ ] List all API endpoints being used
- [ ] Identify reusable components

### 13.2 During Migration
- [ ] Setup React project với Vite
- [ ] Migrate CSS files
- [ ] Create component library
- [ ] Migrate pages one by one
- [ ] Visual comparison testing (screenshot diff)
- [ ] Functional testing

### 13.3 Post-Migration
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] User acceptance testing
- [ ] Documentation
- [ ] Training materials
- [ ] Deployment plan

## 14. Key Principles

1. **Preserve, Don't Redesign**: Mục tiêu là migrate code structure, không phải redesign UI
2. **Incremental Migration**: Migrate từng page một, test kỹ trước khi move on
3. **Visual Parity**: Mỗi page phải trông giống hệt HTML version (pixel-perfect nếu có thể)
4. **Functional Parity**: Mọi feature phải hoạt động giống hệt
5. **Code Quality**: Tận dụng cơ hội để refactor JS logic, nhưng không thay đổi behavior
6. **Testability**: Viết code dễ test, có unit tests cho business logic
7. **Maintainability**: Component-based architecture để dễ maintain sau này
