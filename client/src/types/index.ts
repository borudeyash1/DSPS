// Product Types
export interface Product {
    _id: string;
    name: string;
    description: string;
    category: 'men' | 'women' | 'kids' | 'living';
    subcategory?: string;
    type?: string;
    price: number;
    discountPrice?: number;
    stock: number;
    sizes: Array<'One Size' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL'>;
    colors: string[];
    images: Array<{
        url: string;
        publicId: string;
        isMain: boolean;
    }>;
    videos?: Array<{
        url: string;
        publicId: string;
    }>;
    colorVariants?: Array<{
        color: string;
        colorHex?: string;
        images?: Array<{
            url: string;
            publicId?: string;
            view?: string;
        }>;
    }>;
    status?: 'active' | 'coming-soon' | 'inactive';
    isFeatured: boolean;
    isActive: boolean;
    rating?: number;
    reviewCount?: number;
    wishlistCount?: number;
    createdAt: string;
    updatedAt: string;
}

// User Types
export interface User {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    gender?: 'Male' | 'Female' | 'Other';
    isGenderSelected?: boolean;
    avatarUrl?: string;
    isEmailVerified: boolean;
    shippingAddresses: ShippingAddress[];
    wishlist: string[];
    orderHistory: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ShippingAddress {
    _id?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
}

// Cart Types
export interface CartItem {
    product: Product;
    quantity: number;
    size: string;
    color: string;
}

// Order Types
export interface Order {
    _id: string;
    user: string;
    items: Array<{
        product: string;
        name: string;
        price: number;
        quantity: number;
        size: string;
        color: string;
        image: string;
    }>;
    shippingAddress: ShippingAddress;
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentMethod: 'cod' | 'online';
    paymentDetails?: {
        paymentId?: string;
        orderId?: string;
        method?: string;
        paidAt?: string;
    };
    trackingNumber?: string;
    // Shiprocket fields
    shiprocketOrderId?: number;
    shiprocketShipmentId?: number;
    awbCode?: string;
    courierName?: string;
    shiprocketStatus?: string;
    estimatedDeliveryDate?: string;
    courierTrackingUrl?: string;
    pickupScheduledDate?: string;
    labelUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
