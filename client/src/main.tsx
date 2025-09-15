import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; 
import './index.css'; // Assuming you have a global stylesheet here

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);