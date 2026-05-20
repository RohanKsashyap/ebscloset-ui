import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ProductProvider } from './context/ProductContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerSW } from 'virtual:pwa-register';

// Register service worker
registerSW({ immediate: true });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CartProvider>
          <ProductProvider>
            <App />
          </ProductProvider>
        </CartProvider>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
