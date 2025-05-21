
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Category, SortOption, Article } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllArticles, getAllCategories } from "@/lib/services/articleService";
import ArticleCard from "@/components/ArticleCard";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Charger les articles et les catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [articlesResult, categoriesResult] = await Promise.all([
          getAllArticles(),
          getAllCategories()
        ]);
        
        if (articlesResult.data) {
          // Ne conserver que les articles publiés
          const publishedArticles = articlesResult.data.filter(article => article.published);
          setArticles(publishedArticles);
          console.log("Articles publiés chargés:", publishedArticles.length);
        }
        
        if (categoriesResult.data) {
          setCategories(categoriesResult.data);
          console.log("Catégories chargées:", categoriesResult.data.length);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filtrer les articles par catégorie
  const filteredArticles = selectedCategory 
    ? articles.filter(article => article.category === selectedCategory)
    : articles;
    
  // Trier les articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "a-z":
        return a.title.localeCompare(b.title);
      case "z-a":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
  
  // Trouver l'objet de la catégorie sélectionnée
  const selectedCategoryObj = selectedCategory
    ? categories.find(cat => cat.name === selectedCategory)
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
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name)}
                className={selectedCategory === category.name ? "brand-gradient" : ""}
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
              <h2 className="text-xl font-medium">{selectedCategoryObj.name} <span className="text-gray-500 font-normal">({sortedArticles.length} article{sortedArticles.length !== 1 ? 's' : ''})</span></h2>
            ) : (
              <h2 className="text-xl font-medium">Tous les articles <span className="text-gray-500 font-normal">({sortedArticles.length} article{sortedArticles.length !== 1 ? 's' : ''})</span></h2>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Trier par:</span>
            <Select onValueChange={handleSortChange} defaultValue={sortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="a-z">A à Z</SelectItem>
                <SelectItem value="z-a">Z à A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Articles grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Chargement des articles...</p>
          </div>
        ) : sortedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">Aucun article trouvé</h3>
            <p className="mt-2 text-gray-500">
              {selectedCategory 
                ? "Aucun article dans cette catégorie." 
                : "Aucun article n'a encore été publié."}
            </p>
          </div>
        )}
        
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
