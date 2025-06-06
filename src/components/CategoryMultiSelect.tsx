 import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '@/lib/services/articleService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CategoryMultiSelectProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  selectedCategories,
  onChange,
}) => {
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });

  const categories = categoriesData?.data || [];

  const handleAddCategory = (categoryName: string) => {
    if (!selectedCategories.includes(categoryName)) {
      onChange([...selectedCategories, categoryName]);
    }
  };

  const handleRemoveCategory = (categoryName: string) => {
    onChange(selectedCategories.filter(cat => cat !== categoryName));
  };

  // ✅ CORRECTION : categories est un tableau de strings, pas d'objets
  const availableCategories = categories.filter(
    categoryName => !selectedCategories.includes(categoryName)
  );

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement des catégories...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Erreur lors du chargement des catégories</div>;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Catégories</label>
      
      {/* Selected categories */}
      <div className="flex flex-wrap gap-2">
        {selectedCategories.map(category => (
          <Badge key={category} variant="secondary" className="flex items-center gap-1">
            {category}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => handleRemoveCategory(category)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {/* Add category dropdown */}
      {availableCategories.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              Ajouter une catégorie
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {availableCategories.map(categoryName => (
              <DropdownMenuItem
                key={categoryName}
                onClick={() => handleAddCategory(categoryName)}
              >
                {categoryName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default CategoryMultiSelect;
