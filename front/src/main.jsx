import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './i18n'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Outfit, sans-serif',
              fontSize: '13px',
              background: '#FDFAF6',
              color: '#3D2F23',
              border: '1px solid #EDE0CC',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(92,74,58,0.1)',
            },
            success: { iconTheme: { primary: '#6E9465', secondary: '#FDFAF6' } },
            error:   { iconTheme: { primary: '#C47D62', secondary: '#FDFAF6' } },
          }}
        />
    </BrowserRouter>
  </React.StrictMode>
)
