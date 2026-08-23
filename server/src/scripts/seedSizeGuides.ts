import mongoose from 'mongoose';
import SizeGuide from '../models/SizeGuide';
import dotenv from 'dotenv';

dotenv.config();

const sizeGuideTemplates = [
    // ========== MEN'S TRADITIONAL WEAR ==========
    {
        name: "Men's Kurtas & Sherwanis",
        category: "men",
        productType: ["kurtas", "sherwanis", "pathani-kurta", "angrakha-kurta", "sherwani", "achkan", "bandhgala"],
        description: "Standard measurements for men's traditional Indian wear",
        units: ["in"],
        columns: [
            { header: "Size", key: "size" },
            { header: "Chest (in)", key: "chest" },
            { header: "Length (in)", key: "length" },
            { header: "Shoulder (in)", key: "shoulder" }
        ],
        data: [
            { size: "S (38)", chest: "38", length: "40-42", shoulder: "16.5" },
            { size: "M (40)", chest: "40", length: "42-44", shoulder: "17" },
            { size: "L (42)", chest: "42", length: "44-46", shoulder: "17.5" },
            { size: "XL (44)", chest: "44", length: "46-48", shoulder: "18" },
            { size: "XXL (46)", chest: "46", length: "48-50", shoulder: "18.5" },
            { size: "XXXL (48)", chest: "48", length: "50-52", shoulder: "19" }
        ]
    },
    {
        name: "Men's Ethnic Bottoms (Churidar/Pajama)",
        category: "men",
        productType: ["churidar", "pajama", "dhoti", "salwar", "patiala", "jodhpuri-pants"],
        description: "Standard measurements for men's ethnic bottomwear",
        units: ["in"],
        columns: [
            { header: "Size", key: "size" },
            { header: "Waist (in)", key: "waist" },
            { header: "Length (in)", key: "length" },
            { header: "Hip (in)", key: "hip" }
        ],
        data: [
            { size: "S", waist: "28-30", length: "38-40", hip: "36-38" },
            { size: "M", waist: "32-34", length: "40-42", hip: "38-40" },
            { size: "L", waist: "36-38", length: "42-44", hip: "40-42" },
            { size: "XL", waist: "40-42", length: "44-46", hip: "42-44" },
            { size: "XXL", waist: "44-46", length: "46-48", hip: "44-46" }
        ]
    },

    // ========== MEN'S WESTERN WEAR ==========
    {
        name: "Men's Shirts & T-Shirts",
        category: "men",
        productType: ["t-shirts", "polo-shirts", "shirts", "casual-shirt", "formal-shirt", "linen-shirt"],
        description: "Standard measurements for men's western topwear",
        units: ["in"],
        columns: [
            { header: "Size", key: "size" },
            { header: "Chest (in)", key: "chest" },
            { header: "Length (in)", key: "length" },
            { header: "Shoulder (in)", key: "shoulder" }
        ],
        data: [
            { size: "S", chest: "36-38", length: "27-28", shoulder: "16" },
            { size: "M", chest: "38-40", length: "28-29", shoulder: "17" },
            { size: "L", chest: "40-42", length: "29-30", shoulder: "18" },
            { size: "XL", chest: "42-44", length: "30-31", shoulder: "19" },
            { size: "XXL", chest: "44-46", length: "31-32", shoulder: "20" }
        ]
    },
    {
        name: "Men's Jeans & Trousers",
        category: "men",
        productType: ["jeans", "chinos", "trousers", "pants", "cargo-pants", "formal-trousers"],
        description: "Standard measurements for men's western bottomwear",
        units: ["in"],
        columns: [
            { header: "Waist Size", key: "waist" },
            { header: "Waist (in)", key: "waist_measure" },
            { header: "Inseam (in)", key: "inseam" },
            { header: "Hip (in)", key: "hip" }
        ],
        data: [
            { waist: "28", waist_measure: "28", inseam: "30-34", hip: "36" },
            { waist: "30", waist_measure: "30", inseam: "30-34", hip: "38" },
            { waist: "32", waist_measure: "32", inseam: "30-34", hip: "40" },
            { waist: "34", waist_measure: "34", inseam: "30-34", hip: "42" },
            { waist: "36", waist_measure: "36", inseam: "30-34", hip: "44" },
            { waist: "38", waist_measure: "38", inseam: "30-34", hip: "46" },
            { waist: "40", waist_measure: "40", inseam: "30-34", hip: "48" },
            { waist: "42", waist_measure: "42", inseam: "30-34", hip: "50" }
        ]
    },
    {
        name: "Men's Jackets & Outerwear",
        category: "men",
        productType: ["jackets", "blazer", "bomber-jacket", "leather-jacket", "sweaters", "hoodies", "sweatshirts"],
        description: "Standard measurements for men's outerwear",
        units: ["in"],
        columns: [
            { header: "Size", key: "size" },
            { header: "Chest (in)", key: "chest" },
            { header: "Length (in)", key: "length" },
            { header: "Shoulder (in)", key: "shoulder" },
            { header: "Sleeve (in)", key: "sleeve" }
        ],
        data: [
            { size: "S", chest: "38-40", length: "26-27", shoulder: "17", sleeve: "24" },
            { size: "M", chest: "40-42", length: "27-28", shoulder: "18", sleeve: "25" },
            { size: "L", chest: "42-44", length: "28-29", shoulder: "19", sleeve: "26" },
            { size: "XL", chest: "44-46", length: "29-30", shoulder: "20", sleeve: "27" },
            { size: "XXL", chest: "46-48", length: "30-31", shoulder: "21", sleeve: "28" }
        ]
    },

    // ========== MEN'S INNERWEAR ==========
    {
        name: "Men's Innerwear (Briefs/Trunks/Boxers)",
        category: "men",
        productType: ["briefs", "trunks", "boxers", "vests", "innerwear", "thermal-wear"],
        description: "Standard measurements for men's innerwear",
        units: ["in", "cm"],
        columns: [
            { header: "Size", key: "size" },
            { header: "Waist (in)", key: "waist_in" },
            { header: "Waist (cm)", key: "waist_cm" }
        ],
        data: [
            { size: "S", waist_in: "28-30", waist_cm: "70-75" },
            { size: "M", waist_in: "32-34", waist_cm: "80-85" },
            { size: "L", waist_in: "36-38", waist_cm: "90-95" },
            { size: "XL", waist_in: "40-42", waist_cm: "100-105" },
            { size: "XXL", waist_in: "44-46", waist_cm: "110-115" }
        ]
    },

    // ========== FOOTWEAR ==========
    {
        name: "Men's Footwear Size Chart",
        category: "footwear",
        productType: ["shoes", "sandals", "sneakers", "boots", "loafers", "formal-shoes", "ethnic-footwear"],
        description: "International shoe size conversion chart for men",
        units: ["cm"],
        columns: [
            { header: "UK/India", key: "uk" },
            { header: "Euro", key: "euro" },
            { header: "US", key: "us" },
            { header: "Length (cm)", key: "length" }
        ],
        data: [
            { uk: "6", euro: "40", us: "7", length: "25.1" },
            { uk: "7", euro: "41", us: "8", length: "25.7" },
            { uk: "8", euro: "42", us: "9", length: "26.3" },
            { uk: "9", euro: "43", us: "10", length: "26.9" },
            { uk: "10", euro: "44", us: "11", length: "27.5" },
            { uk: "11", euro: "45", us: "12", length: "28.1" },
            { uk: "12", euro: "46", us: "13", length: "28.7" }
        ]
    }
];

async function seedSizeGuides() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/botam-apparels');
        console.log('✅ Connected to MongoDB');

        // Clear existing size guides
        await SizeGuide.deleteMany({});
        console.log('🗑️  Cleared existing size guides');

        // Insert new size guides
        const inserted = await SizeGuide.insertMany(sizeGuideTemplates);
        console.log(`✅ Inserted ${inserted.length} size guide templates for men's clothing`);

        // Display summary
        console.log('\n📊 Size Guide Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n👔 TRADITIONAL WEAR:');
        console.log('   - Kurtas & Sherwanis (6 sizes: S-XXXL)');
        console.log('   - Ethnic Bottoms (5 sizes: S-XXL)');
        console.log('\n👕 WESTERN WEAR:');
        console.log('   - Shirts & T-Shirts (5 sizes: S-XXL)');
        console.log('   - Jeans & Trousers (8 waist sizes: 28-42)');
        console.log('   - Jackets & Outerwear (5 sizes: S-XXL)');
        console.log('\n🩲 INNERWEAR:');
        console.log('   - Briefs/Trunks/Boxers (5 sizes: S-XXL)');
        console.log('\n👞 FOOTWEAR:');
        console.log('   - Men\'s Shoes (7 sizes: UK 6-12)');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Size guides seeded successfully!');
        console.log(`📏 Total templates: ${inserted.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding size guides:', error);
        process.exit(1);
    }
}

// Run the seed function
seedSizeGuides();
