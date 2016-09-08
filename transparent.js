'use strict';

module.exports = require('./index');

Object.keys(require.cache)
  .filter(cachedPath => (
    cachedPath.indexOf('uberconfig') !== -1 &&
    cachedPath.indexOf('node_modules') === -1
  )).map(cachedPath => delete require.cache[cachedPath]);
