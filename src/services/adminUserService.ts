import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export interface AdminUser {
  id: string
  user_id: string
  email: string
  full_name?: string
  role?: string
  subscription_plan?: string
  subscription_status?: string
  is_active?: boolean
  is_admin?: boolean
  created_at: string
  last_activity?: string
  total_spent?: number
  monthly_spent?: number
  total_orders?: number
}

export interface UserRole {
  id: string
  name: string
  display_name: string
  description?: string
  permissions: string[]
}

export interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description?: string
  price_monthly: number
  price_yearly: number
  currency: string
  max_projects: number
  max_clients: number
  max_storage_gb: number
  max_team_members: number
  features: string[]
  is_active: boolean
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  billing_cycle: 'monthly' | 'yearly'
  start_date: string
  end_date?: string
  next_billing_date?: string
  cancelled_at?: string
  amount: number
  currency: string
}

class AdminUserService {
  private supabase = createClient(supabaseUrl, supabaseKey)

  // Récupérer tous les utilisateurs avec leurs rôles et abonnements
  async getUsers(params: {
    page?: number
    limit?: number
    search?: string
    role?: string
    subscription_plan?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  } = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      subscription_plan = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = params

    try {
      // Récupérer les utilisateurs avec leurs profils
      let query = this.supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          email,
          full_name,
          created_at,
          is_active,
          is_admin
        `)

      // Appliquer les filtres
      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
      }

      if (role) {
        query = query.eq('role', role)
      }

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      // Tri
      query = query.order(sort_by, { ascending: sort_order === 'asc' })

      const { data: users, error: usersError } = await query

      if (usersError) throw usersError

      // Pour chaque utilisateur, récupérer son rôle et abonnement
      const usersWithDetails = await Promise.all(
        users.map(async (user) => {
          // Récupérer le rôle
          const { data: userRole } = await this.supabase
            .from('user_roles')
            .select(`
              system_roles (
                name,
                display_name
              )
            `)
            .eq('user_id', user.user_id)
            .eq('is_active', true)
            .single()

          // Récupérer l'abonnement actuel
          const { data: subscription } = await this.supabase
            .from('user_subscriptions')
            .select(`
              status,
              billing_cycle,
              amount,
              currency,
              subscription_plans (
                name,
                display_name
              )
            `)
            .eq('user_id', user.user_id)
            .eq('status', 'active')
            .single()

          // Calculer les valeurs par défaut
          const role = userRole?.system_roles?.name || (user.is_admin ? 'admin' : 'user')
          const subscription_plan = subscription?.subscription_plans?.name || 'free'
          const subscription_status = subscription?.status || 'inactive'
          const total_spent = subscription?.amount || 0
          const monthly_spent = subscription?.amount || 0

          return {
            ...user,
            role,
            subscription_plan,
            subscription_status,
            total_spent,
            monthly_spent,
            total_orders: 0, // Valeur par défaut
            last_activity: user.created_at // Utiliser created_at comme fallback
          }
        })
      )

      // Compter le total pour la pagination
      const { count } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      return {
        users: usersWithDetails,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  // Récupérer tous les rôles disponibles
  async getRoles(): Promise<UserRole[]> {
    try {
      const { data, error } = await this.supabase
        .from('system_roles')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw error
    }
  }

  // Récupérer tous les plans d'abonnement disponibles
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
      throw error
    }
  }

  // Mettre à jour le rôle d'un utilisateur
  async updateUserRole(userId: string, newRole: string) {
    try {
      console.log('Updating user role:', { userId, newRole })
      
      // Récupérer l'ID du rôle
      const { data: roleData, error: roleError } = await this.supabase
        .from('system_roles')
        .select('id')
        .eq('name', newRole)
        .single()

      if (roleError) {
        console.error('Error fetching role:', roleError)
        throw new Error(`Erreur lors de la récupération du rôle: ${roleError.message}`)
      }
      if (!roleData) {
        throw new Error(`Rôle ${newRole} non trouvé`)
      }

      console.log('Role data found:', roleData)

      // Désactiver tous les rôles actuels de l'utilisateur
      const { error: deactivateError } = await this.supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)

      if (deactivateError) {
        console.error('Error deactivating roles:', deactivateError)
        throw new Error(`Erreur lors de la désactivation des rôles: ${deactivateError.message}`)
      }

      // Ajouter le nouveau rôle
      const { error: insertError } = await this.supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleData.id,
          is_active: true
        })

      if (insertError) {
        console.error('Error inserting new role:', insertError)
        throw new Error(`Erreur lors de l'ajout du nouveau rôle: ${insertError.message}`)
      }

      // Mettre à jour le profil utilisateur
      const { error: profileError } = await this.supabase
        .from('user_profiles')
        .update({ is_admin: newRole === 'admin' })
        .eq('user_id', userId)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        throw new Error(`Erreur lors de la mise à jour du profil: ${profileError.message}`)
      }

      console.log('Role updated successfully')
      return { success: true }
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  }

  // Mettre à jour l'abonnement d'un utilisateur
  async updateUserSubscription(userId: string, planName: string) {
    try {
      console.log('Updating user subscription:', { userId, planName })
      
      // Récupérer l'ID du plan
      const { data: planData, error: planError } = await this.supabase
        .from('subscription_plans')
        .select('id, price_monthly')
        .eq('name', planName)
        .single()

      if (planError) {
        console.error('Error fetching plan:', planError)
        throw new Error(`Erreur lors de la récupération du plan: ${planError.message}`)
      }
      if (!planData) {
        throw new Error(`Plan ${planName} non trouvé`)
      }

      console.log('Plan data found:', planData)

      // Désactiver l'abonnement actuel
      const { error: deactivateError } = await this.supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active')

      if (deactivateError) {
        console.error('Error deactivating subscription:', deactivateError)
        // Ne pas faire échouer si aucun abonnement actuel
        console.log('No active subscription to deactivate')
      }

      // Créer le nouvel abonnement
      const { error: insertError } = await this.supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planData.id,
          status: 'active',
          billing_cycle: 'monthly',
          amount: planData.price_monthly,
          currency: 'USD'
        })

      if (insertError) {
        console.error('Error inserting new subscription:', insertError)
        throw new Error(`Erreur lors de l'ajout du nouvel abonnement: ${insertError.message}`)
      }

      console.log('Subscription updated successfully')
      return { success: true }
    } catch (error) {
      console.error('Error updating user subscription:', error)
      throw error
    }
  }

  // Obtenir les statistiques des utilisateurs
  async getUserStats() {
    try {
      // Total utilisateurs
      const { count: totalUsers } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Utilisateurs actifs
      const { count: activeUsers } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Utilisateurs avec abonnement payant
      const { count: premiumUsers } = await this.supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .not('subscription_plans.name', 'eq', 'free')

      // Revenus totaux depuis les abonnements
      const { data: revenueData } = await this.supabase
        .from('user_subscriptions')
        .select('amount, billing_cycle, created_at')
        .eq('status', 'active')

      const totalRevenue = revenueData?.reduce((sum, sub) => {
        const amount = sub.amount || 0
        // Si c'est un abonnement annuel, diviser par 12 pour avoir le montant mensuel
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        return sum + monthlyAmount
      }, 0) || 0

      // Revenus du mois en cours
      const currentMonth = new Date()
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const { data: monthlyRevenueData } = await this.supabase
        .from('user_subscriptions')
        .select('amount, billing_cycle')
        .eq('status', 'active')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())

      const monthlyRevenue = monthlyRevenueData?.reduce((sum, sub) => {
        const amount = sub.amount || 0
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        return sum + monthlyAmount
      }, 0) || 0

      // Statistiques par plan
      const { data: planStats } = await this.supabase
        .from('user_subscriptions')
        .select(`
          subscription_plans (
            name,
            display_name,
            price_monthly
          ),
          amount,
          billing_cycle
        `)
        .eq('status', 'active')

      const planBreakdown = planStats?.reduce((acc, sub) => {
        const planName = sub.subscription_plans?.name || 'unknown'
        if (!acc[planName]) {
          acc[planName] = {
            name: sub.subscription_plans?.display_name || planName,
            count: 0,
            revenue: 0
          }
        }
        acc[planName].count += 1
        const amount = sub.amount || 0
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        acc[planName].revenue += monthlyAmount
        return acc
      }, {} as Record<string, { name: string; count: number; revenue: number }>) || {}

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        premiumUsers: premiumUsers || 0,
        totalRevenue,
        monthlyRevenue,
        avgRevenuePerUser: totalUsers ? totalRevenue / totalUsers : 0,
        conversionRate: totalUsers ? (premiumUsers || 0) / totalUsers * 100 : 0,
        planBreakdown
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }
  }
}

export const adminUserService = new AdminUserService()
