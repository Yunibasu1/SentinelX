from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.exceptions import LangChainException
from groq import RateLimitError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.dns import DNSLookup
from app.models.hash import FileHash
from app.models.password import PasswordCheck
from app.models.ssl import SSLCheck
from app.models.user import User
from app.models.whois import WhoisCheck

SYSTEM_PROMPT = """Eres SentinelAI, un asistente experto en ciberseguridad integrado en SentinelX.
Respondes en español, de forma clara y con consejos accionables.
Cuando el usuario incluya datos de análisis (DNS, SSL, WHOIS, contraseñas o hashes),
interprétalos y propón remediaciones concretas.
No inventes datos: si algo no aparece en el contexto, dilo y sugiere ejecutar el análisis."""


def _recent_context(db: Session, user: User) -> str:
    """Construye un resumen de los últimos análisis del usuario para dar contexto al modelo."""
    parts: list[str] = []

    dns = (
        db.query(DNSLookup)
        .filter(DNSLookup.user_id == user.id)
        .order_by(DNSLookup.created_at.desc())
        .limit(3)
        .all()
    )
    for item in dns:
        a_ips = ", ".join(
            r.value for r in item.records if r.type == "A"
        )[:80]
        parts.append(
            f"DNS {item.domain}: {len(item.records)} registros, {a_ips or 'sin IPs'}"
        )

    ssl = (
        db.query(SSLCheck)
        .filter(SSLCheck.user_id == user.id)
        .order_by(SSLCheck.created_at.desc())
        .limit(3)
        .all()
    )
    for item in ssl:
        parts.append(
            f"SSL {item.domain}: "
            + ("válido" if item.is_valid else "error")
            + f", expira en {item.days_left} días"
        )

    whois = (
        db.query(WhoisCheck)
        .filter(WhoisCheck.user_id == user.id)
        .order_by(WhoisCheck.created_at.desc())
        .limit(3)
        .all()
    )
    for item in whois:
        parts.append(f"WHOIS {item.domain}: registrador {item.registrar}")

    pwd = (
        db.query(PasswordCheck)
        .filter(PasswordCheck.user_id == user.id)
        .order_by(PasswordCheck.created_at.desc())
        .limit(3)
        .all()
    )
    for item in pwd:
        parts.append(
            f"Contraseña analizada: score {item.score}/4, entropía {item.entropy_bits:.1f} bits"
        )

    hashes = (
        db.query(FileHash)
        .filter(FileHash.user_id == user.id)
        .order_by(FileHash.created_at.desc())
        .limit(3)
        .all()
    )
    for item in hashes:
        parts.append(f"Hash de {item.filename}: SHA-256 {item.sha256[:16]}...")

    if not parts:
        return "Aún no hay análisis en la cuenta del usuario."
    return "\n".join(parts)


def ask(message: str, db: Session, user: User) -> str:
    """Envía la pregunta del usuario a Groq junto con contexto de sus análisis."""
    if not settings.GROQ_API_KEY:
        return (
            "El asistente IA no está configurado. Añade GROQ_API_KEY en el archivo "
            "backend/.env y reinicia el servidor."
        )

    context = _recent_context(db, user)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            ("system", "Contexto de análisis reciente del usuario:\n{context}"),
            ("human", "{question}"),
        ]
    )

    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model="llama-3.3-70b-versatile",
        temperature=0.4,
        max_tokens=800,
    )

    chain = prompt | llm
    try:
        response = chain.invoke({"context": context, "question": message})
    except RateLimitError:
        return (
            "He alcanzado el límite gratuito de consultas de Groq por este momento "
            "(límite por minuto/día). Espera un rato y vuelve a intentarlo, o revisa "
            "tu cuota en https://console.groq.com. Todos tus análisis siguen guardados, "
            "no se ha perdido nada."
        )
    except LangChainException:
        return (
            "No he podido contactar con el modelo de Groq. Comprueba tu conexión, que "
            "la GROQ_API_KEY del archivo backend/.env sea correcta y que tengas crédito "
            "disponible en https://console.groq.com. También revisa tus límites diarios."
        )
    return response.content
