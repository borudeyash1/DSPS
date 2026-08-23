const mongoose = require('mongoose');

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://devops-db-mongodb-baf43fbb-3797-403c-9a5d-da9c98016028:27017/preview_db';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

async function seedData() {
  await connectToDatabase();
  // Seed data logic here
}

seedData();