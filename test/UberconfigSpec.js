'use strict';

const proxyquire = require('proxyquire');
const MultiTypeValue = require('../lib/MultiTypeValue');
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

  describe('with environment variables', () => {
    it('converts falsy strings to false', () => {
      const config = new Uberconfig();

      fakeProcess.env.UBERCONFIG_FOO = '0';
      expect(config.get('foo', true)).toBe(false);
      fakeProcess.env.UBERCONFIG_FOO = 'null';
      expect(config.get('foo', true)).toBe(false);
      fakeProcess.env.UBERCONFIG_FOO = 'false';
      expect(config.get('foo', true)).toBe(false);
      fakeProcess.env.UBERCONFIG_FOO = 'NaN';
      expect(config.get('foo', true)).toBe(false);
      fakeProcess.env.UBERCONFIG_FOO = 'undefined';
      expect(config.get('foo', true)).toBe(false);
    });

    it('converts truthy strings to true', () => {
      const config = new Uberconfig();

      fakeProcess.env.UBERCONFIG_FOO = 'some string';
      expect(config.get('foo', true)).toBe(true);
      fakeProcess.env.UBERCONFIG_FOO = 'true';
      expect(config.get('foo', true)).toBe(true);
    });

    it('converts to numbers', () => {
      const config = new Uberconfig();

      fakeProcess.env.UBERCONFIG_FOO = '1.5';
      expect(config.get('foo', 0)).toBe(1.5);
    });

    it('converts to string', () => {
      const config = new Uberconfig();

      fakeProcess.env.UBERCONFIG_FOO = { hey: 'ho' };
      expect(config.get('foo', 'world')).toBe('{"hey":"ho"}');

      fakeProcess.env.UBERCONFIG_FOO = [1];
      fakeProcess.env.UBERCONFIG_FOO.toString = () => 'foo';
      expect(config.get('foo', 'world')).toBe('foo');

      fakeProcess.env.UBERCONFIG_FOO = 1;
      expect(config.get('foo', 'world')).toBe('1');
    });

    it('converts strings to array', () => {
      const config = new Uberconfig();

      fakeProcess.env.UBERCONFIG_FOO = 'a,b,c';

      expect(config.get('foo', [])).toEqual(['a', 'b', 'c']);
    });

    it('wraps other values with array', () => {
      const config = new Uberconfig();

      fakeProcess.env.UBERCONFIG_FOO = 1;

      expect(config.get('foo', [])).toEqual([1]);
    });

    it('wraps values with getter function', () => {
      const config = new Uberconfig();

      fakeProcess.env.UBERCONFIG_FOO = 'bar';

      expect(config.get('foo', () => {})()).toEqual('bar');
    });
  });

  describe('with MultiTypeValue', () => {
    it('can resolve to multiple types', () => {
      const mtv = new MultiTypeValue('false');
      const config = new Uberconfig({
        foo: mtv,
        bar: mtv,
      });

      expect(config.get('foo', true)).toBe(false);
      expect(config.get('bar', 'baz')).toBe('false');
    });

    it('gives up when there is no converter for a given type', () => {
      const mtv = new MultiTypeValue(1);
      const config = new Uberconfig({
        foo: mtv,
      });

      expect(() => config.get('foo', new Date()))
        .toThrow(errorMatching('must be of type date but is number'));
    });

    it('is extendible', () => {
      const mtv = new MultiTypeValue(1);
      const someDate = new Date();
      mtv.convertDate = () => someDate;
      const config = new Uberconfig({
        foo: mtv,
      });

      expect(config.get('foo', new Date())).toBe(someDate);
    });

    it('can be used as a string', () => {
      const mtv = new MultiTypeValue({ foo: 'bar' });

      expect(`${mtv}`).toBe('{"foo":"bar"}');
    });
  });
});
