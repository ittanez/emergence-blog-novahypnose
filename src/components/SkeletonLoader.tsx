import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const SkeletonLoader = ({ 
  className = '', 
  variant = 'rectangular',
  width = '100%',
  height = 'auto',
  lines = 1
}: SkeletonLoaderProps) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 mb-2';
      case 'circular':
        return 'rounded-full';
      case 'card':
        return 'h-48';
      default:
        return '';
    }
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={{ height: '16px' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={style}
    />
  );
};

export const ArticleCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
    <SkeletonLoader variant="rectangular" height={180} />
    <div className="p-6">
      <div className="flex gap-2 mb-3">
        <SkeletonLoader width={60} height={20} className="rounded-full" />
        <SkeletonLoader width={80} height={20} className="rounded-full" />
      </div>
      <SkeletonLoader variant="text" lines={2} className="mb-3" />
      <SkeletonLoader variant="text" lines={3} className="mb-4" />
      <div className="flex justify-between">
        <SkeletonLoader width={100} height={16} />
        <SkeletonLoader width={120} height={16} />
      </div>
    </div>
  </div>
);

export const ArticlePageSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
    <SkeletonLoader variant="text" lines={2} className="mb-4" />
    <div className="flex gap-4 mb-6">
      <SkeletonLoader width={80} height={20} className="rounded-full" />
      <SkeletonLoader width={100} height={20} className="rounded-full" />
    </div>
    <SkeletonLoader variant="rectangular" height={300} className="mb-8" />
    <div className="space-y-4">
      <SkeletonLoader variant="text" lines={4} />
      <SkeletonLoader variant="text" lines={3} />
      <SkeletonLoader variant="text" lines={5} />
    </div>
  </div>
);

export default SkeletonLoader;