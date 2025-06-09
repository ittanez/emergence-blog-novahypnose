/**
 * Netlify Function pour générer dynamiquement le sitemap
 * URL: /.netlify/functions/sitemap
 */

exports.handler = async (event, context) => {
  try {
    console.log('🚀 Génération sitemap dynamique...');
    
    // Import dynamique de Supabase
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const BASE_URL = 'https://emergences.novahypnose.fr';
    
    const urls = [];
    
    // Page d'accueil
    urls.push({
      loc: BASE_URL,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 1.0
    });

    // Récupérer les articles publiés
    try {
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('slug, created_at, updated_at, published_at')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (articlesError) {
        console.error('Erreur articles:', articlesError);
      } else if (articles && articles.length > 0) {
        console.log(`📄 ${articles.length} articles trouvés`);
        
        articles.forEach(article => {
          const lastModified = article.updated_at || article.published_at || article.created_at;
          
          urls.push({
            loc: `${BASE_URL}/article/${article.slug}`,
            lastmod: new Date(lastModified).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.8
          });
        });
      }
    } catch (error) {
      console.error('Erreur requête articles:', error);
    }

    // Récupérer les catégories
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('articles')
        .select('categories')
        .eq('published', true);

      if (!categoriesError && categories && categories.length > 0) {
        const uniqueCategories = new Set();
        
        categories.forEach(article => {
          if (article.categories && Array.isArray(article.categories)) {
            article.categories.forEach(cat => uniqueCategories.add(cat));
          }
        });

        uniqueCategories.forEach(category => {
          urls.push({
            loc: `${BASE_URL}/category/${encodeURIComponent(category)}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.6
          });
        });
        
        console.log(`📂 ${uniqueCategories.size} catégories trouvées`);
      }
    } catch (error) {
      console.error('Erreur requête catégories:', error);
    }

    // Générer le XML
    function escapeXml(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

    console.log(`✅ Sitemap généré: ${urls.length} URLs`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
      body: sitemap,
    };

  } catch (error) {
    console.error('❌ Erreur génération sitemap:', error);
    
    // Sitemap de fallback
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://emergences.novahypnose.fr</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
      body: fallbackSitemap,
    };
  }
};