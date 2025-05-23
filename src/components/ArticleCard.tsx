
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const formattedDate = formatDistanceToNow(new Date(article.created_at), {
    addSuffix: true,
    locale: fr
  });
  
  // Utiliser l'auteur de l'article ou un nom par défaut
  const authorName = article.author?.name || "Alain Zenatti";
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <Link to={`/article/${article.slug}`}>
          <div className="aspect-video overflow-hidden">
            <img
              src={article.image_url || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow pt-6">
        <div className="flex flex-wrap gap-2 mb-2">
          {article.tags?.slice(0, 3).map(tag => (
            <Badge key={tag.id} variant="outline" className="hover:bg-nova-50">
              {tag.name}
            </Badge>
          ))}
        </div>
        <Link to={`/article/${article.slug}`} className="group">
          <h3 className="text-xl font-serif font-medium mb-2 group-hover:text-nova-700 transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-3">{article.excerpt}</p>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 pt-0 pb-4">
        <div className="flex items-center justify-between w-full">
          <span>{authorName}</span>
          <div className="flex items-center">
            <span>{formattedDate}</span>
            <span className="mx-2">•</span>
            <span>{article.read_time} min de lecture</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ArticleCard;
