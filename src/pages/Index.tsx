
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
import SimpleCard from "@/components/SimpleCard";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/services/schemaService";
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
  // Générer les données structurées pour le site
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();
  const structuredData = [websiteSchema, organizationSchema];
  
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
  

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Émergences - le blog de NovaHypnose"
        description="Blog d'Alain Zenatti, hypnothérapeute à Paris. Découvrez l'hypnose ericksonienne et la transformation intérieure pour votre bien-être."
        keywords={["hypnose", "hypnothérapie", "hypnose Paris", "Alain Zenatti", "hypnothérapeute Paris", "bien-être", "transformation", "développement personnel", "gestion du stress", "hypnose ericksonienne"]}
        structuredData={structuredData}
      />
      
      <Header />
      
      <main
        className="flex-grow container mx-auto px-4 pt-8 pb-12"
        style={{
          marginTop: '2rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* ✅ OPTIMISATION CLS : Hero section avec dimensions fixes */}
        <div className="mb-12 text-center min-h-[200px] flex flex-col justify-center">
          <h1
            className="font-serif mb-4 text-4xl md:text-5xl lg:text-6xl"
            style={{
              fontFamily: '"Playfair Display", "Times New Roman", serif',
              fontWeight: '500',
              display: 'block',
              visibility: 'visible'
            }}
          >
            Émergences
          </h1>
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
                <>
                  {/* Version desktop - cachée sur mobile */}
                  <div className="hidden md:block" key={`desktop-${article.id}`}>
                    <ArticleCard
                      article={article}
                      isFirst={currentPage === 1 && index === 0}
                      isLCP={currentPage === 1 && index === 0}
                    />
                  </div>

                  {/* Version mobile - cachée sur desktop */}
                  <div className="block md:hidden" key={`mobile-${article.id}`}>
                    <SimpleCard
                      article={article}
                    />
                  </div>
                </>
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

        {/* Application Mobile */}
        <div className="mt-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-medium mb-4">Application Mobile</h2>
              <p className="text-lg text-gray-700 mb-6">
                Prolongez les bienfaits de vos séances d'hypnothérapie avec notre application mobile gratuite dédiée aux techniques de respiration.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
              <h3 className="text-2xl font-serif font-medium mb-4 text-center text-nova-700">NovaRespire</h3>
              <p className="text-gray-700 mb-6 text-center">
                Créée par Alain Zenatti, NovaRespire est votre compagnon quotidien gratuit pour la gestion du stress et de l'anxiété. 
                Cette application vous propose une collection d'exercices de respiration guidés basés sur l'hypnothérapie.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Techniques de respiration</h4>
                  <p className="text-sm text-gray-600">Exercices guidés pour retrouver le calme instantanément</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Respiration guidée</h4>
                  <p className="text-sm text-gray-600">Techniques variées adaptées à vos besoins du moment</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Bien-être quotidien</h4>
                  <p className="text-sm text-gray-600">Outils pratiques pour gérer stress et anxiété au quotidien</p>
                </div>
              </div>
              
              <div className="text-center">
                <a
                  href="https://play.google.com/store/apps/details?id=com.novahypnose.novarespire&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-90 transition-opacity"
                >
                  <img 
                    src="https://storage.googleapis.com/pe-portal-consumer-prod-wagtail-static/images/googleplay-badge-01-getit.max-1920x1070.format-webp.webp?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=wagtail%40pe-portal-consumer-prod.iam.gserviceaccount.com%2F20250914%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20250914T124848Z&X-Goog-Expires=86400&X-Goog-SignedHeaders=host&X-Goog-Signature=0a861cf92c5de381f353012e3a2631898c8a1cfec8ad06e829356c76f498afef0d06f2abc769873f4066893f236db48cca7d253d175bfe6fdce1df6946c1038dd6a424b40945b7e9d747337b9df8c05e13f7202b598f1b3a9178919f551daedbe6484cd5c1f98a12509ca33fca0d776a6126d822147e8999060d0f0256e36c9d9c567af97e6fd47d2854e680dc7bacbe4d1740879eaa7ce0e9e54af0b7a49b209c488f4e209810fed9ff56125a6ef1b68684514b27a33a43f7a5d07261beafc41d342caac635fd6ae4285ea629a49924c66e26606a851dadf651135db3655f405ba4193050bff491172ef3aa5a3d29645a5aa5508e7a637c43a2979f596ed356"
                    alt="Disponible sur Google Play"
                    className="h-16 w-auto"
                  />
                </a>
              </div>
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
