/*global it, describe, require*/

var chai = require('chai'),
    expect = chai.expect,
    CryptLib = require('../dist/CryptLib.js');

describe('CryptLib', function() {
  var cryptLib;

  before(function() {
    cryptLib = new CryptLib();
  });

  after(function() {
    cryptLib = null;
  });

  describe('generateRandomIV()', function() {
    var errorMessage = 'cryptLib.generateRandomIV() -> needs length or in wrong format';

    it('no length should throw error', function() {
      try {
        cryptLib.generateRandomIV()
      } catch (message) {
        expect(message).to.equal(errorMessage);
      }
    });

    it('non-numeric and non-whole number length should throw error', function() {
      try{
        cryptLib.generateRandomIV('abc');
      } catch (message) {
        expect(message).to.equal(errorMessage);
      }

      try{
        cryptLib.generateRandomIV('12a'); 
      } catch (message) {
        expect(message).to.equal(errorMessage);
      }

      try{
        cryptLib.generateRandomIV('12.2'); 
      } catch (message) {
        expect(message).to.equal(errorMessage);
      }
    });

    it('negative length should throw error', function() {
      try {
        cryptLib.generateRandomIV('-1');
      } catch (message) {
        expect(message).to.equal(errorMessage);
      }
    });

    it('length = 0, should throw error', function() {
      try {
        cryptLib.generateRandomIV(0);
      } catch (message) {
        expect(message).to.equal(errorMessage);
      }

      try {
        cryptLib.generateRandomIV('0');
      } catch (message) {
        expect(message).to.equal(errorMessage);
      }
    });

    it('length = 2', function() {
      var iv = cryptLib.generateRandomIV(2);
      expect(iv).to.have.length(2);
      expect(iv).to.be.string;
    });

    it('length = 100', function() {
      var iv = cryptLib.generateRandomIV(100);
      expect(iv).to.have.length(100);
      expect(iv).to.be.string;
    });
  });

  describe('getHashSha256()', function() {
    var lengthErrorMessage = 'cryptLib.getHashSha256() -> needs length or in wrong format',
        keyErrorMessage = 'cryptLib.getHashSha256() -> needs key',
        validKey = 'key';

    it('no key should throw error', function() {
      try {
        cryptLib.getHashSha256(null,2);
      } catch (message) {
        expect(message).to.equal(keyErrorMessage);
      }
    });

    it('no length should throw error', function() {
      try {
        cryptLib.getHashSha256(validKey, null);
      } catch (message) {
        expect(message).to.equal(lengthErrorMessage);
      }
    });

    it('non-numeric and non-whole number length should throw error', function() {
      try{
        cryptLib.getHashSha256(validKey, 'abc');
      } catch (message) {
        expect(message).to.equal(lengthErrorMessage);
      }

      try{
        cryptLib.getHashSha256(validKey, '12a'); 
      } catch (message) {
        expect(message).to.equal(lengthErrorMessage);
      }

      try{
        cryptLib.getHashSha256(validKey, '12.2'); 
      } catch (message) {
        expect(message).to.equal(lengthErrorMessage);
      }
    });

    it('negative length should throw error', function() {
      try {
        cryptLib.getHashSha256(validKey, '-1');
      } catch (message) {
        expect(message).to.equal(lengthErrorMessage);
      }

      try {
        cryptLib.getHashSha256(validKey, -1);
      } catch (message) {
        expect(message).to.equal(lengthErrorMessage);
      }
    });

    it('length = 0, should throw error', function() {
      try {
        cryptLib.getHashSha256(validKey, 0);
      } catch (message) {
        expect(message).to.equal(lengthErrorMessage);
      }

      try {
        cryptLib.getHashSha256(validKey, '0');
      } catch (message) {
        expect(message).to.equal(lengthErrorMessage);
      }
    });

    it('valid key with length = 2', function() {
      var sha = cryptLib.getHashSha256(validKey, 2);
      expect(sha).to.have.length(2);
      expect(sha).to.be.string;
    });

    it('valid key with length = 64', function() {
      var sha = cryptLib.getHashSha256(validKey, 64);
      expect(sha).to.have.length(64);
      expect(sha).to.be.string;
    });

    it('valid key with length = 100 should return 64 char sha', function() {
      var sha = cryptLib.getHashSha256(validKey, 100);
      expect(sha).to.have.length(64);
      expect(sha).to.be.string;
    });
  });

  describe('encrypt() and decrypt() tests', function() {
    var errorMessage = 'cryptLib._encryptDecrypt: -> key and plain or encrypted text required',
        plainText = 'This is the plain text that will be encrypted and decrypted',
        myKey = 'myKey';

    it('encrypt() with no plain text should throw error', function() {
      try {
        cryptLib.encrypt(null, 'key123', 'iv123');
      } catch(error) {
        expect(error).to.equal(errorMessage);
      }
    });

    it('encrypt() with no key should throw error', function() {
      try {
        cryptLib.encrypt(plainText, null, 'iv123');
      } catch(error) {
        expect(error).to.equal(errorMessage);
      }
    });

    it('basic encrypt() decrypt() locally : 0 char iv and 2 char key', function() {
      var iv = '',
          keyHashed = cryptLib.getHashSha256(myKey, 2),
          encryptedText = cryptLib.encrypt(plainText, keyHashed, iv),
          regularText = cryptLib.decrypt(encryptedText, keyHashed, iv);
      expect(regularText).to.equal(plainText);
    });

    it('basic encrypt() decrypt() locally : 2 char iv and 2 char key', function() {
      var iv = cryptLib.generateRandomIV(2),
          keyHashed = cryptLib.getHashSha256(myKey, 2),
          encryptedText = cryptLib.encrypt(plainText, keyHashed, iv),
          decryptedText = cryptLib.decrypt(encryptedText, keyHashed, iv);
      expect(decryptedText).to.equal(plainText);
    });

    it('basic encrypt() decrypt() locally : 16 char iv and 32 char key', function() {
      var iv = cryptLib.generateRandomIV(16),
          keyHashed = cryptLib.getHashSha256(myKey, 32),
          encryptedText = cryptLib.encrypt(plainText, keyHashed, iv),
          decryptedText = cryptLib.decrypt(encryptedText, keyHashed, iv);
      expect(decryptedText).to.equal(plainText);
    });

    it('basic encrypt() decrypt() locally : 20 char iv and 80 char key', function() {
      var iv = cryptLib.generateRandomIV(20),
          keyHashed = cryptLib.getHashSha256(myKey, 80),
          encryptedText = cryptLib.encrypt(plainText, keyHashed, iv),
          decryptedText = cryptLib.decrypt(encryptedText, keyHashed, iv);
      expect(decryptedText).to.equal(plainText);
    });

    it('decrypt 0 char iv and 2 char key generated by c#', function() {
      var cSharpIv = '',
          cSharpKey = 'b1',
          cSharpPlainText = 'C# text that\'s going to be decrypted',
          cSharpCipher = 'M2rfrn9DqNHJe3Hev9nMxKKgIHoqUsc7FJM+tBGxIrl3Wk9UeKIQ5fRUUZF3q2i5',
          nodeDecrpytedText;
      nodeDecrpytedText = cryptLib.decrypt(cSharpCipher, cSharpKey, cSharpIv);
      expect(nodeDecrpytedText).to.equal(cSharpPlainText);
    });

    it('decrypt 2 char iv and 2 char key generated by c#', function() {
      var cSharpIv = 'sA',
          cSharpKey = 'b1',
          cSharpPlainText = 'C# text that\'s going to be decrypted',
          cSharpCipher = '90iAiA80rSiyEoCAnLC9KNYt41koQKs2Lo5NzciyELkoZGne+BAv1ScMXSWETyAL',
          nodeDecrpytedText;
      nodeDecrpytedText = cryptLib.decrypt(cSharpCipher, cSharpKey, cSharpIv);
      expect(nodeDecrpytedText).to.equal(cSharpPlainText);
    });

    it('decrypt 16 char iv and 32 char key generated by c#', function() {
      var cSharpIv = 'HCHXjb_wIURjCV3G',
          cSharpKey = 'b16920894899c7780b5fc7161560a412',
          cSharpPlainText = 'C# text that\'s going to be decrypted',
          cSharpCipher = '0kv/H19UoAN21Et5jSNTM/yKQAaEPiB5Y6qugTQs3kvNuwMLBiOeFwMFnYr9KZBa',
          nodeDecrpytedText;
      nodeDecrpytedText = cryptLib.decrypt(cSharpCipher, cSharpKey, cSharpIv);
      expect(nodeDecrpytedText).to.equal(cSharpPlainText);
    });
  });

  // it('encrypt', function() {
  //   var keyBuffer = new Buffer('b16920894899c7780b5fc7161560a412');
  //   cryptLib.encrypt('This is the text to be encrypted',
  //     keyBuffer,
  //     'U10Y50GjNZ04wTvw');
  // });
  
  // it('encrypt with 10bit IV', function() {
  //   var iv = 'JHI1B',
  //       hash = 'b16920894899c77',
  //       clearText = 'This is the text to be encrypted',
  //       cipherText, decryptedText;

  //   cipherText = cryptLib.encrypt(clearText, hash, iv);

  //   decryptedText = cryptLib.decrypt(cipherText, hash, iv);

  //   expect(decryptedText).to.equal(clearText);
  // });

});

