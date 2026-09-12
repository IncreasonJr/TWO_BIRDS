import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const buildTime = new Date().toISOString()

// https://vite.dev/config/
export default defineConfig({
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
})

