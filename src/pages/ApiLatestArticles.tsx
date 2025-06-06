// src/pages/ApiLatestArticles.tsx
import { useEffect } from 'react';
import { getAllArticlesNoPagination } from '@/lib/services/articleService';

const ApiLatestArticles = () => {
  useEffect(() => {
    const handleApiCall = async () => {
      try {
        const { data: articles, error } = await getAllArticlesNoPagination();
        
        if (error) {
          const response = {
            success: false,
            error: error.message || 'Erreur lors de la récupération des articles'
          };
          
          // Renvoyer la réponse JSON
          document.body.innerHTML = `<pre>${JSON.stringify(response, null, 2)}</pre>`;
          return;
        }

        // Prendre les 6 derniers articles publiés
        const latestArticles = articles
          ?.filter(article => article.published)
          ?.slice(0, 6)
          ?.map(article => ({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            image_url: article.image_url,
            slug: article.slug,
            published_at: article.published_at || article.created_at,
            categories: article.categories,
            read_time: article.read_time,
            url: `https://emergences.novahypnose.fr/article/${article.slug}`
          })) || [];

        const response = {
          success: true,
          data: {
            articles: latestArticles,
            total: latestArticles.length,
            updated_at: new Date().toISOString()
          }
        };

        // Configurer les headers pour CORS
        if (window.parent !== window) {
          // Si dans une iframe, envoyer les données au parent
          window.parent.postMessage(response, '*');
        }

        // Afficher le JSON
        document.body.innerHTML = `<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px;">${JSON.stringify(response, null, 2)}</pre>`;
        
      } catch (error) {
        console.error('Erreur API latest-articles:', error);
        
        const response = {
          success: false,
          error: 'Erreur serveur lors de la récupération des articles'
        };
        
        document.body.innerHTML = `<pre>${JSON.stringify(response, null, 2)}</pre>`;
      }
    };

    handleApiCall();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      Chargement de l'API...
    </div>
  );
};

export default ApiLatestArticles;
