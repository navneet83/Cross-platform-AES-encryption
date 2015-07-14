/*global it, describe, require*/

var chai = require('chai'),
    expect = chai.expect,
    CryptLib = require('../lib/CryptLib.js');

describe('developer tests', function() {

  var cryptLib;

  before(function() {
    cryptLib = new CryptLib();
  });

  after(function() {
    delete cryptLib;
  });

  it('encrypt', function() {
    cryptLib.encrypt('This is the text to be encrypted',
      'b16920894899c7780b5fc7161560a412',
      'U10Y50GjNZ04wTvw');
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
