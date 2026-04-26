import { Router, Request, Response } from 'express';
import multer from 'multer';
import imageService from '../services/imageService';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * POST /api/images/upload
 * Upload single image to Cloudinary
 * Requires authentication
 */
router.post(
  '/upload',
  authMiddleware,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided',
        });
      }

      // Validate file
      imageService.validateImageFile(req.file);

      // Upload to Cloudinary
      const uploadResult = await imageService.uploadImage(
        req.file.buffer,
        req.file.originalname
      );

      return res.status(200).json({
        success: true,
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          size: uploadResult.size,
        },
      });
    } catch (error) {
      console.error('Image upload error:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  }
);

/**
 * POST /api/images/upload-multiple
 * Upload multiple images to Cloudinary
 * Requires authentication
 */
router.post(
  '/upload-multiple',
  authMiddleware,
  upload.array('images', 10), // Max 10 images
  async (req: Request, res: Response) => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'No files provided',
        });
      }

      const files = Array.isArray(req.files) ? req.files : [req.files];
      const uploadResults = [];

      // Validate and upload each file
      for (const file of files) {
        try {
          const multerFile = file as Express.Multer.File;
          imageService.validateImageFile(multerFile);
          const uploadResult = await imageService.uploadImage(
            multerFile.buffer,
            multerFile.originalname
          );
          uploadResults.push(uploadResult);
        } catch (error) {
          console.error(`Failed to upload ${(file as Express.Multer.File).originalname}:`, error);
          // Continue with other files, but track error
          uploadResults.push({
            url: null,
            publicId: null,
            error: error instanceof Error ? error.message : 'Upload failed',
            filename: (file as Express.Multer.File).originalname,
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: uploadResults,
      });
    } catch (error) {
      console.error('Batch upload error:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Batch upload failed',
      });
    }
  }
);

/**
 * DELETE /api/images/:publicId
 * Delete image from Cloudinary
 * Requires authentication
 */
router.delete('/:publicId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID required',
      });
    }

    const deleteResult = await imageService.deleteImage(publicId);

    if (deleteResult.success) {
      return res.status(200).json({
        success: true,
        data: deleteResult,
      });
    } else {
      return res.status(400).json({
        success: false,
        data: deleteResult,
      });
    }
  } catch (error) {
    console.error('Image delete error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Delete failed',
    });
  }
});

export default router;
