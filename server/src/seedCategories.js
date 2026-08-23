const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define Category schema inline
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    subcategories: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        types: [{
            type: String,
            trim: true
        }]
    }]
}, {
    timestamps: true
});

// Category data for Indian Men's Clothing
const categories = [
    {
        name: 'Men',
        slug: 'men',
        subcategories: [
            // Traditional Wear (Ethnic)
            {
                name: 'Kurtas & Kurta Sets',
                slug: 'kurtas',
                types: [
                    'Straight Cut Kurta',
                    'Pathani Kurta',
                    'Angrakha Kurta',
                    'Kurta with Pajama Set',
                    'Short Kurta',
                    'Long Kurta'
                ]
            },
            {
                name: 'Sherwanis & Indo-Western',
                slug: 'sherwanis',
                types: [
                    'Classic Sherwani',
                    'Indo-Western Sherwani',
                    'Jodhpuri Suit',
                    'Achkan',
                    'Bandhgala Jacket',
                    'Nehru Jacket'
                ]
            },
            {
                name: 'Ethnic Bottoms',
                slug: 'ethnic-bottoms',
                types: [
                    'Churidar',
                    'Pajama',
                    'Dhoti',
                    'Salwar',
                    'Patiala',
                    'Jodhpuri Pants'
                ]
            },
            {
                name: 'Traditional Outerwear',
                slug: 'traditional-outerwear',
                types: [
                    'Nehru Jacket',
                    'Modi Jacket',
                    'Bandi Waistcoat',
                    'Sadri',
                    'Koti'
                ]
            },
            
            // Western Wear
            {
                name: 'Shirts',
                slug: 'shirts',
                types: [
                    'Formal Shirt',
                    'Casual Shirt',
                    'Linen Shirt',
                    'Denim Shirt',
                    'Oxford Shirt',
                    'Flannel Shirt'
                ]
            },
            {
                name: 'T-Shirts & Polos',
                slug: 'tshirts-polos',
                types: [
                    'Round Neck T-Shirt',
                    'V-Neck T-Shirt',
                    'Polo T-Shirt',
                    'Henley T-Shirt',
                    'Graphic T-Shirt',
                    'Oversized T-Shirt'
                ]
            },
            {
                name: 'Trousers & Pants',
                slug: 'trousers-pants',
                types: [
                    'Formal Trousers',
                    'Chinos',
                    'Cargo Pants',
                    'Joggers',
                    'Track Pants',
                    'Corduroy Pants'
                ]
            },
            {
                name: 'Jeans',
                slug: 'jeans',
                types: [
                    'Slim Fit Jeans',
                    'Regular Fit Jeans',
                    'Skinny Jeans',
                    'Straight Fit Jeans',
                    'Relaxed Fit Jeans',
                    'Ripped Jeans'
                ]
            },
            {
                name: 'Shorts',
                slug: 'shorts',
                types: [
                    'Casual Shorts',
                    'Denim Shorts',
                    'Cargo Shorts',
                    'Sports Shorts',
                    'Bermuda Shorts'
                ]
            },
            
            // Outerwear & Jackets
            {
                name: 'Jackets',
                slug: 'jackets',
                types: [
                    'Bomber Jacket',
                    'Denim Jacket',
                    'Leather Jacket',
                    'Windcheater',
                    'Blazer',
                    'Sports Jacket'
                ]
            },
            {
                name: 'Sweaters & Cardigans',
                slug: 'sweaters-cardigans',
                types: [
                    'Pullover Sweater',
                    'Cardigan',
                    'Hoodie',
                    'Sweatshirt',
                    'Turtleneck Sweater'
                ]
            },
            
            // Activewear
            {
                name: 'Sportswear',
                slug: 'sportswear',
                types: [
                    'Sports T-Shirt',
                    'Track Pants',
                    'Sports Shorts',
                    'Tracksuit',
                    'Gym Vest',
                    'Compression Wear'
                ]
            },
            
            // Innerwear & Loungewear
            {
                name: 'Innerwear',
                slug: 'innerwear',
                types: [
                    'Vests',
                    'Briefs',
                    'Boxers',
                    'Trunks',
                    'Thermal Wear'
                ]
            },
            {
                name: 'Loungewear',
                slug: 'loungewear',
                types: [
                    'Lounge Pants',
                    'Nightwear',
                    'Pyjama Set',
                    'Shorts Set'
                ]
            },
            
            // Accessories
            {
                name: 'Footwear',
                slug: 'footwear',
                types: [
                    'Formal Shoes',
                    'Casual Shoes',
                    'Sneakers',
                    'Loafers',
                    'Sandals',
                    'Flip Flops',
                    'Boots',
                    'Ethnic Footwear'
                ]
            },
            {
                name: 'Bags & Wallets',
                slug: 'bags-wallets',
                types: [
                    'Backpack',
                    'Messenger Bag',
                    'Laptop Bag',
                    'Wallet',
                    'Belt Bag',
                    'Duffle Bag'
                ]
            },
            {
                name: 'Belts & Ties',
                slug: 'belts-ties',
                types: [
                    'Leather Belt',
                    'Canvas Belt',
                    'Formal Tie',
                    'Bow Tie',
                    'Pocket Square'
                ]
            },
            {
                name: 'Caps & Hats',
                slug: 'caps-hats',
                types: [
                    'Baseball Cap',
                    'Snapback',
                    'Beanie',
                    'Fedora',
                    'Bucket Hat'
                ]
            },
            {
                name: 'Ethnic Accessories',
                slug: 'ethnic-accessories',
                types: [
                    'Stole',
                    'Turban',
                    'Brooch',
                    'Cufflinks',
                    'Shawl'
                ]
            }
        ]
    }
];

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/botam_apparels');
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Seed categories
const seedCategories = async () => {
    try {
        await connectDB();

        // Create Category model from schema
        const Category = mongoose.model('Category', categorySchema);

        // Clear existing categories
        await Category.deleteMany({});
        console.log('🗑️  Cleared existing categories');

        // Insert new categories
        await Category.insertMany(categories);
        console.log('✅ Successfully seeded Indian Men\'s Clothing categories:');
        console.log('   - Traditional Wear: 4 subcategories (Kurtas, Sherwanis, Ethnic Bottoms, Traditional Outerwear)');
        console.log('   - Western Wear: 5 subcategories (Shirts, T-Shirts, Trousers, Jeans, Shorts)');
        console.log('   - Outerwear: 2 subcategories (Jackets, Sweaters)');
        console.log('   - Activewear: 1 subcategory (Sportswear)');
        console.log('   - Innerwear & Loungewear: 2 subcategories');
        console.log('   - Accessories: 5 subcategories (Footwear, Bags, Belts, Caps, Ethnic Accessories)');

        console.log('\n📊 Total categories: 1 (Men)');
        console.log('📊 Total subcategories: 19');
        console.log('📊 Total product types: 100+');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
};

// Run seeding
seedCategories();
