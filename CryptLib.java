package com.pakhee.common;

import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import android.util.Base64;

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
public class CryptLib {

	/**
	 * Encryption mode enumeration
	 */
	private enum EncryptMode {
		ENCRYPT, DECRYPT;
	}

	// cipher to be used for encryption and decryption
	Cipher _cx;

	// encryption key
	byte[] _key;

	public CryptLib() throws NoSuchAlgorithmException, NoSuchPaddingException {
		// initialize the cipher with transformation AES/CBC/PKCS5Padding
		_cx = Cipher.getInstance("AES/CBC/PKCS5Padding");
		_key = new byte[16];
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
	private String encryptDecrypt(String _inputText, String _encryptionKey,
			EncryptMode _mode) throws UnsupportedEncodingException,
			InvalidKeyException, InvalidAlgorithmParameterException,
			IllegalBlockSizeException, BadPaddingException {
		String _out = "";// output string
		int len = _encryptionKey.getBytes("UTF-8").length; // length of the key
															// provided
		if (_encryptionKey.getBytes("UTF-8").length > _key.length)
			len = _key.length;
		System.arraycopy(_encryptionKey.getBytes("UTF-8"), 0, _key, 0, len);
		SecretKeySpec keySpec = new SecretKeySpec(_key, "AES"); // Create a new
																// SecretKeySpec
																// for the
																// specified key
																// data and
																// algorithm
																// name.
		IvParameterSpec ivSpec = new IvParameterSpec(_key); // Create a new
															// IvParameterSpec
															// instance with the
															// bytes from the
															// specified buffer
															// iv used as
															// initialization
															// vector.

		// encryption
		if (_mode.equals(EncryptMode.ENCRYPT)) {
			// Potentially insecure random numbers on Android 4.3 and older.
			// Read
			// https://android-developers.blogspot.com/2013/08/some-securerandom-thoughts.html
			// for more info.
			_cx.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);// Initialize this
															// cipher instance
			byte[] results = _cx.doFinal(_inputText.getBytes("UTF-8")); // Finish
																		// multi-part
																		// transformation
																		// (encryption)
			_out = Base64.encodeToString(results, Base64.DEFAULT); // ciphertext
																	// output
		}

		// decryption
		if (_mode.equals(EncryptMode.DECRYPT)) {
			_cx.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);// Initialize this
															// cipher instance
			byte[] decodedValue = Base64.decode(_inputText.getBytes(),
					Base64.DEFAULT);
			byte[] decryptedVal = _cx.doFinal(decodedValue); // Finish
																// multi-part
																// transformation
																// (decryption)
			_out = new String(decryptedVal);
		}
		return _out; // return encrypted/decrypted string
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
	public String encrypt(String _plainText, String _key)
			throws InvalidKeyException, UnsupportedEncodingException,
			InvalidAlgorithmParameterException, IllegalBlockSizeException,
			BadPaddingException {
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
	public String decrypt(String _encryptedText, String _key)
			throws InvalidKeyException, UnsupportedEncodingException,
			InvalidAlgorithmParameterException, IllegalBlockSizeException,
			BadPaddingException {
		return encryptDecrypt(_encryptedText, _key, EncryptMode.DECRYPT);
	}
}
