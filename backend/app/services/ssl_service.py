import socket
import ssl as ssl_mod
from datetime import datetime, timezone

SSL_PORT = 443


def check_ssl(domain: str) -> dict:
    """Conecta al servidor y extrae los datos del certificado TLS/SSL."""
    domain = domain.strip().lower()
    if not domain:
        raise ValueError("El dominio no puede estar vacío")

    try:
        ctx = ssl_mod.create_default_context()
        with socket.create_connection((domain, SSL_PORT), timeout=10) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as tls:
                cert = tls.getpeercert()
                version = tls.version()
    except (socket.timeout, socket.gaierror, ssl_mod.SSLCertVerificationError, OSError, ValueError) as exc:
        return {"domain": domain, "is_valid": False, "days_left": 0,
                "issuer": None, "subject": None, "serial_number": None,
                "tls_version": None, "signature_algorithm": None,
                "expires_at": None, "error": str(exc)}

    if not cert:
        return {"domain": domain, "is_valid": False, "days_left": 0,
                "issuer": None, "subject": None, "serial_number": None,
                "tls_version": version, "signature_algorithm": None,
                "expires_at": None, "error": "No se pudo leer el certificado"}

    not_after = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
    days_left = (not_after - datetime.now(timezone.utc)).days

    issuer = ", ".join(f"{k}={v}" for item in cert.get("issuer", []) for k, v in item)
    subject = ", ".join(f"{k}={v}" for item in cert.get("subject", []) for k, v in item)

    return {
        "domain": domain,
        "is_valid": True,
        "days_left": days_left,
        "issuer": issuer,
        "subject": subject,
        "serial_number": cert.get("serialNumber"),
        "tls_version": version,
        "signature_algorithm": cert.get("signatureAlgorithm", "unknown"),
        "expires_at": not_after,
        "error": None,
    }
