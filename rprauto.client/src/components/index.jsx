import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// The page component
import App from './App.jsx'

// visual styles
import './styles/index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
)
