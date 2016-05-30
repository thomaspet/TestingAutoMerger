var gulp = require('gulp');

gulp.task('templates', function() {
    gulp.src(['./src/**/*.html', '!./src/index.html'], {base: './src'})
        .pipe(gulp.dest('./dist/'))
});