import esbuild from 'esbuild';
import { builtinModules } from 'module';

esbuild.build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  // Filter out Node built-ins and third-party node_modules, 
  // but ALLOW @teachedo/ packages to bundle
  external: [
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
    'express',
    'cors',
    'dotenv',
    'pg',
    '@prisma/client',
    '@prisma/adapter-mariadb'
  ],
}).catch(() => process.exit(1));
