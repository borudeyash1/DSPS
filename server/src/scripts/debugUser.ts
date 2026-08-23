
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to DB');

        const email = 'borudeyash1@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
        } else {
            console.log(JSON.stringify({
                id: user._id,
                name: user.fullName,
                gender: user.gender,
                avatarUrl: user.avatarUrl
            }, null, 2));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUser();
