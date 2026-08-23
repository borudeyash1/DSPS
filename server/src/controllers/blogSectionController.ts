import { Request, Response } from 'express';
import BlogSection from '../models/BlogSection';
import { AuthenticatedRequest } from '../types';

// Create blog section (ADMIN)
export const createBlogSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const sectionData = req.body;

        const section = new BlogSection(sectionData);
        await section.save();

        res.status(201).json({
            success: true,
            message: 'Blog section created successfully',
            data: section,
        });
    } catch (error: any) {
        console.error('Create blog section error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create blog section',
        });
    }
};

// Get all blog sections (ADMIN)
export const getAllBlogSections = async (req: Request, res: Response): Promise<void> => {
    try {
        const sections = await BlogSection.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            data: sections,
        });
    } catch (error: any) {
        console.error('Get all blog sections error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blog sections',
        });
    }
};

// Get blog section by ID (ADMIN)
export const getBlogSectionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const section = await BlogSection.findById(id);

        if (!section) {
            res.status(404).json({
                success: false,
                message: 'Blog section not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: section,
        });
    } catch (error: any) {
        console.error('Get blog section by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blog section',
        });
    }
};

// Update blog section (ADMIN)
export const updateBlogSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const section = await BlogSection.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!section) {
            res.status(404).json({
                success: false,
                message: 'Blog section not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Blog section updated successfully',
            data: section,
        });
    } catch (error: any) {
        console.error('Update blog section error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update blog section',
        });
    }
};

// Delete blog section (ADMIN)
export const deleteBlogSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const section = await BlogSection.findByIdAndDelete(id);

        if (!section) {
            res.status(404).json({
                success: false,
                message: 'Blog section not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Blog section deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete blog section error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete blog section',
        });
    }
};

// Reorder blog sections (ADMIN)
export const reorderBlogSections = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { sections } = req.body; // Array of { id, order }

        if (!Array.isArray(sections)) {
            res.status(400).json({
                success: false,
                message: 'Sections must be an array',
            });
            return;
        }

        // Update each section's order
        const updatePromises = sections.map(({ id, order }) =>
            BlogSection.findByIdAndUpdate(id, { order }, { new: true })
        );

        await Promise.all(updatePromises);

        const updatedSections = await BlogSection.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            message: 'Blog sections reordered successfully',
            data: updatedSections,
        });
    } catch (error: any) {
        console.error('Reorder blog sections error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to reorder blog sections',
        });
    }
};

// Get active blog sections (PUBLIC)
export const getActiveBlogSections = async (req: Request, res: Response): Promise<void> => {
    try {
        const sections = await BlogSection.find({ isActive: true }).sort({ order: 1 });

        res.status(200).json({
            success: true,
            data: sections,
        });
    } catch (error: any) {
        console.error('Get active blog sections error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch active blog sections',
        });
    }
};
