import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('Starting application...');

const container = document.getElementById('root');
if (!container) {
  console.error('Root element not found!');
} else {
  console.log('Root element found, creating root...');
}

const root = createRoot(container);

try {
  console.log('Attempting to render app...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
}
