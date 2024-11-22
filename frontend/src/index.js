import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './utils/axiosConfig';

// Add error logging for uncaught errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};

// Add error logging for unhandled promise rejections
window.onunhandledrejection = function(event) {
  console.error('Unhandled promise rejection:', event.reason);
};

// Create root and render app
const container = document.getElementById('root');
if (!container) {
  console.error('Root element not found! Make sure public/index.html contains a div with id="root"');
} else {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
