import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './utils/axiosConfig'; // Import axios configuration

// Add error logging for uncaught errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};

// Add error logging for unhandled promise rejections
window.onunhandledrejection = function(event) {
  console.error('Unhandled promise rejection:', event.reason);
};

console.log('Starting application...');

// Check if the root element exists
const container = document.getElementById('root');
if (!container) {
  console.error('Root element not found! Make sure public/index.html contains a div with id="root"');
} else {
  console.log('Root element found, creating root...');
  
  try {
    console.log('Creating React root...');
    const root = createRoot(container);
    
    console.log('Attempting to render app...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
}
