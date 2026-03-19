import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isSSR = process.argv.includes('--ssr')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './app'),
      '@lib': path.resolve(__dirname, './lib'),
    },
  },
  root: isSSR ? '.' : 'app',
  build: isSSR
    ? {
        emptyOutDir: false,
        minify: 'esbuild',
        rollupOptions: {
          output: {
            entryFileNames: 'filediff.js',
          },
        },
      }
    : {
        outDir: path.resolve(__dirname, 'dist/client'),
        emptyOutDir: true,
        chunkSizeWarningLimit: 800,
        rollupOptions: {
          output: {
            manualChunks: {
              'base-ui-vendor': ['@base-ui/react'],
            },
          },
        },
      },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4321',
        changeOrigin: true,
      },
    },
  },
})
