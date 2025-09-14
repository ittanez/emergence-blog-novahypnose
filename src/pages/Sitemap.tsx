import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { BreadcrumbsWithSchema, generatePageBreadcrumbs } from "@/components/Breadcrumbs";
import { Article } from "@/lib/types";
import { getAllArticlesNoPagination, getAllCategories } from "@/lib/services/articleService";

const Sitemap = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Timeout pour éviter le blocage infini
        const timeout = setTimeout(() => {
          console.warn('API timeout, showing static content');
          setIsLoading(false);
        }, 3000);

        const [articlesResult, categoriesResult] = await Promise.all([
          getAllArticlesNoPagination(),
          getAllCategories()
        ]);
        
        clearTimeout(timeout);
        
        // Vérifier et extraire les données correctement
        if (articlesResult?.data) {
          const publishedArticles = articlesResult.data.filter(article => article.published);
          setArticles(publishedArticles);
        } else if (articlesResult) {
          const publishedArticles = Array.isArray(articlesResult) 
            ? articlesResult.filter(article => article.published)
            : [];
          setArticles(publishedArticles);
        }
        
        if (categoriesResult?.data) {
          setCategories(categoriesResult.data);
        } else if (categoriesResult) {
          setCategories(categoriesResult);
        }
        
      } catch (error) {
        console.error('Error fetching sitemap data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group articles by category
  const articlesByCategory = articles.reduce((acc, article) => {
    const category = article.category || 'Non classé';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  // Générer les breadcrumbs
  const breadcrumbs = generatePageBreadcrumbs("Plan du Site");

  return (
    <>
      <SEOHead
        title="Plan du Site"
        description="Plan du site Émergences - Trouvez facilement tous nos articles sur l'hypnose, la transformation intérieure et le bien-être."
        keywords={['plan du site', 'sitemap', 'navigation', 'articles hypnose', 'NovaHypnose']}
      />
      
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <BreadcrumbsWithSchema 
            items={breadcrumbs} 
            generateSchema={true}
            siteUrl="https://emergences.novahypnose.fr"
            className="mb-8"
          />
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif mb-4">
              Plan du Site
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Naviguez facilement dans tout le contenu du blog Émergences et découvrez 
              nos articles sur l'hypnose et la transformation intérieure.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-8">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Pages principales */}
              <section>
                <h2 className="text-2xl font-serif font-medium mb-6 border-b border-gray-200 pb-2">
                  Pages principales
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link 
                    to="/" 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">Accueil</h3>
                    <p className="text-sm text-gray-600">
                      Découvrez tous nos derniers articles sur l'hypnose et le bien-être
                    </p>
                  </Link>
                  
                  <Link 
                    to="/about" 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">À propos</h3>
                    <p className="text-sm text-gray-600">
                      Apprenez-en plus sur Alain Zenatti et son approche de l'hypnothérapie
                    </p>
                  </Link>
                  
                  <Link 
                    to="/faq" 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">FAQ</h3>
                    <p className="text-sm text-gray-600">
                      Réponses aux questions fréquentes sur l'hypnose et les séances
                    </p>
                  </Link>

                  <a 
                    href="https://novahypnose.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">NovaHypnose</h3>
                    <p className="text-sm text-gray-600">
                      Site principal avec les services d'hypnothérapie
                    </p>
                  </a>
                </div>
              </section>

              {/* Articles par catégorie */}
              <section>
                <h2 className="text-2xl font-serif font-medium mb-6 border-b border-gray-200 pb-2">
                  Articles par catégorie ({articles.length} articles)
                </h2>
                
                <div className="space-y-8">
                  {Object.entries(articlesByCategory).map(([category, categoryArticles]) => (
                    <div key={category} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-xl font-medium text-gray-900 mb-4">
                        {category} ({categoryArticles.length})
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {categoryArticles.map((article) => (
                          <Link
                            key={article.id}
                            to={`/article/${article.slug}`}
                            className="block p-3 bg-white rounded border hover:shadow-sm transition-all"
                          >
                            <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                              {article.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {article.excerpt}
                            </p>
                            <time className="text-xs text-gray-500">
                              {new Date(article.created_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </time>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Liens externes utiles */}
              <section>
                <h2 className="text-2xl font-serif font-medium mb-6 border-b border-gray-200 pb-2">
                  Ressources externes
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <a 
                    href="https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">Prendre rendez-vous</h3>
                    <p className="text-sm text-gray-600">
                      Réservez votre séance d'hypnothérapie avec Alain Zenatti
                    </p>
                  </a>

                  <a 
                    href="https://peur-de-parler-en-public.novahypnose.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">Peur de parler en public</h3>
                    <p className="text-sm text-gray-600">
                      Programme spécialisé pour surmonter la glossophobie
                    </p>
                  </a>

                  <a 
                    href="https://fr.wikipedia.org/wiki/Hypnothérapie" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">Hypnothérapie - Wikipédia</h3>
                    <p className="text-sm text-gray-600">
                      Informations encyclopédiques sur l'hypnose et ses applications
                    </p>
                  </a>

                  <a 
                    href="https://www.cfhtb.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">CFHTB</h3>
                    <p className="text-sm text-gray-600">
                      Confédération Francophone d'Hypnose et Thérapies Brèves
                    </p>
                  </a>
                </div>
              </section>

              {/* Application Mobile */}
              <section className="mt-16">
                <h2 className="text-2xl font-serif font-medium mb-6 border-b border-gray-200 pb-2">
                  Application Mobile
                </h2>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
                  <p className="text-lg text-gray-700 mb-6 text-center">
                    Prolongez les bienfaits de vos séances d'hypnothérapie avec notre application mobile gratuite dédiée aux techniques de respiration.
                  </p>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm">
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
                        className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                        </svg>
                        <span>Disponible sur Google Play</span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Sitemap;