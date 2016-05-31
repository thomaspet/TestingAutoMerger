var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('unitable', function() {
    return gulp.src([
            './node_modules/unitable-ng2/**/*'
        ], {
            base: './node_modules'
        })
        .pipe(gulp.dest('./dist/'));
});