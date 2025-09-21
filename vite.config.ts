import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      '@fullcalendar/daygrid/index.global.css',
      '@fullcalendar/timegrid/index.global.css',
      '@fullcalendar/list/index.global.css',
    ],
  },
});
