import axios from 'axios';

/**
 * Shiprocket API Service
 * 
 * Features:
 * - Authentication with email/password
 * - Create shipment orders
 * - Track shipments
 * - Generate AWB (Airway Bill)
 * - Get courier serviceability
 * - Cancel orders
 * - Print labels and manifests
 */

interface ShiprocketConfig {
    email: string;
    password: string;
    baseURL?: string;
}

interface ShiprocketAuthResponse {
    token: string;
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    company_id: number;
}

interface CreateOrderPayload {
    order_id: string;
    order_date: string;
    pickup_location: string;
    channel_id?: string;
    comment?: string;
    billing_customer_name: string;
    billing_last_name: string;
    billing_address: string;
    billing_address_2?: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    shipping_customer_name?: string;
    shipping_last_name?: string;
    shipping_address?: string;
    shipping_address_2?: string;
    shipping_city?: string;
    shipping_pincode?: string;
    shipping_state?: string;
    shipping_country?: string;
    shipping_email?: string;
    shipping_phone?: string;
    order_items: Array<{
        name: string;
        sku: string;
        units: number;
        selling_price: number;
        discount?: number;
        tax?: number;
        hsn?: number;
    }>;
    payment_method: 'Prepaid' | 'COD';
    shipping_charges?: number;
    giftwrap_charges?: number;
    transaction_charges?: number;
    total_discount?: number;
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
}

interface CourierServiceabilityPayload {
    pickup_postcode: string;
    delivery_postcode: string;
    cod: 0 | 1;
    weight: number;
}

class ShiprocketService {
    private baseURL: string;
    private email: string;
    private password: string;
    private token: string | null = null;
    private tokenExpiry: Date | null = null;

    constructor(config: ShiprocketConfig) {
        this.baseURL = config.baseURL || 'https://apiv2.shiprocket.in/v1/external';
        this.email = config.email;
        this.password = config.password;
    }

    /**
     * Authenticate with Shiprocket API
     */
    async authenticate(): Promise<string> {
        try {
            console.log('🔐 [SHIPROCKET] Authenticating...');

            const response = await axios.post<ShiprocketAuthResponse>(
                `${this.baseURL}/auth/login`,
                {
                    email: this.email,
                    password: this.password
                }
            );

            this.token = response.data.token;
            // Shiprocket tokens are valid for 10 days
            this.tokenExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

            console.log('✅ [SHIPROCKET] Authentication successful');
            return this.token;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Authentication failed:', error.response?.data || error.message);
            throw new Error('Shiprocket authentication failed');
        }
    }

    /**
     * Get valid token (auto-refresh if expired)
     */
    private async getToken(): Promise<string> {
        if (!this.token || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
            await this.authenticate();
        }
        return this.token!;
    }

    /**
     * Create a new order in Shiprocket
     */
    async createOrder(orderData: CreateOrderPayload): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('📦 [SHIPROCKET] Creating order:', orderData.order_id);

            const response = await axios.post(
                `${this.baseURL}/orders/create/adhoc`,
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Order created successfully');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Order creation failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Check courier serviceability
     */
    async checkServiceability(data: CourierServiceabilityPayload): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('🔍 [SHIPROCKET] Checking serviceability...');

            const response = await axios.get(
                `${this.baseURL}/courier/serviceability`,
                {
                    params: data,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Serviceability check complete');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Serviceability check failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate AWB (Airway Bill) for shipment
     */
    async generateAWB(shipmentId: number, courierId: number): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('📋 [SHIPROCKET] Generating AWB for shipment:', shipmentId);

            const response = await axios.post(
                `${this.baseURL}/courier/assign/awb`,
                {
                    shipment_id: shipmentId,
                    courier_id: courierId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ [SHIPROCKET] AWB generated successfully');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] AWB generation failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Track shipment by AWB or order ID
     */
    async trackShipment(awbOrOrderId: string): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('📍 [SHIPROCKET] Tracking shipment:', awbOrOrderId);

            const response = await axios.get(
                `${this.baseURL}/courier/track/awb/${awbOrOrderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Tracking data retrieved');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Tracking failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Cancel shipment
     */
    async cancelShipment(orderIds: number[]): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('❌ [SHIPROCKET] Cancelling shipment(s):', orderIds);

            const response = await axios.post(
                `${this.baseURL}/orders/cancel`,
                {
                    ids: orderIds
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Shipment cancelled successfully');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Cancellation failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate shipping label
     */
    async generateLabel(shipmentIds: number[]): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('🏷️ [SHIPROCKET] Generating label for shipment(s):', shipmentIds);

            const response = await axios.post(
                `${this.baseURL}/courier/generate/label`,
                {
                    shipment_id: shipmentIds
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Label generated successfully');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Label generation failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate manifest
     */
    async generateManifest(shipmentIds: number[]): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('📄 [SHIPROCKET] Generating manifest for shipment(s):', shipmentIds);

            const response = await axios.post(
                `${this.baseURL}/manifests/generate`,
                {
                    shipment_id: shipmentIds
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Manifest generated successfully');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Manifest generation failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get pickup locations
     */
    async getPickupLocations(): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('📍 [SHIPROCKET] Fetching pickup locations...');

            const response = await axios.get(
                `${this.baseURL}/settings/company/pickup`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Pickup locations retrieved');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Failed to fetch pickup locations:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Request pickup
     */
    async requestPickup(shipmentIds: number[]): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('🚚 [SHIPROCKET] Requesting pickup for shipment(s):', shipmentIds);

            const response = await axios.post(
                `${this.baseURL}/courier/generate/pickup`,
                {
                    shipment_id: shipmentIds
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Pickup requested successfully');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Pickup request failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Update customer delivery address
     */
    async updateDeliveryAddress(data: {
        order_id: number;
        shipping_customer_name: string;
        shipping_phone: string;
        shipping_address: string;
        shipping_address_2?: string;
        shipping_city: string;
        shipping_state: string;
        shipping_country: string;
        shipping_pincode: number;
        shipping_email?: string;
        billing_alternate_phone?: string;
    }): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('📝 [SHIPROCKET] Updating delivery address for order:', data.order_id);

            const response = await axios.post(
                `${this.baseURL}/orders/address/update`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Delivery address updated successfully');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Failed to update delivery address:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get wallet balance
     */
    async getWalletBalance(): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('💰 [SHIPROCKET] Fetching wallet balance...');

            const response = await axios.get(
                `${this.baseURL}/account/details/wallet-balance`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Wallet balance retrieved');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Failed to fetch wallet balance:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get all orders
     */
    async getOrders(page: number = 1, perPage: number = 10): Promise<any> {
        try {
            const token = await this.getToken();

            console.log('📦 [SHIPROCKET] Fetching orders...');

            const response = await axios.get(
                `${this.baseURL}/orders`,
                {
                    params: { page, per_page: perPage },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('✅ [SHIPROCKET] Orders retrieved');
            return response.data;
        } catch (error: any) {
            console.error('❌ [SHIPROCKET] Failed to fetch orders:', error.response?.data || error.message);
            throw error;
        }
    }
}

// Create singleton instance
let shiprocketInstance: ShiprocketService | null = null;

export const initializeShiprocket = (config: ShiprocketConfig): ShiprocketService => {
    shiprocketInstance = new ShiprocketService(config);
    return shiprocketInstance;
};

export const getShiprocketService = (): ShiprocketService => {
    if (!shiprocketInstance) {
        throw new Error('Shiprocket service not initialized. Call initializeShiprocket first.');
    }
    return shiprocketInstance;
};

export default ShiprocketService;
