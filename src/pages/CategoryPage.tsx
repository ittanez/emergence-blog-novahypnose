
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { articles, categories, sortOptions } from "@/lib/mock-data";
import { Article } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Find the category
  const category = categories.find(cat => cat.id === categoryId);
  
  // Filter articles by category
  const filteredArticles = articles.filter(article => article.category === categoryId);
  
  // Sort articles based on the selected option
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "az":
        return a.title.localeCompare(b.title);
      case "za":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
  
  // Handle case where category is not found
  useEffect(() => {
    if (!category) {
      navigate("/categories");
    }
  }, [category, navigate]);
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  if (!category) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-8 pb-12">
        <div className="mb-12">
          <h1 className="font-serif mb-2 text-center">{category.name}</h1>
          {category.description && (
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>
        
        {/* Sorting and results count */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-medium mb-4 sm:mb-0">
            Articles <span className="text-gray-500 font-normal">({filteredArticles.length})</span>
          </h2>
          
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
        
        {/* Articles grid */}
        {sortedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">Aucun article trouvé dans cette catégorie</h3>
            <p className="mt-2 text-gray-500">
              Revenez plus tard pour découvrir de nouveaux articles.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
