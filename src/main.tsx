import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Clock } from "./components/ui/clock.tsx";
import { AppProvider } from "./context/AppContext.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Configuration du QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Clock />
        <App />
      </AppProvider>
    </QueryClientProvider>
  </React.StrictMode>
)