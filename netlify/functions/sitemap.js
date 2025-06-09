/**
 * Sitemap complet - évite injection script par hosting
 */

exports.handler = async (event, context) => {
  console.log('🚀 Sitemap function called');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://emergence-blog-scribe.lovable.app</loc>
    <lastmod>2025-01-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://emergence-blog-scribe.lovable.app/article/comment-l-hypnotherapie-transforme-la-peur-du-sang-en-serenite-guide-complet</loc>
    <lastmod>2025-01-09</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://emergence-blog-scribe.lovable.app/article/suis-je-hypnotisable-la-question-que-tout-le-monde-se-pose</loc>
    <lastmod>2025-01-09</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://emergence-blog-scribe.lovable.app/admin</loc>
    <lastmod>2025-01-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
    body: sitemap,
  };
};