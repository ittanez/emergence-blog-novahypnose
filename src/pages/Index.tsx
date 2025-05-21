
import { useState } from "react";
import { Link } from "react-router-dom";
import { categories, sortOptions } from "@/lib/mock-data";
import { Category, SortOption } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Articles vides pour la démo
  const articles = [];
  
  // Find the selected category object
  const selectedCategoryObj = selectedCategory
    ? categories.find(cat => cat.id === selectedCategory)
    : null;
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-8 pb-12">
        <div className="mb-12 text-center">
          <h1 className="font-serif mb-4">Émergences</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Regards sur l'hypnose, la transformation intérieure et le bien-être
          </p>
        </div>
        
        {/* Category selection */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "brand-gradient" : ""}
            >
              Tous les articles
            </Button>
            
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "brand-gradient" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Sorting and results count */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="mb-4 sm:mb-0">
            {selectedCategoryObj ? (
              <h2 className="text-xl font-medium">{selectedCategoryObj.name} <span className="text-gray-500 font-normal">(0 articles)</span></h2>
            ) : (
              <h2 className="text-xl font-medium">Tous les articles <span className="text-gray-500 font-normal">(0 articles)</span></h2>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Trier par:</span>
            <Select onValueChange={handleSortChange} defaultValue={sortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Articles grid - Empty */}
        <div className="text-center py-12">
          <h3 className="text-xl text-gray-600">Aucun article trouvé</h3>
          <p className="mt-2 text-gray-500">
            Aucun article n'a encore été publié.
          </p>
        </div>
        
        {/* Newsletter */}
        <div className="mt-16 max-w-2xl mx-auto">
          <NewsletterForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
