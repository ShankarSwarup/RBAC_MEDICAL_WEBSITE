# Build Stage
FROM node:18-alpine AS build-stage

WORKDIR /app

# Copy package requirements
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build Vite application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy built assets
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Dynamically substitute Railway dynamic port environment variable in Nginx config before startup
CMD ["sh", "-c", "sed -i 's/listen 80;/listen '\"${PORT:-80}\"';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
