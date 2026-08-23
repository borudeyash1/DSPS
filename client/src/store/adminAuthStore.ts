import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { getDeviceId } from '../utils/deviceId';

interface Admin {
    _id: string;
    email: string;
    role: string;
}

interface AdminAuthState {
    admin: Admin | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    deviceAuthorized: boolean;

    // Actions
    checkDeviceAccess: (deviceId: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    setAdmin: (admin: Admin) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set) => ({
            admin: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            deviceAuthorized: false,

            checkDeviceAccess: async (deviceId: string) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await axios.post(`${API_URL}/admin/check-device`, {
                        deviceId,
                    });

                    const authorized = response.data.data.allowed;
                    set({ deviceAuthorized: authorized, isLoading: false });
                    return authorized;
                } catch (error: any) {
                    console.error('Device check error:', error);
                    set({
                        deviceAuthorized: false,
                        isLoading: false,
                        error: error.response?.data?.message || 'Device check failed',
                    });
                    return false;
                }
            },

            login: async (email: string, password: string) => {
                try {
                    set({ isLoading: true, error: null });

                    const deviceId = getDeviceId();
                    const response = await axios.post(
                        `${API_URL}/admin/login`,
                        { email, password, deviceId },
                        { withCredentials: true }
                    );

                    if (response.data.success) {
                        const admin = response.data.data.admin;
                        set({
                            admin,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });
                    }
                } catch (error: any) {
                    console.error('Admin login error:', error);
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || 'Login failed',
                    });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await axios.post(
                        `${API_URL}/admin/logout`,
                        {},
                        { withCredentials: true }
                    );
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    set({
                        admin: null,
                        isAuthenticated: false,
                        error: null,
                    });
                }
            },

            clearError: () => set({ error: null }),

            setAdmin: (admin: Admin) =>
                set({ admin, isAuthenticated: true }),
        }),
        {
            name: 'admin-auth-storage',
            partialize: (state) => ({
                admin: state.admin,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
