// src/pages/api/latest-articles.ts (PAS .tsx !)
import { getAllArticlesNoPagination } from '@/lib/services/articleService';

// Route API pour récupérer les derniers articles
export async function GET() {
  try {
    const { data: articles, error } = await getAllArticlesNoPagination();
    
    if (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors de la récupération des articles'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Prendre les 6 derniers articles publiés (pour le slider)
    const latestArticles = articles
      ?.filter(article => article.published)
      ?.slice(0, 6) // 6 articles pour avoir plus de choix dans le slider
      ?.map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        image_url: article.image_url,
        slug: article.slug,
        published_at: article.published_at || article.created_at,
        categories: article.categories,
        read_time: article.read_time,
        url: `https://emergence-blog-scribe.lovable.app/article/${article.slug}` // ✅ URL correcte
      })) || [];

    return new Response(JSON.stringify({
      success: true,
      data: {
        articles: latestArticles,
        total: latestArticles.length,
        updated_at: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // ✅ CORS configuré pour permettre l'accès depuis novahypnose.fr
        'Access-Control-Allow-Origin': '*', // Ou spécifiquement 'https://novahypnose.fr'
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300' // Cache 5 minutes
      }
    });

  } catch (error) {
    console.error('Erreur API latest-articles:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erreur serveur lors de la récupération des articles'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

// Gestion des requêtes OPTIONS pour CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
