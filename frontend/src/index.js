import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './utils/axiosConfig';

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Prevent undefined errors
const safeRender = () => {
  try {
    const container = document.getElementById('root');
    if (!container) {
      console.error('Root element not found!');
      return;
    }

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Rendering error:', error);
  }
};

// Ensure DOM is fully loaded before rendering
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeRender);
} else {
  safeRender();
}
