uberconfig
==========

[![Build Status](https://travis-ci.org/Xiphe/uberconfig.svg?branch=master)](https://travis-ci.org/Xiphe/uberconfig)
[![Coverage Status](https://coveralls.io/repos/github/Xiphe/uberconfig/badge.svg?branch=master)](https://coveralls.io/github/Xiphe/uberconfig?branch=master)
[![bitHound Overall Score](https://www.bithound.io/github/Xiphe/uberconfig/badges/score.svg)](https://www.bithound.io/github/Xiphe/uberconfig)
[![bitHound Dependencies](https://www.bithound.io/github/Xiphe/uberconfig/badges/dependencies.svg)](https://www.bithound.io/github/Xiphe/uberconfig/master/dependencies/npm)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Love and Peace](http://love-and-peace.github.io/love-and-peace/badges/karma/v1.0-karma1.svg)](https://github.com/love-and-peace/love-and-peace/blob/master/versions/karma/v1.0-karma1/en.md)

configuration manager for multi-module configs.


In order to...
--------------

In order to share configuration between parts of an application that 
do not even know each other.

Multiple configuration consumers come into an agreement by passing a 
default value with each request for a configuration value. — Given 
the default values are equal, we assume the consumers are up to the
same thing.

This will hopefully lead to a world with fever unnecessary namespaces
and more communication between maintainers of modules that share same
intentions. In the case of conflicting default values, I would love to see
the conflicting parties come to an agreement together instead of
expanding the namespaces.

<3


Install
-------

`npm install uberconfig`


Use
---

```js
const Uberconfig = require('uberconfig');
const config = new Uberconfig({
  foo: 'bar',
  lorem: {
    ipsum: 'dolor',
    sit: 'amet'
  }
});

config.get('foo', 'A');
// 'bar'

config.get('lorem.ipsum', 'B');
// 'dolor'

config.get('foo.bar', 'C');
// 'C'

config.get('foo');
// throws 'can not get uberconfig "foo" without default value'

config.get('lorem.sit', false);
// throws 'config value for "lorem.sit" must be of type boolean but is string'

config.get('foo', 'D');
// throws 'conflicting default values for uberconfig "foo" expected "D" to equal "A"'

config.get('foo', 'D', function resolveDefaultConflict(myDefault, conflicts, key) {
  myDefault.defaultValue = conflicts[0].defaultValue;

  return myDefault;
});
// 'bar'

config.request({
  'lorem.sit': {
    default: 'something',
    as: 'newKey'
  },
  'bar.foo': {
    default: 'baz'
  }
});
// {newKey: 'amet', bar: {foo: 'baz'}}
```

environment variables and CLI params
------------------------------------

Given script `foo.js`:

```js
const Uberconfig = require('uberconfig');
console.log(new Uberconfig().get('foo.bar', 'hey'));
```

Shell usage:

```sh
node foo.js
# logs: hey

UBERCONFIG_FOO_BAR=ho node foo.js
# logs: ho

node foo.js --uc-foo-bar='lets go'
# logs: lets go
```

CLI param > environment variable > config value > default value


Options
-------

can be passed as second parameter into construction

```js
new Uberconfig(config, options);
```

 - ### `options.envPrefix:String`
   __Default: `UBERCONFIG_`__

   prefix for environment variable lookup

 - ### `options.envConverter:Function`
   function converting a config key to environment variable name  
   default will convert `a.foo` to `A_FOO`  
   In combination with `envPrefix` `a.foo` can be set using
   `UBERCONFIG_A_FOO=bar`

 - ### `options.cliPrefix:String`
   __Default: `uc-`__

   prefix for CLI parameter lookup

 - ### `options.cliConverter:Function`
   function converting a config key to CLI parameter name  
   default will convert `a.foo` to `a-foo`  
   In combination with `cliPrefix` `a.foo` can be set using
   `--uc-a-foo=bar`


Multi type values
-----------------

In case you do not know which type a configuration variable must have
by default, wrap it up as a MultiTypeValue.

_Hint: Do not do this, it's an anti-pattern.  
May be required when you pass though parts of the uberconfig API..._

See [implementation of MultiTypeValue](https://github.com/Xiphe/uberconfig/blob/master/lib/MultiTypeValue.js) for details

```js
const Uberconfig = require('uberconfig');
const MultiTypeValue = Uberconfig.MultiTypeValue;

class MyMultiTypeValue extends MultiTypeValue {
  convertBoolean(value) {
    if (value === 5) {
      return true;
    }

    return false;
  }
  convertString(value) {
    if (value === 5) {
      return 'ipsum';
    }

    return value + '';
  }
}

const someUserInput = 5;
const myConf = {
  foo: {
    bar: new MyMultiTypeValue(someUserInput)
  }
};

const booleanDefaultVal = false;
console.log(new Uberconfig(myConf).get('foo.bar', booleanDefaultVal));
// logs true

const stringDefaultVal = 'lorem';
console.log(new Uberconfig(myConf).get('foo.bar', stringDefaultVal));
// logs 'ipsum'
```

License
-------

> The MIT License
> 
> Copyright (C) 2016 Hannes Diercks
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the "Software"), to deal in
> the Software without restriction, including without limitation the rights to
> use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
> of the Software, and to permit persons to whom the Software is furnished to do
> so, subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
> FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
> COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
> IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
