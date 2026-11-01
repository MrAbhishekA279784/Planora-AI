import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase') || id.includes('firebase')) {
              return 'vendor-db-auth';
            }
            if (id.includes('@google/genai')) {
              return 'vendor-genai';
            }
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
