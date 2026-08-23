import { Request, Response } from 'express';
import Product from '../models/Product';
import path from 'path';
import SizeGuide from '../models/SizeGuide';
import { AuthenticatedRequest } from '../types';
import cloudinary from '../config/cloudinary';
import fs from 'fs';
import { buildSearchQuery, escapeRegex, fuzzySearch, expandQueryWithSynonyms } from '../utils/searchUtils';

// Get all products (PUBLIC - no auth required)
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            category,
            subcategory,
            type,
            minPrice,
            maxPrice,
            sizes,
            colors,
            search,
            sort = '-createdAt',
            page = 1,
            limit = 12,
        } = req.query;

        // Build filter
        const filter: any = {};
        const andConditions: any[] = [];

        // Filter by status - hide only explicitly inactive products
        if (req.query.status !== 'all') {
            andConditions.push(
                { status: { $not: /^inactive$/i } },
                { isActive: { $ne: false } }
            );
        }

        // Low Stock Filter
        if (req.query.lowStock === 'true') {
            filter.stock = { $lt: 10 };
        }

        if (category) {
            filter.category = new RegExp(`^\\s*${escapeRegex(category as string)}\\s*$`, 'i');
        }

        if (subcategory) {
            filter.subcategory = new RegExp(`^\\s*${escapeRegex(subcategory as string)}\\s*$`, 'i');
        }

        // Type filter
        if (type) {
            // Type can match either the 'type' field OR the product 'name'
            // This handles cases where products don't have explicit type field
            const typeRegex = new RegExp(`^\\s*${escapeRegex(type as string)}\\s*$`, 'i');
            andConditions.push({
                $or: [
                    { type: typeRegex },
                    { name: typeRegex }
                ]
            });
        }


        // Size filter (case-insensitive)
        if (sizes) {
            const sizeArray = (sizes as string).split(',').map(s => s.trim());
            if (sizeArray.length > 0) {
                andConditions.push({
                    sizes: { $in: sizeArray.map(s => new RegExp(`^${escapeRegex(s)}$`, 'i')) }
                });
            }
        }

        // Color filter (case-insensitive)
        if (colors) {
            const colorArray = (colors as string).split(',').map(c => c.trim());
            if (colorArray.length > 0) {
                andConditions.push({
                    colors: { $in: colorArray.map(c => new RegExp(`^${escapeRegex(c)}$`, 'i')) }
                });
            }
        }

        if (minPrice || maxPrice) {
            const priceConditions: any[] = [];

            // Check regular price
            const regularPriceFilter: any = {};
            if (minPrice) regularPriceFilter.$gte = Number(minPrice);
            if (maxPrice) regularPriceFilter.$lte = Number(maxPrice);

            // Check discount price (if product has discount, use discountPrice, otherwise use price)
            const discountPriceFilter: any = {};
            if (minPrice) discountPriceFilter.$gte = Number(minPrice);
            if (maxPrice) discountPriceFilter.$lte = Number(maxPrice);

            andConditions.push({
                $or: [
                    { price: regularPriceFilter, discountPrice: { $exists: false } },
                    { price: regularPriceFilter, discountPrice: null },
                    { discountPrice: discountPriceFilter }
                ]
            });
        }

        // Apply all AND conditions to the filter
        if (andConditions.length > 0) {
            filter.$and = andConditions;
        }

        console.log('🔍 [DEBUG] Search Request:', {
            query: req.query,
            constructedFilter: JSON.stringify(filter),
            andConditions: JSON.stringify(andConditions),
            sizesParam: sizes,
            colorsParam: colors
        });

        // Handle search with fuzzy matching
        let products: any[] = [];
        let total = 0;

        if (search) {
            console.log('🔍 [FUZZY SEARCH] Original query:', search);

            // Expand query with synonyms (e.g., "mobile" -> "mobile phone smartphone")
            const expandedQuery = expandQueryWithSynonyms(search as string);
            console.log('🔍 [FUZZY SEARCH] Expanded query:', expandedQuery);

            // First, get all products matching the filter (without search)
            // IMPORTANT: Use .lean() to get plain objects for Fuse.js
            const allFilteredProducts = await Product.find(filter).lean();
            console.log(`🔍 [FUZZY SEARCH] Database found ${allFilteredProducts.length} candidate products matching filters`);

            // Check if our specific product is in the candidates
            const debugTargetId = '69710f6147a4854761340ca2'; // Product ID from user issue
            const targetInCandidates = allFilteredProducts.find((p: any) => p._id.toString() === debugTargetId);
            if (targetInCandidates) {
                console.log('✅ [DEBUG] Target product IS in database candidates');
            } else {
                console.log('❌ [DEBUG] Target product is NOT in database candidates (Filtered out by MongoDB query)');
                // If filtered out, let's see why by checking the product directly
                try {
                    const checkProduct = await Product.findById(debugTargetId);
                    if (checkProduct) {
                        console.log('🧐 [DEBUG] Product exists in DB but failed filter. Product:', {
                            name: checkProduct.name,
                            category: checkProduct.category,
                            subcategory: checkProduct.subcategory,
                            status: (checkProduct as any).status,
                            isActive: (checkProduct as any).isActive,
                            type: (checkProduct as any).type
                        });
                    }
                } catch (e) { }
            }

            // Apply fuzzy search on filtered products
            const fuzzyResults = fuzzySearch(allFilteredProducts, expandedQuery, {
                threshold: 0.4,  // 0.4 allows for typos like "shrt" -> "shirt"
                keys: [
                    { name: 'name', weight: 2 },
                    { name: 'category', weight: 1.5 },
                    { name: 'subcategory', weight: 1.2 },
                    { name: 'description', weight: 0.8 },
                    { name: 'colorVariants.color', weight: 0.5 }
                ]
            });

            console.log(`🔍 [FUZZY SEARCH] Fuse.js returned ${fuzzyResults.length} matches`);

            if (targetInCandidates) {
                const targetInResults = fuzzyResults.find((p: any) => p._id.toString() === debugTargetId);
                if (targetInResults) {
                    console.log('✅ [DEBUG] Target product PASSED fuzzy search');
                } else {
                    console.log('❌ [DEBUG] Target product FAILED fuzzy search (Score too low?)');
                }
            }

            // Apply pagination to fuzzy results
            total = fuzzyResults.length;
            const skip = (Number(page) - 1) * Number(limit);
            products = fuzzyResults.slice(skip, skip + Number(limit));
        } else {
            // No search query - use standard MongoDB query with pagination
            const skip = (Number(page) - 1) * Number(limit);
            products = await Product.find(filter)
                .sort(sort as string)
                .skip(skip)
                .limit(Number(limit))
                .lean(); // Use lean for consistency

            total = await Product.countDocuments(filter);
        }

        console.log('🔍 [PRODUCTS] Final results:', products.length, 'products, Total:', total);

        // Calculate detailed stats
        // Active: status='active' OR (no status field AND isActive=true)
        // Inactive: status='inactive' OR isActive=false
        // Coming Soon: status='coming-soon'
        // Low Stock: stock < 10 AND not inactive
        const [totalActive, totalInactive, totalComingSoon, totalLowStock, absoluteTotal] = await Promise.all([
            Product.countDocuments({
                $or: [
                    { status: 'active' },
                    { status: { $exists: false }, isActive: true },
                    { status: null, isActive: true }
                ]
            }),
            Product.countDocuments({
                $or: [
                    { status: 'inactive' },
                    { isActive: false }
                ]
            }),
            Product.countDocuments({ status: 'coming-soon' }),
            Product.countDocuments({
                stock: { $lt: 10 },
                $or: [
                    { status: 'active' },
                    { status: 'coming-soon' },
                    { status: { $exists: false }, isActive: true },
                    { status: null, isActive: true }
                ]
            }),
            Product.countDocuments({})
        ]);

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
            stats: {
                total: absoluteTotal,
                active: totalActive,
                inactive: totalInactive,
                comingSoon: totalComingSoon,
                lowStock: totalLowStock
            }
        });
    } catch (error: any) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Get featured products (PUBLIC - no auth required)
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true })
            .sort('-createdAt')
            .limit(8);

        res.status(200).json({
            success: true,
            message: 'Featured products retrieved successfully',
            data: products,
        });
    } catch (error: any) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Get search suggestions (PUBLIC)
export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.query;

        if (!query || typeof query !== 'string' || query.length < 2) {
            res.status(200).json({ success: true, data: { products: [], categories: [], subcategories: [] } });
            return;
        }

        const search = query.toString();
        console.log('🔍 [SUGGESTIONS] Query:', search);

        // Get all active products for fuzzy search
        const allProducts = await Product.find({
            $or: [
                { status: 'active' },
                { status: { $exists: false }, isActive: true },
                { status: null, isActive: true }
            ]
        }).select('name category subcategory images price discountPrice').lean();

        // First try exact/partial match (case-insensitive)
        const searchLower = search.toLowerCase();
        const exactMatches = allProducts.filter((p: any) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.category?.toLowerCase().includes(searchLower) ||
            p.subcategory?.toLowerCase().includes(searchLower)
        );

        let fuzzyResults: any[] = [];

        // If we have exact matches, use them
        if (exactMatches.length > 0) {
            console.log('🔍 [SUGGESTIONS] Found exact matches:', exactMatches.length);
            fuzzyResults = exactMatches;
        } else {
            // Otherwise, use fuzzy search with synonym expansion
            const expandedQuery = expandQueryWithSynonyms(search);
            console.log('🔍 [SUGGESTIONS] Expanded:', expandedQuery);

            fuzzyResults = fuzzySearch(allProducts, expandedQuery, {
                threshold: 0.5,  // More lenient to catch exact matches
                keys: [
                    { name: 'name', weight: 3 },        // Name most important for suggestions
                    { name: 'category', weight: 2 },
                    { name: 'subcategory', weight: 1.5 }
                ]
            });
        }

        // Limit to top 5 products
        const products = fuzzyResults.slice(0, 5);

        // Extract unique categories and subcategories from results
        const categoriesSet = new Set<string>();
        const subcategoriesSet = new Set<string>();

        fuzzyResults.forEach((product: any) => {
            if (product.category) categoriesSet.add(product.category);
            if (product.subcategory) subcategoriesSet.add(product.subcategory);
        });

        const validCategories = Array.from(categoriesSet).slice(0, 3);
        const validSubcategories = Array.from(subcategoriesSet).slice(0, 3);

        console.log('🔍 [SUGGESTIONS] Found:', products.length, 'products,', validCategories.length, 'categories');

        res.status(200).json({
            success: true,
            data: {
                products: products.map(p => ({
                    id: p._id,
                    name: p.name,
                    price: p.price,
                    image: p.images?.[0]?.url || '',
                    category: p.category,
                    subcategory: p.subcategory
                })),
                categories: validCategories,
                subcategories: validSubcategories
            }
        });
    } catch (error: any) {
        console.error('Search suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Get single product by ID (PUBLIC - no auth required)
export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id).populate('sizeGuideId');

        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully',
            data: product,
        });
    } catch (error: any) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Create product with image upload (ADMIN ONLY)
export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const {
            name,
            description,
            category,
            subcategory,
            price,
            discountPrice,
            stock,
            sizes,
            colors,
            isFeatured,
        } = req.body;

        // Parse arrays if they're sent as strings
        const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;

        // Initialize local upload directory
        const uploadDir = path.join(process.cwd(), 'uploads/images/product');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Handle image uploads (Local Storage)
        const files = req.files as Express.Multer.File[];
        const images: Array<{ url: string; publicId: string; isMain: boolean }> = [];

        if (files && files.length > 0) {
            console.log(`📤 Processing ${files.length} images for local storage...`);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    // Move file to target directory
                    const filename = `product_${Date.now()}_${path.basename(file.originalname)}`;
                    const targetPath = path.join(uploadDir, filename);

                    // Copy file to target destination (rename might fail across partitions, copy+unlink is safer or just rename if same drive)
                    fs.copyFileSync(file.path, targetPath);
                    fs.unlinkSync(file.path); // Remove from temp (uploads/)

                    const fileUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/images/product/${filename}`;

                    images.push({
                        url: fileUrl,
                        publicId: `local_${Date.now()}_${i}`, // Local ID marker
                        isMain: i === 0, // First image is main
                    });

                    console.log(`✅ Saved local image: ${filename}`);
                } catch (uploadError) {
                    console.error(`❌ Failed to save local image ${i + 1}:`, uploadError);
                    // Cleanup temp file
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                }
            }
        }


        // Create product
        const product = new Product({
            name,
            description,
            category,
            subcategory,
            type: req.body.type, // ✅ Add type field
            price: Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : undefined,
            stock: Number(stock),
            sizes: parsedSizes,
            colors: parsedColors,
            images,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            // Phase 4 fields
            // Phase 4 fields - Parse JSON strings if necessary
            colorVariants: typeof req.body.colorVariants === 'string' ? JSON.parse(req.body.colorVariants) : (req.body.colorVariants || []),
            viewAngles: typeof req.body.viewAngles === 'string' ? JSON.parse(req.body.viewAngles) : (req.body.viewAngles || []),
            sizeChart: typeof req.body.sizeChart === 'string' ? JSON.parse(req.body.sizeChart) : (req.body.sizeChart || { image: '', measurements: [] }),
            deliveryInfo: typeof req.body.deliveryInfo === 'string' ? JSON.parse(req.body.deliveryInfo) : (req.body.deliveryInfo || {
                estimatedDays: 7,
                freeShippingThreshold: 0,
                returnPolicy: '7 days return policy'
            })
        });

        // 🎯 INTELLIGENCE: Auto-match size guide based on product type
        if (req.body.type) {
            const matchedGuide = await SizeGuide.findOne({
                productType: { $in: [req.body.type.toLowerCase()] }
            });
            if (matchedGuide) {
                product.sizeGuideId = matchedGuide._id as any;
                console.log(`✅ Auto-matched size guide: "${matchedGuide.name}" for product type "${req.body.type}"`);
            }
        }

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (error: any) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Update product (ADMIN ONLY)
export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            category,
            subcategory,
            price,
            discountPrice,
            stock,
            sizes,
            colors,
            images,      // ← ADD THIS
            videos,      // ← ADD THIS
            variants,    // ← ADD THIS
            isFeatured,
            isActive,
            removeImages,
        } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
            return;
        }

        // Update basic fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (category) product.category = category;
        if (subcategory) product.subcategory = subcategory;
        if (req.body.type !== undefined) product.type = req.body.type; // ✅ Add type field update
        if (price) product.price = Number(price);
        if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : undefined;
        if (stock !== undefined) product.stock = Number(stock);
        if (sizes) product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        if (colors) product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
        if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
        // Update images and videos from request body - filter out invalid objects
        if (images) {
            const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
            // Filter out empty objects and invalid image entries
            const validImages = parsedImages.filter((img: any) =>
                img &&
                typeof img === 'object' &&
                img.url &&
                typeof img.url === 'string' &&
                img.url.trim() !== '' &&
                img.url !== '{}'
            );
            product.images = validImages;
        }
        if (videos) product.videos = typeof videos === 'string' ? JSON.parse(videos) : videos;
        if (variants) product.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
        // Update Phase 4 fields
        if (req.body.colorVariants) product.colorVariants = typeof req.body.colorVariants === 'string' ? JSON.parse(req.body.colorVariants) : req.body.colorVariants;
        if (req.body.viewAngles) product.viewAngles = typeof req.body.viewAngles === 'string' ? JSON.parse(req.body.viewAngles) : req.body.viewAngles;
        if (req.body.sizeChart) product.sizeChart = typeof req.body.sizeChart === 'string' ? JSON.parse(req.body.sizeChart) : req.body.sizeChart;
        if (req.body.deliveryInfo) product.deliveryInfo = typeof req.body.deliveryInfo === 'string' ? JSON.parse(req.body.deliveryInfo) : req.body.deliveryInfo;
        if (req.body.status) (product as any).status = req.body.status;
        if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

        // Manual Rating Manipulation (Admin Force Update)
        if (req.body.rating !== undefined) product.rating = Number(req.body.rating);
        if (req.body.reviewCount !== undefined) product.reviewCount = Number(req.body.reviewCount);

        // 🎯 INTELLIGENCE: Auto-match size guide if product type changed
        if (req.body.type) {
            const matchedGuide = await SizeGuide.findOne({
                productType: { $in: [req.body.type.toLowerCase()] }
            });
            if (matchedGuide) {
                product.sizeGuideId = matchedGuide._id as any;
                console.log(`✅ Auto-matched size guide: "${matchedGuide.name}" for product type "${req.body.type}"`);
            }
        }

        // Log what we're about to save
        console.log('📦 Updating product with colorVariants:', {
            productId: id,
            colorVariantsCount: (product as any).colorVariants?.length || 0,
            colorVariantsData: (product as any).colorVariants
        });

        // Remove specified images from Cloudinary
        if (removeImages) {
            const imagesToRemove = typeof removeImages === 'string' ? JSON.parse(removeImages) : removeImages;
            for (const publicId of imagesToRemove) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                    product.images = product.images?.filter(img => img.publicId !== publicId) || [];
                    console.log(`✅ Removed image: ${publicId}`);
                } catch (error) {
                    console.error(`❌ Failed to remove image ${publicId}:`, error);
                }
            }
        }

        // Initialize local upload directory
        const uploadDir = path.join(process.cwd(), 'uploads/images/product');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Add new images
        const files = req.files as Express.Multer.File[];
        if (files && files.length > 0) {
            console.log(`📤 Processing ${files.length} new images for local storage...`);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    // Move file to target directory
                    const filename = `product_${Date.now()}_${path.basename(file.originalname)}`;
                    const targetPath = path.join(uploadDir, filename);

                    fs.copyFileSync(file.path, targetPath);
                    fs.unlinkSync(file.path);

                    const fileUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/images/product/${filename}`;

                    if (!product.images) product.images = [];
                    product.images.push({
                        url: fileUrl,
                        publicId: `local_${Date.now()}_${i}`,
                        isMain: product.images.length === 0,
                    });

                    console.log(`✅ Saved new local image: ${filename}`);
                } catch (uploadError) {
                    console.error(`❌ Failed to save new local image ${i + 1}:`, uploadError);
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                }
            }
        }

        await product.save();

        console.log('✅ Product saved! ColorVariants in DB:', {
            colorVariantsCount: (product as any).colorVariants?.length || 0
        });

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        });
    } catch (error: any) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Delete product (ADMIN ONLY)
export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
            return;
        }

        // Helper function to extract local file path from URL
        const getLocalFilePath = (url: string): string | null => {
            try {
                // Check if it's a local file URL (starts with /uploads/ or http://localhost:5000/uploads/)
                if (url.includes('/uploads/')) {
                    const urlPath = url.split('/uploads/')[1];
                    if (urlPath) {
                        return `uploads/${urlPath}`;
                    }
                }
                return null;
            } catch (error) {
                return null;
            }
        };

        // Delete local images from color variants
        if ((product as any).colorVariants && (product as any).colorVariants.length > 0) {
            console.log(`🗑️  Deleting color variant images...`);
            for (const variant of (product as any).colorVariants) {
                if (variant.images && variant.images.length > 0) {
                    for (const img of variant.images) {
                        const filePath = getLocalFilePath(img.url);
                        if (filePath && fs.existsSync(filePath)) {
                            try {
                                fs.unlinkSync(filePath);
                                console.log(`✅ Deleted local image: ${filePath}`);
                            } catch (error) {
                                console.error(`❌ Failed to delete ${filePath}:`, error);
                            }
                        }
                    }
                }
            }
        }

        // Delete legacy images (if any)
        if (product.images && product.images.length > 0) {
            console.log(`🗑️  Deleting ${product.images.length} legacy images...`);
            for (const image of product.images) {
                const filePath = getLocalFilePath(image.url);
                if (filePath && fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`✅ Deleted local image: ${filePath}`);
                    } catch (error) {
                        console.error(`❌ Failed to delete ${filePath}:`, error);
                    }
                }
            }
        }

        // Delete videos (if any)
        if ((product as any).videos && (product as any).videos.length > 0) {
            console.log(`🗑️  Deleting ${(product as any).videos.length} videos...`);
            for (const video of (product as any).videos) {
                const filePath = getLocalFilePath(video.url);
                if (filePath && fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`✅ Deleted local video: ${filePath}`);
                    } catch (error) {
                        console.error(`❌ Failed to delete ${filePath}:`, error);
                    }
                }
            }
        }

        // Delete product from database
        await Product.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Upload product image with organized folder structure (ADMIN ONLY)
export const uploadProductImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const file = req.file;
        const { imageUrl, isGoogleDrive, category, subcategory, type, productName } = req.body;

        // Handle Google Drive URL
        if (imageUrl && isGoogleDrive) {
            console.log('📤 Processing Google Drive URL...');

            // Convert Google Drive share URL to direct link
            let directUrl = imageUrl;
            const driveMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (driveMatch) {
                const fileId = driveMatch[1];
                directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
            }

            res.status(200).json({
                success: true,
                message: 'Google Drive URL processed successfully',
                data: {
                    url: directUrl,
                    publicId: `gdrive_${Date.now()}`,
                },
            });
            return;
        }

        // Handle file upload
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'No image uploaded or URL provided',
            });
            return;
        }

        console.log(`📤 Processing product image upload...`);

        // Create organized folder structure: category/subcategory/type/product-name/
        const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

        const folderParts = [
            'images',
            'products',
            category ? sanitize(category) : 'uncategorized',
            subcategory ? sanitize(subcategory) : 'general',
            type ? sanitize(type) : 'items',
            productName ? sanitize(productName) : 'unnamed'
        ];

        const folderPath = folderParts.join('/');

        // Ensure directory exists
        const fullPath = `uploads/${folderPath}`;
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`📁 Created directory: ${fullPath}`);
        }

        // Move file to organized folder
        const oldPath = file.path;
        const newPath = `${fullPath}/${file.filename}`;
        fs.renameSync(oldPath, newPath);

        const relativePath = `/uploads/${folderPath}/${file.filename}`;
        const baseUrl = process.env.BASE_URL || process.env.CLIENT_URL?.replace('/api', '') || 'http://localhost:5000';
        const fullUrl = `${baseUrl}${relativePath}`;

        console.log(`✅ Image saved to organized folder: ${fullUrl}`);

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: fullUrl,
                publicId: file.filename,
            },
        });
    } catch (error: any) {
        console.error('Upload product image error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Upload product image from URL (for LinkedIn, Instagram, etc.)
export const uploadProductImageFromUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            res.status(400).json({
                success: false,
                message: 'Image URL is required'
            });
            return;
        }

        // Fetch the image from the URL
        const axios = require('axios');
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        // Get content type
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
            res.status(400).json({
                success: false,
                message: 'URL does not point to a valid image'
            });
            return;
        }

        // Generate filename
        const path = require('path');
        const fs = require('fs');
        const extension = contentType.split('/')[1].split(';')[0];
        const filename = `product-${Date.now()}.${extension}`;
        const filepath = path.join(__dirname, '../../uploads/products', filename);

        // Ensure directory exists
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Save the image
        fs.writeFileSync(filepath, response.data);

        // Return the URL - use backend server URL
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const imageUrlResult = `${baseUrl}/uploads/products/${filename}`;

        res.json({
            success: true,
            data: { url: imageUrlResult }
        });
    } catch (error: any) {
        console.error('Upload product image from URL error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image from URL'
        });
    }
};