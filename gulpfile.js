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

var runSequence = require('run-sequence');
var gulp = require('gulp');

var tasks = [
    'index.html',
    'angular2',
    'unitable',
    'templates',
    'assets',
    'web.config',
    'system.config'
];

gulp.task('build.watch', function(done) {
    runSequence('clean.all', tasks, 'watch', done);
});

gulp.task('build', function(done) {
    runSequence('clean.all', tasks, done);
});