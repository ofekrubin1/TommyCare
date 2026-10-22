import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { applyTheme } from './lib/theme';
import { registerServiceWorker } from './lib/push';
import { catchUnhandled } from './lib/errors';
import { keepAppUpdated } from './lib/appUpdate';
import './index.css';

applyTheme();
registerServiceWorker();
catchUnhandled();
keepAppUpdated();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
