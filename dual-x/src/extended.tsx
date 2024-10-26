import React from 'react';
import ReactDOM from 'react-dom/client';
import './extended.css';

function ExtendedWindow() {
  return (
    <div className="extended-container">
      <h1>안녕하세요.</h1>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ExtendedWindow />
  </React.StrictMode>,
);
