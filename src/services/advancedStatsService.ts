import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export interface AdvancedStats {
  // Statistiques générales
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  newUsersThisMonth: number
  newUsersThisWeek: number
  
  // Statistiques financières
  totalRevenue: number
  monthlyRevenue: number
  weeklyRevenue: number
  averageRevenuePerUser: number
  conversionRate: number
  
  // Statistiques par plan
  planBreakdown: Record<string, {
    name: string
    count: number
    revenue: number
    percentage: number
  }>
  
  // Statistiques temporelles
  revenueByMonth: Array<{
    month: string
    revenue: number
    users: number
  }>
  
  // Statistiques de croissance
  userGrowthRate: number
  revenueGrowthRate: number
  
  // Statistiques d'engagement
  averageSessionDuration: number
  activeUsersLast7Days: number
  churnRate: number
  
  // Revenus admin (pour export séparé)
  adminRevenue: number
}

class AdvancedStatsService {
  private supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  async getAdvancedStats(): Promise<AdvancedStats> {
    try {
      // Statistiques générales
      const { count: totalUsers } = await this.supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      const { count: activeUsers } = await this.supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Nouveaux utilisateurs ce mois
      const currentMonth = new Date()
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const { count: newUsersThisMonth } = await this.supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

      // Nouveaux utilisateurs cette semaine
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - 7)
      const { count: newUsersThisWeek } = await this.supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString())

      // Statistiques d'abonnements
      const { data: subscriptions } = await this.supabaseAdmin
        .from('user_subscriptions')
        .select(`
          amount,
          billing_cycle,
          created_at,
          status,
          subscription_plans (
            name,
            display_name,
            price_monthly
          )
        `)
        .eq('status', 'active')

      // Utilisateurs avec abonnement payant (Boost/Scale uniquement)
  const premiumUsers = subscriptions?.filter(sub => {
    const planName = sub.subscription_plans?.name
    return planName === 'boost' || planName === 'scale'
  }).length || 0

      // Calcul des revenus (exclure Launch gratuit et Admin)
      const totalRevenue = subscriptions?.filter(sub => {
        const planName = sub.subscription_plans?.name
        return planName === 'boost' || planName === 'scale'
      }).reduce((sum, sub) => {
        const amount = sub.amount || 0
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        return sum + monthlyAmount
      }, 0) || 0

      // Revenus du mois en cours (exclure Launch gratuit et Admin)
      const monthlyRevenue = subscriptions?.filter(sub => {
        const planName = sub.subscription_plans?.name
        const subDate = new Date(sub.created_at)
        return (planName === 'boost' || planName === 'scale') &&
               subDate.getMonth() === currentMonth.getMonth() && 
               subDate.getFullYear() === currentMonth.getFullYear()
      }).reduce((sum, sub) => {
        const amount = sub.amount || 0
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        return sum + monthlyAmount
      }, 0) || 0

      // Revenus de la semaine (exclure Launch gratuit et Admin)
      const weeklyRevenue = subscriptions?.filter(sub => {
        const planName = sub.subscription_plans?.name
        const subDate = new Date(sub.created_at)
        return (planName === 'boost' || planName === 'scale') &&
               subDate >= startOfWeek
      }).reduce((sum, sub) => {
        const amount = sub.amount || 0
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        return sum + monthlyAmount
      }, 0) || 0

      // Statistiques par plan (exclure Launch gratuit et Admin)
      const planBreakdown = subscriptions?.filter(sub => {
        const planName = sub.subscription_plans?.name
        return planName === 'boost' || planName === 'scale'
      }).reduce((acc, sub) => {
        const planName = sub.subscription_plans?.name || 'unknown'
        if (!acc[planName]) {
          acc[planName] = {
            name: sub.subscription_plans?.display_name || planName,
            count: 0,
            revenue: 0,
            percentage: 0
          }
        }
        acc[planName].count += 1
        const amount = sub.amount || 0
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        acc[planName].revenue += monthlyAmount
        return acc
      }, {} as Record<string, { name: string; count: number; revenue: number; percentage: number }>) || {}

      // Calculer les pourcentages
      Object.values(planBreakdown).forEach(plan => {
        plan.percentage = totalUsers > 0 ? (plan.count / totalUsers) * 100 : 0
      })

      // Calculer les revenus admin séparément (pour l'export)
      const adminRevenue = subscriptions?.filter(sub => {
        const planName = sub.subscription_plans?.name
        return planName === 'boost' || planName === 'scale'
      }).reduce((sum, sub) => {
        const amount = sub.amount || 0
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        return sum + monthlyAmount
      }, 0) || 0

      // Statistiques temporelles (derniers 12 mois)
      const revenueByMonth = []
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        
        const monthSubscriptions = subscriptions?.filter(sub => {
          const subDate = new Date(sub.created_at)
          return subDate >= monthStart && subDate <= monthEnd
        }) || []

        const monthRevenue = monthSubscriptions.reduce((sum, sub) => {
          const amount = sub.amount || 0
          const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
          return sum + monthlyAmount
        }, 0)

        const monthUsers = monthSubscriptions.length

        revenueByMonth.push({
          month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          users: monthUsers
        })
      }

      // Calcul des taux de croissance
      const previousMonth = new Date()
      previousMonth.setMonth(previousMonth.getMonth() - 1)
      const previousMonthStart = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1)
      const previousMonthEnd = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0)
      
      const previousMonthUsers = await this.supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString())

      const userGrowthRate = previousMonthUsers.count && newUsersThisMonth 
        ? ((newUsersThisMonth - previousMonthUsers.count) / previousMonthUsers.count) * 100 
        : 0

      const previousMonthRevenue = subscriptions?.filter(sub => {
        const subDate = new Date(sub.created_at)
        return subDate >= previousMonthStart && subDate <= previousMonthEnd
      }).reduce((sum, sub) => {
        const amount = sub.amount || 0
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        return sum + monthlyAmount
      }, 0) || 0

      const revenueGrowthRate = previousMonthRevenue && monthlyRevenue 
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0

      // Statistiques d'engagement (simulées pour l'exemple)
      const averageSessionDuration = 15.5 // minutes
      const activeUsersLast7Days = Math.floor(activeUsers * 0.3) // 30% des utilisateurs actifs
      const churnRate = 5.2 // pourcentage

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        premiumUsers,
        newUsersThisMonth: newUsersThisMonth || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        averageRevenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0,
        conversionRate: totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0,
        planBreakdown,
        revenueByMonth,
        userGrowthRate,
        revenueGrowthRate,
        averageSessionDuration,
        activeUsersLast7Days,
        churnRate,
        adminRevenue
      }
    } catch (error) {
      console.error('Error fetching advanced stats:', error)
      throw error
    }
  }
}

export const advancedStatsService = new AdvancedStatsService()
