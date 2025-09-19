import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface SecurityEvent {
  type: 'auth' | 'database' | 'api'
  event: string
  user_id?: string
  ip_address?: string
  timestamp: string
  metadata?: any
}

interface AlertRule {
  name: string
  condition: (events: SecurityEvent[]) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
}

class SecurityMonitor {
  private alertRules: AlertRule[] = [
    {
      name: 'Multiple Failed Logins',
      condition: (events) => {
        const failedLogins = events.filter(e =>
          e.type === 'auth' &&
          e.event === 'user.failed_login' &&
          Date.now() - new Date(e.timestamp).getTime() < 300000 // 5 minutes
        )
        return failedLogins.length >= 5
      },
      severity: 'high',
      message: 'Détection de tentatives de connexion multiples échouées'
    },
    {
      name: 'Admin User Created',
      condition: (events) => {
        return events.some(e =>
          e.type === 'database' &&
          e.event === 'INSERT' &&
          e.metadata?.table === 'admin_users'
        )
      },
      severity: 'critical',
      message: 'Nouvel utilisateur administrateur créé'
    },
    {
      name: 'Unusual API Usage',
      condition: (events) => {
        const apiCalls = events.filter(e =>
          e.type === 'api' &&
          Date.now() - new Date(e.timestamp).getTime() < 3600000 // 1 hour
        )
        return apiCalls.length > 1000 // Plus de 1000 appels par heure
      },
      severity: 'medium',
      message: 'Usage API anormalement élevé détecté'
    },
    {
      name: 'Suspicious IP Activity',
      condition: (events) => {
        const suspiciousIPs = ['127.0.0.1', 'unknown']
        return events.some(e =>
          e.ip_address && suspiciousIPs.includes(e.ip_address)
        )
      },
      severity: 'medium',
      message: 'Activité depuis une IP suspecte'
    }
  ]

  async sendAlert(alert: {rule: AlertRule, events: SecurityEvent[]}) {
    const webhook_url = Deno.env.get('SECURITY_WEBHOOK_URL')
    const email_service = Deno.env.get('EMAIL_SERVICE_URL')

    const alertData = {
      project: 'emergence-blog-novahypnose',
      severity: alert.rule.severity,
      message: alert.rule.message,
      rule: alert.rule.name,
      timestamp: new Date().toISOString(),
      events_count: alert.events.length,
      events: alert.events.slice(0, 5) // Premiers 5 événements
    }

    // Webhook Discord/Slack
    if (webhook_url) {
      try {
        await fetch(webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **Alerte Sécurité - ${alert.rule.severity.toUpperCase()}**\n\n` +
                    `**Projet:** emergence-blog-novahypnose\n` +
                    `**Règle:** ${alert.rule.name}\n` +
                    `**Message:** ${alert.rule.message}\n` +
                    `**Événements:** ${alert.events.length}\n` +
                    `**Heure:** ${new Date().toLocaleString('fr-FR')}`
          })
        })
      } catch (error) {
        console.error('Erreur envoi webhook:', error)
      }
    }

    // Service email
    if (email_service) {
      try {
        await fetch(email_service, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: Deno.env.get('ADMIN_EMAIL'),
            subject: `🚨 Alerte Sécurité - ${alert.rule.name}`,
            html: `
              <h2>Alerte de Sécurité</h2>
              <p><strong>Projet:</strong> emergence-blog-novahypnose</p>
              <p><strong>Règle déclenchée:</strong> ${alert.rule.name}</p>
              <p><strong>Sévérité:</strong> ${alert.rule.severity}</p>
              <p><strong>Message:</strong> ${alert.rule.message}</p>
              <p><strong>Nombre d'événements:</strong> ${alert.events.length}</p>
              <p><strong>Heure:</strong> ${new Date().toLocaleString('fr-FR')}</p>

              <h3>Premiers Événements:</h3>
              <ul>
                ${alert.events.slice(0, 3).map(e =>
                  `<li>${e.type} - ${e.event} - ${e.timestamp}</li>`
                ).join('')}
              </ul>

              <p><a href="https://supabase.com/dashboard/project/akrlyzmfszumibwgocae">Voir le Dashboard Supabase</a></p>
            `
          })
        })
      } catch (error) {
        console.error('Erreur envoi email:', error)
      }
    }

    console.log('🚨 Alerte envoyée:', alertData)
  }

  async processEvents(events: SecurityEvent[]) {
    for (const rule of this.alertRules) {
      if (rule.condition(events)) {
        const relevantEvents = events.filter(e => {
          // Logique pour filtrer les événements pertinents pour cette règle
          switch (rule.name) {
            case 'Multiple Failed Logins':
              return e.type === 'auth' && e.event === 'user.failed_login'
            case 'Admin User Created':
              return e.type === 'database' && e.metadata?.table === 'admin_users'
            case 'Unusual API Usage':
              return e.type === 'api'
            case 'Suspicious IP Activity':
              return e.ip_address && ['127.0.0.1', 'unknown'].includes(e.ip_address)
            default:
              return true
          }
        })

        await this.sendAlert({ rule, events: relevantEvents })
      }
    }
  }
}

serve(async (req) => {
  const url = new URL(req.url)

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (url.pathname === '/webhook' && req.method === 'POST') {
      // Webhook pour recevoir les événements Supabase
      const payload = await req.json()

      const event: SecurityEvent = {
        type: payload.type || 'api',
        event: payload.event || 'unknown',
        user_id: payload.user_id,
        ip_address: payload.ip_address,
        timestamp: payload.timestamp || new Date().toISOString(),
        metadata: payload.metadata
      }

      // Stocker l'événement (ici on pourrait utiliser une base de données)
      // Pour ce prototype, on traite directement
      const monitor = new SecurityMonitor()
      await monitor.processEvents([event])

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (url.pathname === '/health' && req.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'security-alerts'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (url.pathname === '/test-alert' && req.method === 'POST') {
      // Endpoint pour tester les alertes
      const monitor = new SecurityMonitor()
      const testEvent: SecurityEvent = {
        type: 'auth',
        event: 'user.failed_login',
        user_id: 'test-user',
        ip_address: '127.0.0.1',
        timestamp: new Date().toISOString()
      }

      await monitor.processEvents([testEvent])

      return new Response(JSON.stringify({
        message: 'Alerte de test envoyée',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders
    })

  } catch (error: any) {
    console.error('Erreur dans security-alerts:', error)

    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})