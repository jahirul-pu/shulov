import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon, Check } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  /** "compact" = inline preview (products edit), "full" = tall preview (popups) */
  variant?: 'compact' | 'full';
}

const API_URL = 'http://localhost:5000/api/upload';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Product Image',
  required = false,
  variant = 'full',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>(value && value.startsWith('http') ? 'url' : 'upload');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploadError('');
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only JPG, PNG, WebP, GIF files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be under 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      onChange(data.url);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearImage = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-extrabold text-slate-700 flex items-center gap-1">
          <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>

        {/* Mode Toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all ${
              mode === 'upload' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="w-3 h-3 inline -mt-0.5 mr-1" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all ${
              mode === 'url' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon className="w-3 h-3 inline -mt-0.5 mr-1" />
            URL
          </button>
        </div>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && !value && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center ${
            variant === 'full' ? 'p-8' : 'p-5'
          } ${
            isDragging
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-xs font-bold text-slate-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center border border-brand-100">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Drag & drop an image here, or <span className="text-brand-600 underline">browse files</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                JPG, PNG, WebP, GIF — max 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
        />
      )}

      {/* Preview */}
      {value && (
        <div className={`relative group rounded-xl overflow-hidden border border-slate-100 ${
          variant === 'full' ? 'h-36' : 'h-20'
        }`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
          {/* Clear overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <button
              type="button"
              onClick={clearImage}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-slate-700 hover:text-red-500 p-2 rounded-xl shadow-md"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Upload success indicator */}
          {mode === 'upload' && (
            <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" /> Uploaded
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
          <X className="w-3 h-3" /> {uploadError}
        </p>
      )}
    </div>
  );
};
