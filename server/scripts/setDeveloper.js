const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const AdminSchema = new mongoose.Schema({
    email: String,
    isDeveloper: Boolean
}, { strict: false }); // strict: false allows partial schema

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

const setDeveloper = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not found in .env');
            process.exit(1);
        }
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = process.argv[2];
        if (!email) {
            console.log('Please provide an email address');
            console.log('Usage: node scripts/setDeveloper.js <admin-email>');
            process.exit(1);
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log(`Admin with email ${email} not found`);
            process.exit(1);
        }

        // We update directly to avoid validation issues with our partial schema
        await mongoose.connection.collection('admins').updateOne(
            { _id: admin._id },
            { 
              $set: { role: 'developer' },
              $unset: { isDeveloper: "" } // Remove the old field if it exists
            }
        );

        console.log(`Successfully set role='developer' for ${email}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

setDeveloper();
