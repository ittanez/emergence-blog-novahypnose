
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
