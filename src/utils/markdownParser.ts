import { marked } from 'marked';

/**
 * Parse le contenu Markdown basique pour convertir **texte** en <strong>texte</strong>
 * et autres syntaxes Markdown courantes en HTML
 */
export const parseMarkdownToHtml = (content: string): string => {
  if (!content) return '';

  // Configuration de marked pour être plus permissive avec le HTML existant
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: false, // Ne pas convertir les retours à la ligne simples en <br>
    sanitize: false, // Ne pas supprimer le HTML existant
  });

  // Parser le Markdown vers HTML
  try {
    return marked.parse(content) as string;
  } catch (error) {
    console.error('Erreur lors du parsing Markdown:', error);
    
    // Fallback: parser seulement le gras **texte** manuellement
    return content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }
};

/**
 * Parser léger pour convertir seulement la syntaxe de gras **texte** → <strong>texte</strong>
 * Utilisé comme fallback plus sûr
 */
export const parseBasicMarkdown = (content: string): string => {
  if (!content) return '';
  
  return content
    // Gras: **texte** → <strong>texte</strong>
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italique: *texte* → <em>texte</em> (optionnel)
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
};