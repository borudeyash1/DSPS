import Order from '../models/Order';
import Product from '../models/Product';
import { getShiprocketService } from './shiprocketService';

/**
 * Shipping Automation Service
 * Handles automatic shipment creation and management
 */

interface CreateShipmentOptions {
    orderId: string;
    autoGenerateAWB?: boolean;
    autoSchedulePickup?: boolean;
}

/**
 * Calculate total weight for order items
 */
const calculateOrderWeight = async (items: any[]): Promise<number> => {
    let totalWeight = 0;

    for (const item of items) {
        try {
            const product = await Product.findById(item.product);
            const itemWeight = product?.shippingInfo?.weight || parseFloat(process.env.DEFAULT_PRODUCT_WEIGHT || '0.5');
            totalWeight += itemWeight * item.quantity;
        } catch (error) {
            console.error(`Error fetching product ${item.product}:`, error);
            // Use default weight if product not found
            totalWeight += parseFloat(process.env.DEFAULT_PRODUCT_WEIGHT || '0.5') * item.quantity;
        }
    }

    return totalWeight;
};

/**
 * Calculate package dimensions based on items
 */
const calculatePackageDimensions = (itemCount: number) => {
    const baseLength = parseFloat(process.env.DEFAULT_PRODUCT_LENGTH || '10');
    const baseBreadth = parseFloat(process.env.DEFAULT_PRODUCT_BREADTH || '10');
    const baseHeight = parseFloat(process.env.DEFAULT_PRODUCT_HEIGHT || '10');

    // Adjust height for multiple items (stacked)
    const height = Math.min(baseHeight + (itemCount - 1) * 2, 20);

    return {
        length: baseLength,
        breadth: baseBreadth,
        height
    };
};

/**
 * Get HSN code based on product category
 */
const getHSNCode = (category?: string, type?: string): number => {
    const hsnMap: { [key: string]: number } = {
        'tshirt': 6109,
        'shirt-men': 6205,
        'shirt-women': 6206,
        'hoodie': 6110,
        'sweatshirt': 6110,
        'jeans': 6203,
        'jacket': 6201,
        'default': 6109
    };

    const key = type || category || 'default';
    return hsnMap[key.toLowerCase()] || hsnMap['default'];
};

/**
 * Create shipment automatically after order placement
 * 
 * Shiprocket Flow:
 * 1. Create Order in Shiprocket
 * 2. Assign AWB (Airway Bill Number)
 * 3. Generate Pickup Request
 * 4. Generate Label (optional)
 */
export const createShipmentAutomatically = async (options: CreateShipmentOptions): Promise<any> => {
    const { orderId, autoGenerateAWB = true, autoSchedulePickup = false } = options;

    try {
        console.log(`🚀 [SHIPPING] Starting automatic shipment creation for order: ${orderId}`);

        // Get order with populated user data
        const order = await Order.findById(orderId).populate('user');

        if (!order) {
            throw new Error('Order not found');
        }

        // Check if shipment already created
        if (order.shiprocketOrderId) {
            console.log(`⚠️  [SHIPPING] Shipment already exists for order: ${orderId}`);
            return {
                success: false,
                message: 'Shipment already created',
                shiprocketOrderId: order.shiprocketOrderId
            };
        }

        // Prepare customer details
        const fullName = order.shippingAddress.fullName || (order.user as any)?.fullName || 'Customer';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        // Calculate weight and dimensions
        const totalWeight = await calculateOrderWeight(order.items);
        const dimensions = calculatePackageDimensions(order.items.reduce((sum, item) => sum + item.quantity, 0));

        // Prepare order items for Shiprocket
        const orderItems = await Promise.all(
            order.items.map(async (item) => {
                let hsn = 6109; // Default
                let sku = `SKU-${item.product}`;

                try {
                    const product = await Product.findById(item.product);
                    if (product) {
                        hsn = parseInt(product.shippingInfo?.hsn || '6109');
                        sku = product.shippingInfo?.sku || `SKU-${item.product}`;
                    }
                } catch (error) {
                    console.error(`Error fetching product for HSN/SKU:`, error);
                }

                return {
                    name: `${item.name}${item.size ? ` - ${item.size}` : ''}${item.color ? ` (${item.color})` : ''}`,
                    sku,
                    units: item.quantity,
                    selling_price: item.price,
                    discount: 0,
                    tax: 0,
                    hsn
                };
            })
        );

        // Prepare Shiprocket payload
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
            order_items: orderItems,
            payment_method: order.paymentMethod === 'cod' ? 'COD' as const : 'Prepaid' as const,
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: order.discountAmount || 0,
            sub_total: order.totalAmount,
            length: dimensions.length,
            breadth: dimensions.breadth,
            height: dimensions.height,
            weight: totalWeight
        };

        console.log(`📦 [SHIPPING] Creating Shiprocket order with weight: ${totalWeight}kg, dimensions: ${dimensions.length}x${dimensions.breadth}x${dimensions.height}cm`);

        // STEP 1: Create order in Shiprocket
        const shiprocket = getShiprocketService();
        const result = await shiprocket.createOrder(shiprocketPayload);

        // Update order with Shiprocket details
        order.shiprocketOrderId = result.order_id;
        order.shiprocketShipmentId = result.shipment_id;
        order.shiprocketStatus = 'NEW';

        console.log(`✅ [SHIPPING] Step 1/4: Order created - Order ID: ${result.order_id}, Shipment ID: ${result.shipment_id}`);

        // STEP 2: Auto-generate AWB if requested
        if (autoGenerateAWB && result.shipment_id) {
            try {
                console.log(`📋 [SHIPPING] Step 2/4: Checking courier serviceability...`);
                
                // Check serviceability to get available couriers
                const serviceability = await shiprocket.checkServiceability({
                    pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE || '414001',
                    delivery_postcode: order.shippingAddress.pincode,
                    cod: order.paymentMethod === 'cod' ? 1 : 0,
                    weight: totalWeight
                });

                if (serviceability.data?.available_courier_companies?.length > 0) {
                    // Select the first recommended courier
                    const courier = serviceability.data.available_courier_companies[0];
                    
                    // Store estimated delivery date from courier
                    if (courier.etd) {
                        order.estimatedDeliveryDate = new Date(courier.etd);
                        console.log(`📅 [SHIPPING] Estimated delivery: ${courier.etd}`);
                    }
                    
                    console.log(`🚚 [SHIPPING] Generating AWB with courier: ${courier.courier_name} (ID: ${courier.courier_company_id})`);
                    
                    const awbResult = await shiprocket.generateAWB(result.shipment_id, courier.courier_company_id);
                    
                    if (awbResult.awb_assign_status === 1) {
                        order.awbCode = awbResult.response?.data?.awb_code;
                        order.courierName = courier.courier_name;
                        console.log(`✅ [SHIPPING] Step 2/4: AWB generated: ${order.awbCode}`);

                        // STEP 3: Generate Pickup Request (if enabled)
                        if (autoSchedulePickup) {
                            try {
                                console.log(`🚚 [SHIPPING] Step 3/4: Scheduling pickup...`);
                                const pickupResult = await shiprocket.requestPickup([result.shipment_id]);
                                
                                if (pickupResult.pickup_status === 1) {
                                    order.pickupScheduledDate = new Date(pickupResult.response?.pickup_scheduled_date);
                                    console.log(`✅ [SHIPPING] Step 3/4: Pickup scheduled for: ${pickupResult.response?.pickup_scheduled_date}`);
                                } else {
                                    console.log(`⚠️  [SHIPPING] Step 3/4: Pickup scheduling returned status 0`);
                                }
                            } catch (pickupError: any) {
                                console.error(`⚠️  [SHIPPING] Step 3/4: Pickup scheduling failed:`, pickupError.message);
                                // Continue even if pickup fails - can be scheduled manually
                            }
                        } else {
                            console.log(`⏭️  [SHIPPING] Step 3/4: Pickup scheduling skipped (autoSchedulePickup=false)`);
                        }

                        // STEP 4: Generate Label (optional but recommended)
                        try {
                            console.log(`🏷️  [SHIPPING] Step 4/4: Generating shipping label...`);
                            const labelResult = await shiprocket.generateLabel([result.shipment_id]);
                            
                            if (labelResult.label_url) {
                                order.labelUrl = labelResult.label_url;
                                console.log(`✅ [SHIPPING] Step 4/4: Label generated: ${labelResult.label_url}`);
                            }
                        } catch (labelError: any) {
                            console.error(`⚠️  [SHIPPING] Step 4/4: Label generation failed:`, labelError.message);
                            // Continue even if label generation fails - can be generated manually
                        }
                    } else {
                        console.log(`⚠️  [SHIPPING] AWB assignment returned status: ${awbResult.awb_assign_status}`);
                    }
                } else {
                    console.log(`⚠️  [SHIPPING] No courier available for this route`);
                }
            } catch (awbError: any) {
                console.error(`⚠️  [SHIPPING] AWB generation failed:`, awbError.message);
                // Continue even if AWB generation fails
            }
        } else {
            console.log(`⏭️  [SHIPPING] AWB generation skipped (autoGenerateAWB=false)`);
        }

        await order.save();

        console.log(`✅ [SHIPPING] Shipment creation complete for order: ${orderId}`);
        console.log(`📊 [SHIPPING] Summary:
            - Shiprocket Order ID: ${order.shiprocketOrderId}
            - Shipment ID: ${order.shiprocketShipmentId}
            - AWB Code: ${order.awbCode || 'Not generated'}
            - Courier: ${order.courierName || 'Not assigned'}
            - Pickup Scheduled: ${order.pickupScheduledDate ? 'Yes' : 'No'}
            - Label Generated: ${order.labelUrl ? 'Yes' : 'No'}
        `);

        return {
            success: true,
            message: 'Shipment created successfully',
            data: {
                shiprocketOrderId: order.shiprocketOrderId,
                shiprocketShipmentId: order.shiprocketShipmentId,
                awbCode: order.awbCode,
                courierName: order.courierName,
                pickupScheduled: !!order.pickupScheduledDate,
                labelUrl: order.labelUrl
            }
        };

    } catch (error: any) {
        console.error(`❌ [SHIPPING] Shipment creation failed for order ${orderId}:`, error.message);
        throw error;
    }
};

/**
 * Update order status based on Shiprocket webhook
 */
export const updateOrderFromWebhook = async (webhookData: any): Promise<void> => {
    try {
        const { order_id, current_status, awb, courier_name, etd, delivered_date } = webhookData;

        const order = await Order.findOne({ shiprocketOrderId: order_id });

        if (!order) {
            console.log(`⚠️  [WEBHOOK] Order not found for Shiprocket ID: ${order_id}`);
            return;
        }

        // Update order fields
        order.shiprocketStatus = current_status;
        if (awb) order.awbCode = awb;
        if (courier_name) order.courierName = courier_name;
        if (etd) order.estimatedDeliveryDate = new Date(etd);
        if (delivered_date) order.actualDeliveryDate = new Date(delivered_date);

        // Map Shiprocket status to our order status
        const statusMap: { [key: string]: string } = {
            'PICKUP_SCHEDULED': 'processing',
            'PICKED_UP': 'processing',
            'IN_TRANSIT': 'shipped',
            'OUT_FOR_DELIVERY': 'out_for_delivery',
            'DELIVERED': 'delivered',
            'CANCELLED': 'cancelled',
            'RTO': 'cancelled'
        };

        if (statusMap[current_status]) {
            order.status = statusMap[current_status] as any;
        }

        await order.save();

        console.log(`✅ [WEBHOOK] Order ${order._id} updated with status: ${current_status}`);

    } catch (error: any) {
        console.error(`❌ [WEBHOOK] Failed to update order:`, error.message);
        throw error;
    }
};

export default {
    createShipmentAutomatically,
    updateOrderFromWebhook
};
