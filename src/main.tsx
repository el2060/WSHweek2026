import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './CLTESafetyApp';
import './safety.css';
import './guided.css';
import './reading.css';
import './workspace.css';
import './office.css';
import './experiment-room.css';
import './fire.css';
import './journey.css';
import './pantry.css';
import './home-flow.css';
import './scene-visibility.css';
import './hazard-focus.css';
import './fire-route-photo.css';
import './visual-scenario.css';
import { initializeScorm } from './scorm';

initializeScorm();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
