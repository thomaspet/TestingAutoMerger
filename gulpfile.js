var gulp = require('gulp');
var runSequence = require('run-sequence');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

/**
 *  Download uni entities form server
 */
require('./gulp/entities');

/**
 * clean tasks (js, css, html, all)
 */
require('./gulp/clean');

/**
 *  compile src folder from typscript to javascript
 */
require('./gulp/ts2js');

/**
 * bundle vendor files
 */
require('./gulp/vendors');

/**
 * compile sass to css
 */
require('./gulp/sass2css');

/**
 * builds index.html file
 */
require('./gulp/index-html');

/**
 * copy angular files to dist folder
 */
require('./gulp/angular2');

/**
 * copy system configuration to dist folder
 */
require('./gulp/system-config');

/**
 * copy unitable to dist folder
 */
require('./gulp/unitable');

/**
 * copy stimulsoft to dist folder
 */
require('./gulp/stimulsoft');

/**
 *  copy assets to dist folder
 */
require('./gulp/assets');

/**
 *  copy templates to dist folder
 */
require('./gulp/templates');

/**
 *  watch for different files
 */
require('./gulp/watch');

/**
 *  copy webconfig
 */
require('./gulp/web-config');

/**
 *  zip dist folder
 */
require('./gulp/zip');

var tasks = {
    prod: [
        'entities',
        'index.html',
        'angular2',
        'unitable',
        'stimulsoft',
        'templates',
        'assets',
        'web.config',
        'system.config'
    ],
    dev: [
        'index.html.dev',
        'angular2',
        'unitable',
        'stimulsoft',
        'templates',
        'assets',
        'web.config',
        'system.config',
        'ts-source'
    ]
};

gulp.task('build', function(done) {
    runSequence(tasks.prod, done);
});

gulp.task('build.dev', function(done) {
    runSequence(tasks.dev, done);
});

gulp.task('build.dev.watch', function(done) {
    runSequence(tasks.dev, 'watch', done);
});