"""AES-256-GCM with a password, using the `cryptography` package (pip install cryptography).

Layout of the output, Base64: salt (16) || nonce (12) || ciphertext || tag (16).
Key: PBKDF2-HMAC-SHA256, 600000 iterations, from the UTF-8 bytes of the password.
"""
import base64
import json
import os
import sys

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ITERATIONS = 600000
SALT_BYTES = 16
NONCE_BYTES = 12


def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITERATIONS)
    return kdf.derive(password.encode("utf-8"))


def encrypt(password: str, plaintext: str, salt: bytes | None = None, nonce: bytes | None = None) -> str:
    salt = salt or os.urandom(SALT_BYTES)
    nonce = nonce or os.urandom(NONCE_BYTES)
    sealed = AESGCM(derive_key(password, salt)).encrypt(nonce, plaintext.encode("utf-8"), None)
    return base64.b64encode(salt + nonce + sealed).decode("ascii")


def decrypt(password: str, text: str) -> str:
    data = base64.b64decode(text)
    salt, nonce, sealed = data[:SALT_BYTES], data[SALT_BYTES:SALT_BYTES + NONCE_BYTES], data[SALT_BYTES + NONCE_BYTES:]
    # A wrong password or a modified ciphertext raises InvalidTag; there is no partial output.
    return AESGCM(derive_key(password, salt)).decrypt(nonce, sealed, None).decode("utf-8")


if __name__ == "__main__":
    with open(os.path.join(os.path.dirname(__file__), "vector.json")) as f:
        vector = json.load(f)
    produced = encrypt(vector["password"], vector["plaintext"], bytes.fromhex(vector["salt_hex"]), bytes.fromhex(vector["nonce_hex"]))
    assert produced == vector["output_base64"], produced
    assert decrypt(vector["password"], vector["output_base64"]) == vector["plaintext"]
    assert decrypt("another password", encrypt("another password", "round trip")) == "round trip"
    print("aes_gcm.py: vector and round trip OK")
