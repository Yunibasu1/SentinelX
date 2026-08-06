# SentinelX — AI Infrastructure & Security Platform

Plataforma web para administradores de TI y pequeñas empresas que permite monitorizar servidores, dominios y aplicaciones desde un único panel de control.

## 🌐 Enlaces en vivo

| Recurso                     | URL                                                       |
| --------------------------- | --------------------------------------------------------- |
| 🌍 Web (GitHub Pages)       | https://yunibasu1.github.io/SentinelX                     |
| 🔧 API (Render)             | https://sentinelx-backend-pksd.onrender.com               |
| 📚 Documentación API        | https://sentinelx-backend-pksd.onrender.com/docs          |

> El plan gratis de Render se duerme tras 15 min de inactividad: la primera petición tarda ~30 s.

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
- **Base de datos:** PostgreSQL (Neon)
- **DevOps:** Docker, GitHub Actions (CI/CD + GitHub Pages)

## 🚀 Instalación (desarrollo local)

Requisitos: Python 3.12+, Node 20+.

**Backend**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload # http://localhost:8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Documentación interactiva de la API (Swagger): http://localhost:8000/docs

## 📖 API

Endpoints principales (prefijo `/api`):

| Método | Ruta                        | Descripción                     | Auth |
| ------ | --------------------------- | ------------------------------- | ---- |
| POST   | `/auth/register`            | Crear cuenta                    | No   |
| POST   | `/auth/login`               | Iniciar sesión (devuelve JWT)   | No   |
| POST   | `/auth/refresh`             | Renovar tokens                  | No   |
| GET    | `/auth/me`                  | Datos del usuario actual        | Sí   |
| GET    | `/dashboard/stats`          | Métricas del dashboard          | Sí   |
| POST   | `/dns/analyze`              | Análisis DNS de un dominio      | Sí   |
| POST   | `/ssl/check`                | Comprobar certificado SSL       | Sí   |
| POST   | `/whois/check`              | Consultar registro WHOIS        | Sí   |
| POST   | `/hash/upload`              | Calcular hash de un archivo     | Sí   |
| POST   | `/password/check`           | Analizar contraseña             | Sí   |
| POST   | `/jwt/inspect`              | Inspeccionar token JWT          | Sí   |
| POST   | `/ai/chat`                  | Asistente IA (Groq)             | Sí   |
| GET    | `/reports/{pdf,excel,csv}`  | Informes                        | Sí   |
| GET    | `/notifications`            | Notificaciones                  | Sí   |
| GET    | `/notifications/logs`       | Logs de actividad               | Sí   |
| GET    | `/compare/dns`              | Comparar análisis DNS           | Sí   |
| GET    | `/compare/ssl`              | Comparar análisis SSL           | Sí   |

## 🌐 Despliegue en la nube

Guía completa paso a paso (Neon → Render → GitHub Pages): [DEPLOYMENT.md](DEPLOYMENT.md)

## 📄 Licencia

MIT — uso libre para fines educativos y personales.
