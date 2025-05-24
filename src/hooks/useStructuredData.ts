
import { Article, Author } from "@/lib/types";

export const useStructuredData = () => {
  const generateArticleStructuredData = (article: Article, author?: Author) => {
    const baseUrl = window.location.origin;
    
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.seo_description || article.excerpt,
      "image": article.image_url ? [article.image_url] : [],
      "datePublished": article.created_at,
      "dateModified": article.updated_at,
      "author": {
        "@type": "Person",
        "name": author?.name || "Alain Zenatti",
        "description": author?.bio || "",
        "url": "https://novahypnose.fr"
      },
      "publisher": {
        "@type": "Organization",
        "name": "NovaHypnose",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/placeholder.svg`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/article/${article.slug}`
      },
      "keywords": Array.isArray(article.keywords) ? article.keywords.join(", ") : "",
      "wordCount": article.content ? article.content.replace(/<[^>]*>/g, "").split(" ").length : 0,
      "timeRequired": `PT${article.read_time}M`
    };
  };

  const generateWebsiteStructuredData = () => {
    const baseUrl = window.location.origin;
    
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Émergences - le blog de NovaHypnose",
      "description": "Regards sur l'hypnose, la transformation intérieure et le bien-être",
      "url": baseUrl,
      "publisher": {
        "@type": "Organization",
        "name": "NovaHypnose",
        "url": "https://novahypnose.fr"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
  };

  const generateBlogStructuredData = () => {
    const baseUrl = window.location.origin;
    
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Émergences",
      "description": "Blog sur l'hypnose, la transformation intérieure et le bien-être",
      "url": baseUrl,
      "publisher": {
        "@type": "Organization",
        "name": "NovaHypnose",
        "url": "https://novahypnose.fr"
      }
    };
  };

  return {
    generateArticleStructuredData,
    generateWebsiteStructuredData,
    generateBlogStructuredData
  };
};
