import rateLimit from 'express-rate-limit';

export const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5, // Limit each IP to 5 requests per `window` (here, per hour)
    message: {
        success: false,
        message: 'Too many messages sent from this IP, please try again after an hour',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
