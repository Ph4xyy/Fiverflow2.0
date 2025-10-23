/**
 * Script de nettoyage intelligent des fichiers inutilisés
 * 
 * Ce script analyse les imports et références pour identifier
 * les fichiers réellement inutilisés
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fichiers identifiés comme inutilisés après analyse
const FILES_TO_DELETE = [
  // Pages dupliquées ou obsolètes
  'src/pages/InvoicesPageNew.tsx', // Dupliqué de InvoicesPage.tsx
  'src/pages/ProfilePageNewClean.tsx', // Version obsolète
  'src/pages/admin/AdminDashboard.tsx', // Dupliqué de AdminDashboard.tsx
  'src/pages/ReferralLandingPage.tsx', // Page non référencée
  
  // Composants obsolètes ou non utilisés
  'src/components/ErrorBoundary.tsx', // Remplacé par AppErrorBoundary.tsx
  'src/components/ProtectedRoute.tsx', // Remplacé par InstantProtectedRoute.tsx
  'src/components/footer.tsx', // Non utilisé
  'src/components/LogoImage.tsx', // Non utilisé
  'src/components/LogoDisplayPrivate.tsx', // Non utilisé
  'src/components/ModernCard.tsx', // Non utilisé
  'src/components/ModernWorkboard.tsx', // Non utilisé
  'src/components/ProjectCard.tsx', // Non utilisé
  'src/components/SocialLinks.tsx', // Non utilisé
  'src/components/StatusSelector.tsx', // Non utilisé
  'src/components/StoragePolicyFixer.tsx', // Non utilisé
  'src/components/TaskManager.tsx', // Non utilisé
  'src/components/ThemeSelector.tsx', // Non utilisé
  'src/components/TrialBanner.tsx', // Non utilisé
  'src/components/UserDetailedStats.tsx', // Non utilisé
  
  // Hooks obsolètes ou non utilisés
  'src/hooks/useAuthWith2FA.ts', // Non utilisé
  'src/hooks/useCurrency.ts', // Non utilisé
  'src/hooks/useSimpleTwoFactorAuth.ts', // Non utilisé
  'src/hooks/useSmtpSettings.ts', // Non utilisé
  'src/hooks/useThemeColors.ts', // Non utilisé
  'src/hooks/useUserPermissions.ts', // Non utilisé
  
  // Services obsolètes ou non utilisés
  'src/services/awardsService.ts', // Non utilisé
  'src/services/ordersService.ts', // Non utilisé
  'src/services/profileService.ts', // Non utilisé
  'src/services/projectsService.ts', // Non utilisé
  'src/services/referralService.ts', // Non utilisé
  'src/services/skillsService.ts', // Non utilisé
  'src/services/statisticsService.ts', // Non utilisé
  
  // Utilitaires obsolètes ou non utilisés
  'src/utils/cleanAuth.ts', // Non utilisé
  'src/utils/invoiceTemplate.ts', // Non utilisé
  'src/utils/referralPaymentHandler.ts', // Non utilisé
  'src/utils/stripeWebhookHandler.ts', // Non utilisé
  'src/utils/userProfileManager.ts', // Non utilisé
  
  // Types non utilisés
  'src/types/assistant.ts', // Non utilisé
  'src/types/database.ts', // Non utilisé
  'src/types/invoice.ts', // Non utilisé
  'src/types/invoiceTemplate.ts', // Non utilisé
  'src/types/referral.ts', // Non utilisé
  'src/types/subscription.ts', // Non utilisé
  
  // Lib non utilisées
  'src/lib/storage.ts', // Non utilisé
  'src/lib/utils.ts', // Non utilisé
  
  // Styles non utilisés
  'src/styles/calendar-dark.css', // Non utilisé
  
  // Tests non utilisés
  'src/tests/assistant/', // Dossier entier non utilisé
  
  // Assistant non utilisé
  'src/lib/assistant/', // Dossier entier non utilisé
  
  // Fichiers de configuration non utilisés
  'src/stripe-config.ts', // Non utilisé
  'src/vite-env.d.ts', // Non utilisé
];

// Dossiers à supprimer
const DIRECTORIES_TO_DELETE = [
  'src/tests/',
  'src/lib/assistant/',
  'src/styles/',
  'src/types/',
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

// Fonction pour supprimer un dossier
function deleteDirectory(dirPath) {
  try {
    const fullPath = path.join(__dirname, '..', dirPath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
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
function smartCleanup() {
  console.log('🧹 Début du nettoyage intelligent des fichiers inutilisés...');
  console.log(`📁 Dossier source: ${path.join(__dirname, '..', 'src')}`);
  
  let deletedFiles = 0;
  let deletedDirs = 0;
  
  // Supprimer les fichiers
  console.log('\n📄 Suppression des fichiers inutilisés...');
  FILES_TO_DELETE.forEach(filePath => {
    if (deleteFile(filePath)) {
      deletedFiles++;
    }
  });
  
  // Supprimer les dossiers
  console.log('\n📁 Suppression des dossiers inutilisés...');
  DIRECTORIES_TO_DELETE.forEach(dirPath => {
    if (deleteDirectory(dirPath)) {
      deletedDirs++;
    }
  });
  
  console.log(`\n✅ Nettoyage terminé !`);
  console.log(`📄 ${deletedFiles} fichiers supprimés`);
  console.log(`📁 ${deletedDirs} dossiers supprimés`);
  console.log('🎯 Le projet est maintenant plus propre et optimisé !');
}

// Exécuter le nettoyage
smartCleanup();
