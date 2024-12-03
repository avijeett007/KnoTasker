FROM node:18-alpine

WORKDIR /app

# Copy necessary files for database operations
COPY package*.json ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY db/ ./db/
COPY shared/ ./shared/

# Install dependencies
RUN npm install

# Copy and make the initialization script executable
COPY db/init.sh ./
RUN chmod +x init.sh

# Run the initialization script
CMD ["./init.sh"]
