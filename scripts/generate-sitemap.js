/**
 * Script de génération de sitemap au moment du build
 * Usage: node scripts/generate-sitemap.js
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Configuration
const BASE_URL = 'https://emergences.novahypnose.fr';
const OUTPUT_PATH = join(process.cwd(), 'dist', 'sitemap.xml');

/**
 * Génère un sitemap basique (sera remplacé par le service dynamique)
 */
function generateBasicSitemap() {
  const now = new Date().toISOString().split('T')[0];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/admin</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

  return sitemap;
}

/**
 * Génère et écrit le sitemap
 */
function buildSitemap() {
  try {
    console.log('🚀 Génération du sitemap...');
    
    const sitemap = generateBasicSitemap();
    
    // Écrire le fichier
    writeFileSync(OUTPUT_PATH, sitemap, 'utf8');
    
    console.log(`✅ Sitemap généré avec succès: ${OUTPUT_PATH}`);
    console.log(`📊 Taille: ${(sitemap.length / 1024).toFixed(2)} KB`);
    
    // Validation basique
    const urlCount = (sitemap.match(/<url>/g) || []).length;
    console.log(`📄 URLs incluses: ${urlCount}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du sitemap:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  buildSitemap();
}

export { buildSitemap };