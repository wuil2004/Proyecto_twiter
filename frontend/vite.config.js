import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite que Docker exponga la red
    hmr: {
      clientPort: 8080, // Le dice a Vite que el navegador usará el puerto de Nginx
    }
  }
})