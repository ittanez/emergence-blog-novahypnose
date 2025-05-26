
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Send, Trash2 } from "lucide-react";
import { Article } from "@/lib/types";

interface AdminArticlesTableProps {
  articles: Article[];
  isNotifying: string | null;
  onViewArticle: (slug: string) => void;
  onEditArticle: (id: string) => void;
  onNotifySubscribers: (article: Article) => void;
  onDeleteClick: (article: Article) => void;
}

const AdminArticlesTable = ({
  articles,
  isNotifying,
  onViewArticle,
  onEditArticle,
  onNotifySubscribers,
  onDeleteClick
}: AdminArticlesTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead className="hidden md:table-cell">Date de création</TableHead>
            <TableHead className="hidden md:table-cell">Statut</TableHead>
            <TableHead className="hidden md:table-cell">Catégories</TableHead>
            <TableHead className="hidden lg:table-cell">Temps de lecture</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map(article => (
            <TableRow key={article.id}>
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(article.created_at).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {article.published ? 
                  <span className="text-green-500">Publié</span> : 
                  <span className="text-gray-500">Brouillon</span>
                }
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {article.categories && article.categories.length > 0 
                  ? article.categories.join(", ") 
                  : "Non catégorisé"
                }
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {article.read_time} min
              </TableCell>
              <TableCell className="text-right flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewArticle(article.slug)}
                  title="Voir l'article"
                >
                  <Eye size={16} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEditArticle(article.id)}
                  title="Modifier l'article"
                >
                  <Pencil size={16} />
                </Button>

                {article.published && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNotifySubscribers(article)}
                    disabled={isNotifying === article.id}
                    className="text-blue-500 hover:text-blue-700"
                    title="Notifier les abonnés"
                  >
                    {isNotifying === article.id ? (
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDeleteClick(article)}
                  className="text-red-500 hover:text-red-700"
                  title="Supprimer l'article"
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminArticlesTable;
