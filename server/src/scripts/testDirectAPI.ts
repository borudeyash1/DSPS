/**
 * Test different template configurations
 */

import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_KEY = process.env.INTERAKT_SECRET_KEY;
const BASE_URL = 'https://api.interakt.ai/v1/public';

async function testDirectAPI() {
    console.log('Testing Direct Interakt API Call');
    console.log('================================\n');
    
    const phoneNumber = '+918149196845';
    
    const sampleImage = 'https://botanapparels.com/assets/logo.png'; // Use a valid image URL

    // Test 1: Template with 4 variables + Header Image
    console.log('Test 1: order_placed_prepaid_woocommerce (4 vars + image)');
    try {
        const payload1 = {
            fullPhoneNumber: phoneNumber,
            callbackData: 'test1',
            type: 'Template',
            template: {
                name: 'order_placed_prepaid_woocommerce',
                languageCode: 'en',
                bodyValues: ['Suraj', '#ORDER123', '₹999', '27 Jan 2026'],
                headerValues: [sampleImage]
            }
        };
        
        console.log('Payload:', JSON.stringify(payload1, null, 2));
        
        const response1 = await axios.post(`${BASE_URL}/message/`, payload1, {
            headers: {
                'Authorization': `Basic ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Success!');
        console.log('Response:', JSON.stringify(response1.data, null, 2));
    } catch (error: any) {
        console.log('❌ Failed!');
        console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n---\n');
    
    // Test 2: Template with 2 variables + Header Image
    console.log('Test 2: order_placed_prepaid_woocommerce (2 vars + image)');
    try {
        const payload2 = {
            fullPhoneNumber: phoneNumber,
            callbackData: 'test2',
            type: 'Template',
            template: {
                name: 'order_placed_prepaid_woocommerce',
                languageCode: 'en',
                bodyValues: ['TEST123', 'Suraj'],
                headerValues: [sampleImage]
            }
        };
        
        console.log('Payload:', JSON.stringify(payload2, null, 2));
        
        const response2 = await axios.post(`${BASE_URL}/message/`, payload2, {
            headers: {
                'Authorization': `Basic ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Success!');
        console.log('Response:', JSON.stringify(response2.data, null, 2));
    } catch (error: any) {
        console.log('❌ Failed!');
        console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n---\n');
    
    // Test 3: Template with 3 variables + Header Image
    console.log('Test 3: order_placed_prepaid_woocommerce (3 vars + image)');
    try {
        const payload3 = {
            fullPhoneNumber: phoneNumber,
            callbackData: 'test3',
            type: 'Template',
            template: {
                name: 'order_placed_prepaid_woocommerce',
                languageCode: 'en',
                bodyValues: ['Suraj', 'TEST123', 'http://track.me'],
                headerValues: [sampleImage]
            }
        };
        
        console.log('Payload:', JSON.stringify(payload3, null, 2));
        
        const response3 = await axios.post(`${BASE_URL}/message/`, payload3, {
            headers: {
                'Authorization': `Basic ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Success!');
        console.log('Response:', JSON.stringify(response3.data, null, 2));
    } catch (error: any) {
        console.log('❌ Failed!');
        console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n================================');
    console.log('Test Complete');
}

testDirectAPI().catch(console.error);
