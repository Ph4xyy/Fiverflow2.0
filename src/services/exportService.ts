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
  static exportToExcel(data: ExportData): void {
    // Créer le contenu CSV
    const csvContent = this.generateCSV(data)
    
    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `fiverflow-users-export-${new Date().toISOString().split('T')[0]}.csv`)
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
