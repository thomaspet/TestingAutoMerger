var gulp = require('gulp');
var del = require('del');

gulp.task('clean.js', function() {
    const files = [
        './dist/app*.bundle.js',
        './dist/app*.bundle.js.map'
    ];
    return del(files);
});

gulp.task('clean.source', function() {
    const files = [
        './dist/src/**/*'
    ];
    return del(files);
});

gulp.task('clean.css', function() {
    const files = [
        './dist/main*.css',
        './dist/main*.css.map'
    ];
    return del(files);
});

gulp.task('clean.html', function() {
    const files = ['./dist/app/**/*.html','./dist/framework/**/*.html'];
    return del(files);
});

gulp.task('clean.assets', function() {
    var files = ['./dist/assets/**/*'];
    return del(files);
});

gulp.task('clean.all', function() {
    return del(['./dist/**/*']);
});