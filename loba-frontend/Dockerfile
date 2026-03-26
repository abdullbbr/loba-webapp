FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Use lightweight nginx for serving
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx-docker.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
