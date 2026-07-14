import { Buffer } from 'buffer'
import process from 'process'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// WDK crypto stack expects Node globals in the browser.
const root = globalThis as typeof globalThis & {
  Buffer?: typeof Buffer
  process?: typeof process
}
root.Buffer = Buffer
root.process = process

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
