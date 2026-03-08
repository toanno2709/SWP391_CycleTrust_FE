import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { cloudinaryService } from '../../services/cloudinary';
import toast from 'react-hot-toast';

interface VideoUploaderProps {
  onUpload: (url: string | null) => void;
  existingUrl?: string;
}

export const VideoUploader = ({ 
  onUpload, 
  existingUrl 
}: VideoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(existingUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn file video');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error('Video không được vượt quá 100MB');
      return;
    }

    setUploading(true);
    try {
      const result = await cloudinaryService.uploadVideo(file);
      setVideoUrl(result.url);
      onUpload(result.url);
      toast.success('Upload video thành công!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload video thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoUrl(null);
    onUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {videoUrl ? (
        <div className="relative rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
          <video 
            src={videoUrl} 
            controls 
            className="w-full max-h-96 bg-black"
          >
            Trình duyệt không hỗ trợ video.
          </video>
          <button
            onClick={removeVideo}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <span className="material-symbols-outlined text-4xl text-green-600 animate-spin">refresh</span>
              <span className="text-sm text-slate-500">Đang upload...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-4xl text-slate-400">videocam</span>
              <span className="text-sm text-slate-500">Thêm video (tùy chọn)</span>
              <span className="text-xs text-slate-400">Tối đa 100MB</span>
            </>
          )}
        </button>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {videoUrl && (
        <p className="text-sm text-green-600">✓ Video đã tải lên</p>
      )}
    </div>
  );
};
