
import { useState, useMemo } from 'react';

type SortField = 'title' | 'created_at' | 'published_at' | 'status';
type SortDirection = 'asc' | 'desc';

export const useAdminArticlesSort = (articles: any[]) => {
  const [sortField, setSortField] = useState<SortField>('published_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedArticles = useMemo(() => {
    const sorted = [...articles].sort((a, b) => {
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
  }, [articles, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    sortedArticles,
    handleSort
  };
};
