
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AdminArticlesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const AdminArticlesFilters = ({ 
  searchQuery, 
  onSearchChange 
}: AdminArticlesFiltersProps) => {
  return (
    <div className="mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher par titre ou catégorie..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default AdminArticlesFilters;
