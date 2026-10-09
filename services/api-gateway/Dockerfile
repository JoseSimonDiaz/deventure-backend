# Imagen de desarrollo de api-gateway. Se construye desde la RAÍZ del repo (ver infra/docker-compose.yml)
# porque necesita los paquetes compartidos de packages/.
FROM node:22-alpine
WORKDIR /app
ENV HUSKY=0
COPY . .
RUN npm ci
WORKDIR /app/services/api-gateway
EXPOSE 3000
CMD ["npm", "start"]
