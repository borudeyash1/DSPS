# HDFC SmartGateway Migration Guide

## Overview
This document outlines the migration from Razorpay to HDFC SmartGateway payment gateway integration.

## Changes Made

### 1. Environment Variables (.env)
**Removed:**
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

**Added:**
- `HDFC_SmartGateway_API_KEY` - HDFC API Key
- `HDFC_MERCHANT_ID` - Merchant ID (SG3004)
- `HDFC_PAYMENT_PAGE_CLIENT_ID` - Payment page client ID
- `HDFC_BASE_URL` - HDFC SmartGateway base URL
- `HDFC_RESPONSE_KEY` - Response verification key
- `HDFC_ENABLE_LOGGING` - Enable/disable logging (true/false)

### 2. Key Configuration (✅ COMPLETED)
The following keys have been configured in `.env` and `server/keys/`:
- **API Key**: Configured in `.env`
- **Merchant ID**: Configured in `.env`
- **Client ID**: Configured in `.env`
- **JWE Keys**:
  - Public Key: `server/keys/public.pem`
  - Private Key: `server/keys/private.pem`
  - Key UUID: Configured in `.env`

**Authentication Mode**: Real JWE Authentication (Production Ready)

### 3. Files Created
- `src/utils/hdfcSmartGateway.ts` - HDFC payment gateway utility functions

### 4. Files Modified
- `src/controllers/paymentController.ts` - Updated to use HDFC functions
- `src/controllers/paymentSettingsController.ts` - Updated payment settings
- `src/models/PaymentSettings.ts` - Updated model schema
- `src/routes/orders.ts` - Updated payment routes
- `src/types/index.ts` - Updated payment details interface

### 5. Files Removed
- `src/utils/razorpay.ts` - Removed Razorpay utility

### 6. Dependencies
- **Removed:** `razorpay` package
- **Required:** `axios` (already installed)

## API Endpoint Changes

### Old Endpoints (Razorpay)
```
POST /api/orders/payment/create-razorpay-order
POST /api/orders/payment/verify
```

### New Endpoints (HDFC)
```
POST /api/orders/payment/create-hdfc-order
POST /api/orders/payment/verify
```

## Request/Response Changes

### Create Order Request
**Old (Razorpay):**
```json
{
  "amount": 1000,
  "currency": "INR"
}
```

**New (HDFC):**
```json
{
  "amount": 1000,
  "currency": "INR",
  "customerInfo": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "9876543210"
  }
}
```

### Create Order Response
**Old (Razorpay):**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xyz",
    "amount": 100000,
    "currency": "INR",
    "receipt": "ord_12345678_87654321"
  }
}
```

**New (HDFC):**
```json
{
  "success": true,
  "data": {
    "orderId": "SG3004_ord_12345678_87654321_1234567890",
    "amount": 100000,
    "currency": "INR",
    "receipt": "ord_12345678_87654321",
    "paymentUrl": "https://smartgateway.hdfcuat.bank.in/payment/...",
    "transactionId": "TXN123456"
  }
}
```

### Verify Payment Request
**Old (Razorpay):**
```json
{
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_abc",
  "razorpay_signature": "signature_hash"
}
```

**New (HDFC):**
```json
{
  "orderId": "SG3004_ord_12345678_87654321_1234567890",
  "transactionId": "TXN123456",
  "status": "SUCCESS",
  "signature": "signature_hash"
}
```

## Database Schema Changes

### PaymentSettings Collection
**Old Fields:**
- `razorpayEnabled` (Boolean)
- `razorpayKeyId` (String)
- `razorpayKeySecret` (String)

**New Fields:**
- `hdfcEnabled` (Boolean)
- `hdfcMerchantId` (String)
- `hdfcApiKey` (String)
- `hdfcResponseKey` (String)

### Order Collection - paymentDetails
**Old Fields:**
```typescript
paymentDetails?: {
  paymentId?: string;      // Razorpay payment ID
  orderId?: string;        // Razorpay order ID
  signature?: string;      // Razorpay signature
  method?: string;
  paidAt?: Date;
}
```

**New Fields:**
```typescript
paymentDetails?: {
  transactionId?: string;  // HDFC transaction ID
  orderId?: string;        // HDFC order ID
  signature?: string;      // HDFC signature
  method?: string;
  paidAt?: Date;
  status?: string;        // Payment status from HDFC
}
```

## Migration Steps

### 1. Update Environment Variables
Update your `.env` file with HDFC credentials (already done).

### 2. Database Migration (Optional)
If you have existing payment settings in the database, you may want to update them:

```javascript
// MongoDB shell or migration script
db.paymentsettings.updateMany(
  {},
  {
    $rename: {
      "razorpayEnabled": "hdfcEnabled",
      "razorpayKeyId": "hdfcMerchantId"
    },
    $unset: {
      "razorpayKeySecret": ""
    },
    $set: {
      "hdfcApiKey": "",
      "hdfcResponseKey": ""
    }
  }
);
```

### 3. Update Client-Side Code
If you have a frontend application, update the payment integration:

1. Change the API endpoint from `/payment/create-razorpay-order` to `/payment/create-hdfc-order`
2. Update the request payload to include `customerInfo`
3. Handle the new response format with `paymentUrl` and `transactionId`
4. Update payment verification to send HDFC-specific parameters

### 4. Testing
1. Test order creation with the new HDFC endpoint
2. Verify payment signature validation
3. Test payment status checking
4. Ensure error handling works correctly

## HDFC SmartGateway Features

### Payment Flow
1. **Create Order**: Call `/api/orders/payment/create-hdfc-order` with amount and customer info
2. **Redirect**: Redirect user to `paymentUrl` returned in response
3. **Payment**: User completes payment on HDFC page
4. **Callback**: HDFC redirects back to your `returnUrl`
5. **Verify**: Call `/api/orders/payment/verify` with transaction details
6. **Webhook**: HDFC sends webhook to `notifyUrl` for payment status

### Security
- All requests are signed with HMAC SHA256
- Response verification using `RESPONSE_KEY`
- Signature validation on both request and response

### Logging
Enable logging by setting `HDFC_ENABLE_LOGGING=true` in `.env` for debugging.

## Rollback Plan
If you need to rollback to Razorpay:

1. Restore the `.env` file with Razorpay credentials
2. Run: `npm install razorpay`
3. Restore the backup files from git history
4. Rebuild: `npm run build`
5. Restart the server

## Support
For HDFC SmartGateway API documentation and support:
- Base URL: https://smartgateway.hdfcuat.bank.in
- Contact HDFC support for API issues

## Notes
- The current configuration uses UAT (User Acceptance Testing) environment
- For production, update `HDFC_BASE_URL` to production URL
- Ensure all HDFC credentials are kept secure and not committed to version control
- The migration maintains backward compatibility for existing orders with Razorpay payment details
