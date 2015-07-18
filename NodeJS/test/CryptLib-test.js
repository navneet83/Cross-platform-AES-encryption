/*global it, describe, require*/

var chai = require('chai'),
    expect = chai.expect,
    CryptLib = require('../lib/CryptLib.js'),
    BufferList = require('bl');

describe('developer tests', function() {

  var cryptLib;

  before(function() {
    cryptLib = new CryptLib();
  });

  after(function() {
    cryptLib = null;
  });

  it('encrypt', function() {
    var keyBuffer = new Buffer('b16920894899c7780b5fc7161560a412');
    cryptLib.encrypt('This is the text to be encrypted',
      keyBuffer,
      'U10Y50GjNZ04wTvw');
  });
  
  it.only('encrypt with 10bit IV', function() {
    var iv = 'JHI1B',
        hash = 'b16920894899c77',
        clearText = 'This is the text to be encrypted',
        cipherText, decryptedText;

    cipherText = cryptLib.encrypt(clearText, hash, iv);

    decryptedText = cryptLib.decrypt(cipherText, hash, iv);

    expect(decryptedText).to.equal(clearText);

  });

  it('getHashSha256 should return 31 char long string', function() {
    var hash = cryptLib.getHashSha256('my secret key', 31);
    expect(hash).to.have.length(31);
    expect(hash).to.be.string;
  });

  it('generateRandomIV should return 16 char long string', function() {
    var iv = cryptLib.generateRandomIV(16);
    expect(iv).to.have.length(16);
    expect(iv).to.be.string;
  });

});

