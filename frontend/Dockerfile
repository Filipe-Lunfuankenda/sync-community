# frontend/Dockerfile
# Build Stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Serve Stage usando Nginx puro super leve
FROM nginx:alpine

# Copiar os assets estáticos buildados do vite para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar ficheiro de configuração custom do nginx para SPA (Single Page Applications)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
