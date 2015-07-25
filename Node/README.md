CryptLib
=========

A module to encrypt/decrypt string in Node, written in ES6 (src folder) and transpiled using Babel to ES5(dist folder).

Using companion framework libraries, you should be able to encrypt/decrypt between node, iOS, Android and Windows platforms.

Companion libs can be found here: https://github.com/Pakhee/Cross-platform-AES-encryption


## Installation

  npm install cryptlib --save

## Usage

	var CryptLib = require('./dist/CryptLib.js'),
		_crypt = new CryptLib(),
		plainText = 'This is the text to be encrypted',
		iv = _crypt.generateRandomIV(16), //16 bytes = 128 bit
		key = _crypt.getHashSha256('my secret key', 32), //32 bytes = 256 bits
		cypherText = _crypt.encrypt(plainText, key, iv),
    originText = _crypt.decrypt(cypherText, key, iv);

## Run Code Sample
  
  npm start

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release

## License

MIT license; see [LICENSE](./LICENSE).

(c) 2015 by Abdul Khan
