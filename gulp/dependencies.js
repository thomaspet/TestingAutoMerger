var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});
var map = require('map-stream');

function removeMomentMinificationPath(file, cb) {
    file.path = file.path.replace(/min[\\/]moment\.min\.js/, 'moment.js');
    cb(null, file);
}

gulp.task('dependencies', function() {
    return gulp.src([
            // Unitable
            './node_modules/unitable-ng2/**/*.js',
            './node_modules/unitable-ng2/**/*.js.map',
            './node_modules/unitable-ng2/**/*.css',
            './node_modules/unitable-ng2/**/*.html',

            // Unitable
            './node_modules/uniform-ng2/**/*.js',
            './node_modules/uniform-ng2/**/*.js.map',
            './node_modules/uniform-ng2/**/*.css',
            './node_modules/uniform-ng2/**/*.html',

            './node_modules/unisearch-ng2/**/*.js',
            './node_modules/unisearch-ng2/**/*.js.map',
            './node_modules/unisearch-ng2/**/*.css',
            './node_modules/unisearch-ng2/**/*.html',

            // Moment
            './node_modules/moment/min/moment.min.js',
            './node_modules/moment/locale/nb.js',

            // File saver
            './node_modules/file-saver/filesaver.min.js',

            // Base64
            './node_modules/base64-js/base64js.min.js'
        ], {
            base: './node_modules'
        })
        .pipe(map(removeMomentMinificationPath))
        .pipe(gulp.dest('./dist/'));
});
