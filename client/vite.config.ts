import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // [THE FIX] This proxy configuration is the key.
    proxy: {
      // Any request starting with /api will be proxied
      '/api': {
        target: 'http://localhost:3001', // The address of your backend server
        changeOrigin: true, // Recommended for virtual hosts
      },
      // We also need to proxy the /uploads route for images
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})