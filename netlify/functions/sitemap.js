/**
 * Sitemap simple pour test - version minimale
 */

exports.handler = async (event, context) => {
  console.log('🚀 Sitemap function called');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://emergences.novahypnose.fr</loc>
    <lastmod>2025-01-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://emergences.novahypnose.fr/admin</loc>
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