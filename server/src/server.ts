import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { initSocket } from './socket';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import sectionRoutes from './routes/sections';
import categoryRoutes from './routes/categories';
import wishlistRoutes from './routes/wishlist';
import reviewRoutes from './routes/reviews';
import cartRoutes from './routes/cart';
import blogRoutes from './routes/blogs';
import blogSectionRoutes from './routes/blogSections';
import categoryPageSectionRoutes from './routes/categoryPageSections';
import notificationRoutes from './routes/notifications';
import emailRoutes from './routes/email';

import shiprocketRoutes from './routes/shiprocket';
import mockDeliveryRoutes from './routes/mockDelivery';
import { initializeShiprocket } from './services/shiprocketService';
import { startNotificationCleanupCron } from './services/notificationCleanupCron';
import { initCleanupSchedule } from './services/imageCleanupService';

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize Shiprocket (if credentials provided)
console.log('🔍 [DEBUG] Checking Shiprocket Credentials...');
console.log('   Email exists:', !!process.env.SHIPROCKET_EMAIL);
console.log('   Password exists:', !!process.env.SHIPROCKET_PASSWORD);

if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
    try {
        initializeShiprocket({
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD
        });
        console.log('✅ Shiprocket service initialized');
    } catch (error) {
        console.error('⚠️  Shiprocket initialization failed:', error);
    }
} else {
    console.log('⚠️  Shiprocket credentials not provided - shipping features disabled');
}

// Start cleanup cron jobs
startNotificationCleanupCron();
initCleanupSchedule();

// Define allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://botamapparels.com',
    'https://www.botamapparels.com',
    'https://ecom.sartthi.com',
    process.env.CLIENT_URL,
    'https://smartgateway.hdfcbank.com',
    'https://smartgateway.hdfcuat.bank.in'
].filter(Boolean); // Filter out undefined/null

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
})); // Security headers
app.use(morgan('dev')); // Logging
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

// Serve uploaded files with proper CORS headers
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static('uploads'));

// Health check route
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
import couponRoutes from './routes/coupons';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/blog-sections', blogSectionRoutes);
app.use('/api/category-sections', categoryPageSectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);

app.use('/api/shiprocket', shiprocketRoutes);
app.use('/api/delivery', mockDeliveryRoutes);
import n8nRoutes from './routes/n8n';
app.use('/api/n8n', n8nRoutes);
app.use('/api/email', emailRoutes);
import contactRoutes from './routes/contactRoutes';
app.use('/api/contact', contactRoutes);
import interaktRoutes from './routes/interakt';
app.use('/api/interakt', interaktRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Initialize Socket.IO
// Pass just the first origin or handle array inside socket.ts if needed, but usually client mostly connects fine if CORS is set right.
// However key 'origin' in socket options usually takes an array. 
// For now, assuming initSocket takes a string or we update it. 
// Let's pass the allowedOrigins array if initSocket supports it, otherwise keep widely permissive or just primary.
// Checking initSocket signature... it was taking string. I will modify this call and likely need to modify socket.ts next.
initSocket(httpServer, allowedOrigins as any);

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    console.log(`🔌 Socket.IO enabled`);
});

export default app;