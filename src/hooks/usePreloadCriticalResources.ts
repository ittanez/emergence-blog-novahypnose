
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

// Hook spécialisé pour précharger l'image LCP
export const usePreloadLCPImage = (imageUrl: string | null, isFirstArticle: boolean = false) => {
  useEffect(() => {
    if (!imageUrl || !isFirstArticle) return;

    // Précharger avec fetchpriority high pour l'image LCP
    const resources: PreloadResource[] = [{
      href: imageUrl,
      as: 'image',
      fetchpriority: 'high'
    }];

    usePreloadCriticalResources(resources);
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
