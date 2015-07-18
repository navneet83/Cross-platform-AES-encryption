
/*global console*/
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _bl = require('bl');

var _bl2 = _interopRequireDefault(_bl);

var CryptLib = (function () {
  function CryptLib() {
    _classCallCheck(this, CryptLib);

    this._maxKeySize = 32;
    this._maxIVSize = 16;
    this._algorithm = 'AES-256-CBC';
    this._characterMatrixForRandomIVStringGeneration = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_'];
  }

  _createClass(CryptLib, [{
    key: 'generateRandomIV',
    value: function generateRandomIV(length) {
      var _iv = [],
          randomBytes = _crypto2['default'].randomBytes(length);

      for (var i = 0; i < length; i++) {
        var ptr = randomBytes[i] % this._characterMatrixForRandomIVStringGeneration.length;
        _iv[i] = this._characterMatrixForRandomIVStringGeneration[ptr];
      }
      return _iv.join('');
    }
  }, {
    key: 'getHashSha256',
    value: function getHashSha256(key, length) {
      return _crypto2['default'].createHash('sha256').update(key).digest('hex').substring(0, length);
    }
  }, {
    key: 'encryptDecrypt',
    value: function encryptDecrypt(text, key, initVector, isEncrypt) {

      var ivBl = new _bl2['default'](),
          keyBl = new _bl2['default'](),
          ivCharArray = initVector.split(''),
          keyCharArray = key.split(''),
          encryptor = undefined,
          decryptor = undefined,
          clearText = undefined;

      for (var i = 0; i < this._maxIVSize; i++) {
        ivBl.append(ivCharArray.shift() || [null]);
      }

      for (var i = 0; i < this._maxKeySize; i++) {
        keyBl.append(keyCharArray.shift() || [null]);
      }

      if (isEncrypt) {
        encryptor = _crypto2['default'].createCipheriv(this._algorithm, keyBl.toString(), ivBl.toString());
        encryptor.setEncoding('base64');
        encryptor.write(text);
        encryptor.end();
        return encryptor.read();
      }

      decryptor = _crypto2['default'].createDecipheriv(this._algorithm, keyBl.toString(), ivBl.toString());
      return decryptor.update(text, 'base64', 'utf8');
    }
  }, {
    key: 'encrypt',
    value: function encrypt(plainText, key, initVector) {
      return this.encryptDecrypt(plainText, key, initVector, true);
      // let ivBl = new BufferList(),
      //     keyBl = new BufferList(),
      //     ivCharArray = initVector.split(''),
      //     keyCharArray = key.split(''),
      //     encryptor, cipherText;

      // for (var i = 0; i < this._maxIVSize; i++) {
      //   ivBl.append(ivCharArray.shift() || [null]);
      // }

      // for (var i = 0; i < this._maxKeySize; i++) {
      //   keyBl.append(keyCharArray.shift() || [null]);
      // }

      // encryptor = crypto.createCipheriv(this._algorithm, keyBl.toString(),
      //   ivBl.toString());
      // //cipherText = encryptor.update(plainText, 'utf8', 'base64');
      // encryptor.setEncoding('base64');
      // encryptor.write(plainText);
      // encryptor.end();
      // cipherText = encryptor.read();
      // console.log('cipher text %s', cipherText);
      // return cipherText;
    }
  }, {
    key: 'decrypt',
    value: function decrypt(encryptedText, key, initVector) {
      return this.encryptDecrypt(encryptedText, key, initVector, false);
      //     let ivBl = new BufferList(),
      //     keyBl = new BufferList(),
      //     ivCharArray = initVector.split(''),
      //     keyCharArray = key.split(''),
      //     decryptor, clearText;

      // for (var i = 0; i < this._maxIVSize; i++) {
      //   ivBl.append(ivCharArray.shift() || [null]);
      // }

      // for (var i = 0; i < this._maxKeySize; i++) {
      //   keyBl.append(keyCharArray.shift() || [null]);
      // }

      // decryptor = crypto.createDecipheriv(this._algorithm, keyBl.toString(),
      //   ivBl.toString());
      // clearText = decryptor.update(encryptedText, 'base64', 'utf8');
      // console.log('plainText: %s', clearText);
      // return clearText;
    }
  }]);

  return CryptLib;
})();

exports['default'] = CryptLib;
module.exports = exports['default'];