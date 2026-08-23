import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { getShiprocketService } from '../services/shiprocketService';
import Order from '../models/Order';

/**
 * Create shipment in Shiprocket from existing order
 */
export const createShipment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { orderId } = req.body;

        // Get order from database
        const order = await Order.findById(orderId).populate('user');

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }

        // Prepare Shiprocket order payload
        const fullName = order.shippingAddress.fullName || (order.user as any)?.fullName || 'Customer';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        const shiprocketPayload = {
            order_id: order._id.toString(),
            order_date: order.createdAt.toISOString().split('T')[0],
            pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
            channel_id: '',
            comment: order.notes || '',
            billing_customer_name: firstName,
            billing_last_name: lastName,
            billing_address: order.shippingAddress.street,
            billing_address_2: order.shippingAddress.landmark || '',
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.pincode,
            billing_state: order.shippingAddress.state,
            billing_country: order.shippingAddress.country || 'India',
            billing_email: (order.user as any)?.email || 'customer@botanapparels.com',
            billing_phone: order.shippingAddress.phone || (order.user as any)?.phone || '9999999999',
            shipping_is_billing: true,
            order_items: order.items.map(item => ({
                name: item.name,
                sku: item.product?.toString() || 'SKU-' + item.name.substring(0, 10),
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: 0
            })),
            payment_method: order.paymentMethod === 'cod' ? 'COD' as const : 'Prepaid' as const,
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: order.totalAmount,
            length: 10, // Default dimensions in cm
            breadth: 10,
            height: 10,
            weight: 0.5 // Default weight in kg
        };

        const shiprocket = getShiprocketService();
        const result = await shiprocket.createOrder(shiprocketPayload);

        // Update order with Shiprocket details
        (order as any).shiprocketOrderId = result.order_id;
        (order as any).shiprocketShipmentId = result.shipment_id;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Shipment created successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Create shipment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create shipment'
        });
    }
};

/**
 * Check courier serviceability
 */
export const checkServiceability = async (req: Request, res: Response): Promise<void> => {
    try {
        const { pickupPincode, deliveryPincode, cod, weight } = req.body;

        if (!pickupPincode || !deliveryPincode || weight === undefined) {
            res.status(400).json({
                success: false,
                message: 'Pickup pincode, delivery pincode, and weight are required'
            });
            return;
        }

        const shiprocket = getShiprocketService();
        const result = await shiprocket.checkServiceability({
            pickup_postcode: pickupPincode,
            delivery_postcode: deliveryPincode,
            cod: cod ? 1 : 0,
            weight: parseFloat(weight)
        });

        res.status(200).json({
            success: true,
            message: 'Serviceability check completed',
            data: result
        });
    } catch (error: any) {
        console.error('Check serviceability error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check serviceability'
        });
    }
};

/**
 * Generate AWB for shipment
 */
export const generateAWB = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { shipmentId, courierId } = req.body;

        if (!shipmentId || !courierId) {
            res.status(400).json({
                success: false,
                message: 'Shipment ID and Courier ID are required'
            });
            return;
        }

        const shiprocket = getShiprocketService();
        const result = await shiprocket.generateAWB(parseInt(shipmentId), parseInt(courierId));

        res.status(200).json({
            success: true,
            message: 'AWB generated successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Generate AWB error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate AWB'
        });
    }
};

/**
 * Track shipment
 */
export const trackShipment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { awbOrOrderId } = req.params;

        if (!awbOrOrderId) {
            res.status(400).json({
                success: false,
                message: 'AWB or Order ID is required'
            });
            return;
        }

        let awbToTrack = awbOrOrderId;

        // 1. Try to find order in database by _id, shiprocketOrderId, or awbCode
        // Check if input is a valid MongoDB ObjectId
    // @ts-ignore
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(awbOrOrderId);
    // @ts-ignore
        const isNumeric = /^\d+$/.test(awbOrOrderId);
        
        const query: any = {
            $or: [
                { awbCode: awbOrOrderId }
            ]
        };

        // Only add shiprocketOrderId to query if input is numeric
        if (isNumeric) {
    // @ts-ignore
            query.$or.push({ shiprocketOrderId: parseInt(awbOrOrderId) });
        }

        if (isValidObjectId) {
            query.$or.push({ _id: awbOrOrderId });
        }

        const order = await Order.findOne(query);

        if (order && order.awbCode) {
            console.log(`✅ [TRACKING] Found order ${order._id} for input ${awbOrOrderId}. Using AWB: ${order.awbCode}`);
            awbToTrack = order.awbCode;
        } else if (order && !order.awbCode) {
             console.log(`⚠️ [TRACKING] Found order ${order._id} but no AWB assigned yet.`);
             // If we found an order but no AWB, we can't track it via Shiprocket AWB endpoint.
             // But we can return the local status.
             res.status(200).json({
                success: true,
                message: 'Order found but shipment not yet generated',
                data: {
                    tracking_data: {
                        track_status: 0,
                        shipment_status: 0,
                        shipment_track: [],
                        shipment_track_activities: [],
                        track_url: '',
                        etd: '',
                        current_status: order.status || 'Processing'
                    }
                }
            });
            return;
        } else {
            // No order found in database, assume it's an AWB code and track directly
            console.log(`📦 [TRACKING] No order found in database for ${awbOrOrderId}. Tracking directly via Shiprocket API.`);
        }

        const shiprocket = getShiprocketService();
    // @ts-ignore
        const result = await shiprocket.trackShipment(awbToTrack);

        res.status(200).json({
            success: true,
            message: 'Tracking data retrieved',
            data: result
        });
    } catch (error: any) {
        console.error('Track shipment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to track shipment'
        });
    }
};

/**
 * Cancel shipment
 */
export const cancelShipment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { orderIds } = req.body;

        if (!orderIds || !Array.isArray(orderIds)) {
            res.status(400).json({
                success: false,
                message: 'Order IDs array is required'
            });
            return;
        }

        const shiprocket = getShiprocketService();
        const result = await shiprocket.cancelShipment(orderIds.map(id => parseInt(id)));

        res.status(200).json({
            success: true,
            message: 'Shipment cancelled successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Cancel shipment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to cancel shipment'
        });
    }
};

/**
 * Generate shipping label
 */
export const generateLabel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { shipmentIds } = req.body;

        if (!shipmentIds || !Array.isArray(shipmentIds)) {
            res.status(400).json({
                success: false,
                message: 'Shipment IDs array is required'
            });
            return;
        }

        const shiprocket = getShiprocketService();
        const result = await shiprocket.generateLabel(shipmentIds.map(id => parseInt(id)));

        res.status(200).json({
            success: true,
            message: 'Label generated successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Generate label error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate label'
        });
    }
};

/**
 * Request pickup
 */
export const requestPickup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { shipmentIds } = req.body;

        if (!shipmentIds || !Array.isArray(shipmentIds)) {
            res.status(400).json({
                success: false,
                message: 'Shipment IDs array is required'
            });
            return;
        }

        const shiprocket = getShiprocketService();
        const result = await shiprocket.requestPickup(shipmentIds.map(id => parseInt(id)));

        res.status(200).json({
            success: true,
            message: 'Pickup requested successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Request pickup error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to request pickup'
        });
    }
};

/**
 * Get pickup locations
 */
export const getPickupLocations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const shiprocket = getShiprocketService();
        const result = await shiprocket.getPickupLocations();

        res.status(200).json({
            success: true,
            message: 'Pickup locations retrieved',
            data: result
        });
    } catch (error: any) {
        console.error('Get pickup locations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get pickup locations'
        });
    }
};

/**
 * Get wallet balance
 */
export const getWalletBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const shiprocket = getShiprocketService();
        const result = await shiprocket.getWalletBalance();

        res.status(200).json({
            success: true,
            message: 'Wallet balance retrieved',
            data: result
        });
    } catch (error: any) {
        console.error('Get wallet balance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get wallet balance'
        });
    }
};

/**
 * Get all Shiprocket orders
 */
export const getShiprocketOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, perPage = 10 } = req.query;

        const shiprocket = getShiprocketService();
        const result = await shiprocket.getOrders(parseInt(page as string), parseInt(perPage as string));

        // Enrich with local data (Label URL)
        if (result && result.data && Array.isArray(result.data)) {
            const shiprocketOrderIds = result.data.map((o: any) => o.id);
            
            // Find corresponding local orders
            const localOrders = await Order.find({ 
                shiprocketOrderId: { $in: shiprocketOrderIds } 
            }).select('shiprocketOrderId labelUrl');

            // Create map
            const labelMap = new Map();
            localOrders.forEach(order => {
                if (order.shiprocketOrderId && order.labelUrl) {
                    labelMap.set(order.shiprocketOrderId, order.labelUrl);
                }
            });

            // Attach labelUrl to Shiprocket orders
            result.data = result.data.map((o: any) => ({
                ...o,
                label_url: labelMap.get(o.id) || null
            }));
        }

        res.status(200).json({
            success: true,
            message: 'Orders retrieved',
            data: result
        });
    } catch (error: any) {
        console.error('Get Shiprocket orders error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get orders'
        });
    }
};

/**
 * Update customer delivery address
 */
export const updateDeliveryAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const {
            order_id,
            shipping_customer_name,
            shipping_phone,
            shipping_address,
            shipping_address_2,
            shipping_city,
            shipping_state,
            shipping_country,
            shipping_pincode,
            shipping_email,
            billing_alternate_phone
        } = req.body;

        // Validation
        if (!order_id || !shipping_customer_name || !shipping_phone || !shipping_address || 
            !shipping_city || !shipping_state || !shipping_country || !shipping_pincode) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
            return;
        }

        const shiprocket = getShiprocketService();
        const result = await shiprocket.updateDeliveryAddress({
            order_id,
            shipping_customer_name,
            shipping_phone,
            shipping_address,
            shipping_address_2,
            shipping_city,
            shipping_state,
            shipping_country,
            shipping_pincode: parseInt(shipping_pincode),
            shipping_email,
            billing_alternate_phone
        });

        res.status(200).json({
            success: true,
            message: 'Delivery address updated successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Update delivery address error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update delivery address'
        });
    }
};

