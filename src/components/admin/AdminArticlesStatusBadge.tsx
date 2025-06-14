
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AdminArticlesStatusBadgeProps {
  article: {
    published: boolean;
    scheduled_for?: string;
  };
}

const AdminArticlesStatusBadge = ({ article }: AdminArticlesStatusBadgeProps) => {
  if (article.published) {
    return <Badge variant="default">Publié</Badge>;
  } else if (article.scheduled_for) {
    return (
      <Badge variant="outline" className="border-orange-500 text-orange-700">
        Programmé
      </Badge>
    );
  } else {
    return <Badge variant="secondary">Brouillon</Badge>;
  }
};

export default AdminArticlesStatusBadge;
