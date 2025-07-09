# PowerShell скрипт для запуска проекта с nginx

Write-Host "Останавливаем контейнеры..." -ForegroundColor Yellow
docker-compose down

Write-Host "Пересобираем контейнеры..." -ForegroundColor Yellow
docker-compose build --no-cache

Write-Host "Запускаем контейнеры..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "Ждем запуска контейнеров..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Проверяем статус контейнеров..." -ForegroundColor Yellow
docker-compose ps

Write-Host "Сайт доступен на:" -ForegroundColor Green
Write-Host "- HTTP: http://localhost" -ForegroundColor Green
Write-Host "- HTTPS: https://localhost (если настроены сертификаты)" -ForegroundColor Green

Write-Host "Для просмотра логов nginx: docker-compose logs nginx" -ForegroundColor Cyan
Write-Host "Для просмотра логов backend: docker-compose logs backend" -ForegroundColor Cyan
Write-Host "Для просмотра логов frontend: docker-compose logs frontend" -ForegroundColor Cyan
