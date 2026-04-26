import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResponse {
  url: string;
  publicId: string;
  size: number;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

/**
 * ImageService - Handles image uploads and deletions via Cloudinary
 */
class ImageService {
  /**
   * Upload image to Cloudinary
   * @param fileBuffer - Buffer of the image file
   * @param filename - Original filename
   * @param folder - Optional Cloudinary folder path
   * @returns Promise<UploadResponse> - URL and public ID
   */
  async uploadImage(
    fileBuffer: Buffer,
    filename: string,
    folder: string = 'nerdetatil/posts'
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          public_id: `${Date.now()}_${filename.replace(/\.[^/.]+$/, '')}`,
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              size: result.bytes,
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Cloudinary public ID of the image
   * @returns Promise<DeleteResponse> - Success status
   */
  async deleteImage(publicId: string): Promise<DeleteResponse> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === 'ok') {
        return {
          success: true,
          message: `Image ${publicId} deleted successfully`,
        };
      } else {
        return {
          success: false,
          message: `Failed to delete image ${publicId}`,
        };
      }
    } catch (error) {
      throw new Error(
        `Cloudinary delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete multiple images
   * @param publicIds - Array of Cloudinary public IDs
   * @returns Promise<DeleteResponse[]> - Results for each deletion
   */
  async deleteImages(publicIds: string[]): Promise<DeleteResponse[]> {
    return Promise.all(publicIds.map((publicId) => this.deleteImage(publicId)));
  }

  /**
   * Validate image file
   * @param file - Multer file object
   * @throws Error if validation fails
   */
  validateImageFile(file: Express.Multer.File): void {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of 5MB`
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error(
        `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }
  }
}

export default new ImageService();
