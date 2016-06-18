'use strict';

const MultiTypeValue = require('./MultiTypeValue');

function getFromEnv(aKey, opt, env) {
  const key = `${opt.envPrefix}${opt.envConverter(aKey)}`;

  return env[key] ? new MultiTypeValue(env[key]) : null;
}

getFromEnv.converter = function converter(aKey) {
  return aKey.toUpperCase().replace(/\./g, '_');
};

module.exports = getFromEnv;
