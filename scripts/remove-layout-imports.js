const fs = require('fs');
const path = require('path');

// Liste des pages à nettoyer
const pages = [
    'src/pages/CalendarPageNew.tsx',
    'src/pages/TasksPage.tsx', 
    'src/pages/OrdersPage.tsx',
    'src/pages/NetworkPage.tsx',
    'src/pages/ClientsPageOptimized.tsx',
    'src/pages/ProfileRedirect.tsx',
    'src/pages/AdminDashboard.tsx',
    'src/pages/SettingsPage.tsx',
    'src/pages/ProjectDetailPage.tsx',
    'src/pages/ProfileSettingsPage.tsx',
    'src/pages/ReferralsPage.tsx',
    'src/pages/StatsPage.tsx',
    'src/pages/UpgradePageNew.tsx',
    'src/pages/PricingPageNew.tsx',
    'src/pages/TemplatesPage.tsx'
];

console.log('🔧 Suppression des Layout dupliqués...');

pages.forEach(pagePath => {
    if (fs.existsSync(pagePath)) {
        console.log(`📄 Traitement de ${pagePath}...`);
        
        let content = fs.readFileSync(pagePath, 'utf8');
        
        // Supprimer l'import de Layout
        content = content.replace(/import Layout from ['"]\.\.\/components\/Layout['"];?\n?/g, '');
        content = content.replace(/import Layout from ['"]\.\.\/\.\.\/components\/Layout['"];?\n?/g, '');
        
        // Supprimer les balises Layout
        content = content.replace(/<Layout>\s*/g, '');
        content = content.replace(/\s*<\/Layout>/g, '');
        
        // Nettoyer les espaces multiples
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        fs.writeFileSync(pagePath, content);
        console.log(`  ✅ Layout supprimé de ${pagePath}`);
    } else {
        console.log(`  ⚠️ Fichier non trouvé: ${pagePath}`);
    }
});

console.log('🎯 Nettoyage terminé!');
