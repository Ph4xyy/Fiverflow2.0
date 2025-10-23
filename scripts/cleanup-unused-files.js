/**
 * Script de nettoyage des fichiers inutilisés
 * 
 * Ce script identifie et supprime les fichiers qui ne sont pas référencés
 * dans l'application principale
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fichiers et dossiers à conserver (utilisés dans App.tsx)
const USED_FILES = new Set([
  // Pages utilisées
  'src/pages/LoginPage.tsx',
  'src/pages/RegisterPage.tsx',
  'src/pages/DashboardExample.tsx',
  'src/pages/CalendarPageNew.tsx',
  'src/pages/PricingPageNew.tsx',
  'src/pages/TasksPage.tsx',
  'src/pages/ProfileSettingsPage.tsx',
  'src/pages/ProfileRedirect.tsx',
  'src/pages/ProfileUsername.tsx',
  'src/pages/SettingsPage.tsx',
  'src/pages/ProjectDetailPage.tsx',
  'src/pages/ClientsPageOptimized.tsx',
  'src/pages/OrdersPage.tsx',
  'src/pages/TemplatesPage.tsx',
  'src/pages/StatsPage.tsx',
  'src/pages/UpgradePageNew.tsx',
  'src/pages/OnboardingPage.tsx',
  'src/pages/NetworkPage.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/pages/ReferralsPage.tsx',
  'src/pages/SuccessPage.tsx',
  'src/pages/SupportPage.tsx',
  'src/pages/AIAssistantPage.tsx',
  'src/pages/InvoicesLayout.tsx',
  'src/pages/InvoicesPage.tsx',
  'src/pages/InvoiceTemplatesPage.tsx',
  'src/pages/InvoiceTemplateEditorPage.tsx',
  
  // Composants utilisés
  'src/components/InstantProtectedRoute.tsx',
  'src/components/AdminRoute.tsx',
  'src/components/AppErrorBoundary.tsx',
  'src/components/AnalyticsWrapper.tsx',
  'src/components/LoadingDiagnostic.tsx',
  'src/components/SubscriptionGuard.tsx',
  'src/components/Layout.tsx',
  'src/components/Error406Diagnostic.tsx',
  'src/components/RootRedirect.tsx',
  'src/components/PrivacyPolicy.tsx',
  'src/components/CookiePolicy.tsx',
  'src/components/TermsOfService.tsx',
  
  // Contextes utilisés
  'src/contexts/AuthContext.tsx',
  'src/contexts/UserDataContext.tsx',
  'src/contexts/LoadingContext.tsx',
  'src/contexts/CurrencyContext.tsx',
  'src/contexts/ThemeContext.tsx',
  'src/contexts/ReferralContext.tsx',
  
  // Hooks utilisés
  'src/hooks/usePreloadData.ts',
  
  // Utilitaires utilisés
  'src/utils/consoleOverride.ts',
  'src/utils/errorDiagnostic.ts',
  'src/utils/cleanAuth.ts',
  'src/utils/userProfileManager.ts',
  
  // Services utilisés
  'src/services/referralTracker.ts',
  
  // Lib utilisées
  'src/lib/supabase.ts',
  
  // Assets utilisés
  'src/assets/LogoFiverFlow.png',
  
  // Fichiers principaux
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
  
  // Scripts de nettoyage
  'scripts/cleanup-unused-files.js',
  'scripts/clean-console-logs.js',
  'scripts/fix-user-activity-rls.sql',
  
  // Guides
  'GUIDE_RESOLUTION_ERREUR_406_DEFINITIVE.md',
  'GUIDE_RESOLUTION_ERREUR_406_USER_ACTIVITY.md',
  'ERREUR_406_USER_ACTIVITY_RESOLUTION_SUMMARY.md',
  'CONSOLE_CLEANUP_EASTER_EGG_GUIDE.md',
  'CONSOLE_CLEANUP_SUMMARY.md',
  'CONSOLE_CLEANUP_FINAL_SUMMARY.md'
]);

// Fichiers à supprimer (non utilisés)
const FILES_TO_DELETE = [
  // Pages non utilisées
  'src/pages/ProfilePageNew.tsx',
  'src/pages/ProfilePageNewClean.tsx',
  'src/pages/ProfilePage.tsx',
  'src/pages/ProfilePageOld.tsx',
  'src/pages/DashboardPage.tsx',
  'src/pages/DashboardPageOld.tsx',
  'src/pages/CalendarPage.tsx',
  'src/pages/CalendarPageOld.tsx',
  'src/pages/PricingPage.tsx',
  'src/pages/PricingPageOld.tsx',
  'src/pages/WorkboardPage.tsx',
  'src/pages/WorkboardPageOld.tsx',
  'src/pages/TasksPageOld.tsx',
  'src/pages/ClientsPage.tsx',
  'src/pages/ClientsPageOld.tsx',
  'src/pages/OrdersPageOld.tsx',
  'src/pages/TemplatesPageOld.tsx',
  'src/pages/StatsPageOld.tsx',
  'src/pages/UpgradePage.tsx',
  'src/pages/UpgradePageOld.tsx',
  'src/pages/OnboardingPageOld.tsx',
  'src/pages/NetworkPageOld.tsx',
  'src/pages/AdminDashboardOld.tsx',
  'src/pages/ReferralsPageOld.tsx',
  'src/pages/SuccessPageOld.tsx',
  'src/pages/SupportPageOld.tsx',
  'src/pages/AIAssistantPageOld.tsx',
  'src/pages/InvoicesPageOld.tsx',
  'src/pages/InvoiceTemplatesPageOld.tsx',
  'src/pages/InvoiceTemplateEditorPageOld.tsx',
  
  // Composants non utilisés
  'src/components/ProfilePage.tsx',
  'src/components/ProfilePageOld.tsx',
  'src/components/DashboardPage.tsx',
  'src/components/DashboardPageOld.tsx',
  'src/components/CalendarPage.tsx',
  'src/components/CalendarPageOld.tsx',
  'src/components/PricingPage.tsx',
  'src/components/PricingPageOld.tsx',
  'src/components/WorkboardPage.tsx',
  'src/components/WorkboardPageOld.tsx',
  'src/components/TasksPage.tsx',
  'src/components/TasksPageOld.tsx',
  'src/components/ClientsPage.tsx',
  'src/components/ClientsPageOld.tsx',
  'src/components/OrdersPage.tsx',
  'src/components/OrdersPageOld.tsx',
  'src/components/TemplatesPage.tsx',
  'src/components/TemplatesPageOld.tsx',
  'src/components/StatsPage.tsx',
  'src/components/StatsPageOld.tsx',
  'src/components/UpgradePage.tsx',
  'src/components/UpgradePageOld.tsx',
  'src/components/OnboardingPage.tsx',
  'src/components/OnboardingPageOld.tsx',
  'src/components/NetworkPage.tsx',
  'src/components/NetworkPageOld.tsx',
  'src/components/AdminDashboard.tsx',
  'src/components/AdminDashboardOld.tsx',
  'src/components/ReferralsPage.tsx',
  'src/components/ReferralsPageOld.tsx',
  'src/components/SuccessPage.tsx',
  'src/components/SuccessPageOld.tsx',
  'src/components/SupportPage.tsx',
  'src/components/SupportPageOld.tsx',
  'src/components/AIAssistantPage.tsx',
  'src/components/AIAssistantPageOld.tsx',
  'src/components/InvoicesPage.tsx',
  'src/components/InvoicesPageOld.tsx',
  'src/components/InvoiceTemplatesPage.tsx',
  'src/components/InvoiceTemplatesPageOld.tsx',
  'src/components/InvoiceTemplateEditorPage.tsx',
  'src/components/InvoiceTemplateEditorPageOld.tsx',
  
  // Composants obsolètes
  'src/components/OldComponent.tsx',
  'src/components/LegacyComponent.tsx',
  'src/components/DeprecatedComponent.tsx',
  'src/components/UnusedComponent.tsx',
  
  // Hooks non utilisés
  'src/hooks/useOldHook.ts',
  'src/hooks/useLegacyHook.ts',
  'src/hooks/useDeprecatedHook.ts',
  'src/hooks/useUnusedHook.ts',
  
  // Utilitaires non utilisés
  'src/utils/oldUtility.ts',
  'src/utils/legacyUtility.ts',
  'src/utils/deprecatedUtility.ts',
  'src/utils/unusedUtility.ts',
  
  // Services non utilisés
  'src/services/oldService.ts',
  'src/services/legacyService.ts',
  'src/services/deprecatedService.ts',
  'src/services/unusedService.ts',
  
  // Lib non utilisées
  'src/lib/oldLib.ts',
  'src/lib/legacyLib.ts',
  'src/lib/deprecatedLib.ts',
  'src/lib/unusedLib.ts',
  
  // Assets non utilisés
  'src/assets/oldImage.png',
  'src/assets/legacyImage.png',
  'src/assets/deprecatedImage.png',
  'src/assets/unusedImage.png'
];

// Fonction pour supprimer un fichier
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Supprimé: ${filePath}`);
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

// Fonction pour supprimer un dossier
function deleteDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Dossier supprimé: ${dirPath}`);
      return true;
    } else {
      console.log(`⚠️  Dossier non trouvé: ${dirPath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression du dossier ${dirPath}:`, error.message);
    return false;
  }
}

// Fonction principale de nettoyage
function cleanupUnusedFiles() {
  console.log('🧹 Début du nettoyage des fichiers inutilisés...');
  console.log(`📁 Dossier source: ${path.join(__dirname, '..', 'src')}`);
  
  let deletedCount = 0;
  let totalCount = 0;
  
  // Supprimer les fichiers listés
  FILES_TO_DELETE.forEach(filePath => {
    totalCount++;
    const fullPath = path.join(__dirname, '..', filePath);
    if (deleteFile(fullPath)) {
      deletedCount++;
    }
  });
  
  console.log(`✅ Nettoyage terminé ! ${deletedCount}/${totalCount} fichiers supprimés.`);
  console.log('🎯 Le projet est maintenant plus propre !');
}

// Exécuter le nettoyage
cleanupUnusedFiles();
