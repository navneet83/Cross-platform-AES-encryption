
/*global console*/
'use strict';

import crypto from 'crypto';

let algorithm = 'aes-256-gcm';

export default class CryptLib {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  generateRandomIV(length) {

  }

  getHashSha256(key, length) {
  }

  encrypt(plainText, key, initVector) {
    let cipher = crypto.createCipheriv(algorithm, key, new Buffer(initVector)),
        encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    console.log(encrypted);
  }

  decrypt(_plainText, _key, _initVector) {
    return this.name;
  }

}
