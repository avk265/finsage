import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Proxy all backend requests to port 3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Optional: catch-all for other routes
      '/login': { target: 'http://localhost:3000', changeOrigin: true },
      '/register': { target: 'http://localhost:3000', changeOrigin: true },
      '/forgot-password': { target: 'http://localhost:3000', changeOrigin: true },
      '/reset-password': { target: 'http://localhost:3000', changeOrigin: true },
      '/add-finance': { target: 'http://localhost:3000', changeOrigin: true },
      '/get-finance': { target: 'http://localhost:3000', changeOrigin: true },
      '/profile-data': { target: 'http://localhost:3000', changeOrigin: true },
      '/update-profile': { target: 'http://localhost:3000', changeOrigin: true },
      '/save-lifestyle-budget': { target: 'http://localhost:3000', changeOrigin: true },
      '/get-lifestyle-budgets': { target: 'http://localhost:3000', changeOrigin: true },
      '/get-latest-lifestyle-budget': { target: 'http://localhost:3000', changeOrigin: true },
      '/delete-lifestyle-budget': { target: 'http://localhost:3000', changeOrigin: true },
      '/chatbot': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
