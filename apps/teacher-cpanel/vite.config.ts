import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],

  resolve: {
    tsconfigPaths: true
  },

  server: {
    port: 3002,
    strictPort: true
  },

  optimizeDeps: {
    exclude: ["@teachedo/ui", "@teachedo/theme"]
  }
})
