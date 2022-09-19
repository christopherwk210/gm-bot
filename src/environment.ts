import * as dotenv from 'dotenv';
import * as url from 'url';
dotenv.config();

const projectRootPath = url.fileURLToPath(new URL('.', import.meta.url));
const devMode = process.argv.includes('--development');
const testingGuild = process.env.testing_guild || '';

const applicationId: string = process.env.application_id!;
if (!applicationId) throw new Error('App ID not found in environment! Please add it to your .env file.');

const token: string = process.env.token!;
if (!token) throw new Error('Token not found in environment! Please add it to your .env file.');


export {
  projectRootPath,
  devMode,
  testingGuild,
  applicationId,
  token
};
