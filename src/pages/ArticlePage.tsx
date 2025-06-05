 import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import SEOHead from "@/components/SEOHead";
import OptimizedImage from "@/components/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Facebook, Linkedin, Link2, Share2, ChevronLeft, ChevronRight } from "lucide-react"; // ✅ AJOUTÉ
import "../styles/article-hypnose.css";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getArticleBySlug, getRelatedArticles, getAllArticlesNoPagination } from "@/lib/services/articleService"; // ✅ AJOUTÉ
import { articles } from "@/lib/mock-data";
import { Article } from "@/lib/types";
import { useStructuredData } from "@/hooks/useStructuredData";

// ✅ FONCTION POUR OBTENIR LES ARTICLES ADJACENTS
const getAdjacentArticles = (currentArticle: Article, allArticles: Article[]) => {
  const publishedArticles = allArticles
    .filter(a => a.published)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const currentIndex = publishedArticles.findIndex(a => a.id === currentArticle.id);
  
  return {
    previousArticle: currentIndex > 0 ? publishedArticles[currentIndex - 1] : null,
    nextArticle: currentIndex < publishedArticles.length - 1 ? publishedArticles[currentIndex + 1] : null
  };
};

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { generateArticleStructuredData } = useStructuredData();
  const [allArticles, setAllArticles] = useState<Article[]>([]); // ✅ AJOUTÉ
  
  // Logs détaillés pour le debugging
  console.log("=== ArticlePage Component Loading ===");
  console.log("URL slug from params:", slug);
  console.log("Current URL:", window.location.href);
  console.log("Current pathname:", window.location.pathname);
  
  // ✅ CHARGEMENT DE TOUS LES ARTICLES POUR LA NAVIGATION
  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        const result = await getAllArticlesNoPagination();
        if (result.data) {
          setAllArticles(result.data.filter(a => a.published));
        } else {
          // Fallback sur les données mock
          setAllArticles(articles.filter(a => a.published));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des articles:", error);
        setAllArticles(articles.filter(a => a.published));
      }
    };
    
    fetchAllArticles();
  }, []);
  
  // Use React Query to fetch the article data
  const { 
    data: articleResult, 
    error: articleError,
    isLoading: articleLoading 
  } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      console.log("🔍 Chargement article:", slug);
      const result = await getArticleBySlug(slug!);
      
      // Gérer la redirection côté client
      if (result.redirect && typeof window !== 'undefined') {
        console.log(`🔄 Redirection: ${result.redirect.from} → ${result.redirect.to}`);
        
        // Mettre à jour l'URL sans créer d'entrée dans l'historique
        navigate(`/article/${result.redirect.to}`, { replace: true });
        
        // Optionnel: Toast informatif
        toast.info("Lien mis à jour", {
          description: `Redirection vers l'URL actualisée`,
          duration: 3000
        });
      }
      
      return result;
    },
    enabled: !!slug,
  });

  // Get the article from Supabase or use mock data as fallback
  const article = articleResult?.data || articles.find(article => {
    console.log("Checking mock article slug:", article.slug, "against URL slug:", slug);
    return article.slug === slug;
  });
  
  console.log("Final article found:", article ? article.title : "NO ARTICLE FOUND");
  console.log("Article error:", articleError);
  
  // ✅ OBTENIR LES ARTICLES PRÉCÉDENT ET SUIVANT
  const { previousArticle, nextArticle } = article ? getAdjacentArticles(article, allArticles) : { previousArticle: null, nextArticle: null };
  
  // Use React Query to fetch related articles
  const { 
    data: relatedData,
    error: relatedError,
    isLoading: relatedLoading 
  } = useQuery({
    queryKey: ['relatedArticles', article?.id],
    queryFn: () => getRelatedArticles(article!.id, 3),
    enabled: !!article?.id,
  });

  // Get related articles from Supabase or use mock data as fallback
  const relatedArticles = relatedData?.data || 
    articles.filter(a => a.id !== article?.id).slice(0, 3);
  
  // Handle case where article is not found
  useEffect(() => {
    console.log("=== useEffect for article check ===");
    console.log("articleLoading:", articleLoading);
    console.log("article exists:", !!article);
    console.log("articleError:", articleError);
    
    if (!articleLoading && !article) {
      console.log("Article not found, redirecting to home page");
      toast.error("Article non trouvé", {
        description: "L'article que vous recherchez n'existe pas ou a été supprimé."
      });
      navigate("/");
    }
  }, [article, articleLoading, navigate, articleError]);
  
  if (articleLoading) {
    console.log("Showing loading state");
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p>Chargement de l'article...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (articleError || !article) {
    console.log("Showing error state");
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-gray-600 mb-4">
              L'article que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Link to="/" className="text-nova-700 hover:underline">
              Retour à l'accueil
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  console.log("Rendering article successfully:", article.title);
  
  const formattedDate = format(new Date(article.created_at), "d MMMM yyyy", { locale: fr });
  
  // Utiliser l'auteur de l'article ou un nom par défaut
  const authorName = article.author?.name || article.author || "Alain Zenatti";
  
  // Générer les données structurées pour l'article
  const structuredData = generateArticleStructuredData(article, article.author);
  
  // ✅ FONCTION DE PARTAGE AMÉLIORÉE AVEC RÉSUMÉ ET IMAGE
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article.title;
    const description = article.seo_description || article.excerpt || "";
    const imageUrl = article.image_url || "";
    
    let shareUrl = "";
    let shareText = "";
    
    switch (platform) {
      case "facebook":
        // Facebook utilise automatiquement les meta tags Open Graph
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        // LinkedIn utilise aussi les meta tags automatiquement
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareText = `${title}\n\n${description}\n\n${url}`;
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        break;
      case "copy":
        // Copier le lien avec le titre et la description
        const copyText = `${title}\n${description}\n${url}`;
        navigator.clipboard.writeText(copyText);
        toast.success("Lien copié dans le presse-papier", {
          description: "Le titre, la description et le lien ont été copiés"
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={article.title}
        description={article.seo_description || article.excerpt}
        image={article.image_url}
        type="article"
        publishedTime={article.created_at}
        modifiedTime={article.updated_at}
        author={authorName}
        keywords={Array.isArray(article.keywords) ? article.keywords : []}
        structuredData={structuredData}
      />
      
      <Header />
      
      <main className="flex-grow">
        {/* Article header with image */}
        <div className="w-full h-[40vh] relative">
          <OptimizedImage
            src={article.image_url || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            isHero={true}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
            <div className="container mx-auto px-4 pb-8 text-white">
              <div className="max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-serif mb-4">{article.title}</h1>
                <div className="flex flex-wrap items-center text-sm">
                  <span>{authorName}</span>
                  <span className="mx-2">•</span>
                  <span>{formattedDate}</span>
                  <span className="mx-2">•</span>
                  <span>{article.read_time || 5} min de lecture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Article content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="mb-4 flex flex-wrap gap-2">
                {article.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" className="hover:bg-nova-50">
                    {typeof tag === 'string' ? tag : tag.name}
                  </Badge>
                ))}
              </div>
              
              <div 
                className="article-hypnose"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
              
              {/* ✅ NAVIGATION PRÉCÉDENT/SUIVANT */}
              {(previousArticle || nextArticle) && (
                <div className="mt-12 border-t pt-8">
                  <h3 className="text-lg font-serif font-medium mb-6">Navigation entre les articles</h3>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      {previousArticle && (
                        <Link 
                          to={`/article/${previousArticle.slug}`}
                          className="group flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5 text-nova-600" />
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Article précédent</div>
                            <div className="font-medium group-hover:text-nova-700 transition-colors line-clamp-2">
                              {previousArticle.title}
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                    
                    <div className="mx-4">
                      <Link 
                        to="/" 
                        className="text-sm text-gray-500 hover:text-nova-700 transition-colors"
                      >
                        Tous les articles
                      </Link>
                    </div>
                    
                    <div className="flex-1 flex justify-end">
                      {nextArticle && (
                        <Link 
                          to={`/article/${nextArticle.slug}`}
                          className="group flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors text-right"
                        >
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Article suivant</div>
                            <div className="font-medium group-hover:text-nova-700 transition-colors line-clamp-2">
                              {nextArticle.title}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-nova-600" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-8 pt-8 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {article.categories && article.categories.length > 0 ? (
                      <>
                        <span>Catégories: </span>
                        {article.categories.map((category, index) => (
                          <span key={category}>
                            <Link to={`/category/${category}`} className="text-nova-700 hover:underline">
                              {category}
                            </Link>
                            {index < article.categories.length - 1 && ", "}
                          </span>
                        ))}
                      </>
                    ) : null}
                  </div>
                  <div>Publié le {formattedDate}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Partager:</span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleShare("facebook")}
                    aria-label="Partager sur Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleShare("linkedin")}
                    aria-label="Partager sur LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="Plus d'options de partage">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare("copy")}>
                        <Link2 className="mr-2 h-4 w-4" />
                        <span>Copier le lien</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            
            <aside className="lg:w-1/3 space-y-8">
              <NewsletterForm />
              
              <div className="bg-gray-50 border rounded-lg p-6">
                <h3 className="text-lg font-serif font-medium mb-4">Articles recommandés</h3>
                {relatedLoading ? (
                  <p>Chargement des articles recommandés...</p>
                ) : (
                  <ul className="space-y-4">
                    {relatedArticles.map(relatedArticle => (
                      <li key={relatedArticle.id} className="border-b pb-4 last:border-0">
                        <Link 
                          to={`/article/${relatedArticle.slug}`}
                          className="block group"
                        >
                          <h4 className="font-medium group-hover:text-nova-700 transition-colors">
                            {relatedArticle.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {relatedArticle.read_time || 5} min de lecture
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArticlePage;
