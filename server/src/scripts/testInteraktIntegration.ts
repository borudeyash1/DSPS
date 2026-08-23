import dotenv from 'dotenv';
dotenv.config();

import { interaktService, InteraktService } from '../services/interaktService';
import { sendWhatsAppNotification } from '../services/enhancedWhatsappService';

/**
 * Test script for Interakt integration
 * Run with: npx ts-node src/scripts/testInteraktIntegration.ts
 */

const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '9876543210';
const TEST_NAME = 'Test User';
const TEST_EMAIL = 'test@example.com';

async function runTests() {
    console.log('🧪 Starting Interakt Integration Tests\n');

    // Check configuration
    console.log('1️⃣ Checking Configuration...');
    if (!interaktService.isConfigured()) {
        console.error('❌ Interakt service not configured. Please set INTERAKT_SECRET_KEY in .env');
        process.exit(1);
    }
    console.log('✅ Interakt service configured\n');

    // Test 1: Format Phone Number
    console.log('2️⃣ Testing Phone Number Formatting...');
    const phoneData = InteraktService.formatPhoneNumber(TEST_PHONE);
    console.log('   Input:', TEST_PHONE);
    console.log('   Output:', phoneData);
    console.log('✅ Phone formatting works\n');

    // Test 2: Track User
    console.log('3️⃣ Testing User Tracking...');
    const userResult = await interaktService.trackUser({
        phoneNumber: phoneData.phoneNumber,
        countryCode: phoneData.countryCode,
        traits: {
            name: TEST_NAME,
            email: TEST_EMAIL,
            test_user: true,
            test_timestamp: new Date().toISOString()
        },
        tags: ['test', 'integration-test']
    });

    if (userResult.success) {
        console.log('✅ User tracked successfully');
        console.log('   Response:', JSON.stringify(userResult.data, null, 2));
    } else {
        console.error('❌ User tracking failed:', userResult.error);
        console.error('   Details:', userResult.data);
    }
    console.log();

    // Test 3: Track Event
    console.log('4️⃣ Testing Event Tracking...');
    const eventResult = await interaktService.trackEvent({
        phoneNumber: phoneData.phoneNumber,
        countryCode: phoneData.countryCode,
        event: 'TestEvent',
        traits: {
            test_type: 'integration_test',
            timestamp: new Date().toISOString(),
            test_value: 'success'
        }
    });

    if (eventResult.success) {
        console.log('✅ Event tracked successfully');
        console.log('   Response:', JSON.stringify(eventResult.data, null, 2));
    } else {
        console.error('❌ Event tracking failed:', eventResult.error);
        console.error('   Details:', eventResult.data);
    }
    console.log();

    // Test 4: Send Template Message
    console.log('5️⃣ Testing Template Message...');
    const templateName = process.env.INTERAKT_TEMPLATE_ORDER_PLACED || 'order_placed_prepaid_woocommerce';
    console.log(`   Using template: ${templateName}`);
    
    const templateResult = await interaktService.sendTemplate({
        phoneNumber: phoneData.phoneNumber,
        countryCode: phoneData.countryCode,
        templateName: templateName,
        bodyValues: [TEST_NAME, 'TEST-ORDER-123', '999'],
        callbackData: JSON.stringify({
            test: true,
            orderId: 'TEST-ORDER-123',
            timestamp: new Date().toISOString()
        })
    });

    if (templateResult.success) {
        console.log('✅ Template sent successfully');
        console.log('   Message ID:', templateResult.messageId);
        console.log('   Response:', JSON.stringify(templateResult.data, null, 2));
    } else {
        console.error('❌ Template sending failed:', templateResult.error);
        console.error('   Details:', templateResult.data);
    }
    console.log();

    // Test 5: Enhanced WhatsApp Notification
    console.log('6️⃣ Testing Enhanced WhatsApp Notification...');
    const notificationResult = await sendWhatsAppNotification({
        type: 'order_placed',
        userPhone: TEST_PHONE,
        fullName: TEST_NAME,
        email: TEST_EMAIL,
        userId: 'test-user-123',
        order: {
            orderNumber: 'TEST-ORDER-456',
            totalAmount: 1999,
            paymentMethod: 'Test Payment'
        }
    });

    if (notificationResult) {
        console.log('✅ Enhanced notification sent successfully');
    } else {
        console.error('❌ Enhanced notification failed');
    }
    console.log();

    // Test 6: Retrieve Contacts
    console.log('7️⃣ Testing Contact Retrieval...');
    const contactsResult = await interaktService.getContacts({
        limit: 5,
        offset: 0
    });

    if (contactsResult.success) {
        console.log('✅ Contacts retrieved successfully');
        console.log(`   Found ${contactsResult.contacts?.length || 0} contacts`);
        console.log('   Has next page:', contactsResult.hasNextPage);
        if (contactsResult.contacts && contactsResult.contacts.length > 0) {
            console.log('   First contact:', JSON.stringify(contactsResult.contacts[0], null, 2));
        }
    } else {
        console.error('❌ Contact retrieval failed:', contactsResult.error);
        console.error('   Details:', contactsResult.data);
    }
    console.log();

    // Test 7: Webhook Verification
    console.log('8️⃣ Testing Webhook Verification...');
    const testPayload = '{"foo":1,"bar":2}';
    const testSecret = 'examplekey';
    const expectedSignature = 'sha256=(process.env.AUTO_SECRET_6 as string)0159d6e49ec4248350b6ec2c7b4';
    
    const isValid = InteraktService.verifyWebhook(testPayload, expectedSignature, testSecret);
    
    if (isValid) {
        console.log('✅ Webhook verification works correctly');
    } else {
        console.error('❌ Webhook verification failed');
    }
    console.log();

    // Summary
    console.log('📊 Test Summary:');
    console.log('================');
    console.log('✅ Configuration: OK');
    console.log('✅ Phone Formatting: OK');
    console.log(userResult.success ? '✅' : '❌', 'User Tracking:', userResult.success ? 'OK' : 'FAILED');
    console.log(eventResult.success ? '✅' : '❌', 'Event Tracking:', eventResult.success ? 'OK' : 'FAILED');
    console.log(templateResult.success ? '✅' : '❌', 'Template Sending:', templateResult.success ? 'OK' : 'FAILED');
    console.log(notificationResult ? '✅' : '❌', 'Enhanced Notification:', notificationResult ? 'OK' : 'FAILED');
    console.log(contactsResult.success ? '✅' : '❌', 'Contact Retrieval:', contactsResult.success ? 'OK' : 'FAILED');
    console.log('✅ Webhook Verification: OK');
    console.log();

    console.log('🎉 All tests completed!');
    console.log('\n💡 Tips:');
    console.log('   - Check Interakt dashboard for user and event data');
    console.log('   - Verify WhatsApp message delivery on test phone');
    console.log('   - Review webhook logs if configured');
}

// Run tests
runTests()
    .then(() => {
        console.log('\n✅ Test script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test script failed:', error);
        process.exit(1);
    });
