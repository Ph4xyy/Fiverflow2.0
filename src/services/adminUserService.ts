import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseKey

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
  private supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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
        let query = this.supabaseAdmin
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

      // Appliquer la pagination après avoir récupéré tous les utilisateurs
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedUsers = users.slice(startIndex, endIndex)

      // Pour chaque utilisateur paginé, récupérer son rôle et abonnement
      const usersWithDetails = await Promise.all(
        paginatedUsers.map(async (user) => {
          // Récupérer le rôle
          const { data: userRole } = await this.supabaseAdmin
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
          const { data: subscription } = await this.supabaseAdmin
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
      const { count } = await this.supabaseAdmin
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
      const { data, error } = await this.supabaseAdmin
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
      const { data, error } = await this.supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly')

      if (error) throw error
      
      // Réorganiser les plans dans l'ordre logique : free, launch, boost, scale, admin
      const orderedPlans = (data || []).sort((a, b) => {
        const order = ['free', 'launch', 'boost', 'scale', 'admin']
        return order.indexOf(a.name) - order.indexOf(b.name)
      })
      
      console.log('📋 Subscription plans retrieved:', orderedPlans.map(p => ({ name: p.name, display_name: p.display_name })))
      
      return orderedPlans
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
      const { data: roleData, error: roleError } = await this.supabaseAdmin
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

      // Vérifier si l'utilisateur a déjà ce rôle
      const { data: existingRole } = await this.supabaseAdmin
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', roleData.id)
        .eq('is_active', true)
        .single()

      if (existingRole) {
        console.log('User already has this role')
        return { success: true }
      }

      // Supprimer tous les rôles actuels de l'utilisateur
      const { error: deleteError } = await this.supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error deleting roles:', deleteError)
        throw new Error(`Erreur lors de la suppression des rôles: ${deleteError.message}`)
      }

      // Insérer le nouveau rôle
      const { error: insertError } = await this.supabaseAdmin
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
      const { error: profileError } = await this.supabaseAdmin
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
      console.log('🔄 AdminUserService - updateUserSubscription:', { userId, planName })
      
      // Récupérer l'ID du plan
      const { data: planData, error: planError } = await this.supabaseAdmin
        .from('subscription_plans')
        .select('id, price_monthly, name, display_name')
        .eq('name', planName)
        .single()

      console.log('📋 Plan data retrieved:', planData)

      if (planError) {
        console.error('Error fetching plan:', planError)
        throw new Error(`Erreur lors de la récupération du plan: ${planError.message}`)
      }
      if (!planData) {
        throw new Error(`Plan ${planName} non trouvé`)
      }

      console.log('Plan data found:', planData)

      // Vérifier si l'utilisateur a déjà ce plan actif
      const { data: existingSubscription } = await this.supabaseAdmin
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('plan_id', planData.id)
        .eq('status', 'active')
        .single()

      if (existingSubscription) {
        console.log('User already has this subscription plan')
        return { success: true }
      }

      // Supprimer tous les abonnements actuels de l'utilisateur
      const { error: deleteError } = await this.supabaseAdmin
        .from('user_subscriptions')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error deleting subscriptions:', deleteError)
        throw new Error(`Erreur lors de la suppression des abonnements: ${deleteError.message}`)
      }

      // Insérer le nouvel abonnement
      const { error: insertError } = await this.supabaseAdmin
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
        const { count: totalUsers } = await this.supabaseAdmin
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })

        // Utilisateurs actifs
        const { count: activeUsers } = await this.supabaseAdmin
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

      // Utilisateurs avec abonnement payant (Boost/Scale uniquement)
      const { data: premiumSubscriptions } = await this.supabaseAdmin
        .from('user_subscriptions')
        .select(`
          subscription_plans (
            name
          )
        `)
        .eq('status', 'active')

      const premiumUsers = premiumSubscriptions?.filter(sub => {
        const planName = sub.subscription_plans?.name
        return planName === 'boost' || planName === 'scale'
      }).length || 0

      // Revenus totaux depuis les abonnements (Boost/Scale uniquement)
      const { data: revenueData } = await this.supabaseAdmin
        .from('user_subscriptions')
        .select(`
          amount, 
          billing_cycle, 
          created_at,
          subscription_plans (
            name
          )
        `)
        .eq('status', 'active')

      const totalRevenue = revenueData?.filter(sub => {
        const planName = sub.subscription_plans?.name
        return planName === 'boost' || planName === 'scale'
      }).reduce((sum, sub) => {
        const amount = sub.amount || 0
        // Si c'est un abonnement annuel, diviser par 12 pour avoir le montant mensuel
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        return sum + monthlyAmount
      }, 0) || 0

      // Revenus du mois en cours (Boost/Scale uniquement)
      const currentMonth = new Date()
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const { data: monthlyRevenueData } = await this.supabaseAdmin
        .from('user_subscriptions')
        .select(`
          amount, 
          billing_cycle,
          subscription_plans (
            name
          )
        `)
        .eq('status', 'active')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())

      const monthlyRevenue = monthlyRevenueData?.filter(sub => {
        const planName = sub.subscription_plans?.name
        return planName === 'boost' || planName === 'scale'
      }).reduce((sum, sub) => {
        const amount = sub.amount || 0
        const monthlyAmount = sub.billing_cycle === 'yearly' ? amount / 12 : amount
        return sum + monthlyAmount
      }, 0) || 0

      // Statistiques par plan (Boost/Scale uniquement)
      const { data: planStats } = await this.supabaseAdmin
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

      const planBreakdown = planStats?.filter(sub => {
        const planName = sub.subscription_plans?.name
        return planName === 'boost' || planName === 'scale'
      }).reduce((acc, sub) => {
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
