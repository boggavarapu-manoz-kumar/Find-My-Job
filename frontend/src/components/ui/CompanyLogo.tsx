import React, { useState } from 'react';

export type CompanyLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface CompanyLogoProps {
  companyName: string;
  logoUrl?: string | null;
  altText?: string | null;
  size?: CompanyLogoSize;
  className?: string;
}

const SIZE_MAP: Record<CompanyLogoSize, { px: number; textClass: string; containerClass: string }> = {
  xs: { px: 20, textClass: 'text-[10px]', containerClass: 'w-5 h-5 rounded' },
  sm: { px: 28, textClass: 'text-xs', containerClass: 'w-7 h-7 rounded-md' },
  md: { px: 40, textClass: 'text-sm', containerClass: 'w-10 h-10 rounded-lg' },
  lg: { px: 56, textClass: 'text-lg', containerClass: 'w-14 h-14 rounded-xl' },
  xl: { px: 72, textClass: 'text-2xl', containerClass: 'w-[72px] h-[72px] rounded-2xl' },
};

// Deterministic pleasing palette for monogram backgrounds
const GRADIENTS = [
  'from-indigo-500 to-purple-600 text-white',
  'from-blue-500 to-cyan-600 text-white',
  'from-emerald-500 to-teal-600 text-white',
  'from-violet-500 to-fuchsia-600 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-rose-500 to-pink-600 text-white',
  'from-teal-500 to-emerald-600 text-white',
  'from-sky-500 to-blue-600 text-white',
];

function getMonogramGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

/**
 * Optimizes Cloudinary CDN URLs with responsive dimensions, auto-format (WebP/AVIF),
 * and automatic quality compression while preserving aspect ratio.
 */
export function optimizeCloudinaryUrl(url: string | null | undefined, pixelSize: number): string | null {
  if (!url) return null;
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }

  // Request 2x resolution for crisp high-DPI / Retina displays
  const targetPx = Math.min(Math.max(pixelSize * 2, 64), 512);
  const transformation = `f_auto,q_auto,c_fit,w_${targetPx},h_${targetPx}`;

  // Insert transformation after "/image/upload/"
  return url.replace('/image/upload/', `/image/upload/${transformation}/`);
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  companyName,
  logoUrl,
  altText,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  const trimmedName = companyName?.trim() || 'Company';
  const initial = trimmedName.charAt(0).toUpperCase();
  const alt = altText || `${trimmedName} logo`;

  const optimizedSrc = !hasError && logoUrl ? optimizeCloudinaryUrl(logoUrl, sizeConfig.px) : null;

  if (optimizedSrc) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-white border border-canvas-border shadow-xs ${sizeConfig.containerClass} ${className}`}
        style={{ width: `${sizeConfig.px}px`, height: `${sizeConfig.px}px` }}
      >
        <img
          src={optimizedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={sizeConfig.px}
          height={sizeConfig.px}
          className="w-full h-full object-contain p-1 select-none"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Fallback Monogram
  const gradientClass = getMonogramGradient(trimmedName);

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 font-bold tracking-tight select-none bg-gradient-to-br shadow-xs ${gradientClass} ${sizeConfig.containerClass} ${sizeConfig.textClass} ${className}`}
      style={{ width: `${sizeConfig.px}px`, height: `${sizeConfig.px}px` }}
      aria-label={alt}
      title={trimmedName}
    >
      {initial}
    </div>
  );
};

export default CompanyLogo;
