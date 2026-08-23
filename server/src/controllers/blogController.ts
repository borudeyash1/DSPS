import { Request, Response } from 'express';
import Blog from '../models/Blog';
import Admin from '../models/Admin';
import SavedBlog from '../models/SavedBlog';
import { AuthenticatedRequest } from '../types';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { validateBlogData, checkRateLimit, sanitizeHTML } from '../utils/contentSecurity';

// Create blog (ADMIN)
export const createBlog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        // Rate limiting - prevent spam
        if (!checkRateLimit(userId.toString(), 10, 60000)) {
            res.status(429).json({
                success: false,
                message: 'Too many blog creation attempts. Please try again later.',
            });
            return;
        }

        const blogData = req.body;

        // Security validation
        const validation = validateBlogData({
            title: blogData.title,
            content: blogData.content,
            excerpt: blogData.excerpt,
            featuredImage: blogData.featuredImage,
            tags: blogData.tags,
        });

        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors,
            });
            return;
        }

        // Use sanitized data
        blogData.title = validation.sanitized.title;
        blogData.content = validation.sanitized.content;
        blogData.excerpt = validation.sanitized.excerpt;
        blogData.tags = validation.sanitized.tags;

        // Auto-publish if publishedAt is set
        if (blogData.publishedAt && !blogData.isPublished) {
            blogData.isPublished = true;
        }

        // Set author
        const admin = await Admin.findById(userId);
        if (admin) {
            blogData.author = {
                name: admin.fullName || 'Admin',
                avatar: admin.avatar,
                bio: admin.bio
            };
            blogData.authorId = admin._id;
        }

        // Generate slug if not provided
        if (!blogData.slug && blogData.title) {
            // Use the sanitized title (which is already escaped)
            // We need to decode it for slug generation
            const decodedTitle = blogData.title
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'");

            let slug = decodedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            blogData.slug = slug;
        }

        // Calculate read time
        if (!blogData.readTime && blogData.content) {
            const words = blogData.content.trim().split(/\s+/).length;
            blogData.readTime = Math.ceil(words / 200) || 1;
        }

        const blog = new Blog(blogData);
        await blog.save();

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            data: blog,
        });
    } catch (error: any) {
        console.error('Create blog error:', error);

        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'A blog with this title already exists. Please choose a unique title.',
            });
            return;
        }

        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: error.message || 'Validation Error',
                errors: error.errors
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create blog',
        });
    }
};

// Get all blogs (ADMIN)
export const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, isPublished, isFeatured, search, page = 1, limit = 10, sectionId } = req.query;

        const filter: any = {};

        // Check if user is super admin or developer
        const authReq = req as AuthenticatedRequest;
        const user = authReq.user;
        const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'developer';

        // Regular admins only see their own blogs
        if (!isSuperAdmin && user?._id) {
            filter.authorId = user._id;
        }

        if (category) filter.category = category;
        if (sectionId) filter.sectionId = sectionId;
        if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

        if (search) {
            filter.$text = { $search: search as string };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const blogs = await Blog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Blog.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: blogs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error('Get all blogs error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blogs',
        });
    }
};

// Get blog by ID (ADMIN)
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);

        if (!blog) {
            res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error: any) {
        console.error('Get blog by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blog',
        });
    }
};

// Update blog (ADMIN)
export const updateBlog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Security validation if title, content, excerpt, or featuredImage are being updated
        if (updates.title || updates.content || updates.excerpt || updates.featuredImage) {
            // Get existing blog to merge with updates
            const existingBlog = await Blog.findById(id);
            if (!existingBlog) {
                res.status(404).json({
                    success: false,
                    message: 'Blog not found',
                });
                return;
            }

            const validation = validateBlogData({
                title: updates.title || existingBlog.title,
                content: updates.content || existingBlog.content,
                excerpt: updates.excerpt || existingBlog.excerpt,
                featuredImage: updates.featuredImage || existingBlog.featuredImage,
                tags: updates.tags || existingBlog.tags,
            });

            if (!validation.isValid) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors,
                });
                return;
            }

            // Use sanitized data
            if (updates.title) updates.title = validation.sanitized.title;
            if (updates.content) updates.content = validation.sanitized.content;
            if (updates.excerpt) updates.excerpt = validation.sanitized.excerpt;
            if (updates.tags) updates.tags = validation.sanitized.tags;
        }

        // Auto-publish if publishedAt is set
        if (updates.publishedAt && !updates.isPublished) {
            updates.isPublished = true;
        }

        const blog = await Blog.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!blog) {
            res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
            data: blog,
        });
    } catch (error: any) {
        console.error('Update blog error:', error);

        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: error.message || 'Validation Error',
                errors: error.errors
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update blog',
        });
    }
};

// Delete blog (ADMIN)
export const deleteBlog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete blog error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete blog',
        });
    }
};

// Get published blogs (PUBLIC)
export const getPublishedBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, tag, ids, sectionId, page = 1, limit = 9 } = req.query;

        const filter: any = { isPublished: true };

        if (category) filter.category = category;
        if (tag) filter.tags = tag;
        if (sectionId) filter.sectionId = sectionId;
        if (ids) {
            const idsArray = (ids as string).split(',').map(id => id.trim());
            if (idsArray.length > 0) {
                filter._id = { $in: idsArray };
            }
        }

        const skip = (Number(page) - 1) * Number(limit);

        const blogs = await Blog.find(filter)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select('-content') // Exclude full content for list view
            .populate('authorId', 'fullName avatar bio');

        const total = await Blog.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: blogs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error('Get published blogs error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blogs',
        });
    }
};

// Get blog by slug (PUBLIC)
export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;

        const blog = await Blog.findOne({ slug, isPublished: true })
            .populate('authorId', 'fullName avatar bio');

        if (!blog) {
            res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
            return;
        }

        // Increment views
        blog.views += 1;
        await blog.save();

        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error: any) {
        console.error('Get blog by slug error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blog',
        });
    }
};

// Get featured blogs (PUBLIC)
export const getFeaturedBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit = 6 } = req.query;

        const blogs = await Blog.find({ isPublished: true, isFeatured: true })
            .sort({ publishedAt: -1 })
            .limit(Number(limit))
            .select('-content');

        res.status(200).json({
            success: true,
            data: blogs,
        });
    } catch (error: any) {
        console.error('Get featured blogs error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch featured blogs',
        });
    }
};

// Get blogs by category (PUBLIC)
export const getBlogsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 9 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const blogs = await Blog.find({ isPublished: true, category })
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select('-content');

        const total = await Blog.countDocuments({ isPublished: true, category });

        res.status(200).json({
            success: true,
            data: blogs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error('Get blogs by category error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blogs',
        });
    }
};

// Get author profile and blogs (PUBLIC)
export const getAuthorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 9 } = req.query;

        // 1. Get Author Details (Public Info only)
        const author = await Admin.findById(id).select('fullName avatar bio createdAt');

        if (!author) {
            res.status(404).json({
                success: false,
                message: 'Author not found'
            });
            return;
        }

        // 2. Get Author's Blogs
        const skip = (Number(page) - 1) * Number(limit);
        const filter = { isPublished: true, authorId: id };

        const blogs = await Blog.find(filter)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select('-content');

        const total = await Blog.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                author,
                blogs,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                }
            }
        });
    } catch (error: any) {
        console.error('Get author profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch author profile'
        });
    }
};

// Save/Unsave Blog (Toggle)
export const toggleSaveBlog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        // Check if blog exists
        const blog = await Blog.findById(id);
        if (!blog) {
            res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
            return;
        }

        // Check if already saved
        const existingSave = await SavedBlog.findOne({ user: userId, blog: id });

        if (existingSave) {
            // Unsave
            await SavedBlog.deleteOne({ _id: existingSave._id });
            await Blog.findByIdAndUpdate(id, { $inc: { saveCount: -1 } });

            res.json({
                success: true,
                message: 'Blog unsaved',
                data: {
                    saved: false,
                    saveCount: Math.max(0, blog.saveCount - 1)
                }
            });
        } else {
            // Save
    // @ts-ignore
            await SavedBlog.create({ user: userId, blog: id });
            await Blog.findByIdAndUpdate(id, { $inc: { saveCount: 1 } });

            res.json({
                success: true,
                message: 'Blog saved',
                data: {
                    saved: true,
                    saveCount: blog.saveCount + 1
                }
            });
        }
    } catch (error: any) {
        console.error('Toggle save blog error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to save/unsave blog'
        });
    }
};

// Get Save Status
export const getSaveStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const blog = await Blog.findById(id);
        if (!blog) {
            res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
            return;
        }

        let saved = false;
        if (userId) {
            const existingSave = await SavedBlog.findOne({ user: userId, blog: id });
            saved = !!existingSave;
        }

        res.json({
            success: true,
            data: {
                saved,
                saveCount: blog.saveCount || 0
            }
        });
    } catch (error: any) {
        console.error('Get save status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get save status'
        });
    }
};

// Get User's Saved Blogs
export const getSavedBlogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const savedBlogs = await SavedBlog.find({ user: userId })
            .sort({ savedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'blog',
                match: { isPublished: true }
            });

        // Filter out null blogs (unpublished or deleted)
        const blogs = savedBlogs
            .filter(sb => sb.blog)
            .map(sb => sb.blog);

        const total = await SavedBlog.countDocuments({ user: userId });

        res.json({
            success: true,
            data: {
                blogs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error: any) {
        console.error('Get saved blogs error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch saved blogs'
        });
    }
};

// Get Trending Blogs
export const getTrendingBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        // Calculate recency score (exponential decay)
        const now = new Date();

        const blogs = await Blog.find({
            isPublished: true,
            publishedAt: { $exists: true, $ne: null }
        })
            .sort({ saveCount: -1, publishedAt: -1 })
            .limit(limit * 3); // Get more to calculate scores

        // Calculate trending score
        const scoredBlogs = blogs.map(blog => {
            const publishedAt = blog.publishedAt ? new Date(blog.publishedAt) : new Date(blog.createdAt);
            const ageInDays = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);

            // Recency score: 1.0 for today, decays exponentially
            const recencyScore = Math.exp(-ageInDays / 10); // Decay factor of 10 days

            // Trending score: 70% saves, 30% recency
            const trendingScore = (blog.saveCount || 0) * 0.7 + recencyScore * 100 * 0.3;

            return {
                blog,
                trendingScore
            };
        });

        // Sort by trending score and take top N
        scoredBlogs.sort((a, b) => b.trendingScore - a.trendingScore);
        const trendingBlogs = scoredBlogs.slice(0, limit).map(item => item.blog);

        res.json({
            success: true,
            data: trendingBlogs
        });
    } catch (error: any) {
        console.error('Get trending blogs error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch trending blogs'
        });
    }
};

// Upload image from URL (for LinkedIn, Instagram, etc.)
export const uploadImageFromUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        // Get content type
        const contentType = response.headers['content-type'];
    // @ts-ignore
        if (!contentType || !contentType.startsWith('image/')) {
            res.status(400).json({
                success: false,
                message: 'URL does not point to a valid image'
            });
            return;
        }

        // Generate filename
    // @ts-ignore
        const extension = contentType.split('/')[1].split(';')[0];
        const filename = `blog-${Date.now()}.${extension}`;
        const filepath = path.join(__dirname, '../../uploads/blogs', filename);

        // Ensure directory exists
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Save the image
        fs.writeFileSync(filepath, response.data);

        // Return the URL - use backend server URL
        const apiUrl = process.env.API_URL || 'http://localhost:5000';
        const imageUrlResult = `${apiUrl}/uploads/blogs/${filename}`;

        res.json({
            success: true,
            data: { url: imageUrlResult }
        });
    } catch (error: any) {
        console.error('Upload image from URL error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image from URL'
        });
    }
};

// Upload image from local file (for Blog)
export const uploadBlogImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
            return;
        }

        // The file is already saved by multer middleware to 'server/uploads' (or specific folder if configured)
        // We just need to return the accessible URL

        const filename = req.file.filename;
        const apiUrl = process.env.API_URL || 'http://localhost:5000';

        // Construct the URL. 
        // Note: The middleware might save it to 'uploads/' directly or 'uploads/blogs/'.
        // Assuming your upload middleware is generic and saves to 'uploads/', 
        // we might need to adjust the path.
        // If the file is in 'uploads/blogs/', filename usually doesn't include path separators.

        // If we want to organize into 'blogs' folder, we can move it here.
        const targetDir = path.join(__dirname, '../../uploads/blogs');
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const sourcePath = req.file.path;
        const targetPath = path.join(targetDir, filename);

        // Note: The middleware might save it to 'uploads/' directly or 'uploads/blogs/'.
        // Assuming your upload middleware is generic and saves to 'uploads/', 
        // we might need to adjust the path.
        // If the file is in 'uploads/blogs/', filename usually doesn't include path separators.

        const imageUrlResult = `${apiUrl}/uploads/blogs/${filename}`;

        res.json({
            success: true,
            data: { url: imageUrlResult }
        });
    } catch (error: any) {
        console.error('Upload blog image error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image'
        });
    }
};