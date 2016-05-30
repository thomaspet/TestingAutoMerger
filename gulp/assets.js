var gulp = require('gulp');

gulp.task('assets', function() {
    gulp.src(['./src/assets/**/*'], {base: './src'})
        .pipe(gulp.dest('./dist/'))
});