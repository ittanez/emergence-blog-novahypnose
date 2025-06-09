/**
 * Service de génération de Sitemap dynamique
 * Génère automatiquement sitemap.xml avec tous les articles publiés
 */

import { getAllArticlesNoPagination, getAllCategories } from './articleService';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export class SitemapService {
  private static readonly BASE_URL = 'https://emergences.novahypnose.fr';
  
  /**
   * Génère le sitemap complet en XML
   */
  static async generateSitemap(): Promise<string> {
    const urls = await this.getAllUrls();
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(url => this.formatUrl(url)).join('\n')}
</urlset>`;

    return sitemap;
  }

  /**
   * Récupère toutes les URLs du site
   */
  private static async getAllUrls(): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = [];
    
    // Page d'accueil - priorité maximale
    urls.push({
      loc: this.BASE_URL,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 1.0
    });

    // Articles publiés
    try {
      const articlesResult = await getAllArticlesNoPagination();
      if (articlesResult.data) {
        const publishedArticles = articlesResult.data.filter(article => article.published);
        
        publishedArticles.forEach(article => {
          // Utiliser published_at si disponible, sinon created_at
          const lastModified = article.updated_at || article.published_at || article.created_at;
          
          urls.push({
            loc: `${this.BASE_URL}/article/${article.slug}`,
            lastmod: new Date(lastModified).toISOString().split('T')[0],
            changefreq: 'weekly', // Articles changent moins souvent
            priority: 0.8
          });
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des articles pour sitemap:', error);
    }

    // Pages de catégories
    try {
      const categoriesResult = await getAllCategories();
      if (categoriesResult.data) {
        categoriesResult.data.forEach(category => {
          // Encoder l'URL de la catégorie
          const encodedCategory = encodeURIComponent(category);
          
          urls.push({
            loc: `${this.BASE_URL}/category/${encodedCategory}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.6
          });
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories pour sitemap:', error);
    }

    // Pages statiques importantes
    const staticPages = [
      { path: '/admin', priority: 0.3, changefreq: 'monthly' as const },
    ];

    staticPages.forEach(page => {
      urls.push({
        loc: `${this.BASE_URL}${page.path}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: page.changefreq,
        priority: page.priority
      });
    });

    return urls.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Formate une URL en XML
   */
  private static formatUrl(url: SitemapUrl): string {
    return `  <url>
    <loc>${this.escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`;
  }

  /**
   * Échappe les caractères XML
   */
  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Génère un sitemap d'index si nécessaire (pour + de 50000 URLs)
   */
  static async generateSitemapIndex(): Promise<string> {
    const now = new Date().toISOString().split('T')[0];
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${this.BASE_URL}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
  }

  /**
   * Valide le sitemap généré
   */
  static validateSitemap(sitemap: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Vérifications basiques
    if (!sitemap.includes('<?xml')) {
      errors.push('Déclaration XML manquante');
    }
    
    if (!sitemap.includes('<urlset')) {
      errors.push('Élément urlset manquant');
    }
    
    // Compter les URLs (limite Google: 50,000)
    const urlCount = (sitemap.match(/<url>/g) || []).length;
    if (urlCount > 50000) {
      errors.push(`Trop d'URLs: ${urlCount} (max: 50,000)`);
    }
    
    // Vérifier la taille (limite Google: 50MB)
    const sizeInBytes = new Blob([sitemap]).size;
    if (sizeInBytes > 52428800) { // 50MB
      errors.push(`Sitemap trop volumineux: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB (max: 50MB)`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export des fonctions utilitaires
export const generateSitemap = SitemapService.generateSitemap;
export const validateSitemap = SitemapService.validateSitemap;