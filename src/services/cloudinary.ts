import { CLOUDINARY_CONFIG } from '../config/constants';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}

export const cloudinaryService = {
  async uploadImage(file: File): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
    };
  },

  async uploadMultiple(files: File[]): Promise<CloudinaryUploadResult[]> {
    const uploads = files.map(file => this.uploadImage(file));
    return Promise.all(uploads);
  },
};
