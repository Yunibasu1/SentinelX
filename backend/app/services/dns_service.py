import re

import dns.resolver

RESOLVER = dns.resolver.Resolver()
DOMAIN_PATTERN = re.compile(r"^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$", re.IGNORECASE)

RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "DMARC"]


def is_valid_domain(domain: str) -> bool:
    return bool(DOMAIN_PATTERN.match(domain.strip()))


def _lookup(name: str, record_type: str) -> list[tuple[str, int | None]]:
    """Consulta un tipo de registro DNS y devuelve [(valor, prioridad)].

    MX y SRV incluyen prioridad; el resto usa None.
    """
    query_name = f"_dmarc.{name}" if record_type == "DMARC" else name
    answers = []
    try:
        response = RESOLVER.resolve(query_name, record_type if record_type != "DMARC" else "TXT")
        for rdata in response:
            if record_type == "MX":
                answers.append((str(rdata.exchange).rstrip("."), int(rdata.preference)))
            elif record_type == "TXT" or record_type == "DMARC":
                text = " ".join(part.decode() for part in rdata.strings)
                answers.append((text, None))
            else:
                answers.append((str(rdata), None))
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers,
            dns.exception.Timeout, dns.resolver.LifetimeTimeout):
        pass
    return answers


def analyze_domain(domain: str) -> dict[str, list[tuple[str, int | None]]]:
    """Analiza un dominio y devuelve todos sus registros DNS."""
    domain = domain.strip().lower()
    if not is_valid_domain(domain):
        raise ValueError("El dominio no es válido. Ejemplo: google.com")

    result: dict[str, list[tuple[str, int | None]]] = {}
    for record_type in RECORD_TYPES:
        result[record_type] = _lookup(domain, record_type)
    return result
