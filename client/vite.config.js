import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on IPv4 + IPv6 so both localhost and 127.0.0.1 work
    port: 3000,
    strictPort: true, // fail loudly instead of silently picking another port
    proxy: { '/api': 'http://127.0.0.1:5050' },
  },
});
