# Imagen de desarrollo de auth-service. Se construye desde la RAÍZ del repo (ver infra/docker-compose.yml)
# porque necesita los paquetes compartidos de packages/.
FROM node:22-alpine
# Prisma necesita openssl en alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV HUSKY=0
COPY . .
RUN npm ci
WORKDIR /app/services/auth-service
EXPOSE 3001
# Aplica migraciones + seed y arranca
CMD ["npm", "run", "start:docker"]
