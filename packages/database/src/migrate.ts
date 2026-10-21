import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

// ============================================
// 1. Cargar variables de entorno desde la raíz
// ============================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`✅ Variables de entorno cargadas desde: ${envPath}`);
} else {
  console.warn(`⚠️ No se encontró el archivo .env en: ${envPath}`);
}

// ============================================
// 2. Validar que DATABASE_URL exista
// ============================================
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: La variable DATABASE_URL no está definida.');
  console.error('   Asegúrate de tener un archivo .env en la raíz del monorepo.');
  process.exit(1);
}

console.log('🔌 Conectando a la base de datos...');

// ============================================
// 3. Configurar Pool de PostgreSQL
// ============================================
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('neon.tech') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined,
});

// ============================================
// 4. Función para ejecutar SQL directamente
// ============================================
async function executeSQL(sql: string): Promise<void> {
  await pool.query(sql);
}

// ============================================
// 5. Crear tabla de control de migraciones
// ============================================
async function ensureMigrationsTable(): Promise<void> {
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

// ============================================
// 6. Obtener migraciones ya aplicadas
// ============================================
async function getAppliedMigrations(): Promise<string[]> {
  const result = await pool.query('SELECT name FROM _migrations ORDER BY id');
  return result.rows.map((row: { name: string }) => row.name);
}

// ============================================
// 8. Definición de migraciones (SQL directo)
// ============================================
interface MigrationDef {
  name: string;
  up: string;
}

const migrations: MigrationDef[] = [
  {
    name: '001_initial_schema',
    up: `
      -- USERS
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        role VARCHAR(50) NOT NULL DEFAULT 'qa_engineer',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- SESSIONS
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

      -- WEB PAGES
      CREATE TABLE IF NOT EXISTS web_pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        processing_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        last_processed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS web_pages_user_id_idx ON web_pages(user_id);

      -- DOM SNAPSHOTS
      CREATE TABLE IF NOT EXISTS dom_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        web_page_id UUID NOT NULL REFERENCES web_pages(id) ON DELETE CASCADE,
        html_content TEXT NOT NULL,
        total_elements_found INTEGER NOT NULL DEFAULT 0,
        processing_duration_ms INTEGER,
        status VARCHAR(50) NOT NULL DEFAULT 'success',
        error_message TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS dom_snapshots_web_page_id_idx ON dom_snapshots(web_page_id);

      -- COMPONENT TYPES
      CREATE TABLE IF NOT EXISTS component_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        html_tag VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        icon_3d VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- LOCATORS
      CREATE TABLE IF NOT EXISTS locators (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dom_snapshot_id UUID NOT NULL REFERENCES dom_snapshots(id) ON DELETE CASCADE,
        component_type_id UUID NOT NULL REFERENCES component_types(id),
        locator_type VARCHAR(50) NOT NULL,
        locator_value TEXT NOT NULL,
        element_name VARCHAR(255) NOT NULL,
        element_text TEXT,
        stability_score NUMERIC(5,2) NOT NULL DEFAULT 0,
        is_default_stable BOOLEAN NOT NULL DEFAULT FALSE,
        position_x NUMERIC,
        position_y NUMERIC,
        screenshot_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS locators_dom_snapshot_id_idx ON locators(dom_snapshot_id);
      CREATE INDEX IF NOT EXISTS locators_component_type_id_idx ON locators(component_type_id);

      -- E2E TESTS
      CREATE TABLE IF NOT EXISTS e2e_tests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        canvas_config_json JSONB NOT NULL DEFAULT '{}',
        version INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS e2e_tests_user_id_idx ON e2e_tests(user_id);

      -- TEST NODES
      CREATE TABLE IF NOT EXISTS test_nodes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        e2e_test_id UUID NOT NULL REFERENCES e2e_tests(id) ON DELETE CASCADE,
        locator_id UUID NOT NULL REFERENCES locators(id),
        name VARCHAR(255) NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        action_config_json JSONB NOT NULL DEFAULT '{}',
        position_x NUMERIC NOT NULL DEFAULT 0,
        position_y NUMERIC NOT NULL DEFAULT 0,
        position_z NUMERIC NOT NULL DEFAULT 0,
        order_index INTEGER NOT NULL,
        parent_node_id UUID,
        timeout_ms INTEGER NOT NULL DEFAULT 30000,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS test_nodes_e2e_test_id_idx ON test_nodes(e2e_test_id);
      CREATE INDEX IF NOT EXISTS test_nodes_locator_id_idx ON test_nodes(locator_id);

      -- TEST EXECUTIONS
      CREATE TABLE IF NOT EXISTS test_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        e2e_test_id UUID NOT NULL REFERENCES e2e_tests(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id),
        status VARCHAR(50) NOT NULL DEFAULT 'queued',
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        duration_ms INTEGER,
        total_steps INTEGER NOT NULL DEFAULT 0,
        passed_steps INTEGER NOT NULL DEFAULT 0,
        failed_steps INTEGER NOT NULL DEFAULT 0,
        error_summary TEXT,
        browser_info_json JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS test_executions_e2e_test_id_idx ON test_executions(e2e_test_id);
      CREATE INDEX IF NOT EXISTS test_executions_user_id_idx ON test_executions(user_id);
      CREATE INDEX IF NOT EXISTS test_executions_status_idx ON test_executions(status);

      -- TEST STEPS
      CREATE TABLE IF NOT EXISTS test_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_execution_id UUID NOT NULL REFERENCES test_executions(id) ON DELETE CASCADE,
        test_node_id UUID NOT NULL REFERENCES test_nodes(id),
        step_index INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        action_performed TEXT,
        locator_used TEXT,
        locator_type_used VARCHAR(50),
        screenshot_url TEXT,
        video_clip_url TEXT,
        error_message TEXT,
        duration_ms INTEGER,
        executed_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS test_steps_execution_id_idx ON test_steps(test_execution_id);
      CREATE INDEX IF NOT EXISTS test_steps_node_id_idx ON test_steps(test_node_id);

      -- BUGS
      CREATE TABLE IF NOT EXISTS bugs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_execution_id UUID NOT NULL REFERENCES test_executions(id) ON DELETE CASCADE,
        test_step_id UUID,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        severity VARCHAR(50) NOT NULL DEFAULT 'major',
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        steps_to_reproduce_json JSONB,
        expected_result TEXT,
        actual_result TEXT,
        screenshot_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS bugs_execution_id_idx ON bugs(test_execution_id);

      -- TEST RESULT EXPORTS
      CREATE TABLE IF NOT EXISTS test_result_exports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_execution_id UUID NOT NULL REFERENCES test_executions(id) ON DELETE CASCADE,
        export_format VARCHAR(50) NOT NULL,
        export_data_json JSONB NOT NULL DEFAULT '{}',
        file_url TEXT,
        exported_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- TEST COMPARISONS
      CREATE TABLE IF NOT EXISTS test_comparisons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        e2e_test_id UUID NOT NULL REFERENCES e2e_tests(id),
        execution_ids_json JSONB NOT NULL DEFAULT '[]',
        comparison_type VARCHAR(50) NOT NULL,
        comparison_result_json JSONB NOT NULL DEFAULT '{}',
        space_3d_config_json JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS test_comparisons_user_id_idx ON test_comparisons(user_id);
      CREATE INDEX IF NOT EXISTS test_comparisons_e2e_test_id_idx ON test_comparisons(e2e_test_id);
    `,
  },
];

// ============================================
// 9. Ejecutar migraciones
// ============================================
async function migrateToLatest(): Promise<void> {
  try {
    console.log('🚀 Ejecutando migraciones pendientes...\n');

    await ensureMigrationsTable();
    const applied = await getAppliedMigrations();
    console.log(`📋 Migraciones ya aplicadas: ${applied.length}`);

    let executed = 0;

    for (const migration of migrations) {
      if (applied.includes(migration.name)) {
        console.log(`  ⏭️ Ya aplicada: ${migration.name}`);
        continue;
      }

      console.log(`  ⚙️ Aplicando: ${migration.name}...`);

      // Ejecutar dentro de una transacción
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(migration.up);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [migration.name]);
        await client.query('COMMIT');
        console.log(`  ✅ Aplicada: ${migration.name}`);
        executed++;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    if (executed === 0) {
      console.log('\nℹ️ No hay migraciones pendientes. La base de datos está actualizada.');
    } else {
      console.log(`\n🎉 ¡${executed} migración(es) aplicadas exitosamente!`);
    }
  } catch (err) {
    console.error('❌ Error en las migraciones:');
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// ============================================
// 10. Ejecutar
// ============================================
migrateToLatest();
