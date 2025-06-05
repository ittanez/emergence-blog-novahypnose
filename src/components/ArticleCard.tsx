 import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Article } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OptimizedImage from "@/components/OptimizedImage";

interface ArticleCardProps {
  article: Article;
  isFirst?: boolean;  // ✅ Nouveau prop pour optimiser le premier article
}

const ArticleCard = ({ article, isFirst = false }: ArticleCardProps) => {
  const formattedDate = formatDistanceToNow(new Date(article.created_at), {
    addSuffix: true,
    locale: fr
  });

  // ✅ FONCTION CORRIGÉE : Calculer le temps de lecture correct
  const getReadTime = () => {
    // Si read_time existe et semble correct (plus de 1 minute pour un long contenu)
    if (article.read_time && article.read_time > 1) {
      return article.read_time;
    }
    
    // Sinon, calculer à partir du contenu
    if (article.content) {
      // Supprimer le HTML et compter les mots
      const plainText = article.content.replace(/<[^>]*>/g, '');
      const wordCount = plainText.trim().split(/\s+/).length;
      
      // Calcul : 200 mots par minute (vitesse de lecture moyenne)
      const calculatedTime = Math.max(1, Math.ceil(wordCount / 200));
      
      // Debug pour voir le calcul
      console.log(`Article "${article.title}": ${wordCount} mots → ${calculatedTime} min`);
      
      return calculatedTime;
    }
    
    // Fallback si pas de contenu
    return article.read_time || 1;
  };

  const readTime = getReadTime();

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <Link to={`/article/${article.slug}`} className="block">
        <div className="aspect-video overflow-hidden">
          <OptimizedImage
            src={article.image_url || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading={isFirst ? "eager" : "lazy"}        // ✅ Premier article = eager
            fetchPriority={isFirst ? "high" : "auto"}   // ✅ Premier article = high priority
          />
        </div>
        
        <CardContent className="p-6">
          {/* ✅ TAGS RESTAURÉS - Affichage des tags en premier */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={typeof tag === 'string' ? tag : tag.id || index} 
                  variant="secondary" 
                  className="text-xs hover:bg-nova-50 transition-colors"
                >
                  {typeof tag === 'string' ? tag : tag.name}
                </Badge>
              ))}
            </div>
          )}
          
          <h3 className="text-xl font-serif font-medium mb-3 group-hover:text-nova-700 transition-colors line-clamp-2">
            {article.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formattedDate}</span>
            {/* ✅ CORRIGÉ : Utiliser le temps calculé */}
            <span>{readTime} min de lecture</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ArticleCard;
