import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { cloudinaryService } from '../../services/cloudinary';

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  existingUrls?: string[];
}

export const ImageUploader = ({ 
  onUpload, 
  maxFiles = 10,
  existingUrls = []
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(existingUrls);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxFiles - previews.length;
    const filesToUpload = files.slice(0, remainingSlots);

    setUploading(true);
    try {
      const results = await cloudinaryService.uploadMultiple(filesToUpload);
      const newUrls = results.map(r => r.url);
      const updatedPreviews = [...previews, ...newUrls];
      setPreviews(updatedPreviews);
      onUpload(updatedPreviews);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onUpload(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {previews.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                Ảnh đại diện
              </div>
            )}
          </div>
        ))}
        
        {previews.length < maxFiles && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="material-symbols-outlined text-4xl text-green-600 animate-spin">refresh</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-4xl text-slate-400">add_photo_alternate</span>
                <span className="text-sm text-slate-500">Thêm ảnh</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-sm text-slate-500">
        Đã tải {previews.length}/{maxFiles} ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.
      </p>
    </div>
  );
};
