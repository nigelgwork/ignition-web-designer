// Web-Based Ignition Perspective Designer - Vite Configuration
// Version: 0.3.0

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Base path for the application (matches Gateway module mount path)
  base: '/res/webdesigner/',

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // Clear output directory before build
    emptyOutDir: true,
  },

  // Development server configuration
  server: {
    port: 5173,
    // Proxy API requests to local Gateway during development
    proxy: {
      '/data/webdesigner/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
    },
  },
})
