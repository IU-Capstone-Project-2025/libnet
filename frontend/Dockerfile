FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# Создаем volume для собранных файлов
VOLUME ["/app/dist"]

EXPOSE 4173
CMD ["npm", "run", "preview"]