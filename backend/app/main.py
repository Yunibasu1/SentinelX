from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, auth, dashboard, dns, hash_api, jwt, password, reports, ssl, whois
from app.core.config import settings
from app.database.db import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX)
app.include_router(dns.router, prefix=settings.API_V1_PREFIX)
app.include_router(ssl.router, prefix=settings.API_V1_PREFIX)
app.include_router(whois.router, prefix=settings.API_V1_PREFIX)
app.include_router(hash_api.router, prefix=settings.API_V1_PREFIX)
app.include_router(password.router, prefix=settings.API_V1_PREFIX)
app.include_router(jwt.router, prefix=settings.API_V1_PREFIX)
app.include_router(ai.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {"message": "SentinelX API", "docs": "/docs"}
