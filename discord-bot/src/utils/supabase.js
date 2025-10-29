const { createClient } = require('@supabase/supabase-js');

function connectToSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Configuration Supabase manquante');
        return null;
    }
    
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Connexion Supabase établie');
        return supabase;
    } catch (error) {
        console.error('❌ Erreur connexion Supabase:', error);
        return null;
    }
}

// Fonctions utilitaires pour les statistiques
class StatsManager {
    constructor(supabase) {
        this.supabase = supabase;
    }
    
    // Obtenir les statistiques générales
    async getGeneralStats() {
        if (!this.supabase) return null;
        
        try {
            const { data: users, error: usersError } = await this.supabase
                .from('user_profiles')
                .select('*');
                
            const { data: subscriptions, error: subsError } = await this.supabase
                .from('user_subscriptions')
                .select('*');
                
            if (usersError || subsError) {
                throw new Error(`Erreur BDD: ${usersError?.message || subsError?.message}`);
            }
            
            // Calculer les stats
            const totalUsers = users?.length || 0;
            const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active').length || 0;
            const lunchUsers = users?.filter(user => user.subscription === 'Lunch').length || 0;
            const boostUsers = users?.filter(user => user.subscription === 'Boost').length || 0;
            const scaleUsers = users?.filter(user => user.subscription === 'Scale').length || 0;
            
            // Utilisateurs créés cette semaine
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const newUsersThisWeek = users?.filter(user => 
                new Date(user.created_at) > oneWeekAgo
            ).length || 0;
            
            return {
                totalUsers,
                activeSubscriptions,
                lunchUsers,
                boostUsers,
                scaleUsers,
                newUsersThisWeek,
                lastUpdated: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Erreur récupération stats:', error);
            return null;
        }
    }
    
    // Obtenir les statistiques des commandes
    async getOrdersStats() {
        if (!this.supabase) return null;
        
        try {
            const { data: orders, error } = await this.supabase
                .from('orders')
                .select('*');
                
            if (error) throw error;
            
            const totalOrders = orders?.length || 0;
            const completedOrders = orders?.filter(order => order.status === 'completed').length || 0;
            const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
            
            // Revenus totaux (si on a une colonne amount)
            const totalRevenue = orders?.reduce((sum, order) => 
                sum + (parseFloat(order.amount) || 0), 0
            ) || 0;
            
            return {
                totalOrders,
                completedOrders,
                pendingOrders,
                totalRevenue,
                lastUpdated: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Erreur récupération stats commandes:', error);
            return null;
        }
    }
    
    // Obtenir les utilisateurs récents
    async getRecentUsers(limit = 5) {
        if (!this.supabase) return null;
        
        try {
            const { data: users, error } = await this.supabase
                .from('user_profiles')
                .select('username, email, subscription, created_at')
                .order('created_at', { ascending: false })
                .limit(limit);
                
            if (error) throw error;
            
            return users || [];
            
        } catch (error) {
            console.error('Erreur récupération utilisateurs récents:', error);
            return null;
        }
    }
}

module.exports = {
    connectToSupabase,
    StatsManager
};
