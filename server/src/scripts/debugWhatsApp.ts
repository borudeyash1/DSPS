/**
 * Debug WhatsApp Test - Check detailed response
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { interaktWhatsAppService } from '../services/interaktWhatsappService';

async function debugTest() {
    console.log('='.repeat(60));
    console.log('WhatsApp Integration Debug Test');
    console.log('='.repeat(60));
    console.log('');
    
    console.log('1. Checking Configuration...');
    console.log('   API Key:', process.env.INTERAKT_SECRET_KEY ? '✅ Set' : '❌ Missing');
    console.log('   Service Ready:', interaktWhatsAppService.isReady() ? '✅ Yes' : '❌ No');
    console.log('');
    
    console.log('2. Testing Template Message...');
    console.log('   Phone: 8149196845');
    console.log('   Template: order_confirmation_74');
    console.log('   Variables: ["#TEST123"]');
    console.log('');
    
    try {
        const result = await interaktWhatsAppService.sendTemplateMessage(
            '8149196845',
            'order_confirmation_74',
            'en',
            ['#TEST123']
        );
        
        console.log('3. Response Details:');
        console.log('   Success:', result.success);
        
        if (result.success) {
            console.log('   ✅ Message sent successfully!');
            console.log('   Message ID:', result.data?.id);
            console.log('   Full Response:', JSON.stringify(result.data, null, 2));
        } else {
            console.log('   ❌ Message failed!');
            console.log('   Error:', result.error);
            console.log('   Error Data:', JSON.stringify(result.data, null, 2));
        }
        
    } catch (error: any) {
        console.log('   ❌ Exception occurred!');
        console.log('   Error:', error.message);
        console.log('   Stack:', error.stack);
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('Debug Test Complete');
    console.log('='.repeat(60));
}

debugTest().catch(console.error);
