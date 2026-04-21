import { defineConfig } from 'vite'
import { resolve } from 'path'

// 部署到 GitHub Pages 时用环境变量 VITE_BASE，开发时默认 '/'
const BASE = process.env.VITE_BASE || '/'

export default defineConfig({
  base: BASE,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'scene-1': resolve(__dirname, 'pages/scene-1.html'),
        'scene-2': resolve(__dirname, 'pages/scene-2.html'),
        'scene-3': resolve(__dirname, 'pages/scene-3.html'),
        'scene-4': resolve(__dirname, 'pages/scene-4.html'),
        'scene-5': resolve(__dirname, 'pages/scene-5.html'),
        'scene-6': resolve(__dirname, 'pages/scene-6.html'),
      },
    },
  },
  server: {
    host: true,
  },
})
