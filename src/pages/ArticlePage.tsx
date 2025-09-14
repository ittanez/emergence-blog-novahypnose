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
import { Facebook, Linkedin, Link2, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/article-hypnose.css";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import RelatedArticles from "@/components/RelatedArticles";
import { toast } from "sonner";
import { getArticleBySlug, getRelatedArticles, getAllArticlesNoPagination } from "@/lib/services/articleService";
import { articles } from "@/lib/mock-data";
import { Article } from "@/lib/types";
import { useStructuredData } from "@/hooks/useStructuredData";
import { parseMarkdownToHtml } from "@/utils/markdownParser";

// ✅ FONCTION POUR OBTENIR LES ARTICLES ADJACENTS
const getAdjacentArticles = (currentArticle: Article, allArticles: Article[]) => {
  const publishedArticles = allArticles
    .filter(a => a.published)
    .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
  
  const currentIndex = publishedArticles.findIndex(a => a.id === currentArticle.id);
  
  return {
    previousArticle: currentIndex > 0 ? publishedArticles[currentIndex - 1] : null,
    nextArticle: currentIndex < publishedArticles.length - 1 ? publishedArticles[currentIndex + 1] : null
  };
};

// ✅ FONCTION DE PARSING DES TAGS ROBUSTE
const parseTagsForDisplay = (tags: any): string[] => {
  if (!tags) return [];
  
  if (Array.isArray(tags) && tags.every(tag => typeof tag === 'string')) {
    return tags;
  }
  
  if (Array.isArray(tags)) {
    return tags.map(tag => {
      if (typeof tag === 'string') return tag;
      if (tag && typeof tag === 'object' && tag.name) return tag.name;
      return null;
    }).filter(Boolean);
  }
  
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.map(tag => {
          if (typeof tag === 'string') return tag;
          if (tag && typeof tag === 'object' && tag.name) return tag.name;
          return null;
        }).filter(Boolean);
      }
    } catch (e) {
      return [tags];
    }
  }
  
  return [];
};

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { generateArticleStructuredData } = useStructuredData();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  
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
      
      if (result.redirect && typeof window !== 'undefined') {
        console.log("🔄 Redirection: " + result.redirect.from + " → " + result.redirect.to);
        
        navigate("/article/" + result.redirect.to, { replace: true });
        
        toast.info("Lien mis à jour", {
          description: "Redirection vers l'URL actualisée",
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
  
  const formattedDate = format(new Date(article.published_at || article.created_at), "d MMMM yyyy", { locale: fr });
  const formattedUpdateDate = article.updated_at !== article.created_at 
    ? format(new Date(article.updated_at), "d MMMM yyyy", { locale: fr })
    : null;
  
  // Utiliser l'auteur de l'article ou un nom par défaut
  const authorName = article.author?.name || article.author || "Alain Zenatti";
  
  // Générer les données structurées pour l'article
  const structuredData = generateArticleStructuredData(article, article.author);
  
  // ✅ PARSER LES TAGS POUR L'AFFICHAGE
  const displayTags = parseTagsForDisplay(article.tags);
  
  // ✅ FONCTION DE PARTAGE AMÉLIORÉE AVEC RÉSUMÉ ET IMAGE
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = (article.title || '').replace(/['"]/g, '');
    const description = (article.seo_description || article.excerpt || '').replace(/['"]/g, '');
    const imageUrl = article.image_url || "";
    
    let shareUrl = "";
    let shareText = "";
    
    switch (platform) {
      case "facebook":
        shareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
        break;
      case "linkedin":
        shareUrl = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url);
        break;
      case "whatsapp":
        shareText = title + "\n\n" + description + "\n\n" + url;
        shareUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(shareText);
        break;
      case "copy":
        const copyText = title + "\n" + description + "\n" + url;
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
              {/* ✅ TAGS CORRIGÉS */}
              {displayTags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {displayTags.map((tagName, index) => (
                    <Badge 
                      key={tagName + "-" + index} 
                      variant="outline" 
                      className="hover:bg-nova-50"
                    >
                      {tagName}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div 
                className="article-hypnose"
                dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(article.content) }}
              />
              
              {/* ✅ ARTICLES CONNEXES */}
              <RelatedArticles 
                currentArticleId={article.id} 
                currentArticleCategory={article.category}
                maxArticles={3}
              />
              
              {/* ✅ NAVIGATION PRÉCÉDENT/SUIVANT */}
              {(previousArticle || nextArticle) && (
                <div className="mt-12 border-t pt-8">
                  <h3 className="text-lg font-serif font-medium mb-6">Navigation entre les articles</h3>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      {previousArticle && (
                        <Link 
                          to={"/article/" + previousArticle.slug}
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
                          to={"/article/" + nextArticle.slug}
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
              
              {/* ✅ DATES ET CATÉGORIES CORRIGÉES */}
              <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {/* ✅ DATES DE CRÉATION ET MODIFICATION */}
                  <div className="mb-2">
                    <div>Publié le {formattedDate}</div>
                    {formattedUpdateDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Mis à jour le {formattedUpdateDate}
                      </div>
                    )}
                  </div>
                  
                  {/* ✅ CATÉGORIES AVEC LIENS VERS PAGE D'ACCUEIL FILTRÉE */}
                  {article.categories && article.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span>Catégories: </span>
                      {article.categories.map((category, index) => (
                        <span key={category}>
                          <Link 
                            to={"/?category=" + encodeURIComponent(category)} 
                            className="text-nova-700 hover:underline"
                            title={"Voir tous les articles de la catégorie " + category}
                          >
                            {category}
                          </Link>
                          {index < article.categories.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  )}
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
                          to={"/article/" + relatedArticle.slug}
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
