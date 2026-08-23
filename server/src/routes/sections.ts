import express from 'express';
import {
    getAllSections,
    getAllSectionsAdmin,
    getSection,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    toggleSectionStatus,
    duplicateSection,
    uploadSectionImage,
    uploadSectionVideo,
    updateSectionBlogs,
    reorderSectionBlogs,
    getSectionWithBlogs,
} from '../controllers/sectionController';
import { authenticate, requireAdmin, requireDeveloper } from '../middleware/auth';
import { upload, videoUpload } from '../middleware/upload';

const router = express.Router();

// Public routes
router.get('/', getAllSections);
router.get('/:id', getSection);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, getAllSectionsAdmin);
router.post('/', authenticate, requireDeveloper, createSection);
router.put('/:id', authenticate, requireAdmin, updateSection);
router.delete('/:id', authenticate, requireDeveloper, deleteSection);
router.put('/reorder/all', authenticate, requireDeveloper, reorderSections);
router.put('/:id/toggle', authenticate, requireDeveloper, toggleSectionStatus);
router.post('/:id/duplicate', authenticate, requireDeveloper, duplicateSection);
router.post('/upload-image', authenticate, requireAdmin, upload.single('image'), uploadSectionImage);
router.post('/upload-video', authenticate, requireAdmin, videoUpload.single('video'), uploadSectionVideo);

// Blog-section linking routes
router.get('/:id/blogs', getSectionWithBlogs);
router.put('/:id/blogs', authenticate, requireAdmin, updateSectionBlogs);
router.post('/:id/blogs/reorder', authenticate, requireAdmin, reorderSectionBlogs);

export default router;
