var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('angular2', function() {
    return gulp.src([
            './node_modules/@angular/**/*.umd.js',
            './node_modules/@ngrx/**/*.min.umd.js'
        ], {
            base: './node_modules'
        })
        .pipe(gulp.dest('./dist/'));
});