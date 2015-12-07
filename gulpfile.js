var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({lazy:true});
var rimraf = require('rimraf');
var runSequence = require('run-sequence');
var connect = require('gulp-connect');
var VERSION = new Date().getTime();
var config = {
    typescript: {
        target: "ES5",
        module: "system",
        moduleResolution: "node",
        sourceMap: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        removeComments: false,
        noImplicitAny: false,
        sortOutput: true
    },
    src: {
        assets: './src/assets/**/*',
        app: {
            ts: './src/!(test)/**/*.ts',
            html: './src/!(test)/**/*.html',
            css: './src/!(test)/**/*.css',
            sass: './src/styles/main.sass'
        },
        index: './src/index.template.html',
        vendor: {
            js: [
                require.resolve('systemjs/dist/system-polyfills.js'),
                require.resolve('reflect-metadata/Reflect.js'),
                require.resolve('es6-shim/es6-shim.js'),

                require.resolve('jquery/dist/jquery.min.js'),
                require.resolve('bootstrap/dist/js/bootstrap.min.js'),
                require.resolve('./kendo/js/kendo.all.min.js'),

                require.resolve('systemjs/dist/system.src.js'),

                require.resolve('angular2/bundles/angular2.dev.js'),
                require.resolve('angular2/bundles/router.dev.js'),
                require.resolve('angular2/bundles/http.dev.js'),

                require.resolve('jwt-decode/build/jwt-decode.min.js'),
            ],
            css: [
                require.resolve('./kendo/styles/kendo.common.min.css')
            ]
        }
    },
    dist: {
        index: './dist/index.html',
        folder: './dist',
        assets: './dist/assets',
        maps: '.',
        appFiles: ['./dist/!(test)/**/*.js','./dist/!(test)/**/*.css','./dist/!(test)/**/*.html'],
        vendor: {
            js: 'vendor.js',
            css: 'vendor.css'
        }
    },
    test: {
        files: {
            ts:'./src/test/**/*.ts'
        },
        dest: './dist/test/'
    }
};

/********************/
/*  CLEANING TASKS  */
/********************/
gulp.task('clean', function(done){
    rimraf(config.dist.folder,done);
});

/********************/
/*  BUILDING TASKS  */
/********************/
gulp.task('build.dist.vendor.js', function(){
    return gulp.src(config.src.vendor.js)
       .pipe(plugins.plumber())
       .pipe(plugins.concat(config.dist.vendor.js))
       .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.vendor.css', ['build.dist.main.css.map'],function() {
    return gulp.src(config.src.vendor.css)
        .pipe(plugins.plumber())
        .pipe(plugins.concat(config.dist.vendor.css))
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.compile.sass',function(){
    return plugins.rubySass(config.src.app.sass)
        .on('error',plugins.rubySass.logError)
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.main.css.map', ['build.dist.compile.sass'], function(){
    return gulp.src('./src/styles/main.css.map')
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.app.typescript', function() {
    return gulp.src(config.src.app.ts)
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init({loadMaps:true}))
        .pipe(plugins.typescript(config.typescript))
        //.pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write(config.dist.maps))
        .pipe(gulp.dest(config.dist.folder))
});

gulp.task('build.dist.app.html', function() {
    return gulp.src(config.src.app.html)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(config.dist.folder))
});

gulp.task('build.dist.app.css', function() {
    return gulp.src(config.src.app.css)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(config.dist.folder))
});

gulp.task('build.dist.assets', function(){
   return gulp.src(config.src.assets)
       .pipe(plugins.plumber())
       .pipe(gulp.dest(config.dist.assets))
});

gulp.task('build.dist.app',function(done){
   runSequence('build.dist.app.typescript','build.dist.app.html','build.dist.app.css',done);
});

gulp.task('build.dist.copy.from.src.index.template', function() {
    return gulp.src(config.src.index)
        .pipe(plugins.rename('index.html'))
        .pipe(gulp.dest(config.dist.folder));
});
gulp.task('build.dist.fill.index.template',function(){
    return gulp.src(config.dist.index)
        .pipe(plugins.template({
            VERSION: VERSION
        }))
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist',function (done){
    runSequence(
        'build.dist.vendor.js',
        'build.dist.vendor.css',
        'build.dist.app',
        'build.dist.copy.from.src.index.template',
        'build.dist.fill.index.template',
        'build.dist.assets',
        done);
});

gulp.task('watch',function(){
    gulp.watch(config.src.app.ts,['build.dist.app.typescript'])
    gulp.watch(config.src.app.html,['build.dist.app.html'])
    return gulp.watch(config.src.app.css,['build.dist.app.css']);

});

gulp.task('serve',function(){
    return connect.server({
        livereload:true,
        root:'dist',
        port: 3000
    });
});

gulp.task('livereload',function(){
    return gulp.src(config.dist.appFiles)
        .pipe(plugins.watch(config.dist.appFiles))
        .pipe(connect.reload())
});

gulp.task('build.watch.and.serve',function(done){
    runSequence('clean','build.dist','serve', 'watch', 'livereload', done);
});

/******************/
/*    TESTING     */
/******************/
gulp.task('test.typescript',function(){
    return gulp.src(config.test.files.ts)
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.typescript(config.typescript))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(config.test.dest))
});