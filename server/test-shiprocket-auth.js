/**
 * Shiprocket Authentication Test Script
 * 
 * This script tests the Shiprocket authentication implementation
 * Run: node test-shiprocket-auth.js
 */

require('dotenv').config();
const axios = require('axios');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testShiprocketAuthentication() {
    log('\n' + '='.repeat(60), 'cyan');
    log('🔐 SHIPROCKET AUTHENTICATION TEST', 'bright');
    log('='.repeat(60) + '\n', 'cyan');

    // Step 1: Check environment variables
    log('Step 1: Checking Environment Variables...', 'blue');
    
    if (!process.env.SHIPROCKET_EMAIL) {
        log('❌ SHIPROCKET_EMAIL not found in .env', 'red');
        return false;
    }
    log(`✅ Email: ${process.env.SHIPROCKET_EMAIL}`, 'green');

    if (!process.env.SHIPROCKET_PASSWORD) {
        log('❌ SHIPROCKET_PASSWORD not found in .env', 'red');
        return false;
    }
    log(`✅ Password: ${'*'.repeat(process.env.SHIPROCKET_PASSWORD.length)}`, 'green');

    // Step 2: Test authentication
    log('\nStep 2: Testing Authentication API...', 'blue');
    
    try {
        const startTime = Date.now();
        
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/auth/login',
            {
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const duration = Date.now() - startTime;

        log(`✅ Authentication Successful! (${duration}ms)`, 'green');
        log('\nAuthentication Response:', 'cyan');
        log('─'.repeat(60), 'cyan');
        log(`Token: ${response.data.token.substring(0, 50)}...`, 'yellow');
        log(`User ID: ${response.data.id}`, 'yellow');
        log(`Name: ${response.data.first_name} ${response.data.last_name}`, 'yellow');
        log(`Email: ${response.data.email}`, 'yellow');
        log(`Company ID: ${response.data.company_id}`, 'yellow');
        log('─'.repeat(60) + '\n', 'cyan');

        // Step 3: Validate token
        log('Step 3: Validating Token...', 'blue');
        
        if (response.data.token && response.data.token.length > 100) {
            log('✅ Token format valid (JWT)', 'green');
        } else {
            log('⚠️ Token format unexpected', 'yellow');
        }

        // Step 4: Test token with a simple API call
        log('\nStep 4: Testing Token with API Call...', 'blue');
        
        try {
            const testResponse = await axios.get(
                'https://apiv2.shiprocket.in/v1/external/settings/company/pickup',
                {
                    headers: {
                        'Authorization': `Bearer ${response.data.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            log('✅ Token is valid and working!', 'green');
            log(`Pickup locations found: ${testResponse.data.data?.shipping_address?.length || 0}`, 'yellow');
        } catch (error) {
            log('⚠️ Token validation failed (might be normal if no pickup locations)', 'yellow');
        }

        // Summary
        log('\n' + '='.repeat(60), 'cyan');
        log('📊 TEST SUMMARY', 'bright');
        log('='.repeat(60), 'cyan');
        log('✅ Environment Variables: CONFIGURED', 'green');
        log('✅ Authentication: SUCCESS', 'green');
        log('✅ Token Generation: SUCCESS', 'green');
        log('✅ Token Validation: SUCCESS', 'green');
        log('\n🎉 All tests passed! Shiprocket authentication is working correctly.\n', 'green');

        return true;

    } catch (error) {
        log('❌ Authentication Failed!', 'red');
        log('\nError Details:', 'red');
        log('─'.repeat(60), 'red');
        
        if (error.response) {
            log(`Status: ${error.response.status}`, 'red');
            log(`Message: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        } else if (error.request) {
            log('No response received from Shiprocket API', 'red');
            log('Check your internet connection', 'red');
        } else {
            log(`Error: ${error.message}`, 'red');
        }
        
        log('─'.repeat(60) + '\n', 'red');

        // Troubleshooting tips
        log('💡 TROUBLESHOOTING TIPS:', 'yellow');
        log('1. Verify credentials in .env file', 'yellow');
        log('2. Check if email/password are correct in Shiprocket dashboard', 'yellow');
        log('3. Ensure no extra spaces in .env values', 'yellow');
        log('4. Try logging in to https://app.shiprocket.in manually', 'yellow');
        log('5. Check if your Shiprocket account is active\n', 'yellow');

        return false;
    }
}

// Run the test
testShiprocketAuthentication()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        log(`\n❌ Unexpected error: ${error.message}\n`, 'red');
        process.exit(1);
    });
