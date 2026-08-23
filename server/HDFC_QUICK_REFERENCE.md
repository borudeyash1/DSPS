# HDFC SmartGateway - Quick Reference

## 🔑 Environment Variables

```env
HDFC_SmartGateway_API_KEY=7EBA83DBA204319938A52DC182A4E1
HDFC_MERCHANT_ID=SG3004
HDFC_PAYMENT_PAGE_CLIENT_ID=hdfcmaster
HDFC_BASE_URL=https://smartgateway.hdfcuat.bank.in
HDFC_RESPONSE_KEY=03A9CD5403E42B585BF55F804AB19B
HDFC_ENABLE_LOGGING=false
```

## 📡 API Endpoints

### Create Payment Order
```
POST /api/orders/payment/create-hdfc-order
Authorization: Bearer <token>

Request:
{
  "amount": 1000,
  "currency": "INR",
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}

Response:
{
  "success": true,
  "data": {
    "orderId": "SG3004_ord_12345678_87654321_1234567890",
    "amount": 100000,
    "currency": "INR",
    "receipt": "ord_12345678_87654321",
    "paymentUrl": "https://smartgateway.hdfcuat.bank.in/payment/xyz",
    "transactionId": "TXN123456"
  }
}
```

### Verify Payment
```
POST /api/orders/payment/verify
Authorization: Bearer <token>

Request:
{
  "orderId": "SG3004_ord_12345678_87654321_1234567890",
  "transactionId": "TXN123456",
  "status": "SUCCESS",
  "signature": "abc123..."
}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "SG3004_ord_12345678_87654321_1234567890",
    "transactionId": "TXN123456",
    "status": "SUCCESS"
  }
}
```

### Get Payment Settings
```
GET /api/orders/payment/settings

Response:
{
  "success": true,
  "data": {
    "codEnabled": true,
    "codMinimumAmount": 0,
    "hdfcEnabled": true,
    "hdfcMerchantId": "SG3004",
    "acceptedPaymentMethods": ["upi", "card", "netbanking", "wallet", "cod"]
  }
}
```

## 🔄 Payment Flow

1. **Create Order**
   ```javascript
   const response = await fetch('/api/orders/payment/create-hdfc-order', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       amount: 1000,
       currency: 'INR',
       customerInfo: {
         name: 'Customer Name',
         email: 'customer@email.com',
         phone: '9876543210'
       }
     })
   });
   const { data } = await response.json();
   ```

2. **Redirect to Payment**
   ```javascript
   window.location.href = data.paymentUrl;
   ```

3. **Handle Callback**
   - HDFC redirects to: `${BASE_URL}/api/orders/payment/hdfc-callback`
   - Extract payment details from callback

4. **Verify Payment**
   ```javascript
   const verifyResponse = await fetch('/api/orders/payment/verify', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       orderId: callbackData.orderId,
       transactionId: callbackData.transactionId,
       status: callbackData.status,
       signature: callbackData.signature
     })
   });
   ```

## 🛠️ Utility Functions

### Create HDFC Order
```typescript
import { createHDFCOrder } from '../utils/hdfcSmartGateway';

const order = await createHDFCOrder(
  1000,           // amount in rupees
  'INR',          // currency
  'receipt_123',  // receipt ID
  {               // customer info (optional)
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210'
  }
);
```

### Verify Signature
```typescript
import { verifyHDFCSignature } from '../utils/hdfcSmartGateway';

const isValid = verifyHDFCSignature(
  orderId,
  transactionId,
  status,
  signature
);
```

### Check Payment Status
```typescript
import { checkHDFCPaymentStatus } from '../utils/hdfcSmartGateway';

const paymentStatus = await checkHDFCPaymentStatus(orderId);
```

## 🔐 Security

### Signature Generation
```typescript
// Request signature (HMAC SHA256 with API_KEY)
const signatureString = Object.keys(payload)
  .sort()
  .map(key => `${key}=${payload[key]}`)
  .join('&');

const signature = crypto
  .createHmac('sha256', API_KEY)
  .update(signatureString)
  .digest('hex');
```

### Signature Verification
```typescript
// Response signature (HMAC SHA256 with RESPONSE_KEY)
const dataToSign = `${orderId}|${transactionId}|${status}`;

const expectedSignature = crypto
  .createHmac('sha256', RESPONSE_KEY)
  .update(dataToSign)
  .digest('hex');

const isValid = expectedSignature === receivedSignature;
```

## 🐛 Debugging

### Enable Logging
```env
HDFC_ENABLE_LOGGING=true
```

### Check Logs
```bash
# Server logs will show:
# - HDFC Order Creation Response
# - Signature Verification Details
# - Payment Status Response
```

## ⚠️ Common Issues

### Issue: "Invalid signature"
**Solution**: Verify RESPONSE_KEY is correct in .env

### Issue: "Payment order creation failed"
**Solution**: 
- Check API_KEY is correct
- Verify BASE_URL is accessible
- Check MERCHANT_ID matches your account

### Issue: "Transaction not found"
**Solution**: 
- Verify orderId format is correct
- Check if payment was actually initiated
- Ensure using correct environment (UAT vs Production)

## 📊 Payment Status Codes

- `SUCCESS` / `success` - Payment completed
- `PENDING` - Payment in progress
- `FAILED` - Payment failed
- `CANCELLED` - Payment cancelled by user

## 🌐 Environment URLs

### UAT (Testing)
```
https://smartgateway.hdfcuat.bank.in
```

### Production
```
https://smartgateway.hdfcbank.com
(Update HDFC_BASE_URL for production)
```

## 📞 Support

- **HDFC Support**: Contact your HDFC relationship manager
- **Technical Issues**: Check HDFC_MIGRATION_GUIDE.md
- **Integration Help**: Refer to HDFC API documentation

---

**Last Updated**: January 19, 2026
**Version**: 1.0.0
