var gulp = require('gulp');

gulp.task('apidoc.html', function() {
    return gulp.src('./src/apidoc.html')
    .pipe(gulp.dest('./dist'));
});