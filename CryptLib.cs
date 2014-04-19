using System;
using System.Text;
using System.Security.Cryptography;

namespace com.pakhee.common
{
	/*****************************************************************
	 * CrossPlatform CryptLib
	 * 
	 * <p>
	 * This is a very basic cross platform implementation of AES encryption which is
	 * not yet ready for production use. Idea is to make encryption work across
	 * Android, iOS and C# by using the same key/cipher mode/padding/IV on all platforms.<br/>
	 * Security Issues: Key has to be salted (PBKDF2),
	 * randomize IV <br/>
	 * </p>
	 * 
	 * @since 1.0
	 * @author navneet
	 *****************************************************************/
	public class CryptLib
	{
		UTF8Encoding _enc;
		RijndaelManaged _rcipher;
		byte[] _key, _pwd;

		/***
		 * Encryption mode enumeration
		 */
		private enum EncryptMode {ENCRYPT, DECRYPT};

		public CryptLib()
		{
			_enc = new UTF8Encoding();
			_rcipher =  new RijndaelManaged();
			_rcipher.Mode = CipherMode.CBC;
			_rcipher.Padding = PaddingMode.PKCS7;
			_rcipher.KeySize = 0x80;
			_rcipher.BlockSize = 0x80;
			_key = new byte[0x10];
		}

		/**
		 * 
		 * @param _inputText
		 *            Text to be encrypted or decrypted
		 * @param _encryptionKey
		 *            Encryption key to used for encryption / decryption
		 * @param _mode
		 *            specify the mode encryption / decryption
		 * @return encrypted or decrypted string based on the mode
		 * @throws UnsupportedEncodingException
		 * @throws InvalidKeyException
		 * @throws InvalidAlgorithmParameterException
		 * @throws IllegalBlockSizeException
		 * @throws BadPaddingException
	 	*/
		private string encryptDecrypt (string _inputText, string _encryptionKey, EncryptMode _mode)
		{
			String _out = "";// output string
			_pwd = Encoding.UTF8.GetBytes(_encryptionKey);

			int len = _pwd.Length;
			if (len > _key.Length)
			{
				len = _key.Length;
			}

			Array.Copy(_pwd, _key, len);
			_rcipher.Key = _key;
			_rcipher.IV = _key;

			if (_mode.Equals (EncryptMode.ENCRYPT)) {
				//encrypt
				byte[] plainText = _rcipher.CreateEncryptor().TransformFinalBlock(_enc.GetBytes(_inputText) , 0, _inputText.Length);
				_out = Convert.ToBase64String(plainText);
			}
			if (_mode.Equals (EncryptMode.DECRYPT)) {
				//decrypt
				byte[] plainText = _rcipher.CreateDecryptor().TransformFinalBlock(Convert.FromBase64String(_inputText), 0, Convert.FromBase64String(_inputText).Length);
				_out = _enc.GetString(plainText);
			}
			_rcipher.Dispose();
			return _out;// return encrypted/decrypted string
		}


		/***
		 * This function encrypts the plain text to cipher text using the key
		 * provided. You'll have to use the same key for decryption
		 * 
		 * @param _plainText
		 *            Plain text to be encrypted
		 * @param _key
		 *            Encryption Key. You'll have to use the same key for decryption
		 * @return returns encrypted (cipher) text
		 * @throws InvalidKeyException
		 * @throws UnsupportedEncodingException
		 * @throws InvalidAlgorithmParameterException
		 * @throws IllegalBlockSizeException
		 * @throws BadPaddingException
		 */
		public string encrypt (string _plainText, string _key)
		{
			return encryptDecrypt(_plainText, _key, EncryptMode.ENCRYPT);
		}

		/***
		 * This funtion decrypts the encrypted text to plain text using the key
		 * provided. You'll have to use the same key which you used during
		 * encryprtion
		 * 
		 * @param _encryptedText
		 *            Encrypted/Cipher text to be decrypted
		 * @param _key
		 *            Encryption key which you used during encryption
		 * @return encrypted value
		 * @throws InvalidKeyException
		 * @throws UnsupportedEncodingException
		 * @throws InvalidAlgorithmParameterException
		 * @throws IllegalBlockSizeException
		 * @throws BadPaddingException
		 */
		public string decrypt(string _encryptedText, string _key)
		{
			return encryptDecrypt(_encryptedText, _key, EncryptMode.DECRYPT);
		}

	}
}
