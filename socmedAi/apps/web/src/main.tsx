import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';
import './styles/components.css';
import { App } from './app/App';
import { SupabaseAuthProvider } from './lib/auth';
const content = (
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <SupabaseAuthProvider><App /></SupabaseAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
createRoot(document.getElementById('root')!).render(content);
