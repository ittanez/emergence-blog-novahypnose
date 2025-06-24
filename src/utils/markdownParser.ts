/**
 * Parse le contenu pour corriger les problèmes de formatage
 * - Convertit **texte** en <strong>texte</strong>
 * - Corrige les apostrophes doublées
 */
export const parseMarkdownToHtml = (content: string): string => {
  if (!content) return '';

  let processed = content;

  // 1. Corriger les problèmes d'encodage et apostrophes
  processed = processed
    // Apostrophes doublées '' → '
    .replace(/''/g, "'")
    // Apostrophes typographiques → apostrophe simple
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    // Guillemets problématiques
    .replace(/"/g, '"')
    .replace(/"/g, '"');

  // 2. Convertir la syntaxe Markdown vers HTML
  // Gras: **texte** → <strong>texte</strong>
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italique: *texte* → <em>texte</em> (mais pas si c'est déjà des **)
  processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  return processed;
};

/**
 * Parser léger pour convertir seulement la syntaxe de gras **texte** → <strong>texte</strong>
 * et corriger les apostrophes
 */
export const parseBasicMarkdown = (content: string): string => {
  if (!content) return '';
  
  return content
    // Corriger apostrophes doublées
    .replace(/''/g, "'")
    // Gras: **texte** → <strong>texte</strong>
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italique: *texte* → <em>texte</em>
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
};