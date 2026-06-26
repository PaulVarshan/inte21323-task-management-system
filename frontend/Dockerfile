# Stage 1: Build the React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Vite project for production
# This generates the static files into /app/dist
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the builder stage
# Vite outputs to /dist by default
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
