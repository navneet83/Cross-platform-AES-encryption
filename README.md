> **This repository is archived and should not be used.**
>
> It was written in 2014 to make AES-encrypted data readable across C#, iOS, Android and Node.js at a time when those platforms had no common authenticated-encryption API. It was archived in 2026 after a security assessment: it implements AES-256-CBC with no message authentication, a key derived by truncating an unsalted SHA-256 hex digest, and an IV that is managed by the caller. In 2026 terms that means ciphertexts can be altered or recovered via padding-oracle attacks, passwords can be brute-forced offline at hash speed, and the iOS version has memory-safety bugs and a hex conversion that has been broken since iOS 13 (#60). Issue #61 (2019) describes the missing authentication; it was never fixed.
>
> Do not copy this code into a new project. Use your platform's standard AEAD and password-derivation APIs instead:
>
> - iOS/macOS: CryptoKit `AES.GCM`, PBKDF2 via `CCKeyDerivationPBKDF` or Argon2id
> - Android: Tink or `AES/GCM/NoPadding` with `GCMParameterSpec`, keys in Jetpack Security / Keystore
> - .NET: `System.Security.Cryptography.AesGcm`, `Rfc2898DeriveBytes.Pbkdf2`
> - Node/browser: WebCrypto `subtle.encrypt({ name: "AES-GCM" })` with `deriveKey(PBKDF2)`
> - Across languages, use a standard envelope rather than a new one: JWE (`A256GCM` with `PBES2`), age for files, or libsodium `crypto_secretbox`
>
> If you still hold data encrypted with this library, decrypt it once with the matching old code and re-encrypt with one of the above. On iOS 13 and later the key helper in this repository no longer produces the same hex string as before; to derive the old key, format the SHA-256 digest bytes with `%02x` yourself (see #60). Open issues and pull requests are closed; nothing further will be merged.
>
> Navneet

Cross platform 256bit AES encryption / decryption.
========
This project contains the implementation of 256 bit AES encryption which works on all the platforms (C#, iOS, Android and Node.js). One of the key objective is to make AES work on all the platforms with simple implementation. 

<b>Platforms Supported:</b>

1. iOS

2. Android

3. Windows (C#).

4. Node.js

<b>Features:</b>

1. Cross platform support. Encryption-Decryption works across C#, iOS, Android and Node.js. 

2. Support for Random IV (initialization vector) for encryption and decryption. Randomization is crucial for encryption schemes to achieve semantic security, a property whereby repeated usage of the scheme under the same key does not allow an attacker to infer relationships between segments of the encrypted message.

3.  Support for SHA-256 for hashing the key. Never use plain text as encryption key. Always hash the plain text key and then use for encryption. AES permits the use of 256-bit keys. Breaking a symmetric 256-bit key by brute force requires 2^128 times more computational power than a 128-bit key. A device that could check a billion billion (10^18) AES keys per second would in theory require about 3×10^51 years to exhaust the 256-bit key space.

<b>How to encrypt a string:</b>

See code samples for more details. You'll have to perform following steps:

1. Generate Ramdom IV using the provided randomIV generator function.
2. Select a secret key and hash it using the provided SHA-256 hash function.
3. Encrypt your string using the hashed key and random IV. 

<b>How to decrypt a string:</b>

See code samples for more details. You'll have to perform following steps:

1. Get the encrypted text and the randomIV used for encryption
2. Decrypt the string using the provided decrypt function !
