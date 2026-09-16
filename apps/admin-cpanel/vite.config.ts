import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    babel({ presets: [ reactCompilerPreset() ] })
  ],

  server: {
    port: 3001,
    strictPort: true
  },

  resolve: {
    tsconfigPaths: true
  },

  optimizeDeps: {
    exclude: ["@teachedo/ui"]
  }
})
