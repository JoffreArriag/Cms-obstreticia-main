# Docker — CMS Obstetricia (Persona 3)

Archivos de contenerización para el CMS Web de la Universidad de Guayaquil.  
Stack: **Angular 20 + ASP.NET Core 9 + SQL Server 2022 + NGINX**

---

## Estructura de archivos

```
docker-cms/
├── Dockerfile.frontend       # Angular (build multi-stage + NGINX)
├── Dockerfile.backend        # .NET 9 (build multi-stage + runtime)
├── docker-compose.yml        # Orquesta los 3 servicios
├── nginx/
│   └── nginx-frontend.conf   # Config NGINX: proxy reverso + SPA routing
├── .env.example              # Plantilla de variables de entorno
└── README.md                 # Este archivo
```

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) o Docker Engine (Linux)
- Docker Compose v2 (incluido en Docker Desktop)

Verificar instalación:
```bash
docker --version        # Docker version 25+
docker compose version  # Docker Compose version v2+
```

---

## Configuración inicial (solo la primera vez)

### 1. Ubicar los proyectos en la estructura correcta

El `docker-compose.yml` espera esta estructura de carpetas:

```
proyecto-raiz/
├── backend/        ← código del backend .NET (Backend_CMS_Vinculacion...)
├── frontend/       ← código del frontend Angular (Cms-obstreticia-main/)
└── docker-cms/     ← esta carpeta con los archivos Docker
```

### 2. Crear el archivo `.env`

```bash
cp docker-cms/.env.example docker-cms/.env
```

Editar `docker-cms/.env` y cambiar los valores sensibles:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_PASSWORD` | Contraseña SQL Server SA | `MiPass_2026!` |
| `JWT_SECRET` | Clave JWT (min 32 chars) | `MiClaveSecreta_2026_CMS_UG!!` |
| `LLAVE_PROTECTOR` | Clave de protección de datos | `CMS_Protector_2026` |
| `CORS_ORIGIN` | URL del frontend en producción | `https://cms.ug.edu.ec` |

---

## Levantar el sistema

### Desarrollo local (primera vez)

```bash
# Desde la carpeta raíz del proyecto
docker compose -f docker-cms/docker-compose.yml --env-file docker-cms/.env up --build
```

Esto hará:
1. Construir la imagen de Angular (npm install + ng build)
2. Construir la imagen de .NET (dotnet restore + dotnet publish)
3. Descargar SQL Server 2022
4. Levantar los 3 contenedores en red interna

### Acceder a la aplicación

| Servicio | URL |
|---|---|
| Frontend (CMS público + admin) | http://localhost |
| API .NET (Swagger) | http://localhost:5115/swagger |
| SQL Server | localhost:1433 (usuario: sa) |

### Levantar en segundo plano

```bash
docker compose -f docker-cms/docker-compose.yml --env-file docker-cms/.env up -d --build
```

### Ver logs

```bash
# Todos los servicios
docker compose -f docker-cms/docker-compose.yml logs -f

# Solo la API
docker compose -f docker-cms/docker-compose.yml logs -f api

# Solo el frontend
docker compose -f docker-cms/docker-compose.yml logs -f frontend
```

### Detener el sistema

```bash
docker compose -f docker-cms/docker-compose.yml down
```

### Detener y borrar datos (¡borra la BD!)

```bash
docker compose -f docker-cms/docker-compose.yml down -v
```

---

## Migraciones de base de datos

Al subir por primera vez, la base de datos estará vacía.  
Ejecutar las migraciones de Entity Framework desde dentro del contenedor:

```bash
docker exec -it cms_api dotnet ef database update \
  --project CMSVinculacion.Infrastructure \
  --startup-project CMSVinculacion.Api
```

O ejecutar el script SQL inicial incluido en el repositorio:

```bash
docker exec -i cms_sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "TuContraseña" -No \
  < SQLInicial.sql
```

---

## Rebuild de un solo servicio

Si solo cambió el frontend:
```bash
docker compose -f docker-cms/docker-compose.yml up -d --build frontend
```

Si solo cambió el backend:
```bash
docker compose -f docker-cms/docker-compose.yml up -d --build api
```

---

## Arquitectura de red interna

```
Internet
    │
    ▼
[ frontend:80 ] ← NGINX (API Gateway)
    │
    ├── /api/*   ──────► [ api:5115 ] ← ASP.NET Core 9
    │                         │
    └── /*       ──────► Angular SPA  [ sqlserver:1433 ] ← SQL Server 2022
                                            │
                                      [volumen: sqlserver_data]
```

Los contenedores `api` y `sqlserver` **no están expuestos a Internet** en producción,
solo NGINX recibe tráfico externo.

---

## Seguridad

- El archivo `.env` está en `.gitignore` — nunca lo subas al repositorio
- En producción, agregar SSL con Let's Encrypt (tarea de Persona 4 / CI-CD)
- La contraseña de SQL Server SA debe cumplir la política: mínimo 8 chars, mayúscula, número y símbolo
