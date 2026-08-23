import dotenv from 'dotenv';
import { sendWhatsAppNotification } from '../src/services/whatsappNotificationService';

dotenv.config();

/**
 * Comprehensive test for all order lifecycle WhatsApp notifications
 * Phone: 7507974511
 */
async function testAllOrderNotifications() {
    console.log('🧪 Testing All Order Lifecycle WhatsApp Notifications\n');
    console.log('='.repeat(70));

    const testPhone = '7507974511';
    const testOrderNumber = '#TEST456';
    const testName = 'Yash';

    console.log(`📱 Target Phone: ${testPhone}`);
    console.log(`👤 Customer Name: ${testName}`);
    console.log(`📦 Order Number: ${testOrderNumber}\n`);
    console.log('='.repeat(70));

    // Test 1: Order Placed
    console.log('\n1️⃣ Testing ORDER PLACED notification...');
    try {
        await sendWhatsAppNotification({
            type: 'order_placed',
            userPhone: testPhone,
            fullName: testName,
            order: {
                orderNumber: testOrderNumber
            }
        });
        console.log('✅ Order placed notification sent\n');
        await sleep(2000);
    } catch (error: any) {
        console.error('❌ Failed:', error.message);
    }

    // Test 2: Order Shipped
    console.log('2️⃣ Testing ORDER SHIPPED notification...');
    try {
        await sendWhatsAppNotification({
            type: 'order_shipped',
            userPhone: testPhone,
            fullName: testName,
            order: {
                orderNumber: testOrderNumber,
                trackingNumber: 'TRK123456789',
                estimatedDelivery: '2-3 days'
            }
        });
        console.log('✅ Order shipped notification sent\n');
        await sleep(2000);
    } catch (error: any) {
        console.error('❌ Failed:', error.message);
    }

    // Test 3: Out for Delivery (with OTP)
    console.log('3️⃣ Testing OUT FOR DELIVERY notification (with OTP)...');
    try {
        await sendWhatsAppNotification({
            type: 'out_for_delivery',
            userPhone: testPhone,
            fullName: testName,
            order: {
                orderNumber: testOrderNumber
            },
            otp: '123456'
        });
        console.log('✅ Out for delivery notification sent (with OTP)\n');
        await sleep(2000);
    } catch (error: any) {
        console.error('❌ Failed:', error.message);
    }

    // Test 4: Order Delivered
    console.log('4️⃣ Testing ORDER DELIVERED notification...');
    try {
        await sendWhatsAppNotification({
            type: 'order_delivered',
            userPhone: testPhone,
            fullName: testName,
            order: {
                orderNumber: testOrderNumber
            }
        });
        console.log('✅ Order delivered notification sent\n');
        await sleep(2000);
    } catch (error: any) {
        console.error('❌ Failed:', error.message);
    }

    // Test 5: Order Cancelled
    console.log('5️⃣ Testing ORDER CANCELLED notification...');
    try {
        await sendWhatsAppNotification({
            type: 'order_cancelled',
            userPhone: testPhone,
            fullName: testName,
            order: {
                orderNumber: testOrderNumber
            }
        });
        console.log('✅ Order cancelled notification sent\n');
    } catch (error: any) {
        console.error('❌ Failed:', error.message);
    }

    console.log('='.repeat(70));
    console.log('\n✅ All tests completed!');
    console.log('\n📱 Check your phone (7507974511) for the messages');
    console.log('   You should have received 5 WhatsApp notifications\n');
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the tests
testAllOrderNotifications()
    .then(() => {
        console.log('✅ Test suite completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });
