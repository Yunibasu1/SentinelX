import base64
import json
from datetime import datetime, timezone


def _b64_decode(segment: str) -> dict:
    """Decodifica un segmento base64url de JWT sin validar firma."""
    padding = "=" * (-len(segment) % 4)
    raw = base64.urlsafe_b64decode(segment + padding)
    return json.loads(raw)


def inspect_token(token: str) -> dict:
    """Inspecciona un JWT: header, payload y advertencias de seguridad."""
    token = token.strip()
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("El token no tiene el formato JWT válido (header.payload.firma)")

    try:
        header = _b64_decode(parts[0])
        payload = _b64_decode(parts[1])
    except Exception:
        raise ValueError("No se pudo decodificar el header o el payload del token")

    algorithm = header.get("alg")
    warnings = []

    if algorithm == "none":
        warnings.append("ALERTA: el algoritmo 'none' permite falsificar tokens sin firma.")
    elif algorithm not in ("HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "ES256", "ES512"):
        warnings.append(f"Algoritmo poco común o no recomendado: {algorithm}")

    now = datetime.now(timezone.utc)

    exp = payload.get("exp")
    exp_dt = datetime.fromtimestamp(exp, tz=timezone.utc) if isinstance(exp, (int, float)) else None
    iat = payload.get("iat")
    iat_dt = datetime.fromtimestamp(iat, tz=timezone.utc) if isinstance(iat, (int, float)) else None

    if exp_dt is None:
        warnings.append("Aviso: el token no tiene fecha de expiración (exp).")
    elif exp_dt < now:
        warnings.append("Aviso: el token ya está expirado.")

    if payload.get("iss") is None:
        warnings.append("Aviso: sin emisor (iss). Es recomendable validarlo.")
    if payload.get("aud") is None:
        warnings.append("Aviso: sin audiencia (aud). Es recomendable validarla.")

    if any(key.lower() in ("password", "secret", "token") for key in payload):
        warnings.append("ALERTA: el payload contiene claves sensibles (password/secret/token).")

    if not warnings:
        warnings.append("Sin advertencias: configuración de token razonable.")

    return {
        "algorithm": algorithm,
        "subject": str(payload.get("sub")) if payload.get("sub") is not None else None,
        "issuer": payload.get("iss"),
        "audience": str(payload.get("aud")) if payload.get("aud") is not None else None,
        "expires_at": exp_dt,
        "issued_at": iat_dt,
        "payload_json": json.dumps(payload, indent=2),
        "warnings": "\n".join(warnings),
        "error": None,
    }
