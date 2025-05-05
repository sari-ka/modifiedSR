import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoginT_Context from './Context/LoginT_Context.jsx'
import LoginV_Context from './Context/LoginV_Context.jsx'
import LoginI_Context from './Context/LoginI_Context.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <LoginT_Context>
      <LoginV_Context>
        <LoginI_Context>
        <App />
          </LoginI_Context>
      </LoginV_Context>
    </LoginT_Context>
  </StrictMode>,
)
