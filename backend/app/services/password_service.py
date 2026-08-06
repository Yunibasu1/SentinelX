import math
import re

# Lista reducida de contraseñas débiles conocidas (muestra).
COMMON_PASSWORDS = {
    "123456", "password", "123456789", "12345678", "12345", "qwerty",
    "abc123", "111111", "123123", "admin", "letmein", "welcome",
    "monkey", "dragon", "password1", "iloveyou", "superman",
}

GUESSES_PER_SECOND = 1_000_000_000  # ataque offline de referencia

_LOWER = re.compile(r"[a-z]")
_UPPER = re.compile(r"[A-Z]")
_DIGIT = re.compile(r"\d")
_SPECIAL = re.compile(r"[^a-zA-Z0-9]")


def analyze_password(password: str) -> dict:
    length = len(password)
    lower = bool(_LOWER.search(password))
    upper = bool(_UPPER.search(password))
    digit = bool(_DIGIT.search(password))
    special = bool(_SPECIAL.search(password))

    pool = 0
    if lower:
        pool += 26
    if upper:
        pool += 26
    if digit:
        pool += 10
    if special:
        pool += 33

    entropy = length * math.log2(pool) if pool else 0
    crack_time = (2 ** entropy) / GUESSES_PER_SECOND if entropy else 0

    in_dict = password.lower() in COMMON_PASSWORDS

    score = 0
    if length >= 8:
        score += 1
    if length >= 12:
        score += 1
    if sum([lower, upper, digit, special]) >= 3:
        score += 1
    if not in_dict and length >= 10:
        score += 1

    return {
        "password_length": length,
        "entropy_bits": round(entropy, 2),
        "has_lower": lower,
        "has_upper": upper,
        "has_digit": digit,
        "has_special": special,
        "in_dictionary": in_dict,
        "crack_time_seconds": crack_time,
        "score": min(score, 4),
    }
