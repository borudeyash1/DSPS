# Backward Compatibility (REMOVED)

**Update (Current):**
Backward compatibility for Razorpay has been **REMOVED** as of the latest migration phase. The system now exclusively uses HDFC SmartGateway.

## Previous State (Deprecated)
Formerly, the application supported:
- `/api/orders/payment/create-razorpay-order` (Redirected to HDFC)
- `/api/orders/payment/verify-razorpay` (Redirected to HDFC)
- `razorpayEnabled` field in Payment Settings (Mapped to `hdfcEnabled`)

## Current State
- All payment requests must use HDFC endpoints:
  - `/api/orders/payment/create-hdfc-order`
  - `/api/orders/payment/verify`
- Frontend must use `hdfcEnabled` flag.
- Setup is fully native to HDFC SmartGateway.

**Action Required:**
If you have any cached frontend code or third-party integrations using the old Razorpay endpoints, they will now fail 404. Please update them to the new HDFC endpoints immediately.
