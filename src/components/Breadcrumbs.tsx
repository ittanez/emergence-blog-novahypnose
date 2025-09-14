import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  url?: string;
  isHome?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = "" }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Fil d'Ariane" className={`mb-6 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-600">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;
          
          return (
            <li key={index} className="flex items-center">
              {/* Separator */}
              {!isFirst && (
                <ChevronRight 
                  className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" 
                  aria-hidden="true" 
                />
              )}
              
              {/* Breadcrumb item */}
              {isLast ? (
                // Current page (not clickable)
                <span 
                  className="text-gray-900 font-medium truncate max-w-xs"
                  aria-current="page"
                  title={item.name}
                >
                  {item.isHome && <Home className="w-4 h-4 inline mr-1" />}
                  {item.name}
                </span>
              ) : (
                // Clickable link
                <Link
                  to={item.url || '/'}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors truncate max-w-xs"
                  title={item.name}
                >
                  {item.isHome && <Home className="w-4 h-4 inline mr-1" />}
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Helper functions pour générer des breadcrumbs automatiquement
export const generateArticleBreadcrumbs = (article: any): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Accueil', url: '/', isHome: true }
  ];

  // Ajouter la catégorie si elle existe
  if (article.category && article.category !== 'Non classé') {
    breadcrumbs.push({
      name: article.category,
      url: `/?category=${encodeURIComponent(article.category)}`
    });
  }

  // Ajouter l'article actuel (pas de lien car c'est la page courante)
  breadcrumbs.push({
    name: article.title
  });

  return breadcrumbs;
};

export const generateCategoryBreadcrumbs = (categoryName: string): BreadcrumbItem[] => {
  return [
    { name: 'Accueil', url: '/', isHome: true },
    { name: categoryName }
  ];
};

export const generatePageBreadcrumbs = (pageName: string, pageUrl?: string): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Accueil', url: '/', isHome: true }
  ];

  if (pageUrl) {
    breadcrumbs.push({
      name: pageName,
      url: pageUrl
    });
  } else {
    breadcrumbs.push({
      name: pageName
    });
  }

  return breadcrumbs;
};

// Breadcrumbs avec structured data automatique
interface BreadcrumbsWithSchemaProps extends BreadcrumbsProps {
  generateSchema?: boolean;
  siteUrl?: string;
}

export const BreadcrumbsWithSchema: React.FC<BreadcrumbsWithSchemaProps> = ({ 
  items, 
  className = "",
  generateSchema = true,
  siteUrl = "https://emergences.novahypnose.fr"
}) => {
  // Générer le schema markup pour les breadcrumbs
  const schemaMarkup = generateSchema ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { 
        "item": item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}` 
      })
    }))
  } : null;

  return (
    <>
      {schemaMarkup && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaMarkup)
          }}
        />
      )}
      <Breadcrumbs items={items} className={className} />
    </>
  );
};

export default Breadcrumbs;