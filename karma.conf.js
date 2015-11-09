module.exports = function(config) {
    config.set({

        basePath: '',

        frameworks: ['jasmine'],

        files: [
            // paths loaded by Karma
            {pattern: 'dist/vendor.js', included: true, watched: true},
            {pattern: 'node_modules/angular2/bundles/testing.js', included: true, watched: true},
            {pattern: 'karma-test-shim.js', included: true, watched: true},
            //{pattern: 'src/test/matchers.js', included: true, watched: true},

            // paths loaded via module imports
            {pattern: 'dist/app/**/*.js', included: false, watched: true},
            {pattern: 'dist/test/**/*.js', included: false, watched: true},
            // paths loaded via Angular's component compiler
            // (these paths need to be rewritten, see proxies section)
            {pattern: 'dist/app/**/!(index)*.html', included: true, watched: true},
            {pattern: 'dist/**/*.css', included: true, watched: true},

            // paths to support debugging with source maps in dev tools
            {pattern: 'src/**/*.ts', included: false, watched: false}
        ],

        // proxied base paths
        proxies: {
            // required for component assests fetched by Angular's compiler
            "/app/": "/base/dist/app/"
        },

        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false
    })
}
