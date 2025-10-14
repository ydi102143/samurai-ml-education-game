import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          ml: ['@tensorflow/tfjs'],
        },
        entryFileNames: `assets/[name]-${Date.now()}-${Math.floor(Math.random() * 100000)}.js`,
        chunkFileNames: `assets/[name]-${Date.now()}-${Math.floor(Math.random() * 100000)}.js`,
        assetFileNames: `assets/[name]-${Date.now()}-${Math.floor(Math.random() * 100000)}.[ext]`
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  base: process.env.NODE_ENV === 'production' ? '/samurai-ml-education-game/' : '/',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});