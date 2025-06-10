
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
          "url": "https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/emergences-hypnose.webp",
          "width": 800,
          "height": 600
        },
        "url": "https://novahypnose.fr",
        "sameAs": [
          "https://www.instagram.com/novahypnose/",
          "https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris"
        ]
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
        "url": "https://novahypnose.fr",
        "logo": {
          "@type": "ImageObject",
          "url": "https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/emergences-hypnose.webp",
          "width": 800,
          "height": 600
        }
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
      "inLanguage": "fr-FR",
      "publisher": {
        "@type": "Organization",
        "name": "NovaHypnose",
        "url": "https://novahypnose.fr",
        "logo": {
          "@type": "ImageObject",
          "url": "https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/emergences-hypnose.webp",
          "width": 800,
          "height": 600
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "16 rue St Antoine",
          "addressLocality": "Paris",
          "postalCode": "75004",
          "addressCountry": "FR"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+33649358089",
          "contactType": "Customer Service",
          "availableLanguage": "French"
        }
      }
    };
  };

  const generateOrganizationStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://novahypnose.fr/#organization",
      "name": "NovaHypnose",
      "alternateName": "Nova Hypnose Paris",
      "url": "https://novahypnose.fr",
      "logo": {
        "@type": "ImageObject",
        "url": "https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/emergences-hypnose.webp",
        "width": 800,
        "height": 600
      },
      "image": "https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/emergences-hypnose.webp",
      "description": "Cabinet d'hypnothérapie à Paris spécialisé en hypnose ericksonienne. Alain Zenatti vous accompagne pour retrouver confiance, équilibre et vitalité.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "16 rue St Antoine",
        "addressLocality": "Paris",
        "postalCode": "75004",
        "addressCountry": "FR",
        "addressRegion": "Île-de-France"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 48.8533575,
        "longitude": 2.3644123
      },
      "telephone": "+33649358089",
      "email": "contact@novahypnose.fr",
      "sameAs": [
        "https://www.instagram.com/novahypnose/",
        "https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris"
      ],
      "founder": {
        "@type": "Person",
        "name": "Alain Zenatti",
        "jobTitle": "Hypnothérapeute certifié",
        "description": "Maître Hypnologue spécialisé en hypnose ericksonienne"
      }
    };
  };

  return {
    generateArticleStructuredData,
    generateWebsiteStructuredData,
    generateBlogStructuredData,
    generateOrganizationStructuredData
  };
};
