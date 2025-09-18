#!/usr/bin/env node
/**
 * Script de vérification sécurité périodique
 * À exécuter via cron/tâche planifiée toutes les heures
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://akrlyzmfszumibwgocae.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE'
);

class PeriodicSecurityChecker {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    this.adminEmail = process.env.ADMIN_EMAIL || 'a.zenatti@gmail.com';
    this.lastCheckFile = 'last-security-check.json';
  }

  async getLastCheck() {
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(this.lastCheckFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() };
    }
  }

  async saveLastCheck(data) {
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(this.lastCheckFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erreur sauvegarde last check:', error.message);
    }
  }

  async checkNewAdminUsers() {
    try {
      const lastCheck = await this.getLastCheck();

      const { data: newAdmins, error } = await supabase
        .from('admin_users')
        .select('email, created_at, role')
        .gte('created_at', lastCheck.timestamp)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (newAdmins && newAdmins.length > 0) {
        await this.sendAlert({
          type: 'critical',
          title: '🚨 NOUVEAUX UTILISATEURS ADMIN DÉTECTÉS',
          message: `${newAdmins.length} nouveau(x) administrateur(s) créé(s)`,
          details: newAdmins.map(admin =>
            `• ${admin.email} (${admin.role}) - ${new Date(admin.created_at).toLocaleString('fr-FR')}`
          ),
          action: 'Vérifiez immédiatement si ces créations sont autorisées'
        });
      }

      return { newAdmins: newAdmins?.length || 0 };
    } catch (error) {
      console.error('Erreur vérification admins:', error.message);
      return { error: error.message };
    }
  }

  async checkSuspiciousActivity() {
    try {
      const lastCheck = await this.getLastCheck();

      // Vérifier les nouveaux abonnés en masse
      const { data: newSubscribers, error } = await supabase
        .from('subscribers')
        .select('email, created_at, confirmed')
        .gte('created_at', lastCheck.timestamp)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const unconfirmedCount = newSubscribers?.filter(s => !s.confirmed).length || 0;
      const totalNew = newSubscribers?.length || 0;

      // Alerte si plus de 50 nouveaux abonnés en 1h ou plus de 80% non confirmés
      if (totalNew > 50 || (totalNew > 10 && unconfirmedCount / totalNew > 0.8)) {
        await this.sendAlert({
          type: 'medium',
          title: '⚠️ ACTIVITÉ SUSPECTE DÉTECTÉE',
          message: `${totalNew} nouveaux abonnés, ${unconfirmedCount} non confirmés`,
          details: [
            `• Total nouveaux abonnés: ${totalNew}`,
            `• Non confirmés: ${unconfirmedCount} (${Math.round(unconfirmedCount/totalNew*100)}%)`,
            `• Période: depuis ${new Date(lastCheck.timestamp).toLocaleString('fr-FR')}`
          ],
          action: 'Vérifiez si cette croissance est naturelle ou suspecte'
        });
      }

      return {
        newSubscribers: totalNew,
        unconfirmed: unconfirmedCount,
        suspiciousRatio: totalNew > 0 ? unconfirmedCount / totalNew : 0
      };
    } catch (error) {
      console.error('Erreur vérification activité:', error.message);
      return { error: error.message };
    }
  }

  async checkArticleModifications() {
    try {
      const lastCheck = await this.getLastCheck();

      const { data: modifiedArticles, error } = await supabase
        .from('articles')
        .select('title, updated_at, author, published')
        .gte('updated_at', lastCheck.timestamp)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const publishedModifications = modifiedArticles?.filter(a => a.published) || [];

      if (publishedModifications.length > 0) {
        await this.sendAlert({
          type: 'low',
          title: '📝 MODIFICATIONS D\'ARTICLES PUBLIÉS',
          message: `${publishedModifications.length} article(s) publié(s) modifié(s)`,
          details: publishedModifications.slice(0, 5).map(article =>
            `• "${article.title}" par ${article.author} - ${new Date(article.updated_at).toLocaleString('fr-FR')}`
          ),
          action: 'Vérifiez que ces modifications sont intentionnelles'
        });
      }

      return {
        totalModified: modifiedArticles?.length || 0,
        publishedModified: publishedModifications.length
      };
    } catch (error) {
      console.error('Erreur vérification articles:', error.message);
      return { error: error.message };
    }
  }

  async sendAlert(alert) {
    const alertData = {
      timestamp: new Date().toISOString(),
      project: 'emergence-blog-novahypnose',
      ...alert
    };

    // Console log
    console.log(`\n🚨 ALERTE ${alert.type.toUpperCase()}:`);
    console.log(`📌 ${alert.title}`);
    console.log(`💬 ${alert.message}`);
    if (alert.details?.length) {
      alert.details.forEach(detail => console.log(detail));
    }
    console.log(`🔗 Dashboard: https://supabase.com/dashboard/project/akrlyzmfszumibwgocae`);
    console.log(`⚡ Action: ${alert.action}\n`);

    // Webhook Discord/Slack (si configuré)
    if (this.webhookUrl) {
      try {
        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `${this.getEmojiForType(alert.type)} **${alert.title}**\n\n` +
                    `**Projet:** emergence-blog-novahypnose\n` +
                    `**Message:** ${alert.message}\n` +
                    (alert.details ? alert.details.join('\n') + '\n' : '') +
                    `**Action:** ${alert.action}\n\n` +
                    `🔗 [Dashboard Supabase](https://supabase.com/dashboard/project/akrlyzmfszumibwgocae)`
          })
        });

        if (response.ok) {
          console.log('✅ Alerte webhook envoyée');
        }
      } catch (error) {
        console.error('❌ Erreur envoi webhook:', error.message);
      }
    }

    return alertData;
  }

  getEmojiForType(type) {
    const emojis = {
      critical: '🚨',
      high: '⚠️',
      medium: '🔍',
      low: 'ℹ️'
    };
    return emojis[type] || '📋';
  }

  async runPeriodicCheck() {
    console.log('🔍 === VÉRIFICATION SÉCURITÉ PÉRIODIQUE ===');
    console.log('⏰ Heure:', new Date().toLocaleString('fr-FR'));
    console.log('🔗 Projet: emergence-blog-novahypnose\n');

    const results = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Vérifications en parallèle
    const [adminCheck, activityCheck, articleCheck] = await Promise.all([
      this.checkNewAdminUsers(),
      this.checkSuspiciousActivity(),
      this.checkArticleModifications()
    ]);

    results.checks = {
      newAdmins: adminCheck,
      suspiciousActivity: activityCheck,
      articleModifications: articleCheck
    };

    // Résumé
    console.log('📊 === RÉSUMÉ ===');
    console.log(`👥 Nouveaux admins: ${adminCheck.newAdmins || 0}`);
    console.log(`📧 Nouveaux abonnés: ${activityCheck.newSubscribers || 0}`);
    console.log(`📝 Articles modifiés: ${articleCheck.totalModified || 0}`);

    // Calculer score de risque
    let riskScore = 0;
    if (adminCheck.newAdmins > 0) riskScore += 50;
    if (activityCheck.suspiciousRatio > 0.8) riskScore += 30;
    if (activityCheck.newSubscribers > 100) riskScore += 20;

    console.log(`🎯 Score de risque: ${riskScore}/100`);

    if (riskScore === 0) {
      console.log('✅ Aucune activité suspecte détectée');
    } else if (riskScore < 30) {
      console.log('🟡 Surveillance recommandée');
    } else if (riskScore < 70) {
      console.log('🟠 Attention requise');
    } else {
      console.log('🔴 Action immédiate recommandée');
    }

    // Sauvegarder timestamp pour la prochaine vérification
    await this.saveLastCheck(results);

    console.log('\n✅ Vérification terminée\n');
    return results;
  }
}

// Configuration tâche planifiée
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new PeriodicSecurityChecker();

  // Mode démon (vérification continue)
  if (process.argv.includes('--daemon')) {
    console.log('🤖 Démarrage mode démon (vérification toutes les heures)');

    setInterval(async () => {
      try {
        await checker.runPeriodicCheck();
      } catch (error) {
        console.error('❌ Erreur vérification périodique:', error);
      }
    }, 60 * 60 * 1000); // Toutes les heures

    // Première vérification immédiate
    checker.runPeriodicCheck();
  } else {
    // Mode one-shot
    checker.runPeriodicCheck()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('❌ Erreur:', error);
        process.exit(1);
      });
  }
}

export default PeriodicSecurityChecker;