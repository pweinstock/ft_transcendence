import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { UserSocketProvider } from './components/context/user-socket';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <UserSocketProvider>
      <App />
    </UserSocketProvider>
  </React.StrictMode>
);
