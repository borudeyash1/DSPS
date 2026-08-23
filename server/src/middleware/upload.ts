import multer from 'multer';
import path from 'path';
import fs from 'fs';

import crypto from 'crypto';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.query.folder as string || '';
        const dest = path.join(uploadDir, folder);

        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        cb(null, dest);
    },
    filename: (req, file, cb) => {
        // Create unique secure filename using crypto
        const fileExt = path.extname(file.originalname);
        const randomName = crypto.randomBytes(32).toString('hex');
        cb(null, `${randomName}${fileExt}`);
    }
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// Create upload middleware
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// File filter for videos
const videoFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept videos only
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'));
    }
};

// Create video upload middleware
export const videoUpload = multer({
    storage: storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});
