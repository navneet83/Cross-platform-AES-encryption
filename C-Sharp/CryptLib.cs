using System;
using System.Text;
using System.Security.Cryptography;

namespace com.pakhee.common
{
	public class CryptLib
    {
        private readonly RijndaelManaged _cipher;

        public CryptLib(string key, string iv)
        {
            string hashedKey = GenerateSha256Hash(key, 32);
            string hashedIv = GenerateMd5Hash(iv, 16);

            _cipher = new RijndaelManaged
            {
                Mode = CipherMode.CBC,
                Padding = PaddingMode.PKCS7,
                KeySize = 256,
                BlockSize = 128,
                Key = Encoding.UTF8.GetBytes(hashedKey),
                IV = Encoding.UTF8.GetBytes(hashedIv)
            };
        }

        public string Decrypt(string content)
        {
            byte[] encryptedText = Convert.FromBase64String(content);
            byte[] decryptedText = _cipher.CreateDecryptor().TransformFinalBlock(encryptedText, 0, encryptedText.Length);

            return Encoding.UTF8.GetString(decryptedText);
        }

        public string Encrypt(string content)
        {
            byte[] encryptedText = _cipher.CreateEncryptor().TransformFinalBlock(Encoding.UTF8.GetBytes(content), 0, content.Length);
            return Convert.ToBase64String(encryptedText);
        }

        private static string ConvertHashBytesToString(IEnumerable<byte> hashBytes)
        {
            StringBuilder result = new StringBuilder();

            // Convert hash byte array to string
            foreach (byte passwordByte in hashBytes)
            {
                result.Append(passwordByte.ToString("x2"));
            }

            // Return hash as string
            return result.ToString();
        }

        private static string GenerateMd5Hash(string content)
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(content);
            byte[] hashBytes = new MD5CryptoServiceProvider().ComputeHash(inputBytes);

            return ConvertHashBytesToString(hashBytes);
        }

        private static string GenerateMd5Hash(string content, int length)
        {
            return GenerateMd5Hash(content).Substring(0, length);
        }

        private static string GenerateSha256Hash(string content)
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(content);
            byte[] hashedStringBytes = new SHA256CryptoServiceProvider().ComputeHash(inputBytes);

            return ConvertHashBytesToString(hashedStringBytes);
        }

        private static string GenerateSha256Hash(string content, int length)
        {
            return GenerateSha256Hash(content).Substring(0, length);
        }
    }
}
