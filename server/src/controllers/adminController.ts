import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';
import AllowedDevice from '../models/AllowedDevice';
import { setCookieToken, clearCookieToken } from '../utils/cookieUtils';
import { AuthenticatedRequest } from '../types';
import { buildSearchQuery } from '../utils/searchUtils';
import { sendEmail, getOTPEmailTemplate } from '../services/emailService';

// Check if device is allowed to access admin
export const checkDeviceAccess = async (req: Request, res: Response): Promise<void> => {
    try {
        const { deviceId } = req.body;

        console.log('🔍 [DEVICE CHECK] Device ID:', deviceId);

        if (!deviceId) {
            console.log('❌ [DEVICE CHECK] No device ID provided');
            res.status(400).json({
                success: false,
                message: 'Device ID is required'
            });
            return;
        }

        const device = await AllowedDevice.findOne({
            deviceId,
            isActive: true
        });

        if (device) {
            // Update last access time
            device.lastAccess = new Date();
            device.loginAttempts += 1;
            await device.save();

            console.log('✅ [DEVICE CHECK] Device authorized:', device.deviceName);
            res.status(200).json({
                success: true,
                message: 'Device is authorized',
                data: {
                    allowed: true,
                    deviceName: device.deviceName,
                    deviceType: device.deviceType
                }
            });
        } else {
            console.log('❌ [DEVICE CHECK] Device not authorized');
            res.status(403).json({
                success: false,
                message: 'Device is not authorized. Please contact the administrator.',
                data: {
                    allowed: false
                }
            });
        }
    } catch (error: any) {
        console.error('Check device access error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Generate admin JWT token
const generateAdminToken = (adminId: string, deviceId?: string, deviceType?: string): string => {
    const payload: any = { id: adminId, type: 'admin' };
    if (deviceId) payload.deviceId = deviceId;
    if (deviceType) payload.deviceType = deviceType;

    return jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        { expiresIn: '8h' } // Admin: 8 hours for security
    );
};

// Admin login
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Check if admin is active
        if (!admin.isActive) {
            res.status(401).json({
                success: false,
                message: 'Admin account has been deactivated',
            });
            return;
        }

        // Verify password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Check for device access
        let deviceType = 'admin'; // Default fallback
        if (req.body.deviceId) {
            const device = await AllowedDevice.findOne({ deviceId: req.body.deviceId, isActive: true });
            if (device) {
                deviceType = device.deviceType;
                // Update access stats
                device.lastAccess = new Date();
                await device.save();
            }
        }

        // Generate token
        const accessToken = generateAdminToken(admin._id.toString(), req.body.deviceId, deviceType);
        const refreshToken = jwt.sign(
            { id: admin._id, type: 'admin' },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie
        setCookieToken(res, 'accessToken', accessToken, 8 * 60 * 60 * 1000); // 8 hours
        setCookieToken(res, 'refreshToken', refreshToken, 7 * 24 * 60 * 60 * 1000); // 7 days

        res.status(200).json({
            success: true,
            message: 'Admin login successful',
            data: {
                admin: {
                    _id: admin._id,
                    email: admin.email,
                    role: admin.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Admin Google OAuth login
export const adminGoogleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, deviceId } = req.body;

        if (!code) {
            res.status(400).json({
                success: false,
                message: 'Authorization code is required',
            });
            return;
        }

        // Initialize OAuth2 client
        const { OAuth2Client } = require('google-auth-library');
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.CLIENT_URL + '/my-admin/auth/google/callback'
        );

        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Verify the ID token
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            res.status(400).json({
                success: false,
                message: 'Failed to get user information from Google',
            });
            return;
        }

        console.log('🔍 [ADMIN OAUTH] Google email:', payload.email);

        // Check if admin exists with this email
        const admin = await Admin.findOne({ email: payload.email, isActive: true });

        console.log('🔍 [ADMIN OAUTH] Admin found:', !!admin);

        if (!admin) {
            console.log('❌ [ADMIN OAUTH] No admin account found for:', payload.email);
            res.status(403).json({
                success: false,
                message: 'This Google account is not authorized as an admin',
            });
            return;
        }

        // Update admin info if needed
        admin.lastLogin = new Date();
        await admin.save();

        // Check for device access
        let deviceType = 'admin';
        if (deviceId) {
            const device = await AllowedDevice.findOne({ deviceId, isActive: true });
            if (device) {
                deviceType = device.deviceType;
                device.lastAccess = new Date();
                await device.save();
            }
        }

        // Generate tokens
        const accessToken = generateAdminToken(admin._id.toString(), deviceId, deviceType);
        const refreshToken = jwt.sign(
            { id: admin._id, type: 'admin' },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: '7d' } // Admin refresh: 7 days
        );

        // Set HTTP-only cookies
        setCookieToken(res, 'accessToken', accessToken, 8 * 60 * 60 * 1000); // 8 hours
        setCookieToken(res, 'refreshToken', refreshToken, 7 * 24 * 60 * 60 * 1000); // 7 days

        console.log('✅ [ADMIN OAUTH] Tokens generated and cookies set');
        console.log('✅ [ADMIN OAUTH] Admin:', admin.email, 'Role:', admin.role);

        res.status(200).json({
            success: true,
            message: 'Admin Google authentication successful',
            data: {
                admin: {
                    _id: admin._id,
                    email: admin.email,
                    role: admin.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        console.error('Admin Google auth error:', error);

        // Handle specific OAuth errors
        if (error.message === 'invalid_grant' || error.code === 400) {
            res.status(400).json({
                success: false,
                message: 'Authorization code expired or already used. Please try logging in again.'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Google authentication failed'
        });
    }
};

// Request admin OTP (after password verification)
export const requestAdminOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
            return;
        }

        // Find admin with password
        const admin = await Admin.findOne({ email, isActive: true }).select('+password');

        console.log('🔍 [DEBUG] Login attempt for:', email);
        console.log('🔍 [DEBUG] Admin found:', !!admin);

        if (!admin) {
            console.log('❌ [DEBUG] Admin not found or inactive');
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Verify password first
        const isPasswordValid = await admin.comparePassword(password);
        console.log('🔍 [DEBUG] Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('❌ [DEBUG] Password verification failed');
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to admin
        (admin as any).loginOTP = otp;
        (admin as any).loginOTPExpires = otpExpires;
        await admin.save();

        // Send OTP email via n8n
        // Send OTP email via Brevo SMTP
        try {
            const emailHtml = getOTPEmailTemplate(otp, admin.fullName || 'Admin');
            await sendEmail({
                to: email,
                subject: 'Admin Login OTP - Botam Apparels',
                html: emailHtml
            });
            console.log('✅ Admin OTP sent via Brevo to:', email);
        } catch (emailError: any) {
            console.error('❌ Failed to send admin OTP via Brevo:', emailError?.message || emailError);
            // Don't block login if email fails in dev/test environment
            console.log('⚠️ Continuing without sending email. OTP is:', otp);
        }

        console.log('✅ Admin OTP sent to:', email);

        res.status(200).json({
            success: true,
            message: 'Password verified. OTP sent to your email.',
            data: { email },
        });
    } catch (error: any) {
        console.error('Request admin OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
        });
    }
};

// Verify admin OTP and login
export const verifyAdminOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp, deviceId } = req.body;

        if (!email || !otp) {
            res.status(400).json({
                success: false,
                message: 'Email and OTP are required',
            });
            return;
        }

        // Find admin with OTP fields
        const admin = await Admin.findOne({ email, isActive: true }).select('+loginOTP +loginOTPExpires');

        if (!admin) {
            res.status(404).json({
                success: false,
                message: 'Admin account not found',
            });
            return;
        }

        // Check OTP
        const adminData = admin as any;
        if (!adminData.loginOTP || !adminData.loginOTPExpires) {
            res.status(400).json({
                success: false,
                message: 'No OTP requested. Please request OTP first.',
            });
            return;
        }

        if (adminData.loginOTP !== otp) {
            res.status(401).json({
                success: false,
                message: 'Invalid OTP',
            });
            return;
        }

        if (adminData.loginOTPExpires < new Date()) {
            res.status(401).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
            return;
        }

        // Clear OTP
        adminData.loginOTP = undefined;
        adminData.loginOTPExpires = undefined;
        adminData.lastLogin = new Date();
        await admin.save();

        // Check for device access
        let deviceType = 'admin';
        if (deviceId) {
            const device = await AllowedDevice.findOne({ deviceId, isActive: true });
            if (device) {
                deviceType = device.deviceType;
                device.lastAccess = new Date();
                await device.save();
            }
        }

        // Generate token
        const accessToken = generateAdminToken(admin._id.toString(), deviceId, deviceType);
        const refreshToken = jwt.sign(
            { id: admin._id, type: 'admin' },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie
        setCookieToken(res, 'accessToken', accessToken, 8 * 60 * 60 * 1000); // 8 hours
        setCookieToken(res, 'refreshToken', refreshToken, 7 * 24 * 60 * 60 * 1000); // 7 days

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                admin: {
                    _id: admin._id,
                    email: admin.email,
                    role: admin.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        console.error('Verify admin OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Admin logout
export const adminLogout = async (req: Request, res: Response): Promise<void> => {
    try {
        clearCookieToken(res, 'accessToken');

        res.status(200).json({
            success: true,
            message: 'Admin logout successful',
        });
    } catch (error: any) {
        console.error('Admin logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Admin refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
            return;
        }

        // Verify token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;

        if (decoded.type !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Invalid token type',
            });
            return;
        }

        const admin = await Admin.findById(decoded.id);

        if (!admin || !admin.isActive) {
            res.status(403).json({
                success: false,
                message: 'Admin not found or inactive',
            });
            return;
        }

        // Generate new access token
        // Note: functionality that relies on deviceId in token might need re-login if we don't persist it here.
        // For now, we issue a standard admin token.
        const accessToken = generateAdminToken(admin._id.toString());

        // Set HTTP-only cookie
        setCookieToken(res, 'accessToken', accessToken, 8 * 60 * 60 * 1000); // 8 hours

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken,
            },
        });
    } catch (error: any) {
        console.error('Admin refresh token error:', error);
        res.status(403).json({
            success: false,
            message: 'Invalid or expired refresh token',
        });
    }
};

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ isActive: true });

        // Calculate total revenue from completed orders (only delivered)
        const completedOrders = await Order.find({
            paymentStatus: 'completed',
            status: 'delivered'
        });
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        const recentOrders = await Order.find()
            .sort('-createdAt')
            .limit(5)
            .populate('user', 'fullName email');

        // Get recent users
        const recentUsers = await User.find()
            .sort('-createdAt')
            .limit(5)
            .select('fullName email phone role isActive createdAt');

        // Get low stock products
        const lowStockProducts = await Product.find({ stock: { $lt: 10 }, isActive: true })
            .sort('stock')
            .limit(5);

        // --- Analytics Growth Calculations ---
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const lastMonthOrders = await Order.countDocuments({ createdAt: { $lt: lastMonth } });
        const lastMonthUsers = await User.countDocuments({ createdAt: { $lt: lastMonth }, isActive: true });
        const lastMonthRevenue = (await Order.find({
            createdAt: { $lt: lastMonth },
            paymentStatus: 'completed',
            status: 'delivered'
        })).reduce((sum, order) => sum + order.totalAmount, 0);

        const ordersGrowth = lastMonthOrders > 0
            ? Math.round(((totalOrders - lastMonthOrders) / lastMonthOrders) * 100)
            : 0;
        const usersGrowth = lastMonthUsers > 0
            ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
            : 0;
        const revenueGrowth = lastMonthRevenue > 0
            ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : 0;

        // --- Sales Chart Data (Last 7 Days) ---
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const salesChartData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days },
                    paymentStatus: 'completed',
                    status: 'delivered'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // --- Sales by Category (Bar Chart Data) ---
        const salesByCategory = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'completed',
                    status: 'delivered'
                }
            },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 5 }
        ]);

        // --- User Growth (Line Chart Data - Last 7 Days) ---
        const userGrowthData = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    userCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // --- Device Usage Stats ---
        const deviceStats = await AllowedDevice.aggregate([
            {
                $group: {
                    _id: "$runtime", // Group by 'browser', 'mobile', 'desktop'
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Dashboard stats retrieved successfully',
            data: {
                totalProducts,
                totalOrders,
                totalUsers,
                totalRevenue,
                recentOrders,
                lowStockProducts,
                revenueGrowth,
                ordersGrowth,
                usersGrowth,
                salesChartData,
                salesByCategory,
                userGrowthData,
                deviceStats,
                recentUsers
            },
        });
    } catch (error: any) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Get analytics data (ADMIN ONLY)
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ isActive: true });

        // Calculate total revenue (only delivered orders)
        const completedOrders = await Order.find({
            paymentStatus: 'completed',
            status: 'delivered'
        });
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Get last month's data for growth calculation
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const lastMonthOrders = await Order.countDocuments({
            createdAt: { $lt: lastMonth }
        });
        const lastMonthUsers = await User.countDocuments({
            createdAt: { $lt: lastMonth },
            isActive: true
        });
        const lastMonthRevenue = (await Order.find({
            createdAt: { $lt: lastMonth },
            paymentStatus: 'completed',
            status: 'delivered'
        })).reduce((sum, order) => sum + order.totalAmount, 0);

        // Calculate growth percentages
        const ordersGrowth = lastMonthOrders > 0
            ? Math.round(((totalOrders - lastMonthOrders) / lastMonthOrders) * 100)
            : 0;
        const usersGrowth = lastMonthUsers > 0
            ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
            : 0;
        const revenueGrowth = lastMonthRevenue > 0
            ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : 0;

        // Get recent orders
        const recentOrders = await Order.find()
            .select('_id totalAmount createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            message: 'Analytics retrieved successfully',
            data: {
                totalRevenue,
                totalOrders,
                totalUsers,
                totalProducts,
                revenueGrowth,
                ordersGrowth,
                usersGrowth,
                recentOrders
            },
        });
    } catch (error: any) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Get all users (admin)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        const filter: any = {};

        if (search) {
            const searchQuery = buildSearchQuery(search as string, ['fullName', 'email', 'phone']);
            Object.assign(filter, searchQuery);
        }

        const skip = (Number(page) - 1) * Number(limit);
        console.log(`[ADMIN] Fetching customers. Page: ${page}, Limit: ${limit}, Search: ${search || 'none'}`);

        const users = await User.find(filter)
            .select('-password -refreshTokens')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        console.log(`[ADMIN] Found ${users.length} customers.`);

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Customers retrieved successfully',
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Toggle user active status
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: user,
        });
    } catch (error: any) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Get all allowed devices
export const getAllowedDevices = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        const filter: any = {};

        if (search) {
            const searchQuery = buildSearchQuery(search as string, ['deviceName', 'deviceId', 'platform', 'userAgent']);
            Object.assign(filter, searchQuery);
        }

        const skip = (Number(page) - 1) * Number(limit);
        const devices = await AllowedDevice.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await AllowedDevice.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Allowed devices retrieved successfully',
            data: devices,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            }
        });
    } catch (error: any) {
        console.error('Get allowed devices error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Add new allowed device
export const addAllowedDevice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { deviceId, deviceName, deviceType, userAgent, platform, notes } = req.body;

        if (!deviceId || !deviceName) {
            res.status(400).json({
                success: false,
                message: 'Device ID and name are required'
            });
            return;
        }

        // Check if device already exists
        const existingDevice = await AllowedDevice.findOne({ deviceId });
        if (existingDevice) {
            res.status(400).json({
                success: false,
                message: 'Device already exists'
            });
            return;
        }

        const newDevice = new AllowedDevice({
            deviceId,
            deviceName,
            deviceType: deviceType || 'admin',
            userAgent,
            platform,
            notes,
            addedBy: 'admin',
            isActive: true
        });

        await newDevice.save();

        res.status(201).json({
            success: true,
            message: 'Device added successfully',
            data: newDevice
        });
    } catch (error: any) {
        console.error('Add allowed device error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create new admin (protected)
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, fullName, phone, role } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            res.status(400).json({
                success: false,
                message: 'Admin with this email already exists'
            });
            return;
        }

        const newAdmin = new Admin({
            email,
            password,
            fullName,
            phone,
            role: role || 'admin',
            isActive: true
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: {
                _id: newAdmin._id,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });
    } catch (error: any) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update allowed device
export const updateAllowedDevice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { deviceName, deviceType, isActive, notes } = req.body;

        const device = await AllowedDevice.findById(id);
        if (!device) {
            res.status(404).json({
                success: false,
                message: 'Device not found'
            });
            return;
        }

        if (deviceName) device.deviceName = deviceName;
        if (deviceType) device.deviceType = deviceType;
        if (typeof isActive === 'boolean') device.isActive = isActive;
        if (notes !== undefined) device.notes = notes;

        await device.save();

        res.status(200).json({
            success: true,
            message: 'Device updated successfully',
            data: device
        });
    } catch (error: any) {
        console.error('Update allowed device error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete allowed device
export const deleteAllowedDevice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const device = await AllowedDevice.findByIdAndDelete(id);
        if (!device) {
            res.status(404).json({
                success: false,
                message: 'Device not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Device deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete allowed device error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all admins
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        const filter: any = {};

        if (search) {
            const searchQuery = buildSearchQuery(search as string, ['fullName', 'email', 'role']);
            Object.assign(filter, searchQuery);
        }

        const skip = (Number(page) - 1) * Number(limit);
        const admins = await Admin.find(filter)
            .select('-password -loginOTP -loginOTPExpires')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await Admin.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Admins retrieved successfully',
            data: admins,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error('Get all admins error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Toggle admin status
export const toggleAdminStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const requestingAdminId = req.user._id;

        if (id === requestingAdminId.toString()) {
            res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account',
            });
            return;
        }

        const adminToUpdate = await Admin.findById(id);

        if (!adminToUpdate) {
            res.status(404).json({
                success: false,
                message: 'Admin not found',
            });
            return;
        }

        adminToUpdate.isActive = !adminToUpdate.isActive;
        await adminToUpdate.save();

        res.status(200).json({
            success: true,
            message: `Admin ${adminToUpdate.isActive ? 'activated' : 'deactivated'} successfully`,
            data: adminToUpdate,
        });
    } catch (error: any) {
        console.error('Toggle admin status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Delete admin
export const deleteAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const requestingAdminId = req.user._id;

        if (id === requestingAdminId.toString()) {
            res.status(400).json({
                success: false,
                message: 'You cannot delete your own account',
            });
            return;
        }

        const adminToDelete = await Admin.findByIdAndDelete(id);

        if (!adminToDelete) {
            res.status(404).json({
                success: false,
                message: 'Admin not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Initiate Admin Password Change (Verify current password + Send OTP)
export const initiateChangePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword } = req.body;
        const adminId = req.user?._id;

        if (!adminId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const admin = await Admin.findById(adminId).select('+password');
        if (!admin) {
            res.status(404).json({ success: false, message: 'Admin not found' });
            return;
        }

        // Verify current password
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Incorrect current password' });
            return;
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to admin document (reusing loginOTP fields)
        admin.loginOTP = otp;
        admin.loginOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await admin.save();

        // Send OTP via Email
        const { sendEmailNotification } = await import('../services/notificationService');

        // Use password_reset_link type as it has resetToken field we can reuse for OTP
        await sendEmailNotification({
            type: 'password_reset_link',
            email: admin.email,
            fullName: admin.fullName || 'Admin',
            resetToken: otp, // Sending OTP as the token
            expiresAt: '10 minutes'
        });

        console.log(`✅ Password Change OTP sent to ${admin.email}`);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email address'
        });

    } catch (error: any) {
        console.error('Initiate password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate password change'
        });
    }
};

// Verify OTP and Change Password
export const verifyChangePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { otp, newPassword } = req.body;
        const adminId = req.user?._id;

        if (!adminId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        // Find admin with the OTP
        const admin = await Admin.findById(adminId).select('+loginOTP +loginOTPExpires');
        if (!admin) {
            res.status(404).json({ success: false, message: 'Admin not found' });
            return;
        }

        // Verify OTP
        if (!admin.loginOTP || admin.loginOTP !== otp) {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
            return;
        }

        if (!admin.loginOTPExpires || admin.loginOTPExpires < new Date()) {
            res.status(400).json({ success: false, message: 'OTP has expired' });
            return;
        }

        // Valid OTP -> Change Password
        admin.password = newPassword; // Pre-save hook will hash it
        // Clear OTP
        admin.loginOTP = undefined;
        admin.loginOTPExpires = undefined;

        await admin.save();

        console.log(`✅ Password changed successfully for admin ${adminId}`);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error: any) {
        console.error('Verify password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update password'
        });
    }
};
