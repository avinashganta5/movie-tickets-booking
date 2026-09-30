# ================================
# Stage 1: Install dependencies
# ================================
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm install --production


# ================================
# Stage 2: Production
# ================================
FROM node:22-alpine 

WORKDIR /app

ENV NODE_ENV=production

COPY --from=dependencies /app .

EXPOSE 3000

CMD ["npm", "start"]
