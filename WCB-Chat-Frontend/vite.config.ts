import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    lib: {
      entry: 'src/index.jsx',  // Your entry point
      name: 'ChatWidget',      // Global variable name
      fileName: 'chat-widget',
      formats: ['iife']        // CRITICAL: Makes it work as window.ChatWidget
    },
       rollupOptions: {
      output: {
        assetFileNames: 'chat-widget.[ext]' // This will create chat-widget.css
      }
    },
    // Ensure everything is bundled together
    cssCodeSplit: false,
  }
});