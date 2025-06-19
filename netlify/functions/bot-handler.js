/**
 * Netlify Function pour servir du contenu pré-rendu aux crawlers
 * Détecte les bots et sert le HTML statique pour un meilleur SEO
 */

const fs = require('fs');
const path = require('path');

// User agents des principaux crawlers
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot', 
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegram'
];

/**
 * Vérifie si la requête provient d'un bot/crawler
 */
function isBot(userAgent) {
  if (!userAgent) return false;
  
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

/**
 * Normalise le chemin pour trouver le fichier pré-rendu
 */
function normalizeRoute(pathname) {
  if (pathname === '/' || pathname === '') return 'index';
  
  // Supprimer les slashes et remplacer par des tirets
  return pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '-');
}

/**
 * Charge le HTML pré-rendu si disponible
 */
function loadPrerenderedHTML(route) {
  try {
    const fileName = `${normalizeRoute(route)}.html`;
    const filePath = path.join(__dirname, '../../dist/_prerendered', fileName);
    
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.error('Erreur lecture fichier pré-rendu:', error);
  }
  
  return null;
}

/**
 * Charge le HTML principal de l'application React
 */
function loadMainHTML() {
  try {
    const indexPath = path.join(__dirname, '../../dist/index.html');
    return fs.readFileSync(indexPath, 'utf-8');
  } catch (error) {
    console.error('Erreur lecture index.html:', error);
    return '<html><body><h1>Erreur de chargement</h1></body></html>';
  }
}

/**
 * Handler principal de la fonction Netlify
 */
exports.handler = async (event, context) => {
  const { httpMethod, path: pathname, headers } = event;
  
  // Ne traiter que les requêtes GET
  if (httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }
  
  const userAgent = headers['user-agent'] || '';
  const isFromBot = isBot(userAgent);
  
  console.log(`📥 ${pathname} - Bot: ${isFromBot} - UA: ${userAgent.substring(0, 50)}...`);
  
  let html;
  let headers_response = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=300'
  };
  
  if (isFromBot) {
    // Servir le contenu pré-rendu pour les bots
    html = loadPrerenderedHTML(pathname);
    
    if (html) {
      console.log(`✅ Contenu pré-rendu servi pour ${pathname}`);
      headers_response['X-Prerendered'] = 'true';
      headers_response['X-Bot-Detected'] = userAgent.split('/')[0];
    } else {
      console.log(`⚠️ Pas de contenu pré-rendu pour ${pathname}, fallback vers React`);
      html = loadMainHTML();
      headers_response['X-Prerendered'] = 'false';
    }
  } else {
    // Servir l'application React normale pour les utilisateurs
    html = loadMainHTML();
    headers_response['X-Prerendered'] = 'false';
    headers_response['Cache-Control'] = 'public, max-age=0, must-revalidate';
  }
  
  return {
    statusCode: 200,
    headers: headers_response,
    body: html
  };
};