import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon, Plus, Star, ArrowLeft, ArrowRight } from 'lucide-react';

interface MultiImageUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  required?: boolean;
}

const API_SINGLE_URL = 'http://localhost:5000/api/upload';
const API_MULTI_URL = 'http://localhost:5000/api/upload/multiple';

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  values,
  onChange,
  label = 'Product Images',
  required = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (files: FileList | File[]) => {
    setUploadError('');
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    for (const f of fileArray) {
      if (!allowed.includes(f.type)) {
        setUploadError(`File ${f.name} is not an allowed format (JPG, PNG, WebP, GIF).`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setUploadError(`File ${f.name} exceeds 5MB limit.`);
        return;
      }
    }

    setIsUploading(true);
    try {
      if (fileArray.length === 1) {
        const formData = new FormData();
        formData.append('image', fileArray[0]);

        const res = await fetch(API_SINGLE_URL, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');

        onChange([...values, data.url]);
      } else {
        const formData = new FormData();
        fileArray.forEach((file) => formData.append('images', file));

        const res = await fetch(API_MULTI_URL, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Multiple upload failed');

        onChange([...values, ...data.urls]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange([...values, urlInput.trim()]);
    setUrlInput('');
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= values.length) return;
    const newValues = [...values];
    const temp = newValues[index];
    newValues[index] = newValues[targetIndex];
    newValues[targetIndex] = temp;
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-extrabold text-slate-700 flex items-center gap-1 uppercase tracking-wider">
          <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
          {label} ({values.length})
          {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-[10px] text-slate-400 font-semibold">First image is primary thumbnail</span>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl cursor-pointer p-4 transition-all text-center ${
          isDragging
            ? 'border-brand-500 bg-brand-50/50'
            : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
            <p className="text-xs font-bold text-slate-600">Uploading image(s)...</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-700">
                <span className="text-brand-600 underline">Click to upload</span> or drag & drop multiple files
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">JPG, PNG, WebP, GIF — max 5MB per file</p>
            </div>
          </div>
        )}
      </div>

      {/* Manual URL Input */}
      <form onSubmit={handleAddUrl} className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste an image URL..."
            className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={!urlInput.trim()}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> Add URL
        </button>
      </form>

      {/* Error Message */}
      {uploadError && (
        <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
          <X className="w-3 h-3" /> {uploadError}
        </p>
      )}

      {/* Gallery of Uploaded / Added Images */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
          {values.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-24 shadow-xs flex items-center justify-center"
            >
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                }}
              />

              {/* Primary Badge */}
              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                  <Star className="w-2.5 h-2.5 fill-white" /> Primary
                </span>
              )}

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'left')}
                    className="p-1 bg-white/90 rounded-lg text-slate-700 hover:text-brand-600 transition-colors shadow-sm"
                    title="Move left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 bg-white/90 rounded-lg text-slate-700 hover:text-red-500 transition-colors shadow-sm"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {index < values.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'right')}
                    className="p-1 bg-white/90 rounded-lg text-slate-700 hover:text-brand-600 transition-colors shadow-sm"
                    title="Move right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
