import * as dotenv from 'dotenv';
dotenv.config();

const token = process.env.token;
if (!token) throw new Error('Token not found in environment! Please add it to your .env file.');

export { token };
