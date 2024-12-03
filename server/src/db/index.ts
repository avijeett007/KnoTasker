import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;

// Create a new postgres client
const client = postgres(connectionString, { max: 1 });

// Test the connection
async function testConnection() {
  try {
    await client`SELECT 1`;
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Create drizzle database instance
const db = drizzle(client, { schema });

// Test connection on startup
testConnection();

export default db;
