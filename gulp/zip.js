var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('zip', function() {
    return gulp.src('dist/**/*')
        .pipe(plugins.zip('dist.zip'))
        .pipe(gulp.dest('./'));
});
