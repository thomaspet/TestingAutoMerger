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
 * copies apidoc.html file
 */
require('./gulp/apidoc-html');

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
require('./gulp/dependencies');

/**
 * copy stimulsoft to dist folder
 */
require('./gulp/stimulsoft');

/**
 * copy onesignal to dist folder
 */
require('./gulp/onesignal');

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

/**
 *  create systemjs bundle for rxjs lib
 */
require('./gulp/rxbundle');


/**
 *  Generate the correct config files
 */
require('./gulp/app-config');

var tasks = {
    prod: [
        'app-config-prod',
        'index.html.prod',
        'apidoc.html',
        'angular2',
        'dependencies',
        'stimulsoft',
        'onesignal',
        'templates',
        'assets',
        'web.config',
        'system.config'
    ],
    dev: [
        'app-config-dev',
        'index.html.dev',
        'apidoc.html',
        'angular2',
        'dependencies',
        'stimulsoft',
        'onesignal',
        'templates',
        'assets',
        'web.config',
        'system.config',
        'ts-source'
    ],
    local: [
        'app-config-local',
        'index.html.dev',
        'apidoc.html',
        'angular2',
        'dependencies',
        'stimulsoft',
        'onesignal',
        'templates',
        'assets',
        'web.config',
        'system.config',
        'ts-source'
    ],
    customConfig: [
        'index.html.dev',
        'apidoc.html',
        'angular2',
        'dependencies',
        'stimulsoft',
        'onesignal',
        'templates',
        'assets',
        'web.config',
        'system.config',
        'ts-source'
    ],
    pilot: [
        'app-config-pilot',
        'index.html.pilot',
        'apidoc.html',
        'angular2',
        'dependencies',
        'stimulsoft',
        'onesignal',
        'templates',
        'assets',
        'web.config',
        'system.config',
        'ts-source'
    ]
};

gulp.task('build.prod', function(done) {
    runSequence(tasks.prod, done);
});

gulp.task('build.local', function(done) {
    runSequence(tasks.local, done);
});

gulp.task('build.customConfig', function(done) {
    runSequence(tasks.customConfig, done);
});

gulp.task('build.dev', function(done) {
    runSequence(tasks.dev, done);
});

gulp.task('build.pilot', function(done) {
    runSequence(tasks.pilot, done);
});

gulp.task('build.dev.watch', function(done) {
    runSequence('build.dev', 'watch', done);
});

gulp.task('build.local.watch', function(done) {
    runSequence('build.local', 'watch', done);
});

gulp.task('build.customConfig.watch', function(done) {
    runSequence('build.customConfig', 'watch', done);
});