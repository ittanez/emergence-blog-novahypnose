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
          <div className="mb-3">
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags.slice(0, 2).map(tag => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-serif font-medium mb-3 group-hover:text-nova-700 transition-colors line-clamp-2">
            {article.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formattedDate}</span>
            <span>{article.read_time} min de lecture</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ArticleCard;
