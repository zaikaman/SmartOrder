import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, '..'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['axios', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    proxy: {
      // Service 1: Auth & User Service (Port 8081)
      '/api/v1/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/users': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/admin/users': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },

      // Service 2: Catalog & Table Service (Port 8082)
      '/api/v1/menu': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/tables': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/admin/menu': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/admin/tables': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/staff/tables': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },

      // Service 3: Booking & Order Service (Port 8083)
      '/api/v1/orders': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1/payments': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1/staff/orders': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1/admin/statistics': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
    },
  },
});
