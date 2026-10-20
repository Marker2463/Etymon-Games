import { useEffect } from 'react';
import { SITE_URL } from '../utils/daily';

export function usePageMetadata(title: string, description: string, canonicalPath = '') {
  useEffect(() => {
    // Page Title
    const formattedTitle = title === 'Etymon' ? 'Etymon — The Editorial Word Game of Orthographic Oddities' : `${title} | Etymon`;
    document.title = formattedTitle;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // OpenGraph Title & Description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', formattedTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE_URL}${canonicalPath}`);
  }, [title, description, canonicalPath]);
}
