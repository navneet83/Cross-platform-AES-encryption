// AES-256-GCM with a password on the JVM and Android (API 26+ for java.util.Base64; use android.util.Base64 below that).
// Not run by the author of this repository (no JDK at hand); written against the documented API, with the same
// test vector the other examples pass.
// Layout of the output, Base64: salt (16) || nonce (12) || ciphertext || tag (16).
// Key: PBKDF2-HMAC-SHA256, 600000 iterations, from the password (PBKDF2WithHmacSHA256 encodes the chars as UTF-8).

import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

const val ITERATIONS = 600_000
const val SALT_BYTES = 16
const val NONCE_BYTES = 12
const val TAG_BITS = 128

private val random = SecureRandom()

fun deriveKey(password: String, salt: ByteArray): SecretKeySpec {
    val spec = PBEKeySpec(password.toCharArray(), salt, ITERATIONS, 256)
    val key = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).encoded
    spec.clearPassword()
    return SecretKeySpec(key, "AES")
}

fun encrypt(password: String, plaintext: String, salt: ByteArray = ByteArray(SALT_BYTES).also(random::nextBytes),
            nonce: ByteArray = ByteArray(NONCE_BYTES).also(random::nextBytes)): String {
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, deriveKey(password, salt), GCMParameterSpec(TAG_BITS, nonce))
    val sealed = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8)) // ciphertext || tag
    return Base64.getEncoder().encodeToString(salt + nonce + sealed)
}

fun decrypt(password: String, text: String): String {
    val data = Base64.getDecoder().decode(text)
    val salt = data.copyOfRange(0, SALT_BYTES)
    val nonce = data.copyOfRange(SALT_BYTES, SALT_BYTES + NONCE_BYTES)
    val sealed = data.copyOfRange(SALT_BYTES + NONCE_BYTES, data.size)
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.DECRYPT_MODE, deriveKey(password, salt), GCMParameterSpec(TAG_BITS, nonce))
    // A wrong password or a modified ciphertext throws AEADBadTagException; there is no partial output.
    return String(cipher.doFinal(sealed), Charsets.UTF_8)
}

fun hex(s: String) = ByteArray(s.length / 2) { s.substring(2 * it, 2 * it + 2).toInt(16).toByte() }

fun main() {
    // The shared vector from vector.json.
    val password = "correct horse battery staple"
    val plaintext = "The quick brown fox jumps over the lazy dog"
    val expected = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaG1h6GOVhisEUoJr7uqOEGtp3V+LE7BK727AQdJyty2Cb9qavhZWbjwyoeMQ8aKUEqtkaxPWk4NknIiFb"
    check(encrypt(password, plaintext, hex("000102030405060708090a0b0c0d0e0f"), hex("101112131415161718191a1b")) == expected) { "vector mismatch" }
    check(decrypt(password, expected) == plaintext) { "vector decrypt failed" }
    check(decrypt("another password", encrypt("another password", "round trip")) == "round trip") { "round trip failed" }
    println("AesGcm.kt: vector and round trip OK")
}
