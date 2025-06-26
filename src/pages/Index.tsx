
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Article } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import SEOHead from "@/components/SEOHead";
import SearchAndFilter from "@/components/SearchAndFilter";
import Pagination from "@/components/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllArticlesNoPagination, getAllCategories } from "@/lib/services/articleService";
import ArticleCard from "@/components/ArticleCard";
import { useStructuredData } from "@/hooks/useStructuredData";
import { usePreloadLCPImage } from "@/hooks/usePreloadCriticalResources";

// Configuration de la pagination
const ARTICLES_PER_PAGE = 9;

const Index = () => {
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { generateWebsiteStructuredData, generateBlogStructuredData, generateOrganizationStructuredData } = useStructuredData();
  
  // ✅ GESTION DU PARAMÈTRE CATÉGORIE DEPUIS L'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, []);
  
  // Charger les articles et les catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsLoadingCategories(true);
        
        const [articlesResult, categoriesResult] = await Promise.all([
          getAllArticlesNoPagination(),
          getAllCategories()
        ]);
        
        if (articlesResult.data && articlesResult.data.length > 0) {
          const publishedArticles = articlesResult.data.filter(article => article.published);
          setArticles(publishedArticles);
        } else {
          // Fallback vers données mock si problème Supabase
          const { articles: mockArticles } = await import("@/lib/mock-data");
          setArticles(mockArticles);
          console.log("✅ Articles mock chargés en fallback:", mockArticles.length);
        }
        
        if (categoriesResult.data) {
          const availableCategories = categoriesResult.data;
          setCategories(availableCategories);
          console.log("✅ Catégories chargées:", availableCategories.length, availableCategories);
        } else {
          console.error("❌ Erreur chargement catégories:", categoriesResult.error);
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingCategories(false);
      }
    };
    
    fetchData();
  }, []);

  // ✅ NOUVELLE FONCTION : Calculer les catégories avec nombre d'articles
  const categoriesWithCount = useMemo(() => {
    if (!articles.length) return [];
    
    const categoryCount: Record<string, number> = {};
    
    articles.forEach(article => {
      if (article.categories && Array.isArray(article.categories)) {
        article.categories.forEach(category => {
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
      }
    });
    
    return Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [articles]);

  // Filtrer et trier les articles
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles;

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(query))
      );
    }

    // Filtrage par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(article => 
        article.categories && article.categories.includes(selectedCategory)
      );
    }

    // ✅ CORRECTION : Tri par date de PUBLICATION, pas de création
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          const dateA = a.published_at ? new Date(a.published_at) : new Date(a.created_at);
          const dateB = b.published_at ? new Date(b.published_at) : new Date(a.created_at);
          return dateB.getTime() - dateA.getTime();
        case "oldest":
          const dateAOld = a.published_at ? new Date(a.published_at) : new Date(a.created_at);
          const dateBOld = b.published_at ? new Date(b.published_at) : new Date(b.created_at);
          return dateAOld.getTime() - dateBOld.getTime();
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

  // Calculer la pagination
  const totalPages = Math.ceil(filteredAndSortedArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentPageArticles = filteredAndSortedArticles.slice(startIndex, endIndex);

  // ✅ OPTIMISATION LCP : Précharger l'image du premier article
  const firstArticleImage = currentPageArticles.length > 0 && currentPage === 1 ? currentPageArticles[0].image_url : null;
  usePreloadLCPImage(firstArticleImage, currentPage === 1 && currentPageArticles.length > 0);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);
  

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  // ✅ FONCTION CATÉGORIE CORRIGÉE AVEC GESTION URL
  const handleCategoryChange = (category: string) => {
    console.log("🔄 Changement de catégorie:", category);
    setSelectedCategory(category);
    if (category) {
      const url = new URL(window.location.href);
      url.searchParams.set('category', category);
      window.history.pushState({}, '', url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('category');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Générer les données structurées pour la page d'accueil
  const websiteStructuredData = generateWebsiteStructuredData();
  const blogStructuredData = generateBlogStructuredData();
  const organizationStructuredData = generateOrganizationStructuredData();

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Émergences - le blog de NovaHypnose"
        description="Blog d'Alain Zenatti, hypnothérapeute à Paris. Découvrez l'hypnose ericksonienne et la transformation intérieure pour votre bien-être."
        keywords={["hypnose", "hypnothérapie", "hypnose Paris", "Alain Zenatti", "hypnothérapeute Paris", "bien-être", "transformation", "développement personnel", "gestion du stress", "hypnose ericksonienne"]}
        structuredData={[websiteStructuredData, blogStructuredData, organizationStructuredData]}
      />
      
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-8 pb-12">
        {/* ✅ OPTIMISATION CLS : Hero section avec dimensions fixes */}
        <div className="mb-12 text-center min-h-[200px] flex flex-col justify-center">
          <h1 className="font-serif mb-4 text-4xl md:text-5xl lg:text-6xl">Émergences</h1>
          <div className="hero-paragraph min-h-[60px] flex items-center justify-center">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Regards sur l'hypnose, la transformation intérieure et le bien-être – une exploration guidée par Alain Zenatti.
            </p>
          </div>
        </div>
        
        {/* Search and filter */}
        <SearchAndFilter
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          categories={isLoadingCategories ? [] : categoriesWithCount.map(cat => cat.name)}
          searchValue={searchQuery}
          categoryValue={selectedCategory}
          isLoading={isLoadingCategories}
        />
        
        {/* ✅ OPTIMISATION CLS : Section résultats avec hauteur minimum */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 min-h-[80px]">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-medium">
              {searchQuery || selectedCategory ? 'Résultats' : 'Tous les articles'} 
              <span className="text-gray-500 font-normal"> ({filteredAndSortedArticles.length} article{filteredAndSortedArticles.length !== 1 ? 's' : ''})</span>
            </h2>
            {selectedCategory && (
              <p className="text-sm text-blue-600 mt-1">
                Catégorie: {selectedCategory}
              </p>
            )}
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
          <div className="text-center py-12 min-h-[400px] flex items-center justify-center">
            <p className="text-xl text-gray-600">Chargement des articles...</p>
          </div>
        ) : currentPageArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPageArticles.map((article, index) => (
                <ArticleCard 
                  key={article.id} 
                  article={article}  
                  isFirst={currentPage === 1 && index === 0}
                  isLCP={currentPage === 1 && index === 0}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12 min-h-[300px] flex flex-col items-center justify-center">
            <h3 className="text-xl text-gray-600">Aucun article trouvé</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery || selectedCategory ? 
                'Essayez de modifier vos critères de recherche.' : 
                'Aucun article n\'a encore été publié.'
              }
            </p>
            {selectedCategory && (
              <button 
                onClick={() => handleCategoryChange("")}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Voir tous les articles
              </button>
            )}
          </div>
        )}
        
        {/* Pages connexes */}
        <div className="mt-16 mb-12">
          <h2 className="text-3xl font-serif mb-8 text-center">Découvrir l'hypnose ericksonienne</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md border text-center">
              <h3 className="text-xl font-medium mb-3 text-nova-700">À propos d'Alain Zenatti</h3>
              <p className="text-gray-700 text-sm mb-4">
                Découvrez le parcours et l'expertise d'Alain Zenatti, Maître Hypnologue certifié 
                en hypnose ericksonienne. Son approche bienveillante et personnalisée pour votre transformation.
              </p>
              <Link
                to="/about"
                className="inline-block bg-nova-600 text-white px-4 py-2 rounded hover:bg-nova-700 transition-colors"
              >
                En savoir plus
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border text-center">
              <h3 className="text-xl font-medium mb-3 text-nova-700">Questions fréquentes</h3>
              <p className="text-gray-700 text-sm mb-4">
                Trouvez les réponses aux questions les plus courantes sur l'hypnose thérapeutique, 
                les séances d'hypnothérapie et l'approche ericksonienne.
              </p>
              <Link
                to="/faq"
                className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Voir la FAQ
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <NewsletterForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
