import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/themes.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'

const savedTheme = localStorage.getItem('task-tracker-theme')
const initialTheme = savedTheme === 'claude' ? 'claude' : 'default'
document.documentElement.classList.remove('dark')
document.documentElement.dataset.theme = initialTheme

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
