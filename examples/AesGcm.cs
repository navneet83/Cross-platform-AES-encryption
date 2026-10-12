// AES-256-GCM with a password on .NET 8 or later. Not run by the author of this repository (no .NET at hand);
// written against the documented API, with the same test vector the other examples pass.
// Layout of the output, Base64: salt (16) || nonce (12) || ciphertext || tag (16).
// Key: PBKDF2-HMAC-SHA256, 600000 iterations, from the UTF-8 bytes of the password.

using System;
using System.Security.Cryptography;
using System.Text;

public static class PasswordAesGcm
{
    const int Iterations = 600000;
    const int SaltBytes = 16;
    const int NonceBytes = 12;
    const int TagBytes = 16;

    static byte[] DeriveKey(string password, byte[] salt) =>
        Rfc2898DeriveBytes.Pbkdf2(Encoding.UTF8.GetBytes(password), salt, Iterations, HashAlgorithmName.SHA256, 32);

    public static string Encrypt(string password, string plaintext, byte[]? salt = null, byte[]? nonce = null)
    {
        salt ??= RandomNumberGenerator.GetBytes(SaltBytes);
        nonce ??= RandomNumberGenerator.GetBytes(NonceBytes);
        var plain = Encoding.UTF8.GetBytes(plaintext);
        var cipher = new byte[plain.Length];
        var tag = new byte[TagBytes];
        using (var aes = new AesGcm(DeriveKey(password, salt), TagBytes))
            aes.Encrypt(nonce, plain, cipher, tag);
        var output = new byte[SaltBytes + NonceBytes + cipher.Length + TagBytes];
        salt.CopyTo(output, 0);
        nonce.CopyTo(output, SaltBytes);
        cipher.CopyTo(output, SaltBytes + NonceBytes);
        tag.CopyTo(output, SaltBytes + NonceBytes + cipher.Length);
        return Convert.ToBase64String(output);
    }

    public static string Decrypt(string password, string text)
    {
        var data = Convert.FromBase64String(text);
        var salt = data.AsSpan(0, SaltBytes).ToArray();
        var nonce = data.AsSpan(SaltBytes, NonceBytes);
        var cipher = data.AsSpan(SaltBytes + NonceBytes, data.Length - SaltBytes - NonceBytes - TagBytes);
        var tag = data.AsSpan(data.Length - TagBytes, TagBytes);
        var plain = new byte[cipher.Length];
        // A wrong password or a modified ciphertext throws CryptographicException; there is no partial output.
        using (var aes = new AesGcm(DeriveKey(password, salt), TagBytes))
            aes.Decrypt(nonce, cipher, tag, plain);
        return Encoding.UTF8.GetString(plain);
    }

    public static void Main()
    {
        // The shared vector from vector.json.
        var password = "correct horse battery staple";
        var salt = Convert.FromHexString("000102030405060708090a0b0c0d0e0f");
        var nonce = Convert.FromHexString("101112131415161718191a1b");
        var plaintext = "The quick brown fox jumps over the lazy dog";
        var expected = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaG1h6GOVhisEUoJr7uqOEGtp3V+LE7BK727AQdJyty2Cb9qavhZWbjwyoeMQ8aKUEqtkaxPWk4NknIiFb";
        if (Encrypt(password, plaintext, salt, nonce) != expected) throw new Exception("vector mismatch");
        if (Decrypt(password, expected) != plaintext) throw new Exception("vector decrypt failed");
        if (Decrypt("another password", Encrypt("another password", "round trip")) != "round trip") throw new Exception("round trip failed");
        Console.WriteLine("AesGcm.cs: vector and round trip OK");
    }
}
