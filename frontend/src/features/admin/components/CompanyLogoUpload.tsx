import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { CompanyLogo } from '../../../components/ui/CompanyLogo';
import companyService from '../../../api/companyService';

export interface CompanyLogoUploadProps {
  companyName: string;
  companyId?: number | null;
  currentLogoUrl?: string | null;
  onLogoUpdated: (newLogoUrl: string | null, stagedFile?: File | null) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

export const CompanyLogoUpload: React.FC<CompanyLogoUploadProps> = ({
  companyName,
  companyId,
  currentLogoUrl,
  onLogoUpdated,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleValidateAndProcessFile = async (file: File) => {
    setUploadError(null);

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadError('Invalid format. Please select a PNG, JPG, WebP, or SVG file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError('File size exceeds 2 MB limit. Please choose a smaller logo.');
      return;
    }

    // Local object URL for instant UI preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // If company exists in backend, upload directly through Cloudinary service
    if (companyId) {
      setIsUploading(true);
      try {
        const updated = await companyService.uploadCompanyLogo(companyId, file);
        setPreviewUrl(updated.logoUrl || null);
        onLogoUpdated(updated.logoUrl || null, null);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to upload logo to Cloudinary';
        setUploadError(errorMsg);
        setPreviewUrl(currentLogoUrl || null);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Company is not yet created in backend; stage the file to be uploaded upon form submit
      onLogoUpdated(localUrl, file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleValidateAndProcessFile(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    setUploadError(null);
    if (companyId && currentLogoUrl) {
      setIsUploading(true);
      try {
        await companyService.removeCompanyLogo(companyId);
        setPreviewUrl(null);
        onLogoUpdated(null, null);
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Failed to remove logo');
      } finally {
        setIsUploading(false);
      }
    } else {
      setPreviewUrl(null);
      onLogoUpdated(null, null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-ink-700">
          Company Logo <span className="text-ink-400 font-normal">(Cloudinary CDN, Max 2MB)</span>
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Remove logo
          </button>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`group relative flex items-center gap-4 p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? 'border-brand-500 bg-brand-50/50'
            : 'border-canvas-border hover:border-brand-400 bg-canvas-base hover:bg-canvas-subtle/50'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Logo preview */}
        <div className="relative shrink-0">
          <CompanyLogo
            companyName={companyName || 'Company'}
            logoUrl={previewUrl}
            size="lg"
            className="border-brand-100 shadow-sm"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-ink-900/60 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Dropzone prompt */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-800">
            <Upload className="w-3.5 h-3.5 text-brand-600" />
            <span>{previewUrl ? 'Click or drag to replace logo' : 'Upload company logo'}</span>
          </div>
          <p className="text-[11px] text-ink-500 mt-0.5">
            PNG, JPG, WebP, or SVG. Automatically optimized for sub-second loading via Cloudinary CDN.
          </p>
        </div>

        {/* Trigger button */}
        <div className="hidden sm:block">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1.5 rounded-lg group-hover:bg-brand-100/70 transition-colors">
            <ImageIcon className="w-3.5 h-3.5" />
            Browse
          </span>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};

export default CompanyLogoUpload;
