import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Clock } from "./components/ui/clock.tsx";
import { AppProvider } from "./context/AppContext.tsx";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <Clock />
      <App />
    </AppProvider>
  </React.StrictMode>
)