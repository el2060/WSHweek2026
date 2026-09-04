import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './CLTESafetyApp';
import './safety.css';
import './guided.css';
import './reading.css';
import './workspace.css';
import './reporting.css';
import './office.css';
import './experiment-room.css';
import './fire.css';
import './journey.css';
import { initializeScorm } from './scorm';

initializeScorm();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
