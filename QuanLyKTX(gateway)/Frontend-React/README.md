# Quản Lý Ký Túc Xá - React Frontend

Modern React-based frontend for the Dormitory Management System, migrated from vanilla HTML/CSS/JavaScript.

## 🚀 Tech Stack

- **Framework:** React 18.3+
- **Build Tool:** Vite 5+
- **Routing:** React Router v6
- **State Management:** Context API + useReducer
- **Styling:** CSS Modules
- **Language:** JavaScript (ES6+)

## 📁 Project Structure

```
Frontend-React/
├── public/              # Static assets
├── src/
│   ├── api/            # API client layer
│   ├── assets/         # Images, fonts, icons
│   ├── components/     # Reusable components
│   │   ├── common/     # Common UI components
│   │   └── layout/     # Layout components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin pages (20 pages)
│   │   ├── student/    # Student pages (11 pages)
│   │   ├── officer/    # Officer pages (6 pages)
│   │   └── auth/       # Auth pages
│   ├── routes/         # Routing configuration
│   ├── styles/         # Global styles
│   ├── utils/          # Utility functions
│   ├── constants/      # Constants
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── .env                # Environment variables
├── .env.example        # Example env file
├── package.json
└── vite.config.js
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository
```bash
cd Frontend-React
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8000)
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

### Vite Configuration

The project uses Vite with:
- React plugin for Fast Refresh
- Path alias `@/` pointing to `src/`
- Dev server on port 3000

## 🎨 Styling

- **CSS Modules** for component-scoped styles
- **Global CSS** for base styles and utilities
- **CSS Variables** for theming

## 🧪 Testing

```bash
npm run test        # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 📦 Building for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

## 🚢 Deployment

1. Build the project
```bash
npm run build
```

2. Deploy the `dist/` folder to your web server

3. Configure your web server to serve `index.html` for all routes (SPA routing)

### Nginx Configuration Example

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 📝 Development Guidelines

### Code Style

- Use ESLint and Prettier for code formatting
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused

### Component Structure

```jsx
// ComponentName.jsx
import styles from './ComponentName.module.css';

function ComponentName({ prop1, prop2 }) {
  // Hooks
  // Event handlers
  // Render
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
}

export default ComponentName;
```

### Naming Conventions

- **Components:** PascalCase (e.g., `UserProfile.jsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth.js`)
- **Utils:** camelCase (e.g., `formatDate.js`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

## 🔗 Related Documentation

- [Requirements Document](./.kiro/specs/frontend-react-migration/requirements.md)
- [Design Document](./.kiro/specs/frontend-react-migration/design.md)
- [Tasks List](./.kiro/specs/frontend-react-migration/tasks.md)

## 📄 License

Private - Internal Use Only

## 👥 Team

Development Team - Quản Lý Ký Túc Xá Project

---

**Version:** 1.0.0  
**Last Updated:** 2026-03-07
