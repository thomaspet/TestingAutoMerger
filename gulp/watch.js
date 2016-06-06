/**
 * Created by jorge on 30.05.2016.
 */
var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('watch.ts', function(done){
    return runSequence('ts2js.dev', 'ts-source', done);
});

gulp.task('watch.sass', function(done){
    return runSequence('sass2css', done);
});

gulp.task('watch.html', function(done){
    return runSequence('templates', done);
});

gulp.task('watch', function() {
    gulp.watch('./src/**/*.ts', ['watch.ts']);
    gulp.watch('./src/styles/*.sass', ['watch.sass']);
    gulp.watch('./src/**/*.html', ['watch.html']);
});
