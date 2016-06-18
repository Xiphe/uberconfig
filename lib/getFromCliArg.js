'use strict';

const MultiTypeValue = require('./MultiTypeValue');

function getFromCliArg(aKey, opt, argv) {
  const key = `${opt.cliPrefix}${opt.cliConverter(aKey)}`;

  if (['null', 'undefined'].indexOf(typeof argv[key]) > -1) {
    return null;
  }

  return new MultiTypeValue(argv[key]);
}

getFromCliArg.converter = function converter(aKey) {
  return aKey.toLowerCase().replace(/\./g, '-');
};

module.exports = getFromCliArg;
