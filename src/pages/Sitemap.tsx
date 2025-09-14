import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
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
        const [articlesResult, categoriesResult] = await Promise.all([
          getAllArticlesNoPagination(),
          getAllCategories()
        ]);
        
        setArticles(articlesResult);
        setCategories(categoriesResult);
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
                    href="https://www.inserm.fr/dossier/hypnose/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">INSERM - Dossier Hypnose</h3>
                    <p className="text-sm text-gray-600">
                      Recherche scientifique sur l'hypnose et ses applications
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
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Sitemap;