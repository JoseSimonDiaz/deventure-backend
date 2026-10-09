# Imagen de desarrollo de rewards-service. Se construye desde la RAÍZ del repo (ver infra/docker-compose.yml)
# porque necesita los paquetes compartidos de packages/.
FROM node:22-alpine
WORKDIR /app
ENV HUSKY=0
COPY . .
RUN npm ci
WORKDIR /app/services/rewards-service
EXPOSE 3005
CMD ["npm", "start"]
