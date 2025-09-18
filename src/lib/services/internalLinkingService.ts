import { Article } from '@/lib/types';

export interface LinkingRule {
  keywords: string[];
  targetArticle?: string;
  targetUrl?: string;
  linkText?: string;
  priority?: number;
  maxOccurrences?: number;
}

export interface LinkingConfig {
  maxLinksPerArticle?: number;
  minWordsBetweenLinks?: number;
  excludeFirstParagraph?: boolean;
  respectExistingLinks?: boolean;
}

// Règles de linking prédéfinies pour le blog d'hypnose
export const defaultLinkingRules: LinkingRule[] = [
  // Hypnose et techniques
  {
    keywords: ['hypnose ericksonienne', 'hypnose ericksonnienne', 'Milton Erickson'],
    targetUrl: '/about',
    linkText: 'hypnose ericksonienne',
    priority: 10
  },
  {
    keywords: ['gestion du stress', 'gérer le stress', 'stress', 'anxiété'],
    linkText: 'gestion du stress par l\'hypnose',
    priority: 9
  },
  {
    keywords: ['confiance en soi', 'estime de soi', 'manque de confiance'],
    linkText: 'développer sa confiance en soi',
    priority: 8
  },
  {
    keywords: ['troubles du sommeil', 'insomnie', 'mal dormir'],
    linkText: 'améliorer son sommeil avec l\'hypnose',
    priority: 8
  },
  {
    keywords: ['peur de parler en public', 'glossophobie', 'trac'],
    targetUrl: 'https://peur-de-parler-en-public.novahypnose.fr',
    linkText: 'surmonter la peur de parler en public',
    priority: 9
  },
  {
    keywords: ['séance d\'hypnose', 'consultation', 'thérapie'],
    targetUrl: '/faq',
    linkText: 'déroulement d\'une séance d\'hypnose',
    priority: 7
  },
  {
    keywords: ['hypnothérapeute Paris', 'thérapeute Paris'],
    targetUrl: 'https://novahypnose.fr',
    linkText: 'hypnothérapeute à Paris',
    priority: 6
  },
  // Techniques spécifiques
  {
    keywords: ['auto-hypnose', 'autohypnose'],
    linkText: 'techniques d\'auto-hypnose',
    priority: 7
  },
  {
    keywords: ['transformation', 'changement', 'évolution personnelle'],
    linkText: 'transformation personnelle par l\'hypnose',
    priority: 6
  },
  {
    keywords: ['bien-être', 'bien être', 'développement personnel'],
    linkText: 'bien-être et hypnothérapie',
    priority: 5
  }
];

export class InternalLinkingService {
  private rules: LinkingRule[];
  private config: LinkingConfig;
  private allArticles: Article[];

  constructor(
    articles: Article[] = [], 
    customRules: LinkingRule[] = [], 
    config: LinkingConfig = {}
  ) {
    this.allArticles = articles;
    this.rules = [...defaultLinkingRules, ...customRules];
    this.config = {
      maxLinksPerArticle: 5,
      minWordsBetweenLinks: 50,
      excludeFirstParagraph: true,
      respectExistingLinks: true,
      ...config
    };

    // Enrichir les règles avec les articles disponibles
    this.enrichRulesWithArticles();
  }

  private enrichRulesWithArticles(): void {
    // Pour chaque règle sans targetArticle défini, essayer de trouver un article pertinent
    this.rules.forEach(rule => {
      if (!rule.targetArticle && !rule.targetUrl) {
        const matchingArticle = this.findBestMatchingArticle(rule.keywords);
        if (matchingArticle) {
          rule.targetArticle = `/article/${matchingArticle.slug}`;
          if (!rule.linkText) {
            rule.linkText = matchingArticle.title;
          }
        }
      }
    });

    // Trier les règles par priorité
    this.rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  private findBestMatchingArticle(keywords: string[]): Article | null {
    let bestMatch: Article | null = null;
    let bestScore = 0;

    for (const article of this.allArticles) {
      const articleText = `${article.title} ${article.excerpt} ${article.content || ''}`.toLowerCase();
      let score = 0;

      for (const keyword of keywords) {
        const keywordLower = keyword.toLowerCase();
        const occurrences = (articleText.match(new RegExp(keywordLower, 'g')) || []).length;
        score += occurrences;
        
        // Bonus si le mot-clé est dans le titre
        if (article.title.toLowerCase().includes(keywordLower)) {
          score += 5;
        }
        
        // Bonus si le mot-clé est dans les catégories
        if (article.categories?.some(cat => cat.toLowerCase().includes(keywordLower))) {
          score += 3;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = article;
      }
    }

    return bestScore > 0 ? bestMatch : null;
  }

  public processContent(content: string, currentArticleId?: string): string {
    if (!content) return content;

    let processedContent = content;
    let addedLinks = 0;
    const existingLinks = new Set<string>();
    
    // Extraire les liens existants pour les respecter
    if (this.config.respectExistingLinks) {
      const existingLinkMatches = content.match(/<a[^>]*href=['\"]([^'\"]*?)['\"][^>]*>/gi);
      if (existingLinkMatches) {
        existingLinkMatches.forEach(match => {
          const urlMatch = match.match(/href=['\"]([^'\"]*?)['\"]/i);
          if (urlMatch) {
            existingLinks.add(urlMatch[1]);
          }
        });
      }
    }

    // Exclure le premier paragraphe si configuré
    let contentToProcess = processedContent;
    let firstParagraph = '';
    
    if (this.config.excludeFirstParagraph) {
      const firstParagraphMatch = content.match(/^(.*?(?:\n\s*\n|$))/s);
      if (firstParagraphMatch) {
        firstParagraph = firstParagraphMatch[1];
        contentToProcess = content.slice(firstParagraph.length);
      }
    }

    // Appliquer les règles de linking
    for (const rule of this.rules) {
      if (addedLinks >= (this.config.maxLinksPerArticle || 5)) break;

      const targetUrl = rule.targetUrl || rule.targetArticle;
      if (!targetUrl) continue;

      // Éviter les liens vers l'article courant
      if (currentArticleId && rule.targetArticle === `/article/${currentArticleId}`) {
        continue;
      }

      // Éviter les doublons de liens
      if (existingLinks.has(targetUrl)) continue;

      const linkText = rule.linkText || rule.keywords[0];
      let occurrencesAdded = 0;
      const maxOccurrences = rule.maxOccurrences || 1;

      for (const keyword of rule.keywords) {
        if (occurrencesAdded >= maxOccurrences) break;

        const regex = new RegExp(`\\b${this.escapeRegExp(keyword)}\\b`, 'gi');
        const matches = [...contentToProcess.matchAll(regex)];
        
        for (const match of matches) {
          if (occurrencesAdded >= maxOccurrences) break;
          if (addedLinks >= (this.config.maxLinksPerArticle || 5)) break;

          const matchIndex = match.index!;
          const matchText = match[0];

          // Vérifier qu'il n'y a pas déjà un lien proche
          if (this.hasNearbyLink(contentToProcess, matchIndex)) continue;

          // Remplacer la première occurrence non liée
          const beforeMatch = contentToProcess.slice(0, matchIndex);
          const afterMatch = contentToProcess.slice(matchIndex + matchText.length);
          
          const isExternal = targetUrl.startsWith('http');
          const linkHtml = isExternal 
            ? `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">${linkText}</a>`
            : `<a href="${targetUrl}" class="text-blue-600 hover:text-blue-700 underline">${linkText}</a>`;

          contentToProcess = beforeMatch + linkHtml + afterMatch;
          
          existingLinks.add(targetUrl);
          occurrencesAdded++;
          addedLinks++;
          break; // Une seule occurrence par mot-clé
        }
      }
    }

    // Recombiner avec le premier paragraphe si nécessaire
    return this.config.excludeFirstParagraph 
      ? firstParagraph + contentToProcess 
      : contentToProcess;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private hasNearbyLink(content: string, position: number): boolean {
    const minDistance = this.config.minWordsBetweenLinks || 50;
    const beforeText = content.slice(Math.max(0, position - minDistance * 5), position);
    const afterText = content.slice(position, position + minDistance * 5);
    
    return beforeText.includes('<a ') || beforeText.includes('</a>') ||
           afterText.includes('<a ') || afterText.includes('</a>');
  }

  // Méthode pour obtenir des suggestions de liens pour un article
  public getSuggestedLinks(article: Article): Array<{keyword: string, targetUrl: string, linkText: string}> {
    const suggestions: Array<{keyword: string, targetUrl: string, linkText: string}> = [];
    const articleText = `${article.title} ${article.excerpt} ${article.content || ''}`.toLowerCase();

    for (const rule of this.rules) {
      const targetUrl = rule.targetUrl || rule.targetArticle;
      if (!targetUrl) continue;

      for (const keyword of rule.keywords) {
        if (articleText.includes(keyword.toLowerCase())) {
          suggestions.push({
            keyword,
            targetUrl,
            linkText: rule.linkText || keyword
          });
          break; // Une suggestion par règle
        }
      }
    }

    return suggestions.slice(0, 10); // Limiter à 10 suggestions
  }
}

// Service singleton pour l'utilisation globale
let linkingServiceInstance: InternalLinkingService | null = null;

export const getInternalLinkingService = (articles?: Article[]): InternalLinkingService => {
  if (!linkingServiceInstance || (articles && articles.length > 0)) {
    linkingServiceInstance = new InternalLinkingService(articles || []);
  }
  return linkingServiceInstance;
};

// Hook pour l'utilisation dans les composants React
export const useInternalLinking = (articles: Article[] = []) => {
  const service = getInternalLinkingService(articles);
  
  const processArticleContent = (content: string, currentArticleId?: string) => {
    return service.processContent(content, currentArticleId);
  };

  const getSuggestions = (article: Article) => {
    return service.getSuggestedLinks(article);
  };

  return { processArticleContent, getSuggestions };
};