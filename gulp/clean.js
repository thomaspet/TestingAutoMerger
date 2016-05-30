var gulp = require('gulp');
var del = require('del');

gulp.task('clean.js', function() {
    var jsfiles = [
        './dist/app*.bundle.js',
        './dist/app*.bundle.js.map'
    ];
    return del(jsfiles);
});

gulp.task('clean.css', function() {
    var cssfiles = [
        './dist/main*.css',
        './dist/main*.css.map'
    ];
    return del(cssfiles);
});

gulp.task('clean.html', function() {
    var htmlfiles = ['./dist/**/*.html'];
    return del(htmlfiles);
});

gulp.task('clean.assets', function() {
    var assets = ['./dist/assets/**/*'];
    return del(htmlfiles);
});

gulp.task('clean.all', function() {
    return del(['./dist/**/*']);
});