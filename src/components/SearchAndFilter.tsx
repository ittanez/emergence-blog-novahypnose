
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/lib/types";

interface SearchAndFilterProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  categories: Category[];
  searchValue: string;
  categoryValue: string;
}

const SearchAndFilter = ({ 
  onSearchChange, 
  onCategoryChange, 
  categories, 
  searchValue, 
  categoryValue 
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
        <Select value={categoryValue || "all"} onValueChange={(value) => onCategoryChange(value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchAndFilter;
