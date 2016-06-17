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

    it('throws when configuration types are incompatible', () => {
      const config = new Uberconfig({ foo: false });

      expect(
        () => config.get('foo', 'false')
      ).toThrow(errorMatching('must be of type string but is boolean'));
    });

    it(
      'throws when a different default parameter has been used' +
      ' in a prior get',
      () => {
        const config = new Uberconfig({ foo: 1 });

        config.get('foo', 2);

        expect(
          () => config.get('foo', 3)
        ).toThrow(errorMatching('conflicting default values for uberconfig'));
      }
    );

    it('supports a conflict resolver as third parameter', () => {
      const config = new Uberconfig({ foo: fooValue });
      const resolvedDefault = { defaultValue: barValue };
      const resolver = jasmine.createSpy().and.returnValue(resolvedDefault);

      config.get('foo', barValue);
      const result = config.get('foo', bazValue, resolver);

      expect(result).toBe(fooValue);
      expect(resolver.calls.count()).toBe(1);
      expect(resolver).toHaveBeenCalledWith(
        jasmine.objectContaining({ defaultValue: bazValue }),
        [
          jasmine.objectContaining({ defaultValue: barValue }),
          resolvedDefault,
        ],
        'foo'
      );
    });
  });
});
