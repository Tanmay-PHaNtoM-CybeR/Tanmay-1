import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // If another local development app is already using 5173, Vite chooses the
  // next free local port and reports it in the START.bat window.
  server: { port: 5173, strictPort: false },
})
