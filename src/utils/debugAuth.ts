import { supabase } from '../lib/supabase';

/**
 * Utilitaires de debug pour l'authentification
 */
export const debugAuth = {
  async testUserRoleQuery(userId: string) {
    console.log('🔍 Testing user role query for:', userId);
    
    try {
      const startTime = Date.now();
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
      });
      
      // First, let's try a simple query to see if the user exists at all
      console.log('🔍 Step 1: Checking if user exists...');
      const userQueryPromise = supabase
        .from('users')
        .select('id, email, role, created_at')
        .eq('id', userId)
        .maybeSingle();
      
      const { data: userData, error: userError } = await Promise.race([
        userQueryPromise,
        timeoutPromise
      ]) as any;
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Query took ${duration}ms`);
      
      if (userError) {
        console.error('❌ Database error:', userError);
        return { success: false, error: userError, duration };
      }
      
      if (!userData) {
        console.error('❌ User not found in database');
        return { success: false, error: 'User not found in database', duration };
      }
      
      console.log('✅ User found:', userData);
      
      // Now try the role-specific query
      console.log('🔍 Step 2: Fetching role specifically...');
      const roleQueryPromise = supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      const { data: roleData, error: roleError } = await Promise.race([
        roleQueryPromise,
        timeoutPromise
      ]) as any;
      
      if (roleError) {
        console.error('❌ Role query error:', roleError);
        return { success: false, error: roleError, duration };
      }
      
      console.log('✅ Role query result:', roleData);
      return { success: true, data: roleData, duration };
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error('💥 Unexpected error:', err);
      return { success: false, error: err, duration };
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

  async testRLSPolicies(userId: string) {
    console.log('🔍 Testing RLS policies...');
    
    try {
      const startTime = Date.now();
      
      // Test 1: Can we query our own user record?
      console.log('🔍 Testing: Can query own user record');
      const { data: ownUser, error: ownUserError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', userId)
        .maybeSingle();
      
      if (ownUserError) {
        console.error('❌ Cannot query own user record:', ownUserError);
        return { success: false, error: ownUserError };
      }
      
      console.log('✅ Can query own user record:', ownUser);
      
      // Test 2: Can we query other users? (should fail)
      console.log('🔍 Testing: Cannot query other users');
      const { data: otherUsers, error: otherUsersError } = await supabase
        .from('users')
        .select('id, email, role')
        .neq('id', userId)
        .limit(1);
      
      if (otherUsersError) {
        console.log('✅ Correctly blocked from querying other users:', otherUsersError.message);
      } else {
        console.log('⚠️ Unexpectedly allowed to query other users:', otherUsers);
      }
      
      const duration = Date.now() - startTime;
      return { success: true, data: ownUser, duration };
    } catch (err) {
      console.error('💥 RLS test error:', err);
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
