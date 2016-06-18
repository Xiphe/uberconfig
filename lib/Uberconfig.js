/* eslint-disable no-underscore-dangle */
'use strict';

const type = require('useful-type');
const dot = require('dot-object');
const getDefault = require('./getDefault');
const getFromEnv = require('./getFromEnv');
const getValue = require('./getValue');
const getFromCliArg = require('./getFromCliArg');
const proc = require('./process');
const minimist = require('minimist');
const DEFAULTS = {
  envPrefix: 'UBERCONFIG_',
  envConverter: getFromEnv.converter,
  cliPrefix: 'uc-',
  cliConverter: getFromCliArg.converter,
};

class Uberconfig {
  constructor(config, opt) {
    this.config = config;
    this._opt = Object.assign({}, DEFAULTS, opt);
    this._defaultsMap = {};
  }
  request(requests, conflictResolver) {
    const response = {};

    Object.keys(requests).forEach(key => {
      const request = requests[key];

      response[request.as || key] = this.get(
        key,
        request.default,
        request.conflictResolver || conflictResolver
      );
    });

    return dot.object(response);
  }
  get(key, defaultValue, conflictResolver) {
    if (type(defaultValue) === 'undefined') {
      throw new Error(`can not get uberconfig "${key}" without default value`);
    }

    return getValue(
      [
        () => getFromCliArg(key, this._opt, minimist(proc.argv.slice(2))),
        () => getFromEnv(key, this._opt, proc.env),
        () => dot.pick(key, this.config),
      ].reduce((aValue, getter) => {
        if (aValue === null) {
          return getter();
        }

        return aValue;
      }, null),
      getDefault(
        this._defaultsMap,
        { defaultValue, conflictResolver },
        key
      ),
      key
    );
  }
}

module.exports = Uberconfig;
