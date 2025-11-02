// Web-Based Ignition Perspective Designer - Vite Configuration
// Version: 0.1.0

import { defineConfig } from 'vite'

export default defineConfig({
  // Base path for the application (matches Gateway module mount path)
  base: '/webdesigner/',

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
      '/webdesigner/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
    },
  },
})
