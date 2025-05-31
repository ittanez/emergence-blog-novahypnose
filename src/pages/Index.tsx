
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Category, Article } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import SEOHead from "@/components/SEOHead";
import SearchAndFilter from "@/components/SearchAndFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllArticles, getAllCategories } from "@/lib/services/articleService";
import ArticleCard from "@/components/ArticleCard";
import { useStructuredData } from "@/hooks/useStructuredData";

const Index = () => {
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { generateWebsiteStructuredData, generateBlogStructuredData } = useStructuredData();
  
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

  // Filtrer et trier les articles
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles;

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query)
      );
    }

    // Filtrage par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(article => 
        article.categories && article.categories.includes(selectedCategory)
      );
    }

    // Tri
    const sorted = [...filtered].sort((a, b) => {
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

    return sorted;
  }, [articles, searchQuery, selectedCategory, sortBy]);
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
 // ✅ AJOUTEZ ce useEffect pour précharger l'image du premier article
  useEffect(() => {
    if (filteredAndSortedArticles.length > 0) {
      const firstArticle = filteredAndSortedArticles[0];
      if (firstArticle.image_url) {
        // Créer un élément link pour précharger l'image
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = firstArticle.image_url;
        link.fetchPriority = 'high';
        
        // Ajouter au head
        document.head.appendChild(link);
        
        // Nettoyer au démontage du composant
        return () => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        };
      }
    }
  }, [filteredAndSortedArticles]);

  // ... reste de votre code
  
  return (
    //
  );
};

  
  // Générer les données structurées pour la page d'accueil
  const websiteStructuredData = generateWebsiteStructuredData();
  const blogStructuredData = generateBlogStructuredData();

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Émergences - le blog de NovaHypnose"
        description="Regards sur l'hypnose, la transformation intérieure et le bien-être. Découvrez nos articles sur l'hypnothérapie, la gestion du stress et le développement personnel."
        keywords={["hypnose", "hypnothérapie", "bien-être", "transformation", "développement personnel", "gestion du stress"]}
        structuredData={[websiteStructuredData, blogStructuredData]}
      />
      
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-8 pb-12">
        <div className="mb-12 text-center">
          <h1 className="font-serif mb-4">Émergences</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Regards sur l'hypnose, la transformation intérieure et le bien-être
          </p>
        </div>
        
        {/* Search and filter */}
        <SearchAndFilter
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          searchValue={searchQuery}
          categoryValue={selectedCategory}
        />
        
        {/* Sorting and results count */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-medium">
              {searchQuery || selectedCategory ? 'Résultats' : 'Tous les articles'} 
              <span className="text-gray-500 font-normal"> ({filteredAndSortedArticles.length} article{filteredAndSortedArticles.length !== 1 ? 's' : ''})</span>
            </h2>
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
        ) : filteredAndSortedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredAndSortedArticles.map((article, index) => (
  <ArticleCard 
    key={article.id} 
    article={article}  
    isFirst={index === 0}  // ✅ Premier article = true
  />
))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">Aucun article trouvé</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery || selectedCategory ? 
                'Essayez de modifier vos critères de recherche.' : 
                'Aucun article n\'a encore été publié.'
              }
            </p>
          </div>
        )}
        
        {/* Newsletter avec notification activée */}
        <div className="mt-16 max-w-2xl mx-auto">
          <NewsletterForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
