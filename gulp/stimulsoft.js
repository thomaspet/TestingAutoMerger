var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('stimulsoft', function() {
    return gulp.src('./stimulsoft/Js/stimulsoft.reports.js')
        .pipe(gulp.dest('./dist/'));
});
