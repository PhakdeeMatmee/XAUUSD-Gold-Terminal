import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Using relative base path so assets load properly on GitHub Pages
  server: {
    port: 3000,
    host: true
  }
})
