import React, { useState, useRef, useEffect } from "react";
import { ImageOptimizer, getResponsiveSources, getLCPImage } from "@/lib/utils/imageOptimizer";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  placeholder?: string;
  isLCP?: boolean; // Mark as Largest Contentful Paint element
  sizes?: string;
}

const ResponsiveImage = ({
  src,
  alt,
  className = "",
  width = 400,
  height,
  loading = "lazy",
  fetchPriority = "auto",
  placeholder = "/placeholder.svg",
  isLCP = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
}: ResponsiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [shouldLoad, setShouldLoad] = useState(loading === "eager" || isLCP);

  // Generate responsive sources
  const responsiveSources = getResponsiveSources(src, width);
  
  // Get optimized main source
  const optimizedSrc = isLCP 
    ? getLCPImage(src)
    : ImageOptimizer.optimize(src, { width, height, quality: 85 });

  useEffect(() => {
    const img = imgRef.current;
    if (!img || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.unobserve(img);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: isLCP ? "0px" : "100px" // Immediate loading for LCP
      }
    );

    observer.observe(img);

    return () => {
      if (img) {
        observer.unobserve(img);
      }
    };
  }, [shouldLoad, isLCP]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  // For LCP images, render immediately with all optimizations
  if (isLCP) {
    return (
      <picture>
        {responsiveSources.slice(0, -1).map((source, index) => (
          <source
            key={index}
            srcSet={source.srcset}
            media={source.media}
            type={source.type}
          />
        ))}
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded && !hasError ? "opacity-100" : "opacity-75"
          } ${className}`}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes={sizes}
        />
      </picture>
    );
  }

  // For other images, use intersection observer with placeholder
  return (
    <picture>
      {shouldLoad && responsiveSources.slice(0, -1).map((source, index) => (
        <source
          key={index}
          srcSet={source.srcset}
          media={source.media}
          type={source.type}
        />
      ))}
      <img
        ref={imgRef}
        src={shouldLoad ? optimizedSrc : placeholder}
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
        sizes={shouldLoad ? sizes : undefined}
      />
    </picture>
  );
};

export default ResponsiveImage;