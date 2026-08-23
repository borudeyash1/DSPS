/**
 * Simple WhatsApp Test - Send one message
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { interaktWhatsAppService } from '../services/interaktWhatsappService';

async function quickTest() {
    console.log('Testing WhatsApp with phone: 8149196845');
    
    const result = await interaktWhatsAppService.sendTemplateMessage(
        '8149196845',
        'order_confirmation_74',
        'en',
        ['TEST123']
    );
    
    console.log('Result:', JSON.stringify(result, null, 2));
}

quickTest().catch(console.error);
