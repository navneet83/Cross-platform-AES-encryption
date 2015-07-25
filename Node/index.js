/*global require*/

var CryptLib = require('./dist/CryptLib.js'),
	_crypt = new CryptLib(),
	plainText = 'This is the text to be encrypted',
	iv = _crypt.generateRandomIV(16), //16 bytes = 128 bit
	key = _crypt.getHashSha256('my secret key', 32), //32 bytes = 256 bits
	cypherText = _crypt.encrypt(plainText, key, iv);

console.log('iv = %s', iv);
console.log('key = %s', key);
console.log('Cypher text = %s', cypherText);
console.log('Plain text = %s', _crypt.decrypt(cypherText, key, iv));