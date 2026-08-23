import express from 'express';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    getPublishedBlogs,
    getBlogBySlug,
    getFeaturedBlogs,
    getBlogsByCategory,
    getAuthorProfile,
    toggleSaveBlog,
    getSaveStatus,
    getSavedBlogs,
    getTrendingBlogs,
    uploadImageFromUrl,
    uploadBlogImage,
} from '../controllers/blogController';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Admin routes (protected)
router.post('/', authenticate, requireAdmin, createBlog);
router.get('/admin/all', authenticate, requireAdmin, getAllBlogs);
router.get('/admin/:id', authenticate, requireAdmin, getBlogById);
router.put('/:id', authenticate, requireAdmin, updateBlog);
router.delete('/:id', authenticate, requireAdmin, deleteBlog);

// Public routes
router.get('/public', getPublishedBlogs);
router.get('/public/featured', getFeaturedBlogs);
router.get('/public/trending', getTrendingBlogs);
router.get('/public/category/:category', getBlogsByCategory);
router.get('/public/:slug', getBlogBySlug);
router.get('/public/author/:id', getAuthorProfile);

// User routes (authenticated)
router.post('/:id/save', authenticate, toggleSaveBlog);
router.get('/:id/save-status', getSaveStatus);
router.get('/saved/all', authenticate, getSavedBlogs);

// Admin utility routes
router.post('/upload-image-url', authenticate, requireAdmin, uploadImageFromUrl);
router.post('/upload-image', authenticate, requireAdmin, upload.single('image'), uploadBlogImage);

export default router;
