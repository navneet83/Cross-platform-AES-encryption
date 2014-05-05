	public class test {
		public static void Main (String []args)
		{
			CryptLib _crypt = new CryptLib ();
			string plainText = "This is the text to be encrypted";
			String iv = CryptLib.GenerateRandomIV (16); //16 bytes = 128 bits
			string key = CryptLib.getHashSha256("my secret key", 31); //32 bytes = 256 bits
			String cypherText = _crypt.encrypt (plainText, key, iv);
			Console.WriteLine ("iv="+iv);
			Console.WriteLine ("key=" + key);
			Console.WriteLine("Cypher text=" + cypherText);
			Console.WriteLine ("Plain text =" + _crypt.decrypt (cypherText, key, iv));
		}

	}
