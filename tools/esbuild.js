import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import copyStaticFiles from 'esbuild-copy-static-files';
import glob from 'glob';
import * as url from 'url';

const devMode = process.argv.includes('--development');

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
console.time('Process complete. Finished in');

function clean() {
  console.log('Cleaning...');

  const outputPath = path.join(__dirname, '../dist');
  fs.rmSync(outputPath, { force: true, recursive: true });
}

function esbuild() {
  console.log('Building...');
  
  glob('./src/**/*.ts', { nosort: true }, (err, files) => {
    if (err !== null) throw new Error(err);
    build({
      entryPoints: files,
      platform: 'node',
      outdir: './dist',
      format: 'esm',
      sourcemap: devMode ? 'linked' : false,
      minify: !devMode,
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
    })
    .then(() => {
      console.timeEnd('Process complete. Finished in');
    })
    .catch(() => process.exit(1));
  });
}

clean();
esbuild();
