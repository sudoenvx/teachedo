import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'esnext',
  tsconfig: './tsconfig.build.json',
  clean: true,
  outDir: 'dist',
  dts: {
    compilerOptions: {
      composite: false,
      inceremental: false
    }
  },
  shims: true,
  // Keep Prisma runtime + adapter external � they ship native engine binaries
  // that must be resolved from node_modules at runtime, not inlined.
  external: [
    '@prisma/client',
    '@prisma/adapter-mariadb',
    'dotenv',
  ],
});
