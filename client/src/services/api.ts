import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Queue for pending requests while token is refreshing
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    
    failedQueue = [];
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // If currently refreshing, add to queue
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject: (err: any) => {
                            reject(err);
                        }
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);
                    
                     // Update header for next requests
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                    processQueue(null, accessToken);
                    
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } else {
                    throw new Error('No refresh token available');
                }
            } catch (refreshError) {
                // Refresh failed, clear ALL auth data and redirect to login
                processQueue(refreshError, null);
                
                console.log('🔒 Session expired - clearing all auth data');

                // Clear tokens
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                // Clear Zustand persisted auth state
                localStorage.removeItem('auth-storage');

                // Clear any other auth-related storage
                localStorage.removeItem('cart-storage');
                localStorage.removeItem('wishlist-storage');

                // Redirect to login with current path for redirect after login
                const currentPath = window.location.pathname;
                const redirectParam = currentPath !== '/login' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
                window.location.href = `/login${redirectParam}`;

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
