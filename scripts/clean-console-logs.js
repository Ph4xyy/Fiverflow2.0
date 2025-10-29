/**
 * Script pour nettoyer automatiquement tous les console.log
 * dans le code source
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour nettoyer les logs dans un fichier
function cleanLogsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Patterns à nettoyer
    const patterns = [
      // console.log avec emojis et messages spécifiques
      /console\.log\([^)]*['"`][🔍🔧✅❌🎯🧹🛡️🔐📊💡⚠️][^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de debug
      /console\.log\([^)]*['"`](debug|Debug|DEBUG)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages d'info
      /console\.log\([^)]*['"`](info|Info|INFO)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de test
      /console\.log\([^)]*['"`](test|Test|TEST)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de vérification
      /console\.log\([^)]*['"`](check|Check|CHECK|vérification|Vérification)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de chargement
      /console\.log\([^)]*['"`](loading|Loading|LOADING|chargement|Chargement)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de succès
      /console\.log\([^)]*['"`](success|Success|SUCCESS|succès|Succès)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages d'erreur
      /console\.log\([^)]*['"`](error|Error|ERROR|erreur|Erreur)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de warning
      /console\.log\([^)]*['"`](warning|Warning|WARNING|avertissement|Avertissement)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de session
      /console\.log\([^)]*['"`](session|Session|SESSION)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages d'auth
      /console\.log\([^)]*['"`](auth|Auth|AUTH|authentification|Authentification)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages d'utilisateur
      /console\.log\([^)]*['"`](user|User|USER|utilisateur|Utilisateur)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de profil
      /console\.log\([^)]*['"`](profile|Profile|PROFILE|profil|Profil)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de données
      /console\.log\([^)]*['"`](data|Data|DATA|données|Données)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de récupération
      /console\.log\([^)]*['"`](fetch|Fetch|FETCH|récupération|Récupération)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de mise à jour
      /console\.log\([^)]*['"`](update|Update|UPDATE|mise à jour|Mise à jour)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de création
      /console\.log\([^)]*['"`](create|Create|CREATE|création|Création)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de suppression
      /console\.log\([^)]*['"`](delete|Delete|DELETE|suppression|Suppression)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de connexion
      /console\.log\([^)]*['"`](connect|Connect|CONNECT|connexion|Connexion)[^'"`]*['"`][^)]*\);?\s*/g,
      // console.log avec messages de déconnexion
      /console\.log\([^)]*['"`](disconnect|Disconnect|DISCONNECT|déconnexion|Déconnexion)[^'"`]*['"`][^)]*\);?\s*/g
    ];
    
    let cleaned = false;
    
    // Appliquer les patterns
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, '// Log supprimé pour la propreté\n');
        cleaned = true;
      }
    });
    
    // Nettoyer les lignes vides multiples
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (cleaned) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Nettoyé: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function cleanLogsInDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let totalCleaned = 0;
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      totalCleaned += cleanLogsInDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
      if (cleanLogsInFile(fullPath)) {
        totalCleaned++;
      }
    }
  });
  
  return totalCleaned;
}

// Exécuter le nettoyage
const srcPath = path.join(__dirname, '..', 'src');
console.log('🧹 Début du nettoyage des logs...');
console.log(`📁 Dossier source: ${srcPath}`);

const cleanedCount = cleanLogsInDirectory(srcPath);

console.log(`✅ Nettoyage terminé ! ${cleanedCount} fichiers nettoyés.`);
console.log('🎯 La console devrait maintenant être plus propre !');
