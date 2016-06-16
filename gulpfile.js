'use strict';

const proxyquire = require('proxyquire');
const gulp = require('gulp');
const Uberconfig = require('./index');
Uberconfig['@noCallThru'] = true;
Uberconfig['@global'] = true;
const GulpToolboxRegistry = proxyquire(
  './node_modules/gulp-toolbox-registry/index',
  { uberconfig: Uberconfig }
);
const testNodeJasmine = require('gulp-toolbox-test-node-jasmine');
const pipeCoverageIstanbul = require('gulp-toolbox-pipe-coverage-istanbul');
const reporterCoverage = require('gulp-toolbox-reporter-coveralls');

gulp.registry(new GulpToolboxRegistry({
  toolboxes: [
    testNodeJasmine,
    reporterCoverage,
  ],
  pipes: [
    pipeCoverageIstanbul,
  ],
  config: {
    files: {
      test: {
        node: {
          specs: ['test/**/*Spec.js'],
        },
      },
    },
  },
}));
