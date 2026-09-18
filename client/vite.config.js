import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/online_school/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    hmr: { overlay: false },
    proxy: {
      '/online_school/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/online_school/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
