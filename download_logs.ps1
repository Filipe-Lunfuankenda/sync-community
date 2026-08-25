# Baixa todos os relatórios/logs dos GitHub Actions recentes
# Requer a GitHub CLI (gh) instalada e autenticada: https://cli.github.com/

Write-Host "A procurar os artefactos dos últimos Actions..." -ForegroundColor Cyan

# Verifica se o gh está instalado
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "Erro: GitHub CLI (gh) não está instalado. Instale a partir de https://cli.github.com/" -ForegroundColor Red
    exit 1
}

$repo = "Filipe-Lunfuankenda/sync-community"
$downloadDir = ".\logs_baixados"

if (!(Test-Path -Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir | Out-Null
}

Write-Host "A descarregar artefactos para a pasta '$downloadDir'..." -ForegroundColor Cyan

# Descarrega os artefactos do run mais recente
gh run download -R $repo -D $downloadDir

Write-Host "Download concluído! Verifique a pasta '$downloadDir'." -ForegroundColor Green
