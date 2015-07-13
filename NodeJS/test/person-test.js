/*global it, describe, require*/

var chai = require('chai'),
    expect = chai.expect,
    Person = require('../lib/person.js');

describe('person tests', function() {

  var person;

  before(function() {
    person = new Person('Alex', '99');
  });

  after(function() {
    delete person;
  });

  it('getName', function() {
    expect(person.getName()).to.equal('Alex');
  });

  it('getAge', function() {
    expect(person.getAge()).to.equal('99');
  });

});
