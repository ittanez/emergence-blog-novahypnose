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

  // Optimiser les URLs avec cache intelligent pour blog
  const getOptimizedImageUrl = (url: string, targetWidth: number = 400) => {
    if (!url || !url.includes('supabase.co')) return url;
    
    const params = new URLSearchParams();
    params.set('width', targetWidth.toString());
    params.set('quality', fetchPriority === 'high' ? '90' : '85');
    params.set('format', 'webp');
    
    // Cache plus long pour les images non-critiques
    if (fetchPriority !== 'high') {
      params.set('cache', '2592000'); // 30 jours
    }
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
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

  return (
    <img
      ref={imgRef}
      src={imageSrc}
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
      // Ajouter décoding async pour de meilleures performances
      decoding="async"
    />
  );
};

export default OptimizedImage;
