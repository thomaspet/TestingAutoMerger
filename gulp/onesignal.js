var gulp = require('gulp');

gulp.task('onesignal', function() {
    gulp.src(['./onesignal/**/*'])
        .pipe(gulp.dest('./dist/'))
});