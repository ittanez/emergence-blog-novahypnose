
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface AdminSearchFiltersProps {
  categories: Array<{ name: string }>;
  onFiltersChange: (filters: { search: string; category: string }) => void;
  initialFilters?: { search: string; category: string };
}

const AdminSearchFilters = ({ 
  categories, 
  onFiltersChange, 
  initialFilters = { search: '', category: '' }
}: AdminSearchFiltersProps) => {
  const [search, setSearch] = useState(initialFilters.search);
  const [category, setCategory] = useState(initialFilters.category);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({ search: value, category });
  };

  const handleCategoryChange = (value: string) => {
    const newCategory = value === 'all' ? '' : value;
    setCategory(newCategory);
    onFiltersChange({ search, category: newCategory });
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    onFiltersChange({ search: '', category: '' });
  };

  const hasFilters = search || category;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Rechercher par titre..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={category || 'all'} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filtrer par catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les catégories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.name} value={cat.name}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="flex items-center gap-2"
        >
          <X size={16} />
          Effacer
        </Button>
      )}
    </div>
  );
};

export default AdminSearchFilters;
