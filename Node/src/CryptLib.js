
/*global console*/
'use strict';

import crypto from 'crypto';
import BufferList from 'bl';
import isArray from 'lodash.isarray';

/**
 * CrossPlatform CryptLib
   * This cross platform CryptLib uses AES 256 for encryption. This library can
   * be used for encryptoion and de-cryption of string on iOS, Android, Windows
   * and Node platform.
   * Features:
   * 1. 256 bit AES encryption
   * 2. Random IV generation. 
   * 3. Provision for SHA256 hashing of key. 
 */
export default class CryptLib {

  constructor() {
    this._maxKeySize = 32;
    this._maxIVSize = 16;
    this._algorithm = 'AES-256-CBC';
    this._characterMatrixForRandomIVStringGeneration = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_'
    ];
  }

  /**
   * private function: _encryptDecrypt
   * encryptes or decrypts to or from text or encrypted text given an iv and key
   * @param  {string}  text        can be plain text or encrypted text
   * @param  {string}  key         the key used to encrypt or decrypt 
   * @param  {string}  initVector  the initialization vector to encrypt or 
   *                               decrypt
   * @param  {bool}    isEncrypt   true = encryption, false = decryption
   * @return {string}              encryted text or plain text 
   */
  _encryptDecrypt(text, key, initVector, isEncrypt) {

    if (!text || !key) {
      throw 'cryptLib._encryptDecrypt: -> key and plain or encrypted text '+
       'required';
    }

    let ivBl = new BufferList(),
        keyBl = new BufferList(),
        keyCharArray = key.split(''),
        ivCharArray = [],
        encryptor, decryptor, clearText;

    if (initVector && initVector.length > 0) {
       ivCharArray = initVector.split('');
    }
    
    for (var i = 0; i < this._maxIVSize; i++) {
      ivBl.append(ivCharArray.shift() || [null]);
    }

    for (var i = 0; i < this._maxKeySize; i++) {
      keyBl.append(keyCharArray.shift() || [null]);
    }

    if (isEncrypt) {
      encryptor = crypto.createCipheriv(this._algorithm, keyBl.toString(), 
        ivBl.toString());
      encryptor.setEncoding('base64');
      encryptor.write(text);
      encryptor.end();
      return encryptor.read();
    }

    decryptor = crypto.createDecipheriv(this._algorithm, keyBl.toString(),
      ivBl.toString());
    var dec = decryptor.update(text, 'base64', 'utf8');
    dec += decryptor.final('utf8');
    return dec;
  }

  /**
   * private function: _isCorrectLength 
   * checks if length is preset and is a whole number and > 0
   * @param  {int}  length
   * @return {bool} 
  */
  _isCorrectLength(length) {
    return length && /^\d+$/.test(length) && parseInt(length, 10) !== 0
  }

  /**
   * generates random initaliztion vector given a length
   * @param  {int}  length  the length of the iv to be generated
   */
  generateRandomIV(length) {
    if (!this._isCorrectLength(length)) {
      throw 'cryptLib.generateRandomIV() -> needs length or in wrong format';
    }

    length = parseInt(length, 10);
    let _iv = [],
        randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      let ptr = randomBytes[i] % 
        this._characterMatrixForRandomIVStringGeneration.length;
      _iv[i] = this._characterMatrixForRandomIVStringGeneration[ptr];
    }
    return _iv.join('');
  }

  /**
   * Creates a hash of a key using SHA-256 algorithm
   * @param  {string} key     the key that will be hashed
   * @param  {int}    length  the length of the SHA-256 hash
   * @return {string}         the output hash generated given a key and length
   */
  getHashSha256(key, length) {
    if (!key) {
      throw 'cryptLib.getHashSha256() -> needs key';
    }

    if (!this._isCorrectLength(length)) {
      throw 'cryptLib.getHashSha256() -> needs length or in wrong format';
    }

    return crypto.createHash('sha256')
                 .update(key)
                 .digest('hex')
                 .substring(0, length);
  }

  /**
   * encryptes plain text given a key and initialization vector
   * @param  {string}  text        can be plain text or encrypted text
   * @param  {string}  key         the key used to encrypt or decrypt 
   * @param  {string}  initVector  the initialization vector to encrypt or 
   *                               decrypt
   * @return {string}              encryted text or plain text 
   */
  encrypt(plainText, key, initVector) {
    return this._encryptDecrypt(plainText, key, initVector, true);
  }

  /**
   * decrypts encrypted text given a key and initialization vector
   * @param  {string}  text        can be plain text or encrypted text
   * @param  {string}  key         the key used to encrypt or decrypt 
   * @param  {string}  initVector  the initialization vector to encrypt or 
   *                               decrypt
   * @return {string}              encryted text or plain text 
   */
  decrypt(encryptedText, key, initVector) {
    return this._encryptDecrypt(encryptedText, key, initVector, false);
  }
}
