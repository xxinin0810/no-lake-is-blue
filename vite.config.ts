import { defineConfig } from 'vite'
import { resolve } from 'path'

// 部署到 GitHub Pages 时用环境变量 VITE_BASE，开发时默认 '/'
const BASE = process.env.VITE_BASE || '/'

export default defineConfig({
  base: BASE,
  // 定义 Vite 内部变量，解决 MPA 模式下 client chunk 引用未定义变量的问题
  define: {
    __DEFINES__: JSON.stringify({}),
    __BASE__: JSON.stringify(BASE),
    __SERVER_HOST__: JSON.stringify(''),
    __WS_TOKEN__: JSON.stringify(''),
    __HMR_CONFIG_NAME__: JSON.stringify(''),
    __HMR_BASE__: JSON.stringify(''),
    __HMR_HOSTNAME__: JSON.stringify(''),
    __HMR_PORT__: JSON.stringify(''),
    __HMR_PROTOCOL__: JSON.stringify(''),
    __HMR_DIRECT_TARGET__: JSON.stringify(false),
    __HMR_ENABLE_OVERLAY__: JSON.stringify(true),
    __HMR_TIMEOUT__: JSON.stringify(30000),
  },
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
