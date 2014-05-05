	public class test {
		public static void Main (String []args)
		{
			CryptLib _crypt = new CryptLib ();
			string plainText = "This is the text to be encrypted";
			String iv = CryptLib.GenerateRandomIV (15); //do not exceed 15
			string key = CryptLib.getHashSha256("my secret key", 31); //do not exceed 31
			String cypherText = _crypt.encrypt (plainText, key, iv);
			Console.WriteLine ("iv="+iv);
			Console.WriteLine ("key=" + key);
			Console.WriteLine("Cypher text=" + cypherText);
			Console.WriteLine ("Plain text =" + _crypt.decrypt (cypherText, key, iv));
		}

	}
