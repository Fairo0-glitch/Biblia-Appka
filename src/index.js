import React from 'react';
import ReactDOM from 'react-dom/client';
import BibliaAppka from './Biblia-Appka'; // Ścieżka do Twojego pliku

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BibliaAppka />
  </React.StrictMode>
);

// Rejestracja Service Workera dla PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}