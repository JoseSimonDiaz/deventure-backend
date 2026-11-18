# Imagen de desarrollo de cualquier servicio del backend. Se construye desde la RAÍZ del repo (ver
# infra/docker-compose.yml) porque necesita los paquetes compartidos de packages/.
# Las dependencias se instalan ANTES de copiar el código: la capa de `npm ci` queda en caché y solo
# se rehace cuando cambia un package.json, el lockfile o un schema.prisma. Como esa parte es igual
# para todos los servicios, BuildKit la construye una sola vez y la comparten las 7 imágenes.
FROM node:22-alpine
# Prisma necesita openssl en alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV HUSKY=0

COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/service-kit/package.json packages/service-kit/
COPY services/api-gateway/package.json services/api-gateway/
# El postinstall de cada servicio con Prisma corre `prisma generate`, que necesita su schema
COPY services/assistant-service/package.json services/assistant-service/
COPY services/assistant-service/prisma/schema.prisma services/assistant-service/prisma/
COPY services/auth-service/package.json services/auth-service/
COPY services/auth-service/prisma/schema.prisma services/auth-service/prisma/
COPY services/content-service/package.json services/content-service/
COPY services/content-service/prisma/schema.prisma services/content-service/prisma/
COPY services/gameplay-service/package.json services/gameplay-service/
COPY services/gameplay-service/prisma/schema.prisma services/gameplay-service/prisma/
COPY services/progress-service/package.json services/progress-service/
COPY services/progress-service/prisma/schema.prisma services/progress-service/prisma/
COPY services/rewards-service/package.json services/rewards-service/
COPY services/rewards-service/prisma/schema.prisma services/rewards-service/prisma/
RUN npm ci

COPY . .

ARG SERVICE
WORKDIR /app/services/${SERVICE}
# start:docker aplica migraciones (+ seed donde corresponde) y arranca
CMD ["npm", "run", "start:docker"]
