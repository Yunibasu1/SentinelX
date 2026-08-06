# Despliegue en la nube (~15 minutos)

SentinelX se despliega en tres servicios gratuitos: **Neon** (base de datos), **Render** (backend) y **GitHub Pages** (frontend).

## 1. Base de datos — Neon (PostgreSQL, gratis)

1. Crea una cuenta en https://neon.tech ("Sign in with GitHub").
2. **New Project** → nombre `sentinelx` → **Create**.
3. Copia el **connection string** que empieza por `postgresql://...` (pestaña Connect). Guárdalo para el paso 2.

> Importante: en la nube no usamos SQLite porque los servidores gratuitos pierden los archivos al reiniciar. Todos tus datos (consultas, usuarios, historial) vivirán en esta base de datos.

## 2. Backend — Render (gratis)

1. Crea una cuenta en https://render.com ("Sign in with GitHub").
2. **New → Blueprint** → conecta el repositorio `SentinelX`.
3. Render detecta `render.yaml` y crea el servicio. Te pedirá las variables:
   - `DATABASE_URL` → el connection string de Neon del paso 1.
   - `SECRET_KEY` → genera una con: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `GROQ_API_KEY` → tu clave de https://console.groq.com.
   - `CORS_ORIGINS` → `http://localhost:5173,http://127.0.0.1:5173,https://yunibasu1.github.io`.
   - `SMTP_FROM` / `SMTP_PASSWORD` → déjalas vacías (avisos por correo opcionales).
4. **Apply** → espera a que el deploy termine (5–8 min la primera vez).
5. Copia la URL del servicio (p. ej. `https://sentinelx-backend.onrender.com`). Pruébala: `https://TU-URL/docs` debe abrir Swagger.

> El plan gratis de Render se duerme tras 15 minutos de inactividad; la primera petición tras dormirse tarda ~30 s en responder.
>
> El backend solo se re-despliega automáticamente cuando cambian archivos de `backend/` (ver `buildFilter` en `render.yaml`).

## 3. Frontend — GitHub Pages (100% gratis y automático)

1. En GitHub: **Settings → Pages** → en **Build and deployment**, elige **Source: GitHub Actions**. Guarda.
2. Crea un **secret** en **Settings → Secrets and variables → Actions**:
   - Nombre: `VITE_API_URL` → Valor: la URL del backend del paso 2 (p. ej. `https://sentinelx-backend.onrender.com`). El frontend añade `/api` automáticamente; si prefieres, puedes ponerla ya con `/api` al final y también funciona.
3. Cada `git push` a `main` con cambios en `frontend/` dispara el workflow `deploy-pages.yml`: compila el frontend y lo publica en `https://yunibasu1.github.io/SentinelX`.
4. Para verlo la primera vez: **Actions** → ejecuta la tarea **"Deploy frontend a GitHub Pages"** → espera a que termine y abre la URL que aparece en el resumen.

## 4. Comprobación

- Abre la URL de GitHub Pages, regístrate y prueba un análisis DNS/SSL: los datos deben guardarse en Neon (se comparten con el backend en Render).

## Alternativa: Frontend en Vercel

Si prefieres Vercel: importa el repo con **Root Directory: `frontend`**, define la variable `VITE_API_URL` con la URL de Render (con o sin `/api` al final) y activa `VITE_BASE_URL` con el dominio raíz. `frontend/vercel.json` ya tiene el rewrite SPA.
