
```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/botam-apparels', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Seed the database
async function seedDatabase() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create a new user
    const newUser = new User({
      email: 'admin@example.com',
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();
    console.log('User seeded successfully:', newUser.email);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the seeding function
seedDatabase();
```
