import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'regenerator-runtime/runtime';
import api from './services/axios'
import { flushOfflineQueue } from './utils/offlineQueue'
import { registerPushToken } from './utils/pushNotifications'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

window.addEventListener('online', () => {
  flushOfflineQueue(api).then(({ flushed }) => {
    if (flushed > 0) console.info(`Synced ${flushed} offline action(s)`);
  });
});

const token = localStorage.getItem('token');
if (token) registerPushToken();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
