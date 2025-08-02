import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '../styles/index.css'

console.log('🚀 Inicialitzant App')

const rootElement = document.getElementById('root')
console.log('🔍 Root element:', rootElement)

if (!rootElement) {
  console.error('❌ No es pot trobar l\'element #root')
  throw new Error('No es pot trobar l\'element #root')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
