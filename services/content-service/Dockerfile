FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV HUSKY=0
COPY . .
RUN npm ci
WORKDIR /app/services/content-service
EXPOSE 3002
CMD ["npm", "run", "start:docker"]
