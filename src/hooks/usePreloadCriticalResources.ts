
import { useEffect } from 'react';

interface PreloadResource {
  href: string;
  as: 'image' | 'script' | 'style' | 'font';
  type?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
  fetchpriority?: 'high' | 'low' | 'auto';
}

const usePreloadCriticalResources = (resources: PreloadResource[]) => {
  useEffect(() => {
    const preloadLinks: HTMLLinkElement[] = [];

    resources.forEach(({ href, as, type, crossorigin, fetchpriority }) => {
      // Check if resource is already preloaded
      const existingLink = document.querySelector(
        `link[rel="preload"][href="${href}"]`
      );
      
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        
        if (type) link.type = type;
        if (crossorigin) link.crossOrigin = crossorigin;
        if (fetchpriority) link.setAttribute('fetchpriority', fetchpriority);
        
        // Add to head
        document.head.appendChild(link);
        preloadLinks.push(link);
      }
    });

    // Cleanup function to remove preload links
    return () => {
      preloadLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [resources]);
};

// Hook spécialisé pour précharger l'image LCP - FIXED: No longer calls hooks inside useEffect
export const usePreloadLCPImage = (imageUrl: string | null, isFirstArticle: boolean = false) => {
  // Create resources array conditionally at the top level
  const resources: PreloadResource[] = imageUrl && isFirstArticle ? [{
    href: imageUrl,
    as: 'image',
    fetchpriority: 'high'
  }] : [];

  // Call the hook at the top level with conditional resources
  usePreloadCriticalResources(resources);

  // Separate effect for image preloading optimization
  useEffect(() => {
    if (!imageUrl || !isFirstArticle) return;

    const img = new Image();
    img.src = imageUrl;
  }, [imageUrl, isFirstArticle]);
};

export const usePreloadHeroImages = (imageUrls: string[]) => {
  const resources: PreloadResource[] = imageUrls.map(url => ({
    href: url,
    as: 'image',
    fetchpriority: 'high'
  }));

  usePreloadCriticalResources(resources);
};

export const usePreloadFonts = (fontUrls: string[]) => {
  const resources: PreloadResource[] = fontUrls.map(url => ({
    href: url,
    as: 'font',
    type: 'font/woff2',
    crossorigin: 'anonymous'
  }));

  usePreloadCriticalResources(resources);
};

export default usePreloadCriticalResources;
