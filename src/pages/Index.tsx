 import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Category, Article } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import SEOHead from "@/components/SEOHead";
import SearchAndFilter from "@/components/SearchAndFilter";
import Pagination from "@/components/Pagination"; // ✅ Import ajouté
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllArticles, getAllCategories } from "@/lib/services/articleService";
import ArticleCard from "@/components/ArticleCard";
import { useStructuredData } from "@/hooks/useStructuredData";

// ✅ Configuration de la pagination
const ARTICLES_PER_PAGE = 9; // Nombre maximum d'articles par page

const Index = () => {
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1); // ✅ État pour la page actuelle
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
          // 🔍 DEBUG : Affichons tous les articles avant filtrage
          console.log("=== TOUS LES ARTICLES CHARGÉS ===");
          console.log("Total articles dans la DB:", articlesResult.data.length);
          
          articlesResult.data.forEach((article, index) => {
            console.log(`Article ${index + 1}: "${article.title}" - published: ${article.published}`);
          });
          
          // Ne conserver que les articles publiés
          const publishedArticles = articlesResult.data.filter(article => article.published);
          
          // 🔍 DEBUG : Affichons les articles publiés
          console.log("\n=== ARTICLES PUBLIÉS FILTRÉS ===");
          console.log("Nombre d'articles publiés:", publishedArticles.length);
          
          publishedArticles.forEach((article, index) => {
            console.log(`Publié ${index + 1}: "${article.title}"`);
          });
          
          setArticles(publishedArticles);
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

  // ✅ Calculer la pagination
  const totalPages = Math.ceil(filteredAndSortedArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentPageArticles = filteredAndSortedArticles.slice(startIndex, endIndex);

  // 🔍 DEBUG : Ajoutez ceci pour surveiller la pagination
  useEffect(() => {
    console.log("\n=== DEBUG PAGINATION ===");
    console.log("Total articles state:", articles.length);
    console.log("Articles après filtres:", filteredAndSortedArticles.length);
    console.log("Page actuelle:", currentPage);
    console.log("Articles par page:", ARTICLES_PER_PAGE);
    console.log("Total pages calculé:", totalPages);
    console.log("Start index:", startIndex);
    console.log("End index:", endIndex);
    console.log("Articles affichés sur cette page:", currentPageArticles.length);
    
    console.log("\nTitres des articles affichés:");
    currentPageArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
    });
  }, [articles, filteredAndSortedArticles, currentPage, currentPageArticles, totalPages, startIndex, endIndex]);

  // ✅ Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);
  
  // ✅ Précharger l'image du premier article de la page actuelle
  useEffect(() => {
    if (currentPageArticles.length > 0) {
      const firstArticle = currentPageArticles[0];
      if (firstArticle.image_url) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = firstArticle.image_url;
        link.fetchPriority = 'high';
        
        document.head.appendChild(link);
        
        return () => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        };
      }
    }
  }, [currentPageArticles]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // ✅ Gestionnaire pour le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Faire défiler vers le haut quand on change de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            {/* ✅ Afficher les informations de pagination */}
            {filteredAndSortedArticles.length > ARTICLES_PER_PAGE && (
              <p className="text-sm text-gray-500 mt-1">
                Page {currentPage} sur {totalPages} • 
                Affichage de {startIndex + 1} à {Math.min(endIndex, filteredAndSortedArticles.length)} sur {filteredAndSortedArticles.length}
              </p>
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
        ) : currentPageArticles.length > 0 ? (
          <>
            {/* ✅ Grille des articles de la page actuelle */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPageArticles.map((article, index) => (
                <ArticleCard 
                  key={article.id} 
                  article={article}  
                  isFirst={currentPage === 1 && index === 0} // ✅ Premier article seulement sur la première page
                />
              ))}
            </div>
            
            {/* ✅ Composant de pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
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
