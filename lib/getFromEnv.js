'use strict';

const MultiTypeValue = require('./MultiTypeValue');

function getFromEnv(aKey, opt) {
  const key = `${opt.envPrefix}${opt.envConverter(aKey)}`;

  return process.env[key] ? new MultiTypeValue(process.env[key]) : null;
}

getFromEnv.converter = function converter(aKey) {
  return aKey.toUpperCase().replace(/\./g, '_');
};

module.exports = getFromEnv;
