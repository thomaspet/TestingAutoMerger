var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});
var converter = require('sass-convert');

gulp.task('sass2css', function() {
    return gulp.src(['./src/styles/**/*.sass'])
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({
            browsers: ['ie 10', 'last 2 versions']
        }))
        .pipe(plugins.cssmin())
        .pipe(plugins.concat('foobar.css'))
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('./dist'));
});
