
import React, { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  placeholder?: string;
  isLCP?: boolean; // Nouveau prop pour identifier l'image LCP
}

const OptimizedImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  fetchPriority = "auto",
  placeholder = "/placeholder.svg",
  isLCP = false
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(loading === "eager" || isLCP ? src : placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Enhanced image optimization for Supabase with responsive images
  const getOptimizedImageUrl = (url: string, targetWidth: number = 400) => {
    if (!url || !url.includes('supabase.co')) return url;
    const separator = url.includes('?') ? '&' : '?';
    // Optimiser la qualité pour réduire le poids des images
    return `${url}${separator}width=${targetWidth}&quality=${isLCP ? 85 : 75}&format=webp`;
  };

  // Generate srcset for responsive images
  const generateSrcSet = (url: string, baseWidth: number = 400) => {
    if (!url || !url.includes('supabase.co')) return undefined;
    const widths = isLCP ? [320, 640, 768, 1024] : [320, 640, 768]; // Plus de tailles pour LCP
    return widths
      .filter(w => w >= baseWidth / 2)
      .map(w => `${getOptimizedImageUrl(url, w)} ${w}w`)
      .join(', ');
  };

  // Generate sizes attribute for responsive images
  const generateSizes = (baseWidth: number = 400) => {
    return isLCP 
      ? `(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, ${baseWidth}px`
      : `(max-width: 640px) 100vw, (max-width: 768px) 50vw, ${baseWidth}px`;
  };

  const optimizedSrc = getOptimizedImageUrl(src, width || 400);

  // Précharger l'image LCP immédiatement
  useEffect(() => {
    if (isLCP && src) {
      const img = new Image();
      img.src = optimizedSrc;
      img.onload = () => setIsLoaded(true);
    }
  }, [isLCP, optimizedSrc]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Pour les images LCP ou eagerly loaded, charger immédiatement
    if (loading === "eager" || isLCP) {
      setImageSrc(optimizedSrc);
      return;
    }

    // Détection WebView Android - forcer le chargement immédiat
    const isAndroidWebView = /Android.*wv|Android.*Version\/\d\.\d\s+Mobile|; ?wv\)|Android.*Chrome\/(?:[0-9]{1,2}\.).*Mobile/i.test(navigator.userAgent);

    if (isAndroidWebView) {
      // Dans WebView Android, charger toutes les images immédiatement
      setImageSrc(optimizedSrc);
      return;
    }

    // Utiliser IntersectionObserver seulement si supporté
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(optimizedSrc);
              observer.unobserve(img);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: isLCP ? "200px" : "100px"
        }
      );

      observer.observe(img);

      return () => {
        if (img) {
          observer.unobserve(img);
        }
      };
    } else {
      // Fallback : charger immédiatement si IntersectionObserver n'est pas supporté
      setImageSrc(optimizedSrc);
    }
  }, [optimizedSrc, loading, isLCP]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setImageSrc(placeholder);
  };

  const srcSet = generateSrcSet(src, width || 400);
  const sizes = generateSizes(width || 400);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded && !hasError ? "opacity-100" : "opacity-75"
      } ${className}`}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={isLCP ? "sync" : "async"}
    />
  );
};

export default OptimizedImage;
