var gulp = require('gulp');

gulp.task('assets', function() {
    gulp.src(['./onesignal/**/*'])
        .pipe(gulp.dest('./dist/'))
});