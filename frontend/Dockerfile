# build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# production stage
FROM nginx:latest

COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./certs /etc/nginx/certs

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]