# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma client (goes into src/generated/prisma)
RUN npx prisma generate

# Build TypeScript code (compiles to dist/)
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Copy prisma schema just in case it's needed for migrations or checking
COPY prisma ./prisma

# Ensure uploads directory exists
RUN mkdir -p uploads

# Expose the port your backend runs on
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start:prod"]
