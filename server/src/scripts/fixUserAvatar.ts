
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const fixAvatar = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to DB');

        const email = 'borudeyash1@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('Current Avatar:', user.avatarUrl);

        const encodedName = encodeURIComponent(user.fullName);
        let newAvatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=200`;

        if (user.gender === 'Male') {
            newAvatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff&size=200`;
        } else if (user.gender === 'Female') {
            newAvatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=E91E63&color=fff&size=200`;
        }

        user.avatarUrl = newAvatarUrl;
        await user.save();

        console.log('✅ Updated Avatar to:', newAvatarUrl);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

fixAvatar();
