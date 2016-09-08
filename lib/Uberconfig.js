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
const opts = new WeakMap();
const defaults = new WeakMap();

class Uberconfig {
  constructor(config, opt) {
    this.config = config;
    opts.set(this, Object.assign({}, DEFAULTS, opt));
    defaults.set(this, {});
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
        () => getFromCliArg(key, opts.get(this), minimist(proc.argv.slice(2))),
        () => getFromEnv(key, opts.get(this), proc.env),
        () => dot.pick(key, this.config),
      ].reduce((aValue, getter) => {
        if (aValue === null) {
          return getter();
        }

        return aValue;
      }, null),
      getDefault(
        defaults.get(this),
        { defaultValue, conflictResolver },
        key
      ),
      key
    );
  }
}

module.exports = Uberconfig;
