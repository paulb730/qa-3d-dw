# 🚀 Despliegue en Render (Costo $0/mes)

Este proyecto está configurado para desplegarse completamente **GRATIS** utilizando los planes gratuitos de Render, Neon (PostgreSQL) y Upstash (Redis).

## 📋 Arquitectura $0/mes

| Componente | Proveedor | Plan |
|------------|-----------|------|
| Frontend | Render | Static (Free) |
| Backend Services (x3) | Render | Web Service (Free) |
| PostgreSQL | Neon.tech | Serverless Free (0.5 GB) |
| Redis | Upstash | Serverless Free (10k req/day) |

> ⚠️ **Nota sobre el Plan Free de Render:** Los servicios web se "duermen" después de 15 minutos de inactividad. La primera petición después de este tiempo puede tardar ~30-50 segundos en responder (Cold Start). Esto es perfectamente aceptable para un entorno de QA/Desarrollo.

## 🛠️ Pasos para el Despliegue

### 1. Obtener las URLs de Base de Datos y Redis

1. **PostgreSQL:** Crea una base de datos gratuita en [Neon.tech](https://neon.tech). Copia la *Connection String*.
2. **Redis:** Crea una base de datos gratuita en [Upstash.com](https://upstash.com). Copia la *Redis URL*.

### 2. Desplegar con Render Blueprint

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"Blueprint"**
3. Conecta tu repositorio GitHub `qa-3d-dw`
4. Render leerá el archivo `render.yaml`

### 3. Configurar Variables de Entorno

Render te pedirá que completes las variables marcadas como `sync: false`. Llénales así:

#### Para `qa-3d-data-service`:
- `DATABASE_URL`: *(Pega la Connection String de Neon)*
- `NODE_ENV`: `production`
- `PORT`: `3002`

#### Para `qa-3d-qa-service`:
- `DATA_SERVICE_URL`: `http://qa-3d-data-service:3002` *(URL interna de Render)*
- `REDIS_URL`: *(Pega la URL de Upstash)*
- `NODE_ENV`: `production`
- `PORT`: `3001`

#### Para `qa-3d-scene-service`:
- `DATA_SERVICE_URL`: `http://qa-3d-data-service:3002` *(URL interna de Render)*
- `REDIS_URL`: *(Pega la URL de Upstash)*
- `NODE_ENV`: `production`
- `PORT`: `3003`

#### Para `qa-3d-frontend`:
- `VITE_DATA_SERVICE_URL`: *(URL pública del data-service, ej: https://qa-3d-data-service.onrender.com)*
- `VITE_QA_SERVICE_URL`: *(URL pública del qa-service)*
- `VITE_SCENE_SERVICE_URL`: *(URL pública del scene-service)*

> 💡 **Tip:** Puedes dejar las URLs del frontend vacías inicialmente, desplegar los servicios backend primero, y luego editar el frontend con las URLs públicas reales.

### 4. Ejecutar Migraciones

Una vez desplegado el Data Service:
1. Ve al dashboard de Render → `qa-3d-data-service` → **Shell**
2. Ejecuta: `npm run db:migrate`

## 🔄 Actualizaciones

Cada vez que hagas `git push` a la rama `main`, Render reconstruirá y desplegará automáticamente los cambios.
