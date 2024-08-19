import * as dotenv from 'dotenv';
import * as url from 'url';
dotenv.config();

/** Absolute path to ./dist, the final source base path */
const projectRootPath = url.fileURLToPath(new URL('../', import.meta.url));

/** Detected via --development command line argument */
const devMode = process.argv.includes('--development');

/** Discord bot application ID, taken from `application_id` environment variable */
const applicationId: string = process.env.application_id!;
if (!applicationId) throw new Error('App ID not found in environment! Please add it to your .env file.');

/** Discord bot token, taken from `token` environment variable */
const token: string = process.env.token!;
if (!token) throw new Error('Token not found in environment! Please add it to your .env file.');

export {
  projectRootPath,
  devMode,
  applicationId,
  token
};
