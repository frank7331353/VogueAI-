
import React, { useRef } from 'react';
import { ImageData } from '../types';

interface ImageUploadProps {
  label: string;
  onUpload: (data: ImageData) => void;
  onRemove: () => void;
  onPreview?: () => void;
  currentImage: string | null;
  id: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, onUpload, onRemove, onPreview, currentImage, id }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onUpload({
          url: reader.result as string,
          base64: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      <div 
        className={`group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${
          currentImage ? 'border-indigo-500 bg-black/40' : 'border-white/10 hover:border-white/30 bg-white/5'
        }`}
      >
        {currentImage ? (
          <>
            <img src={currentImage} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onPreview?.(); }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all border border-white/10"
                title="Preview"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 backdrop-blur-md transition-all border border-red-500/20"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex h-full flex-col items-center justify-center p-4 text-center"
          >
            <svg className="mb-2 h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-gray-500 font-light">Drop image or click to browse</span>
          </div>
        )}
        <input 
          id={id}
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>
    </div>
  );
};
