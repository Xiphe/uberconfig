'use strict';

const proxyquire = require('proxyquire');
const errorMatching = require('./helper/errorMatching');

describe('Uberconfig', () => {
  let fooValue = null;
  let barValue = null;
  let bazValue = null;
  let Uberconfig = null;
  let fakeProcess = null;

  beforeEach(() => {
    fooValue = Symbol('foo');
    barValue = Symbol('bar');
    bazValue = Symbol('baz');
    fakeProcess = {
      argv: [],
      env: {},
    };

    Uberconfig = proxyquire('../lib/Uberconfig', {
      './process': fakeProcess,
    });
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

    it('tries to get a value from environment', () => {
      const config = new Uberconfig({ foo: { bar: fooValue } });

      fakeProcess.env.UBERCONFIG_FOO_BAR = barValue;

      expect(config.get('foo.bar', bazValue)).toBe(barValue);
    });

    it('tries to get a value from CLI argument', () => {
      const val = 'foo';
      const config = new Uberconfig({ foo: { bar: 'bar' } });

      fakeProcess.env.UBERCONFIG_FOO_BAR = 'baz';
      fakeProcess.argv.push(
        null,
        null,
        `--uc-foo-bar=${val}`
      );

      expect(config.get('foo.bar', 'lorem')).toBe(val);
    });
  });

  describe('#request', () => {
    it('gets multiple configuration values at once', () => {
      const config = new Uberconfig({
        foo: fooValue,
        bar: { baz: bazValue },
        lorem: 'asd',
      });

      const result = config.request({
        foo: { default: barValue },
        'bar.baz': { default: barValue },
      });

      expect(result).toEqual({
        foo: fooValue,
        bar: { baz: bazValue },
      });
    });
  });
});
