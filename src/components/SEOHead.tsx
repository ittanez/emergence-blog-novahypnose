
import React from "react";
import { Helmet } from "react-helmet-async";

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
  structuredData?: object;
}

const SEOHead = ({
  title,
  description,
  image = "/placeholder.svg",
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  keywords = [],
  structuredData
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
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
