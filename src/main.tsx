import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import '@/index.css';

// Real entry point — mounts <App/>. Everything else (providers, router,
// layouts, guards) is composed inside src/app.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
