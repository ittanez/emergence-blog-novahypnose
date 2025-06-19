#!/usr/bin/env node

/**
 * Script de pré-rendu pour améliorer la crawlabilité SEO
 * Génère des versions HTML statiques des pages principales
 */

import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer';

// Pages à pré-rendre pour les crawlers
const ROUTES = [
  '/',
  '/about',
  '/faq',
  // Les articles seront ajoutés dynamiquement
];

// Configuration
const DIST_DIR = 'dist';
const PRERENDER_DIR = path.join(DIST_DIR, '_prerendered');
const SERVER_PORT = 4173;

/**
 * Démarrer un serveur Vite de preview
 */
async function startPreviewServer() {
  const { preview } = await import('vite');
  const server = await preview({
    root: process.cwd(),
    build: {
      outDir: DIST_DIR
    },
    preview: {
      port: SERVER_PORT,
      host: 'localhost'
    }
  });
  
  return server;
}

/**
 * Extraire les articles du sitemap
 */
async function extractArticleRoutes() {
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  
  if (!fs.existsSync(sitemapPath)) {
    console.warn('❌ Sitemap non trouvé, articles ignorés');
    return [];
  }
  
  const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
  const articleMatches = sitemap.match(/\/article\/[^<]+/g) || [];
  
  return articleMatches.map(match => match.replace('https://emergences.novahypnose.fr', ''));
}

/**
 * Pré-rendre une page avec Puppeteer
 */
async function prerenderPage(browser, route) {
  console.log(`🔄 Pré-rendu de ${route}...`);
  
  const page = await browser.newPage();
  
  try {
    // Configurer la page pour un rendu optimal
    await page.setViewport({ width: 1200, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    
    // Charger la page
    const url = `http://localhost:${SERVER_PORT}${route}`;
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Attendre que React soit complètement chargé
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Attendre un peu plus pour les composants async
    await page.waitForTimeout(2000);
    
    // Récupérer le HTML rendu
    const html = await page.content();
    
    // Nettoyer le HTML pour les crawlers
    const cleanHtml = await page.evaluate(() => {
      // Supprimer les scripts non essentiels
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (!script.src || script.src.includes('react') || script.src.includes('vite')) {
          script.remove();
        }
      });
      
      // Ajouter des meta spéciaux pour les crawlers
      const meta = document.createElement('meta');
      meta.name = 'prerendered';
      meta.content = 'true';
      document.head.appendChild(meta);
      
      // Ajouter timestamp de génération
      const timestamp = document.createElement('meta');
      timestamp.name = 'generated';
      timestamp.content = new Date().toISOString();
      document.head.appendChild(timestamp);
      
      return document.documentElement.outerHTML;
    });
    
    return cleanHtml;
    
  } catch (error) {
    console.error(`❌ Erreur lors du pré-rendu de ${route}:`, error.message);
    return null;
  } finally {
    await page.close();
  }
}

/**
 * Sauvegarder le HTML pré-rendu
 */
async function savePrerenderedPage(route, html) {
  if (!html) return;
  
  const fileName = route === '/' ? 'index.html' : `${route.slice(1).replace(/\//g, '-')}.html`;
  const filePath = path.join(PRERENDER_DIR, fileName);
  
  // Créer le dossier si nécessaire
  await fs.ensureDir(PRERENDER_DIR);
  
  // Sauvegarder
  await fs.writeFile(filePath, html, 'utf-8');
  console.log(`✅ ${route} → ${fileName}`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage du pré-rendu SEO...\n');
  
  let server = null;
  let browser = null;
  
  try {
    // 1. Démarrer le serveur de preview
    console.log('📡 Démarrage du serveur preview...');
    server = await startPreviewServer();
    console.log(`✅ Serveur démarré sur http://localhost:${SERVER_PORT}\n`);
    
    // 2. Extraire les routes des articles
    console.log('📄 Extraction des articles...');
    const articleRoutes = await extractArticleRoutes();
    console.log(`✅ ${articleRoutes.length} articles trouvés\n`);
    
    // 3. Combiner toutes les routes
    const allRoutes = [...ROUTES, ...articleRoutes];
    console.log(`📋 ${allRoutes.length} pages à pré-rendre\n`);
    
    // 4. Démarrer Puppeteer
    console.log('🎭 Démarrage de Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Puppeteer prêt\n');
    
    // 5. Pré-rendre toutes les pages
    console.log('🔄 Pré-rendu des pages...\n');
    
    for (const route of allRoutes) {
      const html = await prerenderPage(browser, route);
      await savePrerenderedPage(route, html);
    }
    
    console.log(`\n✅ Pré-rendu terminé ! ${allRoutes.length} pages générées dans ${PRERENDER_DIR}/`);
    
  } catch (error) {
    console.error('❌ Erreur durant le pré-rendu:', error);
    process.exit(1);
  } finally {
    // Nettoyage
    if (browser) {
      await browser.close();
    }
    if (server) {
      await server.close();
    }
  }
}

// Lancer le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as prerender };