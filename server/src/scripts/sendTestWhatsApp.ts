/**
 * Send test message to +918149196845
 */

import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_KEY = process.env.INTERAKT_SECRET_KEY;
const BASE_URL = 'https://api.interakt.ai/v1/public';

async function sendTestMessage() {
    const phoneNumber = '+918149196845';
    
    console.log('Sending WhatsApp test message...');
    console.log('Phone:', phoneNumber);
    console.log('Template: thank_you_message_9z');
    console.log('');
    
    try {
        const payload = {
            fullPhoneNumber: phoneNumber,
            callbackData: 'manual_test',
            type: 'Template',
            template: {
                name: 'thank_you_message_9z',
                languageCode: 'en',
                bodyValues: [],
                headerValues: []
            }
        };
        
        const response = await axios.post(`${BASE_URL}/message/`, payload, {
            headers: {
                'Authorization': `Basic ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Message sent successfully!');
        console.log('Message ID:', response.data.id);
        console.log('Result:', response.data.result);
        console.log('');
        console.log('Check your WhatsApp on +918149196845');
        console.log('Also check Interakt dashboard for delivery status');
        
    } catch (error: any) {
        console.log('❌ Failed to send message');
        console.log('Error:', error.response?.data || error.message);
    }
}

sendTestMessage();
