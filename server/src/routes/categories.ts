import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
    getCategories,
    getCategoryHierarchy,
    addCustomHierarchy,
    updateCategory,
    deleteCategory,
    updateSubcategory,
    deleteSubcategory,
    deleteItemType
} from '../controllers/categoryController';

const router = express.Router();

// Get all categories
router.get('/', getCategories);

// Get category hierarchy (for mega menu)
router.get('/hierarchy', getCategoryHierarchy);

// Add custom hierarchy (Admin only)
router.post('/custom', authenticate, requireAdmin, addCustomHierarchy);

// Update category name (Admin only)
router.patch('/:categoryId', authenticate, requireAdmin, updateCategory);

// Delete category (Admin only)
router.delete('/:categoryId', authenticate, requireAdmin, deleteCategory);

// Update subcategory name (Admin only)
router.patch('/:categoryId/subcategories/:subcategoryId', authenticate, requireAdmin, updateSubcategory);

// Delete subcategory (Admin only)
router.delete('/:categoryId/subcategories/:subcategoryId', authenticate, requireAdmin, deleteSubcategory);

// Delete item type (Admin only)
router.delete('/:categoryId/subcategories/:subcategoryId/types/:typeName', authenticate, requireAdmin, deleteItemType);

export default router;
