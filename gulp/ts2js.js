var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

var SRC = process.env.SRC_FOLDER || './src';
var DIST = process.env.DIST_FOLDER || './dist';
var tsproject = plugins.typescript.createProject('tsconfig.json');

gulp.task('ts2js', function() {
    return gulp.src([SRC + '/**/*.ts'])
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.typescript(tsproject))
        .pipe(plugins.concat('app.bundle.js'))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(DIST));
});