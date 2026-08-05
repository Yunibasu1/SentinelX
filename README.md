# SentinelX — AI Infrastructure & Security Platform

Plataforma web para administradores de TI y pequeñas empresas que permite monitorizar servidores, dominios y aplicaciones desde un único panel de control. Proyecto en evolución por versiones (MVP → v1.0).

## ✨ Módulos

| Versión | Estado      | Módulos                                                          |
| ------- | ----------- | ---------------------------------------------------------------- |
| v1.0    | En curso ✔ | Login (JWT + refresh), Registro, Dashboard, Docker               |
| v1.1    | Pendiente  | DNS Lookup, WHOIS, SSL Checker, Historial                        |
| v1.2    | Pendiente  | Hash, Password, JWT Inspector, File Integrity                    |
| v1.3    | Pendiente  | IA (Groq / Ollama + LangChain), Chat, Recomendaciones            |
| v1.4    | Pendiente  | Reportes PDF/Excel/CSV, Gráficos                                 |
| v2.0    | Pendiente  | Notificaciones, Correos, Comparaciones, CI/CD                    |

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

## 📄 Licencia

MIT — uso libre para fines educativos y personales.

## 👨‍💻 Autor

Proyecto de portafolio. Desarrollado con enfoque profesional: commits por funcionalidad, ramas `feature/*`, y despliegue en la nube previsto para versiones futuras.
