
import React, { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  placeholder?: string;
}

const OptimizedImage = ({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
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
      onLoad={handleLoad}
      onError={handleError}
      loading={loading}
    />
  );
};

export default OptimizedImage;
