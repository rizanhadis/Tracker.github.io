import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Saat build untuk GH Pages, pakai subdirectory. Saat dev, pakai root.
  base: command === 'build' ? '/Tracker.github.io/' : '/',
  server: {
    port: 3000,
    open: true
  }
}))
