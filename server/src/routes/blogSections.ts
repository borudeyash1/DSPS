import express from 'express';
import {
    createBlogSection,
    getAllBlogSections,
    getBlogSectionById,
    updateBlogSection,
    deleteBlogSection,
    reorderBlogSections,
    getActiveBlogSections,
} from '../controllers/blogSectionController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Admin routes (protected)
router.post('/', authenticate, requireAdmin, createBlogSection);
router.get('/admin/all', authenticate, requireAdmin, getAllBlogSections);
router.get('/admin/:id', authenticate, requireAdmin, getBlogSectionById);
router.put('/:id', authenticate, requireAdmin, updateBlogSection);
router.delete('/:id', authenticate, requireAdmin, deleteBlogSection);
router.put('/admin/reorder', authenticate, requireAdmin, reorderBlogSections);

// Public routes
router.get('/public', getActiveBlogSections);

export default router;
