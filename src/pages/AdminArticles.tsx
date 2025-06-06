// Exemple d'amélioration pour AdminArticles.tsx
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllArticles } from '@/lib/services/articleService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  Plus
} from 'lucide-react';

type SortField = 'title' | 'created_at' | 'published_at' | 'status';
type SortDirection = 'asc' | 'desc';

const AdminArticles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('published_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Récupérer tous les articles (y compris brouillons)
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => getAllArticles({ 
      includeDrafts: true,
      page: 1, 
      limit: 100 
    }),
  });

  const articles = articlesData?.data || [];

  // Fonction de tri
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Articles filtrés et triés
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles;

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.categories?.some(cat => cat.toLowerCase().includes(query))
      );
    }

    // Tri
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'published_at':
          aValue = a.published_at ? new Date(a.published_at).getTime() : 0;
          bValue = b.published_at ? new Date(b.published_at).getTime() : 0;
          break;
        case 'status':
          aValue = a.published ? 1 : 0;
          bValue = b.published ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [articles, searchQuery, sortField, sortDirection]);

  // Composant pour l'en-tête de colonne triable
  const SortableHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  // Fonction pour formater la date
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des articles</h1>
          <p className="text-gray-600">{articles.length} articles au total</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <Input
          placeholder="Rechercher par titre ou catégorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Tableau des articles */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Image</TableHead>
              <SortableHeader field="title">Titre</SortableHeader>
              <TableHead>Date de création</TableHead>
              <SortableHeader field="published_at">Date de publication</SortableHeader>
              <SortableHeader field="status">Statut</SortableHeader>
              <TableHead>Catégories</TableHead>
              <TableHead className="w-16">Temps de lecture</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedArticles.map((article) => (
              <TableRow key={article.id}>
                {/* ✅ NOUVELLE COLONNE : Image */}
                <TableCell>
                  {article.image_url ? (
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">N/A</span>
                    </div>
                  )}
                </TableCell>
                
                <TableCell className="font-medium">
                  <div className="max-w-xs truncate" title={article.title}>
                    {article.title}
                  </div>
                </TableCell>
                
                <TableCell className="text-sm text-gray-600">
                  {formatDate(article.created_at)}
                </TableCell>
                
                {/* ✅ NOUVELLE COLONNE : Date de publication */}
                <TableCell className="text-sm text-gray-600">
                  {article.published ? formatDate(article.published_at) : '-'}
                </TableCell>
                
                <TableCell>
                  <Badge variant={article.published ? "default" : "secondary"}>
                    {article.published ? "Publié" : "Brouillon"}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {article.categories?.slice(0, 2).map((category) => (
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      {article.published && (
                        <DropdownMenuItem>
                          <Send className="h-4 w-4 mr-2" />
                          Partager
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredAndSortedArticles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun article trouvé
        </div>
      )}
    </div>
  );
};

export default AdminArticles;
