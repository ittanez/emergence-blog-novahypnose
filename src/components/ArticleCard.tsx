
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Article } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OptimizedImage from "@/components/OptimizedImage";
import LazyLoadWrapper from "@/components/LazyLoadWrapper";

interface ArticleCardProps {
  article: Article;
  isFirst?: boolean;
  isLCP?: boolean; // Nouveau prop pour identifier l'image LCP
}

const ArticleCard = ({ article, isFirst = false, isLCP = false }: ArticleCardProps) => {
  const formattedDate = format(new Date(article.published_at || article.created_at), "d MMMM yyyy", {
    locale: fr
  });

  // ✅ FONCTION DE PARSING DES TAGS TRÈS ROBUSTE
  const parseTagsForDisplay = (tags: any): string[] => {
    if (!tags) return [];
    
    // Si c'est déjà un array de strings, le retourner
    if (Array.isArray(tags) && tags.every(tag => typeof tag === 'string')) {
      return tags;
    }
    
    // Si c'est un array d'objets avec .name
    if (Array.isArray(tags)) {
      return tags.map(tag => {
        if (typeof tag === 'string') return tag;
        if (tag && typeof tag === 'object' && tag.name) return tag.name;
        return null;
      }).filter(Boolean);
    }
    
    // Si c'est une string qui ressemble à du JSON
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
        // Si ce n'est pas du JSON valide, traiter comme une string simple
        return [tags];
      }
    }
    
    return [];
  };

  const getReadTime = () => {
    if (article.read_time && article.read_time > 1) {
      return article.read_time;
    }
    
    if (article.content) {
      const plainText = article.content.replace(/<[^>]*>/g, '');
      const wordCount = plainText.trim().split(/\s+/).length;
      const calculatedTime = Math.max(1, Math.ceil(wordCount / 200));
      return calculatedTime;
    }
    
    return article.read_time || 1;
  };

  const readTime = getReadTime();
  const displayTags = parseTagsForDisplay(article.tags);

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <Link to={`/article/${article.slug}`} className="block">
        {/* ✅ OPTIMISATION CLS : Container avec aspect-ratio fixe */}
        <div className="aspect-video overflow-hidden relative bg-gray-100">
          {isFirst || isLCP ? (
            <OptimizedImage
              src={article.image_url || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              width={400}
              height={225}
              loading="eager"
              fetchPriority="high"
              isLCP={isLCP}
            />
          ) : (
            <LazyLoadWrapper
              fallback={
                <div className="w-full h-full bg-gray-200 flex items-center justify-center absolute inset-0">
                  <div className="text-gray-400 text-sm">Chargement...</div>
                </div>
              }
            >
              <OptimizedImage
                src={article.image_url || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={400}
                height={225}
                loading="lazy"
                fetchPriority="auto"
              />
            </LazyLoadWrapper>
          )}
        </div>
        
        {/* ✅ OPTIMISATION CLS : Contenu avec hauteur minimum fixe */}
        <CardContent className="p-6 min-h-[160px] flex flex-col">
          {/* ✅ TAGS CORRIGÉS - Hauteur fixe pour éviter CLS */}
          <div className="min-h-[32px] mb-3">
            {displayTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {displayTags.slice(0, 3).map((tagName, index) => (
                  <Badge 
                    key={`${tagName}-${index}`}
                    variant="secondary" 
                    className="text-xs hover:bg-nova-50 transition-colors"
                  >
                    {tagName}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-serif font-medium mb-3 group-hover:text-nova-700 transition-colors line-clamp-2 flex-grow">
            {article.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
            <span>{formattedDate}</span>
            <span>{readTime} min de lecture</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ArticleCard;
