import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Otp from '../models/Otp';

import { twilioWhatsAppService } from '../services/twilioWhatsappService';
import { sendEmailNotification } from '../services/notificationService';
import {
    AuthenticatedRequest,
    ApiResponse,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
} from '../types';
import axios from 'axios';
import { setCookieToken, clearCookieToken } from '../utils/cookieUtils';

// Generate JWT token (USER)
// Industry Standard: Amazon/Flipkart/Myntra approach
// - Base token: 6 months (180 days)
// - Activity-based refresh extends session
// - Inactivity timeout handled by refresh token expiry
const generateToken = (userId: string, userType: 'user' | 'admin' = 'user'): string => {
    const payload: any = { id: userId };

    if (userType === 'admin') {
        payload.type = 'admin';
        // Admin: Strict 8-hour sessions for security
        return jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: '8h'
        });
    }

    // User: 6-month sessions (like Flipkart/Myntra)
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '180d' // 6 months - Industry standard for e-commerce
    });
};

// Generate refresh token (USER)
// Refresh token: 1 year (extends session on activity)
const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: '365d', // 1 year - Amazon-style long refresh
    });
};

// Generate a 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Extract client metadata for login tracking
const extractClientMeta = (req: Request) => {
    const ipAddress =
        (req.headers['x-forwarded-for'] as string) ||
        req.ip ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        'unknown';

    return {
        ipAddress,
        userAgent: req.get('User-Agent') || 'unknown',
        language: req.get('Accept-Language') || undefined,
    };
};

// Append login history entry
const appendLoginHistoryEntry = (user: any, req: Request, runtime: 'browser' | 'mobile') => {
    const { ipAddress, userAgent, language } = extractClientMeta(req);

    if (!user.loginHistory) {
        user.loginHistory = [];
    }

    user.loginHistory.push({
        ipAddress,
        userAgent,
        runtime,
        deviceInfo: {
            runtime,
            userAgent,
            language,
            timestamp: new Date(),
        },
        loginTime: new Date(),
        location: {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
        },
    });

    // Keep only last 10 login entries
    if (user.loginHistory.length > 10) {
        user.loginHistory = user.loginHistory.slice(-10);
    }
};

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullName, email, phone, password, gender }: RegisterRequest = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            if (existingUser.isEmailVerified) {
                res.status(400).json({
                    success: false,
                    message: 'User with this email already exists.',
                });
                return;
            } else {
                // User exists but not verified - this shouldn't happen with new flow
                // Delete the unverified user and allow re-registration
                await User.deleteOne({ _id: existingUser._id });
                console.log('🗑️ Deleted unverified user:', email);
            }
        }

        // Check if there's a pending registration OTP
    // @ts-ignore
        const existingOtp = await Otp.findOne({ email, type: 'registration' });
        if (existingOtp) {
            // Delete old OTP to allow new registration
            await Otp.deleteOne({ _id: existingOtp._id });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Hash password before storing in OTP model
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine Avatar based on gender using ui-avatars.com (reliable fallback)
        const encodedName = encodeURIComponent(fullName);
        let avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=200`; // Default

        // We can customize colors based on gender if desired, but random is good for now.
        // Or specific colors: Male=0D8ABC (Blue), Female=E91E63 (Pink)
        if (gender === 'Male') {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff&size=200`;
        } else if (gender === 'Female') {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=E91E63&color=fff&size=200`;
        }

        // Store registration data in OTP model (temporary storage until verification)
        const otpDoc = new Otp({
            email,
            otp,
            type: 'registration',
            expiresAt: otpExpires,
            metadata: {
                fullName,
                phone,
                hashedPassword,
                gender: gender || 'Other',
                avatarUrl
            },
        });

        await otpDoc.save();



        // Send OTP email via n8n
        let emailSent = false;
        try {
            await sendEmailNotification({
                type: 'registration',
                email,
                otp,
                fullName
            });
            emailSent = true;
            console.log('✅ Registration OTP sent via n8n to:', email);
        } catch (emailError: any) {
            console.error('❌ Failed to send OTP email via n8n:', emailError && emailError.message ? emailError.message : emailError);
            console.warn('⚠️  Bypassing OTP requirement due to EMAIL ERROR');

            // BYPASS MODE: Create user immediately without email verification

            // Create user
            const user = new User({
                fullName,
                email,
                phone,
                gender,
                avatarUrl,
                password: hashedPassword,
                isEmailVerified: true, // Auto-verify
            });

            // Skip hashing already hashed password
            (user as any).skipPasswordHash = true;

            // Generate tokens
            const accessToken = generateToken(user._id.toString());
            const refreshToken = generateRefreshToken(user._id.toString());
            user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });

            appendLoginHistoryEntry(user, req, 'browser');
            await user.save();

            // Delete OTP doc
            await otpDoc.deleteOne();

            // Set cookie
            setCookieToken(res, 'accessToken', accessToken, 180 * 24 * 60 * 60 * 1000);

            res.status(200).json({
                success: true,
                message: 'Account created successfully! (Email verification skipped due to service unavailability)',
                data: {
                    user: user.toJSON(),
                    accessToken,
                    refreshToken,
                },
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully! Please check your email to verify your account.',
            data: {
                email,
                requiresOtpVerification: true,
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
        });
    }
};

// Verify Email with OTP
export const verifyEmailOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;

        // Find pending registration OTP
        const otpDoc = await Otp.findOne({
    // @ts-ignore
            email,
            type: 'registration',
            otp,
        });

        if (!otpDoc) {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP or registration request not found.'
            });
            return;
        }

        // Check if OTP is expired
        if (otpDoc.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpDoc._id });
            res.status(400).json({
                success: false,
                message: 'OTP has expired. Please register again.'
            });
            return;
        }

        // Check if user already exists (shouldn't happen, but safety check)
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isEmailVerified) {
            await Otp.deleteOne({ _id: otpDoc._id });
            res.status(400).json({
                success: false,
                message: 'User with this email already exists.'
            });
            return;
        }

        // Extract registration data from OTP metadata


        const { fullName, phone, hashedPassword, gender, avatarUrl } = otpDoc.metadata as any;

        // Create the user account NOW (after OTP verification)
        const user = new User({
            fullName,
            email,
            phone,
            gender,
            avatarUrl,
            password: hashedPassword, // Already hashed
            isEmailVerified: true, // Mark as verified immediately
        });

        // Skip password hashing in pre-save hook since it's already hashed
        (user as any).skipPasswordHash = true;

        // Generate tokens
        const accessToken = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });

        appendLoginHistoryEntry(user, req, 'browser');
        await user.save();

        // Delete the OTP document after successful verification
        await Otp.deleteOne({ _id: otpDoc._id });

        // Set HTTP-only cookie (6 months for users)
        setCookieToken(res, 'accessToken', accessToken, 180 * 24 * 60 * 60 * 1000); // 6 months

        console.log('✅ User account created successfully:', email);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! Welcome to Botam Apparels!',
            data: {
                user: user.toJSON(),
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        console.error('Email OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during OTP verification',
        });
    }
};

// Resend Email OTP
export const resendEmailOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        // 1. Check if user already exists and is verified
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isEmailVerified) {
            res.status(400).json({ success: false, message: 'Email is already verified. Please login.' });
            return;
        }

        // 2. Find pending registration OTP
    // @ts-ignore
        const otpDoc = await Otp.findOne({ email, type: 'registration' });

        if (!otpDoc) {
            res.status(404).json({
                success: false,
                message: 'Registration session expired or invalid. Please register again.'
            });
            return;
        }

        // 3. Generate new OTP
        const newOtp = generateOTP();
        otpDoc.otp = newOtp;
        otpDoc.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await otpDoc.save();

        // 4. Send new OTP email via n8n
        const { fullName } = otpDoc.metadata as any;

        try {
            await sendEmailNotification({
                type: 'registration',
                email,
                otp: newOtp,
                fullName: fullName || 'User'
            });
            console.log('✅ Resend OTP email sent via n8n to:', email);
        } catch (emailError) {
            console.error('❌ Failed to resend OTP email via n8n:', emailError);
            throw new Error('Failed to send OTP email');
        }

        res.status(200).json({
            success: true,
            message: 'New OTP sent successfully. Please check your email.',
        });
    } catch (error: any) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during OTP resend',
        });
    }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: LoginRequest = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Account has been deactivated',
            });
            return;
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            res.status(403).json({
                success: false,
                message: 'Please verify your email address first.',
                data: {
                    email: user.email,
                    requiresOtpVerification: true,
                },
            });
            return;
        }

        // Generate tokens
        const accessToken = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        // Save refresh token
        user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
        user.lastLogin = new Date();
        appendLoginHistoryEntry(user, req, 'browser');
        await user.save();

        // Set HTTP-only cookie (6 months for users)
        setCookieToken(res, 'accessToken', accessToken, 180 * 24 * 60 * 60 * 1000); // 6 months

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            data: {
                user: user.toJSON(),
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
        });
    }
};

// Request login OTP (after password verification) - 2FA for customers
export const requestLoginOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
            return;
        }

        // Find user with password
        const user = await User.findOne({ email, isActive: true }).select('+password');

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Verify password first
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            res.status(403).json({
                success: false,
                message: 'Please verify your email address first.',
                data: {
                    email: user.email,
                    requiresOtpVerification: true,
                },
            });
            return;
        }

        // Generate 6-digit OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to user
        (user as any).loginOTP = otp;
        (user as any).loginOTPExpires = otpExpires;
        await user.save();

        // Send OTP email (switched to internal service)
        try {
            const { sendEmailNotification } = await import('../services/notificationService');
            await sendEmailNotification({
                type: 'login_otp',
                email,
                otp,
                fullName: user.fullName
            });
            console.log('✅ Login OTP sent via notification service to:', email);
        } catch (emailError: any) {
            console.error('❌ Failed to send login OTP:', emailError && emailError.message ? emailError.message : emailError);
            console.warn('⚠️  Bypassing Login OTP due to EMAIL ERROR');

            // BYPASS MODE: Login directly

            // Clear generated OTP
            (user as any).loginOTP = undefined;
            (user as any).loginOTPExpires = undefined;

            // Generate tokens
            const accessToken = generateToken(user._id.toString());
            const refreshToken = generateRefreshToken(user._id.toString());

            // Save refresh token and update login info
            user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
            user.lastLogin = new Date();
            appendLoginHistoryEntry(user, req, 'browser');
            await user.save();

            // Set HTTP-only cookie
            setCookieToken(res, 'accessToken', accessToken, 180 * 24 * 60 * 60 * 1000);

            res.status(200).json({
                success: true,
                message: 'Login successful! (OTP skipped due to service unavailability)',
                data: {
                    user: user.toJSON(),
                    accessToken,
                    refreshToken,
                },
            });
            return;
        }

        console.log('✅ Login OTP sent to:', email);

        res.status(200).json({
            success: true,
            message: 'Password verified. OTP sent to your email.',
            data: { email },
        });
    } catch (error: any) {
        console.error('Request login OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
        });
    }
};

// Verify login OTP and complete login
export const verifyLoginOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            res.status(400).json({
                success: false,
                message: 'Email and OTP are required',
            });
            return;
        }

        // Find user with OTP fields
        const user = await User.findOne({ email, isActive: true }).select('+loginOTP +loginOTPExpires');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Check OTP
        const userData = user as any;
        if (!userData.loginOTP || !userData.loginOTPExpires) {
            res.status(400).json({
                success: false,
                message: 'No OTP requested. Please request OTP first.',
            });
            return;
        }

        if (userData.loginOTP !== otp) {
            res.status(401).json({
                success: false,
                message: 'Invalid OTP',
            });
            return;
        }

        if (userData.loginOTPExpires < new Date()) {
            res.status(401).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
            return;
        }

        // Clear OTP
        userData.loginOTP = undefined;
        userData.loginOTPExpires = undefined;

        // Generate tokens
        const accessToken = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        // Save refresh token and update login info
        user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
        user.lastLogin = new Date();
        appendLoginHistoryEntry(user, req, 'browser');
        await user.save();

        // Set HTTP-only cookie (6 months for users)
        setCookieToken(res, 'accessToken', accessToken, 180 * 24 * 60 * 60 * 1000); // 6 months

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            data: {
                user: user.toJSON(),
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        console.error('Verify login OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};


// Logout user
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            req.user?.removeRefreshToken(refreshToken);
            await req.user?.save();
        }

        // Clear cookies
        clearCookieToken(res, 'accessToken');
        clearCookieToken(res, 'refreshToken');

        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout',
        });
    }
};

// Refresh token
export const refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        const user = req.user!;

        // Remove old refresh token
        user.removeRefreshToken(refreshToken);

        // Generate new tokens
        const newAccessToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        // Save new refresh token
        user.refreshTokens.push({ token: newRefreshToken, createdAt: new Date() });
        await user.save();

        // Set HTTP-only cookies (6 months for users)
        setCookieToken(res, 'accessToken', newAccessToken, 180 * 24 * 60 * 60 * 1000); // 6 months

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                user: user.toJSON(),
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error: any) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during token refresh',
        });
    }
};

// Get current user
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: req.user?.toJSON(),
        });
    } catch (error: any) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Update user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { fullName, phone } = req.body;
        const user = req.user!;

        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;

        if (req.body.gender) {
            if (req.body.gender) {
                user.gender = req.body.gender;
                user.isGenderSelected = true;

                // Update avatar based on new gender using ui-avatars.com
                const encodedName = encodeURIComponent(user.fullName);
                if (req.body.gender === 'Male') {
                    user.avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff&size=200`;
                } else if (req.body.gender === 'Female') {
                    user.avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=E91E63&color=fff&size=200`;
                } else {
                    user.avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=200`;
                }
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: user.toJSON(),
            },
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Change password
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user!._id;

        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
            return;
        }

        // Fetch user with password field (it's excluded by default)
        const user = await User.findById(userId).select('+password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
            return;
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        // Send password changed email notification
        try {
            const { sendEmailNotification } = await import('../services/notificationService');
            await sendEmailNotification({
                type: 'password_changed',
                email: user.email,
                fullName: user.fullName,
                changedAt: new Date().toISOString(),
                ipAddress: req.ip || req.socket.remoteAddress || 'Unknown'
            });
        } catch (emailError) {
            console.error('Failed to send password changed email:', emailError);
            // Don't fail the password change if email fails
        }

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Send OTP for password change
export const sendPasswordChangeOTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        if (!user.isEmailVerified) {
            res.status(400).json({
                success: false,
                message: 'Email must be verified to change password',
            });
            return;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 10 minute expiry
        user.emailVerificationOTP = otp;
        user.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Send OTP email
        try {
            const { sendEmailNotification } = await import('../services/notificationService');
            await sendEmailNotification({
                type: 'password_change_otp',
                email: user.email,
                fullName: user.fullName,
                otp: otp,
                expiresIn: '10 minutes'
            });

            console.log(`✅ Password change OTP sent to ${user.email}: ${otp}`);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP email',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email address',
        });
    } catch (error: any) {
        console.error('Send password change OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Change password with OTP verification
export const changePasswordWithOTP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { newPassword, otp } = req.body;
        const userId = req.user!._id;

        if (!newPassword || !otp) {
            res.status(400).json({
                success: false,
                message: 'New password and OTP are required',
            });
            return;
        }

        // Fetch user with password and OTP fields
        const user = await User.findById(userId).select('+password +emailVerificationOTP +emailVerificationOTPExpires');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Verify OTP
        if (!user.emailVerificationOTP || !user.emailVerificationOTPExpires) {
            res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new OTP.',
            });
            return;
        }

        if (user.emailVerificationOTPExpires < new Date()) {
            res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP.',
            });
            return;
        }

        if (user.emailVerificationOTP !== otp) {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
            return;
        }

        // Update password and clear OTP
        user.password = newPassword;
        user.emailVerificationOTP = undefined;
        user.emailVerificationOTPExpires = undefined;
        await user.save();

        // Send password changed email notification
        try {
            const { sendEmailNotification } = await import('../services/notificationService');
            await sendEmailNotification({
                type: 'password_changed',
                email: user.email,
                fullName: user.fullName,
                changedAt: new Date().toISOString(),
                ipAddress: req.ip || req.socket.remoteAddress || 'Unknown'
            });
        } catch (emailError) {
            console.error('Failed to send password changed email:', emailError);
            // Don't fail the password change if email fails
        }

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error: any) {
        console.error('Change password with OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};


// Get user addresses
export const getAddresses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;

        res.status(200).json({
            success: true,
            message: 'Addresses retrieved successfully',
            data: {
                addresses: user.shippingAddresses || [],
            },
        });
    } catch (error: any) {
        console.error('Get addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Add new address
export const addAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { street, city, state, pincode, country, isDefault } = req.body;
        const user = req.user!;

        if (!street || !city || !state || !pincode) {
            res.status(400).json({
                success: false,
                message: 'Street, city, state, and pincode are required',
            });
            return;
        }

        // If this is set as default, unset all other defaults
        if (isDefault) {
            user.shippingAddresses.forEach((addr: any) => {
                addr.isDefault = false;
            });
        }

        // Add new address
        user.shippingAddresses.push({
            street,
            city,
            state,
            pincode,
            country: country || 'India',
            isDefault: isDefault || false,
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: {
                addresses: user.shippingAddresses,
            },
        });
    } catch (error: any) {
        console.error('Add address error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Update address
export const updateAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { addressId } = req.params;
        const { street, city, state, pincode, country, isDefault } = req.body;
        const user = req.user!;

        const address = user.shippingAddresses.id(addressId);

        if (!address) {
            res.status(404).json({
                success: false,
                message: 'Address not found',
            });
            return;
        }

        // If this is set as default, unset all other defaults
        if (isDefault) {
            user.shippingAddresses.forEach((addr: any) => {
                addr.isDefault = false;
            });
        }

        // Update address fields
        if (street) address.street = street;
        if (city) address.city = city;
        if (state) address.state = state;
        if (pincode) address.pincode = pincode;
        if (country) address.country = country;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: {
                addresses: user.shippingAddresses,
            },
        });
    } catch (error: any) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Delete address
export const deleteAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { addressId } = req.params;
        const user = req.user!;

        const address = user.shippingAddresses.id(addressId);

        if (!address) {
            res.status(404).json({
                success: false,
                message: 'Address not found',
            });
            return;
        }

        // Remove address using pull
        user.shippingAddresses.pull(addressId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            data: {
                addresses: user.shippingAddresses,
            },
        });
    } catch (error: any) {
        console.error('Delete address error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Set default address
export const setDefaultAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { addressId } = req.params;
        const user = req.user!;

        const address = user.shippingAddresses.id(addressId);

        if (!address) {
            res.status(404).json({
                success: false,
                message: 'Address not found',
            });
            return;
        }

        // Unset all defaults
        user.shippingAddresses.forEach((addr: any) => {
            addr.isDefault = false;
        });

        // Set this as default
        address.isDefault = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Default address updated successfully',
            data: {
                addresses: user.shippingAddresses,
            },
        });
    } catch (error: any) {
        console.error('Set default address error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};


// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.passwordResetToken = otp; // Store OTP in the reset token field
        user.passwordResetExpires = otpExpiry;
        await user.save();

        // Send password reset OTP via n8n
        try {
            const { sendEmailNotification } = await import('../services/notificationService');
            // Use 'password_change_otp' which renders the OTP template
            await sendEmailNotification({
                type: 'password_change_otp',
                email: user.email,
                fullName: user.fullName,
                otp: otp,
                expiresIn: '10 minutes'
            } as any);
            console.log('✅ Password reset OTP sent to:', email);
        } catch (emailError) {
            console.error('❌ Failed to send password reset OTP:', emailError);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            throw new Error('Failed to send password reset email');
        }

        res.status(200).json({
            success: true,
            message: 'Password reset OTP sent to your email',
        });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        // Support both query param token (old link flow) and body otp (new flow)
        const { token } = req.query;
        const { email, otp, password } = req.body; // Expect email and otp for the new flow

        let user;

        if (email && otp) {
            // New OTP Flow
            user = await User.findOne({
                email: email,
                passwordResetToken: otp,
                passwordResetExpires: { $gt: Date.now() },
            });
        } else if (token) {
            // Old Link Flow (fallback)
            user = await User.findOne({
    // @ts-ignore
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() },
            });
        }

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP/token',
            });
            return;
        }

        if (!password) {
            res.status(400).json({
                success: false,
                message: 'New password is required',
            });
            return;
        }

        // Update password (will be hashed by pre-save hook)
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Google OAuth authentication
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.body;

        if (!code) {
            res.status(400).json({
                success: false,
                message: 'Authorization code is required',
            });
            return;
        }

        // Initialize OAuth2 client
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.CLIENT_URL + '/auth/google/callback'
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

        // Check if user exists
        let user = await User.findOne({ email: payload.email });
        let isNewUser = false;

        if (!user) {
            // Initialize new user (don't save yet)
            isNewUser = true;
            user = new User({
                fullName: payload.name || payload.email.split('@')[0],
                email: payload.email,
                avatarUrl: payload.picture,
                isEmailVerified: true, // Google emails are verified
                isActive: true,
            });
        } else {
            // Update user info
            if (payload.name) user.fullName = payload.name;
            // Only update avatar if user doesn't have one
            if (payload.picture && !user.avatarUrl) user.avatarUrl = payload.picture;
            user.isEmailVerified = true;
        }

        // Generate tokens
        const accessToken = generateToken(user._id.toString());
        const refreshToken = user.generateRefreshToken(); // Pushes to refreshTokens array

        // Append login history
        appendLoginHistoryEntry(user, req, 'browser');

        // Single save for both new and existing users
        await user.save();

        // Set HTTP-only cookie
        setCookieToken(res, 'accessToken', accessToken, 7 * 24 * 60 * 60 * 1000);

        res.status(200).json({
            success: true,
            message: 'Google authentication successful',
            data: {
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed',
        });
    }
};

// Send WhatsApp OTP
export const sendWhatsappOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            res.status(400).json({
                success: false,
                message: 'Phone number is required',
            });
            return;
        }

        // WhatsApp QR service disabled as per user request
        res.status(503).json({
            success: false,
            message: 'WhatsApp OTP service is currently unavailable.',
        });
    } catch (error: any) {
        console.error('Send WhatsApp OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
        });
    }
};

// Verify WhatsApp OTP
export const verifyWhatsappOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { phoneNumber, otp, verificationToken } = req.body;

        if (!phoneNumber || !otp) {
            res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required',
            });
            return;
        }

        const user = req.user!;

        // If user already has a phone number, require verificationToken
        if (user.phone && user.phone !== phoneNumber) { // Only if changing number
            if (!verificationToken) {
                res.status(403).json({
                    success: false,
                    message: 'Please verify your existing phone number first',
                });
                return;
            }

            try {
                const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET as string) as any;
                if (decoded.id !== user._id.toString() || decoded.type !== 'phone_change') {
                    res.status(403).json({
                        success: false,
                        message: 'Invalid verification token',
                    });
                    return;
                }
            } catch (error) {
                res.status(403).json({
                    success: false,
                    message: 'Verification session expired. Please try again.',
                });
                return;
            }
        }

        // Find OTP entry
    // @ts-ignore
        const otpEntry = await Otp.findOne({ phoneNumber });

        if (!otpEntry) {
            res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new one.',
            });
            return;
        }

        // Verify OTP hash
        const isValid = await bcrypt.compare(otp, otpEntry.otp);

        if (!isValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid OTP',
            });
            return;
        }

        // Update user's phone number and mark as verified
        console.log('📱 [VERIFY OTP] Before save - Phone Number:', phoneNumber);
        console.log('📱 [VERIFY OTP] User before update:', { id: user._id, currentPhone: user.phone });

        user.phone = phoneNumber;

        console.log('📱 [VERIFY OTP] User after assignment:', { id: user._id, newPhone: user.phone });

        await user.save();

        console.log('📱 [VERIFY OTP] User after save:', { id: user._id, savedPhone: user.phone });
        console.log('📱 [VERIFY OTP] Full user object:', user.toJSON());

        // Delete the OTP entry
        await Otp.deleteOne({ _id: otpEntry._id });

        res.status(200).json({
            success: true,
            message: 'Phone number verified and updated successfully',
            data: {
                user: user.toJSON(),
            },
        });
    } catch (error: any) {
        console.error('Verify WhatsApp OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
        });
    }
};

// Verify Old Phone OTP (Step 1 of Phone Change)
export const verifyOldPhoneOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { otp } = req.body;
        const user = req.user!;

        if (!user.phone) {
            res.status(400).json({
                success: false,
                message: 'No existing phone number to verify',
            });
            return;
        }

        if (!otp) {
            res.status(400).json({
                success: false,
                message: 'OTP is required',
            });
            return;
        }

        // Find OTP entry for the EXISTING phone number
    // @ts-ignore
        const otpEntry = await Otp.findOne({ phoneNumber: user.phone });

        if (!otpEntry) {
            res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new one.',
            });
            return;
        }

        // Verify OTP hash
        const isValid = await bcrypt.compare(otp, otpEntry.otp);

        if (!isValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid OTP',
            });
            return;
        }

        // Generate verification token
        const verificationToken = jwt.sign(
            { id: user._id, type: 'phone_change' },
            process.env.JWT_SECRET as string,
            { expiresIn: '15m' }
        );

        // Delete the OTP entry
        await Otp.deleteOne({ _id: otpEntry._id });

        res.status(200).json({
            success: true,
            message: 'Existing phone number verified',
            data: {
                verificationToken,
            },
        });
    } catch (error: any) {
        console.error('Verify Old Phone OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
        });
    }
};

