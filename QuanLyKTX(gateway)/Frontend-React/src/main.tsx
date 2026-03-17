import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './design-system.css'
import './style.css'
import './admin.css'
import './auth.css'
import App from './App'
import QueryProvider from './components/providers/QueryProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
)
