import express from 'express';
import {
    getAllProducts,
    getFeaturedProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getSearchSuggestions,
    uploadProductImage,
    uploadProductImageFromUrl,
} from '../controllers/productController';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Public routes (no authentication required - for guest browsing)
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/:id', getProductById);

// Admin routes (authentication + admin role required)
router.post('/', authenticate, requireAdmin, upload.array('images', 5), createProduct);
router.put('/:id', authenticate, requireAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

// Product image upload endpoint with organized folder structure (ADMIN ONLY)
router.post('/upload-image', authenticate, requireAdmin, upload.single('image'), uploadProductImage);

// Product image upload from URL (ADMIN ONLY)
router.post('/upload-image-url', authenticate, requireAdmin, uploadProductImageFromUrl);

export default router;
