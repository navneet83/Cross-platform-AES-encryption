
/*global console*/
'use strict';

import crypto from 'crypto';
import BufferList from 'bl';

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

  _encryptDecrypt(text, key, initVector, isEncrypt) {

    let ivBl = new BufferList(),
        keyBl = new BufferList(),
        ivCharArray = initVector.split(''),
        keyCharArray = key.split(''),
        encryptor, decryptor, clearText;
    
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
    return decryptor.update(text, 'base64', 'utf8');
  }

  generateRandomIV(length) {
    let _iv = [],
        randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      let ptr = randomBytes[i] % 
        this._characterMatrixForRandomIVStringGeneration.length;
      _iv[i] = this._characterMatrixForRandomIVStringGeneration[ptr];
    }
    return _iv.join('');
  }

  getHashSha256(key, length) {
    return crypto.createHash('sha256')
                      .update(key)
                      .digest('hex')
                      .substring(0, length);
  }

  encrypt(plainText, key, initVector) {
    return this._encryptDecrypt(plainText, key, initVector, true);
  }

  decrypt(encryptedText, key, initVector) {
    return this._encryptDecrypt(encryptedText, key, initVector, false);
  }
}
