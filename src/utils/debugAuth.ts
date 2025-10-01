import { supabase } from '../lib/supabase';

/**
 * Utilitaires de debug pour l'authentification
 */
export const debugAuth = {
  async testUserRoleQuery(userId: string) {
    console.log('🔍 Testing user role query for:', userId);
    
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Query took ${duration}ms`);
      
      if (error) {
        console.error('❌ Database error:', error);
        return { success: false, error };
      }
      
      console.log('✅ Query result:', data);
      return { success: true, data };
    } catch (err) {
      console.error('💥 Unexpected error:', err);
      return { success: false, error: err };
    }
  },

  async testSession() {
    console.log('🔍 Testing session...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session error:', error);
        return { success: false, error };
      }
      
      console.log('✅ Session:', session?.user?.id);
      return { success: true, session };
    } catch (err) {
      console.error('💥 Session error:', err);
      return { success: false, error: err };
    }
  },

  logLoadingStates(authLoading: boolean, roleLoading: boolean, user: any, role: string) {
    console.log('📊 Loading States:', {
      authLoading,
      roleLoading,
      hasUser: !!user,
      userId: user?.id,
      role,
      timestamp: new Date().toISOString()
    });
  }
};
