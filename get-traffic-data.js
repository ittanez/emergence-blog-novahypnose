const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const fs = require('fs');

// Configuration
const credentials = JSON.parse(fs.readFileSync('/home/ittanez/.config/google-analytics/service-account-key.json', 'utf8'));
const propertyId = '462297863'; // ID de la propriété GA4 pour novahypnose.fr

// Initialiser le client
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: credentials,
});

async function getTrafficDataThisWeek() {
  try {
    console.log('🔍 Récupération des données de trafic de cette semaine...\n');
    
    // Dates pour cette semaine (lundi à aujourd'hui)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Dernier lundi
    
    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    console.log(`📅 Période analysée: ${startDate} → ${endDate}\n`);

    // Requête GA4 pour les données de trafic
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: startDate,
          endDate: endDate,
        },
      ],
      dimensions: [
        { name: 'date' },
        { name: 'country' },
        { name: 'deviceCategory' },
        { name: 'sessionSourceMedium' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'users' },
        { name: 'pageviews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViews' },
      ],
    });

    // Analyse des données
    console.log('📊 DONNÉES DE TRAFIC - CETTE SEMAINE\n');
    console.log('=' .repeat(50));
    
    let totalSessions = 0;
    let totalUsers = 0;
    let totalPageviews = 0;
    
    const dailyData = {};
    const countryData = {};
    const deviceData = {};
    const sourceData = {};
    
    response.rows.forEach(row => {
      const date = row.dimensionValues[0].value;
      const country = row.dimensionValues[1].value;
      const device = row.dimensionValues[2].value;
      const source = row.dimensionValues[3].value;
      
      const sessions = parseInt(row.metricValues[0].value) || 0;
      const users = parseInt(row.metricValues[1].value) || 0;
      const pageviews = parseInt(row.metricValues[2].value) || 0;
      
      totalSessions += sessions;
      totalUsers += users;
      totalPageviews += pageviews;
      
      // Agrégation par jour
      if (!dailyData[date]) {
        dailyData[date] = { sessions: 0, users: 0, pageviews: 0 };
      }
      dailyData[date].sessions += sessions;
      dailyData[date].users += users;
      dailyData[date].pageviews += pageviews;
      
      // Agrégation par pays
      countryData[country] = (countryData[country] || 0) + sessions;
      
      // Agrégation par device
      deviceData[device] = (deviceData[device] || 0) + sessions;
      
      // Agrégation par source
      sourceData[source] = (sourceData[source] || 0) + sessions;
    });
    
    // Affichage des résultats
    console.log(`🎯 RÉSUMÉ GLOBAL:`);
    console.log(`   Sessions totales: ${totalSessions}`);
    console.log(`   Utilisateurs uniques: ${totalUsers}`);
    console.log(`   Pages vues: ${totalPageviews}`);
    console.log(`   Taux de rebond moyen: ${response.rows.length > 0 ? (parseFloat(response.rows[0].metricValues[3].value) * 100).toFixed(2) : 0}%`);
    console.log('');
    
    console.log(`📅 TRAFIC PAR JOUR:`);
    Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, data]) => {
        console.log(`   ${date}: ${data.sessions} sessions, ${data.users} users, ${data.pageviews} pages`);
      });
    console.log('');
    
    console.log(`🌍 TOP PAYS:`);
    Object.entries(countryData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([country, sessions]) => {
        console.log(`   ${country}: ${sessions} sessions`);
      });
    console.log('');
    
    console.log(`📱 APPAREILS:`);
    Object.entries(deviceData)
      .sort(([,a], [,b]) => b - a)
      .forEach(([device, sessions]) => {
        console.log(`   ${device}: ${sessions} sessions`);
      });
    console.log('');
    
    console.log(`🚀 SOURCES DE TRAFIC:`);
    Object.entries(sourceData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([source, sessions]) => {
        console.log(`   ${source}: ${sessions} sessions`);
      });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données:', error.message);
    if (error.code === 'INVALID_ARGUMENT') {
      console.log('💡 Vérifiez que l\'ID de propriété GA4 est correct');
    }
  }
}

// Exécution
getTrafficDataThisWeek();