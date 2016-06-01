var gulp = require('gulp');

var plugins = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('index.html.dev', ['ts2js.dev', 'sass2css', 'vendors'], function() {
    var manifest = gulp.src("./dist/rev-manifest.json");
    return gulp.src('./src/index.html')
        .pipe(plugins.template({version: (new Date()).getTime()}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('index.html', ['ts2js', 'sass2css', 'vendors'], function() {
    var manifest = gulp.src("./dist/rev-manifest.json");
    return gulp.src('./src/index.html')
        .pipe(plugins.template({version: (new Date()).getTime()}))
        .pipe(gulp.dest('./dist'));
});