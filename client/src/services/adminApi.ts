import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance for ADMIN
const adminApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Request interceptor to add ADMIN auth token
adminApi.interceptors.request.use(
    (config) => {
        // Look for ADMIN token specifically
        const token = localStorage.getItem('adminAccessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle ADMIN token refresh
adminApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('adminRefreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/admin/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data.data;
                    localStorage.setItem('adminAccessToken', accessToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return adminApi(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear admin auth data
                console.log('🔒 Admin session expired');
                localStorage.removeItem('adminAccessToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('admin-storage');

                window.location.href = '/my-admin/login?error=session_expired';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default adminApi;
