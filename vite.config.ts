import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const buildTime = isDev ? 'dev' : new Date().toISOString()

  return {
    plugins: [
      react(),
      {
        name: 'generate-version-file',
        closeBundle() {
          const distDir = path.resolve(__dirname, 'dist')
          if (fs.existsSync(distDir)) {
            fs.writeFileSync(
              path.resolve(distDir, 'version.json'),
              JSON.stringify({ version: buildTime, builtAt: buildTime })
            )
          }
        },
      },
    ],
    define: {
      __APP_BUILD_TIME__: JSON.stringify(buildTime),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  }
})
