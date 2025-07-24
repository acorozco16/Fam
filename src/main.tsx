import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { errorReporter } from './utils/errorReporting'

// Initialize error reporting
console.log('🚀 FamApp starting up...');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)