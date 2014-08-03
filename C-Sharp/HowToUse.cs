    internal class Program
    {
        private static void Main(string[] args)
        {
            CryptLib crypt = new CryptLib("password", "iv");

            string encryptedText = crypt.Encrypt("this is a secret message");
            Console.WriteLine(encryptedText);

            string decryptedText = crypt.Decrypt(encryptedText);
            Console.WriteLine(decryptedText);

            Console.ReadLine();
        }
    }