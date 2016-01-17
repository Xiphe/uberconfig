'use strict';

const type = require('useful-type');
const dot = require('dot-object');
const getDefault = require('./getDefault');

module.exports = class Uberconfig {
  constructor(config) {
    this.config = config;
    this._defaultsMap = {};
  }
  request(requests, conflictResolver) {
    const response = {};

    for (const key in requests) {
      if (requests.hasOwnProperty(key)) {
        const request = requests[key];

        response[request.as || key] = this.get(
          key,
          request.default,
          request.conflictResolver || conflictResolver
        );
      }
    }

    return dot.object(response);
  }
  get(key, originDefaultValue, conflictResolver) {
    var value = null;
    var defaultValue = null;

    if (type(originDefaultValue) === 'undefined') {
      throw new Error(`can not get uberconfig "${key}" without default value`);
    }

    value = dot.pick(key, this.config);
    defaultValue = getDefault(
      this._defaultsMap,
      {defaultValue: originDefaultValue, conflictResolver},
      key
    );

    if (type(value) === 'undefined') {
      value = defaultValue;
    } else if (type(value) !== type(defaultValue)) {
      throw new Error(
        `config value for "${key}"` +
        ` must be of type ${type(defaultValue)}` +
        ` but is ${type(value)}`
      );
    }

    return value;
  }
};
