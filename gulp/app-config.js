var gulp = require('gulp');
var rename = require('gulp-rename');

var DIST = './src/app/';

gulp.task('app-config-prod', function() {
    return gulp.src('./src/app/AppConfig-prod.ts')
        .pipe(rename('AppConfig.ts'))
        .pipe(gulp.dest(DIST, {overwrite: true}));
});

gulp.task('app-config-dev', function() {
    return gulp.src('./src/app/AppConfig-dev.ts')
        .pipe(rename('AppConfig.ts'))
        .pipe(gulp.dest(DIST, {overwrite: true}));
});

gulp.task('app-config-local', function() {
    return gulp.src('./src/app/AppConfig-local.ts')
        .pipe(rename('AppConfig.ts'))
        .pipe(gulp.dest(DIST, {overwrite: true}));
});

gulp.task('app-config-pilot', function() {
    return gulp.src('./src/app/AppConfig-pilot.ts')
        .pipe(rename('AppConfig.ts'))
        .pipe(gulp.dest(DIST, {overwrite: true}));
});

gulp.task('app-config-test-env', function() {
    return gulp.src('./src/app/AppConfig-test-env.ts')
        .pipe(rename('AppConfig.ts'))
        .pipe(gulp.dest(DIST, {overwrite: true}));
});
