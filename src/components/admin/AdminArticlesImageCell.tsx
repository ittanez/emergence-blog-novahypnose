
import React from 'react';

interface AdminArticlesImageCellProps {
  imageUrl?: string;
  title: string;
}

const AdminArticlesImageCell = ({ imageUrl, title }: AdminArticlesImageCellProps) => {
  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt={title}
        className="w-10 h-10 object-cover rounded"
      />
    );
  }

  return (
    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
      <span className="text-xs text-gray-500">N/A</span>
    </div>
  );
};

export default AdminArticlesImageCell;
