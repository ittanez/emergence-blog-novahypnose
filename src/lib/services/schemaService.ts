import { Article } from '@/lib/types';

export interface SchemaMarkup {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

export const generateArticleSchema = (article: Article, siteUrl: string = "https://emergences.novahypnose.fr"): SchemaMarkup => {
  const articleUrl = `${siteUrl}/article/${article.slug}`;
  const imageUrl = article.image_url || `${siteUrl}/images/default-article.jpg`;
  
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.seo_description || article.excerpt,
    "image": {
      "@type": "ImageObject",
      "url": imageUrl,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Person",
      "name": "Alain Zenatti",
      "url": "https://novahypnose.fr",
      "description": "Hypnothérapeute certifié, Maître Praticien en Hypnose Ericksonienne",
      "sameAs": [
        "https://novahypnose.fr",
        "https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "NovaHypnose",
      "url": "https://novahypnose.fr",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/images/logo-novahypnose.png`,
        "width": 300,
        "height": 100
      },
      "sameAs": [
        "https://emergences.novahypnose.fr",
        "https://peur-de-parler-en-public.novahypnose.fr"
      ]
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "url": articleUrl,
    "datePublished": article.created_at,
    "dateModified": article.updated_at || article.created_at,
    "articleSection": article.categories?.[0] || "Blog",
    "keywords": article.tags || [],
    "wordCount": article.content ? article.content.length / 5 : 0, // Approximation des mots
    "inLanguage": "fr-FR",
    "isPartOf": {
      "@type": "Blog",
      "@id": `${siteUrl}/#blog`,
      "name": "Émergences - le blog de NovaHypnose",
      "description": "Regards sur l'hypnose, la transformation intérieure et le bien-être"
    },
    "about": {
      "@type": "Thing",
      "name": "Hypnothérapie",
      "sameAs": [
        "https://fr.wikipedia.org/wiki/Hypnoth%C3%A9rapie",
        "https://www.cfhtb.org/"
      ]
    }
  };
};

export const generateWebsiteSchema = (siteUrl: string = "https://emergences.novahypnose.fr"): SchemaMarkup => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "name": "Émergences",
    "alternateName": "le blog de NovaHypnose",
    "url": siteUrl,
    "description": "Blog d'Alain Zenatti, hypnothérapeute à Paris. Découvrez l'hypnose ericksonienne, la transformation intérieure et le bien-être.",
    "inLanguage": "fr-FR",
    "publisher": {
      "@type": "Organization",
      "name": "NovaHypnose",
      "url": "https://novahypnose.fr"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url?: string }>, siteUrl: string = "https://emergences.novahypnose.fr"): SchemaMarkup => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { "item": item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}` })
    }))
  };
};

export const generateOrganizationSchema = (): SchemaMarkup => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NovaHypnose",
    "alternateName": ["Nova Hypnose", "Alain Zenatti Hypnothérapeute"],
    "url": "https://novahypnose.fr",
    "logo": "https://novahypnose.fr/images/logo-novahypnose.png",
    "description": "Cabinet d'hypnothérapie à Paris spécialisé dans l'hypnose ericksonienne. Alain Zenatti, hypnothérapeute certifié.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "16 Rue Saint Antoine",
      "addressLocality": "Paris",
      "postalCode": "75004",
      "addressCountry": "FR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+33649358089",
      "contactType": "Customer Service",
      "availableLanguage": "French"
    },
    "sameAs": [
      "https://emergences.novahypnose.fr",
      "https://peur-de-parler-en-public.novahypnose.fr",
      "https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris"
    ],
    "founder": {
      "@type": "Person",
      "name": "Alain Zenatti",
      "jobTitle": "Hypnothérapeute certifié",
      "description": "Maître Praticien en Hypnose Ericksonienne"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Paris et Île-de-France"
    },
    "serviceType": [
      "Hypnothérapie",
      "Hypnose Ericksonienne", 
      "Gestion du stress",
      "Confiance en soi",
      "Troubles du sommeil",
      "Peur de parler en public"
    ]
  };
};

export const generateFAQPageSchema = (faqs: Array<{ question: string; answer: string }>): SchemaMarkup => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};