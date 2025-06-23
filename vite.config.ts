import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["bippy/dist/jsx-dev-runtime", "bippy/dist/jsx-runtime"],
  },
  base: '/ai-app/',
  build: {
    target: 'es2015', // Support older browsers
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
