import hashlib


def compute_hashes(data: bytes) -> dict:
    """Calcula SHA256, SHA512 y MD5 del contenido del archivo."""
    return {
        "sha256": hashlib.sha256(data).hexdigest(),
        "sha512": hashlib.sha512(data).hexdigest(),
        "md5": hashlib.md5(data).hexdigest(),
    }
