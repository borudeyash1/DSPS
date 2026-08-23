import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CategoryHierarchy {
    [category: string]: {
        [subcategory: string]: string[];
    };
}

interface CategoryState {
    hierarchy: CategoryHierarchy;
    loading: boolean;
    error: string;
    fetchHierarchy: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    hierarchy: {},
    loading: false,
    error: '',

    fetchHierarchy: async () => {
        set({ loading: true, error: '' });
        try {
            console.log('🔄 Fetching category hierarchy...');
            const response = await axios.get(`${API_URL}/categories/hierarchy`);
            console.log('✅ Hierarchy response:', response.data);
            console.log('📊 Hierarchy data:', response.data.data);
            console.log('📁 Categories:', Object.keys(response.data.data));
            
            // Log subcategories for each category
            Object.keys(response.data.data).forEach(cat => {
                console.log(`  └─ ${cat}:`, Object.keys(response.data.data[cat]));
            });
            
            set({ hierarchy: response.data.data, loading: false });
        } catch (error: any) {
            console.error('❌ Failed to fetch hierarchy:', error);
            set({ error: error.response?.data?.message || 'Failed to fetch categories', loading: false });
        }
    }
}));
