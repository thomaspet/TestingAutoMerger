var gulp = require('gulp');

gulp.task('system.config', function() {
    return gulp.src('./system.config.js')
        .pipe(gulp.dest('./dist'));
});