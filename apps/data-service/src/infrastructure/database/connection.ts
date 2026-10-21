import pg from 'pg';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Kysely, PostgresDialect } from 'kysely';
import type { Database } from '@qa-3d/database';



const { Pool } = pg;

// Cargar .env desde la raíz del monorepo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Probar múltiples rutas posibles para mayor robustez
const possiblePaths = [
  path.resolve(__dirname, '../../../../../.env'),  // 5 niveles (desde connection.ts)
  path.resolve(__dirname, '../../../../.env'),      // 4 niveles (por si acaso)
  path.resolve(process.cwd(), '../../.env'),        // Relativo al CWD
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  console.log(`🔍 Probando ruta: ${envPath}`);
  const result = dotenv.config({ path: envPath });
  if (process.env.DATABASE_URL) {
    console.log(`✅ .env cargado desde: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.error('❌ No se pudo cargar .env desde ninguna ruta');
}


console.log('📦 [DEBUG] DATABASE_URL cargada:', !!process.env.DATABASE_URL);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL no está definida en .env');
  console.error('   Crea un archivo .env en la raíz del monorepo con:');
  console.error('   DATABASE_URL=postgresql://usuario:password@host/dbname');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl?.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : undefined,
  max: 10,
});

// Instancia de Kysely (usada por los repositorios)
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});

export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa');
    console.log('   Timestamp del servidor:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Error de conexión a BD:', (err as Error).message);
    return false;
  }
}