import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // WDK pulls sodium-universal → sodium-native (Node addon). Browser uses pure JS.
      'sodium-native': 'sodium-javascript',
      buffer: 'buffer/',
      process: 'process/browser',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: [
      '@tetherto/wdk',
      '@tetherto/wdk-wallet-evm',
      'sodium-javascript',
      'buffer',
      'process',
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    chunkSizeWarningLimit: 1500,
  },
})
