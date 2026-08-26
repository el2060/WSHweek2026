import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './CLTESafetyApp';
import './safety.css';
import './guided.css';
import './reading.css';
import './workspace.css';
import './reporting.css';
import './office.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
