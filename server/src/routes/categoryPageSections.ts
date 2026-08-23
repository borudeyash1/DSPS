import express from 'express';
import {
    createCategoryPageSection,
    getSectionsByCategory,
    getCategoryPageSectionById,
    updateCategoryPageSection,
    deleteCategoryPageSection,
    reorderCategoryPageSections,
    getActiveSectionsByCategory,
} from '../controllers/categoryPageSectionController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Admin routes (protected)
router.post('/', authenticate, requireAdmin, createCategoryPageSection);
router.get('/admin/:category', authenticate, requireAdmin, getSectionsByCategory);
router.get('/admin/section/:id', authenticate, requireAdmin, getCategoryPageSectionById);
router.put('/:id', authenticate, requireAdmin, updateCategoryPageSection);
router.delete('/:id', authenticate, requireAdmin, deleteCategoryPageSection);
router.put('/admin/:category/reorder', authenticate, requireAdmin, reorderCategoryPageSections);

// Public routes
router.get('/public/:category', getActiveSectionsByCategory);

export default router;
