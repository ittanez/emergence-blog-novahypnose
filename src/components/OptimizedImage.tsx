import React, { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";        // ✅ Syntaxe TypeScript correcte
  fetchPriority?: "high" | "low" | "auto";   // ✅ Syntaxe TypeScript correcte
  style?: React.CSSProperties;       // ✅ Type correct pour style
  placeholder?: string;
}

const OptimizedImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "eager",        // ✅ Valeur par défaut correcte
  fetchPriority = "high",   // ✅ Valeur par défaut correcte
  style = { aspectRatio: '16/9' }, // ✅ Valeur par défaut correcte
  placeholder = "/placeholder.svg"
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(img);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px"
      }
    );

    if (loading === "lazy") {
      observer.observe(img);
    } else {
      // Pour eager loading, charger immédiatement
      setImageSrc(src);
    }

    return () => {
      if (img) {
        observer.unobserve(img);
      }
    };
  }, [src, loading]);

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
      style={style}
      onLoad={handleLoad}
      onError={handleError}
      loading={loading}
      fetchPriority={fetchPriority}  // ✅ Ajouté l'attribut fetchPriority
    />
  );
};

export default OptimizedImage;
