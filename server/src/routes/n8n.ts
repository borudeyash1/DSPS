import express from 'express';
import { getN8nContext } from '../controllers/n8nController';

const router = express.Router();

// Middleware to secure n8n endpoints
const checkN8nApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKey = req.headers['x-n8n-api-key'];
    // In production, this should be in process.env.N8N_API_KEY
    // For now, we'll check against a configured env var or a default for dev if missing (WARNING: Secure this!)
    const validKey = process.env.N8N_API_KEY || 'generated-secret-key-change-me';

    if (apiKey !== validKey) {
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
        return;
    }
    next();
};

router.post('/context', checkN8nApiKey, getN8nContext);

export default router;
