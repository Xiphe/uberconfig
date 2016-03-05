'use strict';

const type = require('useful-type');
const MultiTypeValue = require('./MultiTypeValue');

module.exports = function getValue(aValue, defaultValue, key) {
  var value = aValue;

  if (type(value) === 'undefined') {
    return defaultValue;
  }

  if (value instanceof MultiTypeValue) {
    value.convert(type(defaultValue));
    value = value.get();
  }

  if (type(value) !== type(defaultValue)) {
    throw new Error(
      `config value for "${key}"` +
      ` must be of type ${type(defaultValue)}` +
      ` but is ${type(value)}`
    );
  }

  return value;
};
