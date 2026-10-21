import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
}

const DEFAULT_TITLE = 'Find My Job | Latest Jobs, Fresher Jobs & Internships in India';
const DEFAULT_DESCRIPTION =
  'Discover verified job opportunities, fresher tech jobs, software engineering roles, and internships with transparent salaries on Find My Job.';
const CANONICAL_HOST = 'https://findmyjob.site';
const DEFAULT_OG_IMAGE = 'https://findmyjob.site/logo-badge.png';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  noindex = false,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
}) => {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title ? `${title} | Find My Job` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMeta = (attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

 // 2. Standard Meta
 setMeta('name', 'description', description);
 setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

 // 3. Open Graph
 setMeta('property', 'og:title', fullTitle);
 setMeta('property', 'og:description', description);
 setMeta('property', 'og:type', ogType);
 setMeta('property', 'og:site_name', 'Find My Job');
 setMeta('property', 'og:image', ogImage);

 // 4. Twitter Card
 setMeta('name', 'twitter:card', 'summary_large_image');
 setMeta('name', 'twitter:title', fullTitle);
 setMeta('name', 'twitter:description', description);
 setMeta('name', 'twitter:image', ogImage);

    // 5. Canonical Link
    const cleanPath =
      canonicalPath !== undefined
        ? canonicalPath.startsWith('/')
          ? canonicalPath
          : `/${canonicalPath}`
        : window.location.pathname;

    // Normalize path: strip trailing slash except root
    const normalizedPath =
      cleanPath.length > 1 && cleanPath.endsWith('/')
        ? cleanPath.slice(0, -1)
        : cleanPath;
    const fullCanonicalUrl = `${CANONICAL_HOST}${normalizedPath}`;

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', fullCanonicalUrl);
    setMeta('property', 'og:url', fullCanonicalUrl);
  }, [title, description, canonicalPath, noindex, ogType, ogImage]);

  return null;
};
