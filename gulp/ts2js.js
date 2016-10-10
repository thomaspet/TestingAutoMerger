var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: true
});

var SRC = process.env.SRC_FOLDER || './src';
var DIST = process.env.DIST_FOLDER || './dist';
var tsProject = plugins.typescript.createProject('tsconfig.json');

gulp.task('ts2js.dev', function() {
    return gulp.src('src/**/*.ts')
        .pipe(plugins.inlineNg2Template({ base: '/src' }))
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(tsProject())
        .pipe(plugins.concat('app.bundle.js'))
        .pipe(plugins.sourcemaps.write('./'))
        // .pipe(plugins.uglify())
        .pipe(gulp.dest(DIST));
});

gulp.task('ts2js', function() {
    return gulp.src('src/**/*.ts')
        .pipe(plugins.inlineNg2Template({ base: '/src' }))
        .pipe(plugins.plumber())
        .pipe(tsProject())
        .pipe(plugins.concat('app.bundle.js'))
        // .pipe(plugins.uglify())
        .pipe(gulp.dest(DIST));
});

// gulp.task('ts2js.dev', plugins.shell.task(['tsc'],{ignoreErrors:true}));

gulp.task('ts-source', function() {
    return gulp.src(SRC + '/**/*.ts')
        .pipe(plugins.inlineNg2Template({ base: '/src' }))
        .pipe(gulp.dest(DIST));
});
