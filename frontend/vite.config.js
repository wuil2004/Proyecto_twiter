import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['app_frontend'] // ¡Esto le dice a Vite que confíe en Nginx!
  }
})
