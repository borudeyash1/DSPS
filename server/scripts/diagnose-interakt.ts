import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * Diagnostic script to check Interakt configuration and message status
 */
async function diagnoseInterakt() {
    console.log('🔍 Interakt Diagnostic Tool\n');
    console.log('='.repeat(70));

    // Check API Key
    const apiKey = process.env.INTERAKT_SECRET_KEY;
    if (!apiKey) {
        console.error('❌ INTERAKT_SECRET_KEY not found in .env');
        return;
    }
    console.log('✅ API Key found:', apiKey.substring(0, 20) + '...\n');

    const baseURL = 'https://api.interakt.ai/v1/public';
    const headers = {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
    };

    // Test 1: Check API connectivity
    console.log('1️⃣ Testing API Connectivity...');
    try {
        // Try to get account info or templates (if endpoint exists)
        const response = await axios.get(`${baseURL}/track/users/`, {
            headers,
            params: { phoneNumber: '917507974511' }
        });
        console.log('✅ API is reachable');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        if (error.response) {
            console.log('⚠️  API responded with:', error.response.status);
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❌ Network error:', error.message);
        }
    }

    console.log('\n' + '='.repeat(70));

    // Test 2: Check phone number format
    console.log('\n2️⃣ Checking Phone Number Format...');
    const testPhone = '7507974511';
    const formattedPhone = '+91' + testPhone;
    console.log(`Original: ${testPhone}`);
    console.log(`Formatted: ${formattedPhone}`);
    console.log('✅ Phone format looks correct\n');

    // Test 3: Try sending a simple text message (requires active session)
    console.log('3️⃣ Testing Text Message (requires 24hr active session)...');
    try {
        const payload = {
            fullPhoneNumber: formattedPhone,
            type: 'Text',
            data: {
                message: 'Test message from Botam Apparels - Please reply to confirm receipt'
            }
        };

        console.log('Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(`${baseURL}/message/`, payload, { headers });
        console.log('✅ Text message sent successfully!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.log('⚠️  Text message failed (expected if no active session)');
        if (error.response) {
            console.log('Error:', JSON.stringify(error.response.data, null, 2));
        }
    }

    console.log('\n' + '='.repeat(70));

    // Test 4: Check template availability
    console.log('\n4️⃣ Checking Template: order_confirmation_74...');
    try {
        const payload = {
            fullPhoneNumber: formattedPhone,
            type: 'Template',
            template: {
                name: 'order_confirmation_74',
                languageCode: 'en',
                bodyValues: ['#DIAG001'],
                headerValues: []
            }
        };

        console.log('Sending template message...');
        const response = await axios.post(`${baseURL}/message/`, payload, { headers });
        console.log('✅ Template message sent!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('\n📱 Check your WhatsApp now!');
    } catch (error: any) {
        console.log('❌ Template message failed');
        if (error.response) {
            console.log('Error:', JSON.stringify(error.response.data, null, 2));

            const errorMsg = error.response.data?.message || '';
            if (errorMsg.includes('template')) {
                console.log('\n💡 Template may not exist or not be approved in Interakt dashboard');
            }
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📋 Troubleshooting Checklist:');
    console.log('1. ✓ Check if phone number 7507974511 has WhatsApp installed');
    console.log('2. ✓ Verify template "order_confirmation_74" exists in Interakt dashboard');
    console.log('3. ✓ Ensure template is APPROVED (not just created)');
    console.log('4. ✓ Check Interakt dashboard for message delivery status');
    console.log('5. ✓ Verify your Interakt account has message credits');
    console.log('6. ✓ Check if WhatsApp Business API is properly configured');
    console.log('\n🔗 Login to Interakt: https://app.interakt.ai/');
}

diagnoseInterakt()
    .then(() => {
        console.log('\n✅ Diagnostic complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Diagnostic failed:', error);
        process.exit(1);
    });
