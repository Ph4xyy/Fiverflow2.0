/**
 * Discord Webhook Utility
 * Envoie des notifications Discord pour les événements importants
 */

interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: Array<{
    name: string
    value: string
    inline?: boolean
  }>
  footer?: {
    text: string
  }
  timestamp?: string
}

interface DiscordWebhookPayload {
  username?: string
  avatar_url?: string
  content?: string
  embeds?: DiscordEmbed[]
}

export class DiscordNotifier {
  private webhookUrl: string

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  /**
   * Envoie une notification Discord
   */
  async sendNotification(payload: DiscordWebhookPayload): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      return response.ok
    } catch (error) {
      console.error('Failed to send Discord notification:', error)
      return false
    }
  }

  /**
   * Notification pour nouveau paiement
   */
  async notifyNewPayment(data: {
    amount: number
    currency: string
    plan: string
    customerEmail: string
    customerName?: string
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '💰 Nouveau Paiement Reçu',
      description: `Un nouveau paiement a été effectué sur la plateforme`,
      color: 0x00ff00, // Green
      fields: [
        {
          name: 'Montant',
          value: `${data.amount.toFixed(2)} ${data.currency.toUpperCase()}`,
          inline: true
        },
        {
          name: 'Plan',
          value: data.plan,
          inline: true
        },
        {
          name: 'Client',
          value: data.customerName || data.customerEmail,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    }

    return this.sendNotification({
      username: 'FiverFlow Bot',
      embeds: [embed]
    })
  }

  /**
   * Notification pour échec de paiement
   */
  async notifyPaymentFailed(data: {
    amount: number
    currency: string
    customerEmail: string
    reason?: string
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '❌ Échec de Paiement',
      description: `Un paiement a échoué`,
      color: 0xff0000, // Red
      fields: [
        {
          name: 'Montant',
          value: `${data.amount.toFixed(2)} ${data.currency.toUpperCase()}`,
          inline: true
        },
        {
          name: 'Client',
          value: data.customerEmail,
          inline: true
        },
        ...(data.reason ? [{
          name: 'Raison',
          value: data.reason,
          inline: false
        }] : [])
      ],
      timestamp: new Date().toISOString()
    }

    return this.sendNotification({
      username: 'FiverFlow Bot',
      embeds: [embed]
    })
  }

  /**
   * Notification pour annulation d'abonnement
   */
  async notifySubscriptionCancelled(data: {
    customerEmail: string
    plan: string
    reason?: string
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '🚫 Abonnement Annulé',
      description: `Un abonnement a été annulé`,
      color: 0xffaa00, // Orange
      fields: [
        {
          name: 'Plan',
          value: data.plan,
          inline: true
        },
        {
          name: 'Client',
          value: data.customerEmail,
          inline: true
        },
        ...(data.reason ? [{
          name: 'Raison',
          value: data.reason,
          inline: false
        }] : [])
      ],
      timestamp: new Date().toISOString()
    }

    return this.sendNotification({
      username: 'FiverFlow Bot',
      embeds: [embed]
    })
  }

  /**
   * Notification pour action admin importante
   */
  async notifyAdminAction(data: {
    action: string
    adminUser: string
    targetUser?: string
    details?: string
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '🔧 Action Admin',
      description: `Action administrative effectuée`,
      color: 0x3b82f6, // Blue
      fields: [
        {
          name: 'Action',
          value: data.action,
          inline: true
        },
        {
          name: 'Admin',
          value: data.adminUser,
          inline: true
        },
        ...(data.targetUser ? [{
          name: 'Utilisateur cible',
          value: data.targetUser,
          inline: true
        }] : []),
        ...(data.details ? [{
          name: 'Détails',
          value: data.details,
          inline: false
        }] : [])
      ],
      timestamp: new Date().toISOString()
    }

    return this.sendNotification({
      username: 'FiverFlow Bot',
      embeds: [embed]
    })
  }

  /**
   * Notification pour nouveau utilisateur premium
   */
  async notifyPremiumUser(data: {
    userEmail: string
    userName?: string
    plan: string
    amount: number
    currency: string
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '⭐ Nouvel Utilisateur Premium',
      description: `Un nouvel utilisateur premium s'est inscrit`,
      color: 0x8b5cf6, // Purple
      fields: [
        {
          name: 'Utilisateur',
          value: data.userName || data.userEmail,
          inline: true
        },
        {
          name: 'Plan',
          value: data.plan,
          inline: true
        },
        {
          name: 'Montant',
          value: `${data.amount.toFixed(2)} ${data.currency.toUpperCase()}`,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    }

    return this.sendNotification({
      username: 'FiverFlow Bot',
      embeds: [embed]
    })
  }

  /**
   * Notification pour statistiques quotidiennes
   */
  async notifyDailyStats(data: {
    newUsers: number
    revenue: number
    currency: string
    activeSubscriptions: number
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '📊 Statistiques Quotidiennes',
      description: `Résumé de la journée`,
      color: 0x10b981, // Green
      fields: [
        {
          name: 'Nouveaux Utilisateurs',
          value: data.newUsers.toString(),
          inline: true
        },
        {
          name: 'Revenus',
          value: `${data.revenue.toFixed(2)} ${data.currency.toUpperCase()}`,
          inline: true
        },
        {
          name: 'Abonnements Actifs',
          value: data.activeSubscriptions.toString(),
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    }

    return this.sendNotification({
      username: 'FiverFlow Bot',
      embeds: [embed]
    })
  }
}

// Instance globale
let discordNotifier: DiscordNotifier | null = null

export function getDiscordNotifier(): DiscordNotifier | null {
  if (!discordNotifier) {
    const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL
    if (webhookUrl) {
      discordNotifier = new DiscordNotifier(webhookUrl)
    }
  }
  return discordNotifier
}

export function setDiscordWebhook(webhookUrl: string): void {
  discordNotifier = new DiscordNotifier(webhookUrl)
}
