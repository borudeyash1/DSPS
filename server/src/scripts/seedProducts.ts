import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database';
import Product from '../models/Product';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const taxonomy: any = {
    men: {
        'topwear': ['t-shirts', 'casual-shirts', 'formal-shirts', 'sweatshirts', 'jackets'],
        'bottomwear': ['jeans', 'casual-trousers', 'formal-trousers', 'shorts', 'track-pants'],
        'footwear': ['casual-shoes', 'sports-shoes', 'formal-shoes', 'sandals', 'sneakers']
    },
    women: {
        'indian-fusion': ['kurtas', 'sarees', 'ethnic-dresses', 'lehenga-choli', 'dupattas'],
        'western-wear': ['dresses', 'tops', 'jeans', 'trousers', 'jumpsuits'],
        'footwear': ['flats', 'heels', 'sports-shoes', 'boots', 'casual-shoes']
    },
    kids: {
        'boys-clothing': ['t-shirts', 'shirts', 'jeans', 'shorts', 'clothing-sets'],
        'girls-clothing': ['dresses', 'tops', 'clothing-sets', 'lehengas', 'jumpsuits'],
        'footwear': ['casual-shoes', 'sports-shoes', 'school-shoes', 'sandals', 'flip-flops']
    },
    living: {
        'bed-linen': ['bed-sheets', 'blankets', 'curtains', 'pillows', 'bed-covers'],
        'flooring': ['carpets', 'door-mats', 'floor-runners', 'rugs', 'dhuries'],
        'bath': ['towels', 'bath-rugs', 'bath-robes', 'bathroom-accessories', 'shower-curtains']
    }
};

const adjectives = ['Stylish', 'Comfortable', 'Modern', 'Classic', 'Elegant', 'Premium', 'Urban', 'Cozy', 'Vibrant', 'Essential', 'Luxury', 'Minimalist'];
const materials = ['Cotton', 'Polyester', 'Linen', 'Denim', 'Silk', 'Wool', 'Leather', 'Canvas', 'Velvet', 'Satin'];
const colorsList = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Grey', 'Brown', 'Navy', 'Maroon', 'Beige', 'Purple'];

function getRandomItem(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function formatName(slug: string) {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function generateProducts() {
    const products: any[] = [];

    // Ensure we hit every category and subcategory at least once
    Object.entries(taxonomy).forEach(([category, subcats]: [string, any]) => {
        Object.entries(subcats).forEach(([subcategory, types]: [string, any]) => {
            // Create detailed products for each type
            types.forEach((type: string) => {
                // Create 1-2 items per type to ensure coverage
                const count = Math.floor(Math.random() * 2) + 1;

                for (let i = 0; i < count; i++) {
                    const material = getRandomItem(materials);
                    const adjective = getRandomItem(adjectives);
                    const color = getRandomItem(colorsList);
                    const price = Math.floor(Math.random() * 4000) + 499; // 500 - 4500

                    const typeName = formatName(type);
                    const categoryName = formatName(category);

                    products.push({
                        name: `${adjective} ${material} ${typeName}`,
                        description: `Experience comfort and style with this ${adjective.toLowerCase()} ${typeName}. Made from high-quality ${material.toLowerCase()}, it is perfect for everyday use in our ${categoryName} collection.`,
                        category: category,
                        subcategory: subcategory,
                        type: type,
                        price: price,
                        discountPrice: Math.random() > 0.4 ? Math.floor(price * 0.8) : undefined,
                        stock: Math.floor(Math.random() * 50) + 10,
                        // Using placehold.co for reliable dummy images with text
                        images: [
                            {
                                url: `https://placehold.co/600x800/E2E8F0/1E293B?text=${typeName.replace(/\s/g, '+')}`,
                                alt: `${adjective} ${typeName}`,
                                publicId: `seed-${Date.now()}-${Math.random()}`,
                                isMain: true
                            },
                            {
                                url: `https://placehold.co/600x800/F1F5F9/475569?text=${typeName.replace(/\s/g, '+')}+Detail`,
                                alt: `${adjective} ${typeName} Detail`,
                                publicId: `seed-${Date.now()}-${Math.random()}-detail`,
                                isMain: false
                            }
                        ],
                        sizes: ['S', 'M', 'L', 'XL'],
                        colors: [color],
                        variants: [
                            { size: 'S', color: color, price: price, stock: 5, required: true },
                            { size: 'M', color: color, price: price, stock: 10, required: true },
                            { size: 'L', color: color, price: price, stock: 8, required: true },
                            { size: 'XL', color: color, price: price, stock: 4, required: true }
                        ],
                        isActive: true,
                        isFeatured: Math.random() > 0.85,
                        rating: Math.floor(Math.random() * 2) + 3.5, // 3.5 - 5
                        reviewCount: Math.floor(Math.random() * 150), // 0 - 150 reviews
                        wishlistCount: Math.floor(Math.random() * 80) // 0 - 80 wishlists
                    });
                }
            });
        });
    });

    return products;
}

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🧹 Clearing existing products...');
        await Product.deleteMany({});

        console.log('🌱 Generating products...');
        const products = generateProducts();

        console.log(`📦 Inserting ${products.length} products...`);
        await Product.insertMany(products);

        console.log('✅ Database seeded successfully!');

        // Log query example for user
        console.log('💡 Example product created:');
        if (products.length > 0) {
            console.log(`   Name: ${products[0].name}`);
            console.log(`   Route: /products/${products[0].category}/${products[0].subcategory}/${products[0].type}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();
