import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isStaging = mode === 'staging'
  const isProd = mode === 'production'

  // Determine base path
  let basePath = '/'
  if (isStaging) {
    basePath = '/pathfinder/'
  } else if (isProd) {
    // You might want different base for production
    basePath = '/'
  }

  return {
    plugins: [react()],
    base: basePath,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDev ? true : false,
      // Simpler build options for IIS compatibility
      target: 'es2015',
      // Ensure public files are copied correctly
      copyPublicDir: true,
      rollupOptions: {
        output: {
          // Reduce the number of chunks
          manualChunks: (id) => {
            // Put all node_modules into vendor chunk
            if (id.includes('node_modules')) {
              return 'vendor'
            }
            // Put all other code into main chunk
            return 'main'
          }
        }
      }
    },
    publicDir: 'public',
    server: {
      port: 3001,
      // Ensure public files are served correctly in dev
      fs: {
        strict: false
      },
      proxy: isDev ? {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      } : undefined
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      // Make mode and environment info explicitly available
      __DEV__: isDev,
      __STAGING__: isStaging,
      __PROD__: isProd,
    },
    // Make sure environment variables with VITE_ prefix are available
    envPrefix: 'VITE_'
  }
})