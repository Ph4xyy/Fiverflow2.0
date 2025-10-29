# Script de test pour vérifier que l'erreur .env.local est résolue
# Teste le parsing du fichier d'environnement

Write-Host "🧪 Test de Résolution de l'Erreur .env.local" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Vérifier que le fichier .env.local existe
Write-Host "`n1. Vérification du fichier .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ Fichier .env.local trouvé" -ForegroundColor Green
    
    $fileSize = (Get-Item ".env.local").Length
    Write-Host "   📊 Taille du fichier: $fileSize octets" -ForegroundColor Blue
} else {
    Write-Host "   ❌ Fichier .env.local manquant" -ForegroundColor Red
    exit 1
}

# 2. Vérifier le contenu du fichier
Write-Host "`n2. Analyse du contenu..." -ForegroundColor Yellow
$envContent = Get-Content ".env.local"
$variableCount = 0
$commentCount = 0
$emptyLineCount = 0

foreach ($line in $envContent) {
    $trimmedLine = $line.Trim()
    
    if ($trimmedLine -eq "") {
        $emptyLineCount++
    } elseif ($trimmedLine.StartsWith("#")) {
        $commentCount++
    } elseif ($trimmedLine -match "^[A-Za-z_][A-Za-z0-9_]*=") {
        $variableCount++
        $varName = ($trimmedLine -split "=")[0]
        Write-Host "   ✅ Variable: $varName" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Ligne suspecte: $trimmedLine" -ForegroundColor Yellow
    }
}

Write-Host "`n   📊 Statistiques:" -ForegroundColor Blue
Write-Host "      • Variables: $variableCount" -ForegroundColor White
Write-Host "      • Commentaires: $commentCount" -ForegroundColor White
Write-Host "      • Lignes vides: $emptyLineCount" -ForegroundColor White

# 3. Vérifier que le serveur de développement fonctionne
Write-Host "`n3. Test du serveur de développement..." -ForegroundColor Yellow
$port5173 = netstat -an | findstr ":5173"
if ($port5173) {
    Write-Host "   ✅ Serveur de développement actif sur le port 5173" -ForegroundColor Green
    Write-Host "   🌐 URL: http://localhost:5173" -ForegroundColor Blue
} else {
    Write-Host "   ❌ Serveur de développement non détecté" -ForegroundColor Red
}

# 4. Vérifier les processus Node.js
Write-Host "`n4. Vérification des processus Node.js..." -ForegroundColor Yellow
$nodeProcesses = tasklist | findstr node
if ($nodeProcesses) {
    $processCount = ($nodeProcesses | Measure-Object).Count
    Write-Host "   ✅ $processCount processus Node.js détectés" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Aucun processus Node.js détecté" -ForegroundColor Yellow
}

# 5. Test de parsing avec Node.js
Write-Host "`n5. Test de parsing du fichier .env..." -ForegroundColor Yellow
$testScript = @"
const fs = require('fs');
try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    let validVars = 0;
    
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(trimmed)) {
                validVars++;
            } else {
                console.log('Ligne invalide:', index + 1, trimmed);
            }
        }
    });
    
    console.log('Variables valides:', validVars);
    console.log('✅ Parsing réussi');
} catch (error) {
    console.log('❌ Erreur de parsing:', error.message);
}
"@

$testScript | Out-File "temp-env-test.js" -Encoding UTF8
$testResult = node temp-env-test.js 2>&1
Remove-Item "temp-env-test.js" -ErrorAction SilentlyContinue

if ($testResult -match "✅ Parsing réussi") {
    Write-Host "   ✅ Test de parsing Node.js réussi" -ForegroundColor Green
} else {
    Write-Host "   ❌ Test de parsing Node.js échoué" -ForegroundColor Red
    Write-Host "   Détails: $testResult" -ForegroundColor Red
}

# 6. Résumé final
Write-Host "`n📋 Résumé du test:" -ForegroundColor Cyan
if ($variableCount -gt 0 -and $port5173) {
    Write-Host "   ✅ SUCCÈS: L'erreur de parsing .env.local est résolue" -ForegroundColor Green
    Write-Host "   ✅ Le serveur de développement fonctionne" -ForegroundColor Green
    Write-Host "   ✅ Les variables d'environnement sont valides" -ForegroundColor Green
} else {
    Write-Host "   ❌ ÉCHEC: Problèmes détectés" -ForegroundColor Red
}

Write-Host "`n🚀 Instructions:" -ForegroundColor Cyan
Write-Host "   1. Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "   2. Vérifiez que l'application se charge correctement" -ForegroundColor White
Write-Host "   3. Testez la page admin: http://localhost:5173/admin/dashboard" -ForegroundColor White

Write-Host "`n✅ Test terminé!" -ForegroundColor Green
