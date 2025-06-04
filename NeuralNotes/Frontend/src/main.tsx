import React from 'react'
import ReactDOM from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'; // KALDIRILDI
import App from './App.tsx'

// Stil importları
import './styles/globals.css'

// i18n konfigürasyonu
import './i18n/i18n.ts'

// Import QueryClient and QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a QueryClient instance
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Wrap your App with QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      {/* <BrowserRouter> // KALDIRILDI */}
      <App />
      {/* </BrowserRouter> // KALDIRILDI */}
    </QueryClientProvider>
  </React.StrictMode>
)
