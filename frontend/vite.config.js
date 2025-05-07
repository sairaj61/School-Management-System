import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow Vite to accept external connections
    port: 5173, // Ensure Vite runs on port 5173
  },
});
