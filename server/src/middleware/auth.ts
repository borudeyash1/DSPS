import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Admin from '../models/Admin';
import { AuthenticatedRequest, JWTPayload } from '../types';

// Verify JWT token
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token;

        // Priority 1: Check Authorization header (Explicit Bearer token)
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        }
        // Priority 2: Check cookie (Implicit session)
        else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        // Priority 3: Check query parameter (OAuth redirects)
        else if (req.query.token) {
            token = req.query.token as string;
        }

        console.log('🔐 [AUTH] Cookie token:', !!req.cookies?.accessToken);
        console.log('🔐 [AUTH] Header token:', !!req.headers.authorization);
        console.log('🔐 [AUTH] Token found:', !!token);

        if (!token) {
            console.log('❌ [AUTH] No token provided');
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // Check if this is an admin token
        if (decoded.type === 'admin') {
            const admin = await Admin.findById(decoded.id).select('-password');
            if (!admin) {
                res.status(401).json({
                    success: false,
                    message: 'Token is valid but admin no longer exists.'
                });
                return;
            }

            if (!admin.isActive) {
                res.status(401).json({
                    success: false,
                    message: 'Admin account has been deactivated.'
                });
                return;
            }

            const authReq = req as AuthenticatedRequest;
            authReq.user = admin as any;
            authReq.isAdmin = true;
            authReq.deviceId = decoded.deviceId;
            authReq.deviceType = decoded.deviceType;
            next();
            return;
        }

        // Regular user authentication
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Token is valid but user no longer exists.'
            });
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Account has been deactivated.'
            });
            return;
        }

        (req as AuthenticatedRequest).user = user;
        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
            return;
        }

        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: 'Token has expired.'
            });
            return;
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

// Verify refresh token
export const authenticateRefresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token is required.'
            });
            return;
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JWTPayload;

        // Check if user exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token.'
            });
            return;
        }

        // Check if refresh token exists in user's refresh tokens
        const tokenExists = user.refreshTokens.some(token => token.token === refreshToken);
        if (!tokenExists) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token.'
            });
            return;
        }

        const authReq = req as AuthenticatedRequest;
        authReq.user = user;
        authReq.refreshToken = refreshToken;
        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token.'
            });
            return;
        }

        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: 'Refresh token has expired.'
            });
            return;
        }

        console.error('Refresh auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during refresh token authentication.'
        });
    }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);

        if (!token) {
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

        // Check if user still exists
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
            req.user = user;
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without setting req.user
        next();
    }
};

// Admin-only middleware
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.isAdmin) {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
        return;
    }
    next();
};

// Trust Device restriction middleware
export const requireFullAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // Super admins and developers bypass device restrictions
    if (req.user && ['super-admin', 'developer'].includes(req.user.role)) {
        next();
        return;
    }

    // If device is 'trusted', it has limited access
    if (req.deviceType === 'trusted') {
        res.status(403).json({
            success: false,
            message: 'Access denied. This action is restricted on Trusted devices.'
        });
        return;
    }
    next();
};

// Super Admin / Developer only middleware
export const requireSuperAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.isAdmin || !req.user || !['super-admin', 'developer'].includes(req.user.role)) {
        res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin or Developer privileges required.'
        });
        return;
    }
    next();
};

// Developer-only middleware (for sections management)
export const requireDeveloper = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.isAdmin || !req.user || req.user.role !== 'developer') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Developer privileges required.'
        });
        return;
    }
    next();
};

// Super Admin or Developer (alias for requireSuperAdmin for clarity)
export const requireSuperAdminOrDeveloper = requireSuperAdmin;

// Role authorization middleware
export const authorize = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
            return;
        }

        next();
    };
};
