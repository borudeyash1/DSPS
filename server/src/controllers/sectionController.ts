import { Request, Response } from 'express';
import Section from '../models/Section';
import { AuthenticatedRequest } from '../types';
import { getMaxBlogsForSectionType } from '../utils/sectionHelpers';

import path from 'path';
import fs from 'fs';

// Get all sections (public - for homepage)
export const getAllSections = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page } = req.query;
        // console.log('Fetching sections for page:', page);

        // Build filter
        const filter: any = { isActive: true };
        if (page) {
            const pageStr = String(page);
            if (pageStr === 'homepage') {
                // For homepage, include sections with page='homepage' OR sections without page field (for backward compatibility)
                filter.$or = [
                    { page: 'homepage' },
                    { page: { $exists: false } },
                    { page: null }
                ];
            } else {
                // For other pages, only get sections with exact page match
                filter.page = pageStr;
            }
        } else {
            // If no page specified, default to homepage (including old sections without page field)
            filter.$or = [
                { page: 'homepage' },
                { page: { $exists: false } },
                { page: null }
            ];
        }

        const sections = await Section.find(filter)
            .sort({ order: 1 })
            .populate('products');

        res.status(200).json({
            success: true,
            message: 'Sections retrieved successfully',
            data: { sections },
        });
    } catch (error: any) {
        console.error('Get sections error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Get all sections including inactive (admin only)
export const getAllSectionsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { page } = req.query;

        // Build filter
        const filter: any = {};
        if (page) {
            filter.page = page;
        }
        // If no page specified, return all sections (for backward compatibility)

        const sections = await Section.find(filter)
            .sort({ order: 1 })
            .populate('products');

        res.status(200).json({
            success: true,
            message: 'Sections retrieved successfully',
            data: { sections },
        });
    } catch (error: any) {
        console.error('Get sections error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Get single section
export const getSection = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const section = await Section.findById(id).populate('products');

        if (!section) {
            res.status(404).json({
                success: false,
                message: 'Section not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Section retrieved successfully',
            data: { section },
        });
    } catch (error: any) {
        console.error('Get section error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Create section (admin only)
export const createSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const sectionData = req.body;

        // Get the highest order number
        const highestOrder = await Section.findOne().sort({ order: -1 }).select('order');
        const newOrder = highestOrder ? highestOrder.order + 1 : 0;

        const section = await Section.create({
            ...sectionData,
            order: newOrder,
        });

        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            data: { section },
        });
    } catch (error: any) {
        console.error('Create section error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Update section (admin only)
export const updateSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('📝 Updating section:', { id, updateData });

        // Wrap in $set for dot notation to work
        const updateQuery = { $set: updateData };

        const section = await Section.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true, runValidators: true }
        ).populate('products');

        if (!section) {
            res.status(404).json({
                success: false,
                message: 'Section not found',
            });
            return;
        }

        console.log('✅ Section updated successfully');
        console.log('📊 Section content:', JSON.stringify(section.content, null, 2));
        console.log('🎯 Hotspots in saved section:', section.content?.hotspots);

        res.status(200).json({
            success: true,
            message: 'Section updated successfully',
            data: { section },
        });
    } catch (error: any) {
        console.error('Update section error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Delete section (admin only)
export const deleteSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const section = await Section.findByIdAndDelete(id);

        if (!section) {
            res.status(404).json({
                success: false,
                message: 'Section not found',
            });
            return;
        }

        // Reorder remaining sections
        await Section.updateMany(
            { order: { $gt: section.order } },
            { $inc: { order: -1 } }
        );

        res.status(200).json({
            success: true,
            message: 'Section deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete section error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Reorder sections (admin only)
export const reorderSections = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { sectionOrders } = req.body; // Array of { id, order }

        if (!Array.isArray(sectionOrders)) {
            res.status(400).json({
                success: false,
                message: 'sectionOrders must be an array',
            });
            return;
        }

        // Update each section's order
        const updatePromises = sectionOrders.map(({ id, order }) =>
            Section.findByIdAndUpdate(id, { order })
        );

        await Promise.all(updatePromises);

        const sections = await Section.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            message: 'Sections reordered successfully',
            data: { sections },
        });
    } catch (error: any) {
        console.error('Reorder sections error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Toggle section active status (admin only)
export const toggleSectionStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const section = await Section.findById(id);

        if (!section) {
            res.status(404).json({
                success: false,
                message: 'Section not found',
            });
            return;
        }

        section.isActive = !section.isActive;
        await section.save();

        res.status(200).json({
            success: true,
            message: `Section ${section.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { section },
        });
    } catch (error: any) {
        console.error('Toggle section status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Duplicate section (admin only)
export const duplicateSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const originalSection = await Section.findById(id);

        if (!originalSection) {
            res.status(404).json({
                success: false,
                message: 'Section not found',
            });
            return;
        }

        // Get the highest order number
        const highestOrder = await Section.findOne().sort({ order: -1 }).select('order');
        const newOrder = highestOrder ? highestOrder.order + 1 : 0;

        // Create duplicate
        const sectionObj = originalSection.toObject();
        const { _id, createdAt, updatedAt, ...sectionData } = sectionObj;

        const duplicatedSection = await Section.create({
            ...sectionData,
            name: `${originalSection.name} (Copy)`,
            order: newOrder,
            isActive: false, // Start as inactive
        });

        res.status(201).json({
            success: true,
            message: 'Section duplicated successfully',
            data: { section: duplicatedSection },
        });
    } catch (error: any) {
        console.error('Duplicate section error:', error);
        res.status(500).json({
        });
    }
};

// Upload section image (admin only)
export const uploadSectionImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const file = req.file;
        const { imageUrl, isGoogleDrive } = req.body;

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

        console.log(`📤 Processing uploaded image...`);

        // Construct public URL for the file
        const folder = req.query.folder as string || '';
        // Ensure forward slashes for URL
        const folderPath = folder ? `${folder}/` : '';
        const relativePath = `/uploads/${folderPath}${file.filename}`;

        // Use appropriate base URL based on environment
        // Use generic API_URL from env, fallback to localhost only if not set
        const apiUrl = process.env.API_URL || 'http://localhost:5000';

        const fullUrl = `${apiUrl}${relativePath}`;

        console.log(`✅ Image saved locally: ${fullUrl}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📍 API URL used: ${apiUrl}`);

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: fullUrl,
                publicId: file.filename,
            },
        });
    } catch (error: any) {
        console.error('Upload section image error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const uploadSectionVideo = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No video file provided',
            });
            return;
        }

        const folder = req.query.folder as string || '';
        const folderPath = folder ? `${folder}/` : '';
        const relativePath = `/uploads/${folderPath}${req.file.filename}`;

        // Use appropriate base URL based on environment
        const apiUrl = process.env.API_URL || 'http://localhost:5000';
        const fullUrl = `${apiUrl}${relativePath}`;

        res.status(200).json({
            success: true,
            data: { url: fullUrl },
        });
    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Video upload failed',
        });
    }
};
// Update section blogs
export const updateSectionBlogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { blogIds, layoutStyle } = req.body; // blogIds is array of blog ObjectIds

        const section = await Section.findById(id);
        if (!section) {
            res.status(404).json({
                success: false,
                message: 'Section not found'
            });
            return;
        }

        // Validate blog count based on section type
        const maxBlogs = getMaxBlogsForSectionType(section.type);
        if (blogIds.length > maxBlogs) {
            res.status(400).json({
                success: false,
                message: `This section type (${section.type}) allows maximum ${maxBlogs} blog${maxBlogs === 1 ? '' : 's'}. You selected ${blogIds.length}.`
            });
            return;
        }

        // Create blogs array with order
        const blogs = blogIds.map((blogId: string, index: number) => ({
            blog: blogId,
            order: index
        }));

        // Update section
        section.blogs = blogs;
        if (layoutStyle) {
            section.layoutStyle = layoutStyle;
        }

        await section.save();

        res.json({
            success: true,
            message: 'Section blogs updated successfully',
            data: section
        });
    } catch (error: any) {
        console.error('Update section blogs error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update section blogs'
        });
    }
};

// Reorder section blogs
export const reorderSectionBlogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { blogIds } = req.body; // Array of blog IDs in new order

        const section = await Section.findById(id);
        if (!section) {
            res.status(404).json({
                success: false,
                message: 'Section not found'
            });
            return;
        }

        // Update order based on new blogIds array
        const blogs = blogIds.map((blogId: string, index: number) => ({
            blog: blogId,
            order: index
        }));

        section.blogs = blogs;
        await section.save();

        res.json({
            success: true,
            message: 'Blogs reordered successfully',
            data: section
        });
    } catch (error: any) {
        console.error('Reorder section blogs error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to reorder blogs'
        });
    }
};

// Get section with populated blogs
export const getSectionWithBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const section = await Section.findById(id)
            .populate({
                path: 'blogs.blog',
                match: { isPublished: true },
                select: 'title slug excerpt featuredImage category tags author readTime saveCount createdAt'
            });

        if (!section) {
            res.status(404).json({
                success: false,
                message: 'Section not found'
            });
            return;
        }

        // Filter out null blogs (unpublished or deleted) and sort by order
        if (section.blogs) {
            section.blogs = section.blogs
                .filter((item: any) => item.blog)
                .sort((a: any, b: any) => a.order - b.order);
        }

        res.json({
            success: true,
            data: section
        });
    } catch (error: any) {
        console.error('Get section with blogs error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch section'
        });
    }
};