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
}

const OptimizedImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  fetchPriority = "auto",
  placeholder = "/placeholder.svg"
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(loading === "eager" ? src : placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Enhanced image optimization for Supabase with responsive images
  const getOptimizedImageUrl = (url: string, targetWidth: number = 400) => {
    if (!url || !url.includes('supabase.co')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${targetWidth}&quality=85&format=webp`;
  };

  // Generate srcset for responsive images
  const generateSrcSet = (url: string, baseWidth: number = 400) => {
    if (!url || !url.includes('supabase.co')) return undefined;
    const widths = [320, 640, 768, 1024, 1280];
    return widths
      .filter(w => w >= baseWidth / 2) // Only include relevant sizes
      .map(w => `${getOptimizedImageUrl(url, w)} ${w}w`)
      .join(', ');
  };

  // Generate sizes attribute for responsive images
  const generateSizes = (baseWidth: number = 400) => {
    return `(max-width: 640px) 100vw, (max-width: 768px) 50vw, ${baseWidth}px`;
  };

  const optimizedSrc = getOptimizedImageUrl(src, width || 400);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Pour les images eagerly loaded, ne pas utiliser l'intersection observer
    if (loading === "eager") {
      setImageSrc(optimizedSrc);
      return;
    }

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
        rootMargin: "100px" // Augmenter la marge pour un chargement plus précoce
      }
    );

    observer.observe(img);

    return () => {
      if (img) {
        observer.unobserve(img);
      }
    };
  }, [optimizedSrc, loading]);

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
      decoding="async"
    />
  );
};

export default OptimizedImage;
