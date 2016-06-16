'use strict';

module.exports = function errorMatching(str) {
  return {
    asymmetricMatch(actual) {
      expect(actual).toEqual(jasmine.any(Error));
      expect(actual.message).toEqual(jasmine.stringMatching(str));
      return true;
    },
  };
};
