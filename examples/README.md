# Password-based AES-256-GCM, the same way on each platform

These files show what the archived library in this repository should have been: authenticated encryption with a
properly derived key, using only each platform's standard cryptography. They were added in 2026 when the repository
was archived, for the people who still arrive here looking for cross-platform examples.

| file | platform | API | verified |
|---|---|---|---|
| `AesGcm.swift` | iOS 13+, macOS 10.15+ | CryptoKit `AES.GCM`, CommonCrypto PBKDF2 | yes, `swift AesGcm.swift` |
| `aes_gcm.mjs` | browsers, Node 20+ | WebCrypto `subtle.encrypt` / `deriveKey` | yes, `node aes_gcm.mjs` |
| `aes_gcm.py` | Python 3 | `cryptography` package, `AESGCM` + `PBKDF2HMAC` | yes, `python3 aes_gcm.py` |
| `AesGcm.cs` | .NET 8+ | `AesGcm`, `Rfc2898DeriveBytes.Pbkdf2` | written against the docs, not run |
| `AesGcm.kt` | JVM, Android | `javax.crypto` `AES/GCM/NoPadding`, `PBKDF2WithHmacSHA256` | written against the docs, not run |

Each file has `encrypt(password, plaintext)` returning Base64 and `decrypt(password, text)` returning the plaintext,
and when run as a program it checks itself against `vector.json` and does a round trip with fresh random values.
The three verified files also decrypt each other's output.

## What they all do

- Key: PBKDF2-HMAC-SHA256 with a random 16-byte salt and 600,000 iterations, over the UTF-8 bytes of the password.
  Use a random 32-byte key directly instead of a password when you can; a password is the weak point, and the
  iteration count only slows the attacker down by a constant factor.
- Cipher: AES-256-GCM with a random 12-byte nonce and a 16-byte tag. Decryption of a modified ciphertext, or with
  the wrong password, fails as a whole; there is never partial output.
- Output, Base64: `salt (16) || nonce (12) || ciphertext || tag (16)`. A new salt and nonce for every message.

## The test vector

`vector.json` fixes the salt and nonce only so that the output is reproducible; real encryptions use random ones.
Password `correct horse battery staple`, salt `000102…0f`, nonce `101112…1b`, plaintext
`The quick brown fox jumps over the lazy dog` must produce the Base64 string stored in the file.

## Before you copy this

The byte layout above is these examples' own convention so that the five files can read each other's output.
If your data has to be read by code you do not control, use a standard envelope instead of this one: JWE
(`A256GCM` with `PBES2`), age for files, or libsodium's `crypto_secretbox`. And if you are encrypting for storage
on the same platform, the platform's key store (Keychain, Android Keystore, DPAPI) is a better place for the key
than a password.
