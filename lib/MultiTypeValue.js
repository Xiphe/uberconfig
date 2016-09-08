/* eslint-disable class-methods-use-this */

'use strict';

const type = require('useful-type');

function ucfirst(str) {
  return `${str.charAt(0).toUpperCase()}${str.substr(1)}`;
}

class MultiTypeValue {
  constructor(value) {
    this.originalValue = value;
    this.value = value;
  }
  convertBoolean(value) {
    if (this.falsyStrings.indexOf(value) > -1) {
      return false;
    }

    return Boolean(value);
  }
  convertNumber(value) {
    return parseFloat(value);
  }
  convertString(value) {
    if (type(value) === 'object') {
      return JSON.stringify(value);
    }

    return `${value}`;
  }
  convertArray(value) {
    if (type(value) === 'string') {
      return value.split(this.arrayDelmiter);
    }

    return [value];
  }
  convertFunction(value) {
    return () => value;
  }
  convert(toType) {
    const convertMethod = `convert${ucfirst(toType)}`;

    if (type(this.value) === toType) {
      return;
    } else if (type(this.originalValue) === toType) {
      this.value = this.originalValue;
    } else if (this[convertMethod]) {
      this.value = this[convertMethod](this.originalValue);
    }
  }
  get() {
    return this.value;
  }
  toString() {
    return this.convertString(this.value);
  }
}

MultiTypeValue.prototype.falsyStrings = [
  '0',
  'null',
  'false',
  'NaN',
  'undefined',
];

MultiTypeValue.prototype.arrayDelmiter = ',';

module.exports = MultiTypeValue;
