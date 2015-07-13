'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

/*global console*/

var _person = require('./person');

var _person2 = _interopRequireDefault(_person);

var Developer = (function (_Person) {
  _inherits(Developer, _Person);

  function Developer(name, age) {
    var occupation = arguments.length <= 2 || arguments[2] === undefined ? 'JavaScript Developer' : arguments[2];

    _classCallCheck(this, Developer);

    _get(Object.getPrototypeOf(Developer.prototype), 'constructor', this).call(this, name, age);
    this.occupation = occupation;
  }

  _createClass(Developer, [{
    key: 'sayWhoAmI',
    value: function sayWhoAmI() {
      console.log(this.getWhoAmI());
    }
  }, {
    key: 'getWhoAmI',
    value: function getWhoAmI() {
      return this.name + ' ' + this.occupation;
    }
  }]);

  return Developer;
})(_person2['default']);

exports['default'] = Developer;
module.exports = exports['default'];