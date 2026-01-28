import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/convert': 'http://127.0.0.1:5001',
      '/speak': 'http://127.0.0.1:5001',
      '/uploads': 'http://127.0.0.1:5001',
      '/static': 'http://127.0.0.1:5001'
    }
  }
})
