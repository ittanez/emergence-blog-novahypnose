/**
 * Image CDN Optimizer for Supabase Storage
 * Automatically optimizes images with responsive sizes and modern formats
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  dpr?: number; // Device pixel ratio
}

export class ImageOptimizer {
  private static readonly SUPABASE_STORAGE_URL = 'akrlyzmfszumibwgocae.supabase.co';
  
  /**
   * Optimize image URL with CDN parameters
   */
  static optimize(url: string, options: ImageOptimizationOptions = {}): string {
    if (!url || !url.includes(this.SUPABASE_STORAGE_URL)) {
      return url;
    }

    const {
      width = 400,
      height,
      quality = 85,
      format = 'webp',
      dpr = 1
    } = options;

    // Adjust width for device pixel ratio
    const optimizedWidth = Math.round(width * dpr);
    const optimizedHeight = height ? Math.round(height * dpr) : undefined;

    const params = new URLSearchParams();
    params.set('width', optimizedWidth.toString());
    if (optimizedHeight) params.set('height', optimizedHeight.toString());
    params.set('quality', quality.toString());
    params.set('format', format);
    
    // Add resize mode for better performance
    params.set('resize', 'cover');
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  static generateResponsiveSources(url: string, baseWidth: number = 400): Array<{
    srcset: string;
    media?: string;
    type?: string;
  }> {
    if (!url || !url.includes(this.SUPABASE_STORAGE_URL)) {
      return [{ srcset: url }];
    }

    const sizes = [
      { width: baseWidth * 0.5, media: '(max-width: 640px)' }, // Mobile
      { width: baseWidth, media: '(max-width: 1024px)' }, // Tablet
      { width: baseWidth * 1.5, media: '(min-width: 1025px)' }, // Desktop
    ];

    return [
      // AVIF sources (best compression)
      ...sizes.map(size => ({
        srcset: `${this.optimize(url, { width: size.width, format: 'avif' })} 1x, ${this.optimize(url, { width: size.width * 2, format: 'avif' })} 2x`,
        media: size.media,
        type: 'image/avif'
      })),
      // WebP fallback
      ...sizes.map(size => ({
        srcset: `${this.optimize(url, { width: size.width, format: 'webp' })} 1x, ${this.optimize(url, { width: size.width * 2, format: 'webp' })} 2x`,
        media: size.media,
        type: 'image/webp'
      })),
      // Original fallback
      { srcset: url }
    ];
  }

  /**
   * Get LCP (Largest Contentful Paint) optimized URL
   */
  static getLCPOptimized(url: string): string {
    return this.optimize(url, {
      width: 800, // Larger for LCP
      quality: 90, // Higher quality for hero images
      format: 'webp'
    });
  }

  /**
   * Get thumbnail optimized URL
   */
  static getThumbnail(url: string, size: number = 150): string {
    return this.optimize(url, {
      width: size,
      height: size,
      quality: 80,
      format: 'webp'
    });
  }
}

// Utility functions for easy use
export const optimizeImage = ImageOptimizer.optimize;
export const getResponsiveSources = ImageOptimizer.generateResponsiveSources;
export const getLCPImage = ImageOptimizer.getLCPOptimized;
export const getThumbnail = ImageOptimizer.getThumbnail;