import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import type { Database } from '@qa-3d/database';

const { Pool } = pg;

// Cargar .env desde la raíz del monorepo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../../../.env');
dotenv.config({ path: envPath });

const databaseUrl = process.env.DATABASE_URL;

  console.error('❌ ERROR: DATABASE_URL no está definida en .env');
  process.exit(1);
}

const sslConfig = databaseUrl.includes('neon.tech')
  ? { rejectUnauthorized: false }
  : undefined;

// Pool de conexiones (usado para test y como base de Kysely)
export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslConfig,
  max: 10,
});

// Instancia de Kysely (usada por los repositorios)
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});

export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa');
    console.log('   Timestamp:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Error de conexión a BD:', (err as Error).message);
    return false;
  }
}
