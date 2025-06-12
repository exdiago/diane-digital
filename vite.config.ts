import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This is the key change.
    // It tells Vite's development server to forward any request
    // that starts with '/api' to your backend server running on port 3001.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    open: true,
  },
})
