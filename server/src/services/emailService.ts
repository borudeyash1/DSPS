import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const emailPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const emailUser = process.env.SMTP_USER;
const emailPassword = process.env.SMTP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || 'Botam Apparels <noreply@botamapparels.com>';

// Check if email credentials are configured
const isEmailConfigured = Boolean(emailUser && emailPassword);

// Only create transporter if email is configured
const transporter = isEmailConfigured
  ? nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    debug: true, // Enable debug logs
    logger: true // Enable logger
  })
  : null;

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    console.log('📧 Attempting to send email to:', options.to);
    console.log('📧 SMTP Config Status:', {
      host: emailHost,
      port: emailPort,
      user: emailUser ? 'SET' : 'MISSING',
      isConfigured: isEmailConfigured,
      hasTransporter: !!transporter
    });

    // If email is not configured, log warning and skip sending
    if (!isEmailConfigured || !transporter) {
      console.warn('⚠️  Email service not configured. Skipping email send.');
      console.warn('⚠️  To enable email, set EMAIL_USER and EMAIL_PASSWORD in your .env file');
      return; // Return without error to allow registration to continue
    }

    const mailOptions = {
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    // verify connection configuration
    try {
      await transporter.verify();
      console.log('✅ SMTP Connection Verified');
    } catch (verifyError: any) {
      console.error('❌ SMTP Connection Verification Failed:', verifyError.message);
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.to}`);
    
    // Increment daily usage count
    try {
        const { incrementEmailCount } = await import('./emailUsageService');
        await incrementEmailCount();
    } catch (metricError) {
        console.error('Failed to increment email metric:', metricError);
        // Don't fail the email send just because metric failed
    }
  } catch (error: any) {
    console.error(`❌ Error sending email to ${options.to}:`, error.message);
    console.error('Full error:', error);
    throw new Error('Failed to send email');
  }
};

// Export function to check if email is configured
export const isEmailServiceConfigured = (): boolean => {
  return isEmailConfigured;
};

// Email templates
// Email templates
export const getOTPEmailTemplate = (otp: string, fullName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .otp-box { background-color: #fff; border: 2px solid #000; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Botam Apparels</h1>
        </div>
        <div class="content">
          <h2>Hello ${fullName},</h2>
          <p>Thank you for registering with Botam Apparels. Please use the following OTP to verify your email address:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Botam Apparels. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getPasswordResetEmailTemplate = (otp: string, fullName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .otp-box { background-color: #fff; border: 2px solid #E63946; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #E63946; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Botam Apparels</h1>
        </div>
        <div class="content">
          <h2>Hello ${fullName},</h2>
          <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p><strong>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Botam Apparels. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getOrderEmailTemplate = (title: string, message: string, order: any, otp?: string): string => {
  const itemsHtml = order.items.map((item: any) => `
    <div style="display: flex; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
      ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />` : ''}
      <div>
        <div style="font-weight: bold;">${item.name}</div>
        <div style="font-size: 12px; color: #666;">Quantity: ${item.quantity} | Price: ₹${item.price}</div>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
        .content { background-color: #fff; padding: 30px; border: 1px solid #eee; }
        .order-info { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .otp-box { background-color: #e8f5e9; border: 1px solid #4caf50; padding: 15px; text-align: center; margin: 20px 0; border-radius: 4px; }
        .otp-code { font-size: 24px; font-weight: bold; color: #2e7d32; letter-spacing: 2px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Botam Apparels</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          <p>${message}</p>
          
          <div class="order-info">
            <strong>Order #${order.orderNumber || order.orderId}</strong><br/>
            Date: ${new Date(order.date).toLocaleDateString()}<br/>
            Total: <strong>₹${order.total}</strong>
          </div>

          ${otp ? `
          <div class="otp-box">
             <div style="font-size: 14px; margin-bottom: 5px;">Your Delivery Security Code (OTP)</div>
             <div class="otp-code">${otp}</div>
             <div style="font-size: 12px; margin-top: 5px;">Please share this code with the delivery agent only.</div>
          </div>
          ` : ''}

          <h3>Items</h3>
          ${itemsHtml}

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <strong>Shipping Address:</strong><br/>
            ${order.shippingAddress.street}, ${order.shippingAddress.city}<br/>
            ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
          </div>

          <center><a href="https://botamapparels.com/account/orders" class="button">View Order</a></center>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Botam Apparels. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getGenericEmailTemplate = (title: string, message: string, fullName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Botam Apparels</h1>
        </div>
        <div class="content">
          <h2>Hello ${fullName},</h2>
          <p>${message}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Botam Apparels. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getEmailContent = (data: any): { subject: string, html: string } => {
  switch (data.type) {
    case 'registration':
      return {
        subject: 'Verify your email - Botam Apparels',
        html: getOTPEmailTemplate(data.otp, data.fullName)
      };
    case 'login_otp':
      return {
        subject: 'Login OTP - Botam Apparels',
        html: getOTPEmailTemplate(data.otp, data.fullName)
      };
    case 'password_reset_link':
      return {
        subject: 'Reset Password - Botam Apparels',
        html: getGenericEmailTemplate('Reset Password', `Click here to reset: ${data.resetLink}`, data.fullName) // Placeholder as logic might differ
      };
    case 'password_change_otp':
      return {
        subject: 'Password Change OTP - Botam Apparels',
        html: getPasswordResetEmailTemplate(data.otp, data.fullName)
      };
    case 'password_changed':
      return {
        subject: 'Password Changed - Botam Apparels',
        html: getGenericEmailTemplate('Password Changed', 'Your password has been changed successfully. If this wasn\'t you, please contact support immediately.', data.fullName)
      };
    case 'order_placed':
      return {
        subject: `Order Confirmed ${data.order.orderNumber} - Botam Apparels`,
        html: getOrderEmailTemplate('Order Confirmed', 'Thank you for your order! We are processing it.', data.order)
      };
    case 'order_shipped':
      return {
        subject: `Order Shipped ${data.order.orderNumber} - Botam Apparels`,
        html: getOrderEmailTemplate('Order Shipped', 'Your order generates excitement! It has been shipped.', data.order)
      };
    case 'out_for_delivery':
      return {
        subject: `Out for Delivery ${data.order.orderNumber} - Botam Apparels`,
        html: getOrderEmailTemplate('Out for Delivery', 'Your order is out for delivery. Get ready!', data.order, data.otp)
      };
    case 'order_delivered':
      return {
        subject: `Order Delivered ${data.order.orderNumber} - Botam Apparels`,
        html: getOrderEmailTemplate('Order Delivered', 'Your order has been delivered. We hope you love it!', data.order)
      };
    case 'order_cancelled':
      return {
        subject: `Order Cancelled ${data.order.orderNumber} - Botam Apparels`,
        html: getOrderEmailTemplate('Order Cancelled', 'Your order has been cancelled.', data.order)
      };
    default:
      return {
        subject: 'Notification from Botam Apparels',
        html: getGenericEmailTemplate('Notification', 'You have a new notification.', data.fullName || 'User')
      };
  }
};
