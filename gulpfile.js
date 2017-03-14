'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const runSequence = require('run-sequence');
const rename = require('gulp-rename');
require('./gulp/entities');
require('./gulp/zip');

gulp.task('sass', function () {
  return gulp.src('./src/styles/main.sass')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./src/styles'));
});

gulp.task('sass.watch', function () {
  gulp.watch('./src/styles/**/*.sass', ['sass']);
});

// Tasks for copying the correct AppConfig
gulp.task('app-config-prod', function() {
    return gulp.src('./src/app/AppConfig-prod.ts')
        .pipe(rename('AppConfig.ts'))
        .pipe(gulp.dest('./src/app/', {overwrite: true}));
});

gulp.task('app-config-dev', function() {
    return gulp.src('./src/app/AppConfig-dev.ts')
        .pipe(rename('AppConfig.ts'))
        .pipe(gulp.dest('./src/app/', {overwrite: true}));
});

gulp.task('app-config-local', function() {
    return gulp.src('./src/app/AppConfig-local.ts')
        .pipe(rename('AppConfig.ts'))
        .pipe(gulp.dest('./src/app/', {overwrite: true}));
});

gulp.task('app-config-pilot', function() {
    return gulp.src('./src/app/AppConfig-pilot.ts')
        .pipe(rename('AppConfig.ts'))
        .pipe(gulp.dest('./src/app/', {overwrite: true}));
});

gulp.task('app-config-test-env', function() {
    return gulp.src('./src/app/AppConfig-test-env.ts')
        .pipe(rename('AppConfig.ts'))
        .pipe(gulp.dest('./src/app/', {overwrite: true}));
});


// var gulp = require('gulp');
// var runSequence = require('run-sequence');
// var plugins = require('gulp-load-plugins')({
//     lazy: true
// });

// /**
//  *  Download uni entities form server
//  */
// require('./gulp/entities');

// /**
//  * clean tasks (js, css, html, all)
//  */
// require('./gulp/clean');

// /**
//  *  compile src folder from typscript to javascript
//  */
// require('./gulp/ts2js');

// /**
//  * bundle vendor files
//  */
// require('./gulp/vendors');

// /**
//  * compile sass to css
//  */
// require('./gulp/sass2css');

// /**
//  * builds index.html file
//  */
// require('./gulp/index-html');

// /**
//  * copies apidoc.html file
//  */
// require('./gulp/apidoc-html');

// /**
//  * copy angular files to dist folder
//  */
// require('./gulp/angular2');

// /**
//  * copy system configuration to dist folder
//  */
// require('./gulp/system-config');

// /**
//  * copy unitable to dist folder
//  */
// require('./gulp/dependencies');

// /**
//  * copy stimulsoft to dist folder
//  */
// require('./gulp/stimulsoft');

// /**
//  * copy onesignal to dist folder
//  */
// // require('./gulp/onesignal');

// /**
//  *  copy assets to dist folder
//  */
// require('./gulp/assets');

// /**
//  *  copy templates to dist folder
//  */
// require('./gulp/templates');

// /**
//  *  watch for different files
//  */
// require('./gulp/watch');

// /**
//  *  copy webconfig
//  */
// require('./gulp/web-config');

// /**
//  *  zip dist folder
//  */
// require('./gulp/zip');

// /**
//  *  create systemjs bundle for rxjs lib
//  */
// require('./gulp/rxbundle');


// /**
//  *  Generate the correct config files
//  */
// require('./gulp/app-config');

// var tasks = {
//     prod: [
//         'app-config-prod',
//         'index.html.prod',
//         'apidoc.html',
//         'angular2',
//         'dependencies',
//         'stimulsoft',
//         // 'onesignal',
//         'templates',
//         'assets',
//         'web.config',
//         'system.config'
//     ],
//     dev: [
//         'app-config-dev',
//         'index.html.dev',
//         'apidoc.html',
//         'angular2',
//         'dependencies',
//         'stimulsoft',
//         // 'onesignal',
//         'templates',
//         'assets',
//         'web.config',
//         'system.config',
//         'ts-source'
//     ],
//     testEnv: [
//         'app-config-test-env',
//         'index.html.dev',
//         'apidoc.html',
//         'angular2',
//         'dependencies',
//         'stimulsoft',
//         // 'onesignal',
//         'templates',
//         'assets',
//         'web.config',
//         'system.config',
//         'ts-source'
//     ],
//     local: [
//         'app-config-local',
//         'index.html.dev',
//         'apidoc.html',
//         'angular2',
//         'dependencies',
//         'stimulsoft',
//         // 'onesignal',
//         'templates',
//         'assets',
//         'web.config',
//         'system.config',
//         'ts-source'
//     ],
//     customConfig: [
//         'index.html.dev',
//         'apidoc.html',
//         'angular2',
//         'dependencies',
//         'stimulsoft',
//         // 'onesignal',
//         'templates',
//         'assets',
//         'web.config',
//         'system.config',
//         'ts-source'
//     ],
//     pilot: [
//         'app-config-pilot',
//         'index.html.pilot',
//         'apidoc.html',
//         'angular2',
//         'dependencies',
//         'stimulsoft',
//         // 'onesignal',
//         'templates',
//         'assets',
//         'web.config',
//         'system.config',
//         'ts-source'
//     ],

//     sass: ['sass2css']
// };


// gulp.task('build.prod', function(done) {
//     runSequence(tasks.prod, done);
// });

// gulp.task('build.local', function(done) {
//     runSequence(tasks.local, done);
// });

// gulp.task('build.customConfig', function(done) {
//     runSequence(tasks.customConfig, done);
// });

// gulp.task('build.dev', function(done) {
//     runSequence(tasks.dev, done);
// });

// gulp.task('build.pilot', function(done) {
//     runSequence(tasks.pilot, done);
// });

// gulp.task('build.test.env', function(done) {
//     runSequence(tasks.testEnv, done);
// });

// gulp.task('build.dev.watch', function(done) {
//     runSequence('build.dev', 'watch', done);
// });

// gulp.task('build.local.watch', function(done) {
//     runSequence('build.local', 'watch', done);
// });

// gulp.task('build.customConfig.watch', function(done) {
//     runSequence('build.customConfig', 'watch', done);
// });
