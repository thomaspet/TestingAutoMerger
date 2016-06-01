var gulp = require('gulp');

gulp.task('web.config', function() {
    return gulp.src('./web.config')
        .pipe(gulp.dest('./dist'));
});
