import client from './client';

interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    publicId: string;
    size: number;
  };
}

interface UploadMultipleResponse {
  success: boolean;
  data: Array<{
    url?: string;
    publicId?: string;
    size?: number;
    error?: string;
    filename: string;
  }>;
}

interface DeleteResponse {
  success: boolean;
  data: {
    success: boolean;
    message: string;
  };
}

/**
 * ImageService - API client for image operations
 */
class ImageService {
  /**
   * Upload single image
   * @param file - Image file
   * @returns Promise<UploadResponse>
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await client.post<UploadResponse>(
      '/images/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Upload multiple images
   * @param files - Array of image files
   * @returns Promise<UploadMultipleResponse>
   */
  async uploadMultiple(files: File[]): Promise<UploadMultipleResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await client.post<UploadMultipleResponse>(
      '/images/upload-multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Delete image by public ID
   * @param publicId - Cloudinary public ID
   * @returns Promise<DeleteResponse>
   */
  async deleteImage(publicId: string): Promise<DeleteResponse> {
    const response = await client.delete<DeleteResponse>(
      `/images/${publicId}`
    );

    return response.data;
  }

  /**
   * Delete multiple images
   * @param publicIds - Array of public IDs
   * @returns Promise<DeleteResponse[]>
   */
  async deleteMultiple(publicIds: string[]): Promise<DeleteResponse[]> {
    return Promise.all(
      publicIds.map((publicId) => this.deleteImage(publicId))
    );
  }
}

export default new ImageService();
