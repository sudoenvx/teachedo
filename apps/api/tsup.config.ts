import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  clean: true,
  target: "esnext",
  shims: true,
  outDir: "dist",
  external: ['@teachedo/database'],
});
