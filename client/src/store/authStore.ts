import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: User | null) => void;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    verifyEmail: (email: string, otp: string) => Promise<void>;
    resendOTP: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.login({ email, password });
                    if (response.success && response.data.user) {
                        set({
                            user: response.data.user,
                            isAuthenticated: true,
                            isLoading: false
                        });
                    } else {
                        // OTP required
                        set({ isLoading: false });
                    }
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Login failed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    await authService.register(data);
                    set({ isLoading: false });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Registration failed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            verifyEmail: async (email, otp) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.verifyEmail({ email, otp });
                    if (response.success) {
                        set({
                            user: response.data.user,
                            isAuthenticated: true,
                            isLoading: false
                        });
                    }
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Verification failed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            resendOTP: async (email) => {
                set({ isLoading: true, error: null });
                try {
                    await authService.resendOTP(email);
                    set({ isLoading: false });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Failed to resend OTP',
                        isLoading: false
                    });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await authService.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    set({ user: null, isAuthenticated: false });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
