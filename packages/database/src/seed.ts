import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

// Cargar variables de entorno desde la raíz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL no está definida');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('neon.tech') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined,
});

async function seed() {
  try {
    console.log('🌱 Seeding component types...\n');

    const componentTypes = [
      { name: 'Button', html_tag: 'button', category: 'interactive', description: 'Botón clickeable' },
      { name: 'Input Text', html_tag: 'input', category: 'form', description: 'Campo de texto' },
      { name: 'Input Password', html_tag: 'input[type=password]', category: 'form', description: 'Campo de contraseña' },
      { name: 'Input Email', html_tag: 'input[type=email]', category: 'form', description: 'Campo de email' },
      { name: 'Input Date', html_tag: 'input[type=date]', category: 'form', description: 'Selector de fecha' },
      { name: 'Input File', html_tag: 'input[type=file]', category: 'form', description: 'Selector de archivo' },
      { name: 'Input Number', html_tag: 'input[type=number]', category: 'form', description: 'Campo numérico' },
      { name: 'Input Tel', html_tag: 'input[type=tel]', category: 'form', description: 'Campo de teléfono' },
      { name: 'Select', html_tag: 'select', category: 'form', description: 'Dropdown de selección' },
      { name: 'Checkbox', html_tag: 'input[type=checkbox]', category: 'form', description: 'Casilla de verificación' },
      { name: 'Radio', html_tag: 'input[type=radio]', category: 'form', description: 'Botón de radio' },
      { name: 'Textarea', html_tag: 'textarea', category: 'form', description: 'Área de texto multilinea' },
      { name: 'Link', html_tag: 'a', category: 'navigation', description: 'Enlace de navegación' },
      { name: 'Image', html_tag: 'img', category: 'display', description: 'Imagen' },
      { name: 'Table', html_tag: 'table', category: 'display', description: 'Tabla de datos' },
      { name: 'Modal', html_tag: 'div[class*=modal]', category: 'container', description: 'Ventana modal' },
      { name: 'Navigation Menu', html_tag: 'nav', category: 'navigation', description: 'Menú de navegación' },
      { name: 'List Item', html_tag: 'li', category: 'display', description: 'Elemento de lista' },
      { name: 'Form', html_tag: 'form', category: 'container', description: 'Formulario' },
      { name: 'Div Container', html_tag: 'div', category: 'container', description: 'Contenedor genérico' },
      { name: 'Header', html_tag: 'header', category: 'container', description: 'Encabezado de página' },
      { name: 'Footer', html_tag: 'footer', category: 'container', description: 'Pie de página' },
      { name: 'Card', html_tag: 'div[class*=card]', category: 'display', description: 'Tarjeta de contenido' },
    ];

    let inserted = 0;
    let skipped = 0;

    for (const ct of componentTypes) {
      const checkResult = await pool.query(
        'SELECT id FROM component_types WHERE name = $1',
        [ct.name]
      );

      if (checkResult.rows.length === 0) {
        await pool.query(
          'INSERT INTO component_types (name, html_tag, category, description) VALUES ($1, $2, $3, $4)',
          [ct.name, ct.html_tag, ct.category, ct.description]
        );
        console.log(`  ✅ Insertado: ${ct.name}`);
        inserted++;
      } else {
        console.log(`  ⏭️ Ya existe: ${ct.name}`);
        skipped++;
      }
    }

    console.log(`\n🎉 Seed completado: ${inserted} insertados, ${skipped} omitidos`);
  } catch (err) {
    console.error('❌ Error en el seed:');
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
