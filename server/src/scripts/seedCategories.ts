import mongoose from 'mongoose';
import Category from '../models/Category';
import dotenv from 'dotenv';

dotenv.config();

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('📦 Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('🗑️  Cleared existing categories');

        // Seed categories with subcategories and types
        const categories = [
            {
                name: 'Men',
                slug: 'men',
                subcategories: [
                    {
                        name: 'Topwear',
                        slug: 'topwear',
                        types: ['T-Shirt', 'Shirt', 'Jacket', 'Hoodie', 'Sweatshirt']
                    },
                    {
                        name: 'Bottomwear',
                        slug: 'bottomwear',
                        types: ['Jeans', 'Trousers', 'Shorts', 'Track Pants']
                    },
                    {
                        name: 'Footwear',
                        slug: 'footwear',
                        types: ['Casual Shoes', 'Formal Shoes', 'Sneakers', 'Sandals']
                    },
                    {
                        name: 'Accessories',
                        slug: 'accessories',
                        types: ['Watch', 'Belt', 'Wallet', 'Sunglasses', 'Cap']
                    }
                ]
            },
            {
                name: 'Women',
                slug: 'women',
                subcategories: [
                    {
                        name: 'Topwear',
                        slug: 'topwear',
                        types: ['Blouse', 'Top', 'Shirt', 'T-Shirt', 'Crop Top']
                    },
                    {
                        name: 'Bottomwear',
                        slug: 'bottomwear',
                        types: ['Jeans', 'Trousers', 'Skirts', 'Shorts', 'Leggings']
                    },
                    {
                        name: 'Dresses',
                        slug: 'dresses',
                        types: ['Casual Dress', 'Formal Dress', 'Party Dress', 'Maxi Dress']
                    },
                    {
                        name: 'Footwear',
                        slug: 'footwear',
                        types: ['Heels', 'Flats', 'Sandals', 'Sneakers']
                    },
                    {
                        name: 'Accessories',
                        slug: 'accessories',
                        types: ['Handbag', 'Jewelry', 'Sunglasses', 'Scarf']
                    }
                ]
            },
            {
                name: 'Kids',
                slug: 'kids',
                subcategories: [
                    {
                        name: 'Boys',
                        slug: 'boys',
                        types: ['T-Shirt', 'Shirt', 'Jeans', 'Shorts']
                    },
                    {
                        name: 'Girls',
                        slug: 'girls',
                        types: ['Dress', 'Top', 'Skirt', 'Jeans']
                    },
                    {
                        name: 'Footwear',
                        slug: 'footwear',
                        types: ['Shoes', 'Sandals', 'Sneakers']
                    }
                ]
            },
            {
                name: 'Electronics',
                slug: 'electronics',
                subcategories: [
                    {
                        name: 'Mobile',
                        slug: 'mobile',
                        types: ['Smartphone', 'Feature Phone', 'Accessories']
                    },
                    {
                        name: 'Laptop',
                        slug: 'laptop',
                        types: ['Gaming', 'Business', 'Student', 'Ultrabook']
                    },
                    {
                        name: 'Audio',
                        slug: 'audio',
                        types: ['Headphones', 'Earbuds', 'Speakers', 'Bluetooth Speaker']
                    }
                ]
            }
        ];

        await Category.insertMany(categories);
        console.log('✅ Categories seeded successfully!');

        // Display seeded data
        const seededCategories = await Category.find({});
        console.log('\n📊 Seeded Categories:');
        seededCategories.forEach(cat => {
            console.log(`\n  📁 ${cat.name}`);
            cat.subcategories.forEach(sub => {
                console.log(`    └─ ${sub.name}: [${sub.types.join(', ')}]`);
            });
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
