
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

var algorithm = 'aes-256-gcm';

var CryptLib = (function () {
  function CryptLib(name, age) {
    _classCallCheck(this, CryptLib);

    this.name = name;
    this.age = age;
  }

  _createClass(CryptLib, [{
    key: 'generateRandomIV',
    value: function generateRandomIV(length) {}
  }, {
    key: 'getHashSha256',
    value: function getHashSha256(key, length) {}
  }, {
    key: 'encrypt',
    value: function encrypt(plainText, key, initVector) {
      var cipher = _crypto2['default'].createCipheriv(algorithm, key, new Buffer(initVector)),
          encrypted = cipher.update(plainText, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      console.log(encrypted);
    }
  }, {
    key: 'decrypt',
    value: function decrypt(_plainText, _key, _initVector) {
      return this.name;
    }
  }]);

  return CryptLib;
})();

exports['default'] = CryptLib;
module.exports = exports['default'];