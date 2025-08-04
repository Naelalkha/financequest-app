import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import posthog from 'posthog-js'

// Initialise **avant** le rendu React
posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  autocapture: true,          // capte clics & pages automatiquement
  capture_pageview: true      // vue de page SPA
})

// Attacher PostHog à window pour l'accès global
window.posthog = posthog

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)