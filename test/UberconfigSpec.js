'use strict';

const Uberconfig = require('../lib/Uberconfig');
const errorMatching = require('./helper/errorMatching');

describe('Uberconfig', () => {
  let fooValue = null;
  let barValue = null;
  let bazValue = null;

  beforeEach(() => {
    fooValue = Symbol('foo');
    barValue = Symbol('bar');
    bazValue = Symbol('baz');
  });

  describe('#get', () => {
    it('gets a simple value', () => {
      const config = new Uberconfig({ foo: fooValue });

      expect(config.get('foo', barValue)).toBe(fooValue);
    });

    it('gets a nested value', () => {
      const config = new Uberconfig({ foo: { bar: barValue } });

      expect(config.get('foo.bar', bazValue)).toBe(barValue);
    });

    it('falls back to default value if no configuration present', () => {
      const config = new Uberconfig({ foo: fooValue });

      expect(config.get('bar', barValue)).toBe(barValue);
    });

    it('can not get a value without providing a default', () => {
      const config = new Uberconfig({ foo: fooValue });

      expect(() => config.get('bar')).toThrow(errorMatching('"bar"'));
    });
  });
});
