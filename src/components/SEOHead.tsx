
import React from "react";
import { Helmet } from "react-helmet-async";
import { SchemaMarkup } from "@/lib/services/schemaService";

// Fonction pour sécuriser le JSON-LD et éviter les erreurs de syntaxe JavaScript
const safeJSONStringify = (data: unknown): string => {
  try {
    return JSON.stringify(data)
      // Échapper les caractères HTML dangereux
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      // Échapper les caractères problématiques pour JSON-LD
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
      // Supprimer les caractères de contrôle qui peuvent casser le JavaScript
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
  } catch (error) {
    console.error('Erreur JSON.stringify:', error);
    return '{}';
  }
};

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  structuredData?: SchemaMarkup | SchemaMarkup[];
  breadcrumbs?: Array<{ name: string; url?: string }>;
}

const SEOHead = ({
  title,
  description,
  image = "https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/emergences-hypnose.webp",
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  keywords = [],
  structuredData,
  breadcrumbs = []
}: SEOHeadProps) => {
  const siteTitle = "Émergences - le blog de NovaHypnose";
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
  const currentUrl = url || window.location.href;
  
  return (
    <Helmet>
      {/* Titre et description de base */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Mots-clés */}
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      
      {/* Auteur */}
      {author && <meta name="author" content={author} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Article spécifique */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Données structurées */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((data, index) => (
            <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{
              __html: safeJSONStringify(data)
            }} />
          ))
        ) : (
          <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: safeJSONStringify(structuredData)
          }} />
        )
      )}
    </Helmet>
  );
};

export default SEOHead;
