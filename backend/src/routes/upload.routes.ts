import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Upload single image
router.post('/product-image', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                url: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

export default router;