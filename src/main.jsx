import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// 引入 Bootstrap CSS 和 JS 檔案
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
