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
      // Mark React as external? NO! We want to bundle it
      output: {
        // Inline all CSS into JS (easier) OR separate CSS file
        inlineDynamicImports: true,
      }
    },
    // Ensure everything is bundled together
    cssCodeSplit: false,
  }
});