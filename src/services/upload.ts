import { apiClient } from './api';
import type { ApiResponse } from '../types';

export const uploadService = {
  async uploadInspectionReport(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<string>>(
      '/upload/inspection-report',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Return the file URL (will be relative path like /uploads/inspections/xxx.pdf)
    return `http://localhost:5000${response.data}`;
  },

  async uploadListingImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<string>>(
      '/upload/listing-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Return the file URL
    return `http://localhost:5000${response.data}`;
  },
};
