import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import Admin from '../models/Admin';
import slugify from 'slugify';
import { sendEmailNotification } from '../services/notificationService';

// Get all categories (existing)
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        // Return full category documents including subcategories
        const categories = await Category.find({});
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error: any) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get category hierarchy from Category model
export const getCategoryHierarchy = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find({});
        const result: any = {};

        categories.forEach((cat) => {
            if (cat && cat.name) {
                result[cat.name] = {};
                if (Array.isArray(cat.subcategories)) {
                    cat.subcategories.forEach((sub) => {
                        if (sub && sub.name) {
                            result[cat.name][sub.name] = Array.isArray(sub.types) ? sub.types : [];
                        }
                    });
                }
            }
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Get category hierarchy error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Add custom hierarchy (Category, Subcategory, Item Type)
export const addCustomHierarchy = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, subcategory, type } = req.body;

        if (!category) {
            res.status(400).json({ success: false, message: 'Category is required' });
            return;
        }

        const categorySlug = slugify(category, { lower: true });
        let categoryDoc = await Category.findOne({ slug: categorySlug });

        // 1. Create Category if not exists
        if (!categoryDoc) {
            categoryDoc = new Category({
                name: category,
                slug: categorySlug,
                subcategories: []
            });
        }

        // 2. Add Subcategory if provided
        if (subcategory) {
            const subSlug = slugify(subcategory, { lower: true });
            let subDoc = categoryDoc.subcategories.find(s => s.slug === subSlug);

            if (!subDoc) {
                categoryDoc.subcategories.push({
                    name: subcategory,
                    slug: subSlug,
                    types: []
                });
                subDoc = categoryDoc.subcategories.find(s => s.slug === subSlug);
            }

            // 3. Add Type if provided
            if (type && subDoc) {
                if (!subDoc.types.includes(type)) {
                    subDoc.types.push(type);
                }
            }
        }

        await categoryDoc.save();

        res.status(200).json({
            success: true,
            message: 'Hierarchy updated successfully',
            data: categoryDoc
        });

    } catch (error: any) {
        console.error('Add custom hierarchy error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Helper function to send notifications to all admins
const notifyAdmins = async (action: string, entityType: string, entityName: string, performedBy: string, affectedProducts?: number) => {
    try {
        const admins = await Admin.find({}, { email: 1 });
        const message = `${performedBy} has made changes: ${action} ${entityType} "${entityName}"${affectedProducts ? ` (${affectedProducts} products affected)` : ''}`;

        console.log(`📢 Notifying ${admins.length} admins: ${message}`);

        // In a real implementation, you would send actual notifications here
        // For now, we'll just log it
        // You can integrate with your notification service or email service

    } catch (error) {
        console.error('Failed to notify admins:', error);
    }
};

// Update category name
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;
        const { newName } = req.body;
        const adminEmail = (req as any).admin?.email || 'Unknown Admin';

        if (!newName || !newName.trim()) {
            res.status(400).json({ success: false, message: 'New category name is required' });
            return;
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }

        const oldName = category.name;
        const newSlug = slugify(newName, { lower: true });

        // Check if new name already exists
        const existing = await Category.findOne({ slug: newSlug, _id: { $ne: categoryId } });
        if (existing) {
            res.status(400).json({ success: false, message: 'Category with this name already exists' });
            return;
        }

        // Update category
        category.name = newName;
        category.slug = newSlug;
        await category.save();

        // Update all products with this category
        await Product.updateMany(
    // @ts-ignore
            { category: oldName },
            { $set: { category: newName } }
        );

        // Notify admins
        await notifyAdmins('Updated', 'category', `${oldName} → ${newName}`, adminEmail);

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });

    } catch (error: any) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Delete category (cascade inactive)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;
        const adminEmail = (req as any).admin?.email || 'Unknown Admin';

        const category = await Category.findById(categoryId);
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }

        // Count affected entities
        const subcategoryCount = category.subcategories.length;
        const typeCount = category.subcategories.reduce((sum, sub) => sum + sub.types.length, 0);
    // @ts-ignore
        const affectedProducts = await Product.countDocuments({ category: category.name });

        // Mark all products under this category as inactive
        await Product.updateMany(
    // @ts-ignore
            { category: category.name },
            { $set: { isActive: false, status: 'inactive' } }
        );

        // Delete the category
        await Category.findByIdAndDelete(categoryId);

        // Notify admins
        await notifyAdmins('Deleted', 'category', category.name, adminEmail, affectedProducts);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: {
                deletedCategory: category.name,
                affectedSubcategories: subcategoryCount,
                affectedTypes: typeCount,
                affectedProducts
            }
        });

    } catch (error: any) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Update subcategory name
export const updateSubcategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const { newName } = req.body;
        const adminEmail = (req as any).admin?.email || 'Unknown Admin';

        if (!newName || !newName.trim()) {
            res.status(400).json({ success: false, message: 'New subcategory name is required' });
            return;
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }

        const subcategory = category.subcategories.find((sub: any) => sub._id?.toString() === subcategoryId);
        if (!subcategory) {
            res.status(404).json({ success: false, message: 'Subcategory not found' });
            return;
        }

        const oldName = subcategory.name;
        const newSlug = slugify(newName, { lower: true });

        // Check if new name already exists in this category
        const existing = category.subcategories.find((s: any) => s.slug === newSlug && s._id?.toString() !== subcategoryId);
        if (existing) {
            res.status(400).json({ success: false, message: 'Subcategory with this name already exists' });
            return;
        }

        // Update subcategory
        subcategory.name = newName;
        subcategory.slug = newSlug;
        await category.save();

        // Update all products with this subcategory
        await Product.updateMany(
    // @ts-ignore
            { category: category.name, subcategory: oldName },
            { $set: { subcategory: newName } }
        );

        // Notify admins
        await notifyAdmins('Updated', 'subcategory', `${oldName} → ${newName}`, adminEmail);

        res.status(200).json({
            success: true,
            message: 'Subcategory updated successfully',
            data: category
        });

    } catch (error: any) {
        console.error('Update subcategory error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Delete subcategory (cascade inactive)
export const deleteSubcategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const adminEmail = (req as any).admin?.email || 'Unknown Admin';

        const category = await Category.findById(categoryId);
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }

        const subcategory = category.subcategories.find((sub: any) => sub._id?.toString() === subcategoryId);
        if (!subcategory) {
            res.status(404).json({ success: false, message: 'Subcategory not found' });
            return;
        }

        // Count affected entities
        const typeCount = subcategory.types.length;
        const affectedProducts = await Product.countDocuments({
    // @ts-ignore
            category: category.name,
            subcategory: subcategory.name
        });

        // Mark all products under this subcategory as inactive
        await Product.updateMany(
    // @ts-ignore
            { category: category.name, subcategory: subcategory.name },
            { $set: { isActive: false, status: 'inactive' } }
        );

        // Remove the subcategory
        const subcategoryIndex = category.subcategories.findIndex((sub: any) => sub._id?.toString() === subcategoryId);
        if (subcategoryIndex !== -1) {
            category.subcategories.splice(subcategoryIndex, 1);
        }
        await category.save();

        // Notify admins
        await notifyAdmins('Deleted', 'subcategory', subcategory.name, adminEmail, affectedProducts);

        res.status(200).json({
            success: true,
            message: 'Subcategory deleted successfully',
            data: {
                deletedSubcategory: subcategory.name,
                affectedTypes: typeCount,
                affectedProducts
            }
        });

    } catch (error: any) {
        console.error('Delete subcategory error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Delete item type (cascade inactive)
export const deleteItemType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId, subcategoryId, typeName } = req.params;
        const adminEmail = (req as any).admin?.email || 'Unknown Admin';

        const category = await Category.findById(categoryId);
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }

        const subcategory = category.subcategories.find((sub: any) => sub._id?.toString() === subcategoryId);
        if (!subcategory) {
            res.status(404).json({ success: false, message: 'Subcategory not found' });
            return;
        }

    // @ts-ignore
        if (!subcategory.types.includes(typeName)) {
            res.status(404).json({ success: false, message: 'Item type not found' });
            return;
        }

        // Count affected products
        const affectedProducts = await Product.countDocuments({
    // @ts-ignore
            category: category.name,
            subcategory: subcategory.name,
            type: typeName
        });

        // Mark all products with this item type as inactive
        await Product.updateMany(
    // @ts-ignore
            { category: category.name, subcategory: subcategory.name, type: typeName },
            { $set: { isActive: false, status: 'inactive' } }
        );

        // Remove the type
        subcategory.types = subcategory.types.filter((t: string) => t !== typeName);
        await category.save();

        // Notify admins
    // @ts-ignore
        await notifyAdmins('Deleted', 'item type', typeName, adminEmail, affectedProducts);

        res.status(200).json({
            success: true,
            message: 'Item type deleted successfully',
            data: {
                deletedType: typeName,
                affectedProducts
            }
        });

    } catch (error: any) {
        console.error('Delete item type error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
