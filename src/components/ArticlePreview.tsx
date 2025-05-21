
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Article } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface ArticlePreviewProps {
  article: Partial<Article>;
  open: boolean;
  onClose: () => void;
}

const ArticlePreview = ({ article, open, onClose }: ArticlePreviewProps) => {
  const formattedDate = article.created_at 
    ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true, locale: fr })
    : "Aujourd'hui";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Aperçu de l'article</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {article.image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
              <img 
                src={article.image_url} 
                alt={article.title || "Image de l'article"} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h1 className="text-3xl font-serif font-bold mb-4">{article.title || "Sans titre"}</h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <span>Publié {formattedDate}</span>
            <span className="mx-2">•</span>
            <span>{article.category || "Non catégorisé"}</span>
            {article.read_time && (
              <>
                <span className="mx-2">•</span>
                <span>{article.read_time} min de lecture</span>
              </>
            )}
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {typeof tag === 'string' ? tag : tag.name}
                </Badge>
              ))}
            </div>
          )}
          
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content || "" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticlePreview;
