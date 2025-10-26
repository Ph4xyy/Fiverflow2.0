import { AdminUser } from './adminUserService'

export interface ExportData {
  users: AdminUser[]
  adminRevenue: number
  totalRevenue: number
  stats: {
    totalUsers: number
    premiumUsers: number
    conversionRate: number
  }
}

export class ExportService {
  static exportToExcel(data: ExportData, exportType: 'global' | 'stats' | 'user' = 'global', username?: string): void {
    // Créer le contenu CSV
    const csvContent = this.generateCSV(data)
    
    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    
    // Nom du fichier selon le type d'export
    let filename = ''
    const date = new Date().toISOString().split('T')[0]
    
    switch (exportType) {
      case 'global':
        filename = `admin-globaluser-export-${date}.csv`
        break
      case 'stats':
        filename = `admin-stats-export-${date}.csv`
        break
      case 'user':
        filename = `admin-user-${username || 'unknown'}-export-${date}.csv`
        break
      default:
        filename = `admin-export-${date}.csv`
    }
    
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  private static generateCSV(data: ExportData): string {
    const headers = [
      'ID',
      'Email',
      'Nom Complet',
      'Rôle',
      'Plan d\'Abonnement',
      'Statut',
      'Date d\'Inscription',
      'Total Dépensé',
      'Dépensé ce Mois',
      'Commandes Totales',
      'Dernière Activité'
    ]

    const rows = data.users.map(user => [
      user.id,
      user.email,
      user.full_name || 'N/A',
      user.role || 'user',
      user.subscription_plan || 'free',
      user.is_active ? 'Actif' : 'Inactif',
      new Date(user.created_at).toLocaleDateString('fr-FR'),
      user.total_spent?.toFixed(2) || '0.00',
      user.monthly_spent?.toFixed(2) || '0.00',
      user.total_orders || 0,
      user.last_activity ? new Date(user.last_activity).toLocaleDateString('fr-FR') : 'Jamais'
    ])

    // Ajouter les statistiques en bas
    const statsRows = [
      [],
      ['=== STATISTIQUES ==='],
      ['Total Utilisateurs', data.stats.totalUsers],
      ['Utilisateurs Payants', data.stats.premiumUsers],
      ['Taux de Conversion', `${data.stats.conversionRate.toFixed(2)}%`],
      [],
      ['=== REVENUS ==='],
      ['Revenus Totaux', `${data.totalRevenue.toFixed(2)} USD`],
      ['Revenus Admin (Boost/Scale)', `${data.adminRevenue.toFixed(2)} USD`],
      ['Revenus Utilisateurs', `${(data.totalRevenue - data.adminRevenue).toFixed(2)} USD`]
    ]

    const allRows = [headers, ...rows, ...statsRows]
    
    return allRows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }
}
