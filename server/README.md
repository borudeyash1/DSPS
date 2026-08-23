# Botam Apparels E-Commerce Server

Backend API for Botam Apparels e-commerce platform built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication**: JWT-based auth with OTP email verification, Google OAuth
- **Product Management**: CRUD operations with Cloudinary image storage
- **Order Management**: Order creation, tracking, and status updates
- **Admin Dashboard**: Product, order, and user management
- **Guest Browsing**: Public product endpoints (no login required)
- **Secure Checkout**: Authentication required only at checkout

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Image Storage**: Cloudinary
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer
- **File Upload**: Multer

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the server root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/botam-apparels

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Botam Apparels <noreply@botamapparels.com>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Cloudinary (REQUIRED for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# HDFC SmartGateway Payment Gateway
HDFC_SmartGateway_API_KEY=your-hdfc-api-key
HDFC_MERCHANT_ID=your-merchant-id
HDFC_PAYMENT_PAGE_CLIENT_ID=your-client-id
HDFC_BASE_URL=https://smartgateway.hdfcuat.bank.in
HDFC_RESPONSE_KEY=your-response-key
HDFC_ENABLE_LOGGING=false

# Frontend
CLIENT_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /verify-email` - Verify email with OTP
- `POST /resend-otp` - Resend OTP
- `POST /login` - Login user
- `POST /logout` - Logout user (protected)
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user (protected)
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with OTP
- `POST /google` - Google OAuth login

### Products (`/api/products`)
- `GET /` - Get all products (PUBLIC)
- `GET /featured` - Get featured products (PUBLIC)
- `GET /:id` - Get product by ID (PUBLIC)
- `POST /` - Create product (ADMIN)
- `PUT /:id` - Update product (ADMIN)
- `DELETE /:id` - Delete product (ADMIN)

### Orders (`/api/orders`)
- `POST /` - Create order (AUTHENTICATED)
- `GET /my-orders` - Get user's orders (AUTHENTICATED)
- `GET /:id` - Get order by ID (AUTHENTICATED)
- `PUT /:id/cancel` - Cancel order (AUTHENTICATED)
- `GET /` - Get all orders (ADMIN)
- `PUT /:id/status` - Update order status (ADMIN)

### Payment (`/api/orders/payment`)
- `GET /settings` - Get payment settings (PUBLIC)
- `POST /create-hdfc-order` - Create HDFC payment order (AUTHENTICATED)
- `POST /verify` - Verify HDFC payment (AUTHENTICATED)


### Admin (`/api/admin`)
- `POST /login` - Admin login
- `POST /logout` - Admin logout (ADMIN)
- `GET /stats` - Dashboard stats (ADMIN)
- `GET /users` - Get all users (ADMIN)
- `PUT /users/:id/toggle-status` - Toggle user status (ADMIN)

## Guest Browsing Flow

1. **Browse Products**: Users can view all products without logging in
2. **Add to Cart**: Cart is stored in frontend (localStorage/state)
3. **Checkout**: Login/register required to place order
4. **Order Tracking**: View order history after login

## Image Upload Flow

1. Admin uploads images via multipart/form-data
2. Multer saves images temporarily
3. Images uploaded to Cloudinary
4. Cloudinary URLs stored in MongoDB
5. Temporary files deleted
6. Frontend displays images from Cloudinary CDN

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── cloudinary.ts
│   │   └── database.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── orderController.ts
│   │   └── adminController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── upload.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   └── Admin.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   └── admin.ts
│   ├── services/
│   │   └── emailService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── cookieUtils.ts
│   └── server.ts
├── uploads/ (temporary)
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

## Notes

- **MongoDB**: Make sure MongoDB is running locally or use MongoDB Atlas
- **Cloudinary**: Required for product image uploads
- **Email**: Optional for development (OTP will be logged to console)
- **Admin Account**: Create manually in MongoDB or use seed script
