uberconfig
==========

[![Build Status](https://img.shields.io/travis/Xiphe/uberconfig/master.svg?style=flat-square)](https://travis-ci.org/Xiphe/uberconfig)
[![David](https://img.shields.io/david/Xiphe/uberconfig.svg?style=flat-square)](https://david-dm.org/Xiphe/uberconfig)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

configuration manager for multi-module configs.


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
    defaultValue: 'something',
    as: 'newKey'
  },
  'bar.foo': {
    defaultValue: 'baz'
  }
});
// {newKey: 'amet', bar: {foo: 'baz'}}
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
