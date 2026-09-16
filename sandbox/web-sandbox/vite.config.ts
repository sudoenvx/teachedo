import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],

    server: {
    port: 8888,
    strictPort: true
  },

  resolve: {
    tsconfigPaths: true
  },

  optimizeDeps: {
    exclude: ["@teachedo/ui", "@teachedo/theme"]
  }
})
