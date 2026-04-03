import Env from '@env';
import axios from 'axios';

import { extractError } from '@/components/ui';
import { getOptimizedImageUrl } from '@/lib/utils';

export class CloudinaryService {
  /**
   * Upload an image (base64 or URI) directly to Cloudinary using generating an SHA1 signature.
   *
   * @param imageUri Base64 string or file URI (e.g. `data:image/jpeg;base64,...`)
   * @param publicId Optional fixed ID (e.g., UserId) to overwrite an existing avatar
   * @returns Optimized WebP URL
   */
  async uploadImage(imageUri: string, publicId: string): Promise<string> {
    const dataUploadImage = {
      file: imageUri,
      upload_preset: Env.CLOUDINARY_UPLOAD_PRESET,
      public_id: publicId,
    };

    try {
      const uploadImageResult = await axios.post(
        `https://api.cloudinary.com/v1_1/${Env.CLOUDINARY_UPLOAD_CLOUD_NAME}/image/upload`,
        dataUploadImage,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // Return an optimized WebP link
      return getOptimizedImageUrl(uploadImageResult.data.secure_url, {
        quality: 80,
        format: 'webp',
      });
    }
    catch (error: any) {
      if (error?.response?.data?.error?.message) {
        throw new Error(extractError(error.response.data.error.message));
      }
      throw new Error(extractError(error.message || 'Error uploading image to Cloudinary'));
    }
  }

  /**
   * Delete an existing image using the public_id
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await axios.delete(
        `https://api.cloudinary.com/v1_1/${Env.CLOUDINARY_UPLOAD_CLOUD_NAME}/resources/image/upload`,
        {
          auth: {
            username: Env.CLOUDINARY_UPLOAD_API_KEY,
            password: Env.CLOUDINARY_UPLOAD_API_SECRET,
          },
          data: {
            public_ids: [publicId],
          },
        },
      );
    }
    catch {
      // Ignore deletion errors (e.g. if the file wasn't there)
    }
  }
}

export const cloudinaryService = new CloudinaryService();
