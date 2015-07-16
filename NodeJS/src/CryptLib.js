
/*global console*/
'use strict';

import crypto from 'crypto';

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
    
    let getFinalIV = () => {
      let finalIV;
      if (initVector > this._maxIVSize) {
        return initVector.subString(0, this._maxIVSize - 1);
      }
    };

    let getFinalKey = () => {

    };
    //let _pwd = 

    initVector = new Buffer(initVector);
    let encryptor = crypto.createCipheriv(this._algorithm, key, initVector),
        cipherText;
    encryptor.setEncoding('base64');
    encryptor.write(plainText);
    encryptor.end();

    cipherText = encryptor.read();
    console.log('cipher text %s', cipherText);
  }

  decrypt(plainText, key, initVector) {
    return this.name;
  }

}
