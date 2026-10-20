# QA-3D-DW 🎮

**Sistema de QA Inmersivo 3D con Data Warehouse**

Plataforma que unifica la automatización de pruebas QA con visualización 3D inmersiva y lectura interactiva de datos desde un Data Warehouse.

## 🏗️ Arquitectura

Monorepo con **Turborepo** que contiene:

### Apps
- **`@qa-3d/frontend`** - SPA Vanilla + Three.js (motor 3D con ECS)
- **`@qa-3d/data-service`** - API Fastify para PostgreSQL
- **`@qa-3d/qa-service`** - Pipeline de pruebas parametrizable
- **`@qa-3d/scene-service`** - Generador de configuraciones 3D

### Packages
- **`@qa-3d/shared`** - Tipos y utilidades compartidas
- **`@qa-3d/database`** - Schema, migraciones y seeds
- **`@qa-3d/config`** - Configuraciones compartidas (TS, ESLint, Prettier)

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | TypeScript + Vite + Three.js (Vanilla) |
| Backend | Node.js 20 + Fastify 4 + Kysely |
| Database | PostgreSQL 15 (Render) |
| Cache | Redis (Render) |
| Testing | Vitest + Playwright |
| CI/CD | GitHub Actions + Render |
| Monorepo | Turborepo + npm workspaces |

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL 15+
- Redis 7+

### Instalación
```bash
# Clonar repositorio
git clone <repo-url>
cd qa-3d-dw

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones de BD
npm run db:migrate

# Iniciar todos los servicios
npm run dev



npm run dev          # Inicia todos los servicios en modo desarrollo
npm run build        # Compila todos los workspaces
npm run test         # Ejecuta tests unitarios
npm run test:e2e     # Ejecuta tests E2E con Playwright
npm run lint         # Ejecuta ESLint en todos los workspaces
npm run lint:fix     # Corrige errores de lint automáticamente
npm run format       # Formatea código con Prettier
npm run typecheck    # Verifica tipos TypeScript
┌─────────────────────────────────────┐
│   Presentation (UI / Routes)        │
├─────────────────────────────────────┤
│   Application (Use Cases)           │
├─────────────────────────────────────┤
│   Domain (Business Logic)           │
├─────────────────────────────────────┤
│   Infrastructure (Adapters)         │
└─────────────────────────────────────┘

---

## 📝 Paso 3: Crear un `LICENSE` (MIT)

```bash
cat << 'EOF' > LICENSE
MIT License

Copyright (c) 2026 QA-3D-DW

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
