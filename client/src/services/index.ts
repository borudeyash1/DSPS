import api from './api';

// Auth Types
export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
}

export interface VerifyOTPData {
    email: string;
    otp: string;
}

// Auth Service
export const authService = {
    // Register new user
    register: async (data: RegisterData) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    // Verify email with OTP
    verifyEmail: async (data: VerifyOTPData) => {
        const response = await api.post('/auth/verify-email', data);
        if (response.data.success) {
            const { accessToken, refreshToken, user } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return response.data;
    },

    // Resend OTP
    resendOTP: async (email: string) => {
        const response = await api.post('/auth/resend-otp', { email });
        return response.data;
    },

    // Login
    login: async (data: LoginData) => {
        const response = await api.post('/auth/login', data);
        if (response.data.success && response.data.data.accessToken) {
            const { accessToken, refreshToken, user } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return response.data;
    },

    // Logout
    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        await api.post('/auth/logout', { refreshToken });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Forgot password
    forgotPassword: async (email: string) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password
    resetPassword: async (email: string, otp: string, password: string) => {
        const response = await api.post('/auth/reset-password', { email, otp, password });
        return response.data;
    },

    // Google OAuth
    googleAuth: async (code: string) => {
        console.log('📤 [authService] Sending to /auth/google with code:', code);
        const response = await api.post('/auth/google', { code });
        console.log('📥 [authService] Response:', response.data);
        if (response.data.success) {
            const { accessToken, refreshToken, user } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return response.data;
    },
};

// Product Service
export const productService = {
    // Get all products (PUBLIC)
    getProducts: async (params?: {
        category?: string;
        subcategory?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        sort?: string;
        page?: number;
        limit?: number;
    }) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    // Get featured products (PUBLIC)
    getFeaturedProducts: async () => {
        const response = await api.get('/products/featured');
        return response.data;
    },

    // Get product by ID (PUBLIC)
    getProductById: async (id: string) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },
};

// Order Service
export const orderService = {
    // Create order (AUTHENTICATED)
    createOrder: async (orderData: {
        items: Array<{
            productId: string;
            quantity: number;
            size: string;
            color: string;
        }>;
        shippingAddress: {
            street: string;
            city: string;
            state: string;
            pincode: string;
            country: string;
        };
        paymentMethod: 'cod' | 'online';
    }) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    // Get user's orders
    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    // Get order by ID
    getOrderById: async (id: string) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // Cancel order
    cancelOrder: async (id: string) => {
        const response = await api.put(`/orders/${id}/cancel`);
        return response.data;
    },
};
