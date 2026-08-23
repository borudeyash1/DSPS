require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('--- Testing Brevo SMTP Configuration ---');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    // Be careful not to log the full password in production logs if possible, but for this debug we need to know if it's read
    console.log('SMTP_PASSWORD Length:', process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.length : 'MISSING');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error('❌ Missing required environment variables');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        debug: true, // Enable debug logs
        logger: true // Enable logger
    });

    try {
        console.log('Attempting to verify connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Verified Successfully');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: 'borudeyash12@gmail.com', // User's email from context
            subject: 'Test Email from Botam Production Server',
            text: 'This is a test email to verify SMTP configuration on the production server.',
            html: '<b>This is a test email</b> to verify SMTP configuration on the production server.'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('❌ Email Test Failed:');
        console.error(error);
    }
}

testEmail();
