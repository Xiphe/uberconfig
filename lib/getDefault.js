'use strict';

const assert = require('assert');
const type = require('useful-type');

function isCompatible(defaultA, defaultB) {
  try {
    assert.deepEqual(defaultA.defaultValue, defaultB.defaultValue);
  } catch (__) {
    return false;
  }

  return true;
}

function resolveConflict(defaultsMap, newDefault, key) {
  const otherDefaultValues = defaultsMap[key]
    .reduce((otherValues, currentDefault) => {
      otherValues.push(currentDefault.defaultValue);

      return otherValues;
    }, []);

  if (type(newDefault.conflictResolver) !== 'function') {
    throw new Error(`conflicting default values for uberconfig "${key}" ` +
      `expected ${JSON.stringify(newDefault.defaultValue)} ` +
      `to equal ${JSON.stringify(otherDefaultValues[0])}`);
  }

  return getDefaultValue( // eslint-disable-line no-use-before-define
    defaultsMap,
    {
      defaultValue: newDefault.conflictResolver(
        newDefault,
        defaultsMap[key],
        key
      ).defaultValue,
    },
    key
  );
}

function hasIncompatible(defaults, newDefault) {
  return Boolean(defaults.find(otherDefault => (
    !isCompatible(newDefault, otherDefault)
  )));
}

function getDefaultValue(defaultsMap, newDefault, key) {
  if (!defaultsMap[key]) {
    defaultsMap[key] = []; // eslint-disable-line no-param-reassign
  } else if (hasIncompatible(defaultsMap[key], newDefault)) {
    return resolveConflict(defaultsMap, newDefault, key);
  }

  defaultsMap[key].push(newDefault);

  return newDefault.defaultValue;
}

module.exports = getDefaultValue;
