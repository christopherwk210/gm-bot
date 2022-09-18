import { build } from 'esbuild';
import copyStaticFiles from 'esbuild-copy-static-files';

build({
  entryPoints: ['./src/index.mts'],
  bundle: true,
  platform: 'node',
  outfile: './dist/gm-bot.mjs',
  external: ['./node_modules/*'],
  format: 'esm',
  sourcemap: 'linked',
  plugins: [
    copyStaticFiles({
      src: './static',
      dest: './dist',
      recursive: true
    })
  ]
}).catch(() => process.exit(1));
