var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('dependencies', function() {
    return gulp.src([
            // Unitable
            './node_modules/unitable-ng2/**/*.js',
            './node_modules/unitable-ng2/**/*.js.map',
            './node_modules/unitable-ng2/**/*.css',
            './node_modules/unitable-ng2/**/*.html',

            // Moment
            './node_modules/moment/min/moment.min.js',
            './node_modules/moment/locale/nb.js'
        ], {
            base: './node_modules'
        })
        .pipe(gulp.dest('./dist/'));
});