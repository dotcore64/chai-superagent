/* eslint-disable global-require */

// Karma configuration
// Generated on Wed May 11 2016 23:26:57 GMT+0900 (JST)

process.env.NODE_ENV = 'test';
if (!process.env.CHROME_BIN) process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['sharding', 'mocha'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'test/assertions.js', type: 'module' },
      { pattern: 'test/integration.js', type: 'module' },
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/*.js': ['rollup', 'sourcemap'],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    rollupPreprocessor: {
      plugins: [
        require('rollup-plugin-istanbul')({ exclude: ['test/**', 'node_modules/**'] }),
        require('@rollup/plugin-alias')({ entries: { http: './test/http-polyfill.js' } }),
        require('@rollup/plugin-node-resolve').default({
          mainFields: ['module', 'browser', 'main'],
        }),
        require('@rollup/plugin-commonjs')({ include: 'node_modules/**' }),
      ],
      output: {
        format: 'esm',
        sourcemap: 'inline',
      },
    },

    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html' },
        { type: 'lcov' },
      ],
    },
  });
};