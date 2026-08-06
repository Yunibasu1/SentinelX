import whois


def check_whois(domain: str) -> dict:
    """Consulta la información WHOIS pública del dominio."""
    domain = domain.strip().lower()
    if not domain:
        raise ValueError("El dominio no puede estar vacío")

    try:
        w = whois.whois(domain)
    except Exception as exc:
        return {"domain": domain, "registrar": None, "status": None,
                "creation_date": None, "expiration_date": None,
                "updated_date": None, "name_servers": None, "error": str(exc)}

    def first_date(value):
        if value is None:
            return None
        if isinstance(value, list):
            value = value[0]
        if isinstance(value, str):
            return value
        return value

    ns = w.name_servers
    if isinstance(ns, list):
        ns = ", ".join(str(x).rstrip(".") for x in ns)
    status = w.status
    if isinstance(status, list):
        status = ", ".join(str(x) for x in status)

    return {
        "domain": domain,
        "registrar": w.registrar,
        "status": status,
        "creation_date": first_date(w.creation_date),
        "expiration_date": first_date(w.expiration_date),
        "updated_date": first_date(w.updated_date),
        "name_servers": ns,
        "error": None,
    }
