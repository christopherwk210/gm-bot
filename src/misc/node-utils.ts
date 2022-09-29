import { createRequire } from 'module';
import * as url from 'url';

/**
 * commonjs-ize your module
 * @param metaUrl this should be `import.meta.url`
 */
export function cjs(metaUrl: string) {
  const __dirname = url.fileURLToPath(new URL('.', metaUrl));
  const require = createRequire(metaUrl);
  return { __dirname, require };
}

export function tomorrow() {
  return new Date(Date.now() + 60 * 60 * 24 * 1000);
}
