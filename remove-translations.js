// Script to remove language translations and replace with English text
const fs = require('fs');
const path = require('path');

// Read the LanguageContext to extract English translations
const langContextPath = 'src/contexts/LanguageContext.tsx';
const langContent = fs.readFileSync(langContextPath, 'utf8');

// Extract all English translations
const enTranslations = {};
const lines = langContent.split('\n');
let inEn = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('en: {') && !inEn) {
    inEn = true;
    braceCount = 1;
    continue;
  }
  
  if (inEn) {
    // Count braces
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    
    // Extract key-value pairs
    const match = line.match(/['"]([^'"]+)['"]\s*:\s*['"](.+?)['"],?\s*$/);
    if (match) {
      const key = match[1];
      const value = match[2];
      enTranslations[key] = value;
    }
    
    if (braceCount === 0) {
      inEn = false;
    }
  }
}

console.log(`Extracted ${Object.keys(enTranslations).length} translations`);

// Files to process
const filesToProcess = [
  'src/pages/RegisterPage.tsx',
  'src/components/RegistrationForm.tsx',
  'src/pages/UpgradePage.tsx',
  'src/pages/ProfilePage.tsx',
  'src/pages/DashboardPage.tsx',
  'src/pages/OrdersPage.tsx',
  'src/pages/InvoiceTemplatesPage.tsx',
  'src/pages/InvoiceTemplateEditorPage.tsx',
  'src/pages/TemplatesPage.tsx',
  'src/pages/SupportPage.tsx',
  'src/pages/ClientsPage.tsx',
  'src/pages/InvoicesPage.tsx',
  'src/pages/TasksPage.tsx',
  'src/components/TaskManager.tsx',
  'src/pages/PricingPage.tsx',
  'src/pages/TodoListPage.tsx',
  'src/pages/StatsPage.tsx',
  'src/pages/NetworkPage.tsx',
  'src/pages/SuccessPage.tsx',
  'src/pages/OnboardingPage.tsx',
  'src/components/SearchTestComponent.tsx',
  'src/components/CentralizedSearchBar.tsx',
];

let totalReplacements = 0;

filesToProcess.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;
  
  // Remove import of useLanguage
  content = content.replace(/import\s*\{\s*[^}]*useLanguage[^}]*\}\s*from\s*['"][^'"]+LanguageContext['"];?\n?/g, '');
  
  // Remove const { t } = useLanguage(); and variations
  content = content.replace(/const\s*\{\s*t[^}]*\}\s*=\s*useLanguage\(\);?\n?/g, '');
  
  // Replace t('key') calls with English text
  content = content.replace(/t\(['"]([\w.]+)['"]\)/g, (match, key) => {
    const translation = enTranslations[key];
    if (translation) {
      fileReplacements++;
      return `'${translation.replace(/'/g, "\\'")}'`;
    }
    console.log(`  Warning: No translation found for key: ${key} in ${filePath}`);
    return match;
  });
  
  // Replace {t('key')} in JSX with {string}
  content = content.replace(/\{t\(['"]([\w.]+)['"]\)\}/g, (match, key) => {
    const translation = enTranslations[key];
    if (translation) {
      fileReplacements++;
      return translation;
    }
    console.log(`  Warning: No translation found for key: ${key} in ${filePath}`);
    return match;
  });
  
  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${filePath}: ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  } else {
    console.log(`  ${filePath}: no changes needed`);
  }
});

console.log(`\nTotal replacements: ${totalReplacements}`);

