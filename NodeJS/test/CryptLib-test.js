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
    cryptLib.encrypt('This is the text to be encrypted','b16920894899c7780b5fc7161560a41','CXV15IRuojdLFNUC');
  });

});
