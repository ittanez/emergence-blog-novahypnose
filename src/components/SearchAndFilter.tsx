import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchAndFilterProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  // ✅ CORRECTION : categories est un tableau de strings, pas d'objets Category
  categories: string[];
  searchValue: string;
  categoryValue: string;
  // ✅ NOUVEAU : état de chargement optionnel
  isLoading?: boolean;
}

const SearchAndFilter = ({ 
  onSearchChange, 
  onCategoryChange, 
  categories, 
  searchValue, 
  categoryValue,
  isLoading = false
}: SearchAndFilterProps) => {
  return (
    <div className="mb-8 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Rechercher un article..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="w-full md:w-64">
        <Select 
          value={categoryValue || "all"} 
          onValueChange={(value) => onCategoryChange(value === "all" ? "" : value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Chargement..." : "Toutes les catégories"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {/* ✅ CORRECTION : categoryName est une string directement */}
            {categories.map((categoryName) => (
              <SelectItem key={categoryName} value={categoryName}>
                {categoryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchAndFilter;
