import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isStaging = mode === 'staging'

  return {
    plugins: [react()],
    base: isStaging ? '/pathfinder/' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDev,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
            icons: ['@chakra-ui/icons', 'react-icons'],
            router: ['react-router-dom'],
            utils: ['axios', 'framer-motion']
          }
        }
      }
    },
    server: {
      port: 3001,
      proxy: isDev ? {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      } : undefined
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }
  }
})