
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

var CryptLib = (function () {
  function CryptLib() {
    _classCallCheck(this, CryptLib);

    this._keySize = 32;
    this._ivSize = 16;
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
    key: 'encrypt',
    value: function encrypt(plainText, key, initVector) {
      //let _pwd =

      initVector = new Buffer(initVector);
      var encryptor = _crypto2['default'].createCipheriv(this._algorithm, key, initVector),
          cipherText = undefined;
      encryptor.setEncoding('base64');
      encryptor.write(plainText);
      encryptor.end();

      cipherText = encryptor.read();
      console.log('cipher text %s', cipherText);
    }
  }, {
    key: 'decrypt',
    value: function decrypt(plainText, key, initVector) {
      return this.name;
    }
  }]);

  return CryptLib;
})();

exports['default'] = CryptLib;
module.exports = exports['default'];