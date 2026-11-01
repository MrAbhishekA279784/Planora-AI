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
  origConsoleError.apply(console, args);
  const msg = args.map((a) => String(a)).join(' ');
  if (
    msg.includes('OverQuotaMapError') ||
    msg.includes('QuotaExceededError') ||
    msg.includes('InvalidKeyMapError') ||
    msg.includes('reading \'get\'')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

// Prevent uncaught Maps SDK errors from crashing the page
window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('reading \'get\'') || event.message.includes('google.maps'))
  ) {
    window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
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
