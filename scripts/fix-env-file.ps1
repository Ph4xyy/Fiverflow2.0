# Script pour créer et diagnostiquer le fichier .env.local
# Résout l'erreur "unexpected character '#' in variable name"

Write-Host "🔧 Création et Diagnostic du fichier .env.local" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Vérifier si le fichier .env.local existe
if (Test-Path ".env.local") {
    Write-Host "`n⚠️  Le fichier .env.local existe déjà" -ForegroundColor Yellow
    Write-Host "   Sauvegarde en cours..." -ForegroundColor Gray
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item ".env.local" ".env.local.backup.$timestamp"
    Write-Host "   ✅ Sauvegarde créée: .env.local.backup.$timestamp" -ForegroundColor Green
}

# 2. Créer le fichier .env.local à partir de env.example
Write-Host "`n📝 Création du fichier .env.local..." -ForegroundColor Yellow

if (Test-Path "env.example") {
    Copy-Item "env.example" ".env.local"
    Write-Host "   ✅ Fichier .env.local créé à partir de env.example" -ForegroundColor Green
} else {
    Write-Host "   ❌ Le fichier env.example n'existe pas!" -ForegroundColor Red
    exit 1
}

# 3. Vérifier le contenu du fichier créé
Write-Host "`n🔍 Vérification du contenu du fichier .env.local..." -ForegroundColor Yellow

$envContent = Get-Content ".env.local"
$lineNumber = 0
$hasErrors = $false

foreach ($line in $envContent) {
    $lineNumber++
    
    # Ignorer les lignes vides et les commentaires
    if ($line.Trim() -eq "" -or $line.Trim().StartsWith("#")) {
        continue
    }
    
    # Vérifier le format des variables d'environnement
    if ($line -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
        $varName = $matches[1]
        $varValue = $matches[2]
        
        # Vérifier s'il y a des caractères problématiques dans le nom
        if ($varName -match "[#\s]") {
            Write-Host "   ❌ Ligne $lineNumber : Nom de variable invalide '$varName'" -ForegroundColor Red
            Write-Host "      Contient des caractères interdits: # ou espaces" -ForegroundColor Red
            $hasErrors = $true
        } else {
            Write-Host "   ✅ Ligne $lineNumber : $varName" -ForegroundColor Green
        }
        
        # Vérifier les valeurs qui pourraient causer des problèmes
        if ($varValue -match "^pk_live_|^sk-proj-") {
            Write-Host "   ⚠️  Ligne $lineNumber : Clé API sensible détectée" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Ligne $lineNumber : Format invalide '$line'" -ForegroundColor Red
        $hasErrors = $true
    }
}

# 4. Résumé
Write-Host "`n📊 Résumé du diagnostic:" -ForegroundColor Cyan

if ($hasErrors) {
    Write-Host "   ❌ Des erreurs ont été détectées dans le fichier .env.local" -ForegroundColor Red
    Write-Host "   🔧 Correction automatique en cours..." -ForegroundColor Yellow
    
    # Corriger les erreurs communes
    $correctedContent = @()
    foreach ($line in $envContent) {
        if ($line.Trim() -eq "" -or $line.Trim().StartsWith("#")) {
            $correctedContent += $line
        } elseif ($line -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
            $correctedContent += $line
        } else {
            # Essayer de corriger les lignes problématiques
            $correctedLine = $line -replace "[#\s]", "_"
            Write-Host "   🔧 Ligne corrigée: '$line' -> '$correctedLine'" -ForegroundColor Blue
            $correctedContent += $correctedLine
        }
    }
    
    # Sauvegarder le fichier corrigé
    $correctedContent | Out-File ".env.local" -Encoding UTF8
    Write-Host "   ✅ Fichier .env.local corrigé et sauvegardé" -ForegroundColor Green
} else {
    Write-Host "   ✅ Aucune erreur détectée dans le fichier .env.local" -ForegroundColor Green
}

# 5. Instructions pour tester
Write-Host "`n🧪 Instructions pour tester:" -ForegroundColor Cyan
Write-Host "   1. Exécutez: npm run dev" -ForegroundColor White
Write-Host "   2. Vérifiez que l'application se lance sans erreur" -ForegroundColor White
Write-Host "   3. Si l'erreur persiste, vérifiez les logs de Vite" -ForegroundColor White

# 6. Commandes utiles
Write-Host "`n🛠️  Commandes utiles:" -ForegroundColor Cyan
Write-Host "   • Voir le contenu: Get-Content .env.local" -ForegroundColor White
Write-Host "   • Vérifier les variables: npm run build" -ForegroundColor White
Write-Host "   • Nettoyer le cache: npm run clean" -ForegroundColor White

Write-Host "`n✅ Script terminé!" -ForegroundColor Green