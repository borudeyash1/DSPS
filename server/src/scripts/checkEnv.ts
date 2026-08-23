
import dotenv from 'dotenv';
dotenv.config();

console.log('--- ENV CHECK ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('GOOGLE_CLIENT_ID Present:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_ID Length:', process.env.GOOGLE_CLIENT_ID?.length);
console.log('GOOGLE_CLIENT_SECRET Present:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('GOOGLE_CLIENT_SECRET Length:', process.env.GOOGLE_CLIENT_SECRET?.length);
console.log('-----------------');
