/**
 * Script de nettoyage des fichiers .md et .sql inutiles
 * 
 * Ce script supprime tous les fichiers de documentation et SQL
 * qui ne sont plus nécessaires après le nettoyage du projet
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fichiers .md à supprimer (documentation obsolète)
const MD_FILES_TO_DELETE = [
  'AMELIORATIONS_2FA_ET_AUTH.md',
  'CONSOLE_CLEANUP_EASTER_EGG_GUIDE.md',
  'CONSOLE_CLEANUP_FINAL_SUMMARY.md',
  'CONSOLE_CLEANUP_SUMMARY.md',
  'CONVERSATION_SYSTEM_REMOVAL_SUMMARY.md',
  'CORRECTION_BUG_AUTH.md',
  'CORRECTION_ERREUR_JAVASCRIPT.md',
  'CORRECTION_PLANS_ABONNEMENT.md',
  'CORRECTION_SYSTEME_OPTIMISE.md',
  'DATABASE_CLEANUP_GUIDE.md',
  'DEPLOYMENT_USERNAME_REFERRAL_SYSTEM.md',
  'DEPLOYMENT.md',
  'ERREUR_406_RESOLUTION_SUMMARY.md',
  'ERREUR_406_USER_ACTIVITY_RESOLUTION_SUMMARY.md',
  'ETAT_TRADUCTION.md',
  'GUIDE_ADMIN_SYSTEM.md',
  'GUIDE_AJOUT_USERNAME_ADMIN.md',
  'GUIDE_CONFIGURATION_ROUTES.md',
  'GUIDE_CORRECTION_DONNEES_AUTRES_PROFILS.md',
  'GUIDE_CORRECTION_REDIRECTION.md',
  'GUIDE_CORRECTION_SERVICES.md',
  'GUIDE_DEBUG_CONNEXION.md',
  'GUIDE_DEBUG_MENU_ACTION.md',
  'GUIDE_FONCTIONS_ADMIN.md',
  'GUIDE_NETTOYAGE_FINAL.md',
  'GUIDE_NETTOYAGE_MANUEL.md',
  'GUIDE_OPTIMISATION_NAVIGATION.md',
  'GUIDE_PROFIL_UNIVERSEL.md',
  'GUIDE_REMPLACEMENT_DONNEES_FACTICES.md',
  'GUIDE_REPARATION_RADICALE.md',
  'GUIDE_REPARATION_URGENCE.md',
  'GUIDE_RESOLUTION_ERREUR_406_DEFINITIVE.md',
  'GUIDE_RESOLUTION_ERREUR_406_USER_ACTIVITY.md',
  'GUIDE_RESOLUTION_ERREUR_500.md',
  'GUIDE_RESOLUTION_INSCRIPTION.md',
  'GUIDE_STYLE_PROFIL_CORRECT.md',
  'GUIDE_SYSTEME_ABONNEMENTS_ROLES.md',
  'GUIDE_SYSTEME_OPTIMISE.md',
  'GUIDE_TEST_ADMIN_PERMISSIONS.md',
  'GUIDE_TEST_CORRECTIONS_FINALES.md',
  'GUIDE_TEST_ERREUR_406_CORRIGEE.md',
  'GUIDE_TEST_MENU_ACTION_CORRIGE.md',
  'GUIDE_TEST_PANEL_ADMIN.md',
  'GUIDE_TEST_PROMOTION_ADMIN.md',
  'GUIDE_TEST_SYSTEME_VERROUILLAGE.md',
  'GUIDE_USERNAME_COPY.md',
  'GUIDE_UTILISATEURS_MANQUANTS.md',
  'GUIDE_VRAIE_PAGE_PROFIL.md',
  'GUIDE_VRAIES_DONNEES_PROFIL.md',
  'GUIDE_VRAIES_STATISTIQUES.md',
  'IMPLEMENTATION_COMPLETE_USERNAME_REFERRAL.md',
  'OPTIMIZATIONS_NAVIGATION_INSTANTANEE.md',
  'REFERRAL_SYSTEM_DEPLOYMENT_GUIDE.md',
  'RESUME_FINAL_TRADUCTIONS.md',
  'RESUME_SYSTEME_ABONNEMENTS_ROLES.md',
  'TRADUCTION_GUIDE.md',
  'TRADUCTIONS_SUPPLEMENTAIRES.md',
  'USERNAME_SYSTEM_DEPLOYMENT_GUIDE.md',
  'VERIFICATION_SUPABASE.md',
  'WORKBOARD_DARK_THEME_GUIDE.md',
  'WORKBOARD_DASHBOARD_THEME_GUIDE.md',
  'WORKBOARD_MODERNIZATION_GUIDE.md'
];

// Fichiers .md à conserver (importants)
const MD_FILES_TO_KEEP = [
  'README.md',
  'PROJECT_CLEANUP_SUMMARY.md'
];

// Fichiers .sql à supprimer (scripts obsolètes)
const SQL_FILES_TO_DELETE = [
  'scripts/add-social-fields.sql',
  'scripts/add-theme-column.sql',
  'scripts/add-theme-field.sql',
  'scripts/add-username-system.sql',
  'scripts/add-username-to-admin.sql',
  'scripts/apply-migration.ps1',
  'scripts/apply-missing-migrations.sql',
  'scripts/apply-missing-profile-migrations.sql',
  'scripts/apply-profile-migrations.sql',
  'scripts/apply-referral-migration.ps1',
  'scripts/apply-workboard-migration.ps1',
  'scripts/check-and-fix-admin.sql',
  'scripts/check-table.sql',
  'scripts/check-tasks-constraints.sql',
  'scripts/check-user-profiles-structure.sql',
  'scripts/clean-create-admin-functions.sql',
  'scripts/clean-database-simple.ps1',
  'scripts/clean-database.ps1',
  'scripts/clean-database.sql',
  'scripts/clean-migrations.ps1',
  'scripts/clear-cache-and-restart.ps1',
  'scripts/complete-admin-restore.sql',
  'scripts/create-avatars-bucket-simple.sql',
  'scripts/create-awards-table-now.sql',
  'scripts/create-bucket-only.sql',
  'scripts/create-bucket-safe.sql',
  'scripts/create-calendar-events-table.sql',
  'scripts/create-correct-admin-functions.sql',
  'scripts/create-promote-admin-function.sql',
  'scripts/create-real-subscription-stats.sql',
  'scripts/create-skills-awards-tables.sql',
  'scripts/debug-users.sql',
  'scripts/delete-all-tables.sql',
  'scripts/deploy-referral-webhook.ps1',
  'scripts/deploy-username-system.sql',
  'scripts/diagnose-missing-profile.ps1',
  'scripts/diagnose-rls-issue.sql',
  'scripts/disable-rls-completely.sql',
  'scripts/emergency-fix-admin.sql',
  'scripts/fix-406-error.ps1',
  'scripts/fix-all-issues.sql',
  'scripts/fix-bucket-only.sql',
  'scripts/fix-calendar-policies.sql',
  'scripts/fix-calendar-subscription-issues.ps1',
  'scripts/fix-client-id-error.ps1',
  'scripts/fix-migration.ps1',
  'scripts/fix-missing-profiles.sql',
  'scripts/fix-orders-rls.ps1',
  'scripts/fix-orders-rls.sql',
  'scripts/fix-profile-issues.sql',
  'scripts/fix-rls-recursion.sql',
  'scripts/fix-skills-awards-404.sql',
  'scripts/fix-sql-syntax-error.ps1',
  'scripts/fix-storage-rls.ps1',
  'scripts/fix-tasks-table-simple.sql',
  'scripts/fix-tasks-table.sql',
  'scripts/fix-trigger-create-profiles.sql',
  'scripts/force-clean-admin-functions.sql',
  'scripts/generate-referral-codes.ps1',
  'scripts/global-cleanup.ps1',
  'scripts/modern-workboard-deployed.ps1',
  'scripts/promote-friend-to-admin.sql',
  'scripts/promote-to-admin.sql',
  'scripts/promote-user-to-admin.ps1',
  'scripts/reset-migrations.sql',
  'scripts/simple-admin-promotion.ps1',
  'scripts/simple-db-cleanup.sql',
  'scripts/test-admin-functions.sql',
  'scripts/test-admin-permissions.ps1',
  'scripts/test-admin-permissions.sql',
  'scripts/test-admin-verification-fix.ps1',
  'scripts/test-app-fix.ps1',
  'scripts/test-calendar-subscription-fixes.sql',
  'scripts/test-complete-referral-system.ps1',
  'scripts/test-dashboard-stats.ps1',
  'scripts/test-fixes.ps1',
  'scripts/test-migration-fix.ps1',
  'scripts/test-no-rpc-solution.ps1',
  'scripts/test-order-system.ps1',
  'scripts/test-performance-optimized.ps1',
  'scripts/test-reference-error-fix.ps1',
  'scripts/test-referral-commissions.ps1',
  'scripts/test-referral-fixes.ps1',
  'scripts/test-referral-signup.ps1',
  'scripts/test-referral-simple.ps1',
  'scripts/test-referral-system.js',
  'scripts/test-referral-system.ps1',
  'scripts/test-referrals-page.ps1',
  'scripts/test-signup-system.ps1',
  'scripts/test-subscription-system.ps1',
  'scripts/test-subscription-system.sql',
  'scripts/test-username-generation.js',
  'scripts/test-username-referral-system.js',
  'scripts/test-workboard-functionality.ps1',
  'scripts/update-tasks-status-constraint.sql',
  'scripts/update-trigger-with-username.sql',
  'scripts/urgent-create-tables.sql',
  'scripts/verify-all-variables.ps1',
  'scripts/verify-database.sql',
  'scripts/verify-fix.ps1',
  'scripts/verify-rls-disabled.sql',
  'scripts/verify-signup-system.sql',
  'scripts/workboard-ready.ps1'
];

// Fichiers .sql à conserver (importants)
const SQL_FILES_TO_KEEP = [
  'scripts/fix-user-activity-rls.sql'
];

// Fonction pour supprimer un fichier
function deleteFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Fichier supprimé: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction principale de nettoyage
function cleanupMdSql() {
  console.log('🧹 Début du nettoyage des fichiers .md et .sql inutiles...');
  console.log(`📁 Dossier racine: ${path.join(__dirname, '..')}`);
  
  let deletedMd = 0;
  let deletedSql = 0;
  
  // Supprimer les fichiers .md
  console.log('\n📄 Suppression des fichiers .md obsolètes...');
  MD_FILES_TO_DELETE.forEach(filePath => {
    if (deleteFile(filePath)) {
      deletedMd++;
    }
  });
  
  // Supprimer les fichiers .sql
  console.log('\n📄 Suppression des fichiers .sql obsolètes...');
  SQL_FILES_TO_DELETE.forEach(filePath => {
    if (deleteFile(filePath)) {
      deletedSql++;
    }
  });
  
  console.log(`\n✅ Nettoyage terminé !`);
  console.log(`📄 ${deletedMd} fichiers .md supprimés`);
  console.log(`📄 ${deletedSql} fichiers .sql supprimés`);
  console.log(`📊 Total: ${deletedMd + deletedSql} fichiers supprimés`);
  console.log('🎯 Le projet est maintenant ultra-propre !');
}

// Exécuter le nettoyage
cleanupMdSql();
