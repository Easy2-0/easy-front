import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BalanceProvider } from './context/BalanceContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BalanceProvider>
      <App />
    </BalanceProvider>
  </StrictMode>,
);
