
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { deleteArticle } from '@/lib/services/articleService';
import { useToast } from '@/hooks/use-toast';

export const useAdminArticlesActions = () => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleNewArticle = () => {
    navigate('/admin/article/new');
  };

  const handleViewArticle = (article: any) => {
    if (article.published) {
      window.open(`/article/${article.slug}`, '_blank');
    } else {
      toast({
        title: "Article non publié",
        description: "Cet article n'est pas encore publié publiquement.",
        variant: "destructive"
      });
    }
  };

  const handleEditArticle = (articleId: string) => {
    navigate(`/admin/article/${articleId}`);
  };

  const handleDeleteArticle = async (article: any) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.title}" ?`)) {
      return;
    }

    setIsDeleting(article.id);
    
    try {
      const result = await deleteArticle(article.id);
      
      if (result.success) {
        toast({
          title: "Article supprimé",
          description: `L'article "${article.title}" a été supprimé avec succès.`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      } else {
        throw new Error(result.error?.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleShareArticle = async (article: any) => {
    if (!article.published) {
      toast({
        title: "Article non publié",
        description: "Impossible de partager un article non publié.",
        variant: "destructive"
      });
      return;
    }

    const url = `${window.location.origin}/article/${article.slug}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié",
        description: "Le lien de l'article a été copié dans le presse-papiers.",
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Lien copié",
        description: "Le lien de l'article a été copié.",
      });
    }
  };

  return {
    isDeleting,
    handleNewArticle,
    handleViewArticle,
    handleEditArticle,
    handleDeleteArticle,
    handleShareArticle
  };
};
