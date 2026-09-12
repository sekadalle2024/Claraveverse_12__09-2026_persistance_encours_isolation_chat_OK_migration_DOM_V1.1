# Quick Push Script
Write-Host "=== Push rapide vers GitHub ===" -ForegroundColor Cyan

# Ajouter tous les fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add -A

# Verifier le statut
Write-Host "`nStatut Git:" -ForegroundColor Yellow
git status --short

# Creer le commit
$date = Get-Date -Format "dd-MM-yyyy HH:mm"
$commitMsg = "Update ClaraVerse - Modifications systeme persistance - $date"
Write-Host "`nCreation du commit..." -ForegroundColor Yellow
git commit -m $commitMsg

# Push vers GitHub
Write-Host "`nPush vers GitHub..." -ForegroundColor Yellow
git push origin main

# Statut final
Write-Host "`nStatut final:" -ForegroundColor Green
git status

Write-Host "`n=== Termine ===" -ForegroundColor Green
