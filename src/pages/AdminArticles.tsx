import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllArticles } from '@/lib/services/articleService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus } from 'lucide-react';

// Import new components
import AdminArticlesFilters from '@/components/admin/AdminArticlesFilters';
import AdminArticlesActions from '@/components/admin/AdminArticlesActions';
import AdminArticlesStatusBadge from '@/components/admin/AdminArticlesStatusBadge';
import AdminArticlesImageCell from '@/components/admin/AdminArticlesImageCell';
import AdminArticlesSortableHeader from '@/components/admin/AdminArticlesSortableHeader';

// Import new hooks
import { useAdminArticlesActions } from '@/hooks/useAdminArticlesActions';
import { useAdminArticlesSort } from '@/hooks/useAdminArticlesSort';

const AdminArticles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    isDeleting,
    handleNewArticle,
    handleViewArticle,
    handleEditArticle,
    handleDeleteArticle,
    handleShareArticle
  } = useAdminArticlesActions();

  // Fetch articles
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => getAllArticles(1, 100),
  });

  const articles = articlesData?.data || [];

  // Filter articles by search
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    
    const query = searchQuery.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.categories?.some((cat: string) => cat.toLowerCase().includes(query))
    );
  }, [articles, searchQuery]);

  // Sort articles
  const {
    sortField,
    sortDirection,
    sortedArticles,
    handleSort
  } = useAdminArticlesSort(filteredArticles);

  // Format date utility
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des articles</h1>
          <p className="text-gray-600">{articles.length} articles au total</p>
        </div>
        <Button onClick={handleNewArticle}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Filters */}
      <AdminArticlesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Image</TableHead>
              <AdminArticlesSortableHeader 
                field="title" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={handleSort}
              >
                Titre
              </AdminArticlesSortableHeader>
              <TableHead>Date de création</TableHead>
              <AdminArticlesSortableHeader 
                field="published_at" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={handleSort}
              >
                Date de publication
              </AdminArticlesSortableHeader>
              <TableHead>Programmée</TableHead>
              <AdminArticlesSortableHeader 
                field="status" 
                sortField={sortField} 
                sortDirection={sortDirection} 
                onSort={handleSort}
              >
                Statut
              </AdminArticlesSortableHeader>
              <TableHead>Catégories</TableHead>
              <TableHead className="w-16">Temps de lecture</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <AdminArticlesImageCell 
                    imageUrl={article.image_url}
                    title={article.title}
                  />
                </TableCell>
                
                <TableCell className="font-medium">
                  <div className="max-w-xs truncate" title={article.title}>
                    {article.title}
                  </div>
                </TableCell>
                
                <TableCell className="text-sm text-gray-600">
                  {formatDate(article.created_at)}
                </TableCell>
                
                <TableCell className="text-sm text-gray-600">
                  {article.published ? formatDate(article.published_at) : '-'}
                </TableCell>
                
                <TableCell className="text-sm text-gray-600">
                  {article.scheduled_for ? (
                    <span className="text-orange-600 font-medium">
                      {formatDate(article.scheduled_for)}
                    </span>
                  ) : '-'}
                </TableCell>
                
                <TableCell>
                  <AdminArticlesStatusBadge article={article} />
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {article.categories?.slice(0, 2).map((category: string) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {(article.categories?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{(article.categories?.length || 0) - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="text-sm text-gray-600">
                  {article.read_time || '-'} min
                </TableCell>
                
                <TableCell>
                  <AdminArticlesActions
                    article={article}
                    isDeleting={isDeleting === article.id}
                    onView={handleViewArticle}
                    onEdit={handleEditArticle}
                    onDelete={handleDeleteArticle}
                    onShare={handleShareArticle}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedArticles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun article trouvé
        </div>
      )}
    </div>
  );
};

export default AdminArticles;
