# Исправления для nginx и HTTPS

## Проблемы, которые были найдены и исправлены:

### 1. Неправильные пути к статическим файлам
- **Проблема**: В docker-compose.yml nginx монтировал `./frontend:/usr/share/nginx/html`, но фронтенд собирался в `../dist`
- **Исправление**: Изменили `outDir` в vite.config.js на `dist` и обновили volume в docker-compose.yml на `./frontend/dist:/usr/share/nginx/html`

### 2. Отсутствие SSL сертификатов
- **Проблема**: nginx пытался использовать SSL сертификаты, которых не было
- **Исправление**: Создали папку `nginx/certs` и временно отключили HTTPS в nginx.conf

### 3. Конфликт портов
- **Проблема**: Фронтенд контейнер также слушал порт 4173, что могло создавать конфликты
- **Исправление**: Убрали проброс портов из frontend контейнера, так как nginx теперь обслуживает статические файлы

## Как запустить проект:

### Вариант 1: Базовый запуск
```bash
# Остановить все контейнеры
docker-compose down

# Пересобрать контейнеры
docker-compose build --no-cache

# Запустить проект
docker-compose up -d

# Проверить статус
docker-compose ps
```

### Вариант 2: Использование скрипта
```bash
# Linux/Mac
./start.sh

# Windows PowerShell
./start.ps1
```

## Настройка HTTPS (опционально):

### Для разработки (самоподписанный сертификат):
```bash
cd nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=libnet.site"
```

### Для продакшена:
1. Получите валидные сертификаты от Let's Encrypt или другого CA
2. Поместите их в папку `nginx/certs/`
3. Раскомментируйте HTTPS блок в `nginx/nginx.conf`
4. Включите редирект с HTTP на HTTPS

## Проверка работы:

После запуска сайт должен быть доступен по адресу:
- HTTP: http://localhost
- HTTPS: https://localhost (если настроены сертификаты)

## Отладка:

Если сайт не работает, проверьте логи:
```bash
# Логи nginx
docker-compose logs nginx

# Логи backend
docker-compose logs backend

# Логи frontend
docker-compose logs frontend

# Все логи
docker-compose logs
```

## Структура файлов:

```
libnet/
├── nginx/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── certs/
│       ├── README.md
│       ├── fullchain.pem (добавить)
│       └── privkey.pem (добавить)
├── frontend/
│   ├── Dockerfile
│   ├── vite.config.js (обновлен)
│   └── dist/ (создается при сборке)
├── docker-compose.yml (обновлен)
├── start.sh
└── start.ps1
```
