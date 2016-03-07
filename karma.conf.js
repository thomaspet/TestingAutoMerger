'use strict';

module.exports = function(config) {
    config.set({
        basePath: './',
        frameworks: ['jasmine'],
        files: [
            'node_modules/zone.js/dist/zone-microtask.js',
            'node_modules/zone.js/dist/long-stack-trace-zone.js',
            'node_modules/zone.js/dist/jasmine-patch.js',
            'node_modules/es6-module-loader/dist/es6-module-loader.js',
            'node_modules/traceur/bin/traceur-runtime.js', // Required by PhantomJS2, otherwise it shouts ReferenceError: Can't find variable: require
            'node_modules/traceur/bin/traceur.js',
            'node_modules/systemjs/dist/system.src.js',
            'node_modules/reflect-metadata/Reflect.js',
            // beta.7 IE 11 polyfills from https://github.com/angular/angular/issues/7144
            'node_modules/angular2/es6/dev/src/testing/shims_for_IE.js',

            { pattern: 'node_modules/angular2/**/*.js', included: false, watched: false },
            //{ pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false },
            { pattern: 'dist/**/*.js', included: true, watched: true },
            { pattern: 'node_modules/systemjs/dist/system-polyfills.js', included: false, watched: false }, // PhantomJS2 (and possibly others) might require it

            'test-main.js'
        ],

        // list of files to exclude
        exclude: [
            'node_modules/angular2/**/*spec.js',
        ],

        preprocessors: {
            'dist/**(!lib)/!(*spec).js': ['coverage']
        },

        reporters: ['mocha', 'coverage'],

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
        browsers: ['PhantomJS2'],

        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                { type: 'text-summary' },
                { type: 'json', subdir: '.', file: 'coverage-final.json' },
                { type: 'html' }
            ]
        },

        singleRun: true,
        globalEvaluationScope: false
    })
}
