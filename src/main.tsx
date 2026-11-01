import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for offline capability & event data caching
registerSW({ immediate: true });

// Google Maps Platform Quota & Auth Failure Defense Handler
(window as any).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

const origConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args.map((a) => String(a)).join(' ');
  // Suppress cloud container WebSocket HMR warning as HMR is disabled in this environment
  if (
    msg.includes('WebSocket') ||
    msg.includes('closed without opened') ||
    (msg.includes('vite') && msg.includes('WebSocket'))
  ) {
    return;
  }

  origConsoleError.apply(console, args);

  if (
    msg.includes('OverQuotaMapError') ||
    msg.includes('QuotaExceededError') ||
    msg.includes('InvalidKeyMapError') ||
    msg.includes('BillingNotEnabledMapError') ||
    msg.includes('ApiNotActivatedMapError') ||
    msg.includes('DeletedKeyMapError') ||
    msg.includes('ExpiredKeyMapError') ||
    msg.includes('RefererNotAllowedMapError') ||
    msg.includes('reading \'get\'')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

// Prevent uncaught Maps SDK or Vite WebSocket errors from crashing the page
window.addEventListener('error', (event) => {
  const msg = (event.message || event.error?.message || '').toLowerCase();
  if (
    msg.includes('websocket') ||
    msg.includes('closed without opened') ||
    msg.includes('reading \'get\'') ||
    msg.includes('google.maps') ||
    msg.includes('invalidkeymaperror')
  ) {
    if (msg.includes('reading \'get\'') || msg.includes('google') || msg.includes('map')) {
      window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
    }
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = (event.reason?.message || String(event.reason) || '').toLowerCase();
  if (
    msg.includes('websocket') ||
    msg.includes('closed without opened') ||
    msg.includes('reading \'get\'') ||
    msg.includes('google.maps') ||
    msg.includes('invalidkeymaperror')
  ) {
    if (msg.includes('reading \'get\'') || msg.includes('google') || msg.includes('map')) {
      window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
    }
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary name="AppRoot">
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
