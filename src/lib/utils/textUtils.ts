
// Utilitaires pour le traitement du texte
export function stripHtml(html: string): string {
  // Crée un élément temporaire pour parser le HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

export function calculateReadTime(content: string): number {
  // Nettoie le contenu HTML et compte les mots
  const cleanText = stripHtml(content);
  const wordsPerMinute = 200;
  const wordCount = cleanText.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readTime); // Minimum 1 minute
}

export function createExcerpt(content: string, maxLength: number = 150): string {
  const cleanText = stripHtml(content);
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  return cleanText.substring(0, maxLength).trim() + '...';
}

// Fonction pour échapper les caractères spéciaux dans le JavaScript
export function escapeJavaScript(str: string): string {
  if (!str) return str;
  return str
    .replace(/\\/g, '\\\\')  // Échapper les backslashes
    .replace(/'/g, "\\'")    // Échapper les apostrophes
    .replace(/"/g, '\\"')    // Échapper les guillemets
    .replace(/\n/g, '\\n')   // Échapper les retours à la ligne
    .replace(/\r/g, '\\r')   // Échapper les retours chariot
    .replace(/\t/g, '\\t');  // Échapper les tabulations
}

// Fonction pour nettoyer et sécuriser les données avant utilisation
export function sanitizeData(data: any): any {
  if (typeof data === 'string') {
    return escapeJavaScript(data);
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }
  return data;
}
