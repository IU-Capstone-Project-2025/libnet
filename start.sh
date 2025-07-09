#!/bin/bash

# Скрипт для запуска проекта с nginx

echo "Останавливаем контейнеры..."
docker-compose down

echo "Пересобираем контейнеры..."
docker-compose build --no-cache

echo "Запускаем контейнеры..."
docker-compose up -d

echo "Ждем запуска контейнеров..."
sleep 10

echo "Проверяем статус контейнеров..."
docker-compose ps

echo "Сайт доступен на:"
echo "- HTTP: http://localhost"
echo "- HTTPS: https://localhost (если настроены сертификаты)"

echo "Для просмотра логов nginx: docker-compose logs nginx"
echo "Для просмотра логов backend: docker-compose logs backend"
echo "Для просмотра логов frontend: docker-compose logs frontend"
