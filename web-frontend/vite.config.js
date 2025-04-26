import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Change the port to your desired value
    host: true, // Enable LAN access
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  resolve: {
    alias: {
      // '@styles': '/src/styles',
      // '@components': '/src/components',
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: 'dist', // Change the build output directory to 'build'
  },
});
