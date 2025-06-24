// Script pour récupérer les métriques d'engagement depuis Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://akrlyzmfszumibwgocae.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcmx5em1mc3p1bWlid2dvY2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjUyNDcsImV4cCI6MjA1ODM0MTI0N30.UDVk1wzm36OJGK0usCHEtvmkC2QxABvG9KQ8p2lKz30";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function getMetricsThisWeek() {
  console.log('📊 MÉTRIQUES D\'ENGAGEMENT - NOVAHYPNOSE.FR');
  console.log('=' .repeat(50));
  console.log('');

  // Calculer les dates de cette semaine
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Dernier lundi
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startDate = startOfWeek.toISOString();
  const endDate = new Date().toISOString();
  
  console.log(`📅 Période analysée: ${startDate.split('T')[0]} → ${endDate.split('T')[0]}`);
  console.log('');

  try {
    // 1. Nouveaux abonnés newsletter cette semaine
    const { data: newSubscribers, error: subsError } = await supabase
      .from('subscribers')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (subsError) {
      console.log('⚠️  Table subscribers:', subsError.message);
    } else {
      console.log(`📧 NEWSLETTER:`);
      console.log(`   Nouveaux abonnés cette semaine: ${newSubscribers?.length || 0}`);
      
      if (newSubscribers && newSubscribers.length > 0) {
        console.log(`   Détail par jour:`);
        const dailyData = {};
        newSubscribers.forEach(sub => {
          const date = sub.created_at.split('T')[0];
          dailyData[date] = (dailyData[date] || 0) + 1;
        });
        Object.entries(dailyData).forEach(([date, count]) => {
          console.log(`     ${date}: ${count} nouveaux abonnés`);
        });
      }
    }
    console.log('');

    // 2. Articles publiés cette semaine
    const { data: recentArticles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .gte('published_at', startDate)
      .lte('published_at', endDate)
      .eq('status', 'published');

    if (articlesError) {
      console.log('⚠️  Table articles:', articlesError.message);
    } else {
      console.log(`📝 CONTENU:`);
      console.log(`   Articles publiés cette semaine: ${recentArticles?.length || 0}`);
      
      if (recentArticles && recentArticles.length > 0) {
        recentArticles.forEach(article => {
          console.log(`     - ${article.title} (${article.published_at.split('T')[0]})`);
        });
      }
    }
    console.log('');

    // 3. Logs d'emails cette semaine
    const { data: emailLogs, error: emailError } = await supabase
      .from('email_logs')
      .select('*')
      .gte('sent_at', startDate)
      .lte('sent_at', endDate);

    if (emailError) {
      console.log('⚠️  Table email_logs:', emailError.message);
    } else {
      console.log(`📬 EMAILS:`);
      console.log(`   Emails envoyés cette semaine: ${emailLogs?.length || 0}`);
      
      if (emailLogs && emailLogs.length > 0) {
        const statusCounts = {};
        emailLogs.forEach(log => {
          statusCounts[log.status || 'unknown'] = (statusCounts[log.status || 'unknown'] || 0) + 1;
        });
        
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`     ${status}: ${count} emails`);
        });
      }
    }
    console.log('');

    // 4. Statistiques globales
    const { data: allSubscribers } = await supabase
      .from('subscribers')
      .select('*');

    const { data: allArticles } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published');

    console.log(`📊 STATISTIQUES GLOBALES:`);
    console.log(`   Total abonnés newsletter: ${allSubscribers?.length || 0}`);
    console.log(`   Total articles publiés: ${allArticles?.length || 0}`);
    
    if (allSubscribers && allSubscribers.length > 0) {
      const verified = allSubscribers.filter(s => s.verified).length;
      console.log(`   Abonnés vérifiés: ${verified} (${((verified/allSubscribers.length)*100).toFixed(1)}%)`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécution
getMetricsThisWeek();