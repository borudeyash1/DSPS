import { Response } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export const setCookieToken = (res: Response, name: string, token: string, maxAge?: number): void => {
    res.cookie(name, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: maxAge || 7 * 24 * 60 * 60 * 1000, // 7 days default
    });
};

export const clearCookieToken = (res: Response, name: string): void => {
    res.clearCookie(name, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
};
