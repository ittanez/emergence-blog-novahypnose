import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Facebook, Linkedin, Link2, Share2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getArticleBySlug, getRelatedArticles } from "@/lib/services/articleService";
import { articles } from "@/lib/mock-data"; // Keep as fallback
import { Article } from "@/lib/types";

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // Use React Query to fetch the article data
  const { 
    data: articleData, 
    error: articleError,
    isLoading: articleLoading 
  } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticleBySlug(slug!),
    enabled: !!slug,
  });

  // Get the article from Supabase or use mock data as fallback
  const article = articleData?.data || articles.find(article => article.slug === slug);
  
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
    if (!articleLoading && !article) {
      navigate("/not-found");
    }
  }, [article, articleLoading, navigate]);
  
  if (articleLoading) {
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
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p>Impossible de charger l'article.</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  const formattedDate = format(new Date(article.created_at), "d MMMM yyyy", { locale: fr });
  
  // Utiliser l'auteur de l'article ou un nom par défaut
  const authorName = article.author?.name || "Alain Zenatti";
  
  // Handle social sharing
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article.title;
    
    let shareUrl = "";
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papier");
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Article header with image */}
        <div className="w-full h-[40vh] relative">
          <img
            src={article.image_url || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-full object-cover"
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
                  <span>{article.read_time} min de lecture</span>
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
                {article.tags?.map(tag => (
                  <Link to={`/tag/${tag.slug}`} key={tag.id}>
                    <Badge variant="outline" className="hover:bg-nova-50">
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
              
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
              
              <div className="mt-8 pt-8 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <div>Catégorie: <Link to={`/category/${article.category}`} className="text-nova-700 hover:underline">
                    {article.category}
                  </Link></div>
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
              <div className="bg-gray-50 border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={article.author?.avatar_url || "/placeholder.svg"}
                    alt={authorName}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{authorName}</h3>
                    <p className="text-sm text-gray-600">{article.author?.role || ""}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {article.author?.bio || ""}
                </p>
                <a 
                  href="https://novahypnose.fr/#about" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-nova-700 text-sm hover:underline"
                >
                  En savoir plus
                </a>
              </div>
              
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
                            {relatedArticle.read_time} min de lecture
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
