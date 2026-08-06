import smtplib
from email.mime.text import MIMEText

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.notification import ActivityLog, Notification
from app.models.ssl import SSLCheck
from app.models.user import User


def log_activity(db: Session, user: User, action: str, detail: str = "", ip: str | None = None) -> None:
    db.add(ActivityLog(user_id=user.id, action=action, detail=detail, ip=ip))
    db.commit()


def create_notification(db: Session, user_id: int, title: str, message: str, kind: str = "info") -> Notification:
    record = Notification(user_id=user_id, title=title, message=message, kind=kind)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def send_email(to_email: str, subject: str, body: str) -> bool:
    """Envía un correo con Gmail SMTP. Requiere SMTP_* en .env. Devuelve True si se envió."""
    if not settings.SMTP_PASSWORD:
        return False

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.SMTP_FROM, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())
        return True
    except Exception:
        return False


def check_expiring_certs(db: Session, user: User) -> list[Notification]:
    """Revisa los certificados SSL y crea notificaciones para los que expiran pronto."""
    created: list[Notification] = []
    certs = (
        db.query(SSLCheck)
        .filter(SSLCheck.user_id == user.id, SSLCheck.is_valid.is_(True))
        .all()
    )
    for cert in certs:
        if cert.days_left is None or cert.days_left > 30:
            continue
        if db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.title == f"El certificado de {cert.domain} está por expirar",
        ).first():
            continue

        n = create_notification(
            db,
            user.id,
            f"El certificado de {cert.domain} está por expirar",
            f"El certificado SSL de {cert.domain} caduca en {cert.days_left} días. Renueva antes de que venza.",
            kind="warning",
        )
        created.append(n)

        if settings.SMTP_PASSWORD:
            send_email(
                user.email,
                f"SentinelX: certificado de {cert.domain} por expirar",
                f"El certificado SSL de {cert.domain} caduca en {cert.days_left} días. Entra en SentinelX para más detalles.",
            )
    return created
