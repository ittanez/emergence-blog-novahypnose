/**
 * Image Cache Manager pour Blog
 * Gère le cache intelligent des images qui changent souvent
 */

export class ImageCacheManager {
  private static readonly CACHE_VERSION = Date.now().toString(36); // Version basée sur le build
  
  /**
   * Ajoute une version à l'URL d'image pour forcer le refresh si nécessaire
   */
  static addVersion(url: string, forceRefresh: boolean = false): string {
    if (!url || !url.includes('supabase.co')) {
      return url;
    }
    
    const separator = url.includes('?') ? '&' : '?';
    const version = forceRefresh ? Date.now().toString(36) : this.CACHE_VERSION;
    
    return `${url}${separator}v=${version}`;
  }
  
  /**
   * Optimise une URL d'image avec cache et compression
   */
  static optimizeImageUrl(url: string, options: {
    width?: number;
    quality?: number;
    format?: string;
    cache?: 'long' | 'medium' | 'short';
  } = {}): string {
    if (!url || !url.includes('supabase.co')) {
      return url;
    }
    
    const {
      width = 400,
      quality = 85,
      format = 'webp',
      cache = 'medium'
    } = options;
    
    const params = new URLSearchParams();
    params.set('width', width.toString());
    params.set('quality', quality.toString());
    params.set('format', format);
    
    // Ajouter cache-control selon le type
    switch (cache) {
      case 'long':
        params.set('cache', '2592000'); // 30 jours
        break;
      case 'medium':
        params.set('cache', '604800'); // 7 jours
        break;
      case 'short':
        params.set('cache', '86400'); // 1 jour
        break;
    }
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }
  
  /**
   * Précharge intelligemment les images selon leur priorité
   */
  static preloadImage(url: string, priority: 'high' | 'low' = 'low'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = priority;
    
    // Auto-remove après chargement pour éviter l'encombrement
    link.onload = () => {
      setTimeout(() => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      }, 1000);
    };
    
    document.head.appendChild(link);
  }
  
  /**
   * Stratégie de cache pour différents types d'images blog
   */
  static getBlogImageUrl(url: string, type: 'hero' | 'thumbnail' | 'content'): string {
    const strategies = {
      hero: { width: 800, quality: 90, cache: 'medium' as const }, // Images héros
      thumbnail: { width: 400, quality: 80, cache: 'long' as const }, // Vignettes articles
      content: { width: 600, quality: 85, cache: 'medium' as const } // Images dans contenu
    };
    
    return this.optimizeImageUrl(url, strategies[type]);
  }
}

// Utilities pour usage facile
export const addImageVersion = ImageCacheManager.addVersion;
export const optimizeImage = ImageCacheManager.optimizeImageUrl;
export const preloadImage = ImageCacheManager.preloadImage;
export const getBlogImage = ImageCacheManager.getBlogImageUrl;