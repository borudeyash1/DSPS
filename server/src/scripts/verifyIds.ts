
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const serverId = process.env.GOOGLE_CLIENT_ID || '';
console.log('Server Client ID:', serverId.substring(0, 15) + '...' + serverId.slice(-5));

// Read client .env
const clientEnvPath = path.resolve(__dirname, '../../../client/.env');
let clientId = '';

try {
    const clientEnv = fs.readFileSync(clientEnvPath, 'utf8');
    const match = clientEnv.match(/VITE_GOOGLE_CLIENT_ID=(.*)/);
    if (match) {
        clientId = match[1].trim();
    }
} catch (e) {
    console.log('Could not read client .env');
}

console.log('Client Client ID:', clientId.substring(0, 15) + '...' + clientId.slice(-5));

if (serverId === clientId && serverId.length > 0) {
    console.log('✅ IDs Match');
} else {
    console.log('❌ IDs Do Not Match or are empty');
}
