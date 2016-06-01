var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('unitable', function() {
    return gulp.src([
            './node_modules/unitable-ng2/**/*.js',
            './node_modules/unitable-ng2/**/*.js.map',
            './node_modules/unitable-ng2/**/*.css',
            './node_modules/unitable-ng2/**/*.html',
        ], {
            base: './node_modules'
        })
        .pipe(gulp.dest('./dist/'));
});