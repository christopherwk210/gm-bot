import { createRequire } from 'node:module';
import { build } from 'esbuild';
import copyStaticFiles from 'esbuild-copy-static-files';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  outfile: './dist/gm-bot.mjs',
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  format: 'esm',
  sourcemap: 'linked',
  plugins: [
    copyStaticFiles({
      src: './static',
      dest: './dist',
      recursive: true
    }),
    copyStaticFiles({
      src: './package.json',
      dest: './dist/package.json'
    })
  ]
}).catch(() => process.exit(1));
