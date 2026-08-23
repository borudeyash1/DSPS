import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import Blog from '../models/Blog';
import Product from '../models/Product';
import Section from '../models/Section';

// Configuration
const UPLOAD_DIRS = [
    path.join(process.cwd(), 'uploads/blogs'),
    path.join(process.cwd(), 'uploads/images/product'),
    path.join(process.cwd(), 'uploads/sections'),
    path.join(process.cwd(), 'uploads/videos/sections'),
    path.join(process.cwd(), 'uploads'), // Generic uploads
];

const CLEANUP_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour grace period

/**
 * Cleanup orphaned files that are not referenced in the database
 */
export const cleanupOrphanedFiles = async () => {
    console.log('🧹 Starting orphaned file cleanup...');
    let deletedCount = 0;

    try {
        // 1. Gather all referenced file paths from DB
        const referencedFiles = await getAllReferencedFiles();

        // 2. Scan directories
        for (const dir of UPLOAD_DIRS) {
            if (!fs.existsSync(dir)) continue;

            const files = fs.readdirSync(dir);

            for (const file of files) {
                const filePath = path.join(dir, file);

                // Skip directories
                if (fs.statSync(filePath).isDirectory()) continue;

                // Check file age
                const stats = fs.statSync(filePath);
                const fileAge = Date.now() - stats.mtimeMs;

                if (fileAge < CLEANUP_THRESHOLD_MS) {
                    continue; // Skip scanning files uploaded recently (grace period)
                }

                // Check if file is referenced
                // We check if the filename exists in any of the referenced URLs
                const isReferenced = referencedFiles.some(ref => ref.includes(file));

                if (!isReferenced) {
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`🗑️ Deleted orphaned file: ${file}`);
                        deletedCount++;
                    } catch (err) {
                        console.error(`❌ Failed to delete ${file}:`, err);
                    }
                }
            }
        }

        console.log(`✅ Cleanup complete. Deleted ${deletedCount} orphaned files.`);

    } catch (error) {
        console.error('❌ cleanupOrphanedFiles error:', error);
    }
};

/**
 * Fetch all image/video URLs referenced in the database
 */
const getAllReferencedFiles = async (): Promise<string[]> => {
    const references: string[] = [];

    // 1. Blogs
    const blogs = await Blog.find({}).select('featuredImage content');
    blogs.forEach(blog => {
        if (blog.featuredImage) references.push(blog.featuredImage);
        // Extract images from markdown content if stored locally?
        // Usually markdown might reference /uploads/...
    });

    // 2. Products
    const products = await Product.find({})
        .select('images videos colorVariants sizeChart')
        .lean();

    products.forEach((product: any) => {
        // Main images
        if (product.images) {
            product.images.forEach((img: any) => {
                if (img.url) references.push(img.url);
            });
        }

        // Videos
        if (product.videos) {
            product.videos.forEach((vid: any) => {
                if (vid.url) references.push(vid.url);
            });
        }

        // Color Variants (Phase 4)
        if (product.colorVariants) {
            product.colorVariants.forEach((variant: any) => {
                if (variant.images) {
                    Object.values(variant.images).forEach((url: any) => {
                        if (url) references.push(url);
                    });
                }
            });
        }

        // Size Chart
        if (product.sizeChart?.image) {
            references.push(product.sizeChart.image);
        }
    });

    // 3. Sections
    const sections = await Section.find({}).select('content background').lean();
    sections.forEach((section: any) => {
        // Recursively find URLs in content object
        findUrlsInObject(section.content, references);
        findUrlsInObject(section.background, references);
    });

    // 4. Users (Avatars)
    const users = await (await import('../models/User')).default.find({ avatarUrl: { $exists: true, $ne: '' } }).select('avatarUrl');
    users.forEach(user => {
        if (user.avatarUrl) references.push(user.avatarUrl);
    });

    // 5. Reviews (Review Images)
    const reviews = await (await import('../models/Review')).default.find({ images: { $exists: true, $ne: [] } }).select('images');
    reviews.forEach(review => {
        if (review.images && review.images.length > 0) {
            review.images.forEach(img => references.push(img));
        }
    });

    // 6. Size Guides (Guide Images)
    const sizeGuides = await (await import('../models/SizeGuide')).default.find({ 'sizeChart.image': { $exists: true } }).select('sizeChart'); // Just simply finding all might be safer if structure varies
    // Usually SizeGuide model has 'data' but the product schema uses sizeChart. Let's check SizeGuide model again.
    // SizeGuide.ts schema doesn't have an 'image' field at top level?
    // It has `data: Schema.Types.Mixed`. Image might be inside. 
    // Safest is to fetch all SizeGuides and scan 'data' just like we scan Sections.

    // Changing approach for SizeGuide to be generic like Sections
    const allSizeGuides = await (await import('../models/SizeGuide')).default.find({}).lean();
    allSizeGuides.forEach((guide: any) => {
        findUrlsInObject(guide, references);
    });

    return references;
};

// Helper to find URLs in nested objects
const findUrlsInObject = (obj: any, matches: string[]) => {
    if (!obj) return;

    if (typeof obj === 'string') {
        if (obj.includes('/uploads/')) {
            matches.push(obj);
        }
        return;
    }

    if (typeof obj === 'object') {
        Object.values(obj).forEach(value => {
            findUrlsInObject(value, matches);
        });
    }
};

// Initialize Cron Job
export const initCleanupSchedule = () => {
    // Run at 3 AM every day
    cron.schedule('0 3 * * *', () => {
        cleanupOrphanedFiles();
    });

    console.log('🕰️  Cleanup scheduler initialized (0 3 * * *)');
};
