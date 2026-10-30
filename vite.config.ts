import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Hosting platforms such as Render provide the port at runtime through PORT,
// and a web service must listen on 0.0.0.0 rather than localhost only.
const port = Number(process.env.PORT) || 4173

export default defineConfig({
  plugins: [react()],
  // If another local development app is already using 5173, Vite chooses the
  // next free local port and reports it in the START.bat window.
  server: { port: 5173, strictPort: false },
  // Used by `npm start` when the project is deployed as a web service.
  // Vite rejects requests whose Host header it does not recognise, which is
  // what produced "Blocked request. This host is not allowed" on Render.
  preview: {
    host: '0.0.0.0',
    port,
    strictPort: true,
    allowedHosts: ['localhost', '127.0.0.1', '.onrender.com'],
  },
})
