# -- Stage 1: Build ------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (cached layer if package files unchanged)
COPY package*.json ./
RUN npm ci --prefer-offline

# Accept the backend URL as a build argument (baked into the JS bundle by Vite)
ARG VITE_BACKEND_URL=http://localhost:8080
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Copy source and build
COPY . .
RUN npm run build

# -- Stage 2: Runtime ----------------------------------------------------------
FROM nginx:alpine AS runtime

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]