/**
 * Hook pour la gestion du sitemap
 * Permet de générer et télécharger le sitemap depuis l'admin
 */

import { useState, useCallback } from 'react';
import { generateSitemap, validateSitemap } from '@/lib/services/sitemapService';

export const useSitemap = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sitemap, setSitemap] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Génère le sitemap
   */
  const generate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('🚀 Génération du sitemap...');
      const generatedSitemap = await generateSitemap();
      
      // Valider le sitemap
      const validation = validateSitemap(generatedSitemap);
      if (!validation.valid) {
        throw new Error(`Sitemap invalide: ${validation.errors.join(', ')}`);
      }
      
      setSitemap(generatedSitemap);
      console.log('✅ Sitemap généré avec succès');
      
      return generatedSitemap;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ Erreur génération sitemap:', errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Télécharge le sitemap généré
   */
  const download = useCallback(() => {
    if (!sitemap) {
      setError('Aucun sitemap à télécharger');
      return;
    }

    try {
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sitemap.xml';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('📥 Sitemap téléchargé');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de téléchargement';
      setError(errorMessage);
      console.error('❌ Erreur téléchargement:', errorMessage);
    }
  }, [sitemap]);

  /**
   * Copie le sitemap dans le presse-papier
   */
  const copy = useCallback(async () => {
    if (!sitemap) {
      setError('Aucun sitemap à copier');
      return;
    }

    try {
      await navigator.clipboard.writeText(sitemap);
      console.log('📋 Sitemap copié dans le presse-papier');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de copie';
      setError(errorMessage);
      console.error('❌ Erreur copie:', errorMessage);
    }
  }, [sitemap]);

  /**
   * Obtient les statistiques du sitemap
   */
  const getStats = useCallback(() => {
    if (!sitemap) return null;

    const urlCount = (sitemap.match(/<url>/g) || []).length;
    const sizeInBytes = new Blob([sitemap]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);

    return {
      urlCount,
      sizeInBytes,
      sizeInKB,
      lastGenerated: new Date().toISOString()
    };
  }, [sitemap]);

  return {
    sitemap,
    isGenerating,
    error,
    generate,
    download,
    copy,
    getStats,
    // Utility functions
    clearError: () => setError(null),
    clearSitemap: () => setSitemap(null)
  };
};