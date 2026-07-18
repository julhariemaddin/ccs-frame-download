import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import frameManifest from './vite-plugin-frame-manifest.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [frameManifest(), react()],
})
