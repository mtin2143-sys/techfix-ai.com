# Stage 1: Build the application
FROM node:20-slim AS builder
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install all dependencies (including devDependencies) so we can compile/build
RUN npm install

# Copy application source files
COPY . .

# Build both front-end (vite build) and back-end server (esbuild)
RUN npm run build

# Stage 2: Serve the application
FROM node:20-slim AS runner
WORKDIR /app

# Set container environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency definitions
COPY package*.json ./

# Install only production dependencies to keep the image small
RUN npm install --omit=dev

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Launch the application
CMD ["npm", "start"]
