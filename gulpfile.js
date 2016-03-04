var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({lazy: true});
var rimraf = require('rimraf');
var runSequence = require('run-sequence');
var connect = require('gulp-connect');
var request = require('request');
var fs = require('fs');
var VERSION = new Date().getTime();
var config = {
    typescript: {
        target: "ES5" ,
        module: "system" ,
        moduleResolution: "node" ,
        sourceMap: true ,
        emitDecoratorMetadata: true ,
        experimentalDecorators: true ,
        removeComments: false ,
        noImplicitAny: false ,
        sortOutput: true
    } ,
    src: {
        assets: './src/assets/**/*' ,
        app: {
            ts: './src/**/*.ts' ,
            html: './src/**/*.html' ,
            css: './src/**/*.css' ,
            sass: './src/styles/main.sass'
        } ,
        index: './src/index.template.html' ,
        vendor: {
            js: [
                require.resolve('jquery/dist/jquery.min.js') ,
                require.resolve('bootstrap/dist/js/bootstrap.min.js') ,
                require.resolve('jwt-decode/build/jwt-decode.min.js') ,
                require.resolve('lodash/lodash.min.js') ,
                require.resolve('./kendo/js/kendo.all.min.js') ,


                ///ANGULAR 2.0
                require.resolve('systemjs/dist/system-polyfills.js') ,
                require.resolve('reflect-metadata/Reflect.js') ,
                require.resolve('es6-shim/es6-shim.min.js') ,

                require.resolve('systemjs/dist/system.src.js') ,
                require.resolve('angular2/bundles/angular2-polyfills.js') ,

                require.resolve('./system.config.js') ,

                require.resolve('rxjs/bundles/Rx.min.js') ,
                require.resolve('angular2/bundles/angular2.dev.js') ,
                require.resolve('angular2/bundles/router.min.js') ,
                require.resolve('angular2/bundles/http.min.js') ,
            ] ,
            rxjs: './node_modules/rxjs/**/*.js' ,
            css: [
                require.resolve('./kendo/styles/kendo.common.min.css')
            ]
        }
    } ,
    dist: {
        index: './dist/index.html' ,
        folder: './dist' ,
        assets: './dist/assets' ,
        maps: '.' ,
        appFiles: ['./dist/**/*.js' , './dist//**/*.css' , './dist/**/*.html'] ,
        vendor: {
            js: 'vendor.js' ,
            css: 'vendor.css'
        }
    }
};

/********************/
/*  CLEANING TASKS  */
/********************/
gulp.task('clean' , function (done) {
    rimraf(config.dist.folder , done);
});

/********************/
/*  BUILDING TASKS  */
/********************/
gulp.task('interfaces' , function (done) {
    var options = {
        url: 'http://devapi.unieconomy.no/api/metadata/typescriptinterfaces' ,
        headers: {
            'client': 'Client1'
        }
    };
    var callback = function (error , response , body) {
        fs.writeFileSync('./src/framework/interfaces/interfaces.ts' , body);
        done();
    };
    request(options , callback);
});

gulp.task('rxjs' , ['interfaces'] , function () {
    return gulp.src('./node_modules/rxjs/**/*.js')
        .pipe(gulp.dest('./dist/lib/rxjs'));
});

gulp.task('build.dist.vendor.js' , ['rxjs'] , function () {
    return gulp.src(config.src.vendor.js)
        .pipe(plugins.plumber())
        .pipe(plugins.concat(config.dist.vendor.js))
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.vendor.css' , ['build.dist.main.css.map'] , function () {
    return gulp.src(config.src.vendor.css)
        .pipe(plugins.plumber())
        .pipe(plugins.concat(config.dist.vendor.css))
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.compile.sass' , function () {
    return plugins.rubySass(config.src.app.sass)
        .on('error' , plugins.rubySass.logError)
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.main.css.map' , ['build.dist.compile.sass'] , function () {
    return gulp.src('./src/styles/main.css.map')
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist.app.typescript' , function () {
    return gulp.src(config.src.app.ts)
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init({loadMaps: true}))
        .pipe(plugins.typescript(config.typescript))
        //.pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write(config.dist.maps))
        .pipe(gulp.dest(config.dist.folder))
});

gulp.task('build.dist.app.html' , function () {
    return gulp.src(config.src.app.html)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(config.dist.folder))
});

gulp.task('build.dist.app.css' , function () {
    return gulp.src(config.src.app.css)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(config.dist.folder))
});

gulp.task('build.dist.assets' , function () {
    return gulp.src(config.src.assets)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(config.dist.assets))
});

gulp.task('build.dist.app' , function (done) {
    runSequence('build.dist.app.typescript' , 'build.dist.app.html' , 'build.dist.app.css' , done);
});

gulp.task('build.dist.copy.from.src.index.template' , function () {
    return gulp.src(config.src.index)
        .pipe(plugins.rename('index.html'))
        .pipe(gulp.dest(config.dist.folder));
});
gulp.task('build.dist.fill.index.template' , function () {
    return gulp.src(config.dist.index)
        .pipe(plugins.template({
            VERSION: VERSION
        }))
        .pipe(gulp.dest(config.dist.folder));
});

gulp.task('build.dist' , function (done) {
    runSequence(
        'build.dist.vendor.js' ,
        'build.dist.vendor.css' ,
        'build.dist.app' ,
        'build.dist.copy.from.src.index.template' ,
        'build.dist.fill.index.template' ,
        'build.dist.assets' ,
        done);
});

gulp.task('watch' , function () {
    gulp.watch(config.src.app.ts , ['build.dist.app.typescript'])
    gulp.watch(config.src.app.html , ['build.dist.app.html'])
    gulp.watch('./src/**/*.sass' , ['build.dist.compile.sass'])
    return gulp.watch(config.src.app.css , ['build.dist.app.css']);

});

gulp.task('serve' , function () {
    return connect.server({
        livereload: true ,
        root: 'dist' ,
        port: 3000
    });
});

gulp.task('livereload' , function () {
    return gulp.src(config.dist.appFiles)
        .pipe(plugins.watch(config.dist.appFiles))
        .pipe(connect.reload())
});

gulp.task('build.watch.and.serve' , function (done) {
    runSequence('clean' , 'build.dist' , 'serve' , 'watch' , 'livereload' , done);
});

gulp.task('test' , function () {
    return gulp.src('tests.html')
        .pipe(
            plugins.inject(gulp.src(['./src/**/*.spec.ts'] , {read: false}) , {
                starttag: '<!-- inject:spec -->' ,
                endtag: '<!-- endinject -->' ,
                transform: function (filepath , file) {
                    return "System.import('" + filepath + "'),\r\n";
                }
            }))
        .pipe(gulp.dest('./'))
});

gulp.task('serve.tests', ['test'], function(){
    return connect.server({
        livereload: true ,
        root: './' ,
        port: 9999
    });
});