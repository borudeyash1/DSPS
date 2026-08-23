import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function testOrderConfirmation74() {
    const apiKey = process.env.INTERAKT_SECRET_KEY;
    const baseURL = 'https://api.interakt.ai/v1/public';

    console.log('🧪 Testing APPROVED Template: order_confirmation_74\n');
    console.log('='.repeat(70));

    // This template is approved and should work!
    // Let's test with minimal parameters first
    const payload = {
        fullPhoneNumber: '+917507974511',
        type: 'Template',
        template: {
            name: 'order_confirmation_74',
            languageCode: 'en',
            bodyValues: ['#TEST123']  // Just order number
        }
    };

    console.log('📋 Template: order_confirmation_74 (APPROVED)');
    console.log('📱 Phone: 7507974511');
    console.log('📦 Order: #TEST123\n');
    console.log('Payload:', JSON.stringify(payload, null, 2), '\n');
    console.log('='.repeat(70));

    try {
        const response = await axios.post(`${baseURL}/message/`, payload, {
            headers: {
                'Authorization': `Basic ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('\n' + '='.repeat(70));
        console.log('✅ SUCCESS! WhatsApp Message Sent!');
        console.log('='.repeat(70));
        console.log('\nResponse:', JSON.stringify(response.data, null, 2));
        console.log('\n📱 CHECK YOUR PHONE (7507974511) NOW!');
        console.log('\nYou should receive a WhatsApp message about order #TEST123');
        console.log('='.repeat(70));

    } catch (error: any) {
        console.log('\n' + '='.repeat(70));
        console.log('❌ FAILED!');
        console.log('='.repeat(70));
        if (error.response) {
            console.log('\nStatus:', error.response.status);
            console.log('Error:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('\nError:', error.message);
        }
        console.log('='.repeat(70));
    }
}

testOrderConfirmation74();
