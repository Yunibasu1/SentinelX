# SentinelX — AI Infrastructure & Security Platform

Plataforma web para administradores de TI y pequeñas empresas que permite monitorizar servidores, dominios y aplicaciones desde un único panel de control. Proyecto en evolución por versiones (MVP → v1.0).

## ✨ Módulos

| Versión | Estado       | Módulos                                                          |
| ------- | ------------ | ---------------------------------------------------------------- |
| v1.0    | Completado ✔ | Login (JWT + refresh), Registro, Dashboard, Docker               |
| v1.1    | Completado ✔ | DNS Lookup, WHOIS, SSL Checker, Historial                        |
| v1.2    | Completado ✔ | Hash, Password, JWT Inspector, File Integrity                    |
| v1.3    | Completado ✔ | IA (Groq + LangChain), Chat, Recomendaciones                     |
| v1.4    | Completado ✔ | Reportes PDF/Excel/CSV, Gráficos                                 |
| v2.0    | Completado ✔ | Notificaciones, Correos, Comparaciones, Logs, CI/CD              |

## ⚙ Tecnologías

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query
- **Backend:** FastAPI, SQLAlchemy, Pydantic, PyJWT, bcrypt
- **Base de datos:** SQLite (local) / PostgreSQL (producción, Neon)
- **DevOps:** Docker, Docker Compose

## 🏗 Arquitectura

```text
                    Usuario
                       │
                React + TypeScript
                       │
                 HTTPS (REST API)
                       │
                 FastAPI (backend)
                   │     │     │
              Services │   AI Service
                   │     │     │
              PostgreSQL  Redis (futuro)
```

## 🚀 Instalación (desarrollo local)

Requisitos: Python 3.12+, Node 20+.

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload # http://localhost:8000
```

Documentación interactiva de la API (Swagger): http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

El frontend enlaza con el backend mediante un proxy (sin configuración extra).

## 🐳 Docker

```bash
docker compose up --build
```

Levanta backend (puerto 8000) y frontend (puerto 5173).

## 📖 API

Endpoints principales (prefijo `/api`):

| Método | Ruta                  | Descripción                       | Auth |
| ------ | --------------------- | --------------------------------- | ---- |
| POST   | `/auth/register`      | Crear cuenta                      | No   |
| POST   | `/auth/login`         | Iniciar sesión (devuelve JWT)     | No   |
| POST   | `/auth/refresh`       | Renovar tokens                    | No   |
| GET    | `/auth/me`            | Datos del usuario actual          | Sí   |
| GET    | `/dashboard/stats`    | Métricas del dashboard            | Sí   |
| POST   | `/dns/analyze`        | Análisis DNS de un dominio        | Sí   |
| POST   | `/ssl/check`          | Comprobar certificado SSL         | Sí   |
| POST   | `/whois/check`        | Consultar registro WHOIS          | Sí   |
| POST   | `/hash/upload`        | Calcular hash de un archivo       | Sí   |
| POST   | `/password/check`     | Analizar fortaleza de contraseña  | Sí   |
| POST   | `/jwt/inspect`        | Inspeccionar token JWT            | Sí   |
| POST   | `/ai/chat`            | Asistente IA (Groq)               | Sí   |
| GET    | `/reports/pdf`        | Informe en PDF                    | Sí   |
| GET    | `/reports/excel`      | Informe en Excel                  | Sí   |
| GET    | `/reports/csv`        | Informe en CSV                    | Sí   |
| GET    | `/notifications`      | Lista de notificaciones           | Sí   |
| GET    | `/notifications/logs` | Logs de actividad                 | Sí   |
| GET    | `/compare/dns`        | Comparar análisis DNS             | Sí   |
| GET    | `/compare/ssl`        | Comparar análisis SSL             | Sí   |

## 📄 Licencia

MIT — uso libre para fines educativos y personales.

## 🌐 Despliegue (nube, ~15 minutos)

### 1. Base de datos — Neon (PostgreSQL, gratis)

1. Crea una cuenta en https://neon.tech (botón "Sign in with GitHub").
2. **New Project** → nombre `sentinelx` → **Create**.
3. Copia el **connection string** que empieza por `postgresql://...` (pestaña Connect). Guárdalo para el paso 2.

> Importante: en la nube no usamos SQLite porque los servidores gratuitos pierden los archivos al reiniciar. Todos tus datos (consultas, usuarios, historial) vivirán en esta base de datos.

### 2. Backend — Render (gratis)

1. Crea una cuenta en https://render.com ("Sign in with GitHub").
2. **New → Blueprint** → conecta el repositorio `SentinelX`.
3. Render detecta `render.yaml` y crea el servicio. Te pedirá las variables:
   - `DATABASE_URL` → el connection string de Neon del paso 1.
   - `SECRET_KEY` → genera una con: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `GROQ_API_KEY` → tu clave de https://console.groq.com.
   - `CORS_ORIGINS` → `http://localhost:5173,http://127.0.0.1:5173,https://yunibasu1.github.io` (el dominio del paso 3).
   - `SMTP_FROM` / `SMTP_PASSWORD` → déjalas vacías (avisos por correo opcionales).
4. **Apply** → espera a que el deploy termine (5–8 min la primera vez).
5. Copia la URL del servicio (p. ej. `https://sentinelx-backend.onrender.com`). Pruébala: `https://TU-URL/docs` debe abrir Swagger.

> El plan gratis de Render se duerme tras 15 minutos de inactividad; la primera petición tras dormirse tarda ~30 s en responder.

### 3. Frontend — GitHub Pages (100% gratis y automático)

1. En GitHub: **Settings → Pages** → en **Build and deployment**, elige **Source: GitHub Actions**. Guarda.
2. Crea un **secret** en **Settings → Secrets and variables → Actions**:
   - Nombre: `VITE_API_URL` → Valor: la URL del backend del paso 2 (p. ej. `https://sentinelx-backend.onrender.com`).
3. Cada `git push` a `main` dispara el workflow `deploy-pages.yml`: compila el frontend y lo publica en `https://yunibasu1.github.io/SentinelX`.
4. Para verlo la primera vez: **Actions** → ejecuta la tarea **"Deploy frontend a GitHub Pages"** → espera a que termine y abre la URL que aparece en el resumen.

### 4. Comprobación

- Abre la URL de GitHub Pages, regístrate y prueba un análisis DNS/SSL: los datos deben guardarse en Neon (se comparten con el backend en Render).

### Alternativa: Frontend en Vercel

Si prefieres Vercel: importa el repo con **Root Directory: `frontend`**, define la variable `VITE_API_URL` con la URL de Render y activa `VITE_BASE_URL` con el dominio raíz. `frontend/vercel.json` ya tiene el rewrite SPA.

## 👨‍💻 Autor

Proyecto de portafolio. Desarrollado con enfoque profesional: commits por funcionalidad, ramas `feature/*`, y despliegue en la nube previsto para versiones futuras.
