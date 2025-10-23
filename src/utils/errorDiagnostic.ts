/**
 * Diagnostic des erreurs Supabase - Spécialement pour l'erreur 406
 * 
 * Ce module aide à diagnostiquer et résoudre les problèmes courants
 * avec Supabase, notamment l'erreur 406 "Not Acceptable"
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface DiagnosticResult {
  hasError: boolean;
  errorType: string;
  errorMessage: string;
  suggestions: string[];
  canContinue: boolean;
}

/**
 * Diagnostic complet de l'erreur 406
 */
export const diagnoseError406 = async (): Promise<DiagnosticResult> => {
  console.log('🔍 [ErrorDiagnostic] Début du diagnostic de l\'erreur 406...');

  const result: DiagnosticResult = {
    hasError: false,
    errorType: '',
    errorMessage: '',
    suggestions: [],
    canContinue: true
  };

  try {
    // 1. Vérifier la configuration Supabase
    if (!isSupabaseConfigured || !supabase) {
      result.hasError = true;
      result.errorType = 'CONFIGURATION';
      result.errorMessage = 'Supabase n\'est pas configuré correctement';
      result.suggestions = [
        'Vérifiez que VITE_SUPABASE_URL est défini',
        'Vérifiez que VITE_SUPABASE_ANON_KEY est défini',
        'Vérifiez que les variables d\'environnement sont chargées'
      ];
      result.canContinue = false;
      return result;
    }

    // 2. Tester la connexion de base
    console.log('🔍 [ErrorDiagnostic] Test de connexion de base...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [ErrorDiagnostic] Erreur de session:', sessionError);
      result.hasError = true;
      result.errorType = 'SESSION';
      result.errorMessage = `Erreur de session: ${sessionError.message}`;
      result.suggestions = [
        'Vérifiez la configuration Supabase',
        'Vérifiez que le projet Supabase est actif',
        'Vérifiez les permissions RLS'
      ];
    }

    // 3. Tester une requête simple
    console.log('🔍 [ErrorDiagnostic] Test de requête simple...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ [ErrorDiagnostic] Erreur de requête:', testError);
      
      if (testError.code === 'PGRST301' || testError.message.includes('406')) {
        result.hasError = true;
        result.errorType = 'RLS_POLICY';
        result.errorMessage = 'Erreur 406: Problème avec les politiques RLS';
        result.suggestions = [
          'Vérifiez les politiques RLS dans Supabase',
          'Assurez-vous que l\'utilisateur est authentifié',
          'Vérifiez les permissions de la table user_profiles',
          'Essayez de recréer les politiques RLS'
        ];
      } else {
        result.hasError = true;
        result.errorType = 'DATABASE';
        result.errorMessage = `Erreur de base de données: ${testError.message}`;
        result.suggestions = [
          'Vérifiez la connexion à la base de données',
          'Vérifiez que les tables existent',
          'Vérifiez les migrations'
        ];
      }
    } else {
      console.log('✅ [ErrorDiagnostic] Requête de test réussie');
    }

    // 4. Tester l'authentification
    if (sessionData?.session?.user) {
      console.log('🔍 [ErrorDiagnostic] Test d\'authentification...');
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id, user_id, is_admin')
        .eq('user_id', sessionData.session.user.id)
        .single();

      if (userError) {
        console.error('❌ [ErrorDiagnostic] Erreur de profil utilisateur:', userError);
        
        if (userError.code === 'PGRST301' || userError.message.includes('406')) {
          result.hasError = true;
          result.errorType = 'USER_PROFILE_406';
          result.errorMessage = 'Erreur 406 sur le profil utilisateur';
          result.suggestions = [
            'Vérifiez les politiques RLS pour user_profiles',
            'Assurez-vous que l\'utilisateur a un profil',
            'Créez un profil pour l\'utilisateur si nécessaire',
            'Vérifiez les permissions de lecture'
          ];
        }
      } else {
        console.log('✅ [ErrorDiagnostic] Profil utilisateur accessible');
      }
    }

  } catch (error) {
    console.error('❌ [ErrorDiagnostic] Erreur inattendue:', error);
    result.hasError = true;
    result.errorType = 'UNEXPECTED';
    result.errorMessage = `Erreur inattendue: ${error}`;
    result.suggestions = [
      'Vérifiez la console pour plus de détails',
      'Rechargez la page',
      'Vérifiez la connexion internet'
    ];
  }

  console.log('🔍 [ErrorDiagnostic] Diagnostic terminé:', result);
  return result;
};

/**
 * Solution de contournement pour l'erreur 406
 */
export const handleError406 = async (userId: string) => {
  console.log('🔧 [ErrorDiagnostic] Tentative de contournement pour l\'erreur 406...');

  try {
    // Essayer différentes approches
    const approaches = [
      // Approche 1: Requête directe avec RPC
      async () => {
        console.log('🔧 [Error406] Approche 1: RPC direct');
        const { data, error } = await supabase.rpc('get_user_profile', { user_uuid: userId });
        return { data, error, approach: 'RPC' };
      },
      
      // Approche 2: Requête avec select minimal
      async () => {
        console.log('🔧 [Error406] Approche 2: Select minimal');
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, user_id, is_admin')
          .eq('user_id', userId)
          .single();
        return { data, error, approach: 'MINIMAL' };
      },
      
      // Approche 3: Requête sans single()
      async () => {
        console.log('🔧 [Error406] Approche 3: Sans single()');
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .limit(1);
        return { data: data?.[0] || null, error, approach: 'LIMIT' };
      }
    ];

    for (const approach of approaches) {
      try {
        const result = await approach();
        if (!result.error) {
          console.log(`✅ [Error406] Contournement réussi avec l'approche: ${result.approach}`);
          return result.data;
        } else {
          console.warn(`⚠️ [Error406] Approche ${result.approach} échouée:`, result.error);
        }
      } catch (error) {
        console.warn(`⚠️ [Error406] Approche échouée:`, error);
      }
    }

    console.error('❌ [Error406] Toutes les approches de contournement ont échoué');
    return null;

  } catch (error) {
    console.error('❌ [Error406] Erreur lors du contournement:', error);
    return null;
  }
};

/**
 * Vérification de la santé de Supabase
 */
export const checkSupabaseHealth = async (): Promise<{
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  console.log('🏥 [HealthCheck] Vérification de la santé de Supabase...');

  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // Test de connexion
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      issues.push(`Erreur de session: ${sessionError.message}`);
      recommendations.push('Vérifiez la configuration Supabase');
    }

    // Test de requête simple
    const { error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (testError) {
      issues.push(`Erreur de requête: ${testError.message}`);
      
      if (testError.code === 'PGRST301') {
        recommendations.push('Vérifiez les politiques RLS');
      } else if (testError.message.includes('406')) {
        recommendations.push('Problème de politique RLS - vérifiez les permissions');
      }
    }

      // Test d'authentification si utilisateur connecté
      if (sessionData?.session?.user) {
        const { error: userError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .single();

        if (userError) {
          issues.push(`Erreur de profil utilisateur: ${userError.message}`);
          recommendations.push('Vérifiez les politiques RLS pour user_profiles');
        }

        // Test de la table user_activity
        const { error: activityError } = await supabase
          .from('user_activity')
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .limit(1);

        if (activityError) {
          issues.push(`Erreur de user_activity: ${activityError.message}`);
          recommendations.push('Vérifiez les politiques RLS pour user_activity');
        }
      }

  } catch (error) {
    issues.push(`Erreur inattendue: ${error}`);
    recommendations.push('Vérifiez la console pour plus de détails');
  }

  const isHealthy = issues.length === 0;

  console.log('🏥 [HealthCheck] Résultat:', {
    isHealthy,
    issuesCount: issues.length,
    recommendationsCount: recommendations.length
  });

  return {
    isHealthy,
    issues,
    recommendations
  };
};

export default {
  diagnoseError406,
  handleError406,
  checkSupabaseHealth
};
